import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { LatexService } from "./latex.service";
import { StorageService } from "../storage/storage.service";
import type {
  CreateResumeInput,
  UpdateResumeInput,
  CompileLatexInput,
} from "@devcom/shared";

@Injectable()
export class ResumeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly latexService: LatexService,
    private readonly storageService: StorageService,
  ) {}

  async create(userId: string, dto: CreateResumeInput) {
    return this.prisma.resume.create({
      data: {
        userId,
        title: dto.title,
        templateId: dto.templateId,
        sections: dto.sections as any,
        latexSource: dto.latexSource,
      },
      include: {
        template: true,
        versions: true,
      },
    });
  }

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
        ...(dto.latexSource !== undefined && {
          latexSource: dto.latexSource,
        }),
        ...(dto.githubRepo !== undefined && { githubRepo: dto.githubRepo }),
        ...(dto.githubPath !== undefined && { githubPath: dto.githubPath }),
        ...(dto.githubSha !== undefined && { githubSha: dto.githubSha }),
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
   * Compile LaTeX source and return the PDF buffer (for preview, no R2 upload).
   */
  async compileLatex(id: string, userId: string, dto: CompileLatexInput) {
    const resume = await this.prisma.resume.findUnique({
      where: { id },
    });

    if (!resume || resume.deletedAt) {
      throw new NotFoundException("Resume not found");
    }

    if (resume.userId !== userId) {
      throw new ForbiddenException("You do not own this resume");
    }

    const result = await this.latexService.compile(dto.latexSource);

    if (!result.success) {
      throw new BadRequestException({
        message: "LaTeX compilation failed",
        errors: result.errors,
        log: result.log.slice(-2000),
      });
    }

    return result.pdf;
  }

  /**
   * Generate a PDF, upload to R2, and create a ResumeVersion.
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

    if (!resume.latexSource) {
      throw new BadRequestException("No LaTeX source to compile");
    }

    const result = await this.latexService.compile(resume.latexSource);

    if (!result.success) {
      throw new BadRequestException({
        message: "LaTeX compilation failed",
        errors: result.errors,
      });
    }

    const key = `resumes/${userId}/${id}/${Date.now()}.pdf`;
    const pdfUrl = await this.storageService.uploadBuffer(
      key,
      result.pdf,
      "application/pdf",
    );

    const version = await this.prisma.resumeVersion.create({
      data: {
        resumeId: id,
        pdfUrl,
      },
    });

    return version;
  }

  /**
   * Soft delete a resume.
   */
  async softDelete(id: string, userId: string) {
    const resume = await this.prisma.resume.findUnique({
      where: { id },
    });

    if (!resume || resume.deletedAt) {
      throw new NotFoundException("Resume not found");
    }

    if (resume.userId !== userId) {
      throw new ForbiddenException("You do not own this resume");
    }

    await this.prisma.resume.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async setPrimary(id: string, userId: string) {
    const resume = await this.prisma.resume.findUnique({
      where: { id },
    });

    if (!resume || resume.deletedAt) {
      throw new NotFoundException("Resume not found");
    }

    if (resume.userId !== userId) {
      throw new ForbiddenException("You do not own this resume");
    }

    // Unset all other resumes as non-primary for this user
    await this.prisma.resume.updateMany({
      where: { userId, isPrimary: true },
      data: { isPrimary: false },
    });

    // Set the target resume as primary (also make it public)
    return this.prisma.resume.update({
      where: { id },
      data: { isPrimary: true, isPublic: true },
      include: {
        template: true,
        versions: {
          orderBy: { generatedAt: "desc" },
        },
      },
    });
  }

  async unsetPrimary(id: string, userId: string) {
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
      data: { isPrimary: false },
      include: {
        template: true,
        versions: {
          orderBy: { generatedAt: "desc" },
        },
      },
    });
  }

  async findPublicResume(username: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    // Prefer the primary resume; fall back to any public one
    const resume = await this.prisma.resume.findFirst({
      where: {
        userId: user.id,
        deletedAt: null,
        OR: [{ isPrimary: true }, { isPublic: true }],
      },
      include: {
        template: true,
        versions: {
          orderBy: { generatedAt: "desc" },
          take: 1,
        },
      },
      orderBy: [{ isPrimary: "desc" }, { updatedAt: "desc" }],
    });

    if (!resume) {
      throw new NotFoundException("No public resume found for this user");
    }

    return resume;
  }
}
