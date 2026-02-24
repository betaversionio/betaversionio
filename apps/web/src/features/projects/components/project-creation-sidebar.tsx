'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { SidebarShell } from '@/components/ui/sidebar';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useSidebar } from '@/components/layout/sidebar/sidebar-context';
import { ArrowLeft2, DocumentText1, Gallery, People } from 'iconsax-react';
import { Check, Loader2 } from 'lucide-react';

export type ProjectFormTab = 'main' | 'media' | 'makers';

interface ProjectCreationSidebarProps {
  activeTab: ProjectFormTab;
  onTabChange: (tab: ProjectFormTab) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  submitLabel?: string;
}

const tabs = [
  { id: 'main' as const, label: 'Main Info', icon: DocumentText1 },
  { id: 'media' as const, label: 'Images', icon: Gallery },
  { id: 'makers' as const, label: 'Makers', icon: People },
];

export function ProjectCreationSidebar(props: ProjectCreationSidebarProps) {
  return (
    <SidebarShell>
      <BackToProjects />
      <SidebarContent {...props} />
    </SidebarShell>
  );
}

function BackToProjects() {
  const { collapsed } = useSidebar();

  const link = (
    <Link
      href="/my-projects"
      className={cn(
        'mt-2 flex h-14 items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground',
        collapsed ? 'justify-center px-3' : 'mb-1 px-4',
      )}
    >
      <ArrowLeft2
        size={collapsed ? 22 : 18}
        color="currentColor"
        variant="Linear"
        className="shrink-0"
      />
      {!collapsed && <span>Back to Projects</span>}
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{link}</TooltipTrigger>
        <TooltipContent side="right">
          <p>Back to Projects</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return link;
}

function SidebarContent({
  activeTab,
  onTabChange,
  onSubmit,
  isSubmitting,
  submitLabel = 'Publish Project',
}: ProjectCreationSidebarProps) {
  const { collapsed } = useSidebar();

  return (
    <>
      {/* Tabs */}
      <nav
        className={cn(
          'scrollbar-none flex-1 space-y-0.5 overflow-y-auto px-2 py-4',
          collapsed && 'px-2',
        )}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const button = (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-normal transition-colors',
                isActive
                  ? 'bg-accent dark:bg-accent/50 shadow-glass'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                collapsed && 'justify-center px-2',
              )}
            >
              <tab.icon
                size={collapsed ? 22 : 20}
                color="currentColor"
                variant={isActive ? 'Bulk' : 'Linear'}
                className="shrink-0"
              />
              {!collapsed && <span>{tab.label}</span>}
            </button>
          );

          if (collapsed) {
            return (
              <Tooltip key={tab.id} delayDuration={0}>
                <TooltipTrigger asChild>{button}</TooltipTrigger>
                <TooltipContent side="right">
                  <p>{tab.label}</p>
                </TooltipContent>
              </Tooltip>
            );
          }

          return <div key={tab.id}>{button}</div>;
        })}
      </nav>

      {/* Submit button */}
      <div className={cn('border-t p-3', collapsed && 'p-2')}>
        {collapsed ? (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button
                type="button"
                className="w-full"
                size="icon"
                onClick={onSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>{isSubmitting ? 'Saving...' : submitLabel}</p>
            </TooltipContent>
          </Tooltip>
        ) : (
          <Button
            type="button"
            className="w-full"
            onClick={onSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              submitLabel
            )}
          </Button>
        )}
      </div>
    </>
  );
}
