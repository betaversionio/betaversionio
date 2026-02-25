'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { SidebarShell } from '@/components/ui/sidebar';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useSidebar } from '@/components/layout/sidebar/sidebar-context';
import {
  ArrowLeft2,
  User,
  DocumentText1,
  Link21,
  Code1,
  Briefcase,
  Teacher,
  Setting2,
} from 'iconsax-react';

export type ProfileEditTab =
  | 'profile'
  | 'about'
  | 'social-links'
  | 'tech-stack'
  | 'experience'
  | 'education'
  | 'services';

interface ProfileEditSidebarProps {
  activeTab: ProfileEditTab;
  onTabChange: (tab: ProfileEditTab) => void;
}

const tabs: { id: ProfileEditTab; label: string; icon: typeof User }[] = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'about', label: 'About', icon: DocumentText1 },
  { id: 'social-links', label: 'Social Links', icon: Link21 },
  { id: 'tech-stack', label: 'Tech Stack', icon: Code1 },
  { id: 'experience', label: 'Experience', icon: Briefcase },
  { id: 'education', label: 'Education', icon: Teacher },
  { id: 'services', label: 'Services', icon: Setting2 },
];

export function ProfileEditSidebar({
  activeTab,
  onTabChange,
}: ProfileEditSidebarProps) {
  return (
    <SidebarShell>
      <BackToDashboard />
      <SidebarContent activeTab={activeTab} onTabChange={onTabChange} />
    </SidebarShell>
  );
}

function BackToDashboard() {
  const { collapsed } = useSidebar();

  const link = (
    <Link
      href="/dashboard"
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
      {!collapsed && <span>Back to Dashboard</span>}
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{link}</TooltipTrigger>
        <TooltipContent side="right">
          <p>Back to Dashboard</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return link;
}

function SidebarContent({
  activeTab,
  onTabChange,
}: ProfileEditSidebarProps) {
  const { collapsed } = useSidebar();

  return (
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
  );
}
