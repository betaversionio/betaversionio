'use client';

import { use, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import {
  useCollection,
  useUpdateCollection,
  useDeleteCollection,
  useRemoveCollectionItem,
} from '@/hooks/queries/use-collection-queries';
import { useToast } from '@/hooks/use-toast';
import {
  CollectionHeader,
  CollectionItemGrid,
  CollectionFormDialog,
  type CollectionFormValues,
} from '@/features/collections';
import { Button } from '@/components/ui/button';

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

  const [showEdit, setShowEdit] = useState(false);

  const editDefaults = useMemo(
    () => ({
      title: collection?.title ?? '',
      description: collection?.description ?? '',
      isPublic: collection?.isPublic ?? true,
    }),
    [collection?.title, collection?.description, collection?.isPublic],
  );

  async function handleUpdate(data: CollectionFormValues) {
    try {
      await updateCollection.mutateAsync({
        ...data,
        description: data.description?.trim() || undefined,
      });
      setShowEdit(false);
    } catch (err) {
      toast({
        title: 'Failed to update collection',
        description:
          err instanceof Error ? err.message : 'Something went wrong.',
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
        <CollectionHeader
          collection={collection}
          isOwner={isOwner}
          onEdit={() => setShowEdit(true)}
          onDelete={handleDelete}
        />

        <CollectionItemGrid
          items={collection.items ?? []}
          isOwner={isOwner}
          onRemoveItem={handleRemoveItem}
        />
      </div>

      <CollectionFormDialog
        open={showEdit}
        onOpenChange={setShowEdit}
        dialogTitle="Edit Collection"
        submitLabel="Save Changes"
        defaultValues={editDefaults}
        isPending={updateCollection.isPending}
        onSubmit={handleUpdate}
      />
    </div>
  );
}
