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
  AddCollaboratorInput,
  AddMediaInput,
} from "@devcom/shared";

@Injectable()
export class ProjectService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new project with the given user as author.
   */
  async create(userId: string, dto: CreateProjectInput) {
    // Check for slug uniqueness
    const existing = await this.prisma.project.findUnique({
      where: { slug: dto.slug },
    });

    if (existing) {
      throw new ConflictException("A project with this slug already exists");
    }

    return this.prisma.project.create({
      data: {
        title: dto.title,
        slug: dto.slug,
        description: dto.description,
        shortDescription: dto.shortDescription,
        techStack: dto.techStack,
        repoUrl: dto.repoUrl,
        liveUrl: dto.liveUrl,
        status: dto.status,
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
  }

  /**
   * Find all projects with pagination, optional search, status, and techStack filters.
   */
  async findAll(
    page: number,
    limit: number,
    search?: string,
    status?: string,
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

    if (status) {
      where.status = status;
    }

    if (techStack) {
      // techStack query param is a comma-separated string
      const techs = techStack.split(",").map((t) => t.trim());
      where.techStack = { hasSome: techs };
    }

    const [items, total] = await Promise.all([
      this.prisma.project.findMany({
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
   * Find a single project by its slug, including full relations.
   */
  async findBySlug(slug: string) {
    const project = await this.prisma.project.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true,
            avatarUrl: true,
          },
        },
        collaborators: true,
        media: {
          orderBy: { order: "asc" },
        },
        timeline: {
          orderBy: { date: "desc" },
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

    // If slug is being changed, check uniqueness
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
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.shortDescription !== undefined && {
          shortDescription: dto.shortDescription,
        }),
        ...(dto.techStack !== undefined && { techStack: dto.techStack }),
        ...(dto.repoUrl !== undefined && { repoUrl: dto.repoUrl }),
        ...(dto.liveUrl !== undefined && { liveUrl: dto.liveUrl }),
        ...(dto.status !== undefined && { status: dto.status }),
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
   * Add a collaborator to a project. Only the author can add collaborators.
   */
  async addCollaborator(
    projectId: string,
    userId: string,
    dto: AddCollaboratorInput,
  ) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project || project.deletedAt) {
      throw new NotFoundException("Project not found");
    }

    if (project.authorId !== userId) {
      throw new ForbiddenException("You are not the owner of this project");
    }

    // Check if the collaborator already exists
    const existing = await this.prisma.projectCollaborator.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: dto.userId,
        },
      },
    });

    if (existing) {
      throw new ConflictException(
        "User is already a collaborator on this project",
      );
    }

    return this.prisma.projectCollaborator.create({
      data: {
        projectId,
        userId: dto.userId,
        role: dto.role,
      },
    });
  }

  /**
   * Add media to a project. Only the author can add media.
   */
  async addMedia(projectId: string, userId: string, dto: AddMediaInput) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project || project.deletedAt) {
      throw new NotFoundException("Project not found");
    }

    if (project.authorId !== userId) {
      throw new ForbiddenException("You are not the owner of this project");
    }

    // Get the current max order for this project's media
    const lastMedia = await this.prisma.projectMedia.findFirst({
      where: { projectId },
      orderBy: { order: "desc" },
    });

    const nextOrder = lastMedia ? lastMedia.order + 1 : 0;

    return this.prisma.projectMedia.create({
      data: {
        projectId,
        type: dto.type,
        url: dto.url,
        caption: dto.caption,
        order: nextOrder,
      },
    });
  }
}
