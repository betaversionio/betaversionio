import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { CreateResumeInput, UpdateResumeInput } from "@devcom/shared";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/v1";

export interface Resume {
  id: string;
  title: string;
  templateId: string | null;
  latexSource: string | null;
  githubRepo: string | null;
  githubPath: string | null;
  githubSha: string | null;
  isPrimary: boolean;
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
  versions: Array<{
    id: string;
    pdfUrl: string;
    generatedAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface PublicResumeInfo {
  id: string;
  title: string;
  pdfUrl: string | null;
  generatedAt: string | null;
}

export const resumeKeys = {
  all: ["resumes"] as const,
  lists: () => [...resumeKeys.all, "list"] as const,
  details: () => [...resumeKeys.all, "detail"] as const,
  detail: (id: string) => [...resumeKeys.details(), id] as const,
  public: (username: string) => [...resumeKeys.all, "public", username] as const,
};

export function useResumes() {
  return useQuery({
    queryKey: resumeKeys.lists(),
    queryFn: () => apiClient.get<Resume[]>("/resumes"),
  });
}

export function usePublicResume(username: string) {
  return useQuery({
    queryKey: resumeKeys.public(username),
    queryFn: () => apiClient.get<PublicResumeInfo>(`/resumes/u/${username}`),
    enabled: !!username,
    retry: false,
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

export function useDeleteResume() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/resumes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resumeKeys.lists() });
    },
  });
}

/**
 * Compile LaTeX source and return a Blob (PDF).
 * Uses raw fetch because apiClient parses JSON — we need a binary response.
 */
export function useCompileResume(id: string) {
  return useMutation({
    mutationFn: async (latexSource: string): Promise<Blob> => {
      const res = await fetch(`${API_URL}/resumes/${id}/compile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ latexSource }),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(
          (error as any)?.message || `Compilation failed (${res.status})`,
        );
      }

      return res.blob();
    },
  });
}

export function useGeneratePdf(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      apiClient.post<{ id: string; pdfUrl: string; generatedAt: string }>(
        `/resumes/${id}/generate-pdf`,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resumeKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: resumeKeys.lists() });
    },
  });
}

export function useSetPrimaryResume() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiClient.patch<Resume>(`/resumes/${id}/set-primary`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resumeKeys.all });
    },
  });
}

export function useUnsetPrimaryResume() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete(`/resumes/${id}/set-primary`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resumeKeys.all });
    },
  });
}
