import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { FeedService } from "./feed.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Public } from "../../common/decorators/public.decorator";
import {
  createPostSchema,
  createCommentSchema,
  toggleReactionSchema,
  FEED,
} from "@devcom/shared";
import type {
  CreatePostInput,
  CreateCommentInput,
  ToggleReactionInput,
} from "@devcom/shared";

@Controller("posts")
@UseGuards(JwtAuthGuard)
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createPost(
    @CurrentUser("id") userId: string,
    @Body() body: CreatePostInput,
  ) {
    const dto = createPostSchema.parse(body);
    return this.feedService.createPost(userId, dto);
  }

  @Public()
  @Get("feed")
  async getFeed(
    @Query("cursor") cursor?: string,
    @Query("limit") limit?: string,
  ) {
    const limitNum = limit
      ? Math.min(parseInt(limit, 10), FEED.MAX_CURSOR_LIMIT)
      : FEED.DEFAULT_CURSOR_LIMIT;

    return this.feedService.getFeed(cursor, limitNum);
  }

  @Public()
  @Get(":id")
  async getPostById(@Param("id") id: string) {
    return this.feedService.getPostById(id);
  }

  @Post(":id/reactions")
  async toggleReaction(
    @Param("id") id: string,
    @CurrentUser("id") userId: string,
    @Body() body: ToggleReactionInput,
  ) {
    const dto = toggleReactionSchema.parse(body);
    return this.feedService.toggleReaction(id, userId, dto);
  }

  @Post(":id/comments")
  @HttpCode(HttpStatus.CREATED)
  async createComment(
    @Param("id") id: string,
    @CurrentUser("id") userId: string,
    @Body() body: CreateCommentInput,
  ) {
    const dto = createCommentSchema.parse(body);
    return this.feedService.createComment(id, userId, dto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async softDeletePost(
    @Param("id") id: string,
    @CurrentUser("id") userId: string,
  ) {
    await this.feedService.softDeletePost(id, userId);
  }
}
