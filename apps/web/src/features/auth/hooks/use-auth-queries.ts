import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, hasAccessTokenCookie } from "@/lib/api-client";

// ── Types ──

interface User {
  id: string;
  email: string;
  username: string;
  name: string | null;
  avatarUrl: string | null;
}

interface AuthData {
  user: User;
  tokens: { accessToken: string; refreshToken: string };
}

// ── Query keys ──

export const authKeys = {
  all: ["auth"] as const,
  me: () => [...authKeys.all, "me"] as const,
};

// ── Queries ──

export function useMe() {
  return useQuery({
    queryKey: authKeys.me(),
    queryFn: () =>
      apiClient.get<User>("/auth/me", { skipAuthRefresh: true }),
    enabled: hasAccessTokenCookie(),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

// ── Mutations ──

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { email: string; password: string }) =>
      apiClient.post<AuthData>("/auth/login", input),
    onSuccess: (data) => {
      queryClient.setQueryData(authKeys.me(), data.user);
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: {
      email: string;
      password: string;
      username: string;
      name: string;
    }) => apiClient.post<AuthData>("/auth/register", input),
    onSuccess: (data) => {
      queryClient.setQueryData(authKeys.me(), data.user);
    },
  });
}

export function useGithubAuth() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (code: string) =>
      apiClient.post<AuthData>("/auth/github", { code }),
    onSuccess: (data) => {
      queryClient.setQueryData(authKeys.me(), data.user);
    },
  });
}

export function useGoogleAuth() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (googleAccessToken: string) =>
      apiClient.post<AuthData>("/auth/google", { accessToken: googleAccessToken }),
    onSuccess: (data) => {
      queryClient.setQueryData(authKeys.me(), data.user);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await apiClient.post("/auth/logout");
    },
    onSettled: () => {
      queryClient.setQueryData(authKeys.me(), null);
      queryClient.removeQueries();
    },
  });
}
