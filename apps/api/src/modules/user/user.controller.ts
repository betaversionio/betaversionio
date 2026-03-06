import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ProjectService } from '../project/project.service';
import {
  updateProfileSchema,
  updateSocialLinksSchema,
  updateTechStackSchema,
  updateEducationSchema,
  updateExperienceSchema,
  updateServicesSchema,
  addCustomDomainSchema,
  paginationSchema,
  respondInvitationSchema,
} from '@betaversionio/shared';
import type {
  UpdateProfileInput,
  UpdateSocialLinksInput,
  UpdateTechStackInput,
  UpdateEducationInput,
  UpdateExperienceInput,
  UpdateServicesInput,
  AddCustomDomainInput,
} from '@betaversionio/shared';

import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';

import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly projectService: ProjectService,
  ) {}

  @Get('me')
  async getMe(@CurrentUser('id') userId: string) {
    return this.userService.findById(userId);
  }

  @Patch('me/profile')
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body(new ZodValidationPipe(updateProfileSchema)) dto: UpdateProfileInput,
  ) {
    return this.userService.updateProfile(userId, dto);
  }

  @Patch('me/social-links')
  async updateSocialLinks(
    @CurrentUser('id') userId: string,
    @Body(new ZodValidationPipe(updateSocialLinksSchema))
    dto: UpdateSocialLinksInput,
  ) {
    return this.userService.updateSocialLinks(userId, dto);
  }

  @Patch('me/tech-stack')
  async updateTechStack(
    @CurrentUser('id') userId: string,
    @Body(new ZodValidationPipe(updateTechStackSchema))
    dto: UpdateTechStackInput,
  ) {
    return this.userService.updateTechStack(userId, dto);
  }

  @Patch('me/education')
  async updateEducation(
    @CurrentUser('id') userId: string,
    @Body(new ZodValidationPipe(updateEducationSchema))
    dto: UpdateEducationInput,
  ) {
    return this.userService.updateEducation(userId, dto);
  }

  @Patch('me/experience')
  async updateExperience(
    @CurrentUser('id') userId: string,
    @Body(new ZodValidationPipe(updateExperienceSchema))
    dto: UpdateExperienceInput,
  ) {
    return this.userService.updateExperience(userId, dto);
  }

  @Patch('me/services')
  async updateServices(
    @CurrentUser('id') userId: string,
    @Body(new ZodValidationPipe(updateServicesSchema)) dto: UpdateServicesInput,
  ) {
    return this.userService.updateServices(userId, dto);
  }

  // ─── Custom Domains ──────────────────────────────────────────────────────────

  @Post('me/domains')
  @HttpCode(HttpStatus.CREATED)
  async addDomain(
    @CurrentUser('id') userId: string,
    @Body(new ZodValidationPipe(addCustomDomainSchema)) dto: AddCustomDomainInput,
  ) {
    return this.userService.addCustomDomain(userId, dto);
  }

  @Post('me/domains/:domainId/verify')
  @HttpCode(HttpStatus.OK)
  async verifyDomain(
    @CurrentUser('id') userId: string,
    @Param('domainId') domainId: string,
  ) {
    return this.userService.verifyCustomDomain(userId, domainId);
  }

  @Delete('me/domains/:domainId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeDomain(
    @CurrentUser('id') userId: string,
    @Param('domainId') domainId: string,
  ) {
    await this.userService.removeCustomDomain(userId, domainId);
  }

  @Get('me/invitations')
  async getMyInvitations(@CurrentUser('id') userId: string) {
    return this.projectService.getReceivedInvitations(userId);
  }

  @Patch('me/invitations/:invitationId')
  async respondToInvitation(
    @CurrentUser('id') userId: string,
    @Param('invitationId') invitationId: string,
    @Body() body: { action: string },
  ) {
    const dto = respondInvitationSchema.parse(body);
    return this.projectService.respondToInvitation(invitationId, userId, dto);
  }

  @Public()
  @Get(':username')
  async getPublicProfile(@Param('username') username: string) {
    return this.userService.findByUsername(username);
  }

  @Public()
  @Get()
  async searchUsers(
    @Query('q') query: string = '',
    @Query('page', new ZodValidationPipe(paginationSchema.shape.page))
    page: number,
    @Query('limit', new ZodValidationPipe(paginationSchema.shape.limit))
    limit: number,
  ) {
    return this.userService.searchUsers(query, page, limit);
  }
}
