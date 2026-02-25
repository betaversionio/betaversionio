'use client';

import Link from 'next/link';
import type { ProjectCollection } from '@/hooks/queries/use-collection-queries';
import { UserAvatar } from '@/components/shared/user-avatar';
import { Button } from '@/components/ui/button';
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
import { Edit2, Trash, Eye, EyeSlash, Lock } from 'iconsax-react';

interface CollectionHeaderProps {
  collection: ProjectCollection;
  isOwner: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export function CollectionHeader({
  collection,
  isOwner,
  onEdit,
  onDelete,
}: CollectionHeaderProps) {
  const { title, description, isPublic, author } = collection;

  return (
    <div className="mb-8">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">{title}</h1>
            {!isPublic && (
              <Lock
                size={18}
                className="shrink-0 text-muted-foreground"
                color="currentColor"
              />
            )}
          </div>
          {description && (
            <div
              className="prose prose-sm dark:prose-invert mt-2 max-w-none text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: description }}
            />
          )}
        </div>
        {isOwner && (
          <div className="flex shrink-0 items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={onEdit}
            >
              <Edit2 size={14} color="currentColor" />
              Edit
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-destructive hover:text-destructive"
                >
                  <Trash size={14} color="currentColor" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete collection?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete &quot;{title}&quot; and remove
                    all its items. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={onDelete}
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
          href={`/@${author.username}`}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <UserAvatar
            src={author.avatarUrl}
            name={author.name}
            className="h-6 w-6"
            fallbackClassName="text-[8px]"
          />
          {author.name ?? author.username}
        </Link>
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          {isPublic ? (
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
  );
}
