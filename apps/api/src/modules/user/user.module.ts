import { Module } from "@nestjs/common";

import { PrismaModule } from "../../prisma/prisma.module";
import { ProjectModule } from "../project/project.module";

import { UserService } from "./user.service";
import { UserController } from "./user.controller";

@Module({
  imports: [PrismaModule, ProjectModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
