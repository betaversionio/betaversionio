'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateProfileSchema } from '@betaversionio/shared';
import type { UpdateProfileInput } from '@betaversionio/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/providers/auth-provider';
import { useToast } from '@/hooks/use-toast';
import { authKeys } from '@/features/auth';
import { profileKeys } from '@/hooks/queries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
} from '@/components/ui/field';

interface ProfileFormProps {
  initialData?: {
    name?: string | null;
    headline?: string | null;
    location?: string | null;
    website?: string | null;
  };
}

export function ProfileForm({ initialData }: ProfileFormProps = {}) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: user?.name ?? '',
      headline: '',
      location: '',
      website: '',
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name ?? user?.name ?? '',
        headline: initialData.headline ?? '',
        location: initialData.location ?? '',
        website: initialData.website ?? '',
      });
    }
  }, [initialData, user?.name, form]);

  const mutation = useMutation({
    mutationFn: (data: UpdateProfileInput) => {
      const body: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(data)) {
        if (value !== '') body[key] = value;
      }
      return apiClient.patch('/users/me/profile', body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.me() });
      queryClient.invalidateQueries({ queryKey: profileKeys.me() });
      toast({
        title: 'Profile updated',
        description: 'Your profile has been saved.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Update failed',
        description:
          error instanceof Error ? error.message : 'Failed to update profile.',
        variant: 'destructive',
      });
    },
  });

  return (
    <form
      onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
      className="space-y-5"
    >
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="name">Name</FieldLabel>
          <Input id="name" {...form.register('name')} />
          <FieldError errors={[form.formState.errors.name]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="headline">Headline</FieldLabel>
          <Input
            id="headline"
            placeholder="Full-stack developer passionate about open source"
            {...form.register('headline')}
          />
          <FieldError errors={[form.formState.errors.headline]} />
        </Field>

        <div className="grid gap-5 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="location">Location</FieldLabel>
            <Input
              id="location"
              placeholder="San Francisco, CA"
              {...form.register('location')}
            />
            <FieldError errors={[form.formState.errors.location]} />
          </Field>
          <Field>
            <FieldLabel htmlFor="website">Website</FieldLabel>
            <Input
              id="website"
              placeholder="https://yoursite.com"
              {...form.register('website')}
            />
            <FieldError errors={[form.formState.errors.website]} />
          </Field>
        </div>
      </FieldGroup>

      <Button type="submit" isLoading={mutation.isPending}>
        Save Profile
      </Button>
    </form>
  );
}
