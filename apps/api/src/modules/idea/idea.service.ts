import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import type {
  CreateIdeaInput,
  UpdateIdeaInput,
  CreateApplicationInput,
} from "@devcom/shared";

@Injectable()
export class IdeaService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new idea with roles in a single transaction.
   */
  async create(userId: string, dto: CreateIdeaInput) {
    return this.prisma.$transaction(async (tx) => {
      const idea = await tx.idea.create({
        data: {
          authorId: userId,
          title: dto.title,
          description: dto.description,
          stage: dto.stage as any,
          techStack: dto.techStack,
        },
      });

      // Create roles if provided
      if (dto.roles && dto.roles.length > 0) {
        await tx.ideaRole.createMany({
          data: dto.roles.map((role) => ({
            ideaId: idea.id,
            title: role.title,
            description: role.description,
            commitment: role.commitment as any,
            compensation: role.compensation as any,
          })),
        });
      }

      // Return the idea with all relations
      return tx.idea.findUnique({
        where: { id: idea.id },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              name: true,
              avatarUrl: true,
            },
          },
          roles: true,
          _count: {
            select: {
              votes: true,
              applications: true,
            },
          },
        },
      });
    });
  }

  /**
   * Find all ideas with pagination, optional search, stage, and techStack filters.
   */
  async findAll(
    page: number,
    limit: number,
    search?: string,
    stage?: string,
    techStack?: string,
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

    if (stage) {
      where.stage = stage;
    }

    if (techStack) {
      const techs = techStack.split(",").map((t) => t.trim());
      where.techStack = { hasSome: techs };
    }

    const [items, total] = await Promise.all([
      this.prisma.idea.findMany({
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
          roles: true,
          _count: {
            select: {
              votes: true,
              applications: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.idea.count({ where }),
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
   * Find a single idea by ID with full relations.
   */
  async findById(id: string) {
    const idea = await this.prisma.idea.findUnique({
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
        roles: {
          include: {
            applications: true,
          },
        },
        applications: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                name: true,
                avatarUrl: true,
              },
            },
            role: true,
          },
        },
        _count: {
          select: {
            votes: true,
            applications: true,
          },
        },
      },
    });

    if (!idea || idea.deletedAt) {
      throw new NotFoundException("Idea not found");
    }

    return idea;
  }

  /**
   * Update an idea and its roles. Verifies ownership.
   * Roles are replaced: old roles are deleted, new roles are created.
   */
  async update(id: string, userId: string, dto: UpdateIdeaInput) {
    const idea = await this.prisma.idea.findUnique({
      where: { id },
    });

    if (!idea || idea.deletedAt) {
      throw new NotFoundException("Idea not found");
    }

    if (idea.authorId !== userId) {
      throw new ForbiddenException("You are not the owner of this idea");
    }

    return this.prisma.$transaction(async (tx) => {
      // Update the idea fields
      await tx.idea.update({
        where: { id },
        data: {
          ...(dto.title !== undefined && { title: dto.title }),
          ...(dto.description !== undefined && {
            description: dto.description,
          }),
          ...(dto.stage !== undefined && { stage: dto.stage as any }),
          ...(dto.techStack !== undefined && { techStack: dto.techStack }),
        },
      });

      // If roles are provided, replace all existing roles
      if (dto.roles !== undefined) {
        // Delete existing roles
        await tx.ideaRole.deleteMany({
          where: { ideaId: id },
        });

        // Create new roles
        if (dto.roles.length > 0) {
          await tx.ideaRole.createMany({
            data: dto.roles.map((role) => ({
              ideaId: id,
              title: role.title,
              description: role.description,
              commitment: role.commitment as any,
              compensation: role.compensation as any,
            })),
          });
        }
      }

      // Return the updated idea with relations
      return tx.idea.findUnique({
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
          roles: true,
          _count: {
            select: {
              votes: true,
              applications: true,
            },
          },
        },
      });
    });
  }

  /**
   * Toggle a vote on an idea: create if not exists, delete if exists.
   * Updates the denormalized votesCount.
   */
  async toggleVote(ideaId: string, userId: string) {
    const idea = await this.prisma.idea.findUnique({
      where: { id: ideaId },
    });

    if (!idea || idea.deletedAt) {
      throw new NotFoundException("Idea not found");
    }

    const existing = await this.prisma.ideaVote.findUnique({
      where: {
        ideaId_userId: {
          ideaId,
          userId,
        },
      },
    });

    if (existing) {
      // Remove the vote
      await this.prisma.ideaVote.delete({
        where: { id: existing.id },
      });

      // Decrement denormalized votesCount
      await this.prisma.idea.update({
        where: { id: ideaId },
        data: { votesCount: { decrement: 1 } },
      });

      return { action: "removed" };
    } else {
      // Add the vote
      await this.prisma.ideaVote.create({
        data: {
          ideaId,
          userId,
        },
      });

      // Increment denormalized votesCount
      await this.prisma.idea.update({
        where: { id: ideaId },
        data: { votesCount: { increment: 1 } },
      });

      return { action: "added" };
    }
  }

  /**
   * Apply to an idea for a specific role.
   * Verifies that the role belongs to the idea and that the user
   * has not already applied for the same role.
   */
  async applyToIdea(
    ideaId: string,
    userId: string,
    dto: CreateApplicationInput,
  ) {
    const idea = await this.prisma.idea.findUnique({
      where: { id: ideaId },
      include: { roles: true },
    });

    if (!idea || idea.deletedAt) {
      throw new NotFoundException("Idea not found");
    }

    if (!idea.isOpen) {
      throw new BadRequestException(
        "This idea is no longer accepting applications",
      );
    }

    // Verify the role belongs to this idea
    const role = idea.roles.find((r) => r.id === dto.roleId);
    if (!role) {
      throw new BadRequestException(
        "The specified role does not belong to this idea",
      );
    }

    if (role.isFilled) {
      throw new BadRequestException("This role has already been filled");
    }

    // Check for duplicate application
    const existing = await this.prisma.ideaApplication.findUnique({
      where: {
        ideaId_userId_roleId: {
          ideaId,
          userId,
          roleId: dto.roleId,
        },
      },
    });

    if (existing) {
      throw new ConflictException("You have already applied for this role");
    }

    return this.prisma.ideaApplication.create({
      data: {
        ideaId,
        userId,
        roleId: dto.roleId,
        message: dto.message,
        portfolioUrl: dto.portfolioUrl,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            avatarUrl: true,
          },
        },
        role: true,
      },
    });
  }

  /**
   * Convert an idea into a project.
   * Creates a new project from the idea data, sets convertedProjectId,
   * and closes the idea.
   */
  async convertToProject(ideaId: string, userId: string) {
    const idea = await this.prisma.idea.findUnique({
      where: { id: ideaId },
    });

    if (!idea || idea.deletedAt) {
      throw new NotFoundException("Idea not found");
    }

    if (idea.authorId !== userId) {
      throw new ForbiddenException("You are not the owner of this idea");
    }

    if (idea.convertedProjectId) {
      throw new BadRequestException(
        "This idea has already been converted to a project",
      );
    }

    return this.prisma.$transaction(async (tx) => {
      // Generate a slug from the title
      const baseSlug = idea.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      // Ensure slug uniqueness by appending a short random suffix
      const slug = `${baseSlug}-${Date.now().toString(36)}`;

      // Create the project from idea data
      const project = await tx.project.create({
        data: {
          title: idea.title,
          slug,
          description: idea.description,
          techStack: idea.techStack,
          status: "Draft",
          authorId: userId,
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

      // Link the idea to the project and close it
      await tx.idea.update({
        where: { id: ideaId },
        data: {
          convertedProjectId: project.id,
          isOpen: false,
        },
      });

      return project;
    });
  }
}
