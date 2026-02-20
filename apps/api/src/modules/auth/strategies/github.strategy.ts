import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, Profile } from "passport-github2";

import { AuthService } from "../auth.service";

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, "github") {
  constructor(
    configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: configService.getOrThrow<string>("GITHUB_CLIENT_ID"),
      clientSecret: configService.getOrThrow<string>("GITHUB_CLIENT_SECRET"),
      callbackURL: configService.getOrThrow<string>("GITHUB_CALLBACK_URL"),
      scope: ["user:email"],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: (err: Error | null, user?: any) => void,
  ) {
    try {
      const { id, username, displayName, emails, photos } = profile;

      const githubProfile = {
        githubId: id,
        username: username || `gh-${id}`,
        name: displayName || username || `GitHub User ${id}`,
        email: emails?.[0]?.value || null,
        avatarUrl: photos?.[0]?.value || null,
      };

      const result = await this.authService.githubLogin(githubProfile);
      done(null, result);
    } catch (error) {
      done(error as Error, undefined);
    }
  }
}
