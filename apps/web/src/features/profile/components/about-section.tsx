'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';
import { profileKeys } from '@/hooks/queries';
import { authKeys } from '@/features/auth';
import { Button } from '@/components/ui/button';
import { MarkdownEditor } from '@/components/ui/markdown-editor';

interface AboutSectionProps {
  initialBio?: string | null;
}

export function AboutSection({ initialBio }: AboutSectionProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [bio, setBio] = useState(initialBio ?? '');

  useEffect(() => {
    setBio(initialBio ?? '');
  }, [initialBio]);

  const mutation = useMutation({
    mutationFn: (data: { bio: string }) =>
      apiClient.patch('/users/me/profile', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.me() });
      queryClient.invalidateQueries({ queryKey: authKeys.me() });
      toast({
        title: 'About updated',
        description: 'Your bio has been saved.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Update failed',
        description:
          error instanceof Error ? error.message : 'Failed to update bio.',
        variant: 'destructive',
      });
    },
  });

  return (
    <div className="space-y-4">
      <MarkdownEditor
        value={bio}
        onChange={setBio}
        placeholder="Tell the world about yourself..."
        outputFormat="markdown"
        height={300}
        maxHeight={600}
      />
      <Button
        type="button"
        isLoading={mutation.isPending}
        onClick={() => mutation.mutate({ bio })}
      >
        Save About
      </Button>
    </div>
  );
}
