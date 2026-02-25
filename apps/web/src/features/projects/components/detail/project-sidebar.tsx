'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Project } from '@/hooks/queries/use-project-queries';
import { useToggleProjectVote } from '@/hooks/queries/use-project-queries';
import { useAuth } from '@/providers/auth-provider';
import { statusColors } from '@/features/projects/constants';
import { Badge } from '@/components/ui/badge';
import { TechBadge } from '@/components/shared/tech-badge';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/shared/user-avatar';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  CommentsTab,
  CommentComposer,
} from '@/features/projects/components/detail/comments-tab';
import { Globe, ExternalLink } from 'lucide-react';
import { Heart, Message, Code1 } from 'iconsax-react';

function getLinkLabel(url: string): string | null {
  try {
    const hostname = new URL(url).hostname;
    if (hostname.includes('github.com')) return 'GitHub';
    if (hostname.includes('gitlab.com')) return 'GitLab';
    return null;
  } catch {
    return null;
  }
}

interface ProjectSidebarProps {
  project: Project;
}

export function ProjectSidebar({ project }: ProjectSidebarProps) {
  const { user } = useAuth();
  const toggleVote = useToggleProjectVote(project.id);
  const hasVoted = project.hasVoted ?? false;
  const [commentsOpen, setCommentsOpen] = useState(false);

  return (
    <aside className="w-full shrink-0 lg:sticky lg:top-24 lg:w-[300px]">
      <div className="space-y-5">
        {/* Logo + Title */}
        <div className="flex items-start gap-4">
          {project.logo ? (
            <img
              src={project.logo}
              alt=""
              className="h-16 w-16 rounded-xl object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-muted text-xl font-bold text-muted-foreground">
              {project.title.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold leading-tight">{project.title}</h1>
            {project.tagline && (
              <p className="mt-1 text-sm text-muted-foreground">
                {project.tagline}
              </p>
            )}
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          <Badge
            variant="secondary"
            className={statusColors[project.status] ?? ''}
          >
            {project.status}
          </Badge>
          <Badge variant="secondary">{project.phase}</Badge>
          <Badge variant="outline">{project.productionType}</Badge>
          {project.isOpenSource && (
            <Badge variant="outline" className="gap-1">
              <Code1 size={12} color="currentColor" variant="Linear" />
              Open Source
            </Badge>
          )}
        </div>

        {/* Tech Stack */}
        {project.techStack.length > 0 && (
          <>
            <Separator />
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Tech Stack
              </p>
              <div className="flex flex-wrap gap-1.5">
                {project.techStack.map((tech) => (
                  <TechBadge key={tech} name={tech} variant="secondary" className="gap-1.5 py-1" />
                ))}
              </div>
            </div>
          </>
        )}

        <Separator />

        {/* Links */}
        {project.links.length > 0 && (
          <>
            <div className="flex flex-wrap gap-2">
              {project.links.map((link) => {
                const label = getLinkLabel(link);
                return (
                  <Button key={link} variant="outline" size="sm" asChild>
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="gap-2"
                    >
                      {label ? (
                        <ExternalLink className="h-3.5 w-3.5" />
                      ) : (
                        <Globe className="h-3.5 w-3.5" />
                      )}
                      {label ?? new URL(link).hostname.replace('www.', '')}
                    </a>
                  </Button>
                );
              })}
            </div>
            <Separator />
          </>
        )}

        {/* Stats + Upvote */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            disabled={!user || toggleVote.isPending}
            onClick={() => toggleVote.mutate({ value: 1 })}
          >
            <Heart
              size={16}
              color="currentColor"
              variant={hasVoted ? 'Bold' : 'Linear'}
            />
            {project.upvotesCount}{' '}
            {project.upvotesCount === 1 ? 'Upvote' : 'Upvotes'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => setCommentsOpen(true)}
          >
            <Message size={16} color="currentColor" variant="Linear" />
            {project.commentsCount}{' '}
            {project.commentsCount === 1 ? 'Comment' : 'Comments'}
          </Button>
        </div>

        <Separator />

        {/* Author */}
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Created by
          </p>
          <Link
            href={`/@${project.author.username}`}
            className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted"
          >
            <UserAvatar
              src={project.author.avatarUrl}
              name={project.author.name}
              className="h-9 w-9"
              fallbackClassName="text-xs"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                {project.author.name ?? project.author.username}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                @{project.author.username}
              </p>
            </div>
          </Link>
        </div>
      </div>

      <Sheet open={commentsOpen} onOpenChange={setCommentsOpen}>
        <SheetContent
          side="bottom"
          className="flex h-[90dvh] flex-col gap-0 rounded-t-xl p-0 sm:inset-y-0 sm:left-auto sm:right-0 sm:bottom-auto sm:h-full sm:w-3/4 sm:max-w-md sm:rounded-none sm:border-l sm:border-t-0 sm:data-[state=open]:slide-in-from-right sm:data-[state=closed]:slide-out-to-right sm:data-[state=open]:[--tw-enter-translate-y:0px] sm:data-[state=closed]:[--tw-exit-translate-y:0px]"
        >
          <SheetHeader className="px-6 pt-6 pb-4">
            <SheetTitle>{`${project.commentsCount.toLocaleString()} Comments`}</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-6">
            <CommentsTab projectId={project.id} />
          </div>
          <div className="bg-background px-6 py-4">
            <CommentComposer projectId={project.id} />
          </div>
        </SheetContent>
      </Sheet>
    </aside>
  );
}
