import { Link } from 'react-router-dom';
import type { PortfolioProject } from '@/lib/api';

interface ProjectCardProps {
  project: PortfolioProject;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link
      to={`/projects/${project.slug}`}
      className="group block rounded-xl border border-border bg-card p-5 transition-colors hover:bg-muted/50"
    >
      <div className="flex items-start gap-3">
        {project.logo ? (
          <img
            src={project.logo}
            alt=""
            className="h-10 w-10 shrink-0 rounded-lg object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-sm font-bold text-muted-foreground">
            {project.title.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold group-hover:text-accent-foreground">
            {project.title}
          </h3>
          {project.tagline && (
            <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
              {project.tagline}
            </p>
          )}
        </div>
      </div>

      {project.techStack.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {project.techStack.slice(0, 5).map((tech) => (
            <span
              key={tech}
              className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
            >
              {tech}
            </span>
          ))}
          {project.techStack.length > 5 && (
            <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
              +{project.techStack.length - 5}
            </span>
          )}
        </div>
      )}
    </Link>
  );
}
