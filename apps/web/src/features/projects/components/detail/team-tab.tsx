'use client';

import Link from 'next/link';
import type { ProjectMaker } from '@/hooks/queries/use-project-queries';
import { Badge } from '@/components/ui/badge';
import { UserAvatar } from '@/components/shared/user-avatar';
import { People } from 'iconsax-react';

interface TeamTabProps {
  makers: ProjectMaker[];
}

export function TeamTab({ makers }: TeamTabProps) {
  if (makers.length === 0) {
    return (
      <div className="mt-6 flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <People
            size={20}
            color="currentColor"
            variant="Linear"
            className="text-muted-foreground"
          />
        </div>
        <p className="mt-4 text-sm font-medium">No team members listed</p>
        <p className="mt-1 text-xs text-muted-foreground">
          The project owner hasn&apos;t added any makers yet.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-2">
      {makers.map((maker) => (
        <Link
          key={maker.id}
          href={`/@${maker.user.username}`}
          className="flex items-center justify-between rounded-lg border bg-card px-4 py-3 transition-colors hover:bg-muted/30"
        >
          <div className="flex items-center gap-3">
            <UserAvatar
              src={maker.user.avatarUrl}
              name={maker.user.name}
              className="h-9 w-9"
              fallbackClassName="text-xs"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                {maker.user.name ?? maker.user.username}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                @{maker.user.username}
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="text-xs">
            {maker.role}
          </Badge>
        </Link>
      ))}
    </div>
  );
}
