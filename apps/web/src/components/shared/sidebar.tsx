'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { SidebarContext, useSidebar } from './sidebar-context';
import { LogoWithText } from './logo-with-text';
import { Logo } from './logo';
import { HugeiconsIcon } from '@hugeicons/react';
import type { IconSvgElement } from '@hugeicons/react';
import {
  DashboardSquare01Icon,
  UserIcon,
  KanbanIcon,
  File01Icon,
  RssIcon,
  Idea01Icon,
  Settings01Icon,
  Logout01Icon,
  ArrowLeft01Icon,
} from '@hugeicons/core-free-icons';

const sidebarItems: {
  href: string;
  label: string;
  icon: IconSvgElement;
}[] = [
  { href: '/dashboard', label: 'Dashboard', icon: DashboardSquare01Icon },
  { href: '/profile', label: 'My Profile', icon: UserIcon },
  { href: '/projects', label: 'Projects', icon: KanbanIcon },
  { href: '/resume', label: 'Resume', icon: File01Icon },
  { href: '/feed', label: 'Feed', icon: RssIcon },
  { href: '/ideas', label: 'Ideas', icon: Idea01Icon },
  { href: '/settings', label: 'Settings', icon: Settings01Icon },
];

function getInitials(name: string | null | undefined): string {
  if (!name) return 'U';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function SidebarHeader({ collapsed }: { collapsed: boolean }) {
  return (
    <div
      className={cn(
        'flex h-14 items-center ',
        collapsed ? 'justify-center px-3' : 'gap-2 px-4',
      )}
    >
      {collapsed ? (
        <Logo className="h-9 w-9 text-foreground" />
      ) : (
        <LogoWithText />
      )}
    </div>
  );
}

function SidebarNav({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 space-y-1 overflow-y-auto p-2">
      {sidebarItems.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(item.href + '/');
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center rounded-lg px-3 py-2 text-sm font-normal transition-colors',
              isActive ? 'bg-accent/50' : 'hover:bg-accent/50',
              collapsed && 'justify-center px-2',
            )}
          >
            <HugeiconsIcon
              icon={item.icon}
              size={18}
              // fill={isActive ? 'currentColor' : 'none'}
              className={cn('shrink-0', !collapsed && 'mr-3')}
            />
            {!collapsed && <span>{item.label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarFooter({
  collapsed,
  onLogout,
}: {
  collapsed: boolean;
  onLogout: () => void;
}) {
  const { user } = useAuth();

  return (
    <div className="border-t p-2">
      <div
        className={cn(
          'flex items-center rounded-md p-2',
          collapsed ? 'justify-center' : 'gap-3',
        )}
      >
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarImage
            src={user?.avatarUrl ?? undefined}
            alt={user?.name ?? user?.username ?? 'User'}
          />
          <AvatarFallback className="text-xs">
            {getInitials(user?.name)}
          </AvatarFallback>
        </Avatar>
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">
              {user?.name ?? user?.username}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              @{user?.username}
            </p>
          </div>
        )}
        {!collapsed && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
            onClick={onLogout}
          >
            <HugeiconsIcon icon={Logout01Icon} size={16} />
          </Button>
        )}
      </div>
    </div>
  );
}

interface SidebarProps {
  onLogout: () => void;
}

export function Sidebar({ onLogout }: SidebarProps) {
  const { collapsed, toggle, mobileOpen, setMobileOpen } = useSidebar();

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          'relative hidden h-dvh flex-col border-r bg-background transition-all duration-300 md:flex',
          collapsed ? 'w-16' : 'w-64',
        )}
      >
        <SidebarHeader collapsed={collapsed} />
        <SidebarNav collapsed={collapsed} />
        <SidebarFooter collapsed={collapsed} onLogout={onLogout} />

        {/* Floating collapse toggle */}
        <Button
          variant="outline"
          size="icon"
          onClick={toggle}
          className="absolute top-14 -right-3 z-50 h-6 w-6 -translate-y-1/2 rounded-full border bg-background shadow-sm"
        >
          <HugeiconsIcon
            icon={ArrowLeft01Icon}
            size={14}
            className={cn('transition-transform', collapsed && 'rotate-180')}
          />
        </Button>
      </aside>

      {/* Mobile drawer */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="left"
          className="w-64 p-0 [&>button:last-child]:hidden"
        >
          <SidebarContext.Provider
            value={{
              collapsed: false,
              setCollapsed: () => {},
              toggle: () => {},
              mobileOpen,
              setMobileOpen,
            }}
          >
            <aside className="flex h-full flex-col bg-background">
              <SidebarHeader collapsed={false} />
              <SidebarNav collapsed={false} />
              <SidebarFooter collapsed={false} onLogout={onLogout} />
            </aside>
          </SidebarContext.Provider>
        </SheetContent>
      </Sheet>
    </>
  );
}
