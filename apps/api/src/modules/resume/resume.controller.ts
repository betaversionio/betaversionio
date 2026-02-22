import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from "@nestjs/common";
import type { Response } from "express";
import { ResumeService } from "./resume.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Public } from "../../common/decorators/public.decorator";
import { createResumeSchema, updateResumeSchema } from "@devcom/shared";
import type { CreateResumeInput, UpdateResumeInput } from "@devcom/shared";

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

  @Post(":id/generate-pdf")
  @HttpCode(HttpStatus.CREATED)
  async generatePdf(
    @Param("id") id: string,
    @CurrentUser("id") userId: string,
  ) {
    return this.resumeService.generatePdf(id, userId);
  }

  /**
   * Public route: redirect to the user's most recent public resume PDF.
   * Accessible at GET /resumes/u/:username/resume.pdf
   */
  @Public()
  @Get("u/:username/resume.pdf")
  async getPublicResumePdf(
    @Param("username") username: string,
    @Res() res: Response,
  ) {
    const resume = await this.resumeService.findPublicResume(username);

    // Get the latest generated PDF version
    const latestVersion = resume.versions[0];

    if (!latestVersion) {
      throw new NotFoundException(
        "No generated PDF available for this resume",
      );
    }

    // Redirect to the hosted PDF URL
    return res.redirect(latestVersion.pdfUrl);
  }
}
