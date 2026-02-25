import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { CreateInvitationInput } from "@devcom/shared";
import type { ProjectAuthor } from "./use-project-queries";

export interface ProjectInvitation {
  id: string;
  projectId: string;
  inviterId: string;
  inviteeId: string;
  role: string;
  status: string;
  message: string | null;
  respondedAt: string | null;
  createdAt: string;
  project?: {
    id: string;
    title: string;
    slug: string;
    logo: string | null;
  };
  inviter?: ProjectAuthor;
  invitee?: ProjectAuthor;
}

export const invitationKeys = {
  all: ["invitations"] as const,
  received: () => [...invitationKeys.all, "received"] as const,
  project: (projectId: string) =>
    [...invitationKeys.all, "project", projectId] as const,
};

export function useReceivedInvitations() {
  return useQuery({
    queryKey: invitationKeys.received(),
    queryFn: () =>
      apiClient.get<ProjectInvitation[]>("/users/me/invitations"),
  });
}

export function useProjectInvitations(projectId: string) {
  return useQuery({
    queryKey: invitationKeys.project(projectId),
    queryFn: () =>
      apiClient.get<ProjectInvitation[]>(
        `/projects/${projectId}/invitations`,
      ),
    enabled: !!projectId,
  });
}

export function useCreateInvitation(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateInvitationInput) =>
      apiClient.post<ProjectInvitation>(
        `/projects/${projectId}/invitations`,
        data,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: invitationKeys.project(projectId),
      });
    },
  });
}

export function useCancelInvitation(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (invitationId: string) =>
      apiClient.delete(
        `/projects/${projectId}/invitations/${invitationId}`,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: invitationKeys.project(projectId),
      });
    },
  });
}

export function useRespondToInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      invitationId,
      action,
    }: {
      invitationId: string;
      action: "accept" | "reject";
    }) =>
      apiClient.patch(`/users/me/invitations/${invitationId}`, { action }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invitationKeys.all });
    },
  });
}
