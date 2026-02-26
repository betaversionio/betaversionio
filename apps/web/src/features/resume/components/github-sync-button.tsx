"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  useGitHubStatus,
  useDisconnectGitHub,
} from "@/hooks/queries";
import { useToast } from "@/hooks/use-toast";
import {
  Github,
  Loader2,
  Link as LinkIcon,
  Unlink,
  Download,
  Upload,
} from "lucide-react";

const GITHUB_APP_SLUG =
  process.env.NEXT_PUBLIC_GITHUB_APP_SLUG ?? "";

interface GitHubSyncButtonProps {
  onImport: () => void;
  onPush: () => void;
}

export function GitHubSyncButton({
  onImport,
  onPush,
}: GitHubSyncButtonProps) {
  const { data: status, isLoading, refetch } = useGitHubStatus();
  const disconnectGitHub = useDisconnectGitHub();
  const { toast } = useToast();
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function handleConnect() {
    const url = `https://github.com/apps/${GITHUB_APP_SLUG}/installations/new`;

    const w = 600;
    const h = 700;
    const left = window.screenX + (window.innerWidth - w) / 2;
    const top = window.screenY + (window.innerHeight - h) / 2;

    const popup = window.open(
      url,
      "github-app-install",
      `width=${w},height=${h},left=${left},top=${top}`,
    );

    // Poll status every 2s until connected or popup closed
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      const closed = !popup || popup.closed;
      const result = await refetch();

      if (result.data?.connected) {
        clearInterval(pollRef.current!);
        pollRef.current = null;
        toast({ title: `Connected as @${result.data.username}` });
      } else if (closed) {
        clearInterval(pollRef.current!);
        pollRef.current = null;
      }
    }, 2000);
  }

  async function handleDisconnect() {
    try {
      await disconnectGitHub.mutateAsync();
      toast({ title: "GitHub disconnected" });
    } catch {
      toast({
        title: "Failed to disconnect GitHub",
        variant: "destructive",
      });
    }
  }

  const connected = status?.connected;
  const busy = isLoading || disconnectGitHub.isPending;

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              disabled={busy}
            >
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Github className="h-4 w-4" />
              )}
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom">GitHub Sync</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="end">
        {connected ? (
          <>
            <DropdownMenuItem disabled className="text-xs text-muted-foreground">
              Connected as @{status?.username}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onImport}>
              <Download className="mr-2 h-4 w-4" />
              Import from GitHub
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onPush}>
              <Upload className="mr-2 h-4 w-4" />
              Push to GitHub
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleDisconnect}>
              <Unlink className="mr-2 h-4 w-4" />
              Disconnect
            </DropdownMenuItem>
          </>
        ) : (
          <DropdownMenuItem onClick={handleConnect}>
            <LinkIcon className="mr-2 h-4 w-4" />
            Connect GitHub
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
