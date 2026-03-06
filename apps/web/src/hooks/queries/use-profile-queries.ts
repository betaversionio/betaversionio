import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface CustomDomain {
  id: string;
  domain: string;
  verified: boolean;
  createdAt: string;
}

export interface FullProfile {
  id: string;
  email: string;
  username: string;
  name: string | null;
  avatarUrl: string | null;
  profile: {
    bio: string | null;
    headline: string | null;
    location: string | null;
    website: string | null;
    portfolioTemplateId: string | null;
  } | null;
  socialLinks: Array<{ platform: string; url: string }>;
  techStack: Array<{
    name: string;
    category: string;
    proficiency: string;
  }>;
  education: Array<{
    id: string;
    institution: string;
    degree: string;
    fieldOfStudy: string | null;
    startDate: string;
    endDate: string | null;
    current: boolean;
    description: string | null;
  }>;
  experiences: Array<{
    id: string;
    company: string;
    position: string;
    location: string | null;
    employmentType: string;
    startDate: string;
    endDate: string | null;
    current: boolean;
    description: string | null;
  }>;
  services: Array<{
    id: string;
    title: string;
    description: string | null;
  }>;
  projects: Array<{
    id: string;
    title: string;
    slug: string;
    tagline: string | null;
    demoUrl: string | null;
    links: string[];
    techStack: string[];
    isOpenSource: boolean;
  }>;
  customDomains: CustomDomain[];
}

export const profileKeys = {
  all: ['profile'] as const,
  me: () => [...profileKeys.all, 'me'] as const,
};

export function useMyFullProfile() {
  return useQuery({
    queryKey: profileKeys.me(),
    queryFn: () => apiClient.get<FullProfile>('/users/me'),
  });
}

export function useAddCustomDomain() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (domain: string) =>
      apiClient.post<CustomDomain>('/users/me/domains', { domain }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.me() });
    },
  });
}

export function useVerifyCustomDomain() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (domainId: string) =>
      apiClient.post<{ verified: boolean; domain: string }>(
        `/users/me/domains/${domainId}/verify`,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.me() });
    },
  });
}

export function useRemoveCustomDomain() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (domainId: string) =>
      apiClient.delete(`/users/me/domains/${domainId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.me() });
    },
  });
}
