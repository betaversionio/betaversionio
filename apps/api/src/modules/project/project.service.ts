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
  ) {
    const where: Record<string, unknown> = {
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (tags) {
      const tagList = tags.split(",").map((t) => t.trim());
      where.tags = { hasSome: tagList };
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
        orderBy: { createdAt: "desc" },
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
   */
  async findBySlug(slug: string) {
    const project = await this.prisma.project.findUnique({
      where: { slug },
      include: {
        author: { select: AUTHOR_SELECT },
        makers: {
          include: { user: { select: AUTHOR_SELECT } },
        },
        comments: {
          where: { deletedAt: null, parentId: null },
          include: {
            author: { select: AUTHOR_SELECT },
            replies: {
              where: { deletedAt: null },
              include: {
                author: { select: AUTHOR_SELECT },
              },
              orderBy: { createdAt: "asc" },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!project || project.deletedAt) {
      throw new NotFoundException("Project not found");
    }

    return project;
  }

  /**
   * Update a project. Only the author can update.
   */
  async update(id: string, userId: string, dto: UpdateProjectInput) {
    const project = await this.prisma.project.findUnique({
      where: { id },
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
      where: { id },
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
   * Top-level comments with nested replies.
   */
  async getComments(projectId: string, page: number, limit: number) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project || project.deletedAt) {
      throw new NotFoundException("Project not found");
    }

    const where = {
      projectId,
      deletedAt: null,
      parentId: null,
    };

    const [items, total] = await Promise.all([
      this.prisma.projectComment.findMany({
        where,
        include: {
          author: { select: AUTHOR_SELECT },
          replies: {
            where: { deletedAt: null },
            include: {
              author: { select: AUTHOR_SELECT },
            },
            orderBy: { createdAt: "asc" as const },
          },
        },
        orderBy: { createdAt: "desc" as const },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.projectComment.count({ where }),
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
}
