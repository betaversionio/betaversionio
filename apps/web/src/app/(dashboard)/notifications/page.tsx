'use client';

import { useState } from 'react';
import {
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
} from '@/hooks/queries/use-notification-queries';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/shared/user-avatar';
import { timeAgo } from '@/lib/format';
import { PageHeader } from '@/components/shared/page-header';
import { cn } from '@/lib/utils';
import { Loader2, Bell, CheckCheck } from 'lucide-react';
import Link from 'next/link';

export default function NotificationsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useNotifications(page);
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Stay up to date with activity on your projects."
      >
        {data?.items.some((n) => !n.isRead) && (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => markAllAsRead.mutate()}
            isLoading={markAllAsRead.isPending}
          >
            <CheckCheck className="h-4 w-4" />
            Mark all as read
          </Button>
        )}
      </PageHeader>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : !data?.items.length ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <Bell className="h-10 w-10 text-muted-foreground" />
          <h3 className="mt-4 font-semibold">No notifications</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            You&apos;re all caught up!
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          {data.items.map((notification) => (
            <div
              key={notification.id}
              className={cn(
                'flex items-start gap-3 rounded-lg px-4 py-3 transition-colors',
                !notification.isRead && 'bg-primary/5',
              )}
              role="button"
              onClick={() => {
                if (!notification.isRead) markAsRead.mutate(notification.id);
              }}
            >
              <UserAvatar
                src={notification.actor?.avatarUrl}
                name={notification.actor?.name}
                className="mt-0.5 h-8 w-8"
                fallbackClassName="text-[10px]"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm">
                  {notification.title}
                </p>
                {notification.body && (
                  <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                    {notification.body}
                  </p>
                )}
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {timeAgo(notification.createdAt)}
                </p>
              </div>
              {!notification.isRead && (
                <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
              )}
            </div>
          ))}
        </div>
      )}

      {data && data.meta.totalPages > 1 && (
        <div className="flex justify-center gap-2">
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
    </div>
  );
}
