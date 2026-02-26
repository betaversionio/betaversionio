"use client";

import { useState } from "react";
import Link from "next/link";
import { useDeleteResume, useSetPrimaryResume, useUnsetPrimaryResume } from "@/hooks/queries";
import { useAuth } from "@/providers/auth-provider";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  FileText,
  Pencil,
  Trash2,
  Loader2,
  Star,
  Link2,
  ExternalLink,
  History,
} from "lucide-react";
import { VersionHistoryDialog } from "./version-history-dialog";

interface ResumeCardProps {
  id: string;
  title: string;
  isPrimary: boolean;
  versions: Array<{
    id: string;
    pdfUrl: string;
    generatedAt: string;
  }>;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export function ResumeCard({
  id,
  title,
  isPrimary,
  versions,
}: ResumeCardProps) {
  const [historyOpen, setHistoryOpen] = useState(false);
  const deleteResume = useDeleteResume();
  const setPrimary = useSetPrimaryResume();
  const unsetPrimary = useUnsetPrimaryResume();
  const { toast } = useToast();
  const { user } = useAuth();

  const latestVersion = versions[0];
  const publicUrl = user
    ? `${SITE_URL}/@${user.username}/resume.pdf`
    : null;

  async function handleDelete() {
    try {
      await deleteResume.mutateAsync(id);
      toast({ title: "Resume deleted" });
    } catch {
      toast({ title: "Failed to delete resume", variant: "destructive" });
    }
  }

  async function handleTogglePrimary() {
    try {
      if (isPrimary) {
        await unsetPrimary.mutateAsync(id);
        toast({ title: "Resume unset as primary" });
      } else {
        await setPrimary.mutateAsync(id);
        toast({ title: "Resume set as primary" });
      }
    } catch {
      toast({ title: "Failed to update primary status", variant: "destructive" });
    }
  }

  function handleCopyLink(url: string) {
    navigator.clipboard.writeText(url);
    toast({ title: "Link copied to clipboard" });
  }

  const isToggling = setPrimary.isPending || unsetPrimary.isPending;

  return (
    <TooltipProvider delayDuration={300}>
      <Card className="group relative flex h-full flex-col transition-shadow hover:shadow-md">
        <Link href={`/resume/${id}`} className="absolute inset-0 z-0" />

        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10">
                <FileText className="h-4 w-4 text-primary" />
              </div>
              <CardTitle className="line-clamp-1 text-lg">{title}</CardTitle>
            </div>
            <Badge
              variant="secondary"
              className={
                latestVersion
                  ? "bg-emerald-400/20 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400"
                  : "bg-amber-400/20 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400"
              }
            >
              {latestVersion ? "Published" : "Draft"}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="mt-auto border-t py-3">
          <div className="flex items-center justify-between">
            {/* Shareable links */}
            <div className="relative z-10 flex items-center gap-1">
              {latestVersion && (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleCopyLink(latestVersion.pdfUrl)}
                      >
                        <Link2 className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Copy PDF link</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        asChild
                      >
                        <a
                          href={latestVersion.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Open PDF in new tab</TooltipContent>
                  </Tooltip>
                </>
              )}
              {versions.length > 0 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setHistoryOpen(true)}
                    >
                      <History className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    Version history ({versions.length})
                  </TooltipContent>
                </Tooltip>
              )}
            </div>

            {/* Actions */}
            <div className="relative z-10 flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={handleTogglePrimary}
                    disabled={isToggling}
                  >
                    {isToggling ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Star
                        className={`h-3.5 w-3.5 ${isPrimary ? "fill-amber-500 text-amber-500" : ""}`}
                      />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isPrimary ? "Unset as primary" : "Set as primary"}
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    asChild
                  >
                    <Link href={`/resume/${id}`}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Edit</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={handleDelete}
                    disabled={deleteResume.isPending}
                  >
                    {deleteResume.isPending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Delete</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </CardContent>
      </Card>

      <VersionHistoryDialog
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        title={title}
        versions={versions}
      />
    </TooltipProvider>
  );
}
