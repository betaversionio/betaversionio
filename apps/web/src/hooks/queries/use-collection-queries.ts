import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type {
  CreateCollectionInput,
  UpdateCollectionInput,
  AddCollectionItemInput,
} from "@devcom/shared";
import type { Project, ProjectAuthor } from "./use-project-queries";

export interface CollectionItem {
  id: string;
  collectionId: string;
  projectId: string;
  note: string | null;
  position: number;
  project: Project;
}

export interface ProjectCollection {
  id: string;
  authorId: string;
  title: string;
  slug: string;
  description: string | null;
  isPublic: boolean;
  coverImage: string | null;
  createdAt: string;
  updatedAt: string;
  author: ProjectAuthor;
  items?: CollectionItem[];
  _count?: { items: number };
}

interface PaginatedCollections {
  items: ProjectCollection[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const collectionKeys = {
  all: ["collections"] as const,
  lists: () => [...collectionKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>) =>
    [...collectionKeys.lists(), filters] as const,
  detail: (slug: string) => [...collectionKeys.all, "detail", slug] as const,
};

export function useCollections(
  filters: { page?: number; limit?: number; authorId?: string } = {},
) {
  return useQuery({
    queryKey: collectionKeys.list(filters),
    queryFn: () =>
      apiClient.get<PaginatedCollections>("/collections", {
        params: filters as Record<string, string | number | boolean | undefined>,
      } as never),
  });
}

export function useCollection(slug: string) {
  return useQuery({
    queryKey: collectionKeys.detail(slug),
    queryFn: () =>
      apiClient.get<ProjectCollection>(`/collections/${slug}`),
    enabled: !!slug,
  });
}

export function useCreateCollection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCollectionInput) =>
      apiClient.post<ProjectCollection>("/collections", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: collectionKeys.lists() });
    },
  });
}

export function useUpdateCollection(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateCollectionInput) =>
      apiClient.patch<ProjectCollection>(`/collections/${slug}`, data),
    onSuccess: (updated) => {
      queryClient.setQueryData(collectionKeys.detail(slug), updated);
      queryClient.invalidateQueries({ queryKey: collectionKeys.lists() });
    },
  });
}

export function useDeleteCollection(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiClient.delete(`/collections/${slug}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: collectionKeys.lists() });
    },
  });
}

export function useAddCollectionItem(collectionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AddCollectionItemInput) =>
      apiClient.post(`/collections/${collectionId}/items`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: collectionKeys.all });
    },
  });
}

export function useRemoveCollectionItem(collectionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) =>
      apiClient.delete(`/collections/${collectionId}/items/${itemId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: collectionKeys.all });
    },
  });
}
