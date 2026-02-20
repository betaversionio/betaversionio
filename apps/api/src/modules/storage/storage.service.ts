import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly publicUrl: string;

  constructor(private readonly configService: ConfigService) {
    const accountId = this.configService.get<string>("R2_ACCOUNT_ID");
    const accessKeyId = this.configService.get<string>("R2_ACCESS_KEY_ID");
    const secretAccessKey = this.configService.get<string>(
      "R2_SECRET_ACCESS_KEY",
    );

    this.bucketName = this.configService.get<string>("R2_BUCKET_NAME")!;
    this.publicUrl = this.configService.get<string>("R2_PUBLIC_URL")!;

    this.s3Client = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: accessKeyId!,
        secretAccessKey: secretAccessKey!,
      },
    });

    this.logger.log("StorageService initialized with Cloudflare R2");
  }

  /**
   * Generate a presigned URL for uploading a file to R2.
   * The URL expires after 15 minutes.
   *
   * @param key - The storage key (path) for the file
   * @param contentType - The MIME type of the file
   * @param maxSize - The maximum file size in bytes
   * @returns The presigned upload URL
   */
  async getPresignedUploadUrl(
    key: string,
    contentType: string,
    maxSize: number,
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: contentType,
      ContentLength: maxSize,
    });

    const url = await getSignedUrl(this.s3Client, command, {
      expiresIn: 900, // 15 minutes
    });

    return url;
  }

  /**
   * Delete a file from R2.
   *
   * @param key - The storage key (path) of the file to delete
   */
  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    await this.s3Client.send(command);
    this.logger.log(`Deleted file: ${key}`);
  }

  /**
   * Get the public URL for an uploaded file.
   *
   * @param key - The storage key (path) of the file
   * @returns The full public URL
   */
  getPublicUrl(key: string): string {
    return `${this.publicUrl}/${key}`;
  }
}
