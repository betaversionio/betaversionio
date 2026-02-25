import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

// ─── Types ──────────────────────────────────────────────────────────────────

interface FollowUser {
  id: string;
  username: string;
  name: string | null;
  avatarUrl: string | null;
  profile: { headline: string | null } | null;
  followedAt?: string;
}

interface SuggestedUser extends FollowUser {
  score: number;
}

interface PaginatedFollowUsers {
  items: FollowUser[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface FollowCounts {
  followersCount: number;
  followingCount: number;
}

interface FollowStatus {
  following: boolean;
}

// ─── Query Keys ─────────────────────────────────────────────────────────────

export const followKeys = {
  all: ["follows"] as const,
  counts: (userId: string) => [...followKeys.all, "counts", userId] as const,
  status: (userId: string) => [...followKeys.all, "status", userId] as const,
  followers: (page: number) =>
    [...followKeys.all, "followers", page] as const,
  following: (page: number) =>
    [...followKeys.all, "following", page] as const,
  mutuals: (page: number) => [...followKeys.all, "mutuals", page] as const,
  suggested: () => [...followKeys.all, "suggested"] as const,
};

// ─── Queries ────────────────────────────────────────────────────────────────

export function useFollowCounts(userId: string | undefined) {
  return useQuery({
    queryKey: followKeys.counts(userId!),
    queryFn: () => apiClient.get<FollowCounts>(`/follows/${userId}/counts`),
    enabled: !!userId,
  });
}

export function useFollowStatus(userId: string | undefined) {
  return useQuery({
    queryKey: followKeys.status(userId!),
    queryFn: () => apiClient.get<FollowStatus>(`/follows/${userId}/check`),
    enabled: !!userId,
  });
}

export function useMyFollowers(page: number = 1) {
  return useQuery({
    queryKey: followKeys.followers(page),
    queryFn: () =>
      apiClient.get<PaginatedFollowUsers>("/follows/me/followers", {
        params: { page, limit: 20 },
      }),
  });
}

export function useMyFollowing(page: number = 1) {
  return useQuery({
    queryKey: followKeys.following(page),
    queryFn: () =>
      apiClient.get<PaginatedFollowUsers>("/follows/me/following", {
        params: { page, limit: 20 },
      }),
  });
}

export function useMyMutuals(page: number = 1) {
  return useQuery({
    queryKey: followKeys.mutuals(page),
    queryFn: () =>
      apiClient.get<PaginatedFollowUsers>("/follows/me/mutuals", {
        params: { page, limit: 20 },
      }),
  });
}

export function useSuggestedUsers(limit: number = 10) {
  return useQuery({
    queryKey: followKeys.suggested(),
    queryFn: () =>
      apiClient.get<SuggestedUser[]>("/follows/me/suggested", {
        params: { limit },
      }),
  });
}

// ─── Mutations ──────────────────────────────────────────────────────────────

export function useToggleFollow(targetUserId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      apiClient.post<FollowStatus>(`/follows/${targetUserId}/toggle`),
    onMutate: async () => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({
        queryKey: followKeys.status(targetUserId),
      });
      await queryClient.cancelQueries({
        queryKey: followKeys.counts(targetUserId),
      });

      // Snapshot previous values
      const prevStatus = queryClient.getQueryData<FollowStatus>(
        followKeys.status(targetUserId),
      );
      const prevCounts = queryClient.getQueryData<FollowCounts>(
        followKeys.counts(targetUserId),
      );

      // Optimistic update
      if (prevStatus) {
        queryClient.setQueryData<FollowStatus>(
          followKeys.status(targetUserId),
          { following: !prevStatus.following },
        );
      }
      if (prevCounts) {
        const delta = prevStatus?.following ? -1 : 1;
        queryClient.setQueryData<FollowCounts>(
          followKeys.counts(targetUserId),
          {
            ...prevCounts,
            followersCount: Math.max(0, prevCounts.followersCount + delta),
          },
        );
      }

      return { prevStatus, prevCounts };
    },
    onError: (_err, _vars, context) => {
      // Rollback on error
      if (context?.prevStatus) {
        queryClient.setQueryData(
          followKeys.status(targetUserId),
          context.prevStatus,
        );
      }
      if (context?.prevCounts) {
        queryClient.setQueryData(
          followKeys.counts(targetUserId),
          context.prevCounts,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: followKeys.status(targetUserId),
      });
      queryClient.invalidateQueries({
        queryKey: followKeys.counts(targetUserId),
      });
      // Invalidate all list queries
      queryClient.invalidateQueries({ queryKey: followKeys.all });
    },
  });
}
