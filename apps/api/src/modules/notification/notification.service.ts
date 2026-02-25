import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

const ACTOR_SELECT = {
  id: true,
  username: true,
  name: true,
  avatarUrl: true,
} as const;

@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    recipientId: string;
    actorId?: string;
    type: string;
    title: string;
    body?: string;
    resourceId?: string;
    resourceUrl?: string;
  }) {
    // Don't notify yourself
    if (data.actorId && data.recipientId === data.actorId) return;

    return this.prisma.notification.create({
      data: {
        recipientId: data.recipientId,
        actorId: data.actorId,
        type: data.type as never,
        title: data.title,
        body: data.body,
        resourceId: data.resourceId,
        resourceUrl: data.resourceUrl,
      },
    });
  }

  async createBulk(
    recipientIds: string[],
    data: {
      actorId?: string;
      type: string;
      title: string;
      body?: string;
      resourceId?: string;
      resourceUrl?: string;
    },
  ) {
    const filtered = recipientIds.filter((id) => id !== data.actorId);
    if (filtered.length === 0) return;

    await this.prisma.notification.createMany({
      data: filtered.map((recipientId) => ({
        recipientId,
        actorId: data.actorId,
        type: data.type as never,
        title: data.title,
        body: data.body,
        resourceId: data.resourceId,
        resourceUrl: data.resourceUrl,
      })),
    });
  }

  async findAll(userId: string, page: number, limit: number) {
    const where = { recipientId: userId };
    const [items, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        include: { actor: { select: ACTOR_SELECT } },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.notification.count({ where }),
    ]);

    return {
      items,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getUnreadCount(userId: string) {
    const count = await this.prisma.notification.count({
      where: { recipientId: userId, isRead: false },
    });
    return { count };
  }

  async markAsRead(notificationId: string, userId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });
    if (!notification || notification.recipientId !== userId) {
      throw new NotFoundException("Notification not found");
    }
    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async markAllAsRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { recipientId: userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
    return { success: true };
  }

  async delete(notificationId: string, userId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });
    if (!notification || notification.recipientId !== userId) {
      throw new NotFoundException("Notification not found");
    }
    await this.prisma.notification.delete({ where: { id: notificationId } });
  }
}
