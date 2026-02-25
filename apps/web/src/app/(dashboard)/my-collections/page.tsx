'use client';

import { useState } from 'react';
import { useAuth } from '@/providers/auth-provider';
import {
  useCollections,
  useCreateCollection,
} from '@/hooks/queries/use-collection-queries';
import { useToast } from '@/hooks/use-toast';
import {
  CollectionCard,
  CollectionFormDialog,
  type CollectionFormValues,
} from '@/features/collections';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/page-header';
import { slugify } from '@/lib/utils';
import { Add, Book } from 'iconsax-react';

export default function MyCollectionsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data, isLoading } = useCollections({ authorId: user?.id });
  const createCollection = useCreateCollection();
  const [showForm, setShowForm] = useState(false);

  async function handleCreate(data: CollectionFormValues) {
    try {
      await createCollection.mutateAsync({
        title: data.title,
        slug: slugify(data.title),
        description: data.description?.trim() || undefined,
        isPublic: data.isPublic ?? true,
      });
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
      <PageHeader
        title="My Collections"
        description="Organize projects into curated lists."
      >
        <Button onClick={() => setShowForm(true)}>
          <Add size={16} color="currentColor" />
          New Collection
        </Button>
      </PageHeader>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-foreground" />
        </div>
      ) : !data?.items.length ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <Book
            size={40}
            className="text-muted-foreground"
            color="currentColor"
          />
          <h3 className="mt-4 font-semibold">No collections yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Create your first collection to organize projects.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.items.map((collection) => (
            <CollectionCard
              key={collection.id}
              collection={collection}
              showAuthor={false}
            />
          ))}
        </div>
      )}

      <CollectionFormDialog
        open={showForm}
        onOpenChange={setShowForm}
        dialogTitle="Create Collection"
        submitLabel="Create"
        defaultValues={{ title: '', description: '', isPublic: true }}
        isPending={createCollection.isPending}
        onSubmit={handleCreate}
      />
    </div>
  );
}
