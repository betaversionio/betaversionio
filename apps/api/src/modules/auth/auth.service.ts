import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  ForbiddenException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import type { RegisterInput } from "@devcom/shared";

import { PrismaService } from "../../prisma/prisma.service";
import { UserService } from "../user/user.service";

@Injectable()
export class AuthService {
  private readonly BCRYPT_ROUNDS = 10;

  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  // ── Register ──────────────────────────────────────────────────────────────

  async register(dto: RegisterInput) {
    // Check for existing email
    const existingEmail = await this.userService.findByEmail(dto.email);
    if (existingEmail) {
      throw new ConflictException("Email is already registered");
    }

    // Check for existing username
    const existingUsername = await this.prisma.user.findUnique({
      where: { username: dto.username },
    });
    if (existingUsername) {
      throw new ConflictException("Username is already taken");
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

    // Generate tokens
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

  // ── Login ─────────────────────────────────────────────────────────────────

  async login(user: { id: string; email: string; username: string; name: string }) {
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

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
    };
  }

  // ── Refresh Tokens ────────────────────────────────────────────────────────

  async refreshTokens(refreshToken: string, userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.refreshToken) {
      throw new ForbiddenException("Access denied");
    }

    // Verify the refresh token hash matches
    const isRefreshTokenValid = await bcrypt.compare(
      refreshToken,
      user.refreshToken,
    );

    if (!isRefreshTokenValid) {
      throw new ForbiddenException("Access denied");
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
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          client_id: this.configService.getOrThrow<string>("GITHUB_CLIENT_ID"),
          client_secret: this.configService.getOrThrow<string>("GITHUB_CLIENT_SECRET"),
          code,
        }),
      },
    );

    const tokenData = (await tokenRes.json()) as {
      access_token?: string;
      error?: string;
    };

    if (!tokenData.access_token) {
      throw new UnauthorizedException("Invalid GitHub code");
    }

    // Fetch GitHub user profile
    const [profileRes, emailsRes] = await Promise.all([
      fetch("https://api.github.com/user", {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      }),
      fetch("https://api.github.com/user/emails", {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      }),
    ]);

    if (!profileRes.ok) {
      throw new UnauthorizedException("Failed to fetch GitHub profile");
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
      let finalUsername = username;
      const existingUsername = await this.prisma.user.findUnique({
        where: { username: finalUsername },
      });

      if (existingUsername) {
        finalUsername = `${finalUsername}-${Date.now().toString(36)}`;
      }

      user = await this.prisma.user.create({
        data: {
          email: primaryEmail || `${githubId}@github.devcom`,
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
    const res = await fetch(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );

    if (!res.ok) {
      throw new UnauthorizedException("Invalid Google token");
    }

    const payload = (await res.json()) as {
      sub: string;
      email?: string;
      name?: string;
      picture?: string;
    };

    const googleId = payload.sub;
    const email = payload.email || null;
    const name = payload.name || "Google User";
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
      let username = email
        ? email.split("@")[0]!
        : `google-${googleId}`;

      const existingUsername = await this.prisma.user.findUnique({
        where: { username },
      });

      if (existingUsername) {
        username = `${username}-${Date.now().toString(36)}`;
      }

      user = await this.prisma.user.create({
        data: {
          email: email || `${googleId}@google.devcom`,
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
          secret: this.configService.getOrThrow<string>("JWT_SECRET"),
          expiresIn: (this.configService.get<string>("JWT_ACCESS_EXPIRATION") || "7d") as any,
        },
      ),
      this.jwtService.signAsync(
        { sub: userId, email } as Record<string, unknown>,
        {
          secret: this.configService.getOrThrow<string>("JWT_REFRESH_SECRET"),
          expiresIn: (this.configService.get<string>("JWT_REFRESH_EXPIRATION") || "15d") as any,
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
