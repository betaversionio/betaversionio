import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Request, Response } from "express";
import { registerSchema } from "@devcom/shared";
import type { RegisterInput } from "@devcom/shared";

import { Public } from "../../common/decorators/public.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";

import { AuthService } from "./auth.service";
import { LocalAuthGuard } from "./guards/local-auth.guard";
import { GithubAuthGuard } from "./guards/github-auth.guard";

const REFRESH_TOKEN_COOKIE = "refresh_token";
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  // ── POST /auth/register ───────────────────────────────────────────────────

  @Public()
  @Post("register")
  async register(
    @Body(new ZodValidationPipe(registerSchema)) dto: RegisterInput,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.register(dto);
    this.setRefreshTokenCookie(res, result.tokens.refreshToken);
    return result;
  }

  // ── POST /auth/login ──────────────────────────────────────────────────────

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(
    @Req() req: Request & { user: { id: string; email: string; username: string; name: string } },
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(req.user);
    this.setRefreshTokenCookie(res, result.tokens.refreshToken);
    return result;
  }

  // ── GET /auth/github ──────────────────────────────────────────────────────

  @Public()
  @UseGuards(GithubAuthGuard)
  @Get("github")
  async githubAuth() {
    // Guard redirects to GitHub OAuth page
  }

  // ── GET /auth/github/callback ─────────────────────────────────────────────

  @Public()
  @UseGuards(GithubAuthGuard)
  @Get("github/callback")
  async githubAuthCallback(
    @Req()
    req: Request & {
      user: {
        user: { id: string; email: string; username: string; name: string };
        tokens: { accessToken: string; refreshToken: string };
      };
    },
    @Res() res: Response,
  ) {
    const { tokens } = req.user;

    // Set refresh token as httpOnly cookie
    this.setRefreshTokenCookie(res, tokens.refreshToken);

    // Redirect to frontend with access token
    const frontendUrl =
      this.configService.get<string>("NEXT_PUBLIC_APP_URL") ||
      "http://localhost:3000";

    res.redirect(
      `${frontendUrl}/auth/callback?accessToken=${tokens.accessToken}`,
    );
  }

  // ── POST /auth/refresh ────────────────────────────────────────────────────

  @Public()
  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  async refreshTokens(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body("refreshToken") bodyRefreshToken?: string,
  ) {
    // Read refresh token from cookie first, then fallback to body
    const refreshToken =
      (req.cookies?.[REFRESH_TOKEN_COOKIE] as string) || bodyRefreshToken;

    if (!refreshToken) {
      throw new Error("Refresh token is required");
    }

    // Decode the refresh token to extract userId
    // (we need the userId to look up and compare the stored hash)
    let userId: string;
    try {
      const payload = this.authService["jwtService"].decode(refreshToken) as {
        sub: string;
      };
      userId = payload.sub;
    } catch {
      throw new Error("Invalid refresh token");
    }

    const result = await this.authService.refreshTokens(refreshToken, userId);

    // Set the rotated refresh token cookie so subsequent refreshes work
    this.setRefreshTokenCookie(res, result.tokens.refreshToken);

    return result;
  }

  // ── POST /auth/logout ─────────────────────────────────────────────────────

  @Post("logout")
  @HttpCode(HttpStatus.OK)
  async logout(
    @CurrentUser("id") userId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logout(userId);

    // Clear the refresh token cookie
    res.clearCookie(REFRESH_TOKEN_COOKIE, {
      httpOnly: true,
      secure:
        this.configService.get<string>("NODE_ENV") === "production",
      sameSite: "lax",
      path: "/api/v1/auth",
    });

    return { message: "Logged out successfully" };
  }

  // ── GET /auth/me ──────────────────────────────────────────────────────────

  @Get("me")
  async getMe(@CurrentUser("id") userId: string) {
    return this.authService.getMe(userId);
  }

  // ── Private Helpers ───────────────────────────────────────────────────────

  private setRefreshTokenCookie(res: Response, refreshToken: string) {
    res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
      httpOnly: true,
      secure:
        this.configService.get<string>("NODE_ENV") === "production",
      sameSite: "lax",
      path: "/api/v1/auth",
      maxAge: SEVEN_DAYS_MS,
    });
  }
}
