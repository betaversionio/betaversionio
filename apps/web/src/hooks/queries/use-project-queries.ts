import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { CreateProjectInput, UpdateProjectInput } from "@devcom/shared";

interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string | null;
  techStack: string[];
  repoUrl: string | null;
  liveUrl: string | null;
  status: string;
  authorId: string;
  author: {
    id: string;
    username: string;
    name: string | null;
    avatarUrl: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

interface PaginatedProjects {
  items: Project[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface ProjectFilters {
  authorId?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const projectKeys = {
  all: ["projects"] as const,
  lists: () => [...projectKeys.all, "list"] as const,
  list: (filters: ProjectFilters) =>
    [...projectKeys.lists(), filters] as const,
  details: () => [...projectKeys.all, "detail"] as const,
  detail: (slug: string) => [...projectKeys.details(), slug] as const,
};

export function useProjects(filters: ProjectFilters = {}) {
  return useQuery({
    queryKey: projectKeys.list(filters),
    queryFn: () =>
      apiClient.get<PaginatedProjects>("/projects", {
        params: filters as Record<string, string | number | boolean | undefined>,
      } as never),
  });
}

export function useProject(slug: string) {
  return useQuery({
    queryKey: projectKeys.detail(slug),
    queryFn: () => apiClient.get<Project>(`/projects/${slug}`),
    enabled: !!slug,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProjectInput) =>
      apiClient.post<Project>("/projects", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}

export function useUpdateProject(slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProjectInput) =>
      apiClient.patch<Project>(`/projects/${slug}`, data),
    onSuccess: (updatedProject) => {
      queryClient.setQueryData(projectKeys.detail(slug), updatedProject);
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}
