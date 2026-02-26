import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export interface GitHubStatus {
  connected: boolean;
  username: string | null;
}

export interface GitHubRepo {
  fullName: string;
  name: string;
  owner: string;
  private: boolean;
  defaultBranch: string;
  description: string | null;
}

export interface GitHubContentItem {
  name: string;
  path: string;
  type: "file" | "dir";
  sha: string;
  size: number;
}

export interface GitHubFile {
  content: string;
  sha: string;
  path: string;
  name: string;
}

export interface PushResult {
  sha: string;
  path: string;
  commitSha: string;
  commitUrl: string;
}

export const githubKeys = {
  all: ["github"] as const,
  status: () => [...githubKeys.all, "status"] as const,
  repos: () => [...githubKeys.all, "repos"] as const,
  contents: (owner: string, repo: string, path: string) =>
    [...githubKeys.all, "contents", owner, repo, path] as const,
};

export function useGitHubStatus() {
  return useQuery({
    queryKey: githubKeys.status(),
    queryFn: () => apiClient.get<GitHubStatus>("/github/status"),
  });
}

export function useConnectGitHub() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (installationId: number) =>
      apiClient.post<{ username: string }>("/github/connect", { installationId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: githubKeys.status() });
    },
  });
}

export function useDisconnectGitHub() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiClient.delete("/github/connect"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: githubKeys.status() });
      queryClient.invalidateQueries({ queryKey: githubKeys.repos() });
    },
  });
}

export function useGitHubRepos(enabled = true) {
  return useQuery({
    queryKey: githubKeys.repos(),
    queryFn: () => apiClient.get<GitHubRepo[]>("/github/repos"),
    enabled,
  });
}

export function useGitHubContents(
  owner: string,
  repo: string,
  path = "",
  enabled = true,
) {
  return useQuery({
    queryKey: githubKeys.contents(owner, repo, path),
    queryFn: () =>
      apiClient.get<GitHubContentItem[]>(
        `/github/repos/${owner}/${repo}/contents`,
        { params: { path } },
      ),
    enabled: enabled && !!owner && !!repo,
  });
}

export function useGitHubFileContent() {
  return useMutation({
    mutationFn: ({
      owner,
      repo,
      path,
    }: {
      owner: string;
      repo: string;
      path: string;
    }) =>
      apiClient.get<GitHubFile>(
        `/github/repos/${owner}/${repo}/file`,
        { params: { path } },
      ),
  });
}

export function usePushToGitHub() {
  return useMutation({
    mutationFn: ({
      owner,
      repo,
      path,
      content,
      message,
      sha,
    }: {
      owner: string;
      repo: string;
      path: string;
      content: string;
      message: string;
      sha?: string;
    }) =>
      apiClient.post<PushResult>(
        `/github/repos/${owner}/${repo}/push`,
        { path, content, message, sha },
      ),
  });
}
