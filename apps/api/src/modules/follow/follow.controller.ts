import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from "@nestjs/common";
import { Public } from "../../common/decorators";
import { CurrentUser } from "../../common/decorators";
import { FollowService } from "./follow.service";

@Controller("follows")
export class FollowController {
  constructor(private readonly followService: FollowService) {}

  // ── Me routes (must come before :userId routes) ──────────────────

  @Get("me/followers")
  async getMyFollowers(
    @CurrentUser("id") userId: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    return this.followService.getFollowers(
      userId,
      Math.max(1, Number(page) || 1),
      Math.min(50, Math.max(1, Number(limit) || 20)),
    );
  }

  @Get("me/following")
  async getMyFollowing(
    @CurrentUser("id") userId: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    return this.followService.getFollowing(
      userId,
      Math.max(1, Number(page) || 1),
      Math.min(50, Math.max(1, Number(limit) || 20)),
    );
  }

  @Get("me/mutuals")
  async getMyMutuals(
    @CurrentUser("id") userId: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    return this.followService.getMutuals(
      userId,
      Math.max(1, Number(page) || 1),
      Math.min(50, Math.max(1, Number(limit) || 20)),
    );
  }

  @Get("me/suggested")
  async getSuggested(
    @CurrentUser("id") userId: string,
    @Query("limit") limit?: string,
  ) {
    return this.followService.getSuggested(
      userId,
      Math.min(50, Math.max(1, Number(limit) || 10)),
    );
  }

  // ── :userId routes ───────────────────────────────────────────────

  @Post(":userId/toggle")
  @HttpCode(HttpStatus.OK)
  async toggleFollow(
    @CurrentUser("id") currentUserId: string,
    @Param("userId") targetUserId: string,
  ) {
    return this.followService.toggleFollow(currentUserId, targetUserId);
  }

  @Get(":userId/check")
  async checkFollowing(
    @CurrentUser("id") currentUserId: string,
    @Param("userId") targetUserId: string,
  ) {
    return this.followService.isFollowing(currentUserId, targetUserId);
  }

  @Public()
  @Get(":userId/counts")
  async getCounts(@Param("userId") userId: string) {
    return this.followService.getCounts(userId);
  }
}
