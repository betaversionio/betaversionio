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

interface GithubProfile {
  githubId: string;
  username: string;
  name: string;
  email: string | null;
  avatarUrl: string | null;
}

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

  async githubLogin(githubProfile: GithubProfile) {
    // Try to find an existing user by GitHub ID
    let user = await this.userService.findByGithubId(githubProfile.githubId);

    if (!user) {
      // Try to find by email if available
      if (githubProfile.email) {
        user = await this.userService.findByEmail(githubProfile.email);

        if (user) {
          // Link GitHub ID to existing account
          user = await this.prisma.user.update({
            where: { id: user.id },
            data: {
              githubId: githubProfile.githubId,
              avatarUrl: user.avatarUrl || githubProfile.avatarUrl,
            },
          });
        }
      }
    }

    if (!user) {
      // Ensure unique username
      let username = githubProfile.username;
      const existingUsername = await this.prisma.user.findUnique({
        where: { username },
      });

      if (existingUsername) {
        username = `${username}-${Date.now().toString(36)}`;
      }

      // Create new user from GitHub profile
      user = await this.prisma.user.create({
        data: {
          email: githubProfile.email || `${githubProfile.githubId}@github.devcom`,
          username,
          name: githubProfile.name,
          githubId: githubProfile.githubId,
          avatarUrl: githubProfile.avatarUrl,
          emailVerified: !!githubProfile.email,
          profile: {
            create: {},
          },
        },
      });
    }

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

  // ── Generate Tokens ───────────────────────────────────────────────────────

  async generateTokens(userId: string, email: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email } as Record<string, unknown>,
        {
          secret: this.configService.getOrThrow<string>("JWT_SECRET"),
          expiresIn: (this.configService.get<string>("JWT_ACCESS_EXPIRATION") || "15m") as any,
        },
      ),
      this.jwtService.signAsync(
        { sub: userId, email } as Record<string, unknown>,
        {
          secret: this.configService.getOrThrow<string>("JWT_REFRESH_SECRET"),
          expiresIn: (this.configService.get<string>("JWT_REFRESH_EXPIRATION") || "7d") as any,
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
