import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { IdeaService } from "./idea.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Public } from "../../common/decorators/public.decorator";
import {
  createIdeaSchema,
  updateIdeaSchema,
  createApplicationSchema,
  PAGINATION,
} from "@devcom/shared";
import type {
  CreateIdeaInput,
  UpdateIdeaInput,
  CreateApplicationInput,
} from "@devcom/shared";

@Controller("ideas")
@UseGuards(JwtAuthGuard)
export class IdeaController {
  constructor(private readonly ideaService: IdeaService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser("id") userId: string,
    @Body() body: CreateIdeaInput,
  ) {
    const dto = createIdeaSchema.parse(body);
    return this.ideaService.create(userId, dto);
  }

  @Public()
  @Get()
  async findAll(
    @Query("page") page?: string,
    @Query("limit") limit?: string,
    @Query("search") search?: string,
    @Query("stage") stage?: string,
    @Query("techStack") techStack?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : PAGINATION.DEFAULT_PAGE;
    const limitNum = limit
      ? Math.min(parseInt(limit, 10), PAGINATION.MAX_LIMIT)
      : PAGINATION.DEFAULT_LIMIT;

    return this.ideaService.findAll(
      pageNum,
      limitNum,
      search,
      stage,
      techStack,
    );
  }

  @Public()
  @Get(":id")
  async findById(@Param("id") id: string) {
    return this.ideaService.findById(id);
  }

  @Patch(":id")
  async update(
    @Param("id") id: string,
    @CurrentUser("id") userId: string,
    @Body() body: UpdateIdeaInput,
  ) {
    const dto = updateIdeaSchema.parse(body);
    return this.ideaService.update(id, userId, dto);
  }

  @Post(":id/vote")
  async toggleVote(
    @Param("id") id: string,
    @CurrentUser("id") userId: string,
  ) {
    return this.ideaService.toggleVote(id, userId);
  }

  @Post(":id/applications")
  @HttpCode(HttpStatus.CREATED)
  async apply(
    @Param("id") id: string,
    @CurrentUser("id") userId: string,
    @Body() body: CreateApplicationInput,
  ) {
    const dto = createApplicationSchema.parse(body);
    return this.ideaService.applyToIdea(id, userId, dto);
  }

  @Post(":id/convert-to-project")
  async convertToProject(
    @Param("id") id: string,
    @CurrentUser("id") userId: string,
  ) {
    return this.ideaService.convertToProject(id, userId);
  }
}
