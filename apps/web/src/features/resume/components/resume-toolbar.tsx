'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  ArrowLeft,
  Play,
  Save,
  Download,
  FileCode2,
  Loader2,
  CheckCircle2,
  Circle,
  Maximize,
  Minimize,
  Share2,
} from 'lucide-react';
import { GitHubSyncButton } from './github-sync-button';

interface ResumeToolbarProps {
  title: string;
  isDirty: boolean;
  isCompiling: boolean;
  isSaving: boolean;
  isPublishing: boolean;
  hasPdf: boolean;
  latexSource: string;
  onCompile: () => void;
  onSave: () => void;
  onDownloadPdf: () => void;
  onPublish: () => void;
  onGitHubImport: () => void;
  onGitHubPush: () => void;
}

export function ResumeToolbar({
  title,
  isDirty,
  isCompiling,
  isSaving,
  isPublishing,
  hasPdf,
  latexSource,
  onCompile,
  onSave,
  onDownloadPdf,
  onPublish,
  onGitHubImport,
  onGitHubPush,
}: ResumeToolbarProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    function onFsChange() {
      setIsFullscreen(!!document.fullscreenElement);
    }
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  }, []);

  function handleDownloadTex() {
    const blob = new Blob([latexSource], { type: 'application/x-tex' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || 'resume'}.tex`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex h-12 items-center gap-1 border-b bg-background px-2">
        {/* Back */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
              <Link href="/resume">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Back to resumes</TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="mx-1 h-6" />

        {/* Title + status */}
        <div className="mr-auto flex items-center gap-2 overflow-hidden px-1">
          <h2 className="truncate text-sm font-semibold">{title}</h2>
          {isDirty ? (
            <Badge
              variant="outline"
              className="shrink-0 gap-1 text-[10px] font-normal text-muted-foreground"
            >
              <Circle className="h-2 w-2 fill-amber-500 text-amber-500" />
              Unsaved
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="shrink-0 gap-1 text-[10px] font-normal text-muted-foreground"
            >
              <CheckCircle2 className="h-2.5 w-2.5 text-emerald-500" />
              Saved
            </Badge>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {/* Compile */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                className="h-8 gap-1.5"
                onClick={onCompile}
                disabled={isCompiling || !latexSource.trim()}
              >
                {isCompiling ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Play className="h-3.5 w-3.5" />
                )}
                Compile
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <span className="flex items-center gap-2">
                Compile LaTeX to PDF
                <kbd className="rounded border border-foreground/20 bg-card/10 px-1.5 py-0.5 font-mono text-[10px] text-background">
                  Ctrl+Enter
                </kbd>
              </span>
            </TooltipContent>
          </Tooltip>

          {/* Save */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5"
                onClick={onSave}
                disabled={isSaving || !isDirty}
              >
                {isSaving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Save className="h-3.5 w-3.5" />
                )}
                Save
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <span className="flex items-center gap-2">
                Save source
                <kbd className="rounded border border-foreground/20 bg-foreground/10 px-1.5 py-0.5 font-mono text-[10px] text-foreground">
                  Ctrl+S
                </kbd>
              </span>
            </TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="mx-1 h-6" />

          {/* Publish PDF to R2 */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5"
                onClick={onPublish}
                disabled={isPublishing || !latexSource.trim()}
              >
                {isPublishing ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Share2 className="h-3.5 w-3.5" />
                )}
                Publish
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              Compile and save PDF to get a shareable link
            </TooltipContent>
          </Tooltip>

          {/* Download PDF */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onDownloadPdf}
                disabled={!hasPdf}
              >
                <Download className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Download PDF</TooltipContent>
          </Tooltip>

          {/* Download .tex */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleDownloadTex}
              >
                <FileCode2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Download .tex source</TooltipContent>
          </Tooltip>

          {/* GitHub Sync */}
          <GitHubSyncButton
            onImport={onGitHubImport}
            onPush={onGitHubPush}
          />

          <Separator orientation="vertical" className="mx-1 h-6" />

          {/* Fullscreen */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={toggleFullscreen}
              >
                {isFullscreen ? (
                  <Minimize className="h-4 w-4" />
                ) : (
                  <Maximize className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Toggle fullscreen</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
}
