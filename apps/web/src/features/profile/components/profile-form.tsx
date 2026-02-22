'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateProfileSchema } from '@devcom/shared';
import type { UpdateProfileInput } from '@devcom/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/providers/auth-provider';
import { useToast } from '@/hooks/use-toast';
import { authKeys } from '@/features/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
} from '@/components/ui/field';

export function ProfileForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: user?.name ?? '',
      bio: '',
      headline: '',
      location: '',
      website: '',
    },
  });

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

        <Field>
          <FieldLabel htmlFor="bio">Bio</FieldLabel>
          <Textarea
            id="bio"
            placeholder="Tell the world about yourself..."
            rows={4}
            {...form.register('bio')}
          />
          <FieldError errors={[form.formState.errors.bio]} />
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
