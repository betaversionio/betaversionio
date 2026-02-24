'use client';

import { Badge } from '@/components/ui/badge';
import { Code1 } from 'iconsax-react';

interface TechTabProps {
  techStack: string[];
  tags: string[];
}

export function TechTab({ techStack, tags }: TechTabProps) {
  if (techStack.length === 0 && tags.length === 0) {
    return (
      <div className="mt-6 flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Code1
            size={20}
            color="currentColor"
            variant="Linear"
            className="text-muted-foreground"
          />
        </div>
        <p className="mt-4 text-sm font-medium">No tech info added</p>
        <p className="mt-1 text-xs text-muted-foreground">
          The project owner hasn&apos;t specified a tech stack or tags.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-6">
      {techStack.length > 0 && (
        <section>
          <h3 className="mb-3 text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Tech Stack
          </h3>
          <div className="flex flex-wrap gap-2">
            {techStack.map((tech) => (
              <Badge key={tech} variant="secondary">
                {tech}
              </Badge>
            ))}
          </div>
        </section>
      )}

      {tags.length > 0 && (
        <section>
          <h3 className="mb-3 text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Tags
          </h3>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
