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
  addCollaboratorSchema,
  addMediaSchema,
  PAGINATION,
} from "@devcom/shared";
import type {
  CreateProjectInput,
  UpdateProjectInput,
  AddCollaboratorInput,
  AddMediaInput,
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
    @Query("page") page?: string,
    @Query("limit") limit?: string,
    @Query("search") search?: string,
    @Query("status") status?: string,
    @Query("techStack") techStack?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : PAGINATION.DEFAULT_PAGE;
    const limitNum = limit
      ? Math.min(parseInt(limit, 10), PAGINATION.MAX_LIMIT)
      : PAGINATION.DEFAULT_LIMIT;

    return this.projectService.findAll(
      pageNum,
      limitNum,
      search,
      status,
      techStack,
    );
  }

  @Public()
  @Get(":slug")
  async findBySlug(@Param("slug") slug: string) {
    return this.projectService.findBySlug(slug);
  }

  @Patch(":id")
  async update(
    @Param("id") id: string,
    @CurrentUser("id") userId: string,
    @Body() body: UpdateProjectInput,
  ) {
    const dto = updateProjectSchema.parse(body);
    return this.projectService.update(id, userId, dto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async softDelete(
    @Param("id") id: string,
    @CurrentUser("id") userId: string,
  ) {
    await this.projectService.softDelete(id, userId);
  }

  @Post(":id/collaborators")
  @HttpCode(HttpStatus.CREATED)
  async addCollaborator(
    @Param("id") id: string,
    @CurrentUser("id") userId: string,
    @Body() body: AddCollaboratorInput,
  ) {
    const dto = addCollaboratorSchema.parse(body);
    return this.projectService.addCollaborator(id, userId, dto);
  }

  @Post(":id/media")
  @HttpCode(HttpStatus.CREATED)
  async addMedia(
    @Param("id") id: string,
    @CurrentUser("id") userId: string,
    @Body() body: AddMediaInput,
  ) {
    const dto = addMediaSchema.parse(body);
    return this.projectService.addMedia(id, userId, dto);
  }
}
