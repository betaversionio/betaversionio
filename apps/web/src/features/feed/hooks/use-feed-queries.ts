import {
  useInfiniteQuery,
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type {
  CreatePostInput,
  CreateCommentInput,
  ToggleReactionInput,
} from "@devcom/shared";

interface PostAuthor {
  id: string;
  username: string;
  name: string | null;
  avatarUrl: string | null;
}

interface Reaction {
  type: string;
  count: number;
  hasReacted: boolean;
}

interface Post {
  id: string;
  type: string;
  content: string;
  title: string | null;
  codeSnippet: { code: string; language: string } | null;
  hashtags: string[];
  author: PostAuthor;
  reactions: Reaction[];
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  updatedAt: string;
}

interface Comment {
  id: string;
  content: string;
  author: PostAuthor;
  parentId: string | null;
  createdAt: string;
}

interface CursorPaginatedPosts {
  items: Post[];
  meta: {
    nextCursor: string | null;
    hasMore: boolean;
  };
}

interface PostDetail extends Post {
  comments: Comment[];
}

export const feedKeys = {
  all: ["feed"] as const,
  lists: () => [...feedKeys.all, "list"] as const,
  details: () => [...feedKeys.all, "detail"] as const,
  detail: (id: string) => [...feedKeys.details(), id] as const,
};

export function useFeed() {
  return useInfiniteQuery({
    queryKey: feedKeys.lists(),
    queryFn: ({ pageParam }: { pageParam: string | undefined }) =>
      apiClient.get<CursorPaginatedPosts>("/posts/feed", {
        params: {
          cursor: pageParam,
          limit: 20,
        },
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasMore ? lastPage.meta.nextCursor ?? undefined : undefined,
  });
}

export function usePost(id: string) {
  return useQuery({
    queryKey: feedKeys.detail(id),
    queryFn: () => apiClient.get<PostDetail>(`/posts/${id}`),
    enabled: !!id,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePostInput) =>
      apiClient.post<Post>("/posts", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feedKeys.lists() });
    },
  });
}

export function useToggleReaction(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ToggleReactionInput) =>
      apiClient.post<{ toggled: boolean }>(`/posts/${postId}/reactions`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feedKeys.lists() });
      queryClient.invalidateQueries({ queryKey: feedKeys.detail(postId) });
    },
  });
}

export function useCreateComment(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCommentInput) =>
      apiClient.post<Comment>(`/posts/${postId}/comments`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feedKeys.detail(postId) });
      queryClient.invalidateQueries({ queryKey: feedKeys.lists() });
    },
  });
}
