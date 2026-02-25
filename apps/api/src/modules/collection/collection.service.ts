import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import type {
  CreateCollectionInput,
  UpdateCollectionInput,
  AddCollectionItemInput,
} from "@devcom/shared";

const AUTHOR_SELECT = {
  id: true,
  username: true,
  name: true,
  avatarUrl: true,
} as const;

@Injectable()
export class CollectionService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateCollectionInput) {
    const existing = await this.prisma.projectCollection.findUnique({
      where: { slug: dto.slug },
    });
    if (existing) {
      throw new ConflictException("A collection with this slug already exists");
    }

    return this.prisma.projectCollection.create({
      data: { ...dto, authorId: userId },
      include: {
        author: { select: AUTHOR_SELECT },
        items: {
          include: {
            project: {
              include: { author: { select: AUTHOR_SELECT } },
            },
          },
          orderBy: { position: "asc" },
        },
      },
    });
  }

  async findAll(page: number, limit: number, authorId?: string) {
    const where: Record<string, unknown> = { deletedAt: null };
    if (authorId) {
      where.authorId = authorId;
    } else {
      where.isPublic = true;
    }

    const [items, total] = await Promise.all([
      this.prisma.projectCollection.findMany({
        where,
        include: {
          author: { select: AUTHOR_SELECT },
          _count: { select: { items: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.projectCollection.count({ where }),
    ]);

    return {
      items,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findBySlug(slug: string) {
    const collection = await this.prisma.projectCollection.findUnique({
      where: { slug },
      include: {
        author: { select: AUTHOR_SELECT },
        items: {
          include: {
            project: {
              include: {
                author: { select: AUTHOR_SELECT },
                makers: { include: { user: { select: AUTHOR_SELECT } } },
              },
            },
          },
          orderBy: { position: "asc" },
        },
      },
    });

    if (!collection || collection.deletedAt) {
      throw new NotFoundException("Collection not found");
    }

    return collection;
  }

  async update(slug: string, userId: string, dto: UpdateCollectionInput) {
    const collection = await this.prisma.projectCollection.findUnique({
      where: { slug },
    });
    if (!collection || collection.deletedAt) {
      throw new NotFoundException("Collection not found");
    }
    if (collection.authorId !== userId) {
      throw new ForbiddenException("You are not the owner of this collection");
    }

    if (dto.slug && dto.slug !== collection.slug) {
      const existingSlug = await this.prisma.projectCollection.findUnique({
        where: { slug: dto.slug },
      });
      if (existingSlug) {
        throw new ConflictException("A collection with this slug already exists");
      }
    }

    return this.prisma.projectCollection.update({
      where: { id: collection.id },
      data: dto,
      include: {
        author: { select: AUTHOR_SELECT },
        items: {
          include: {
            project: {
              include: { author: { select: AUTHOR_SELECT } },
            },
          },
          orderBy: { position: "asc" },
        },
      },
    });
  }

  async delete(slug: string, userId: string) {
    const collection = await this.prisma.projectCollection.findUnique({
      where: { slug },
    });
    if (!collection || collection.deletedAt) {
      throw new NotFoundException("Collection not found");
    }
    if (collection.authorId !== userId) {
      throw new ForbiddenException("You are not the owner of this collection");
    }
    await this.prisma.projectCollection.update({
      where: { id: collection.id },
      data: { deletedAt: new Date() },
    });
  }

  async addItem(
    collectionId: string,
    userId: string,
    dto: AddCollectionItemInput,
  ) {
    const collection = await this.prisma.projectCollection.findUnique({
      where: { id: collectionId },
    });
    if (!collection || collection.deletedAt) {
      throw new NotFoundException("Collection not found");
    }
    if (collection.authorId !== userId) {
      throw new ForbiddenException("You are not the owner");
    }

    const maxPos = await this.prisma.projectCollectionItem.aggregate({
      where: { collectionId },
      _max: { position: true },
    });

    return this.prisma.projectCollectionItem.create({
      data: {
        collectionId,
        projectId: dto.projectId,
        note: dto.note,
        position: (maxPos._max.position ?? -1) + 1,
      },
      include: {
        project: {
          include: { author: { select: AUTHOR_SELECT } },
        },
      },
    });
  }

  async removeItem(
    collectionId: string,
    itemId: string,
    userId: string,
  ) {
    const collection = await this.prisma.projectCollection.findUnique({
      where: { id: collectionId },
    });
    if (!collection || collection.deletedAt) {
      throw new NotFoundException("Collection not found");
    }
    if (collection.authorId !== userId) {
      throw new ForbiddenException("You are not the owner");
    }

    const item = await this.prisma.projectCollectionItem.findUnique({
      where: { id: itemId },
    });
    if (!item || item.collectionId !== collectionId) {
      throw new NotFoundException("Item not found");
    }

    await this.prisma.projectCollectionItem.delete({ where: { id: itemId } });
  }

  async reorderItems(
    collectionId: string,
    userId: string,
    itemIds: string[],
  ) {
    const collection = await this.prisma.projectCollection.findUnique({
      where: { id: collectionId },
    });
    if (!collection || collection.deletedAt) {
      throw new NotFoundException("Collection not found");
    }
    if (collection.authorId !== userId) {
      throw new ForbiddenException("You are not the owner");
    }

    await this.prisma.$transaction(
      itemIds.map((id, index) =>
        this.prisma.projectCollectionItem.update({
          where: { id },
          data: { position: index },
        }),
      ),
    );
  }
}
