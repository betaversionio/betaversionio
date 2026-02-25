'use client';

import { useRelatedProjects } from '@/hooks/queries/use-project-queries';
import { ProjectCard } from '../project-card';

interface RelatedProjectsProps {
  slug: string;
}

export function RelatedProjects({ slug }: RelatedProjectsProps) {
  const { data: projects } = useRelatedProjects(slug);

  if (!projects || projects.length === 0) return null;

  return (
    <div className="mt-12">
      <h3 className="mb-4 text-lg font-semibold">Related Projects</h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
}
