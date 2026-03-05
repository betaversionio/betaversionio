import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { fetchPortfolioProject } from '@/lib/portfolio-api';
import { HeroSection } from '@/components/ui/hero-section';
import { Badge } from '@/components/ui/badge';
import { TechBadge } from '@/components/shared/tech-badge';
import { UserAvatar } from '@/components/shared/user-avatar';
import { Markdown } from '@/components/ui/markdown';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Globe, ExternalLink, ArrowLeft } from 'lucide-react';
import { Code1 } from 'iconsax-react';

interface Props {
  params: Promise<{ username: string; slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username, slug } = await params;
  const project = await fetchPortfolioProject(slug);

  if (!project) return { title: 'Not Found' };

  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'betaversion.io';

  return {
    title: project.title,
    description: project.tagline ?? project.description.slice(0, 160),
    openGraph: {
      type: 'article',
      title: project.title,
      description: project.tagline ?? project.description.slice(0, 160),
      url: `https://${username}.${rootDomain}/projects/${slug}`,
      ...(project.logo && {
        images: [{ url: project.logo, width: 400, height: 400, alt: project.title }],
      }),
    },
  };
}

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

export default async function PortfolioProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = await fetchPortfolioProject(slug);

  if (!project) notFound();

  return (
    <>
      <HeroSection
        title={project.title}
        description={project.tagline ?? undefined}
        className="border-none"
      />

      <div className="container px-4 pb-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6">
            <Link
              href="/#projects"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to portfolio
            </Link>
          </div>

          <div className="flex flex-col gap-8 lg:flex-row">
            {/* Sidebar */}
            <aside className="w-full shrink-0 lg:sticky lg:top-24 lg:w-[300px] lg:self-start">
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
                    <h2 className="text-xl font-bold leading-tight">{project.title}</h2>
                    {project.tagline && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {project.tagline}
                      </p>
                    )}
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{project.phase}</Badge>
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

                {/* Links */}
                {project.links.length > 0 && (
                  <>
                    <Separator />
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
                  </>
                )}

                {project.demoUrl && (
                  <>
                    <Separator />
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={project.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="gap-2"
                      >
                        <Globe className="h-3.5 w-3.5" />
                        Live Demo
                      </a>
                    </Button>
                  </>
                )}

                <Separator />

                {/* Author */}
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Created by
                  </p>
                  <div className="flex items-center gap-3 rounded-lg p-2">
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
                  </div>
                </div>
              </div>
            </aside>

            {/* Main content */}
            <div className="min-w-0 flex-1 overflow-hidden">
              {/* Images */}
              {project.images.length > 0 && (
                <div className="mb-8 space-y-4">
                  {project.images.map((img, i) => (
                    <div key={i} className="overflow-hidden rounded-lg border border-border">
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
              <div className="min-w-0 overflow-hidden">
                <Markdown content={project.description} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
