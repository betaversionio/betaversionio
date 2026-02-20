import * as path from "path";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";

import { PrismaModule } from "./prisma/prisma.module";
import { JwtAuthGuard } from "./common/guards/jwt-auth.guard";
import { AuthModule } from "./modules/auth/auth.module";
import { UserModule } from "./modules/user/user.module";
import { ProjectModule } from "./modules/project/project.module";
import { ResumeModule } from "./modules/resume/resume.module";
import { FeedModule } from "./modules/feed/feed.module";
import { IdeaModule } from "./modules/idea/idea.module";
import { StorageModule } from "./modules/storage/storage.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: path.resolve(__dirname, "..", "..", "..", ".env"),
    }),
    PrismaModule,
    AuthModule,
    UserModule,
    ProjectModule,
    ResumeModule,
    FeedModule,
    IdeaModule,
    StorageModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
