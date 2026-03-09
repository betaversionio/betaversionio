'use client';

import { createContext, useContext, useMemo, useState, createElement } from 'react';
import type { ReactNode } from 'react';
import { useQuery, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { PortfolioData, PortfolioProject, PortfolioBlog } from './types';

// ─── Context ─────────────────────────────────────────────────────────────────

interface PortfolioConfig {
  apiUrl: string;
  username?: string;
  fallbackUsername?: string;
}

const PortfolioContext = createContext<PortfolioConfig | null>(null);

interface PortfolioProviderProps extends PortfolioConfig {
  children: ReactNode;
}

export function PortfolioProvider({
  children,
  apiUrl,
  username,
  fallbackUsername,
}: PortfolioProviderProps) {
  const [queryClient] = useState(() => new QueryClient());
  const value = useMemo(
    () => ({ apiUrl, username, fallbackUsername }),
    [apiUrl, username, fallbackUsername],
  );
  return createElement(
    QueryClientProvider,
    { client: queryClient },
    createElement(PortfolioContext.Provider, { value }, children),
  );
}

function usePortfolioConfig(): PortfolioConfig {
  const ctx = useContext(PortfolioContext);
  if (!ctx) {
    throw new Error('usePortfolio/useProject/useBlog must be used within <PortfolioProvider>');
  }
  return ctx;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

function unwrap<T>(json: ApiResponse<T> | T): T {
  if (json && typeof json === 'object' && 'success' in json && 'data' in json) {
    return (json as ApiResponse<T>).data;
  }
  return json as T;
}

async function fetchApi<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return unwrap<T>(await res.json());
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

interface UsePortfolioOptions {
  enabled?: boolean;
  staleTime?: number;
}

export function usePortfolio(options: UsePortfolioOptions = {}) {
  const { apiUrl, username, fallbackUsername } = usePortfolioConfig();
  const { enabled = true, staleTime = 5 * 60 * 1000 } = options;

  return useQuery<PortfolioData | null>({
    queryKey: ['portfolio', apiUrl, username ?? fallbackUsername ?? 'auto'],
    queryFn: async () => {
      const endpoint = username ? `/portfolio/${username}` : '/portfolio';
      try {
        return await fetchApi<PortfolioData>(`${apiUrl}${endpoint}`);
      } catch {
        if (!username && fallbackUsername) {
          return await fetchApi<PortfolioData>(`${apiUrl}/portfolio/${fallbackUsername}`);
        }
        return null;
      }
    },
    enabled,
    staleTime,
  });
}

interface UseProjectOptions {
  enabled?: boolean;
  staleTime?: number;
}

export function useProject(slug: string, options: UseProjectOptions = {}) {
  const { apiUrl } = usePortfolioConfig();
  const { enabled = true, staleTime = 5 * 60 * 1000 } = options;

  return useQuery<PortfolioProject | null>({
    queryKey: ['portfolio', 'project', slug, apiUrl],
    queryFn: async () => {
      try {
        return await fetchApi<PortfolioProject>(`${apiUrl}/portfolio/project/${slug}`);
      } catch {
        return null;
      }
    },
    enabled: enabled && !!slug,
    staleTime,
  });
}

interface UseBlogOptions {
  enabled?: boolean;
  staleTime?: number;
}

export function useBlog(slug: string, options: UseBlogOptions = {}) {
  const { apiUrl } = usePortfolioConfig();
  const { enabled = true, staleTime = 5 * 60 * 1000 } = options;

  return useQuery<PortfolioBlog | null>({
    queryKey: ['portfolio', 'blog', slug, apiUrl],
    queryFn: async () => {
      try {
        return await fetchApi<PortfolioBlog>(`${apiUrl}/portfolio/blog/${slug}`);
      } catch {
        return null;
      }
    },
    enabled: enabled && !!slug,
    staleTime,
  });
}
