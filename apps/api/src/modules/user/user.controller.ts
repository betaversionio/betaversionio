import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  Query,
  UsePipes,
} from "@nestjs/common";
import {
  updateProfileSchema,
  updateSocialLinksSchema,
  updateTechStackSchema,
  paginationSchema,
} from "@devcom/shared";
import type {
  UpdateProfileInput,
  UpdateSocialLinksInput,
  UpdateTechStackInput,
} from "@devcom/shared";

import { Public } from "../../common/decorators/public.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";

import { UserService } from "./user.service";

@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get("me")
  async getMe(@CurrentUser("id") userId: string) {
    return this.userService.findById(userId);
  }

  @Patch("me/profile")
  @UsePipes(new ZodValidationPipe(updateProfileSchema))
  async updateProfile(
    @CurrentUser("id") userId: string,
    @Body() dto: UpdateProfileInput,
  ) {
    return this.userService.updateProfile(userId, dto);
  }

  @Patch("me/social-links")
  @UsePipes(new ZodValidationPipe(updateSocialLinksSchema))
  async updateSocialLinks(
    @CurrentUser("id") userId: string,
    @Body() dto: UpdateSocialLinksInput,
  ) {
    return this.userService.updateSocialLinks(userId, dto);
  }

  @Patch("me/tech-stack")
  @UsePipes(new ZodValidationPipe(updateTechStackSchema))
  async updateTechStack(
    @CurrentUser("id") userId: string,
    @Body() dto: UpdateTechStackInput,
  ) {
    return this.userService.updateTechStack(userId, dto);
  }

  @Public()
  @Get(":username")
  async getPublicProfile(@Param("username") username: string) {
    return this.userService.findByUsername(username);
  }

  @Public()
  @Get()
  async searchUsers(
    @Query("q") query: string = "",
    @Query("page", new ZodValidationPipe(paginationSchema.shape.page))
    page: number,
    @Query("limit", new ZodValidationPipe(paginationSchema.shape.limit))
    limit: number,
  ) {
    return this.userService.searchUsers(query, page, limit);
  }
}
