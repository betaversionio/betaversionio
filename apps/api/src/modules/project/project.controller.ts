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
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import {
  createProjectSchema,
  updateProjectSchema,
  updateMakerRoleSchema,
  createProjectCommentSchema,
  updateProjectCommentSchema,
  toggleProjectVoteSchema,
  createProjectReviewSchema,
  updateProjectReviewSchema,
  createProjectUpdateSchema,
  updateProjectUpdateSchema,
  createInvitationSchema,
  PAGINATION,
} from '@betaversionio/shared';
import type {
  CreateProjectInput,
  UpdateProjectInput,
  UpdateMakerRoleInput,
  CreateProjectCommentInput,
  UpdateProjectCommentInput,
  ToggleProjectVoteInput,
  CreateProjectReviewInput,
  UpdateProjectReviewInput,
  CreateProjectUpdateInput,
  UpdateProjectUpdateInput,
  CreateInvitationInput,
} from '@betaversionio/shared';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser('id') userId: string,
    @Body() body: CreateProjectInput,
  ) {
    const dto = createProjectSchema.parse(body);
    return this.projectService.create(userId, dto);
  }

  @Public()
  @Get()
  async findAll(
    @CurrentUser('id') userId: string | undefined,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('tags') tags?: string,
    @Query('authorId') authorId?: string,
    @Query('phase') phase?: string,
    @Query('productionType') productionType?: string,
    @Query('sort') sort?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : PAGINATION.DEFAULT_PAGE;
    const limitNum = limit
      ? Math.min(parseInt(limit, 10), PAGINATION.MAX_LIMIT)
      : PAGINATION.DEFAULT_LIMIT;

    const resolvedAuthorId = authorId === 'me' ? userId : authorId;

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

  // ─── Bookmarks ────────────────────────────────────────────────────────────

  @Post('bookmarks')
  @HttpCode(HttpStatus.OK)
  async toggleBookmarkDirect(
    @CurrentUser('id') userId: string,
    @Body('projectId') projectId: string,
  ) {
    return this.projectService.toggleBookmark(projectId, userId);
  }

  @Get('bookmarks')
  async getBookmarkedProjects(
    @CurrentUser('id') userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : PAGINATION.DEFAULT_PAGE;
    const limitNum = limit
      ? Math.min(parseInt(limit, 10), PAGINATION.MAX_LIMIT)
      : PAGINATION.DEFAULT_LIMIT;
    return this.projectService.getBookmarkedProjects(userId, pageNum, limitNum);
  }

  // ─── Launch Day ───────────────────────────────────────────────────────────

  @Public()
  @Get('launching-today')
  async getLaunchingToday(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : PAGINATION.DEFAULT_PAGE;
    const limitNum = limit
      ? Math.min(parseInt(limit, 10), PAGINATION.MAX_LIMIT)
      : PAGINATION.DEFAULT_LIMIT;
    return this.projectService.getLaunchingToday(pageNum, limitNum);
  }

  @Public()
  @Get('launching-soon')
  async getLaunchingSoon(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : PAGINATION.DEFAULT_PAGE;
    const limitNum = limit
      ? Math.min(parseInt(limit, 10), PAGINATION.MAX_LIMIT)
      : PAGINATION.DEFAULT_LIMIT;
    return this.projectService.getLaunchingSoon(pageNum, limitNum);
  }

  // ─── Single project ───────────────────────────────────────────────────────

  @Public()
  @Get(':slug')
  async findBySlug(
    @Param('slug') slug: string,
    @CurrentUser('id') userId: string | undefined,
  ) {
    return this.projectService.findBySlug(slug, userId);
  }

  @Patch(':slug')
  async update(
    @Param('slug') slug: string,
    @CurrentUser('id') userId: string,
    @Body() body: UpdateProjectInput,
  ) {
    const dto = updateProjectSchema.parse(body);
    return this.projectService.update(slug, userId, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async softDelete(@Param('id') id: string, @CurrentUser('id') userId: string) {
    await this.projectService.softDelete(id, userId);
  }

  // ─── Makers ───────────────────────────────────────────────────────────────

  @Patch(':id/makers/:makerUserId')
  async updateMakerRole(
    @Param('id') id: string,
    @Param('makerUserId') makerUserId: string,
    @CurrentUser('id') userId: string,
    @Body() body: UpdateMakerRoleInput,
  ) {
    const dto = updateMakerRoleSchema.parse(body);
    return this.projectService.updateMakerRole(id, userId, makerUserId, dto);
  }

  @Delete(':id/makers/:makerUserId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeMaker(
    @Param('id') id: string,
    @Param('makerUserId') makerUserId: string,
    @CurrentUser('id') userId: string,
  ) {
    await this.projectService.removeMaker(id, userId, makerUserId);
  }

  // ─── Votes ────────────────────────────────────────────────────────────────

  @Post(':id/vote')
  async toggleVote(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() body: ToggleProjectVoteInput,
  ) {
    const dto = toggleProjectVoteSchema.parse(body);
    return this.projectService.toggleVote(id, userId, dto);
  }

  // ─── Bookmark (per project) ───────────────────────────────────────────────

  @Post(':id/bookmark')
  @HttpCode(HttpStatus.OK)
  async toggleBookmark(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.projectService.toggleBookmark(id, userId);
  }

  // ─── Comments ─────────────────────────────────────────────────────────────

  @Post(':id/comments')
  @HttpCode(HttpStatus.CREATED)
  async createComment(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() body: CreateProjectCommentInput,
  ) {
    const dto = createProjectCommentSchema.parse(body);
    return this.projectService.createComment(id, userId, dto);
  }

  @Patch(':id/comments/:commentId')
  async updateComment(
    @Param('id') id: string,
    @Param('commentId') commentId: string,
    @CurrentUser('id') userId: string,
    @Body() body: UpdateProjectCommentInput,
  ) {
    const dto = updateProjectCommentSchema.parse(body);
    return this.projectService.updateComment(id, commentId, userId, dto);
  }

  @Delete(':id/comments/:commentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteComment(
    @Param('id') id: string,
    @Param('commentId') commentId: string,
    @CurrentUser('id') userId: string,
  ) {
    await this.projectService.deleteComment(id, commentId, userId);
  }

  @Public()
  @Get(':id/comments')
  async getComments(
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : PAGINATION.DEFAULT_PAGE;
    const limitNum = limit
      ? Math.min(parseInt(limit, 10), PAGINATION.MAX_LIMIT)
      : PAGINATION.DEFAULT_LIMIT;

    return this.projectService.getComments(id, pageNum, limitNum);
  }

  // ─── Reviews ──────────────────────────────────────────────────────────────

  @Post(':id/reviews')
  @HttpCode(HttpStatus.CREATED)
  async createReview(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() body: CreateProjectReviewInput,
  ) {
    const dto = createProjectReviewSchema.parse(body);
    return this.projectService.createReview(id, userId, dto);
  }

  @Public()
  @Get(':id/reviews')
  async getReviews(
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : PAGINATION.DEFAULT_PAGE;
    const limitNum = limit
      ? Math.min(parseInt(limit, 10), PAGINATION.MAX_LIMIT)
      : PAGINATION.DEFAULT_LIMIT;
    return this.projectService.getReviews(id, pageNum, limitNum);
  }

  @Patch(':id/reviews/:reviewId')
  async updateReview(
    @Param('id') id: string,
    @Param('reviewId') reviewId: string,
    @CurrentUser('id') userId: string,
    @Body() body: UpdateProjectReviewInput,
  ) {
    const dto = updateProjectReviewSchema.parse(body);
    return this.projectService.updateReview(id, reviewId, userId, dto);
  }

  @Delete(':id/reviews/:reviewId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteReview(
    @Param('id') id: string,
    @Param('reviewId') reviewId: string,
    @CurrentUser('id') userId: string,
  ) {
    await this.projectService.deleteReview(id, reviewId, userId);
  }

  // ─── Updates / Changelog ──────────────────────────────────────────────────

  @Post(':id/updates')
  @HttpCode(HttpStatus.CREATED)
  async createProjectUpdate(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() body: CreateProjectUpdateInput,
  ) {
    const dto = createProjectUpdateSchema.parse(body);
    return this.projectService.createProjectUpdate(id, userId, dto);
  }

  @Public()
  @Get(':id/updates')
  async getProjectUpdates(
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : PAGINATION.DEFAULT_PAGE;
    const limitNum = limit
      ? Math.min(parseInt(limit, 10), PAGINATION.MAX_LIMIT)
      : PAGINATION.DEFAULT_LIMIT;
    return this.projectService.getProjectUpdates(id, pageNum, limitNum);
  }

  @Patch(':id/updates/:updateId')
  async updateProjectUpdate(
    @Param('id') id: string,
    @Param('updateId') updateId: string,
    @CurrentUser('id') userId: string,
    @Body() body: UpdateProjectUpdateInput,
  ) {
    const dto = updateProjectUpdateSchema.parse(body);
    return this.projectService.updateProjectUpdate(id, updateId, userId, dto);
  }

  @Delete(':id/updates/:updateId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteProjectUpdate(
    @Param('id') id: string,
    @Param('updateId') updateId: string,
    @CurrentUser('id') userId: string,
  ) {
    await this.projectService.deleteProjectUpdate(id, updateId, userId);
  }

  // ─── Related Projects ─────────────────────────────────────────────────────

  @Public()
  @Get(':slug/related')
  async getRelatedProjects(
    @Param('slug') slug: string,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? Math.min(parseInt(limit, 10), 10) : 4;
    return this.projectService.getRelatedProjects(slug, limitNum);
  }

  // ─── Invitations ──────────────────────────────────────────────────────────

  @Post(':id/invitations')
  @HttpCode(HttpStatus.CREATED)
  async createInvitation(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() body: CreateInvitationInput,
  ) {
    const dto = createInvitationSchema.parse(body);
    return this.projectService.createInvitation(id, userId, dto);
  }

  @Get(':id/invitations')
  async getProjectInvitations(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.projectService.getProjectInvitations(id, userId);
  }

  @Delete(':id/invitations/:invitationId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async cancelInvitation(
    @Param('id') id: string,
    @Param('invitationId') invitationId: string,
    @CurrentUser('id') userId: string,
  ) {
    await this.projectService.cancelInvitation(id, invitationId, userId);
  }

  // ─── Views / Analytics ────────────────────────────────────────────────────

  @Post(':id/view')
  @HttpCode(HttpStatus.OK)
  async recordView(
    @Param('id') id: string,
    @CurrentUser('id') userId: string | undefined,
  ) {
    await this.projectService.recordView(id, userId);
    return { recorded: true };
  }

  @Get(':id/analytics')
  async getAnalytics(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.projectService.getAnalytics(id, userId);
  }
}
