import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, setAccessToken, getAccessToken } from "@/lib/api-client";

// ── Types ──

interface User {
  id: string;
  email: string;
  username: string;
  name: string | null;
  avatarUrl: string | null;
}

interface ApiWrapped<T> {
  success: boolean;
  data: T;
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
    queryFn: async () => {
      const res = await apiClient.get<ApiWrapped<User>>("/auth/me", {
        skipAuthRefresh: true,
      });
      return res.data;
    },
    enabled: !!getAccessToken(),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

// ── Mutations ──

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { email: string; password: string }) => {
      const res = await apiClient.post<ApiWrapped<AuthData>>(
        "/auth/login",
        input,
      );
      return res.data;
    },
    onSuccess: (data) => {
      setAccessToken(data.tokens.accessToken);
      queryClient.setQueryData(authKeys.me(), data.user);
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      email: string;
      password: string;
      username: string;
      name: string;
    }) => {
      const res = await apiClient.post<ApiWrapped<AuthData>>(
        "/auth/register",
        input,
      );
      return res.data;
    },
    onSuccess: (data) => {
      setAccessToken(data.tokens.accessToken);
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
      setAccessToken(null);
      queryClient.setQueryData(authKeys.me(), null);
      queryClient.removeQueries();
    },
  });
}
