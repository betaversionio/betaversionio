"use client";

import { createContext, useContext, useMemo, useCallback, useState, useEffect } from "react";
import { useMe, useLogin, useRegister, useLogout } from "@/features/auth";
import { refreshAccessToken } from "@/lib/api-client";

interface User {
  id: string;
  email: string;
  username: string;
  name: string | null;
  avatarUrl: string | null;
}

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    username: string,
    name: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  loginWithGithub: () => void;
  loginWithGoogle: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);

  // On mount, attempt a silent refresh to restore the session from the httpOnly cookie
  useEffect(() => {
    refreshAccessToken().finally(() => setIsInitialized(true));
  }, []);

  const meQuery = useMe();
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const logoutMutation = useLogout();

  const login = useCallback(
    async (email: string, password: string) => {
      await loginMutation.mutateAsync({ email, password });
    },
    [loginMutation],
  );

  const register = useCallback(
    async (
      email: string,
      password: string,
      username: string,
      name: string,
    ) => {
      await registerMutation.mutateAsync({ email, password, username, name });
    },
    [registerMutation],
  );

  const logout = useCallback(async () => {
    await logoutMutation.mutateAsync();
  }, [logoutMutation]);

  const loginWithGithub = useCallback(() => {
    window.location.href = `${API_URL}/auth/github`;
  }, []);

  const loginWithGoogle = useCallback(() => {
    window.location.href = `${API_URL}/auth/google`;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: meQuery.data ?? null,
      isLoading: !isInitialized || meQuery.isLoading,
      isAuthenticated: !!meQuery.data,
      login,
      register,
      logout,
      loginWithGithub,
      loginWithGoogle,
    }),
    [
      isInitialized,
      meQuery.data,
      meQuery.isLoading,
      login,
      register,
      logout,
      loginWithGithub,
      loginWithGoogle,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
