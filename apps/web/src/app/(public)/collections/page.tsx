'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCollections } from '@/hooks/queries/use-collection-queries';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserAvatar } from '@/components/shared/user-avatar';
import { Button } from '@/components/ui/button';
import { HeroSection } from '@/components/ui/hero-section';
import { Loader2, Library } from 'lucide-react';

export default function CollectionsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useCollections({ page, limit: 12 });

  return (
    <div className="flex flex-col">
      <HeroSection className="pt-20 pb-14 md:pt-28 md:pb-20">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
            Project <span className="text-primary">Collections</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Curated lists of projects by the community
          </p>
        </div>
      </HeroSection>

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
                <Card key={collection.id} className="group relative">
                  <Link
                    href={`/collections/${collection.slug}`}
                    className="absolute inset-0 z-0"
                  />
                  <CardHeader>
                    <CardTitle className="line-clamp-1">
                      {collection.title}
                    </CardTitle>
                    {collection.description && (
                      <CardDescription className="line-clamp-2">
                        {collection.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <UserAvatar
                          src={collection.author.avatarUrl}
                          name={collection.author.name}
                          className="h-5 w-5"
                          fallbackClassName="text-[10px]"
                        />
                        <span className="text-xs text-muted-foreground">
                          {collection.author.username}
                        </span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {collection._count?.items ?? 0} projects
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {data.meta.totalPages > 1 && (
              <div className="mt-6 flex justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= data.meta.totalPages}
                  onClick={() => setPage((p) => p + 1)}
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
