'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ArrowDown2 } from 'iconsax-react';
import { navGroups, type NavGroup } from './sidebar-config';
import { useSidebar } from './sidebar-context';
import { SidebarNavItem } from './sidebar-nav-item';

interface SidebarNavGroupProps {
  group: NavGroup;
}

export function SidebarNavGroup({ group }: SidebarNavGroupProps) {
  const { collapsed: sidebarCollapsed } = useSidebar();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className={cn(!sidebarCollapsed ? 'space-y-1' : 'space-y-0')}>
      {!sidebarCollapsed && group.title && (
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="flex w-full items-center gap-2 px-3 pb-1"
        >
          <h4
            className={cn(
              'text-[11px] font-semibold tracking-wider uppercase transition-colors duration-300',
              isHovered ? 'text-foreground' : 'text-muted-foreground',
            )}
          >
            {group.title}
          </h4>
          <ArrowDown2
            size={14}
            color="currentColor"
            className={cn(
              'transition-all duration-300 ease-in-out',
              isHovered
                ? 'text-foreground opacity-100'
                : 'text-muted-foreground opacity-0',
              isCollapsed && '-rotate-90',
            )}
          />
        </button>
      )}
      <div
        className={cn(
          'space-y-0.5 overflow-hidden transition-all duration-200',
          isCollapsed && !sidebarCollapsed && group.title && 'h-0',
        )}
      >
        {group.items.map((item) => (
          <SidebarNavItem key={item.href} item={item} />
        ))}
      </div>
    </div>
  );
}

export function SidebarNav() {
  const { collapsed } = useSidebar();

  return (
    <nav
      className={cn(
        'scrollbar-none flex-1 overflow-y-auto px-2 py-4',
        collapsed ? 'space-y-0.5' : 'space-y-5',
      )}
    >
      {navGroups.map((group, index) => (
        <SidebarNavGroup key={group.title ?? index} group={group} />
      ))}
    </nav>
  );
}
