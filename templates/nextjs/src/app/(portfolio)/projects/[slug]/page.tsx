import { notFound } from 'next/navigation';
import Link from 'next/link';
import { fetchProject } from '@/lib/api';

interface Props {
  params: Promise<{ slug: string }>;
}

function getLinkLabel(url: string): string {
  try {
    const hostname = new URL(url).hostname;
    if (hostname.includes('github.com')) return 'GitHub';
    if (hostname.includes('gitlab.com')) return 'GitLab';
    return hostname.replace('www.', '');
  } catch {
    return 'Link';
  }
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const project = await fetchProject(slug);

  if (!project) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Back link */}
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to portfolio
      </Link>

      {/* Header */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-start gap-4">
          {project.logo ? (
            <img
              src={project.logo}
              alt=""
              className="h-16 w-16 shrink-0 rounded-xl object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-muted text-xl font-bold text-muted-foreground">
              {project.title.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold">{project.title}</h1>
              <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                {project.phase}
              </span>
              {project.isOpenSource && (
                <span className="rounded-md border border-border px-2 py-0.5 text-xs text-muted-foreground">
                  Open Source
                </span>
              )}
            </div>
            {project.tagline && (
              <p className="mt-1.5 text-sm text-muted-foreground">
                {project.tagline}
              </p>
            )}
          </div>
        </div>

        {/* Tech stack */}
        {project.techStack.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-1.5">
            {project.techStack.map((tech) => (
              <span
                key={tech}
                className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground"
              >
                {tech}
              </span>
            ))}
          </div>
        )}

        {/* Links */}
        {(project.links.length > 0 || project.demoUrl) && (
          <div className="mt-5 flex flex-wrap gap-2 border-t border-border pt-5">
            {project.demoUrl && (
              <a
                href={project.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm transition-colors hover:bg-muted"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                Live Demo
              </a>
            )}
            {project.links.map((link) => (
              <a
                key={link}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm transition-colors hover:bg-muted"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                {getLinkLabel(link)}
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Images */}
      {project.images.length > 0 && (
        <div className="mt-6 space-y-4">
          {project.images.map((img, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-xl border border-border"
            >
              <img
                src={img}
                alt={`${project.title} screenshot ${i + 1}`}
                className="w-full object-cover"
              />
            </div>
          ))}
        </div>
      )}

      {/* Description */}
      <div className="mt-6 rounded-xl border border-border bg-card p-6">
        <div className="prose prose-sm max-w-none dark:prose-invert">
          {project.description.split('\n').map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      </div>
    </div>
  );
}
