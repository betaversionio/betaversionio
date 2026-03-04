import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type {
  CreateProjectInput,
  UpdateProjectInput,
  CreateProjectCommentInput,
  UpdateProjectCommentInput,
  ToggleProjectVoteInput,
  CreateProjectReviewInput,
  UpdateProjectReviewInput,
  CreateProjectUpdateInput,
  UpdateProjectUpdateInput,
} from '@betaversionio/shared';

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
  editedAt: string | null;
  author: ProjectAuthor;
  replies?: ProjectComment[];
  createdAt: string;
  updatedAt: string;
}

export interface ProjectReview {
  id: string;
  projectId: string;
  authorId: string;
  rating: number;
  title: string;
  content: string;
  author: ProjectAuthor;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectUpdateEntry {
  id: string;
  projectId: string;
  authorId: string;
  title: string;
  content: string;
  version: string | null;
  author: ProjectAuthor;
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
  demoUrl: string | null;
  videoUrl: string | null;
  launchDate: string | null;
  upvotesCount: number;
  downvotesCount: number;
  commentsCount: number;
  bookmarksCount: number;
  reviewsCount: number;
  averageRating: number;
  viewsCount: number;
  authorId: string;
  author: ProjectAuthor;
  makers: ProjectMaker[];
  comments?: ProjectComment[];
  hasVoted?: boolean;
  hasBookmarked?: boolean;
  createdAt: string;
  updatedAt: string;
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

type PaginatedProjects = PaginatedResponse<Project>;
export type PaginatedComments = PaginatedResponse<ProjectComment>;
type PaginatedReviews = PaginatedResponse<ProjectReview>;
type PaginatedUpdates = PaginatedResponse<ProjectUpdateEntry>;

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
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  list: (filters: ProjectFilters) => [...projectKeys.lists(), filters] as const,
  details: () => [...projectKeys.all, 'detail'] as const,
  detail: (slug: string) => [...projectKeys.details(), slug] as const,
  comments: (projectId: string) =>
    [...projectKeys.all, 'comments', projectId] as const,
  reviews: (projectId: string) =>
    [...projectKeys.all, 'reviews', projectId] as const,
  updates: (projectId: string) =>
    [...projectKeys.all, 'updates', projectId] as const,
  related: (slug: string) => [...projectKeys.all, 'related', slug] as const,
  bookmarks: () => [...projectKeys.all, 'bookmarks'] as const,
  launchingToday: () => [...projectKeys.all, 'launching-today'] as const,
  analytics: (projectId: string) =>
    [...projectKeys.all, 'analytics', projectId] as const,
};

// ─── Core Queries ────────────────────────────────────────────────────────────

export function useProjects(
  filters: ProjectFilters = {},
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: projectKeys.list(filters),
    queryFn: () =>
      apiClient.get<PaginatedProjects>('/projects', {
        params: filters as Record<
          string,
          string | number | boolean | undefined
        >,
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
      apiClient.post<Project>('/projects', data),
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

// ─── Votes ───────────────────────────────────────────────────────────────────

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

// ─── Comments ────────────────────────────────────────────────────────────────

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
      apiClient.post<ProjectComment>(`/projects/${projectId}/comments`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: projectKeys.comments(projectId),
      });
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
    },
  });
}

export function useUpdateProjectComment(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      commentId,
      data,
    }: {
      commentId: string;
      data: UpdateProjectCommentInput;
    }) =>
      apiClient.patch<ProjectComment>(
        `/projects/${projectId}/comments/${commentId}`,
        data,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: projectKeys.comments(projectId),
      });
      queryClient.invalidateQueries({ queryKey: projectKeys.details() });
    },
  });
}

export function useDeleteProjectComment(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) =>
      apiClient.delete(`/projects/${projectId}/comments/${commentId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: projectKeys.comments(projectId),
      });
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
    },
  });
}

// ─── Makers ──────────────────────────────────────────────────────────────────

export function useUpdateMakerRole(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ makerUserId, role }: { makerUserId: string; role: string }) =>
      apiClient.patch<ProjectMaker>(
        `/projects/${projectId}/makers/${makerUserId}`,
        { role },
      ),
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

// ─── Bookmarks ───────────────────────────────────────────────────────────────

export function useToggleBookmark(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiClient.post<{ action: string }>(`/projects/${projectId}/bookmark`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
    },
  });
}

export function useBookmarkedProjects(page = 1, limit = 20) {
  return useQuery({
    queryKey: [...projectKeys.bookmarks(), page],
    queryFn: () =>
      apiClient.get<PaginatedProjects>('/projects/bookmarks', {
        params: { page, limit },
      } as never),
  });
}

// ─── Reviews ─────────────────────────────────────────────────────────────────

export function useProjectReviews(projectId: string, page = 1, limit = 10) {
  return useQuery({
    queryKey: [...projectKeys.reviews(projectId), page],
    queryFn: () =>
      apiClient.get<PaginatedReviews>(`/projects/${projectId}/reviews`, {
        params: { page, limit },
      } as never),
    enabled: !!projectId,
  });
}

export function useCreateProjectReview(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProjectReviewInput) =>
      apiClient.post<ProjectReview>(`/projects/${projectId}/reviews`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: projectKeys.reviews(projectId),
      });
      queryClient.invalidateQueries({ queryKey: projectKeys.details() });
    },
  });
}

export function useUpdateProjectReview(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      reviewId,
      data,
    }: {
      reviewId: string;
      data: UpdateProjectReviewInput;
    }) =>
      apiClient.patch<ProjectReview>(
        `/projects/${projectId}/reviews/${reviewId}`,
        data,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: projectKeys.reviews(projectId),
      });
      queryClient.invalidateQueries({ queryKey: projectKeys.details() });
    },
  });
}

export function useDeleteProjectReview(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reviewId: string) =>
      apiClient.delete(`/projects/${projectId}/reviews/${reviewId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: projectKeys.reviews(projectId),
      });
      queryClient.invalidateQueries({ queryKey: projectKeys.details() });
    },
  });
}

// ─── Updates / Changelog ─────────────────────────────────────────────────────

export function useProjectUpdates(projectId: string, page = 1, limit = 10) {
  return useQuery({
    queryKey: [...projectKeys.updates(projectId), page],
    queryFn: () =>
      apiClient.get<PaginatedUpdates>(`/projects/${projectId}/updates`, {
        params: { page, limit },
      } as never),
    enabled: !!projectId,
  });
}

export function useCreateProjectUpdate(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProjectUpdateInput) =>
      apiClient.post<ProjectUpdateEntry>(
        `/projects/${projectId}/updates`,
        data,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: projectKeys.updates(projectId),
      });
    },
  });
}

export function useUpdateProjectUpdate(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      updateId,
      data,
    }: {
      updateId: string;
      data: UpdateProjectUpdateInput;
    }) =>
      apiClient.patch<ProjectUpdateEntry>(
        `/projects/${projectId}/updates/${updateId}`,
        data,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: projectKeys.updates(projectId),
      });
    },
  });
}

export function useDeleteProjectUpdate(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (updateId: string) =>
      apiClient.delete(`/projects/${projectId}/updates/${updateId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: projectKeys.updates(projectId),
      });
    },
  });
}

// ─── Related Projects ────────────────────────────────────────────────────────

export function useRelatedProjects(slug: string) {
  return useQuery({
    queryKey: projectKeys.related(slug),
    queryFn: () =>
      apiClient.get<Project[]>(`/projects/${slug}/related`, {
        params: { limit: 4 },
      } as never),
    enabled: !!slug,
  });
}

// ─── Launch Day ──────────────────────────────────────────────────────────────

export function useLaunchingTodayProjects(page = 1, limit = 6) {
  return useQuery({
    queryKey: [...projectKeys.launchingToday(), page],
    queryFn: () =>
      apiClient.get<PaginatedProjects>('/projects/launching-today', {
        params: { page, limit },
      } as never),
  });
}

// ─── Views / Analytics ───────────────────────────────────────────────────────

export function useRecordProjectView(projectId: string) {
  return useMutation({
    mutationFn: () => apiClient.post(`/projects/${projectId}/view`),
  });
}

export interface ProjectAnalytics {
  totals: {
    views: number;
    upvotes: number;
    comments: number;
    bookmarks: number;
    reviews: number;
    averageRating: number;
  };
  timeSeries: {
    views: { date: string; count: number }[];
    votes: { date: string; count: number }[];
    comments: { date: string; count: number }[];
    reviews: { date: string; count: number }[];
  };
}

export function useProjectAnalytics(projectId: string) {
  return useQuery({
    queryKey: projectKeys.analytics(projectId),
    queryFn: () =>
      apiClient.get<ProjectAnalytics>(`/projects/${projectId}/analytics`),
    enabled: !!projectId,
  });
}
