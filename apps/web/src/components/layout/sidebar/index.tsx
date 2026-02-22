'use client';

import { SidebarShell } from '@/components/ui/sidebar';
import { SidebarFooter } from './sidebar-footer';
import { SidebarHeader } from './sidebar-header';
import { SidebarNav } from './sidebar-nav';

interface SidebarProps {
  onLogout: () => void;
}

export function Sidebar({ onLogout }: SidebarProps) {
  return (
    <SidebarShell>
      <SidebarHeader />
      <SidebarNav />
      <SidebarFooter onLogout={onLogout} />
    </SidebarShell>
  );
}

export { navGroups, type NavGroup, type NavItem } from './sidebar-config';
export { SidebarProvider, useSidebar } from './sidebar-context';
