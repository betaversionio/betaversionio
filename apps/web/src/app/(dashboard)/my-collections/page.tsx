'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createCollectionSchema } from '@devcom/shared';
import { useAuth } from '@/providers/auth-provider';
import {
  useCollections,
  useCreateCollection,
} from '@/hooks/queries/use-collection-queries';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MarkdownEditor } from '@/components/ui/markdown-editor';
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
  FieldDescription,
} from '@/components/ui/field';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Add, Book, Eye, EyeSlash } from 'iconsax-react';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100);
}

export default function MyCollectionsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data, isLoading } = useCollections({
    authorId: user?.id,
  });
  const createCollection = useCreateCollection();
  const [showForm, setShowForm] = useState(false);

  type FormValues = z.input<typeof createCollectionSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(createCollectionSchema),
    defaultValues: {
      title: '',
      slug: '',
      description: '',
      isPublic: true,
    },
  });

  const isPublic = form.watch('isPublic');
  const description = form.watch('description');

  function handleOpenChange(open: boolean) {
    setShowForm(open);
    if (!open) form.reset();
  }

  async function onSubmit(data: FormValues) {
    try {
      await createCollection.mutateAsync({
        title: data.title,
        slug: slugify(data.title),
        description: data.description?.trim() || undefined,
        isPublic: data.isPublic ?? true,
      });
      form.reset();
      setShowForm(false);
    } catch (error) {
      toast({
        title: 'Failed to create collection',
        description:
          error instanceof Error ? error.message : 'Something went wrong.',
        variant: 'destructive',
      });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Collections</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Organize projects into curated lists.
          </p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => setShowForm(true)}>
          <Add size={16} color="currentColor" />
          New Collection
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-foreground" />
        </div>
      ) : !data?.items.length ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <Book size={40} className="text-muted-foreground" color="currentColor" />
          <h3 className="mt-4 font-semibold">No collections yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Create your first collection to organize projects.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.items.map((collection) => (
            <Card key={collection.id} className="group relative">
              <Link
                href={`/collections/${collection.slug}`}
                className="absolute inset-0 z-0"
              />
              <CardHeader>
                <CardTitle className="line-clamp-1">{collection.title}</CardTitle>
                {collection.description && (
                  <CardDescription className="line-clamp-2">
                    {collection.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <Badge variant="secondary" className="text-xs">
                  {collection._count?.items ?? 0} projects
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={handleOpenChange}>
        <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
          <DialogHeader className="border-b px-6 py-4">
            <DialogTitle>Create Collection</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-1 flex-col overflow-hidden"
          >
            <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
              <FieldGroup>
                <Field>
                  <FieldLabel>Title</FieldLabel>
                  <Input
                    placeholder="Collection title"
                    {...form.register('title')}
                  />
                  <FieldError errors={[form.formState.errors.title]} />
                </Field>
                <Field>
                  <FieldLabel>Description</FieldLabel>
                  <MarkdownEditor
                    value={description ?? ''}
                    onChange={(val) => form.setValue('description', val)}
                    placeholder="Describe this collection..."
                    height={160}
                    maxHeight={300}
                    outputFormat="html"
                  />
                  <FieldError errors={[form.formState.errors.description]} />
                </Field>
                <Field orientation="horizontal">
                  <FieldLabel
                    className="cursor-pointer"
                    onClick={() => form.setValue('isPublic', !isPublic)}
                  >
                    <span className="flex items-center gap-1.5">
                      {isPublic ? (
                        <Eye size={14} color="currentColor" />
                      ) : (
                        <EyeSlash size={14} color="currentColor" />
                      )}
                      {isPublic ? 'Public' : 'Private'}
                    </span>
                    <FieldDescription>
                      {isPublic
                        ? 'Anyone can see this collection'
                        : 'Only you can see this collection'}
                    </FieldDescription>
                  </FieldLabel>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isPublic}
                    onClick={() => form.setValue('isPublic', !isPublic)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
                      isPublic ? 'bg-primary' : 'bg-muted'
                    }`}
                  >
                    <span
                      className={`pointer-events-none block h-4 w-4 rounded-full bg-background shadow-sm transition-transform ${
                        isPublic ? 'translate-x-[18px]' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </Field>
              </FieldGroup>
            </div>
            <DialogFooter className="border-t px-6 py-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                isLoading={createCollection.isPending}
              >
                Create
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
