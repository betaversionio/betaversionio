'use client';

import {
  Book1,
  Flash,
  Code1,
  Component,
  DocumentCode2,
  ExportSquare,
  Global,
} from 'iconsax-react';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/components/layout/sidebar/sidebar-context';
import { SidebarNavGroup } from '@/components/layout/sidebar/sidebar-nav';
import type { NavGroup } from '@/components/layout/sidebar/sidebar-config';

const docNavGroups: NavGroup[] = [
  {
    title: 'Getting Started',
    items: [
      { icon: Book1, label: 'Overview', href: '/docs', exactMatch: true },
      { icon: Flash, label: 'Quick Start', href: '/docs/getting-started' },
    ],
  },
  {
    title: 'Reference',
    items: [
      { icon: Code1, label: 'SDK Client', href: '/docs/sdk' },
      { icon: Component, label: 'React Hooks', href: '/docs/hooks' },
      { icon: DocumentCode2, label: 'Data Types', href: '/docs/types' },
    ],
  },
  {
    title: 'Guides',
    items: [
      { icon: ExportSquare, label: 'Publishing', href: '/docs/publishing' },
      { icon: Global, label: 'How It Works', href: '/docs/how-it-works' },
    ],
  },
];

export function DocsSidebar() {
  const { collapsed } = useSidebar();

  return (
    <nav
      className={cn(
        'scrollbar-none flex-1 overflow-y-auto px-2 py-4',
        collapsed ? 'space-y-0.5' : 'space-y-5',
      )}
    >
      {docNavGroups.map((group, index) => (
        <SidebarNavGroup key={group.title ?? index} group={group} />
      ))}
    </nav>
  );
}
