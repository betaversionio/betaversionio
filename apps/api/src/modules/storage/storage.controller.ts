import {
  Controller,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { StorageService } from "./storage.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";

interface PresignedUrlBody {
  fileName: string;
  contentType: string;
  folder: string;
}

@Controller("storage")
@UseGuards(JwtAuthGuard)
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  /**
   * Generate a presigned URL for uploading a file.
   * The key is generated as: {folder}/{userId}/{timestamp}-{fileName}
   */
  @Post("presigned-url")
  async getPresignedUrl(
    @CurrentUser("id") userId: string,
    @Body() body: PresignedUrlBody,
  ) {
    const { fileName, contentType, folder } = body;

    // Sanitize the file name (remove special characters, keep extension)
    const sanitizedName = fileName
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .toLowerCase();

    const timestamp = Date.now();
    const key = `${folder}/${userId}/${timestamp}-${sanitizedName}`;

    const url = await this.storageService.getPresignedUploadUrl(
      key,
      contentType,
    );

    return {
      url,
      key,
      publicUrl: this.storageService.getPublicUrl(key),
    };
  }

  /**
   * Delete a file from storage by its key.
   * The key is passed as a wildcard path parameter to support nested paths
   * like "projects/logos/userId/file.jpg".
   */
  @Delete("*key")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteFile(@Param("key") key: string) {
    await this.storageService.deleteFile(key);
  }
}
