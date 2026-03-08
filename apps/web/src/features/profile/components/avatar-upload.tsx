'use client';

import { AvatarUpload as AvatarUploadPattern } from '@/components/patterns/p-file-upload-2';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { authKeys } from '@/features/auth';
import { profileKeys } from '@/hooks/queries';
import { useToast } from '@/hooks/use-toast';

interface ProfileAvatarUploadProps {
  avatarUrl?: string | null;
}

export function ProfileAvatarUpload({ avatarUrl }: ProfileAvatarUploadProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (url: string | undefined) =>
      apiClient.patch('/users/me/profile', { avatarUrl: url ?? null }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.me() });
      queryClient.invalidateQueries({ queryKey: profileKeys.me() });
    },
    onError: () => {
      toast({
        title: 'Failed to update avatar',
        variant: 'destructive',
      });
    },
  });

  return (
    <AvatarUploadPattern
      maxSize={10 * 1024 * 1024}
      defaultAvatar={avatarUrl ?? undefined}
      uploadFolder="avatars"
      onUpload={(url) => mutation.mutate(url)}
    />
  );
}
