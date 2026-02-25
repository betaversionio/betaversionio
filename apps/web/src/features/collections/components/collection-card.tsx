'use client';

import Link from 'next/link';
import type { ProjectCollection } from '@/hooks/queries/use-collection-queries';
import { UserAvatar } from '@/components/shared/user-avatar';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface CollectionCardProps {
  collection: ProjectCollection;
  showAuthor?: boolean;
}

export function CollectionCard({
  collection,
  showAuthor = true,
}: CollectionCardProps) {
  return (
    <Card className="group relative">
      <Link
        href={`/collections/${collection.slug}`}
        className="absolute inset-0 z-0"
      />
      <CardHeader>
        <CardTitle className="line-clamp-1">{collection.title}</CardTitle>
        {collection.description && (
          <CardDescription className="line-clamp-2">
            {collection.description.replace(/<[^>]*>/g, '')}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          {showAuthor && (
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
          )}
          <Badge variant="secondary" className="text-xs">
            {collection._count?.items ?? 0} projects
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
