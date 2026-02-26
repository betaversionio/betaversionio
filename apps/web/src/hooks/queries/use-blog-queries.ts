import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type {
  CreateBlogInput,
  UpdateBlogInput,
  ToggleBlogVoteInput,
  CreateBlogCommentInput,
  UpdateBlogCommentInput,
} from '@betaversionio/shared';

export interface BlogAuthor {
  id: string;
  username: string;
  name: string | null;
  avatarUrl: string | null;
}

export interface BlogComment {
  id: string;
  blogId: string;
  authorId: string;
  content: string;
  parentId: string | null;
  editedAt: string | null;
  author: BlogAuthor;
  replies?: BlogComment[];
  createdAt: string;
  updatedAt: string;
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  tags: string[];
  status: string;
  upvotesCount: number;
  commentsCount: number;
  viewsCount: number;
  authorId: string;
  author: BlogAuthor;
  hasVoted?: boolean;
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

type PaginatedBlogs = PaginatedResponse<Blog>;
export type PaginatedBlogComments = PaginatedResponse<BlogComment>;

interface BlogFilters {
  authorId?: string;
  status?: string;
  search?: string;
  tags?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

export const blogKeys = {
  all: ['blogs'] as const,
  lists: () => [...blogKeys.all, 'list'] as const,
  list: (filters: BlogFilters) => [...blogKeys.lists(), filters] as const,
  details: () => [...blogKeys.all, 'detail'] as const,
  detail: (slug: string) => [...blogKeys.details(), slug] as const,
  comments: (blogId: string) => [...blogKeys.all, 'comments', blogId] as const,
};

// ─── Core Queries ────────────────────────────────────────────────────────────

export function useBlogs(
  filters: BlogFilters = {},
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: blogKeys.list(filters),
    queryFn: () =>
      apiClient.get<PaginatedBlogs>('/blogs', {
        params: filters as Record<
          string,
          string | number | boolean | undefined
        >,
      } as never),
    enabled: options?.enabled,
  });
}

export function useBlog(slug: string) {
  return useQuery({
    queryKey: blogKeys.detail(slug),
    queryFn: () => apiClient.get<Blog>(`/blogs/${slug}`),
    enabled: !!slug,
  });
}

export function useCreateBlog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBlogInput) => apiClient.post<Blog>('/blogs', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blogKeys.lists() });
    },
  });
}

export function useUpdateBlog(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateBlogInput) =>
      apiClient.patch<Blog>(`/blogs/${slug}`, data),
    onSuccess: (updatedBlog) => {
      queryClient.setQueryData(blogKeys.detail(slug), updatedBlog);
      queryClient.invalidateQueries({ queryKey: blogKeys.lists() });
    },
  });
}

export function useDeleteBlog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (slug: string) => apiClient.delete(`/blogs/${slug}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blogKeys.lists() });
    },
  });
}

export function useRecordBlogView(blogId: string) {
  return useMutation({
    mutationFn: () => apiClient.post(`/blogs/${blogId}/view`),
  });
}

// ─── Votes ───────────────────────────────────────────────────────────────────

export function useToggleBlogVote(blogId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ToggleBlogVoteInput) =>
      apiClient.post<{ action: string; value: number }>(
        `/blogs/${blogId}/vote`,
        data,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blogKeys.all });
    },
  });
}

// ─── Comments ────────────────────────────────────────────────────────────────

export function useBlogComments(blogId: string, page = 1, limit = 20) {
  return useQuery({
    queryKey: [...blogKeys.comments(blogId), page],
    queryFn: () =>
      apiClient.get<PaginatedBlogComments>(`/blogs/${blogId}/comments`, {
        params: { page, limit },
      } as never),
    enabled: !!blogId,
  });
}

export function useCreateBlogComment(blogId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBlogCommentInput) =>
      apiClient.post<BlogComment>(`/blogs/${blogId}/comments`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: blogKeys.comments(blogId),
      });
      queryClient.invalidateQueries({ queryKey: blogKeys.all });
    },
  });
}

export function useUpdateBlogComment(blogId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      commentId,
      data,
    }: {
      commentId: string;
      data: UpdateBlogCommentInput;
    }) =>
      apiClient.patch<BlogComment>(
        `/blogs/${blogId}/comments/${commentId}`,
        data,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: blogKeys.comments(blogId),
      });
      queryClient.invalidateQueries({ queryKey: blogKeys.details() });
    },
  });
}

export function useDeleteBlogComment(blogId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) =>
      apiClient.delete(`/blogs/${blogId}/comments/${commentId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: blogKeys.comments(blogId),
      });
      queryClient.invalidateQueries({ queryKey: blogKeys.all });
    },
  });
}
