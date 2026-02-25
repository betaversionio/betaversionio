'use client';

import type { CollectionItem } from '@/hooks/queries/use-collection-queries';
import { ProjectCard } from '@/features/projects';
import { CloseCircle } from 'iconsax-react';

interface CollectionItemGridProps {
  items: CollectionItem[];
  isOwner: boolean;
  onRemoveItem: (itemId: string) => void;
}

export function CollectionItemGrid({
  items,
  isOwner,
  onRemoveItem,
}: CollectionItemGridProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
        <p className="text-sm font-medium">This collection is empty</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
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
              onClick={() => onRemoveItem(item.id)}
            >
              <CloseCircle size={16} color="currentColor" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
