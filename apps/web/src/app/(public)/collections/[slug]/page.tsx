'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateCollectionSchema } from '@devcom/shared';
import type { UpdateCollectionInput } from '@devcom/shared';
import { useAuth } from '@/providers/auth-provider';
import {
  useCollection,
  useUpdateCollection,
  useDeleteCollection,
  useRemoveCollectionItem,
} from '@/hooks/queries/use-collection-queries';
import { useToast } from '@/hooks/use-toast';
import { ProjectCard } from '@/features/projects';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
  FieldDescription,
} from '@/components/ui/field';
import { UserAvatar } from '@/components/shared/user-avatar';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { MarkdownEditor } from '@/components/ui/markdown-editor';
import { Edit2, Trash, CloseCircle, Eye, EyeSlash, Lock } from 'iconsax-react';

function Spinner() {
  return (
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-foreground" />
  );
}

export default function CollectionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: collection, isLoading, error } = useCollection(slug);
  const updateCollection = useUpdateCollection(slug);
  const deleteCollection = useDeleteCollection(slug);
  const removeItem = useRemoveCollectionItem(collection?.id ?? '');

  const isOwner = !!user && !!collection && user.id === collection.authorId;

  // Edit form
  const [showEdit, setShowEdit] = useState(false);
  const form = useForm<UpdateCollectionInput>({
    resolver: zodResolver(updateCollectionSchema),
    defaultValues: {
      title: '',
      description: '',
      isPublic: true,
    },
  });

  const isPublic = form.watch('isPublic');
  const description = form.watch('description');

  useEffect(() => {
    if (collection) {
      form.reset({
        title: collection.title,
        description: collection.description ?? '',
        isPublic: collection.isPublic,
      });
    }
  }, [collection, form]);

  function handleEditOpenChange(open: boolean) {
    setShowEdit(open);
    if (!open && collection) {
      form.reset({
        title: collection.title,
        description: collection.description ?? '',
        isPublic: collection.isPublic,
      });
    }
  }

  async function onSubmit(data: UpdateCollectionInput) {
    try {
      await updateCollection.mutateAsync({
        ...data,
        description: data.description?.trim() || undefined,
      });
      setShowEdit(false);
    } catch (error) {
      toast({
        title: 'Failed to update collection',
        description:
          error instanceof Error ? error.message : 'Something went wrong.',
        variant: 'destructive',
      });
    }
  }

  async function handleDelete() {
    await deleteCollection.mutateAsync();
    router.push('/my-collections');
  }

  async function handleRemoveItem(itemId: string) {
    await removeItem.mutateAsync(itemId);
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error || !collection) {
    return (
      <div className="container flex min-h-[60vh] flex-col items-center justify-center px-4">
        <h2 className="text-2xl font-bold">Collection not found</h2>
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/collections">Back to collections</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container px-4 pb-8 pt-20 md:pb-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold">{collection.title}</h1>
                {!collection.isPublic && (
                  <Lock size={18} className="shrink-0 text-muted-foreground" color="currentColor" />
                )}
              </div>
              {collection.description && (
                <div
                  className="prose prose-sm dark:prose-invert mt-2 max-w-none text-muted-foreground"
                  dangerouslySetInnerHTML={{ __html: collection.description }}
                />
              )}
            </div>
            {isOwner && (
              <div className="flex shrink-0 items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => setShowEdit(true)}
                >
                  <Edit2 size={14} color="currentColor" />
                  Edit
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1.5 text-destructive hover:text-destructive">
                      <Trash size={14} color="currentColor" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete collection?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete &quot;{collection.title}&quot; and remove all
                        its items. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={handleDelete}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </div>
          <div className="mt-4 flex items-center gap-3">
            <Link
              href={`/@${collection.author.username}`}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <UserAvatar
                src={collection.author.avatarUrl}
                name={collection.author.name}
                className="h-6 w-6"
                fallbackClassName="text-[8px]"
              />
              {collection.author.name ?? collection.author.username}
            </Link>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              {collection.isPublic ? (
                <>
                  <Eye size={13} color="currentColor" />
                  Public
                </>
              ) : (
                <>
                  <EyeSlash size={13} color="currentColor" />
                  Private
                </>
              )}
            </span>
          </div>
        </div>

        {collection.items && collection.items.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {collection.items.map((item) => (
              <div key={item.id} className="group relative">
                <ProjectCard project={item.project} />
                {item.note && (
                  <p className="mt-1 px-1 text-xs text-muted-foreground italic">
                    {item.note}
                  </p>
                )}
                {isOwner && (
                  <button
                    className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-background/80 text-muted-foreground opacity-0 shadow-sm backdrop-blur transition-opacity hover:text-destructive group-hover:opacity-100"
                    title="Remove from collection"
                    onClick={() => handleRemoveItem(item.id)}
                  >
                    <CloseCircle size={16} color="currentColor" />
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
            <p className="text-sm font-medium">This collection is empty</p>
          </div>
        )}
      </div>

      {/* Edit dialog */}
      <Dialog open={showEdit} onOpenChange={handleEditOpenChange}>
        <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
          <DialogHeader className="border-b px-6 py-4">
            <DialogTitle>Edit Collection</DialogTitle>
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
                onClick={() => handleEditOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                isLoading={updateCollection.isPending}
              >
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
