'use client';

import { parseAsInteger, useQueryState } from 'nuqs';
import { useCollections } from '@/hooks/queries/use-collection-queries';
import { CollectionCard } from '@/features/collections';
import { Button } from '@/components/ui/button';
import { HeroSection } from '@/components/ui/hero-section';
import { Loader2, Library } from 'lucide-react';

export function CollectionsContent() {
  const [page, setPage] = useQueryState(
    'page',
    parseAsInteger.withDefault(1),
  );
  const { data, isLoading } = useCollections({ page, limit: 12 });

  return (
    <div className="flex flex-col">
      <HeroSection
        title="Project"
        highlightedText="Collections"
        description="Curated lists of projects by the community"
        className="pt-20 pb-14 md:pt-28 md:pb-20"
      />

      <div className="container px-4 pt-6 pb-12 md:px-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : !data?.items.length ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
            <Library className="h-10 w-10 text-muted-foreground" />
            <h3 className="mt-4 font-semibold">No collections yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Be the first to create a collection.
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {data.items.map((collection) => (
                <CollectionCard
                  key={collection.id}
                  collection={collection}
                />
              ))}
            </div>

            {data.meta.totalPages > 1 && (
              <div className="mt-6 flex justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= data.meta.totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
