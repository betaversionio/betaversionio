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
  UpdateProjectCommentInput,
  ToggleProjectVoteInput,
  CreateProjectReviewInput,
  UpdateProjectReviewInput,
  CreateProjectUpdateInput,
  UpdateProjectUpdateInput,
  CreateInvitationInput,
  RespondInvitationInput,
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
          demoUrl: dto.demoUrl,
          videoUrl: dto.videoUrl,
          launchDate: dto.launchDate ? new Date(dto.launchDate) : undefined,
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
    let hasBookmarked = false;
    if (userId) {
      const [vote, bookmark] = await Promise.all([
        this.prisma.projectVote.findUnique({
          where: { projectId_userId: { projectId: project.id, userId } },
        }),
        this.prisma.projectBookmark.findUnique({
          where: { projectId_userId: { projectId: project.id, userId } },
        }),
      ]);
      hasVoted = vote !== null && vote.value === 1;
      hasBookmarked = bookmark !== null;
    }

    return { ...project, comments, hasVoted, hasBookmarked };
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
        ...(dto.demoUrl !== undefined && { demoUrl: dto.demoUrl }),
        ...(dto.videoUrl !== undefined && { videoUrl: dto.videoUrl }),
        ...(dto.launchDate !== undefined && {
          launchDate: dto.launchDate ? new Date(dto.launchDate) : null,
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
   * Update own comment on a project. Sets editedAt timestamp.
   */
  async updateComment(
    projectId: string,
    commentId: string,
    userId: string,
    dto: UpdateProjectCommentInput,
  ) {
    const comment = await this.prisma.projectComment.findUnique({
      where: { id: commentId },
    });

    if (!comment || comment.deletedAt || comment.projectId !== projectId) {
      throw new NotFoundException("Comment not found");
    }

    if (comment.authorId !== userId) {
      throw new ForbiddenException("You can only edit your own comments");
    }

    return this.prisma.projectComment.update({
      where: { id: commentId },
      data: {
        content: dto.content,
        editedAt: new Date(),
      },
      include: {
        author: { select: AUTHOR_SELECT },
      },
    });
  }

  /**
   * Soft-delete own comment on a project. Decrements commentsCount.
   */
  async deleteComment(
    projectId: string,
    commentId: string,
    userId: string,
  ) {
    const comment = await this.prisma.projectComment.findUnique({
      where: { id: commentId },
    });

    if (!comment || comment.deletedAt || comment.projectId !== projectId) {
      throw new NotFoundException("Comment not found");
    }

    if (comment.authorId !== userId) {
      throw new ForbiddenException("You can only delete your own comments");
    }

    await this.prisma.projectComment.update({
      where: { id: commentId },
      data: { deletedAt: new Date() },
    });

    await this.prisma.project.update({
      where: { id: projectId },
      data: { commentsCount: { decrement: 1 } },
    });
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

  // ─── Bookmarks ──────────────────────────────────────────────────────────────

  async toggleBookmark(projectId: string, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project || project.deletedAt) {
      throw new NotFoundException("Project not found");
    }

    const existing = await this.prisma.projectBookmark.findUnique({
      where: { projectId_userId: { projectId, userId } },
    });

    if (existing) {
      await this.prisma.projectBookmark.delete({ where: { id: existing.id } });
      await this.prisma.project.update({
        where: { id: projectId },
        data: { bookmarksCount: { decrement: 1 } },
      });
      return { action: "removed" as const };
    }

    await this.prisma.projectBookmark.create({
      data: { projectId, userId },
    });
    await this.prisma.project.update({
      where: { id: projectId },
      data: { bookmarksCount: { increment: 1 } },
    });
    return { action: "added" as const };
  }

  async getBookmarkedProjects(userId: string, page: number, limit: number) {
    const where = { userId };
    const [bookmarks, total] = await Promise.all([
      this.prisma.projectBookmark.findMany({
        where,
        include: {
          project: {
            include: {
              author: { select: AUTHOR_SELECT },
              makers: { include: { user: { select: AUTHOR_SELECT } } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.projectBookmark.count({ where }),
    ]);

    return {
      items: bookmarks.map((b) => b.project),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  // ─── Reviews ────────────────────────────────────────────────────────────────

  async createReview(
    projectId: string,
    userId: string,
    dto: CreateProjectReviewInput,
  ) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project || project.deletedAt) {
      throw new NotFoundException("Project not found");
    }

    const existing = await this.prisma.projectReview.findUnique({
      where: { projectId_authorId: { projectId, authorId: userId } },
    });
    if (existing && !existing.deletedAt) {
      throw new ConflictException("You already reviewed this project");
    }

    const review = await this.prisma.projectReview.create({
      data: { projectId, authorId: userId, ...dto },
      include: { author: { select: AUTHOR_SELECT } },
    });

    await this.recalculateReviewStats(projectId);
    return review;
  }

  async getReviews(projectId: string, page: number, limit: number) {
    const where = { projectId, deletedAt: null };
    const [items, total] = await Promise.all([
      this.prisma.projectReview.findMany({
        where,
        include: { author: { select: AUTHOR_SELECT } },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.projectReview.count({ where }),
    ]);
    return {
      items,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async updateReview(
    projectId: string,
    reviewId: string,
    userId: string,
    dto: UpdateProjectReviewInput,
  ) {
    const review = await this.prisma.projectReview.findUnique({
      where: { id: reviewId },
    });
    if (!review || review.deletedAt || review.projectId !== projectId) {
      throw new NotFoundException("Review not found");
    }
    if (review.authorId !== userId) {
      throw new ForbiddenException("You can only edit your own reviews");
    }

    const updated = await this.prisma.projectReview.update({
      where: { id: reviewId },
      data: dto,
      include: { author: { select: AUTHOR_SELECT } },
    });
    await this.recalculateReviewStats(projectId);
    return updated;
  }

  async deleteReview(projectId: string, reviewId: string, userId: string) {
    const review = await this.prisma.projectReview.findUnique({
      where: { id: reviewId },
    });
    if (!review || review.deletedAt || review.projectId !== projectId) {
      throw new NotFoundException("Review not found");
    }
    if (review.authorId !== userId) {
      throw new ForbiddenException("You can only delete your own reviews");
    }

    await this.prisma.projectReview.update({
      where: { id: reviewId },
      data: { deletedAt: new Date() },
    });
    await this.recalculateReviewStats(projectId);
  }

  private async recalculateReviewStats(projectId: string) {
    const agg = await this.prisma.projectReview.aggregate({
      where: { projectId, deletedAt: null },
      _count: true,
      _avg: { rating: true },
    });
    await this.prisma.project.update({
      where: { id: projectId },
      data: {
        reviewsCount: agg._count,
        averageRating: agg._avg.rating ?? 0,
      },
    });
  }

  // ─── Launch Day ─────────────────────────────────────────────────────────────

  async getLaunchingToday(page: number, limit: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const where = {
      launchDate: { gte: today, lt: tomorrow },
      deletedAt: null,
      status: { notIn: ["Draft" as const, "Archived" as const] },
    };

    const [items, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        include: {
          author: { select: AUTHOR_SELECT },
          makers: { include: { user: { select: AUTHOR_SELECT } } },
        },
        orderBy: { upvotesCount: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.project.count({ where }),
    ]);

    return {
      items,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getLaunchingSoon(page: number, limit: number) {
    const now = new Date();
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const where = {
      launchDate: { gt: now, lte: nextWeek },
      deletedAt: null,
      status: { notIn: ["Draft" as const, "Archived" as const] },
    };

    const [items, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        include: {
          author: { select: AUTHOR_SELECT },
          makers: { include: { user: { select: AUTHOR_SELECT } } },
        },
        orderBy: { launchDate: "asc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.project.count({ where }),
    ]);

    return {
      items,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  // ─── Project Updates / Changelog ────────────────────────────────────────────

  async createProjectUpdate(
    projectId: string,
    userId: string,
    dto: CreateProjectUpdateInput,
  ) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project || project.deletedAt) {
      throw new NotFoundException("Project not found");
    }
    if (project.authorId !== userId) {
      throw new ForbiddenException("Only the project owner can post updates");
    }

    return this.prisma.projectUpdate.create({
      data: { projectId, authorId: userId, ...dto },
      include: { author: { select: AUTHOR_SELECT } },
    });
  }

  async getProjectUpdates(projectId: string, page: number, limit: number) {
    const where = { projectId, deletedAt: null };
    const [items, total] = await Promise.all([
      this.prisma.projectUpdate.findMany({
        where,
        include: { author: { select: AUTHOR_SELECT } },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.projectUpdate.count({ where }),
    ]);
    return {
      items,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async updateProjectUpdate(
    projectId: string,
    updateId: string,
    userId: string,
    dto: UpdateProjectUpdateInput,
  ) {
    const update = await this.prisma.projectUpdate.findUnique({
      where: { id: updateId },
    });
    if (!update || update.deletedAt || update.projectId !== projectId) {
      throw new NotFoundException("Update not found");
    }
    if (update.authorId !== userId) {
      throw new ForbiddenException("Only the author can edit this update");
    }
    return this.prisma.projectUpdate.update({
      where: { id: updateId },
      data: dto,
      include: { author: { select: AUTHOR_SELECT } },
    });
  }

  async deleteProjectUpdate(
    projectId: string,
    updateId: string,
    userId: string,
  ) {
    const update = await this.prisma.projectUpdate.findUnique({
      where: { id: updateId },
    });
    if (!update || update.deletedAt || update.projectId !== projectId) {
      throw new NotFoundException("Update not found");
    }
    if (update.authorId !== userId) {
      throw new ForbiddenException("Only the author can delete this update");
    }
    await this.prisma.projectUpdate.update({
      where: { id: updateId },
      data: { deletedAt: new Date() },
    });
  }

  // ─── Related Projects ───────────────────────────────────────────────────────

  async getRelatedProjects(slug: string, limit: number) {
    const project = await this.prisma.project.findUnique({
      where: { slug },
    });
    if (!project || project.deletedAt) {
      throw new NotFoundException("Project not found");
    }

    const candidates = await this.prisma.project.findMany({
      where: {
        id: { not: project.id },
        deletedAt: null,
        status: { notIn: ["Draft", "Archived"] },
        OR: [
          { tags: { hasSome: project.tags } },
          { techStack: { hasSome: project.techStack } },
        ],
      },
      include: {
        author: { select: AUTHOR_SELECT },
        makers: { include: { user: { select: AUTHOR_SELECT } } },
      },
      take: limit * 3,
    });

    // Rank by overlap
    const ranked = candidates
      .map((c) => {
        const tagOverlap = c.tags.filter((t) =>
          project.tags.includes(t),
        ).length;
        const techOverlap = c.techStack.filter((t) =>
          project.techStack.includes(t),
        ).length;
        return { project: c, score: tagOverlap * 2 + techOverlap };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return ranked.map((r) => r.project);
  }

  // ─── Invitations ────────────────────────────────────────────────────────────

  async createInvitation(
    projectId: string,
    userId: string,
    dto: CreateInvitationInput,
  ) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project || project.deletedAt) {
      throw new NotFoundException("Project not found");
    }
    if (project.authorId !== userId) {
      throw new ForbiddenException("Only the project owner can send invitations");
    }

    const invitee = await this.prisma.user.findUnique({
      where: { username: dto.username },
    });
    if (!invitee) {
      throw new NotFoundException("User not found");
    }

    const existingMaker = await this.prisma.projectMaker.findUnique({
      where: { projectId_userId: { projectId, userId: invitee.id } },
    });
    if (existingMaker) {
      throw new ConflictException("User is already a team member");
    }

    return this.prisma.projectInvitation.create({
      data: {
        projectId,
        inviterId: userId,
        inviteeId: invitee.id,
        role: dto.role,
        message: dto.message,
      },
      include: {
        project: { select: { id: true, title: true, slug: true } },
        inviter: { select: AUTHOR_SELECT },
        invitee: { select: AUTHOR_SELECT },
      },
    });
  }

  async getProjectInvitations(projectId: string, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project || project.deletedAt) {
      throw new NotFoundException("Project not found");
    }
    if (project.authorId !== userId) {
      throw new ForbiddenException("Only the owner can view invitations");
    }

    return this.prisma.projectInvitation.findMany({
      where: { projectId },
      include: {
        invitee: { select: AUTHOR_SELECT },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async cancelInvitation(
    projectId: string,
    invitationId: string,
    userId: string,
  ) {
    const invitation = await this.prisma.projectInvitation.findUnique({
      where: { id: invitationId },
    });
    if (!invitation || invitation.projectId !== projectId) {
      throw new NotFoundException("Invitation not found");
    }
    if (invitation.inviterId !== userId) {
      throw new ForbiddenException("Only the inviter can cancel");
    }
    await this.prisma.projectInvitation.delete({
      where: { id: invitationId },
    });
  }

  async getReceivedInvitations(userId: string) {
    return this.prisma.projectInvitation.findMany({
      where: { inviteeId: userId, status: "Pending" },
      include: {
        project: { select: { id: true, title: true, slug: true, logo: true } },
        inviter: { select: AUTHOR_SELECT },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async respondToInvitation(
    invitationId: string,
    userId: string,
    dto: RespondInvitationInput,
  ) {
    const invitation = await this.prisma.projectInvitation.findUnique({
      where: { id: invitationId },
    });
    if (!invitation || invitation.inviteeId !== userId) {
      throw new NotFoundException("Invitation not found");
    }
    if (invitation.status !== "Pending") {
      throw new ConflictException("Invitation already responded to");
    }

    const status = dto.action === "accept" ? "Accepted" : "Rejected";

    await this.prisma.projectInvitation.update({
      where: { id: invitationId },
      data: { status, respondedAt: new Date() },
    });

    if (dto.action === "accept") {
      await this.prisma.projectMaker.create({
        data: {
          projectId: invitation.projectId,
          userId,
          role: invitation.role,
        },
      });
    }

    return { status };
  }

  // ─── Project Views / Analytics ──────────────────────────────────────────────

  async recordView(projectId: string, userId?: string, fingerprint?: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project || project.deletedAt) return;

    // Dedup: skip if same user/fingerprint viewed in last 24h
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    if (userId) {
      const recent = await this.prisma.projectView.findFirst({
        where: { projectId, userId, createdAt: { gte: since } },
      });
      if (recent) return;
    }

    await this.prisma.projectView.create({
      data: { projectId, userId, fingerprint },
    });
    await this.prisma.project.update({
      where: { id: projectId },
      data: { viewsCount: { increment: 1 } },
    });
  }

  async getAnalytics(projectId: string, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project || project.deletedAt) {
      throw new NotFoundException("Project not found");
    }
    if (project.authorId !== userId) {
      throw new ForbiddenException("Only the owner can view analytics");
    }

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [views, votes, comments, reviews] = await Promise.all([
      this.prisma.projectView.findMany({
        where: { projectId, createdAt: { gte: thirtyDaysAgo } },
        select: { createdAt: true },
        orderBy: { createdAt: "asc" },
      }),
      this.prisma.projectVote.findMany({
        where: { projectId, createdAt: { gte: thirtyDaysAgo } },
        select: { createdAt: true },
        orderBy: { createdAt: "asc" },
      }),
      this.prisma.projectComment.findMany({
        where: {
          projectId,
          deletedAt: null,
          createdAt: { gte: thirtyDaysAgo },
        },
        select: { createdAt: true },
        orderBy: { createdAt: "asc" },
      }),
      this.prisma.projectReview.findMany({
        where: {
          projectId,
          deletedAt: null,
          createdAt: { gte: thirtyDaysAgo },
        },
        select: { createdAt: true },
        orderBy: { createdAt: "asc" },
      }),
    ]);

    // Group by date
    function groupByDate(records: { createdAt: Date }[]) {
      const map = new Map<string, number>();
      for (const r of records) {
        const key = r.createdAt.toISOString().slice(0, 10);
        map.set(key, (map.get(key) ?? 0) + 1);
      }
      return Array.from(map, ([date, count]) => ({ date, count }));
    }

    return {
      totals: {
        views: project.viewsCount,
        upvotes: project.upvotesCount,
        comments: project.commentsCount,
        bookmarks: project.bookmarksCount,
        reviews: project.reviewsCount,
        averageRating: project.averageRating,
      },
      timeSeries: {
        views: groupByDate(views),
        votes: groupByDate(votes),
        comments: groupByDate(comments),
        reviews: groupByDate(reviews),
      },
    };
  }
}
