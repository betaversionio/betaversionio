'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { ArrowLeft2 } from 'iconsax-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  SidebarContext,
  useSidebar,
} from '@/components/layout/sidebar/sidebar-context';

interface SidebarShellProps {
  children: ReactNode;
}

export function SidebarShell({ children }: SidebarShellProps) {
  const { collapsed, toggle, mobileOpen, setMobileOpen } = useSidebar();

  return (
    <TooltipProvider>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          'border-border bg-sidebar relative hidden h-dvh flex-col border-r transition-all duration-300 md:flex',
          collapsed ? 'w-16' : 'w-64',
        )}
      >
        {children}

        {/* Floating collapse toggle */}
        <Button
          variant="outline"
          size="icon"
          onClick={toggle}
          className="bg-card dark:bg-card absolute top-14 -right-3 z-50 h-6 w-6 -translate-y-1/2 rounded-full border shadow-sm"
        >
          <ArrowLeft2
            size={16}
            color="currentColor"
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
            <aside className="bg-sidebar flex h-full flex-col">
              {children}
            </aside>
          </SidebarContext.Provider>
        </SheetContent>
      </Sheet>
    </TooltipProvider>
  );
}
