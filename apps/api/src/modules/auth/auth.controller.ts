import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import {
  registerSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  changeUsernameSchema,
  setPasswordSchema,
} from '@betaversionio/shared';
import type {
  RegisterInput,
  VerifyEmailInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  ChangePasswordInput,
  ChangeUsernameInput,
  SetPasswordInput,
} from '@betaversionio/shared';

import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';

import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';

const ACCESS_TOKEN_COOKIE = 'access_token';
const REFRESH_TOKEN_COOKIE = 'refresh_token';
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const FIFTEEN_DAYS_MS = 15 * 24 * 60 * 60 * 1000;

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  // ── POST /auth/register ───────────────────────────────────────────────────

  @Public()
  @Post('register')
  async register(
    @Body(new ZodValidationPipe(registerSchema)) dto: RegisterInput,
  ) {
    return this.authService.register(dto);
  }

  // ── POST /auth/login ──────────────────────────────────────────────────────

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Req()
    req: Request & {
      user: { id: string; email: string; username: string; name: string };
    },
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(req.user);
    this.setTokenCookies(res, result.tokens);
    return result;
  }

  // ── POST /auth/verify-email ───────────────────────────────────────────────

  @Public()
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(
    @Body(new ZodValidationPipe(verifyEmailSchema)) dto: VerifyEmailInput,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.verifyEmail(dto.token);
    this.setTokenCookies(res, result.tokens);
    return result;
  }

  // ── POST /auth/resend-verification ────────────────────────────────────────

  @Public()
  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  async resendVerification(
    @Body(new ZodValidationPipe(forgotPasswordSchema)) dto: ForgotPasswordInput,
  ) {
    return this.authService.resendVerification(dto.email);
  }

  // ── POST /auth/forgot-password ────────────────────────────────────────────

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(
    @Body(new ZodValidationPipe(forgotPasswordSchema)) dto: ForgotPasswordInput,
  ) {
    return this.authService.forgotPassword(dto.email);
  }

  // ── POST /auth/reset-password ─────────────────────────────────────────────

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body(new ZodValidationPipe(resetPasswordSchema)) dto: ResetPasswordInput,
  ) {
    return this.authService.resetPassword(dto.token, dto.password);
  }

  // ── POST /auth/change-password ────────────────────────────────────────────

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @CurrentUser('id') userId: string,
    @Body(new ZodValidationPipe(changePasswordSchema)) dto: ChangePasswordInput,
  ) {
    return this.authService.changePassword(
      userId,
      dto.currentPassword,
      dto.newPassword,
    );
  }

  // ── POST /auth/set-password ───────────────────────────────────────────────

  @Post('set-password')
  @HttpCode(HttpStatus.OK)
  async setPassword(
    @CurrentUser('id') userId: string,
    @Body(new ZodValidationPipe(setPasswordSchema)) dto: SetPasswordInput,
  ) {
    return this.authService.setPassword(userId, dto.password);
  }

  // ── POST /auth/change-username ────────────────────────────────────────────

  @Post('change-username')
  @HttpCode(HttpStatus.OK)
  async changeUsername(
    @CurrentUser('id') userId: string,
    @Body(new ZodValidationPipe(changeUsernameSchema)) dto: ChangeUsernameInput,
  ) {
    return this.authService.changeUsername(userId, dto.username);
  }

  // ── GET /auth/check-username/:username ────────────────────────────────────

  @Public()
  @Get('check-username/:username')
  async checkUsername(@Param('username') username: string) {
    return this.authService.checkUsername(username);
  }

  // ── POST /auth/github ────────────────────────────────────────────────────

  @Public()
  @Post('github')
  @HttpCode(HttpStatus.OK)
  async githubAuth(
    @Body('code') code: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.githubLogin(code);
    this.setTokenCookies(res, result.tokens);
    return result;
  }

  // ── POST /auth/google ────────────────────────────────────────────────────

  @Public()
  @Post('google')
  @HttpCode(HttpStatus.OK)
  async googleAuth(
    @Body('accessToken') accessToken: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.googleLogin(accessToken);
    this.setTokenCookies(res, result.tokens);
    return result;
  }

  // ── POST /auth/refresh ────────────────────────────────────────────────────

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshTokens(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body('refreshToken') bodyRefreshToken?: string,
  ) {
    // Read refresh token from cookie first, then fallback to body
    const refreshToken =
      (req.cookies?.[REFRESH_TOKEN_COOKIE] as string) || bodyRefreshToken;

    if (!refreshToken) {
      throw new Error('Refresh token is required');
    }

    // Decode the refresh token to extract userId
    // (we need the userId to look up and compare the stored hash)
    let userId: string;
    try {
      const payload = this.authService['jwtService'].decode(refreshToken) as {
        sub: string;
      };
      userId = payload.sub;
    } catch {
      throw new Error('Invalid refresh token');
    }

    const result = await this.authService.refreshTokens(refreshToken, userId);

    // Set rotated token cookies
    this.setTokenCookies(res, result.tokens);

    return result;
  }

  // ── POST /auth/logout ─────────────────────────────────────────────────────

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @CurrentUser('id') userId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logout(userId);
    this.clearTokenCookies(res);
    return { message: 'Logged out successfully' };
  }

  // ── GET /auth/me ──────────────────────────────────────────────────────────

  @Get('me')
  async getMe(@CurrentUser('id') userId: string) {
    return this.authService.getMe(userId);
  }

  // ── Private Helpers ───────────────────────────────────────────────────────

  private get isSecure(): boolean {
    return this.configService.get<string>('NODE_ENV') === 'production';
  }

  private setTokenCookies(
    res: Response,
    tokens: { accessToken: string; refreshToken: string },
  ) {
    // Access token — NOT httpOnly so the frontend can read it on page load
    // to avoid an unnecessary refresh call. Short-lived (15m).
    res.cookie(ACCESS_TOKEN_COOKIE, tokens.accessToken, {
      httpOnly: false,
      secure: this.isSecure,
      sameSite: 'lax',
      path: '/',
      maxAge: SEVEN_DAYS_MS,
    });

    // Refresh token — httpOnly so it's never accessible to JS (XSS-safe)
    res.cookie(REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
      httpOnly: true,
      secure: this.isSecure,
      sameSite: 'lax',
      path: '/',
      maxAge: FIFTEEN_DAYS_MS,
    });
  }

  private clearTokenCookies(res: Response) {
    const shared = {
      secure: this.isSecure,
      sameSite: 'lax' as const,
      path: '/',
    };
    res.clearCookie(ACCESS_TOKEN_COOKIE, { ...shared, httpOnly: false });
    res.clearCookie(REFRESH_TOKEN_COOKIE, { ...shared, httpOnly: true });
  }
}
