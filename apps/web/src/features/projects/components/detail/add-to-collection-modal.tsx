'use client';

import { useState } from 'react';
import { useAuth } from '@/providers/auth-provider';
import {
  useCollections,
  useCreateCollection,
} from '@/hooks/queries/use-collection-queries';
import { apiClient } from '@/lib/api-client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Plus, Library, Loader2, Check } from 'lucide-react';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100);
}

interface AddToCollectionModalProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddToCollectionModal({
  projectId,
  open,
  onOpenChange,
}: AddToCollectionModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data, isLoading, refetch } = useCollections({
    authorId: user?.id,
    limit: 50,
  });
  const createCollection = useCreateCollection();

  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [addingTo, setAddingTo] = useState<string | null>(null);

  async function handleAdd(collectionId: string, collectionTitle: string) {
    setAddingTo(collectionId);
    try {
      await apiClient.post(`/collections/${collectionId}/items`, { projectId });
      toast({ title: `Added to "${collectionTitle}"` });
      refetch();
      onOpenChange(false);
    } catch {
      toast({
        title: 'Already in this collection',
        variant: 'destructive',
      });
    } finally {
      setAddingTo(null);
    }
  }

  async function handleCreate() {
    if (!newTitle.trim()) return;
    try {
      const collection = await createCollection.mutateAsync({
        title: newTitle.trim(),
        slug: slugify(newTitle),
        isPublic: true,
      });
      await apiClient.post(`/collections/${collection.id}/items`, {
        projectId,
      });
      toast({
        title: `Created "${collection.title}" and added project`,
      });
      setNewTitle('');
      setShowCreate(false);
      onOpenChange(false);
    } catch {
      toast({
        title: 'Failed to create collection',
        variant: 'destructive',
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Add to Collection</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-2">
            {data?.items && data.items.length > 0 ? (
              <div className="max-h-60 space-y-1 overflow-y-auto">
                {data.items.map((collection) => (
                  <button
                    key={collection.id}
                    type="button"
                    disabled={addingTo === collection.id}
                    className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted disabled:opacity-50"
                    onClick={() => handleAdd(collection.id, collection.title)}
                  >
                    <div className="flex items-center gap-2">
                      <Library className="h-4 w-4 text-muted-foreground" />
                      <span>{collection.title}</span>
                      <span className="text-xs text-muted-foreground">
                        ({collection._count?.items ?? 0})
                      </span>
                    </div>
                    {addingTo === collection.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <p className="py-4 text-center text-sm text-muted-foreground">
                You don&apos;t have any collections yet.
              </p>
            )}

            {showCreate ? (
              <div className="flex gap-2 pt-2">
                <Input
                  placeholder="Collection name"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleCreate();
                    }
                  }}
                  autoFocus
                />
                <Button
                  size="sm"
                  disabled={!newTitle.trim()}
                  isLoading={createCollection.isPending}
                  onClick={handleCreate}
                >
                  <Check className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-1.5"
                onClick={() => setShowCreate(true)}
              >
                <Plus className="h-4 w-4" />
                New Collection
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
