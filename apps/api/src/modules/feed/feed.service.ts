import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { FEED } from '@betaversionio/shared';
import type {
  CreatePostInput,
  CreateCommentInput,
  ToggleReactionInput,
} from '@betaversionio/shared';

@Injectable()
export class FeedService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new post and handle hashtag linking.
   * For each hashtag: find or create the Hashtag record, link via PostHashtag,
   * and increment the denormalized postsCount.
   */
  async createPost(userId: string, dto: CreatePostInput) {
    return this.prisma.$transaction(async (tx) => {
      // Create the post
      const post = await tx.post.create({
        data: {
          authorId: userId,
          type: dto.type as any,
          title: dto.title,
          content: dto.content,
          codeSnippet: dto.codeSnippet?.code,
          codeLanguage: dto.codeSnippet?.language,
        },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              name: true,
              avatarUrl: true,
            },
          },
        },
      });

      // Handle hashtags
      if (dto.hashtags && dto.hashtags.length > 0) {
        for (const tagName of dto.hashtags) {
          const normalizedTag = tagName.toLowerCase().replace(/^#/, '');

          // Find or create the hashtag
          const hashtag = await tx.hashtag.upsert({
            where: { name: normalizedTag },
            update: {
              postsCount: { increment: 1 },
            },
            create: {
              name: normalizedTag,
              postsCount: 1,
            },
          });

          // Link post to hashtag
          await tx.postHashtag.create({
            data: {
              postId: post.id,
              hashtagId: hashtag.id,
            },
          });
        }
      }

      // Re-fetch the post with all relations
      return tx.post.findUnique({
        where: { id: post.id },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              name: true,
              avatarUrl: true,
            },
          },
          postHashtags: {
            include: {
              hashtag: true,
            },
          },
          _count: {
            select: {
              comments: true,
              reactions: true,
            },
          },
        },
      });
    });
  }

  /**
   * Get the feed with cursor-based pagination.
   * Orders by createdAt desc, uses post id as cursor.
   */
  async getFeed(
    cursor?: string,
    limit?: number,
    authorId?: string,
    userId?: string,
  ) {
    const take = limit
      ? Math.min(limit, FEED.MAX_CURSOR_LIMIT)
      : FEED.DEFAULT_CURSOR_LIMIT;

    const where: Record<string, unknown> = { deletedAt: null };
    if (authorId) {
      where.authorId = authorId;
    } else if (userId) {
      // Show posts from followed users + own posts
      const follows = await this.prisma.follow.findMany({
        where: { followerId: userId },
        select: { followingId: true },
      });
      const followingIds = follows.map((f) => f.followingId);
      where.authorId = { in: [...followingIds, userId] };
    }

    const queryOptions: Record<string, unknown> = {
      where,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true,
            avatarUrl: true,
          },
        },
        postHashtags: {
          include: {
            hashtag: true,
          },
        },
        reactions: {
          select: {
            type: true,
            userId: true,
          },
        },
        _count: {
          select: {
            comments: true,
            reactions: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: take + 1, // Fetch one extra to determine hasMore
    };

    if (cursor) {
      (queryOptions as any).cursor = { id: cursor };
      (queryOptions as any).skip = 1; // Skip the cursor item itself
    }

    const posts = await this.prisma.post.findMany(queryOptions as any);

    const hasMore = posts.length > take;
    const rawItems = hasMore ? posts.slice(0, take) : posts;
    const nextCursor = hasMore ? rawItems[rawItems.length - 1]!.id : null;

    // Aggregate reactions by type with hasReacted for the current user
    const items = rawItems.map((post: any) => {
      const reactionsByType: Record<
        string,
        { type: string; count: number; hasReacted: boolean }
      > = {};

      for (const r of post.reactions ?? []) {
        if (!reactionsByType[r.type]) {
          reactionsByType[r.type] = {
            type: r.type,
            count: 0,
            hasReacted: false,
          };
        }
        const entry = reactionsByType[r.type]!;
        entry.count++;
        if (userId && r.userId === userId) {
          entry.hasReacted = true;
        }
      }

      const { reactions: _raw, ...rest } = post;
      return {
        ...rest,
        reactions: Object.values(reactionsByType),
      };
    });

    return {
      items,
      meta: {
        nextCursor,
        hasMore,
      },
    };
  }

  /**
   * Get a single post by ID with full relations:
   * author, comments (with author, nested replies), reactions, hashtags.
   */
  async getPostById(id: string, userId?: string) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true,
            avatarUrl: true,
          },
        },
        comments: {
          where: { deletedAt: null, parentId: null },
          include: {
            author: {
              select: {
                id: true,
                username: true,
                name: true,
                avatarUrl: true,
              },
            },
            replies: {
              where: { deletedAt: null },
              include: {
                author: {
                  select: {
                    id: true,
                    username: true,
                    name: true,
                    avatarUrl: true,
                  },
                },
              },
              orderBy: { createdAt: 'asc' },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        reactions: {
          select: {
            type: true,
            userId: true,
          },
        },
        postHashtags: {
          include: {
            hashtag: true,
          },
        },
        _count: {
          select: {
            comments: true,
            reactions: true,
          },
        },
      },
    });

    if (!post || post.deletedAt) {
      throw new NotFoundException('Post not found');
    }

    // Aggregate reactions by type with hasReacted
    const reactionsByType: Record<
      string,
      { type: string; count: number; hasReacted: boolean }
    > = {};

    for (const r of post.reactions) {
      if (!reactionsByType[r.type]) {
        reactionsByType[r.type] = {
          type: r.type,
          count: 0,
          hasReacted: false,
        };
      }
      const entry = reactionsByType[r.type]!;
      entry.count++;
      if (userId && r.userId === userId) {
        entry.hasReacted = true;
      }
    }

    const { reactions: _raw, ...rest } = post;
    return {
      ...rest,
      reactions: Object.values(reactionsByType),
    };
  }

  /**
   * Toggle a reaction on a post.
   * Only one reaction per user per post is allowed.
   * - Same type as existing → remove it (un-react)
   * - Different type → swap to the new type
   * - No existing → add the new type
   */
  async toggleReaction(
    postId: string,
    userId: string,
    dto: ToggleReactionInput,
  ) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post || post.deletedAt) {
      throw new NotFoundException('Post not found');
    }

    // Find any existing reaction from this user on this post
    const existing = await this.prisma.reaction.findFirst({
      where: { postId, userId },
    });

    if (existing && existing.type === dto.type) {
      // Same type — remove (un-react)
      await this.prisma.reaction.delete({
        where: { id: existing.id },
      });

      await this.prisma.post.update({
        where: { id: postId },
        data: { likesCount: { decrement: 1 } },
      });

      return { action: 'removed', type: dto.type };
    }

    if (existing) {
      // Different type — swap reaction (count stays the same)
      await this.prisma.reaction.update({
        where: { id: existing.id },
        data: { type: dto.type as any },
      });

      return { action: 'changed', type: dto.type };
    }

    // No existing — add new reaction
    await this.prisma.reaction.create({
      data: {
        postId,
        userId,
        type: dto.type as any,
      },
    });

    await this.prisma.post.update({
      where: { id: postId },
      data: { likesCount: { increment: 1 } },
    });

    return { action: 'added', type: dto.type };
  }

  /**
   * Create a comment on a post.
   * Supports nested replies via optional parentId.
   * Increments the denormalized commentsCount on the post.
   */
  async createComment(postId: string, userId: string, dto: CreateCommentInput) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post || post.deletedAt) {
      throw new NotFoundException('Post not found');
    }

    // If parentId is given, verify the parent comment exists and belongs to this post
    if (dto.parentId) {
      const parentComment = await this.prisma.comment.findUnique({
        where: { id: dto.parentId },
      });

      if (!parentComment || parentComment.postId !== postId) {
        throw new NotFoundException(
          'Parent comment not found or does not belong to this post',
        );
      }
    }

    const comment = await this.prisma.comment.create({
      data: {
        postId,
        authorId: userId,
        content: dto.content,
        parentId: dto.parentId,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Increment denormalized commentsCount
    await this.prisma.post.update({
      where: { id: postId },
      data: { commentsCount: { increment: 1 } },
    });

    return comment;
  }

  /**
   * Soft-delete a post. Only the author can delete.
   */
  async softDeletePost(id: string, userId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id },
    });

    if (!post || post.deletedAt) {
      throw new NotFoundException('Post not found');
    }

    if (post.authorId !== userId) {
      throw new ForbiddenException('You are not the author of this post');
    }

    return this.prisma.post.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
