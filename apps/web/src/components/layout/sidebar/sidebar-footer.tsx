'use client';

import { Logout } from 'iconsax-react';
import { useAuth } from '@/providers/auth-provider';
import { UserAvatar } from '@/components/shared/user-avatar';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useSidebar } from './sidebar-context';

interface SidebarFooterProps {
  onLogout: () => void;
}

export function SidebarFooter({ onLogout }: SidebarFooterProps) {
  const { collapsed } = useSidebar();
  const { user } = useAuth();

  if (collapsed) {
    return (
      <div className="space-y-2 border-t border-border p-2">
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <div className="flex justify-center">
              <UserAvatar
                src={user?.avatarUrl}
                name={user?.name}
                className="h-8 w-8 shrink-0"
                fallbackClassName="text-xs"
              />
            </div>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>{user?.name ?? user?.username}</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="w-full text-muted-foreground hover:text-foreground"
              onClick={onLogout}
            >
              <Logout size={18} color="currentColor" className="shrink-0" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Logout</p>
          </TooltipContent>
        </Tooltip>
      </div>
    );
  }

  return (
    <div className="border-t border-border p-2">
      <div className="flex items-center gap-3 rounded-md p-2">
        <UserAvatar
          src={user?.avatarUrl}
          name={user?.name}
          className="h-8 w-8 shrink-0"
          fallbackClassName="text-xs"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">
            {user?.name ?? user?.username}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            @{user?.username}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
          onClick={onLogout}
        >
          <Logout size={16} color="currentColor" />
        </Button>
      </div>
    </div>
  );
}
