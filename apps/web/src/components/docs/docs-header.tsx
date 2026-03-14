'use client';

import Link from 'next/link';
import { Menu, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { useSidebar } from '@/components/layout/sidebar/sidebar-context';

export function DocsHeader() {
  const { setMobileOpen } = useSidebar();

  return (
    <header className="absolute inset-x-0 top-0 z-10 flex h-14 items-center justify-between border-b bg-background/80 px-6 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="size-5" />
        </Button>
        <span className="text-sm font-semibold">Docs</span>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Button variant="ghost" size="sm" asChild>
          <Link href="/">
            <ArrowLeft className="mr-1.5 size-4" />
            Home
          </Link>
        </Button>
      </div>
    </header>
  );
}
