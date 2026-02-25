import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { NotificationService } from "../notification/notification.service";

const USER_SELECT = {
  id: true,
  username: true,
  name: true,
  avatarUrl: true,
  profile: { select: { headline: true } },
} as const;

@Injectable()
export class FollowService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  async toggleFollow(followerId: string, followingId: string) {
    if (followerId === followingId) {
      throw new BadRequestException("You cannot follow yourself");
    }

    const targetUser = await this.prisma.user.findUnique({
      where: { id: followingId },
    });
    if (!targetUser) {
      throw new NotFoundException("User not found");
    }

    const existing = await this.prisma.follow.findUnique({
      where: { followerId_followingId: { followerId, followingId } },
    });

    if (existing) {
      await this.prisma.follow.delete({ where: { id: existing.id } });
      return { following: false };
    }

    await this.prisma.follow.create({
      data: { followerId, followingId },
    });

    const actor = await this.prisma.user.findUnique({
      where: { id: followerId },
      select: { name: true, username: true },
    });

    await this.notificationService.create({
      recipientId: followingId,
      actorId: followerId,
      type: "NewFollower",
      title: `${actor?.name ?? `@${actor?.username}`} started following you`,
      resourceUrl: `/profile/${actor?.username}`,
    });

    return { following: true };
  }

  async isFollowing(followerId: string, followingId: string) {
    const follow = await this.prisma.follow.findUnique({
      where: { followerId_followingId: { followerId, followingId } },
    });
    return { following: !!follow };
  }

  async getCounts(userId: string) {
    const [followersCount, followingCount] = await Promise.all([
      this.prisma.follow.count({ where: { followingId: userId } }),
      this.prisma.follow.count({ where: { followerId: userId } }),
    ]);
    return { followersCount, followingCount };
  }

  async getFollowers(userId: string, page: number, limit: number) {
    const where = { followingId: userId };
    const [items, total] = await Promise.all([
      this.prisma.follow.findMany({
        where,
        select: {
          createdAt: true,
          follower: { select: USER_SELECT },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.follow.count({ where }),
    ]);

    return {
      items: items.map((f) => ({ ...f.follower, followedAt: f.createdAt })),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getFollowing(userId: string, page: number, limit: number) {
    const where = { followerId: userId };
    const [items, total] = await Promise.all([
      this.prisma.follow.findMany({
        where,
        select: {
          createdAt: true,
          following: { select: USER_SELECT },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.follow.count({ where }),
    ]);

    return {
      items: items.map((f) => ({ ...f.following, followedAt: f.createdAt })),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getMutuals(userId: string, page: number, limit: number) {
    const offset = (page - 1) * limit;

    const mutuals = await this.prisma.$queryRaw<
      Array<{
        id: string;
        username: string;
        name: string | null;
        avatarUrl: string | null;
        headline: string | null;
        followedAt: Date;
      }>
    >`
      SELECT u.id, u.username, u.name, u."avatarUrl", p.headline,
             f1."createdAt" AS "followedAt"
      FROM follows f1
      JOIN follows f2 ON f1."followerId" = f2."followingId"
                     AND f1."followingId" = f2."followerId"
      JOIN users u ON u.id = f1."followingId"
      LEFT JOIN profiles p ON p."userId" = u.id
      WHERE f1."followerId" = ${userId}
      ORDER BY f1."createdAt" DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const countResult = await this.prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*)::bigint AS count
      FROM follows f1
      JOIN follows f2 ON f1."followerId" = f2."followingId"
                     AND f1."followingId" = f2."followerId"
      WHERE f1."followerId" = ${userId}
    `;

    const total = Number(countResult[0].count);

    return {
      items: mutuals.map((m) => ({
        id: m.id,
        username: m.username,
        name: m.name,
        avatarUrl: m.avatarUrl,
        profile: m.headline ? { headline: m.headline } : null,
        followedAt: m.followedAt,
      })),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getSuggested(userId: string, limit: number) {
    // Score by: shared tech stack items + friends-of-friends
    const suggestions = await this.prisma.$queryRaw<
      Array<{
        id: string;
        username: string;
        name: string | null;
        avatarUrl: string | null;
        headline: string | null;
        score: bigint;
      }>
    >`
      SELECT u.id, u.username, u.name, u."avatarUrl", p.headline,
             (COALESCE(tech_score.score, 0) + COALESCE(fof_score.score, 0)) AS score
      FROM users u
      LEFT JOIN profiles p ON p."userId" = u.id
      -- Shared tech stack score
      LEFT JOIN (
        SELECT ts2."userId", COUNT(*)::bigint AS score
        FROM tech_stack_items ts1
        JOIN tech_stack_items ts2 ON ts1.name = ts2.name AND ts1."userId" != ts2."userId"
        WHERE ts1."userId" = ${userId}
        GROUP BY ts2."userId"
      ) tech_score ON tech_score."userId" = u.id
      -- Friends-of-friends score
      LEFT JOIN (
        SELECT f2."followingId" AS "userId", COUNT(*)::bigint AS score
        FROM follows f1
        JOIN follows f2 ON f1."followingId" = f2."followerId"
        WHERE f1."followerId" = ${userId}
          AND f2."followingId" != ${userId}
        GROUP BY f2."followingId"
      ) fof_score ON fof_score."userId" = u.id
      -- Exclude self and already-followed users
      WHERE u.id != ${userId}
        AND u."deletedAt" IS NULL
        AND NOT EXISTS (
          SELECT 1 FROM follows f WHERE f."followerId" = ${userId} AND f."followingId" = u.id
        )
        AND (COALESCE(tech_score.score, 0) + COALESCE(fof_score.score, 0)) > 0
      ORDER BY score DESC, u."createdAt" DESC
      LIMIT ${limit}
    `;

    return suggestions.map((s) => ({
      id: s.id,
      username: s.username,
      name: s.name,
      avatarUrl: s.avatarUrl,
      profile: s.headline ? { headline: s.headline } : null,
      score: Number(s.score),
    }));
  }
}
