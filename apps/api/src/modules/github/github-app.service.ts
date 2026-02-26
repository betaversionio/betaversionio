import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createSign } from "crypto";
import { readFileSync } from "fs";

@Injectable()
export class GitHubAppService {
  private readonly appId: string;
  private readonly privateKey: string;

  constructor(private readonly configService: ConfigService) {
    this.appId = this.configService.getOrThrow<string>("GITHUB_APP_ID");

    // Support file path or inline PEM (with \n escapes)
    const keyPath = this.configService.get<string>(
      "GITHUB_APP_PRIVATE_KEY_PATH",
    );

    if (keyPath) {
      this.privateKey = readFileSync(keyPath, "utf8");
    } else {
      const raw = this.configService.getOrThrow<string>(
        "GITHUB_APP_PRIVATE_KEY",
      );
      this.privateKey = raw.replace(/\\n/g, "\n");
    }
  }

  /**
   * Create a short-lived JWT (10 min) signed with the App's private key.
   * Used to authenticate as the GitHub App itself.
   */
  createAppJwt(): string {
    const now = Math.floor(Date.now() / 1000);

    const header = Buffer.from(
      JSON.stringify({ alg: "RS256", typ: "JWT" }),
    ).toString("base64url");

    const payload = Buffer.from(
      JSON.stringify({
        iat: now - 30,
        exp: now + 300,
        iss: this.appId,
      }),
    ).toString("base64url");

    const signature = createSign("RSA-SHA256")
      .update(`${header}.${payload}`)
      .sign(this.privateKey, "base64url");

    return `${header}.${payload}.${signature}`;
  }

  /**
   * Get an installation access token scoped to the repos the user selected.
   * Valid for 1 hour.
   */
  async getInstallationToken(installationId: number): Promise<string> {
    const jwt = this.createAppJwt();

    const res = await fetch(
      `https://api.github.com/app/installations/${installationId}/access_tokens`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${jwt}`,
          Accept: "application/vnd.github+json",
          "User-Agent": "DevCom",
        },
      },
    );

    if (!res.ok) {
      const err = (await res.json().catch(() => ({}))) as {
        message?: string;
      };
      throw new Error(
        err.message || `Failed to get installation token (${res.status})`,
      );
    }

    const data = (await res.json()) as { token: string };
    return data.token;
  }
}
