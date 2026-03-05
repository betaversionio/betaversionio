import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { profileKeys } from './use-profile-queries';
import type { CreatePortfolioTemplateInput, UpdatePortfolioTemplateInput } from '@betaversionio/shared';

export interface TemplateAuthor {
  id: string;
  username: string;
  name: string | null;
  avatarUrl: string | null;
}

export interface PortfolioTemplate {
  id: string;
  name: string;
  description: string;
  previewImage: string | null;
  previewUrl: string | null;
  baseUrl: string | null;
  repoUrl: string | null;
  tags: string[];
  featured: boolean;
  installCount: number;
  status: string;
  author: TemplateAuthor;
  createdAt: string;
}

interface PaginatedResponse<T> {
  items: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

type PaginatedTemplates = PaginatedResponse<PortfolioTemplate>;

export interface TemplateFilters {
  search?: string;
  tags?: string;
  featured?: boolean;
  page?: number;
  limit?: number;
  sort?: string;
}

export interface MyTemplateFilters {
  status?: string;
  page?: number;
  limit?: number;
}

export const templateKeys = {
  all: ['templates'] as const,
  lists: () => [...templateKeys.all, 'list'] as const,
  list: (filters: TemplateFilters) => [...templateKeys.lists(), filters] as const,
  details: () => [...templateKeys.all, 'detail'] as const,
  detail: (id: string) => [...templateKeys.details(), id] as const,
  mine: () => [...templateKeys.all, 'mine'] as const,
  mineList: (filters: MyTemplateFilters) => [...templateKeys.mine(), filters] as const,
};

// ─── Core Queries ────────────────────────────────────────────────────────────

export function useTemplates(filters: TemplateFilters = {}) {
  return useQuery({
    queryKey: templateKeys.list(filters),
    queryFn: () =>
      apiClient.get<PaginatedTemplates>('/portfolio-templates', {
        params: filters as Record<string, string | number | boolean | undefined>,
      } as never),
  });
}

export function useTemplate(id: string) {
  return useQuery({
    queryKey: templateKeys.detail(id),
    queryFn: () => apiClient.get<PortfolioTemplate>(`/portfolio-templates/${id}`),
    enabled: !!id,
  });
}

export function useMyTemplates(filters: MyTemplateFilters = {}) {
  return useQuery({
    queryKey: templateKeys.mineList(filters),
    queryFn: () =>
      apiClient.get<PaginatedTemplates>('/portfolio-templates/mine', {
        params: filters as Record<string, string | number | boolean | undefined>,
      } as never),
  });
}

// ─── Mutations ───────────────────────────────────────────────────────────────

export function useSelectTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (portfolioTemplateId: string | null) =>
      apiClient.patch('/portfolio-templates/select', { portfolioTemplateId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
      queryClient.invalidateQueries({ queryKey: templateKeys.all });
    },
  });
}

export function useCreateTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePortfolioTemplateInput) =>
      apiClient.post<PortfolioTemplate>('/portfolio-templates', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: templateKeys.all });
    },
  });
}

export function useUpdateTemplate(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdatePortfolioTemplateInput) =>
      apiClient.patch<PortfolioTemplate>(`/portfolio-templates/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: templateKeys.all });
    },
  });
}

export function useDeleteTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete(`/portfolio-templates/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: templateKeys.all });
    },
  });
}
