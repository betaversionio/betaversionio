'use client';

import Link from 'next/link';
import { useUnreadCount } from '@/hooks/queries/use-notification-queries';
import { Button } from '@/components/ui/button';
import { Notification } from 'iconsax-react';

export function NotificationBell() {
  const { data } = useUnreadCount();
  const count = data?.count ?? 0;

  return (
    <Button variant="ghost" size="icon" className="relative h-8 w-8" asChild>
      <Link href="/notifications">
        <Notification size={16} color="currentColor" />
        {count > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-medium text-destructive-foreground">
            {count > 99 ? '99+' : count}
          </span>
        )}
      </Link>
    </Button>
  );
}
