'use client';

import Link from 'next/link';
import { useAuth } from '@/providers/auth-provider';
import { UserAvatar } from '@/components/shared/user-avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { useSidebar } from './sidebar/sidebar-context';
import { HambergerMenu, User, Logout } from 'iconsax-react';

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
        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-8 w-8 rounded-full"
            >
              <UserAvatar
                src={user?.avatarUrl}
                name={user?.name}
                className="h-8 w-8"
                fallbackClassName="text-xs"
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">
                  {user?.name ?? user?.username ?? 'User'}
                </p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/u/${user?.username}`}>
                <User size={16} color="currentColor" className="mr-2" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => logout()}
              className="text-destructive focus:text-destructive"
            >
              <Logout size={16} color="currentColor" className="mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
