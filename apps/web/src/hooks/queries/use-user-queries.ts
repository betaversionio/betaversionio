import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

interface UserProfile {
  id: string;
  email: string;
  username: string;
  name: string | null;
  avatarUrl: string | null;
  bio: string | null;
  headline: string | null;
  location: string | null;
  website: string | null;
  socialLinks: Array<{ platform: string; url: string }>;
  techStack: Array<{
    name: string;
    category: string;
    proficiency: string;
  }>;
  projects: Array<{
    id: string;
    title: string;
    slug: string;
    shortDescription: string | null;
    techStack: string[];
    status: string;
  }>;
}

interface UserSearchResult {
  id: string;
  username: string;
  name: string | null;
  avatarUrl: string | null;
  headline: string | null;
}

interface PaginatedUsers {
  items: UserSearchResult[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const userKeys = {
  all: ["users"] as const,
  profile: (username: string) => [...userKeys.all, "profile", username] as const,
  search: (query: string) => [...userKeys.all, "search", query] as const,
};

export function useUserProfile(username: string) {
  return useQuery({
    queryKey: userKeys.profile(username),
    queryFn: () => apiClient.get<UserProfile>(`/users/${username}`),
    enabled: !!username,
  });
}

export function useSearchUsers(query: string) {
  return useQuery({
    queryKey: userKeys.search(query),
    queryFn: () =>
      apiClient.get<PaginatedUsers>("/users", {
        params: { search: query, limit: 20 },
      } as never),
    enabled: query.length >= 2,
  });
}
