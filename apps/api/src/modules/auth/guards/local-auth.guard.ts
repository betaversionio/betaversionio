import { Injectable, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class LocalAuthGuard extends AuthGuard("local") {
  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    // Re-throw NestJS HTTP exceptions (e.g. ForbiddenException for unverified email)
    if (err) {
      throw err;
    }
    if (!user) {
      throw new UnauthorizedException("Invalid email or password");
    }
    return user;
  }
}
