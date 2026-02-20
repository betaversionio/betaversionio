import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { CreateResumeInput, UpdateResumeInput } from "@devcom/shared";

interface Resume {
  id: string;
  title: string;
  templateId: string | null;
  sections: {
    education: Array<{
      institution: string;
      degree: string;
      fieldOfStudy?: string;
      startDate: string;
      endDate?: string;
      current: boolean;
      description?: string;
    }>;
    experience: Array<{
      company: string;
      position: string;
      location?: string;
      startDate: string;
      endDate?: string;
      current: boolean;
      description?: string;
      highlights: string[];
    }>;
    skills: Array<{
      name: string;
      level?: string;
    }>;
    certifications: Array<{
      name: string;
      issuer: string;
      issueDate: string;
      expiryDate?: string;
      credentialId?: string;
      credentialUrl?: string;
    }>;
    customSections: Array<{
      title: string;
      content?: string;
      items: Array<{
        title: string;
        subtitle?: string;
        date?: string;
        description?: string;
      }>;
    }>;
  };
  createdAt: string;
  updatedAt: string;
}

export const resumeKeys = {
  all: ["resumes"] as const,
  lists: () => [...resumeKeys.all, "list"] as const,
  details: () => [...resumeKeys.all, "detail"] as const,
  detail: (id: string) => [...resumeKeys.details(), id] as const,
};

export function useResumes() {
  return useQuery({
    queryKey: resumeKeys.lists(),
    queryFn: () => apiClient.get<Resume[]>("/resumes"),
  });
}

export function useResume(id: string) {
  return useQuery({
    queryKey: resumeKeys.detail(id),
    queryFn: () => apiClient.get<Resume>(`/resumes/${id}`),
    enabled: !!id,
  });
}

export function useCreateResume() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateResumeInput) =>
      apiClient.post<Resume>("/resumes", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resumeKeys.lists() });
    },
  });
}

export function useUpdateResume(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateResumeInput) =>
      apiClient.patch<Resume>(`/resumes/${id}`, data),
    onSuccess: (updatedResume) => {
      queryClient.setQueryData(resumeKeys.detail(id), updatedResume);
      queryClient.invalidateQueries({ queryKey: resumeKeys.lists() });
    },
  });
}
