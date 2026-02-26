import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { GitHubAppService } from "./github-app.service";

interface GitHubRepoItem {
  full_name: string;
  name: string;
  owner: { login: string };
  private: boolean;
  default_branch: string;
  description: string | null;
}

interface GitHubContentItem {
  name: string;
  path: string;
  type: "file" | "dir";
  sha: string;
  size: number;
}

interface GitHubFileResponse {
  content: string;
  encoding: string;
  sha: string;
  path: string;
  name: string;
}

@Injectable()
export class GitHubService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly appService: GitHubAppService,
  ) {}

  async connectGitHub(userId: string, installationId: number) {
    // Verify the installation exists and get account info
    const jwt = this.appService.createAppJwt();

    const res = await fetch(
      `https://api.github.com/app/installations/${installationId}`,
      {
        headers: {
          Authorization: `Bearer ${jwt}`,
          Accept: "application/vnd.github+json",
          "User-Agent": "DevCom",
        },
      },
    );

    if (!res.ok) {
      throw new BadRequestException("Invalid GitHub App installation");
    }

    const installation = (await res.json()) as {
      account: { login: string };
    };

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        githubInstallationId: installationId,
        githubUsername: installation.account.login,
      },
    });

    return { username: installation.account.login };
  }

  async disconnectGitHub(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        githubInstallationId: null,
        githubUsername: null,
      },
    });
  }

  async getStatus(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { githubInstallationId: true, githubUsername: true },
    });

    return {
      connected: !!user.githubInstallationId,
      username: user.githubUsername,
    };
  }

  async listRepos(userId: string) {
    const token = await this.getInstallationToken(userId);

    // Installation token endpoint returns only repos the user granted access to
    const res = await fetch(
      "https://api.github.com/installation/repositories?per_page=100",
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "User-Agent": "DevCom",
        },
      },
    );

    if (!res.ok) {
      throw new BadRequestException("Failed to list GitHub repositories");
    }

    const data = (await res.json()) as { repositories: GitHubRepoItem[] };

    return data.repositories.map((r) => ({
      fullName: r.full_name,
      name: r.name,
      owner: r.owner.login,
      private: r.private,
      defaultBranch: r.default_branch,
      description: r.description,
    }));
  }

  async listContents(userId: string, owner: string, repo: string, path = "") {
    const token = await this.getInstallationToken(userId);

    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "DevCom",
      },
    });

    if (!res.ok) {
      throw new BadRequestException("Failed to list repository contents");
    }

    const items = (await res.json()) as GitHubContentItem[];

    return items.map((item) => ({
      name: item.name,
      path: item.path,
      type: item.type,
      sha: item.sha,
      size: item.size,
    }));
  }

  async getFileContent(
    userId: string,
    owner: string,
    repo: string,
    path: string,
  ) {
    const token = await this.getInstallationToken(userId);

    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "DevCom",
      },
    });

    if (!res.ok) {
      throw new BadRequestException("Failed to fetch file content");
    }

    const file = (await res.json()) as GitHubFileResponse;

    const content = Buffer.from(file.content, "base64").toString("utf8");

    return {
      content,
      sha: file.sha,
      path: file.path,
      name: file.name,
    };
  }

  async pushFile(
    userId: string,
    owner: string,
    repo: string,
    path: string,
    content: string,
    message: string,
    sha?: string,
  ) {
    const token = await this.getInstallationToken(userId);

    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
    const body: Record<string, string> = {
      message,
      content: Buffer.from(content, "utf8").toString("base64"),
    };

    if (sha) {
      body.sha = sha;
    }

    const res = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/vnd.github+json",
        "User-Agent": "DevCom",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = (await res.json().catch(() => ({}))) as {
        message?: string;
      };
      throw new BadRequestException(
        err.message || "Failed to push file to GitHub",
      );
    }

    const result = (await res.json()) as {
      content: { sha: string; path: string };
      commit: { sha: string; html_url: string };
    };

    return {
      sha: result.content.sha,
      path: result.content.path,
      commitSha: result.commit.sha,
      commitUrl: result.commit.html_url,
    };
  }

  private async getInstallationToken(userId: string): Promise<string> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { githubInstallationId: true },
    });

    if (!user.githubInstallationId) {
      throw new UnauthorizedException(
        "GitHub is not connected. Please connect your GitHub account first.",
      );
    }

    return this.appService.getInstallationToken(user.githubInstallationId);
  }
}
