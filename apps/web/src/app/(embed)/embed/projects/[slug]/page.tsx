'use client';

import { use } from 'react';
import { useProject } from '@/hooks/queries/use-project-queries';
import { UserAvatar } from '@/components/shared/user-avatar';
import { TechBadge } from '@/components/shared/tech-badge';
import { Badge } from '@/components/ui/badge';
import { Heart, Message } from 'iconsax-react';

function ProjectEmbedSkeleton() {
  return (
    <div className="flex min-h-screen items-center gap-4 bg-card p-4 animate-pulse">
      <div className="h-10 w-10 shrink-0 rounded-md bg-muted" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="h-4 w-2/3 rounded bg-muted" />
        <div className="h-3 w-full rounded bg-muted" />
        <div className="flex gap-1.5">
          <div className="h-5 w-14 rounded-full bg-muted" />
          <div className="h-5 w-14 rounded-full bg-muted" />
        </div>
      </div>
    </div>
  );
}

export default function ProjectEmbedPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { data: project, isLoading, isError } = useProject(slug);

  if (isLoading) return <ProjectEmbedSkeleton />;

  if (isError || !project) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-card p-4">
        <p className="text-sm text-muted-foreground">Project not found</p>
      </div>
    );
  }

  return (
    <a
      href={`/projects/${project.slug}`}
      target="_top"
      className="group flex min-h-screen items-center gap-4 bg-card p-4 transition-colors hover:bg-muted/50"
    >
      {project.logo && (
        <img
          src={project.logo}
          alt=""
          className="h-10 w-10 shrink-0 rounded-md object-cover"
        />
      )}

      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-semibold">{project.title}</h3>
        {project.tagline && (
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {project.tagline}
          </p>
        )}

        <div className="mt-2 flex items-center gap-3">
          <div className="flex flex-wrap gap-1">
            {project.techStack.slice(0, 4).map((tech) => (
              <TechBadge
                key={tech}
                name={tech}
                variant="outline"
                className="gap-1 text-[10px] px-1.5 py-0"
              />
            ))}
            {project.techStack.length > 4 && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                +{project.techStack.length - 4}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-2">
        <div className="flex items-center gap-1.5">
          <UserAvatar
            src={project.author.avatarUrl}
            name={project.author.name}
            className="h-5 w-5"
            fallbackClassName="text-[10px]"
          />
          <span className="text-xs text-muted-foreground">
            {project.author.username}
          </span>
        </div>
        <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
          <span className="flex items-center gap-0.5">
            <Heart size={14} color="currentColor" variant="Linear" />
            {project.upvotesCount}
          </span>
          <span className="flex items-center gap-0.5">
            <Message size={14} color="currentColor" variant="Linear" />
            {project.commentsCount}
          </span>
        </div>
      </div>
    </a>
  );
}
