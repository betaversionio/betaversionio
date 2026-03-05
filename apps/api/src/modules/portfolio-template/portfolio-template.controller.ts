import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import {
  paginationSchema,
  createPortfolioTemplateSchema,
  updatePortfolioTemplateSchema,
  selectPortfolioTemplateSchema,
} from '@betaversionio/shared';
import type {
  CreatePortfolioTemplateInput,
  UpdatePortfolioTemplateInput,
  SelectPortfolioTemplateInput,
} from '@betaversionio/shared';

import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';

import { PortfolioTemplateService } from './portfolio-template.service';

@Controller('portfolio-templates')
export class PortfolioTemplateController {
  constructor(
    private readonly portfolioTemplateService: PortfolioTemplateService,
  ) {}

  @Public()
  @Get()
  async findAll(
    @Query('page', new ZodValidationPipe(paginationSchema.shape.page))
    page: number,
    @Query('limit', new ZodValidationPipe(paginationSchema.shape.limit))
    limit: number,
    @Query('search') search?: string,
    @Query('tags') tags?: string,
    @Query('featured') featured?: string,
  ) {
    return this.portfolioTemplateService.findAll(
      page,
      limit,
      search,
      tags ? tags.split(',') : undefined,
      featured !== undefined ? featured === 'true' : undefined,
    );
  }

  @Get('mine')
  async findMine(
    @CurrentUser('id') userId: string,
    @Query('status') status?: string,
    @Query('page', new ZodValidationPipe(paginationSchema.shape.page))
    page?: number,
    @Query('limit', new ZodValidationPipe(paginationSchema.shape.limit))
    limit?: number,
  ) {
    return this.portfolioTemplateService.findByAuthor(
      userId,
      status,
      page,
      limit,
    );
  }

  @Public()
  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.portfolioTemplateService.findById(id);
  }

  @Post()
  async create(
    @CurrentUser('id') userId: string,
    @Body(new ZodValidationPipe(createPortfolioTemplateSchema))
    dto: CreatePortfolioTemplateInput,
  ) {
    return this.portfolioTemplateService.create(userId, dto);
  }

  @Patch('select')
  async selectTemplate(
    @CurrentUser('id') userId: string,
    @Body(new ZodValidationPipe(selectPortfolioTemplateSchema))
    dto: SelectPortfolioTemplateInput,
  ) {
    return this.portfolioTemplateService.selectTemplate(
      userId,
      dto.portfolioTemplateId,
    );
  }

  @Patch(':id')
  async update(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updatePortfolioTemplateSchema))
    dto: UpdatePortfolioTemplateInput,
  ) {
    return this.portfolioTemplateService.update(id, userId, dto);
  }

  @Delete(':id')
  async remove(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.portfolioTemplateService.remove(id, userId);
  }
}
