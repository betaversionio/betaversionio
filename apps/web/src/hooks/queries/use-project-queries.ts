import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type {
  CreateProjectInput,
  UpdateProjectInput,
  AddMakerInput,
  CreateProjectCommentInput,
  ToggleProjectVoteInput,
} from "@devcom/shared";

export interface ProjectAuthor {
  id: string;
  username: string;
  name: string | null;
  avatarUrl: string | null;
}

export interface ProjectMaker {
  id: string;
  userId: string;
  role: string;
  user: ProjectAuthor;
}

export interface ProjectComment {
  id: string;
  projectId: string;
  authorId: string;
  content: string;
  parentId: string | null;
  author: ProjectAuthor;
  replies?: ProjectComment[];
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  logo: string | null;
  tagline: string | null;
  description: string;
  links: string[];
  isOpenSource: boolean;
  images: string[];
  techStack: string[];
  tags: string[];
  status: string;
  phase: string;
  productionType: string;
  upvotesCount: number;
  downvotesCount: number;
  commentsCount: number;
  authorId: string;
  author: ProjectAuthor;
  makers: ProjectMaker[];
  comments?: ProjectComment[];
  hasVoted?: boolean;
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

export interface PaginatedComments {
  items: ProjectComment[];
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
  tags?: string;
  page?: number;
  limit?: number;
  phase?: string;
  productionType?: string;
  sort?: string;
}

export const projectKeys = {
  all: ["projects"] as const,
  lists: () => [...projectKeys.all, "list"] as const,
  list: (filters: ProjectFilters) =>
    [...projectKeys.lists(), filters] as const,
  details: () => [...projectKeys.all, "detail"] as const,
  detail: (slug: string) => [...projectKeys.details(), slug] as const,
  comments: (projectId: string) =>
    [...projectKeys.all, "comments", projectId] as const,
};

export function useProjects(
  filters: ProjectFilters = {},
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: projectKeys.list(filters),
    queryFn: () =>
      apiClient.get<PaginatedProjects>("/projects", {
        params: filters as Record<string, string | number | boolean | undefined>,
      } as never),
    enabled: options?.enabled,
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

export function useToggleProjectVote(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ToggleProjectVoteInput) =>
      apiClient.post<{ action: string; value: number }>(
        `/projects/${projectId}/vote`,
        data,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
    },
  });
}

export function useProjectComments(projectId: string, page = 1, limit = 20) {
  return useQuery({
    queryKey: [...projectKeys.comments(projectId), page],
    queryFn: () =>
      apiClient.get<PaginatedComments>(`/projects/${projectId}/comments`, {
        params: { page, limit },
      } as never),
    enabled: !!projectId,
  });
}

export function useCreateProjectComment(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProjectCommentInput) =>
      apiClient.post<ProjectComment>(
        `/projects/${projectId}/comments`,
        data,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: projectKeys.comments(projectId),
      });
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
    },
  });
}

export function useAddMaker(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AddMakerInput) =>
      apiClient.post<ProjectMaker>(`/projects/${projectId}/makers`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
    },
  });
}

export function useRemoveMaker(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (makerUserId: string) =>
      apiClient.delete(`/projects/${projectId}/makers/${makerUserId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
    },
  });
}
