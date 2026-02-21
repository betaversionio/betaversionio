'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { NavItem } from './sidebar-config';
import { useSidebar } from './sidebar-context';

interface SidebarNavItemProps {
  item: NavItem;
}

export function SidebarNavItem({ item }: SidebarNavItemProps) {
  const { collapsed, setMobileOpen } = useSidebar();
  const pathname = usePathname();
  const isExactMatch = pathname === item.href;
  const isChildRoute =
    item.href !== '/dashboard' && pathname.startsWith(`${item.href}/`);
  const isActive = isExactMatch || isChildRoute;

  const link = (
    <Link
      href={item.href}
      onClick={() => setMobileOpen(false)}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-normal transition-colors',
        isActive
          ? 'bg-accent dark:bg-accent/50 shadow-glass'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
        collapsed && 'justify-center px-2',
      )}
    >
      <item.icon
        size={collapsed ? 22 : 20}
        color="currentColor"
        variant={isActive ? 'Bulk' : 'Linear'}
        className="shrink-0"
      />
      {!collapsed && <span>{item.label}</span>}
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{link}</TooltipTrigger>
        <TooltipContent side="right">
          <p>{item.label}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return link;
}
