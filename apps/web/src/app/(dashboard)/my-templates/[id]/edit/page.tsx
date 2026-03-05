'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createPortfolioTemplateSchema } from '@betaversionio/shared';
import type { CreatePortfolioTemplateInput } from '@betaversionio/shared';
import { useTemplate, useUpdateTemplate, useDeleteTemplate } from '@/hooks/queries';
import { useToast } from '@/hooks/use-toast';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MarkdownEditor } from '@/components/ui/markdown-editor';
import { Badge } from '@/components/ui/badge';
import { AvatarUpload } from '@/components/patterns/p-file-upload-2';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldTitle,
} from '@/components/ui/field';
import { Loader2, X, Globe, EyeOff } from 'lucide-react';

export default function EditTemplatePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();

  const { data: template, isLoading: isLoadingTemplate } = useTemplate(params.id);
  const updateTemplate = useUpdateTemplate(params.id);
  const deleteTemplate = useDeleteTemplate();

  const [tagInput, setTagInput] = useState('');

  const {
    register,
    setValue,
    watch,
    handleSubmit,
    reset,
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

  useEffect(() => {
    if (template) {
      reset({
        name: template.name,
        description: template.description,
        previewImage: template.previewImage ?? '',
        baseUrl: template.baseUrl ?? '',
        previewUrl: template.previewUrl ?? undefined,
        repoUrl: template.repoUrl ?? undefined,
        tags: template.tags,
      });
    }
  }, [template, reset]);

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
      await updateTemplate.mutateAsync(data);
      toast({
        title: 'Template updated',
        description: 'Your changes have been saved.',
      });
      router.push('/my-templates');
    } catch {
      toast({
        title: 'Failed to update template',
        description: 'Please try again.',
        variant: 'destructive',
      });
    }
  }

  async function handleDelete() {
    try {
      await deleteTemplate.mutateAsync(params.id);
      toast({
        title: 'Template deleted',
        description: 'Your template has been removed.',
      });
      router.push('/my-templates');
    } catch {
      toast({
        title: 'Failed to delete template',
        description: 'Please try again.',
        variant: 'destructive',
      });
    }
  }

  if (isLoadingTemplate) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Template"
        description="Update your portfolio template."
      />

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <FieldGroup>
              {/* Preview Image */}
              <Field data-invalid={!!errors.previewImage}>
                <FieldLabel>Preview Image</FieldLabel>
                <FieldDescription>
                  Landscape screenshot of your template (16:9 recommended).
                </FieldDescription>
                <AvatarUpload
                  maxSize={2 * 1024 * 1024}
                  rounded="md"
                  previewClassName="aspect-video w-[480px]"
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
                <FieldLabel>Description</FieldLabel>
                <MarkdownEditor
                  value={watch('description')}
                  onChange={(val) => setValue('description', val)}
                  placeholder="Describe what makes your template unique..."
                  outputFormat="markdown"
                  height={200}
                  maxHeight={400}
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
              <Button type="submit" disabled={updateTemplate.isPending}>
                {updateTemplate.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Publish / Unpublish */}
      <Card>
        <CardHeader>
          <CardTitle>
            {template?.status === 'Published' ? 'Unpublish Template' : 'Publish Template'}
          </CardTitle>
          <CardDescription>
            {template?.status === 'Published'
              ? 'Your template is live in the marketplace. Unpublishing will hide it from other users.'
              : 'Your template is in draft. Publishing will make it visible in the marketplace.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {template?.status === 'Published' ? (
            <Button
              variant="outline"
              disabled={updateTemplate.isPending}
              onClick={async () => {
                try {
                  await updateTemplate.mutateAsync({ status: 'Draft' });
                  toast({
                    title: 'Template unpublished',
                    description: 'Your template has been moved back to draft.',
                  });
                } catch {
                  toast({
                    title: 'Failed to unpublish',
                    description: 'Please try again.',
                    variant: 'destructive',
                  });
                }
              }}
            >
              {updateTemplate.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <EyeOff className="mr-2 h-4 w-4" />
              )}
              Unpublish
            </Button>
          ) : (
            <Button
              disabled={updateTemplate.isPending}
              onClick={async () => {
                try {
                  await updateTemplate.mutateAsync({ status: 'Published' });
                  toast({
                    title: 'Template published',
                    description: 'Your template is now live in the marketplace.',
                  });
                } catch {
                  toast({
                    title: 'Failed to publish',
                    description: 'Please try again.',
                    variant: 'destructive',
                  });
                }
              }}
            >
              {updateTemplate.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Globe className="mr-2 h-4 w-4" />
              )}
              Publish
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Delete Template */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Delete Template</CardTitle>
          <CardDescription>
            Permanently remove this template from the marketplace. This action cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Delete Template</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete template?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete &quot;{template?.name}&quot;. This
                  action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={handleDelete}
                  disabled={deleteTemplate.isPending}
                >
                  {deleteTemplate.isPending ? 'Deleting...' : 'Delete'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
