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
  onClick?: () => void;
  isActive?: boolean;
}

export function SidebarNavItem({ item, onClick, isActive: isActiveProp }: SidebarNavItemProps) {
  const { collapsed, setMobileOpen } = useSidebar();
  const pathname = usePathname();

  const isActive =
    isActiveProp ??
    (item.href
      ? pathname === item.href ||
        (!item.exactMatch &&
          item.href !== '/dashboard' &&
          pathname.startsWith(`${item.href}/`))
      : false);

  const className = cn(
    'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-normal transition-colors',
    isActive
      ? 'bg-accent dark:bg-accent/50 shadow-glass'
      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
    collapsed && 'justify-center px-2',
  );

  const content = (
    <>
      <item.icon
        size={collapsed ? 22 : 20}
        color="currentColor"
        variant={isActive ? 'Bulk' : 'Linear'}
        className="shrink-0"
      />
      {!collapsed && <span>{item.label}</span>}
    </>
  );

  const element = item.href ? (
    <Link
      href={item.href}
      onClick={() => {
        setMobileOpen(false);
        onClick?.();
      }}
      className={className}
    >
      {content}
    </Link>
  ) : (
    <button
      type="button"
      onClick={() => {
        setMobileOpen(false);
        onClick?.();
      }}
      className={className}
    >
      {content}
    </button>
  );

  if (collapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{element}</TooltipTrigger>
        <TooltipContent side="right">
          <p>{item.label}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return element;
}
