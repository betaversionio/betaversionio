import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type {
  CreateBlogInput,
  UpdateBlogInput,
  ToggleBlogVoteInput,
  CreateBlogCommentInput,
  UpdateBlogCommentInput,
} from '@betaversionio/shared';

const AUTHOR_SELECT = {
  id: true,
  username: true,
  name: true,
  avatarUrl: true,
} as const;

@Injectable()
export class BlogService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateBlogInput) {
    const existing = await this.prisma.blog.findUnique({
      where: { slug: dto.slug },
    });

    if (existing) {
      throw new ConflictException('A blog with this slug already exists');
    }

    return this.prisma.blog.create({
      data: {
        title: dto.title,
        slug: dto.slug,
        excerpt: dto.excerpt,
        content: dto.content,
        coverImage: dto.coverImage,
        tags: dto.tags,
        status: dto.status,
        authorId: userId,
      },
      include: {
        author: { select: AUTHOR_SELECT },
      },
    });
  }

  async findAll(
    page: number,
    limit: number,
    search?: string,
    status?: string,
    tags?: string,
    authorId?: string,
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
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    const isOwner = authorId && currentUserId && authorId === currentUserId;

    if (status) {
      where.status = status;
    } else if (isOwner) {
      // Owner viewing their own blogs: show all statuses
    } else {
      // Public browsing: exclude Draft and Archived
      where.status = { notIn: ['Draft', 'Archived'] };
    }

    if (tags) {
      const tagList = tags.split(',').map((t) => t.trim());
      where.tags = { hasSome: tagList };
    }

    let orderBy: Record<string, string> | Record<string, string>[];
    switch (sort) {
      case 'likes':
        orderBy = { upvotesCount: 'desc' };
        break;
      case 'trending':
        orderBy = [
          { upvotesCount: 'desc' },
          { commentsCount: 'desc' },
          { createdAt: 'desc' },
        ];
        break;
      default:
        orderBy = { createdAt: 'desc' };
    }

    const [items, total] = await Promise.all([
      this.prisma.blog.findMany({
        where,
        include: {
          author: { select: AUTHOR_SELECT },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.blog.count({ where }),
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

  async findBySlug(slug: string, userId?: string) {
    const blog = await this.prisma.blog.findUnique({
      where: { slug },
      include: {
        author: { select: AUTHOR_SELECT },
      },
    });

    if (!blog || blog.deletedAt) {
      throw new NotFoundException('Blog not found');
    }

    let hasVoted = false;
    if (userId) {
      const vote = await this.prisma.blogVote.findUnique({
        where: { blogId_userId: { blogId: blog.id, userId } },
      });
      hasVoted = vote !== null && vote.value === 1;
    }

    return { ...blog, hasVoted };
  }

  async update(slug: string, userId: string, dto: UpdateBlogInput) {
    const blog = await this.prisma.blog.findUnique({
      where: { slug },
    });

    if (!blog || blog.deletedAt) {
      throw new NotFoundException('Blog not found');
    }

    if (blog.authorId !== userId) {
      throw new ForbiddenException('You are not the owner of this blog');
    }

    if (dto.slug && dto.slug !== blog.slug) {
      const existingSlug = await this.prisma.blog.findUnique({
        where: { slug: dto.slug },
      });

      if (existingSlug) {
        throw new ConflictException('A blog with this slug already exists');
      }
    }

    return this.prisma.blog.update({
      where: { id: blog.id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.slug !== undefined && { slug: dto.slug }),
        ...(dto.excerpt !== undefined && { excerpt: dto.excerpt }),
        ...(dto.content !== undefined && { content: dto.content }),
        ...(dto.coverImage !== undefined && { coverImage: dto.coverImage }),
        ...(dto.tags !== undefined && { tags: dto.tags }),
        ...(dto.status !== undefined && { status: dto.status }),
      },
      include: {
        author: { select: AUTHOR_SELECT },
      },
    });
  }

  async softDelete(id: string, userId: string) {
    const blog = await this.prisma.blog.findUnique({
      where: { id },
    });

    if (!blog || blog.deletedAt) {
      throw new NotFoundException('Blog not found');
    }

    if (blog.authorId !== userId) {
      throw new ForbiddenException('You are not the owner of this blog');
    }

    return this.prisma.blog.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async recordView(blogId: string, userId?: string) {
    const blog = await this.prisma.blog.findUnique({
      where: { id: blogId },
    });
    if (!blog || blog.deletedAt) return;

    // Dedup: skip if same user viewed in last 24h
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    if (userId) {
      const recent = await this.prisma.blogView.findFirst({
        where: { blogId, userId, createdAt: { gte: since } },
      });
      if (recent) return;
    }

    await this.prisma.blogView.create({
      data: { blogId, userId },
    });
    await this.prisma.blog.update({
      where: { id: blogId },
      data: { viewsCount: { increment: 1 } },
    });
  }

  // ─── Votes ──────────────────────────────────────────────────────────────────

  async toggleVote(blogId: string, userId: string, dto: ToggleBlogVoteInput) {
    const blog = await this.prisma.blog.findUnique({
      where: { id: blogId },
    });

    if (!blog || blog.deletedAt) {
      throw new NotFoundException('Blog not found');
    }

    const existing = await this.prisma.blogVote.findUnique({
      where: {
        blogId_userId: {
          blogId,
          userId,
        },
      },
    });

    if (existing) {
      if (existing.value === dto.value) {
        // Same vote — remove it
        await this.prisma.blogVote.delete({
          where: { id: existing.id },
        });

        await this.prisma.blog.update({
          where: { id: blogId },
          data: { upvotesCount: { decrement: 1 } },
        });

        return { action: 'removed', value: dto.value };
      } else {
        // Different vote — switch
        await this.prisma.blogVote.update({
          where: { id: existing.id },
          data: { value: dto.value },
        });

        await this.prisma.blog.update({
          where: { id: blogId },
          data: {
            upvotesCount: dto.value === 1 ? { increment: 1 } : { decrement: 1 },
          },
        });

        return { action: 'switched', value: dto.value };
      }
    } else {
      // No existing vote — create it
      await this.prisma.blogVote.create({
        data: {
          blogId,
          userId,
          value: dto.value,
        },
      });

      if (dto.value === 1) {
        await this.prisma.blog.update({
          where: { id: blogId },
          data: { upvotesCount: { increment: 1 } },
        });
      }

      return { action: 'added', value: dto.value };
    }
  }

  // ─── Comments ───────────────────────────────────────────────────────────────

  async createComment(
    blogId: string,
    userId: string,
    dto: CreateBlogCommentInput,
  ) {
    const blog = await this.prisma.blog.findUnique({
      where: { id: blogId },
    });

    if (!blog || blog.deletedAt) {
      throw new NotFoundException('Blog not found');
    }

    if (dto.parentId) {
      const parentComment = await this.prisma.blogComment.findUnique({
        where: { id: dto.parentId },
      });

      if (!parentComment || parentComment.blogId !== blogId) {
        throw new NotFoundException(
          'Parent comment not found or does not belong to this blog',
        );
      }
    }

    const comment = await this.prisma.blogComment.create({
      data: {
        blogId,
        authorId: userId,
        content: dto.content,
        parentId: dto.parentId,
      },
      include: {
        author: { select: AUTHOR_SELECT },
      },
    });

    await this.prisma.blog.update({
      where: { id: blogId },
      data: { commentsCount: { increment: 1 } },
    });

    return comment;
  }

  async updateComment(
    blogId: string,
    commentId: string,
    userId: string,
    dto: UpdateBlogCommentInput,
  ) {
    const comment = await this.prisma.blogComment.findUnique({
      where: { id: commentId },
    });

    if (!comment || comment.deletedAt || comment.blogId !== blogId) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.authorId !== userId) {
      throw new ForbiddenException('You can only edit your own comments');
    }

    return this.prisma.blogComment.update({
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

  async deleteComment(blogId: string, commentId: string, userId: string) {
    const comment = await this.prisma.blogComment.findUnique({
      where: { id: commentId },
    });

    if (!comment || comment.deletedAt || comment.blogId !== blogId) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.authorId !== userId) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    await this.prisma.blogComment.update({
      where: { id: commentId },
      data: { deletedAt: new Date() },
    });

    await this.prisma.blog.update({
      where: { id: blogId },
      data: { commentsCount: { decrement: 1 } },
    });
  }

  async getComments(blogId: string, page: number, limit: number) {
    const blog = await this.prisma.blog.findUnique({
      where: { id: blogId },
    });

    if (!blog || blog.deletedAt) {
      throw new NotFoundException('Blog not found');
    }

    const total = await this.prisma.blogComment.count({
      where: { blogId, deletedAt: null, parentId: null },
    });

    const roots = await this.buildCommentTree(blogId);
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

  private async buildCommentTree(blogId: string) {
    const allComments = await this.prisma.blogComment.findMany({
      where: { blogId, deletedAt: null },
      include: {
        author: { select: AUTHOR_SELECT },
      },
      orderBy: { createdAt: 'asc' },
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
