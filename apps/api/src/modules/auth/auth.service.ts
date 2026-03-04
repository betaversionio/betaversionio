import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import type { RegisterInput } from '@betaversionio/shared';

import { PrismaService } from '../../prisma/prisma.service';
import { UserService } from '../user/user.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  private readonly BCRYPT_ROUNDS = 10;

  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {}

  // ── Register ──────────────────────────────────────────────────────────────

  async register(dto: RegisterInput) {
    // Check for existing email
    const existingEmail = await this.userService.findByEmail(dto.email);
    if (existingEmail) {
      throw new ConflictException('Email is already registered');
    }

    // Check for existing username
    const existingUsername = await this.prisma.user.findUnique({
      where: { username: dto.username },
    });
    if (existingUsername) {
      throw new ConflictException('Username is already taken');
    }

    // Hash password
    const passwordHash = await this.hashData(dto.password);

    // Create user with profile in a transaction
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        username: dto.username,
        name: dto.name,
        passwordHash,
        profile: {
          create: {},
        },
      },
      include: {
        profile: true,
      },
    });

    // Generate email verification token
    const token = crypto.randomBytes(32).toString('hex');
    await this.prisma.verificationToken.create({
      data: {
        token,
        type: 'EMAIL_VERIFY',
        userId: user.id,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    });

    // Send verification email (fire and forget — don't block registration)
    this.mailService
      .sendVerificationEmail(user.email, user.name, token)
      .catch(() => {});

    return {
      message: 'Verification email sent. Please check your inbox.',
    };
  }

  // ── Login ─────────────────────────────────────────────────────────────────

  async login(user: {
    id: string;
    email: string;
    username: string;
    name: string;
  }) {
    const tokens = await this.generateTokens(user.id, user.email);

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
      },
      tokens,
    };
  }

  // ── Validate User (for Local Strategy) ────────────────────────────────────

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.passwordHash) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return null;
    }

    // Check email verification
    if (!user.emailVerified) {
      throw new ForbiddenException(
        'Please verify your email before logging in',
      );
    }

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
    };
  }

  // ── Verify Email ──────────────────────────────────────────────────────────

  async verifyEmail(tokenString: string) {
    const record = await this.prisma.verificationToken.findUnique({
      where: { token: tokenString },
      include: { user: true },
    });

    if (!record || record.type !== 'EMAIL_VERIFY' || record.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    // Mark email as verified and delete the token
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: record.userId },
        data: { emailVerified: true },
      }),
      this.prisma.verificationToken.delete({
        where: { id: record.id },
      }),
    ]);

    // Auto-login: generate tokens
    const tokens = await this.generateTokens(
      record.user.id,
      record.user.email,
    );

    return {
      user: {
        id: record.user.id,
        email: record.user.email,
        username: record.user.username,
        name: record.user.name,
      },
      tokens,
    };
  }

  // ── Resend Verification ───────────────────────────────────────────────────

  async resendVerification(email: string) {
    const user = await this.userService.findByEmail(email);

    // Don't leak info — always return success
    if (!user || user.emailVerified) {
      return {
        message: 'If an account exists, a verification email has been sent',
      };
    }

    // Delete old EMAIL_VERIFY tokens for this user
    await this.prisma.verificationToken.deleteMany({
      where: { userId: user.id, type: 'EMAIL_VERIFY' },
    });

    // Generate new token
    const token = crypto.randomBytes(32).toString('hex');
    await this.prisma.verificationToken.create({
      data: {
        token,
        type: 'EMAIL_VERIFY',
        userId: user.id,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    this.mailService
      .sendVerificationEmail(user.email, user.name, token)
      .catch(() => {});

    return {
      message: 'If an account exists, a verification email has been sent',
    };
  }

  // ── Forgot Password ──────────────────────────────────────────────────────

  async forgotPassword(email: string) {
    const user = await this.userService.findByEmail(email);

    // Don't leak info
    if (!user) {
      return {
        message: 'If an account exists, a password reset link has been sent',
      };
    }

    // Delete old PASSWORD_RESET tokens for this user
    await this.prisma.verificationToken.deleteMany({
      where: { userId: user.id, type: 'PASSWORD_RESET' },
    });

    // Generate token, expires in 1 hour
    const token = crypto.randomBytes(32).toString('hex');
    await this.prisma.verificationToken.create({
      data: {
        token,
        type: 'PASSWORD_RESET',
        userId: user.id,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    this.mailService
      .sendPasswordResetEmail(user.email, user.name, token)
      .catch(() => {});

    return {
      message: 'If an account exists, a password reset link has been sent',
    };
  }

  // ── Reset Password ────────────────────────────────────────────────────────

  async resetPassword(tokenString: string, newPassword: string) {
    const record = await this.prisma.verificationToken.findUnique({
      where: { token: tokenString },
    });

    if (
      !record ||
      record.type !== 'PASSWORD_RESET' ||
      record.expiresAt < new Date()
    ) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const passwordHash = await this.hashData(newPassword);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: record.userId },
        data: { passwordHash },
      }),
      this.prisma.verificationToken.deleteMany({
        where: { userId: record.userId, type: 'PASSWORD_RESET' },
      }),
    ]);

    return { message: 'Password reset successfully' };
  }

  // ── Change Password ───────────────────────────────────────────────────────

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.passwordHash) {
      throw new BadRequestException(
        'Password not set for OAuth accounts',
      );
    }

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const passwordHash = await this.hashData(newPassword);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    return { message: 'Password changed successfully' };
  }

  // ── Set Password (for OAuth users) ─────────────────────────────────────────

  async setPassword(userId: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.passwordHash) {
      throw new BadRequestException(
        'Password already set. Use change password instead.',
      );
    }

    const passwordHash = await this.hashData(newPassword);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    return { message: 'Password set successfully' };
  }

  // ── Change Username ────────────────────────────────────────────────────────

  async changeUsername(userId: string, newUsername: string) {
    const existing = await this.prisma.user.findUnique({
      where: { username: newUsername },
    });

    if (existing && existing.id !== userId) {
      throw new ConflictException('Username is already taken');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { username: newUsername },
    });

    return { message: 'Username changed successfully' };
  }

  // ── Check Username ────────────────────────────────────────────────────────

  async checkUsername(username: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
    });
    return { available: !user };
  }

  // ── Refresh Tokens ────────────────────────────────────────────────────────

  async refreshTokens(refreshToken: string, userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.refreshToken) {
      throw new ForbiddenException('Access denied');
    }

    // Verify the refresh token hash matches
    const isRefreshTokenValid = await bcrypt.compare(
      refreshToken,
      user.refreshToken,
    );

    if (!isRefreshTokenValid) {
      throw new ForbiddenException('Access denied');
    }

    // Rotate tokens
    const tokens = await this.generateTokens(user.id, user.email);

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
      },
      tokens,
    };
  }

  // ── Logout ────────────────────────────────────────────────────────────────

  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
  }

  // ── Get Me ────────────────────────────────────────────────────────────────

  async getMe(userId: string) {
    return this.userService.findById(userId);
  }

  // ── GitHub Login ──────────────────────────────────────────────────────────

  async githubLogin(code: string) {
    // Exchange the authorization code for an access token
    const tokenRes = await fetch(
      'https://github.com/login/oauth/access_token',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          client_id: this.configService.getOrThrow<string>('GITHUB_CLIENT_ID'),
          client_secret: this.configService.getOrThrow<string>(
            'GITHUB_CLIENT_SECRET',
          ),
          code,
        }),
      },
    );

    const tokenData = (await tokenRes.json()) as {
      access_token?: string;
      error?: string;
    };

    if (!tokenData.access_token) {
      throw new UnauthorizedException('Invalid GitHub code');
    }

    // Fetch GitHub user profile
    const [profileRes, emailsRes] = await Promise.all([
      fetch('https://api.github.com/user', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      }),
      fetch('https://api.github.com/user/emails', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      }),
    ]);

    if (!profileRes.ok) {
      throw new UnauthorizedException('Failed to fetch GitHub profile');
    }

    const profile = (await profileRes.json()) as {
      id: number;
      login: string;
      name: string | null;
      avatar_url: string | null;
    };

    const emails = emailsRes.ok
      ? ((await emailsRes.json()) as { email: string; primary: boolean }[])
      : [];

    const githubId = String(profile.id);
    const primaryEmail =
      emails.find((e) => e.primary)?.email || emails[0]?.email || null;
    const username = profile.login || `gh-${githubId}`;
    const name = profile.name || profile.login || `GitHub User ${githubId}`;
    const avatarUrl = profile.avatar_url || null;

    // Try to find an existing user by GitHub ID
    let user = await this.userService.findByGithubId(githubId);

    if (!user && primaryEmail) {
      user = await this.userService.findByEmail(primaryEmail);

      if (user) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: {
            githubId,
            avatarUrl: user.avatarUrl || avatarUrl,
          },
        });
      }
    }

    if (!user) {
      const finalUsername = await this.generateUniqueUsername(username);

      user = await this.prisma.user.create({
        data: {
          email: primaryEmail || `${githubId}@github.betaversionio`,
          username: finalUsername,
          name,
          githubId,
          avatarUrl,
          emailVerified: !!primaryEmail,
          profile: {
            create: {},
          },
        },
      });
    }

    const tokens = await this.generateTokens(user.id, user.email);

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
      },
      tokens,
    };
  }

  // ── Google Login ─────────────────────────────────────────────────────────

  async googleLogin(accessToken: string) {
    // Fetch user info from Google using the access token
    const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      throw new UnauthorizedException('Invalid Google token');
    }

    const payload = (await res.json()) as {
      sub: string;
      email?: string;
      name?: string;
      picture?: string;
    };

    const googleId = payload.sub;
    const email = payload.email || null;
    const name = payload.name || 'Google User';
    const avatarUrl = payload.picture || null;

    // Try to find an existing user by Google ID
    let user = await this.userService.findByGoogleId(googleId);

    if (!user && email) {
      user = await this.userService.findByEmail(email);

      if (user) {
        // Link Google ID to existing account
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: {
            googleId,
            avatarUrl: user.avatarUrl || avatarUrl,
          },
        });
      }
    }

    if (!user) {
      const baseUsername = email ? email.split('@')[0]! : `google-${googleId}`;
      const username = await this.generateUniqueUsername(baseUsername);

      user = await this.prisma.user.create({
        data: {
          email: email || `${googleId}@google.betaversionio`,
          username,
          name,
          googleId,
          avatarUrl,
          emailVerified: !!email,
          profile: {
            create: {},
          },
        },
      });
    }

    const tokens = await this.generateTokens(user.id, user.email);

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
      },
      tokens,
    };
  }

  // ── Generate Tokens ───────────────────────────────────────────────────────

  async generateTokens(userId: string, email: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email } as Record<string, unknown>,
        {
          secret: this.configService.getOrThrow<string>('JWT_SECRET'),
          expiresIn: (this.configService.get<string>('JWT_ACCESS_EXPIRATION') ||
            '7d') as any,
        },
      ),
      this.jwtService.signAsync(
        { sub: userId, email } as Record<string, unknown>,
        {
          secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
          expiresIn: (this.configService.get<string>(
            'JWT_REFRESH_EXPIRATION',
          ) || '15d') as any,
        },
      ),
    ]);

    // Store hashed refresh token in the database
    await this.updateRefreshToken(userId, refreshToken);

    return {
      accessToken,
      refreshToken,
    };
  }

  // ── Private Helpers ───────────────────────────────────────────────────────

  private async generateUniqueUsername(base: string): Promise<string> {
    // Sanitize: keep only alphanumeric, hyphens, underscores
    let sanitized = base.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 25);
    if (sanitized.length < 3) sanitized = `user-${sanitized}`;

    // Ensure it doesn't start/end with hyphen or underscore
    sanitized = sanitized.replace(/^[-_]+|[-_]+$/g, '');
    if (sanitized.length < 3) sanitized = `user-${crypto.randomBytes(3).toString('hex')}`;

    let candidate = sanitized;
    let exists = await this.prisma.user.findUnique({ where: { username: candidate } });

    while (exists) {
      const suffix = crypto.randomBytes(3).toString('hex');
      candidate = `${sanitized}-${suffix}`.slice(0, 30);
      exists = await this.prisma.user.findUnique({ where: { username: candidate } });
    }

    return candidate;
  }

  private async hashData(data: string): Promise<string> {
    return bcrypt.hash(data, this.BCRYPT_ROUNDS);
  }

  private async updateRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<void> {
    const hashedRefreshToken = await this.hashData(refreshToken);

    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: hashedRefreshToken },
    });
  }
}
