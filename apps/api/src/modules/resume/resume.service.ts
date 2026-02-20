import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import type { CreateResumeInput, UpdateResumeInput } from "@devcom/shared";

@Injectable()
export class ResumeService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new resume for the user.
   */
  async create(userId: string, dto: CreateResumeInput) {
    return this.prisma.resume.create({
      data: {
        userId,
        title: dto.title,
        templateId: dto.templateId,
        sections: dto.sections as any,
      },
      include: {
        template: true,
        versions: true,
      },
    });
  }

  /**
   * Find all resumes belonging to a user, including template and versions.
   */
  async findAllByUser(userId: string) {
    return this.prisma.resume.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      include: {
        template: true,
        versions: {
          orderBy: { generatedAt: "desc" },
        },
      },
      orderBy: { updatedAt: "desc" },
    });
  }

  /**
   * Find a single resume by ID. Verifies ownership.
   */
  async findById(id: string, userId: string) {
    const resume = await this.prisma.resume.findUnique({
      where: { id },
      include: {
        template: true,
        versions: {
          orderBy: { generatedAt: "desc" },
        },
      },
    });

    if (!resume || resume.deletedAt) {
      throw new NotFoundException("Resume not found");
    }

    if (resume.userId !== userId) {
      throw new ForbiddenException("You do not own this resume");
    }

    return resume;
  }

  /**
   * Update a resume. Verifies ownership.
   */
  async update(id: string, userId: string, dto: UpdateResumeInput) {
    const resume = await this.prisma.resume.findUnique({
      where: { id },
    });

    if (!resume || resume.deletedAt) {
      throw new NotFoundException("Resume not found");
    }

    if (resume.userId !== userId) {
      throw new ForbiddenException("You do not own this resume");
    }

    return this.prisma.resume.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.templateId !== undefined && { templateId: dto.templateId }),
        ...(dto.sections !== undefined && { sections: dto.sections as any }),
      },
      include: {
        template: true,
        versions: {
          orderBy: { generatedAt: "desc" },
        },
      },
    });
  }

  /**
   * Generate a PDF for the resume.
   *
   * TODO: Integrate with @react-pdf/renderer on the frontend or a server-side
   * PDF generation library. For now, this creates a placeholder ResumeVersion
   * entry. Once PDF generation is implemented, the generated file should be
   * uploaded to Cloudflare R2 and the pdfUrl should point to the R2 public URL.
   */
  async generatePdf(id: string, userId: string) {
    const resume = await this.prisma.resume.findUnique({
      where: { id },
    });

    if (!resume || resume.deletedAt) {
      throw new NotFoundException("Resume not found");
    }

    if (resume.userId !== userId) {
      throw new ForbiddenException("You do not own this resume");
    }

    // TODO: Replace with actual PDF generation + R2 upload
    // 1. Render resume sections with the chosen template using @react-pdf/renderer
    // 2. Upload the generated PDF buffer to R2 via StorageService
    // 3. Use the returned public URL as pdfUrl
    const placeholderUrl = `https://placeholder.devcom.io/resumes/${id}/${Date.now()}.pdf`;

    const version = await this.prisma.resumeVersion.create({
      data: {
        resumeId: id,
        pdfUrl: placeholderUrl,
      },
    });

    return version;
  }

  /**
   * Find a user's public resume by username.
   * Returns the most recently updated public resume.
   */
  async findPublicResume(username: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    const resume = await this.prisma.resume.findFirst({
      where: {
        userId: user.id,
        isPublic: true,
        deletedAt: null,
      },
      include: {
        template: true,
        versions: {
          orderBy: { generatedAt: "desc" },
          take: 1,
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    if (!resume) {
      throw new NotFoundException("No public resume found for this user");
    }

    return resume;
  }
}
