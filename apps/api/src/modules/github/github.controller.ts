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
import { GitHubService } from "./github.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { connectGithubSchema, pushFileSchema } from "@devcom/shared";
import type { ConnectGithubInput, PushFileInput } from "@devcom/shared";

@Controller("github")
@UseGuards(JwtAuthGuard)
export class GitHubController {
  constructor(private readonly githubService: GitHubService) {}

  @Post("connect")
  @HttpCode(HttpStatus.OK)
  async connect(
    @CurrentUser("id") userId: string,
    @Body() body: ConnectGithubInput,
  ) {
    const dto = connectGithubSchema.parse(body);
    return this.githubService.connectGitHub(userId, dto.installationId);
  }

  @Delete("connect")
  @HttpCode(HttpStatus.NO_CONTENT)
  async disconnect(@CurrentUser("id") userId: string) {
    await this.githubService.disconnectGitHub(userId);
  }

  @Get("status")
  async getStatus(@CurrentUser("id") userId: string) {
    return this.githubService.getStatus(userId);
  }

  @Get("repos")
  async listRepos(@CurrentUser("id") userId: string) {
    return this.githubService.listRepos(userId);
  }

  @Get("repos/:owner/:repo/contents")
  async listContents(
    @CurrentUser("id") userId: string,
    @Param("owner") owner: string,
    @Param("repo") repo: string,
    @Query("path") path?: string,
  ) {
    return this.githubService.listContents(userId, owner, repo, path || "");
  }

  @Get("repos/:owner/:repo/file")
  async getFileContent(
    @CurrentUser("id") userId: string,
    @Param("owner") owner: string,
    @Param("repo") repo: string,
    @Query("path") path: string,
  ) {
    return this.githubService.getFileContent(userId, owner, repo, path);
  }

  @Post("repos/:owner/:repo/push")
  @HttpCode(HttpStatus.OK)
  async pushFile(
    @CurrentUser("id") userId: string,
    @Param("owner") owner: string,
    @Param("repo") repo: string,
    @Body() body: PushFileInput,
  ) {
    const dto = pushFileSchema.parse(body);
    return this.githubService.pushFile(
      userId,
      owner,
      repo,
      dto.path,
      dto.content,
      dto.message,
      dto.sha,
    );
  }
}
