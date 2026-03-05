import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PAGINATION } from '@betaversionio/shared';
import type {
  CreatePortfolioTemplateInput,
  UpdatePortfolioTemplateInput,
} from '@betaversionio/shared';

import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PortfolioTemplateService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    page: number,
    limit: number,
    search?: string,
    tags?: string[],
    featured?: boolean,
  ) {
    const safePage = page || PAGINATION.DEFAULT_PAGE;
    const safeLimit = Math.min(
      limit || PAGINATION.DEFAULT_LIMIT,
      PAGINATION.MAX_LIMIT,
    );

    const where: Record<string, unknown> = {
      status: 'Published',
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (tags && tags.length > 0) {
      where.tags = { hasSome: tags };
    }

    if (featured !== undefined) {
      where.featured = featured;
    }

    const [items, total] = await Promise.all([
      this.prisma.portfolioTemplate.findMany({
        where,
        include: {
          author: {
            select: { id: true, username: true, name: true, avatarUrl: true },
          },
        },
        orderBy: [{ featured: 'desc' }, { installCount: 'desc' }, { createdAt: 'desc' }],
        skip: (safePage - 1) * safeLimit,
        take: safeLimit,
      }),
      this.prisma.portfolioTemplate.count({ where }),
    ]);

    return {
      items,
      meta: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit),
      },
    };
  }

  async findByAuthor(
    userId: string,
    status?: string,
    page?: number,
    limit?: number,
  ) {
    const safePage = page || PAGINATION.DEFAULT_PAGE;
    const safeLimit = Math.min(
      limit || PAGINATION.DEFAULT_LIMIT,
      PAGINATION.MAX_LIMIT,
    );

    const where: Record<string, unknown> = {
      authorId: userId,
    };

    if (status) {
      where.status = status;
    }

    const [items, total] = await Promise.all([
      this.prisma.portfolioTemplate.findMany({
        where,
        include: {
          author: {
            select: { id: true, username: true, name: true, avatarUrl: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (safePage - 1) * safeLimit,
        take: safeLimit,
      }),
      this.prisma.portfolioTemplate.count({ where }),
    ]);

    return {
      items,
      meta: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit),
      },
    };
  }

  async findById(id: string) {
    const template = await this.prisma.portfolioTemplate.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, username: true, name: true, avatarUrl: true },
        },
      },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    return template;
  }

  async create(authorId: string, dto: CreatePortfolioTemplateInput) {
    return this.prisma.portfolioTemplate.create({
      data: {
        ...dto,
        authorId,
      },
      include: {
        author: {
          select: { id: true, username: true, name: true, avatarUrl: true },
        },
      },
    });
  }

  async update(id: string, userId: string, dto: UpdatePortfolioTemplateInput) {
    const template = await this.prisma.portfolioTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    if (template.authorId !== userId) {
      throw new ForbiddenException('You can only update your own templates');
    }

    return this.prisma.portfolioTemplate.update({
      where: { id },
      data: dto,
      include: {
        author: {
          select: { id: true, username: true, name: true, avatarUrl: true },
        },
      },
    });
  }

  async remove(id: string, userId: string) {
    const template = await this.prisma.portfolioTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    if (template.authorId !== userId) {
      throw new ForbiddenException('You can only delete your own templates');
    }

    await this.prisma.portfolioTemplate.delete({ where: { id } });

    return { deleted: true };
  }

  async selectTemplate(userId: string, portfolioTemplateId: string | null) {
    if (portfolioTemplateId) {
      const template = await this.prisma.portfolioTemplate.findUnique({
        where: { id: portfolioTemplateId, status: 'Published' },
      });

      if (!template) {
        throw new NotFoundException('Template not found or not published');
      }
    }

    const profile = await this.prisma.profile.upsert({
      where: { userId },
      update: { portfolioTemplateId },
      create: { userId, portfolioTemplateId },
    });

    // Update install count
    if (portfolioTemplateId) {
      await this.prisma.portfolioTemplate.update({
        where: { id: portfolioTemplateId },
        data: { installCount: { increment: 1 } },
      });
    }

    return profile;
  }
}
