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
import { BlogService } from './blog.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import {
  createBlogSchema,
  updateBlogSchema,
  toggleBlogVoteSchema,
  createBlogCommentSchema,
  updateBlogCommentSchema,
  PAGINATION,
} from '@devcom/shared';
import type {
  CreateBlogInput,
  UpdateBlogInput,
  ToggleBlogVoteInput,
  CreateBlogCommentInput,
  UpdateBlogCommentInput,
} from '@devcom/shared';

@Controller('blogs')
@UseGuards(JwtAuthGuard)
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser('id') userId: string,
    @Body() body: CreateBlogInput,
  ) {
    const dto = createBlogSchema.parse(body);
    return this.blogService.create(userId, dto);
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
    @Query('sort') sort?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : PAGINATION.DEFAULT_PAGE;
    const limitNum = limit
      ? Math.min(parseInt(limit, 10), PAGINATION.MAX_LIMIT)
      : PAGINATION.DEFAULT_LIMIT;

    const resolvedAuthorId = authorId === 'me' ? userId : authorId;

    return this.blogService.findAll(
      pageNum,
      limitNum,
      search,
      status,
      tags,
      resolvedAuthorId,
      sort,
      userId,
    );
  }

  @Public()
  @Get(':slug')
  async findBySlug(
    @Param('slug') slug: string,
    @CurrentUser('id') userId: string | undefined,
  ) {
    return this.blogService.findBySlug(slug, userId);
  }

  @Patch(':slug')
  async update(
    @Param('slug') slug: string,
    @CurrentUser('id') userId: string,
    @Body() body: UpdateBlogInput,
  ) {
    const dto = updateBlogSchema.parse(body);
    return this.blogService.update(slug, userId, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async softDelete(@Param('id') id: string, @CurrentUser('id') userId: string) {
    await this.blogService.softDelete(id, userId);
  }

  @Post(':id/view')
  @HttpCode(HttpStatus.OK)
  async recordView(
    @Param('id') id: string,
    @CurrentUser('id') userId: string | undefined,
  ) {
    await this.blogService.recordView(id, userId);
    return { recorded: true };
  }

  // ─── Votes ──────────────────────────────────────────────────────────────────

  @Post(':id/vote')
  async toggleVote(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() body: ToggleBlogVoteInput,
  ) {
    const dto = toggleBlogVoteSchema.parse(body);
    return this.blogService.toggleVote(id, userId, dto);
  }

  // ─── Comments ───────────────────────────────────────────────────────────────

  @Post(':id/comments')
  @HttpCode(HttpStatus.CREATED)
  async createComment(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() body: CreateBlogCommentInput,
  ) {
    const dto = createBlogCommentSchema.parse(body);
    return this.blogService.createComment(id, userId, dto);
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

    return this.blogService.getComments(id, pageNum, limitNum);
  }

  @Patch(':id/comments/:commentId')
  async updateComment(
    @Param('id') id: string,
    @Param('commentId') commentId: string,
    @CurrentUser('id') userId: string,
    @Body() body: UpdateBlogCommentInput,
  ) {
    const dto = updateBlogCommentSchema.parse(body);
    return this.blogService.updateComment(id, commentId, userId, dto);
  }

  @Delete(':id/comments/:commentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteComment(
    @Param('id') id: string,
    @Param('commentId') commentId: string,
    @CurrentUser('id') userId: string,
  ) {
    await this.blogService.deleteComment(id, commentId, userId);
  }
}
