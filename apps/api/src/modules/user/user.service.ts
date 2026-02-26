import { Injectable, NotFoundException } from "@nestjs/common";
import type {
  UpdateProfileInput,
  UpdateSocialLinksInput,
  UpdateTechStackInput,
  UpdateEducationInput,
  UpdateExperienceInput,
  UpdateServicesInput,
  SocialLinkInput,
  TechStackItemInput,
  EducationItemInput,
  ExperienceItemInput,
  ServiceItemInput,
} from "@devcom/shared";
import { PAGINATION } from "@devcom/shared";

import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
        socialLinks: true,
        techStack: true,
        education: { orderBy: { startDate: "desc" } },
        experiences: { orderBy: { startDate: "desc" } },
        services: true,
        projects: {
          where: { deletedAt: null, status: "Active" },
          orderBy: { createdAt: "desc" },
          take: 10,
          select: {
            id: true,
            title: true,
            slug: true,
            tagline: true,
            demoUrl: true,
            links: true,
            techStack: true,
            isOpenSource: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return this.excludePassword(user);
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findByUsername(username: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
      include: {
        profile: true,
        socialLinks: true,
        techStack: true,
        education: { orderBy: { startDate: "desc" } },
        experiences: { orderBy: { startDate: "desc" } },
        services: true,
        projects: {
          where: { deletedAt: null },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return this.excludePassword(user);
  }

  async findByGithubId(githubId: string) {
    return this.prisma.user.findUnique({
      where: { githubId },
    });
  }

  async findByGoogleId(googleId: string) {
    return this.prisma.user.findUnique({
      where: { googleId },
    });
  }

  async searchUsers(query: string, page: number, limit: number) {
    const safePage = page || PAGINATION.DEFAULT_PAGE;
    const safeLimit = Math.min(
      limit || PAGINATION.DEFAULT_LIMIT,
      PAGINATION.MAX_LIMIT,
    );
    const skip = (safePage - 1) * safeLimit;

    const where = query
      ? {
          OR: [
            { username: { contains: query, mode: "insensitive" as const } },
            { name: { contains: query, mode: "insensitive" as const } },
            {
              profile: {
                headline: { contains: query, mode: "insensitive" as const },
              },
            },
          ],
          deletedAt: null,
        }
      : { deletedAt: null };

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        include: {
          profile: true,
        },
        skip,
        take: safeLimit,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      items: users.map((u) => this.excludePassword(u)),
      meta: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit),
      },
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileInput) {
    // Separate user-level fields from profile-level fields
    const { name, ...profileData } = dto;

    // Update name on the User model if provided
    if (name) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { name },
      });
    }

    // Upsert profile with remaining fields
    const profile = await this.prisma.profile.upsert({
      where: { userId },
      update: profileData,
      create: {
        userId,
        ...profileData,
      },
    });

    return profile;
  }

  async updateSocialLinks(userId: string, dto: UpdateSocialLinksInput) {
    // Delete existing links and create new ones in a transaction
    return this.prisma.$transaction(async (tx) => {
      await tx.socialLink.deleteMany({
        where: { userId },
      });

      if (dto.links.length > 0) {
        await tx.socialLink.createMany({
          data: dto.links.map((link: SocialLinkInput) => ({
            userId,
            platform: link.platform,
            url: link.url,
          })),
        });
      }

      return tx.socialLink.findMany({
        where: { userId },
        orderBy: { createdAt: "asc" },
      });
    });
  }

  async updateTechStack(userId: string, dto: UpdateTechStackInput) {
    // Delete existing items and create new ones in a transaction
    return this.prisma.$transaction(async (tx) => {
      await tx.techStackItem.deleteMany({
        where: { userId },
      });

      if (dto.items.length > 0) {
        await tx.techStackItem.createMany({
          data: dto.items.map((item: TechStackItemInput) => ({
            userId,
            name: item.name,
            category: item.category,
            proficiency: item.proficiency,
          })),
        });
      }

      return tx.techStackItem.findMany({
        where: { userId },
        orderBy: { createdAt: "asc" },
      });
    });
  }

  async updateEducation(userId: string, dto: UpdateEducationInput) {
    return this.prisma.$transaction(async (tx) => {
      await tx.education.deleteMany({
        where: { userId },
      });

      if (dto.items.length > 0) {
        await tx.education.createMany({
          data: dto.items.map((item: EducationItemInput) => ({
            userId,
            institution: item.institution,
            degree: item.degree,
            fieldOfStudy: item.fieldOfStudy,
            startDate: new Date(item.startDate),
            endDate: item.endDate ? new Date(item.endDate) : null,
            current: item.current,
            description: item.description,
          })),
        });
      }

      return tx.education.findMany({
        where: { userId },
        orderBy: { startDate: "desc" },
      });
    });
  }

  async updateExperience(userId: string, dto: UpdateExperienceInput) {
    return this.prisma.$transaction(async (tx) => {
      await tx.experience.deleteMany({
        where: { userId },
      });

      if (dto.items.length > 0) {
        await tx.experience.createMany({
          data: dto.items.map((item: ExperienceItemInput) => ({
            userId,
            company: item.company,
            position: item.position,
            location: item.location,
            employmentType: item.employmentType,
            startDate: new Date(item.startDate),
            endDate: item.endDate ? new Date(item.endDate) : null,
            current: item.current,
            description: item.description,
          })),
        });
      }

      return tx.experience.findMany({
        where: { userId },
        orderBy: { startDate: "desc" },
      });
    });
  }

  async updateServices(userId: string, dto: UpdateServicesInput) {
    return this.prisma.$transaction(async (tx) => {
      await tx.service.deleteMany({
        where: { userId },
      });

      if (dto.items.length > 0) {
        await tx.service.createMany({
          data: dto.items.map((item: ServiceItemInput) => ({
            userId,
            title: item.title,
            description: item.description,
          })),
        });
      }

      return tx.service.findMany({
        where: { userId },
        orderBy: { createdAt: "asc" },
      });
    });
  }

  private excludePassword<T extends Record<string, unknown>>(
    user: T,
  ): Omit<T, "passwordHash" | "refreshToken"> {
    const { passwordHash, refreshToken, ...userWithoutSensitive } =
      user as T & { passwordHash?: unknown; refreshToken?: unknown };
    return userWithoutSensitive as Omit<T, "passwordHash" | "refreshToken">;
  }
}
