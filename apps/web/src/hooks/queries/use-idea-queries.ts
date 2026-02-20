import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type {
  CreateIdeaInput,
  UpdateIdeaInput,
  CreateApplicationInput,
} from "@devcom/shared";

interface IdeaAuthor {
  id: string;
  username: string;
  name: string | null;
  avatarUrl: string | null;
}

interface IdeaRole {
  id: string;
  title: string;
  description: string;
  commitment: string;
  compensation: string;
}

interface Idea {
  id: string;
  title: string;
  description: string;
  stage: string;
  techStack: string[];
  roles: IdeaRole[];
  author: IdeaAuthor;
  voteCount: number;
  hasVoted: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PaginatedIdeas {
  items: Idea[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface IdeaFilters {
  stage?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const ideaKeys = {
  all: ["ideas"] as const,
  lists: () => [...ideaKeys.all, "list"] as const,
  list: (filters: IdeaFilters) => [...ideaKeys.lists(), filters] as const,
  details: () => [...ideaKeys.all, "detail"] as const,
  detail: (id: string) => [...ideaKeys.details(), id] as const,
};

export function useIdeas(filters: IdeaFilters = {}) {
  return useQuery({
    queryKey: ideaKeys.list(filters),
    queryFn: () =>
      apiClient.get<PaginatedIdeas>("/ideas", {
        params: filters as Record<string, string | number | boolean | undefined>,
      } as never),
  });
}

export function useIdea(id: string) {
  return useQuery({
    queryKey: ideaKeys.detail(id),
    queryFn: () => apiClient.get<Idea>(`/ideas/${id}`),
    enabled: !!id,
  });
}

export function useCreateIdea() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateIdeaInput) =>
      apiClient.post<Idea>("/ideas", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ideaKeys.lists() });
    },
  });
}

export function useUpdateIdea(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateIdeaInput) =>
      apiClient.patch<Idea>(`/ideas/${id}`, data),
    onSuccess: (updatedIdea) => {
      queryClient.setQueryData(ideaKeys.detail(id), updatedIdea);
      queryClient.invalidateQueries({ queryKey: ideaKeys.lists() });
    },
  });
}

export function useToggleVote(ideaId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      apiClient.post<{ toggled: boolean }>(`/ideas/${ideaId}/vote`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ideaKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ideaKeys.detail(ideaId) });
    },
  });
}

export function useApplyToIdea(ideaId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateApplicationInput) =>
      apiClient.post<{ id: string }>(`/ideas/${ideaId}/apply`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ideaKeys.detail(ideaId) });
    },
  });
}
