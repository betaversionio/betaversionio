import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { GitHubController } from "./github.controller";
import { GitHubService } from "./github.service";
import { GitHubAppService } from "./github-app.service";

@Module({
  imports: [ConfigModule],
  controllers: [GitHubController],
  providers: [GitHubService, GitHubAppService],
  exports: [GitHubService],
})
export class GitHubModule {}
