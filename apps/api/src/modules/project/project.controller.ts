import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ProjectService } from "./project.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Public } from "../../common/decorators/public.decorator";
import {
  createProjectSchema,
  updateProjectSchema,
  addMakerSchema,
  createProjectCommentSchema,
  toggleProjectVoteSchema,
  PAGINATION,
} from "@devcom/shared";
import type {
  CreateProjectInput,
  UpdateProjectInput,
  AddMakerInput,
  CreateProjectCommentInput,
  ToggleProjectVoteInput,
} from "@devcom/shared";

@Controller("projects")
@UseGuards(JwtAuthGuard)
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser("id") userId: string,
    @Body() body: CreateProjectInput,
  ) {
    const dto = createProjectSchema.parse(body);
    return this.projectService.create(userId, dto);
  }

  @Public()
  @Get()
  async findAll(
    @CurrentUser("id") userId: string | undefined,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
    @Query("search") search?: string,
    @Query("status") status?: string,
    @Query("tags") tags?: string,
    @Query("authorId") authorId?: string,
    @Query("phase") phase?: string,
    @Query("productionType") productionType?: string,
    @Query("sort") sort?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : PAGINATION.DEFAULT_PAGE;
    const limitNum = limit
      ? Math.min(parseInt(limit, 10), PAGINATION.MAX_LIMIT)
      : PAGINATION.DEFAULT_LIMIT;

    const resolvedAuthorId = authorId === "me" ? userId : authorId;

    return this.projectService.findAll(
      pageNum,
      limitNum,
      search,
      status,
      tags,
      resolvedAuthorId,
      phase,
      productionType,
      sort,
      userId,
    );
  }

  @Public()
  @Get(":slug")
  async findBySlug(
    @Param("slug") slug: string,
    @CurrentUser("id") userId: string | undefined,
  ) {
    return this.projectService.findBySlug(slug, userId);
  }

  @Patch(":slug")
  async update(
    @Param("slug") slug: string,
    @CurrentUser("id") userId: string,
    @Body() body: UpdateProjectInput,
  ) {
    const dto = updateProjectSchema.parse(body);
    return this.projectService.update(slug, userId, dto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async softDelete(
    @Param("id") id: string,
    @CurrentUser("id") userId: string,
  ) {
    await this.projectService.softDelete(id, userId);
  }

  @Post(":id/makers")
  @HttpCode(HttpStatus.CREATED)
  async addMaker(
    @Param("id") id: string,
    @CurrentUser("id") userId: string,
    @Body() body: AddMakerInput,
  ) {
    const dto = addMakerSchema.parse(body);
    return this.projectService.addMaker(id, userId, dto);
  }

  @Delete(":id/makers/:makerUserId")
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeMaker(
    @Param("id") id: string,
    @Param("makerUserId") makerUserId: string,
    @CurrentUser("id") userId: string,
  ) {
    await this.projectService.removeMaker(id, userId, makerUserId);
  }

  @Post(":id/vote")
  async toggleVote(
    @Param("id") id: string,
    @CurrentUser("id") userId: string,
    @Body() body: ToggleProjectVoteInput,
  ) {
    const dto = toggleProjectVoteSchema.parse(body);
    return this.projectService.toggleVote(id, userId, dto);
  }

  @Post(":id/comments")
  @HttpCode(HttpStatus.CREATED)
  async createComment(
    @Param("id") id: string,
    @CurrentUser("id") userId: string,
    @Body() body: CreateProjectCommentInput,
  ) {
    const dto = createProjectCommentSchema.parse(body);
    return this.projectService.createComment(id, userId, dto);
  }

  @Public()
  @Get(":id/comments")
  async getComments(
    @Param("id") id: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : PAGINATION.DEFAULT_PAGE;
    const limitNum = limit
      ? Math.min(parseInt(limit, 10), PAGINATION.MAX_LIMIT)
      : PAGINATION.DEFAULT_LIMIT;

    return this.projectService.getComments(id, pageNum, limitNum);
  }
}
