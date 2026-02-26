import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
  NotFoundException,
  StreamableFile,
} from "@nestjs/common";
import type { Response } from "express";
import { ResumeService } from "./resume.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Public } from "../../common/decorators/public.decorator";
import {
  createResumeSchema,
  updateResumeSchema,
  compileLatexSchema,
} from "@devcom/shared";
import type {
  CreateResumeInput,
  UpdateResumeInput,
  CompileLatexInput,
} from "@devcom/shared";

@Controller("resumes")
@UseGuards(JwtAuthGuard)
export class ResumeController {
  constructor(private readonly resumeService: ResumeService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser("id") userId: string,
    @Body() body: CreateResumeInput,
  ) {
    const dto = createResumeSchema.parse(body);
    return this.resumeService.create(userId, dto);
  }

  @Get()
  async findAll(@CurrentUser("id") userId: string) {
    return this.resumeService.findAllByUser(userId);
  }

  @Get(":id")
  async findById(
    @Param("id") id: string,
    @CurrentUser("id") userId: string,
  ) {
    return this.resumeService.findById(id, userId);
  }

  @Patch(":id")
  async update(
    @Param("id") id: string,
    @CurrentUser("id") userId: string,
    @Body() body: UpdateResumeInput,
  ) {
    const dto = updateResumeSchema.parse(body);
    return this.resumeService.update(id, userId, dto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param("id") id: string,
    @CurrentUser("id") userId: string,
  ) {
    await this.resumeService.softDelete(id, userId);
  }

  /**
   * Compile LaTeX source and return PDF binary for preview.
   */
  @Post(":id/compile")
  @HttpCode(HttpStatus.OK)
  async compileLatex(
    @Param("id") id: string,
    @CurrentUser("id") userId: string,
    @Body() body: CompileLatexInput,
    @Res({ passthrough: true }) res: Response,
  ) {
    const dto = compileLatexSchema.parse(body);
    const pdfBuffer = await this.resumeService.compileLatex(id, userId, dto);

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": "inline",
    });

    return new StreamableFile(pdfBuffer);
  }

  @Post(":id/generate-pdf")
  @HttpCode(HttpStatus.CREATED)
  async generatePdf(
    @Param("id") id: string,
    @CurrentUser("id") userId: string,
  ) {
    return this.resumeService.generatePdf(id, userId);
  }

  @Patch(":id/set-primary")
  async setPrimary(
    @Param("id") id: string,
    @CurrentUser("id") userId: string,
  ) {
    return this.resumeService.setPrimary(id, userId);
  }

  @Delete(":id/set-primary")
  @HttpCode(HttpStatus.OK)
  async unsetPrimary(
    @Param("id") id: string,
    @CurrentUser("id") userId: string,
  ) {
    return this.resumeService.unsetPrimary(id, userId);
  }

  /**
   * Public route: check if a user has a public/primary resume.
   */
  @Public()
  @Get("u/:username")
  async getPublicResumeInfo(@Param("username") username: string) {
    const resume = await this.resumeService.findPublicResume(username);
    const latestVersion = resume.versions[0];
    return {
      id: resume.id,
      title: resume.title,
      pdfUrl: latestVersion?.pdfUrl ?? null,
      generatedAt: latestVersion?.generatedAt ?? null,
    };
  }

  /**
   * Public route: redirect to the user's most recent public resume PDF.
   */
  @Public()
  @Get("u/:username/resume.pdf")
  async getPublicResumePdf(
    @Param("username") username: string,
    @Res() res: Response,
  ) {
    const resume = await this.resumeService.findPublicResume(username);
    const latestVersion = resume.versions[0];

    if (!latestVersion) {
      throw new NotFoundException(
        "No generated PDF available for this resume",
      );
    }

    return res.redirect(latestVersion.pdfUrl);
  }
}
