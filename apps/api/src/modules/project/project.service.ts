import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import type {
  CreateProjectInput,
  UpdateProjectInput,
  AddMakerInput,
  CreateProjectCommentInput,
  ToggleProjectVoteInput,
} from "@devcom/shared";

const AUTHOR_SELECT = {
  id: true,
  username: true,
  name: true,
  avatarUrl: true,
} as const;

@Injectable()
export class ProjectService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new project with inline makers in a single transaction.
   * The author is auto-added as a maker with role "Creator".
   */
  async create(userId: string, dto: CreateProjectInput) {
    const existing = await this.prisma.project.findUnique({
      where: { slug: dto.slug },
    });

    if (existing) {
      throw new ConflictException("A project with this slug already exists");
    }

    return this.prisma.$transaction(async (tx) => {
      const project = await tx.project.create({
        data: {
          title: dto.title,
          slug: dto.slug,
          tagline: dto.tagline,
          description: dto.description,
          logo: dto.logo,
          links: dto.links,
          isOpenSource: dto.isOpenSource,
          images: dto.images,
          techStack: dto.techStack,
          tags: dto.tags,
          status: dto.status,
          phase: dto.phase,
          productionType: dto.productionType,
          authorId: userId,
        },
      });

      // Auto-add author as maker with role "Creator"
      const makerEntries = [
        { projectId: project.id, userId, role: "Creator" },
        ...(dto.makers ?? [])
          .filter((m) => m.userId !== userId)
          .map((m) => ({
            projectId: project.id,
            userId: m.userId,
            role: m.role,
          })),
      ];

      await tx.projectMaker.createMany({ data: makerEntries });

      return tx.project.findUnique({
        where: { id: project.id },
        include: {
          author: { select: AUTHOR_SELECT },
          makers: {
            include: { user: { select: AUTHOR_SELECT } },
          },
        },
      });
    });
  }

  /**
   * Find all projects with pagination, optional search, status, and tags filters.
   */
  async findAll(
    page: number,
    limit: number,
    search?: string,
    status?: string,
    tags?: string,
    authorId?: string,
    phase?: string,
    productionType?: string,
    sort?: string,
    currentUserId?: string,
  ) {
    const where: Record<string, unknown> = {
      deletedAt: null,
    };

    if (authorId) {
      where.authorId = authorId;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const isOwner = authorId && currentUserId && authorId === currentUserId;

    if (status) {
      where.status = status;
    } else if (isOwner) {
      // Owner viewing their own projects: show all statuses
    } else {
      // Public browsing: exclude Draft and Archived
      where.status = { notIn: ["Draft", "Archived"] };
    }

    if (tags) {
      const tagList = tags.split(",").map((t) => t.trim());
      where.tags = { hasSome: tagList };
    }

    if (phase) {
      where.phase = phase;
    }

    if (productionType) {
      where.productionType = productionType;
    }

    // Sorting logic
    let orderBy: Record<string, string> | Record<string, string>[];
    switch (sort) {
      case "likes":
        orderBy = { upvotesCount: "desc" };
        break;
      case "trending":
        orderBy = [
          { upvotesCount: "desc" },
          { commentsCount: "desc" },
          { createdAt: "desc" },
        ];
        break;
      default:
        orderBy = { createdAt: "desc" };
    }

    const [items, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        include: {
          author: { select: AUTHOR_SELECT },
          makers: {
            include: { user: { select: AUTHOR_SELECT } },
          },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.project.count({ where }),
    ]);

    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find a single project by its slug, including makers and threaded comments.
   * When userId is provided, also checks whether the user has upvoted.
   */
  async findBySlug(slug: string, userId?: string) {
    const project = await this.prisma.project.findUnique({
      where: { slug },
      include: {
        author: { select: AUTHOR_SELECT },
        makers: {
          include: { user: { select: AUTHOR_SELECT } },
        },
      },
    });

    if (!project || project.deletedAt) {
      throw new NotFoundException("Project not found");
    }

    const comments = await this.buildCommentTree(project.id);

    let hasVoted = false;
    if (userId) {
      const vote = await this.prisma.projectVote.findUnique({
        where: { projectId_userId: { projectId: project.id, userId } },
      });
      hasVoted = vote !== null && vote.value === 1;
    }

    return { ...project, comments, hasVoted };
  }

  /**
   * Update a project. Only the author can update.
   */
  async update(slug: string, userId: string, dto: UpdateProjectInput) {
    const project = await this.prisma.project.findUnique({
      where: { slug },
    });

    if (!project || project.deletedAt) {
      throw new NotFoundException("Project not found");
    }

    if (project.authorId !== userId) {
      throw new ForbiddenException("You are not the owner of this project");
    }

    if (dto.slug && dto.slug !== project.slug) {
      const existingSlug = await this.prisma.project.findUnique({
        where: { slug: dto.slug },
      });

      if (existingSlug) {
        throw new ConflictException("A project with this slug already exists");
      }
    }

    return this.prisma.project.update({
      where: { id: project.id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.slug !== undefined && { slug: dto.slug }),
        ...(dto.tagline !== undefined && { tagline: dto.tagline }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.logo !== undefined && { logo: dto.logo }),
        ...(dto.links !== undefined && { links: dto.links }),
        ...(dto.isOpenSource !== undefined && {
          isOpenSource: dto.isOpenSource,
        }),
        ...(dto.images !== undefined && { images: dto.images }),
        ...(dto.techStack !== undefined && { techStack: dto.techStack }),
        ...(dto.tags !== undefined && { tags: dto.tags }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.phase !== undefined && { phase: dto.phase }),
        ...(dto.productionType !== undefined && {
          productionType: dto.productionType,
        }),
      },
      include: {
        author: { select: AUTHOR_SELECT },
        makers: {
          include: { user: { select: AUTHOR_SELECT } },
        },
      },
    });
  }

  /**
   * Soft-delete a project. Only the author can delete.
   */
  async softDelete(id: string, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
    });

    if (!project || project.deletedAt) {
      throw new NotFoundException("Project not found");
    }

    if (project.authorId !== userId) {
      throw new ForbiddenException("You are not the owner of this project");
    }

    return this.prisma.project.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  /**
   * Add a maker to a project. Only the author can add makers.
   */
  async addMaker(projectId: string, userId: string, dto: AddMakerInput) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project || project.deletedAt) {
      throw new NotFoundException("Project not found");
    }

    if (project.authorId !== userId) {
      throw new ForbiddenException("You are not the owner of this project");
    }

    const existing = await this.prisma.projectMaker.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: dto.userId,
        },
      },
    });

    if (existing) {
      throw new ConflictException("User is already a maker on this project");
    }

    return this.prisma.projectMaker.create({
      data: {
        projectId,
        userId: dto.userId,
        role: dto.role,
      },
      include: {
        user: { select: AUTHOR_SELECT },
      },
    });
  }

  /**
   * Remove a maker from a project. Only the author can remove makers.
   */
  async removeMaker(projectId: string, userId: string, makerUserId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project || project.deletedAt) {
      throw new NotFoundException("Project not found");
    }

    if (project.authorId !== userId) {
      throw new ForbiddenException("You are not the owner of this project");
    }

    const maker = await this.prisma.projectMaker.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: makerUserId,
        },
      },
    });

    if (!maker) {
      throw new NotFoundException("Maker not found on this project");
    }

    await this.prisma.projectMaker.delete({
      where: { id: maker.id },
    });
  }

  /**
   * Toggle a vote on a project.
   * - If no existing vote → create + increment counter
   * - If existing vote with same value → delete + decrement counter
   * - If existing vote with different value → update + adjust both counters
   */
  async toggleVote(
    projectId: string,
    userId: string,
    dto: ToggleProjectVoteInput,
  ) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project || project.deletedAt) {
      throw new NotFoundException("Project not found");
    }

    const existing = await this.prisma.projectVote.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
    });

    if (existing) {
      if (existing.value === dto.value) {
        // Same vote — remove it
        await this.prisma.projectVote.delete({
          where: { id: existing.id },
        });

        const counterField =
          dto.value === 1 ? "upvotesCount" : "downvotesCount";
        await this.prisma.project.update({
          where: { id: projectId },
          data: { [counterField]: { decrement: 1 } },
        });

        return { action: "removed", value: dto.value };
      } else {
        // Different vote — switch
        await this.prisma.projectVote.update({
          where: { id: existing.id },
          data: { value: dto.value },
        });

        const incrementField =
          dto.value === 1 ? "upvotesCount" : "downvotesCount";
        const decrementField =
          dto.value === 1 ? "downvotesCount" : "upvotesCount";
        await this.prisma.project.update({
          where: { id: projectId },
          data: {
            [incrementField]: { increment: 1 },
            [decrementField]: { decrement: 1 },
          },
        });

        return { action: "switched", value: dto.value };
      }
    } else {
      // No existing vote — create it
      await this.prisma.projectVote.create({
        data: {
          projectId,
          userId,
          value: dto.value,
        },
      });

      const counterField =
        dto.value === 1 ? "upvotesCount" : "downvotesCount";
      await this.prisma.project.update({
        where: { id: projectId },
        data: { [counterField]: { increment: 1 } },
      });

      return { action: "added", value: dto.value };
    }
  }

  /**
   * Create a comment on a project.
   * Supports nested replies via optional parentId.
   */
  async createComment(
    projectId: string,
    userId: string,
    dto: CreateProjectCommentInput,
  ) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project || project.deletedAt) {
      throw new NotFoundException("Project not found");
    }

    if (dto.parentId) {
      const parentComment = await this.prisma.projectComment.findUnique({
        where: { id: dto.parentId },
      });

      if (!parentComment || parentComment.projectId !== projectId) {
        throw new NotFoundException(
          "Parent comment not found or does not belong to this project",
        );
      }
    }

    const comment = await this.prisma.projectComment.create({
      data: {
        projectId,
        authorId: userId,
        content: dto.content,
        parentId: dto.parentId,
      },
      include: {
        author: { select: AUTHOR_SELECT },
      },
    });

    await this.prisma.project.update({
      where: { id: projectId },
      data: { commentsCount: { increment: 1 } },
    });

    return comment;
  }

  /**
   * Get comments for a project with offset pagination.
   * Top-level comments with fully nested reply trees.
   */
  async getComments(projectId: string, page: number, limit: number) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project || project.deletedAt) {
      throw new NotFoundException("Project not found");
    }

    const total = await this.prisma.projectComment.count({
      where: { projectId, deletedAt: null, parentId: null },
    });

    const roots = await this.buildCommentTree(projectId);
    roots.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    const items = roots.slice((page - 1) * limit, page * limit);

    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Fetch all comments for a project and build a nested tree.
   */
  private async buildCommentTree(projectId: string) {
    const allComments = await this.prisma.projectComment.findMany({
      where: { projectId, deletedAt: null },
      include: {
        author: { select: AUTHOR_SELECT },
      },
      orderBy: { createdAt: "asc" },
    });

    type CommentNode = (typeof allComments)[number] & {
      replies: CommentNode[];
    };

    const map = new Map<string, CommentNode>();
    const roots: CommentNode[] = [];

    for (const c of allComments) {
      map.set(c.id, { ...c, replies: [] });
    }

    for (const c of allComments) {
      const node = map.get(c.id)!;
      if (c.parentId && map.has(c.parentId)) {
        map.get(c.parentId)!.replies.push(node);
      } else if (!c.parentId) {
        roots.push(node);
      }
    }

    return roots;
  }
}
