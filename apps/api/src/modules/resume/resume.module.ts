import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { ResumeController } from "./resume.controller";
import { ResumeService } from "./resume.service";
import { LatexService } from "./latex.service";
import { StorageModule } from "../storage/storage.module";

@Module({
  imports: [ConfigModule, StorageModule],
  controllers: [ResumeController],
  providers: [ResumeService, LatexService],
  exports: [ResumeService],
})
export class ResumeModule {}
