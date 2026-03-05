'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createPortfolioTemplateSchema } from '@betaversionio/shared';
import type { CreatePortfolioTemplateInput } from '@betaversionio/shared';
import { useCreateTemplate } from '@/hooks/queries';
import { useToast } from '@/hooks/use-toast';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { AvatarUpload } from '@/components/patterns/p-file-upload-2';
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldTitle,
} from '@/components/ui/field';
import { Loader2, X } from 'lucide-react';

export default function NewTemplatePage() {
  const router = useRouter();
  const { toast } = useToast();
  const createTemplate = useCreateTemplate();

  const [tagInput, setTagInput] = useState('');

  const {
    register,
    setValue,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<CreatePortfolioTemplateInput>({
    resolver: zodResolver(createPortfolioTemplateSchema) as never,
    defaultValues: {
      name: '',
      description: '',
      previewImage: '',
      baseUrl: '',
      previewUrl: undefined,
      repoUrl: undefined,
      tags: [],
    },
  });

  const tags = watch('tags') ?? [];
  const previewImage = watch('previewImage');

  function addTag(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const value = tagInput.trim();
      if (value && !tags.includes(value) && tags.length < 10) {
        setValue('tags', [...tags, value]);
      }
      setTagInput('');
    }
  }

  function removeTag(tag: string) {
    setValue(
      'tags',
      tags.filter((t) => t !== tag),
    );
  }

  async function onSubmit(data: CreatePortfolioTemplateInput) {
    try {
      await createTemplate.mutateAsync(data);
      toast({
        title: 'Template created',
        description: 'Your template has been saved as a draft. Publish it when ready.',
      });
      router.push('/my-templates');
    } catch {
      toast({
        title: 'Failed to submit template',
        description: 'Please try again.',
        variant: 'destructive',
      });
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="New Template"
        description="Create a new portfolio template."
      />

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <FieldGroup>
              {/* Preview Image */}
              <Field data-invalid={!!errors.previewImage}>
                <AvatarUpload
                  maxSize={2 * 1024 * 1024}
                  rounded="md"
                  defaultAvatar={previewImage || undefined}
                  uploadFolder="templates/previews"
                  onUpload={(url) => setValue('previewImage', url ?? '')}
                />
                <FieldError>{errors.previewImage?.message}</FieldError>
              </Field>

              {/* Name */}
              <Field data-invalid={!!errors.name}>
                <FieldLabel htmlFor="name">Name</FieldLabel>
                <Input
                  id="name"
                  placeholder="My Portfolio Template"
                  {...register('name')}
                />
                <FieldError>{errors.name?.message}</FieldError>
              </Field>

              {/* Description */}
              <Field data-invalid={!!errors.description}>
                <FieldLabel htmlFor="description">Description</FieldLabel>
                <Textarea
                  id="description"
                  placeholder="Describe what makes your template unique..."
                  rows={4}
                  {...register('description')}
                />
                <FieldError>{errors.description?.message}</FieldError>
              </Field>

              {/* Base URL */}
              <Field data-invalid={!!errors.baseUrl}>
                <FieldLabel htmlFor="baseUrl">Base URL</FieldLabel>
                <FieldDescription>
                  The URL where your template is hosted. Requests will be sent to {'{baseUrl}/{username}/...'}
                </FieldDescription>
                <Input
                  id="baseUrl"
                  placeholder="https://my-template.vercel.app"
                  {...register('baseUrl')}
                />
                <FieldError>{errors.baseUrl?.message}</FieldError>
              </Field>

              {/* Preview URL */}
              <Field data-invalid={!!errors.previewUrl}>
                <FieldLabel htmlFor="previewUrl">Preview URL</FieldLabel>
                <FieldDescription>
                  Live demo URL for users to preview.
                </FieldDescription>
                <Input
                  id="previewUrl"
                  placeholder="https://demo.my-template.com"
                  {...register('previewUrl')}
                />
                <FieldError>{errors.previewUrl?.message}</FieldError>
              </Field>

              {/* Repo URL */}
              <Field data-invalid={!!errors.repoUrl}>
                <FieldLabel htmlFor="repoUrl">Repository URL</FieldLabel>
                <FieldDescription>
                  Source code repository.
                </FieldDescription>
                <Input
                  id="repoUrl"
                  placeholder="https://github.com/user/template"
                  {...register('repoUrl')}
                />
                <FieldError>{errors.repoUrl?.message}</FieldError>
              </Field>

              {/* Tags */}
              <Field>
                <FieldTitle>Tags</FieldTitle>
                <FieldDescription>
                  Add up to 10 tags to help users discover your template.
                </FieldDescription>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="gap-1">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 rounded-full hover:bg-muted-foreground/20"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                <Input
                  placeholder="Type a tag and press Enter"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={addTag}
                />
              </Field>
            </FieldGroup>

            <div className="flex justify-end">
              <Button type="submit" disabled={createTemplate.isPending}>
                {createTemplate.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create Template
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
