import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PortfolioService {
  constructor(private readonly prisma: PrismaService) {}

  async getPortfolio(username: string) {
    const user = await this.prisma.user.findUnique({
      where: { username, deletedAt: null },
      include: {
        profile: true,
        socialLinks: true,
        techStack: true,
        education: { orderBy: { startDate: 'desc' } },
        experiences: { orderBy: { startDate: 'desc' } },
        services: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const [projects, blogs, resume, followCounts] = await Promise.all([
      this.prisma.project.findMany({
        where: { authorId: user.id, deletedAt: null, status: 'Published' },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          slug: true,
          logo: true,
          tagline: true,
          description: true,
          links: true,
          isOpenSource: true,
          images: true,
          techStack: true,
          tags: true,
          status: true,
          phase: true,
          demoUrl: true,
          videoUrl: true,
          launchDate: true,
          upvotesCount: true,
          downvotesCount: true,
          commentsCount: true,
          bookmarksCount: true,
          reviewsCount: true,
          viewsCount: true,
          authorId: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.blog.findMany({
        where: { authorId: user.id, deletedAt: null, status: 'Published' },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          content: true,
          coverImage: true,
          tags: true,
          status: true,
          upvotesCount: true,
          commentsCount: true,
          viewsCount: true,
          authorId: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.getPublicResume(user.id),
      this.getFollowCounts(user.id),
    ]);

    const { passwordHash, refreshToken, ...safeUser } = user as typeof user & {
      passwordHash?: string;
      refreshToken?: string;
    };

    return {
      user: safeUser,
      projects,
      blogs,
      resume,
      followCounts,
    };
  }

  async getProject(slug: string) {
    const project = await this.prisma.project.findFirst({
      where: { slug, deletedAt: null, status: 'Published' },
      select: {
        id: true,
        title: true,
        slug: true,
        logo: true,
        tagline: true,
        description: true,
        links: true,
        isOpenSource: true,
        images: true,
        techStack: true,
        tags: true,
        status: true,
        phase: true,
        demoUrl: true,
        videoUrl: true,
        launchDate: true,
        upvotesCount: true,
        commentsCount: true,
        viewsCount: true,
        authorId: true,
        author: {
          select: { id: true, username: true, name: true, avatarUrl: true },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async getBlog(slug: string) {
    const blog = await this.prisma.blog.findFirst({
      where: { slug, deletedAt: null, status: 'Published' },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        content: true,
        coverImage: true,
        tags: true,
        status: true,
        upvotesCount: true,
        commentsCount: true,
        viewsCount: true,
        authorId: true,
        author: {
          select: { id: true, username: true, name: true, avatarUrl: true },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!blog) throw new NotFoundException('Blog not found');
    return blog;
  }

  async getTemplateUrl(username: string): Promise<string | null> {
    const profile = await this.prisma.profile.findFirst({
      where: {
        user: { username, deletedAt: null },
        portfolioTemplateId: { not: null },
      },
      include: {
        portfolioTemplate: { select: { baseUrl: true, status: true } },
      },
    });

    if (!profile?.portfolioTemplate) return null;
    if (profile.portfolioTemplate.status !== 'Published') return null;

    return profile.portfolioTemplate.baseUrl;
  }

  private async getPublicResume(userId: string) {
    const resume = await this.prisma.resume.findFirst({
      where: {
        userId,
        deletedAt: null,
        OR: [{ isPrimary: true }, { isPublic: true }],
      },
      include: {
        versions: {
          orderBy: { generatedAt: 'desc' },
          take: 1,
          select: { pdfUrl: true, generatedAt: true },
        },
      },
    });

    if (!resume) return null;

    const latestVersion = resume.versions[0];
    return {
      id: resume.id,
      title: resume.title,
      pdfUrl: latestVersion?.pdfUrl ?? null,
      generatedAt: latestVersion?.generatedAt ?? null,
    };
  }

  private async getFollowCounts(userId: string) {
    const [followersCount, followingCount] = await Promise.all([
      this.prisma.follow.count({ where: { followingId: userId } }),
      this.prisma.follow.count({ where: { followerId: userId } }),
    ]);
    return { followersCount, followingCount };
  }
}
