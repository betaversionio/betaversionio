'use client';

import { useAuth } from '@/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { UserMenu } from '@/components/shared/user-menu';
import { NotificationBell } from '@/features/notifications/notification-bell';
import { useSidebar } from './sidebar/sidebar-context';
import { HambergerMenu } from 'iconsax-react';

export function DashboardHeader() {
  const { user, logout } = useAuth();
  const { setMobileOpen } = useSidebar();

  return (
    <header className="absolute inset-x-0 top-0 z-10 flex h-14 items-center justify-between border-b bg-background/80 px-6 backdrop-blur-md">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
      >
        <HambergerMenu size={20} color="currentColor" />
      </Button>
      <div className="hidden md:block" />

      <div className="flex items-center gap-2">
        <NotificationBell />
        <ThemeToggle />
        {user && <UserMenu user={user} onLogout={logout} />}
      </div>
    </header>
  );
}
