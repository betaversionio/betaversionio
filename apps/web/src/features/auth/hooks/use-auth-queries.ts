import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, hasAccessTokenCookie } from "@/lib/api-client";

// ── Types ──

interface User {
  id: string;
  email: string;
  username: string;
  name: string | null;
  avatarUrl: string | null;
  hasPassword: boolean;
}

interface AuthData {
  user: User;
  tokens: { accessToken: string; refreshToken: string };
}

// ── Query keys ──

export const authKeys = {
  all: ["auth"] as const,
  me: () => [...authKeys.all, "me"] as const,
  checkUsername: (username: string) =>
    [...authKeys.all, "check-username", username] as const,
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

export function useCheckUsername(username: string) {
  return useQuery({
    queryKey: authKeys.checkUsername(username),
    queryFn: () =>
      apiClient.get<{ available: boolean }>(
        `/auth/check-username/${encodeURIComponent(username)}`,
      ),
    enabled: username.length >= 3,
    staleTime: 30_000,
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
  return useMutation({
    mutationFn: (input: {
      email: string;
      password: string;
      username: string;
      name: string;
    }) => apiClient.post<{ message: string }>("/auth/register", input),
  });
}

export function useVerifyEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (token: string) =>
      apiClient.post<AuthData>("/auth/verify-email", { token }),
    onSuccess: (data) => {
      queryClient.setQueryData(authKeys.me(), data.user);
    },
  });
}

export function useResendVerification() {
  return useMutation({
    mutationFn: (email: string) =>
      apiClient.post<{ message: string }>("/auth/resend-verification", {
        email,
      }),
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) =>
      apiClient.post<{ message: string }>("/auth/forgot-password", { email }),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (input: { token: string; password: string }) =>
      apiClient.post<{ message: string }>("/auth/reset-password", input),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (input: { currentPassword: string; newPassword: string }) =>
      apiClient.post<{ message: string }>("/auth/change-password", input),
  });
}

export function useSetPassword() {
  return useMutation({
    mutationFn: (password: string) =>
      apiClient.post<{ message: string }>("/auth/set-password", { password }),
  });
}

export function useChangeUsername() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (username: string) =>
      apiClient.post<{ message: string }>("/auth/change-username", { username }),
    onSuccess: (_data, username) => {
      queryClient.setQueryData(authKeys.me(), (old: User | undefined) =>
        old ? { ...old, username } : old,
      );
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
