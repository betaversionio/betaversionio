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
import { CollectionService } from "./collection.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Public } from "../../common/decorators/public.decorator";
import {
  createCollectionSchema,
  updateCollectionSchema,
  addCollectionItemSchema,
  PAGINATION,
} from "@devcom/shared";
import type {
  CreateCollectionInput,
  UpdateCollectionInput,
  AddCollectionItemInput,
} from "@devcom/shared";

@Controller("collections")
@UseGuards(JwtAuthGuard)
export class CollectionController {
  constructor(private readonly collectionService: CollectionService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser("id") userId: string,
    @Body() body: CreateCollectionInput,
  ) {
    const dto = createCollectionSchema.parse(body);
    return this.collectionService.create(userId, dto);
  }

  @Public()
  @Get()
  async findAll(
    @Query("page") page?: string,
    @Query("limit") limit?: string,
    @Query("authorId") authorId?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : PAGINATION.DEFAULT_PAGE;
    const limitNum = limit
      ? Math.min(parseInt(limit, 10), PAGINATION.MAX_LIMIT)
      : PAGINATION.DEFAULT_LIMIT;
    return this.collectionService.findAll(pageNum, limitNum, authorId);
  }

  @Public()
  @Get(":slug")
  async findBySlug(@Param("slug") slug: string) {
    return this.collectionService.findBySlug(slug);
  }

  @Patch(":slug")
  async update(
    @Param("slug") slug: string,
    @CurrentUser("id") userId: string,
    @Body() body: UpdateCollectionInput,
  ) {
    const dto = updateCollectionSchema.parse(body);
    return this.collectionService.update(slug, userId, dto);
  }

  @Delete(":slug")
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @Param("slug") slug: string,
    @CurrentUser("id") userId: string,
  ) {
    await this.collectionService.delete(slug, userId);
  }

  @Post(":id/items")
  @HttpCode(HttpStatus.CREATED)
  async addItem(
    @Param("id") id: string,
    @CurrentUser("id") userId: string,
    @Body() body: AddCollectionItemInput,
  ) {
    const dto = addCollectionItemSchema.parse(body);
    return this.collectionService.addItem(id, userId, dto);
  }

  @Delete(":id/items/:itemId")
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeItem(
    @Param("id") id: string,
    @Param("itemId") itemId: string,
    @CurrentUser("id") userId: string,
  ) {
    await this.collectionService.removeItem(id, itemId, userId);
  }

  @Patch(":id/reorder")
  async reorderItems(
    @Param("id") id: string,
    @CurrentUser("id") userId: string,
    @Body("itemIds") itemIds: string[],
  ) {
    await this.collectionService.reorderItems(id, userId, itemIds);
    return { success: true };
  }
}
