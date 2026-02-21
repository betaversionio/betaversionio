'use client';

import { cn } from '@/lib/utils';
import { Logo } from '@/components/shared/logo';
import { LogoWithText } from '@/components/shared/logo-with-text';
import { useSidebar } from './sidebar-context';

export function SidebarHeader() {
  const { collapsed } = useSidebar();

  return (
    <div
      className={cn(
        'mt-2 flex h-14 items-center',
        collapsed ? 'justify-center px-3' : 'mb-1 px-4',
      )}
    >
      {collapsed ? (
        <Logo className="h-10 w-10 text-foreground" />
      ) : (
        <LogoWithText />
      )}
    </div>
  );
}
