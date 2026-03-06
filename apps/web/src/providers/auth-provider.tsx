'use client';

import {
  createContext,
  useContext,
  useMemo,
  useCallback,
  useState,
  useEffect,
} from 'react';
import {
  useMe,
  useLogin,
  useRegister,
  useLogout,
  useGithubAuth,
  useGoogleAuth,
} from '@/features/auth';
import { refreshAccessToken, hasAccessTokenCookie } from '@/lib/api-client';

export interface User {
  id: string;
  email: string;
  username: string;
  name: string | null;
  avatarUrl: string | null;
  hasPassword: boolean;
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
  loginWithGithub: () => Promise<void>;
  loginWithGoogle: (accessToken: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const GITHUB_CLIENT_ID = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID ?? '';

function openGithubPopup(): Promise<string> {
  return new Promise((resolve, reject) => {
    const width = 500;
    const height = 700;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&scope=user:email`,
      'github-oauth',
      `width=${width},height=${height},left=${left},top=${top}`,
    );

    if (!popup) {
      reject(new Error('Popup blocked'));
      return;
    }

    const interval = setInterval(() => {
      if (popup.closed) {
        clearInterval(interval);
        reject(new Error('Popup closed'));
      }
    }, 500);

    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === 'github-oauth-callback' && event.data?.code) {
        clearInterval(interval);
        window.removeEventListener('message', onMessage);
        popup?.close();
        resolve(event.data.code as string);
      }
    }

    window.addEventListener('message', onMessage);
  });
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [canFetchMe, setCanFetchMe] = useState(() => hasAccessTokenCookie());

  // On mount, restore the session:
  // 1. If the access_token cookie exists, the browser will send it automatically — ready.
  // 2. Otherwise fall back to a /auth/refresh call to get new cookies.
  // Note: after refresh, the cookie belongs to the API domain and won't appear
  // in document.cookie on cross-origin deployments, so we track success via state.
  useEffect(() => {
    if (hasAccessTokenCookie()) {
      setIsInitialized(true);
      return;
    }
    refreshAccessToken().then((success) => {
      if (success) setCanFetchMe(true);
      setIsInitialized(true);
    });
  }, []);

  const meQuery = useMe(canFetchMe);
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const logoutMutation = useLogout();
  const githubAuthMutation = useGithubAuth();
  const googleAuthMutation = useGoogleAuth();

  const login = useCallback(
    async (email: string, password: string) => {
      await loginMutation.mutateAsync({ email, password });
    },
    [loginMutation],
  );

  const register = useCallback(
    async (email: string, password: string, username: string, name: string) => {
      await registerMutation.mutateAsync({ email, password, username, name });
    },
    [registerMutation],
  );

  const logout = useCallback(async () => {
    await logoutMutation.mutateAsync();
  }, [logoutMutation]);

  const loginWithGithub = useCallback(async () => {
    const code = await openGithubPopup();
    await githubAuthMutation.mutateAsync(code);
  }, [githubAuthMutation]);

  const loginWithGoogle = useCallback(
    async (accessToken: string) => {
      await googleAuthMutation.mutateAsync(accessToken);
    },
    [googleAuthMutation],
  );

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
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
