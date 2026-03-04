'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { SidebarShell } from '@/components/ui/sidebar';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { SidebarNavItem } from '@/components/layout/sidebar/sidebar-nav-item';
import type { NavItem } from '@/components/layout/sidebar/sidebar-config';
import { useSidebar } from '@/components/layout/sidebar/sidebar-context';
import { ArrowLeft2, DocumentText1, Gallery } from 'iconsax-react';
import { Check } from 'lucide-react';

export type ProjectFormTab = 'main' | 'media';

interface ProjectCreationSidebarProps {
  activeTab: ProjectFormTab;
  onTabChange: (tab: ProjectFormTab) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  submitLabel?: string;
}

const backItem: NavItem = {
  href: '/my-projects',
  label: 'Back to Projects',
  icon: ArrowLeft2,
};

const tabs: { id: ProjectFormTab; item: NavItem }[] = [
  { id: 'main', item: { label: 'Main Info', icon: DocumentText1 } },
  { id: 'media', item: { label: 'Images', icon: Gallery } },
];

export function ProjectCreationSidebar(props: ProjectCreationSidebarProps) {
  const { collapsed } = useSidebar();

  return (
    <SidebarShell>
      <nav className="scrollbar-none flex-1 space-y-0.5 overflow-y-auto px-2 py-4">
        <SidebarNavItem item={backItem} isActive={false} />
        {tabs.map((tab) => (
          <SidebarNavItem
            key={tab.id}
            item={tab.item}
            isActive={props.activeTab === tab.id}
            onClick={() => props.onTabChange(tab.id)}
          />
        ))}
      </nav>
      <div className={cn('border-t p-3', collapsed && 'p-2')}>
        {collapsed ? (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button
                type="button"
                className="w-full"
                size="icon"
                onClick={props.onSubmit}
                isLoading={props.isSubmitting}
              >
                <Check className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>
                {props.isSubmitting
                  ? 'Saving...'
                  : (props.submitLabel ?? 'Publish Project')}
              </p>
            </TooltipContent>
          </Tooltip>
        ) : (
          <Button
            type="button"
            className="w-full"
            onClick={props.onSubmit}
            isLoading={props.isSubmitting}
          >
            {props.submitLabel ?? 'Publish Project'}
          </Button>
        )}
      </div>
    </SidebarShell>
  );
}
