'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useUserProfile } from '@/hooks/queries/use-user-queries';
import { useProjects } from '@/hooks/queries/use-project-queries';
import { useBlogs } from '@/hooks/queries/use-blog-queries';
import { useUserPosts } from '@/features/feed';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/shared/user-avatar';
import { TechBadge } from '@/components/shared/tech-badge';
import { Markdown } from '@/components/ui/markdown';
import { ProjectCard } from '@/features/projects/components/project-card';
import { BlogCard } from '@/features/blogs/components/blog-card';
import { PostCard } from '@/features/feed';
import { formatDate, timeAgo } from '@/lib/format';
import { formatDateRange } from '@/lib/utils';
import { cn } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Loader2,
  ExternalLink,
} from 'lucide-react';
import {
  Location,
  Global,
  Briefcase,
  Teacher,
  Setting2,
  Code1,
} from 'iconsax-react';

const socialIcons: Record<string, { svg: string; viewBox: string }> = {
  Github: {
    viewBox: '0 0 24 24',
    svg: 'M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z',
  },
  Linkedin: {
    viewBox: '0 0 24 24',
    svg: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
  },
  Twitter: {
    viewBox: '0 0 24 24',
    svg: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z',
  },
};

const employmentTypeLabels: Record<string, string> = {
  FullTime: 'Full-time',
  PartTime: 'Part-time',
  Contract: 'Contract',
  Freelance: 'Freelance',
  Internship: 'Internship',
};

type Tab = 'overview' | 'projects' | 'blogs' | 'posts';

export default function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = use(params);
  const { data: profile, isLoading, error } = useUserProfile(username);
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const { data: projectsData } = useProjects(
    { authorId: profile?.id ?? '' },
    { enabled: !!profile },
  );
  const { data: blogsData } = useBlogs(
    { authorId: profile?.id ?? '', status: 'Published', limit: 6 },
    { enabled: !!profile },
  );
  const { data: postsData } = useUserPosts(profile?.id ?? '');

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="container flex min-h-[60vh] flex-col items-center justify-center px-4">
        <h2 className="text-2xl font-bold">User not found</h2>
        <p className="mt-2 text-muted-foreground">
          The profile you&apos;re looking for doesn&apos;t exist.
        </p>
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/explore">Explore developers</Link>
        </Button>
      </div>
    );
  }

  const bio = profile.profile?.bio;
  const headline = profile.profile?.headline;
  const location = profile.profile?.location;
  const website = profile.profile?.website;

  const projects = projectsData?.items ?? [];
  const blogs = blogsData?.items ?? [];
  const posts = postsData?.items ?? [];

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'projects', label: 'Projects', count: projects.length },
    { id: 'blogs', label: 'Blogs', count: blogs.length },
    { id: 'posts', label: 'Posts', count: posts.length },
  ];

  return (
    <div className="container px-4 pb-12 pt-20">
      <div className="mx-auto max-w-5xl">
        {/* ── Hero / Header ─────────────────────────────────────── */}
        <div className="flex flex-col gap-6 md:flex-row md:gap-8">
          <UserAvatar
            src={profile.avatarUrl}
            name={profile.name}
            className="h-28 w-28 shrink-0 self-center ring-4 ring-background md:h-36 md:w-36 md:self-start"
            fallbackClassName="text-3xl"
          />
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold tracking-tight">
              {profile.name ?? profile.username}
            </h1>
            <p className="text-muted-foreground">@{profile.username}</p>
            {headline && (
              <p className="mt-2 text-lg text-muted-foreground">{headline}</p>
            )}

            <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-muted-foreground md:justify-start">
              {location && (
                <span className="flex items-center gap-1.5">
                  <Location size={16} color="currentColor" variant="Bold" />
                  {location}
                </span>
              )}
              {website && (
                <a
                  href={website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 transition-colors hover:text-foreground"
                >
                  <Global size={16} color="currentColor" variant="Bold" />
                  {website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                </a>
              )}
            </div>

            {/* Social Links */}
            {profile.socialLinks.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2 md:justify-start">
                {profile.socialLinks.map((link) => {
                  const icon = socialIcons[link.platform];
                  return (
                    <Button
                      key={link.platform}
                      variant="outline"
                      size="icon"
                      className="h-9 w-9"
                      asChild
                    >
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={link.platform}
                      >
                        {icon ? (
                          <svg
                            className="size-4"
                            fill="currentColor"
                            viewBox={icon.viewBox}
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d={icon.svg} />
                          </svg>
                        ) : (
                          <ExternalLink className="h-4 w-4" />
                        )}
                      </a>
                    </Button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Tab Navigation ────────────────────────────────────── */}
        <div className="mt-8 border-b">
          <nav className="-mb-px flex gap-6 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex shrink-0 items-center gap-1.5 border-b-2 px-1 pb-3 text-sm font-medium transition-colors',
                  activeTab === tab.id
                    ? 'border-primary text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground',
                )}
              >
                {tab.label}
                {tab.count != null && tab.count > 0 && (
                  <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* ── Tab Content ───────────────────────────────────────── */}
        <div className="mt-8">
          {activeTab === 'overview' && (
            <OverviewTab
              bio={bio}
              techStack={profile.techStack}
              experiences={profile.experiences}
              education={profile.education}
              services={profile.services}
              projects={projects}
              blogs={blogs}
            />
          )}

          {activeTab === 'projects' && (
            <section>
              {projects.length === 0 ? (
                <EmptyState text="No projects yet." />
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {projects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              )}
            </section>
          )}

          {activeTab === 'blogs' && (
            <section>
              {blogs.length === 0 ? (
                <EmptyState text="No blog posts yet." />
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {blogs.map((blog) => (
                    <BlogCard key={blog.id} blog={blog} />
                  ))}
                </div>
              )}
            </section>
          )}

          {activeTab === 'posts' && (
            <section>
              {posts.length === 0 ? (
                <EmptyState text="No posts yet." />
              ) : (
                <div className="mx-auto max-w-2xl space-y-4">
                  {posts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="py-16 text-center">
      <p className="text-muted-foreground">{text}</p>
    </div>
  );
}

function OverviewTab({
  bio,
  techStack,
  experiences,
  education,
  services,
  projects,
  blogs,
}: {
  bio: string | null | undefined;
  techStack: Array<{ name: string; category: string; proficiency: string }>;
  experiences: Array<{
    id: string;
    company: string;
    position: string;
    location: string | null;
    employmentType: string;
    startDate: string;
    endDate: string | null;
    current: boolean;
    description: string | null;
  }>;
  education: Array<{
    id: string;
    institution: string;
    degree: string;
    fieldOfStudy: string | null;
    startDate: string;
    endDate: string | null;
    current: boolean;
    description: string | null;
  }>;
  services: Array<{ id: string; title: string; description: string | null }>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  projects: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  blogs: any[];
}) {
  const hasContent =
    bio ||
    techStack.length > 0 ||
    experiences.length > 0 ||
    education.length > 0 ||
    services.length > 0 ||
    projects.length > 0 ||
    blogs.length > 0;

  if (!hasContent) {
    return <EmptyState text="This developer hasn't added any content yet." />;
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      {/* ── Main Column ─────────────────────────────────────── */}
      <div className="space-y-8 lg:col-span-2">
        {/* About */}
        {bio && (
          <section>
            <SectionHeading title="About" />
            <Card>
              <CardContent className="pt-6">
                <Markdown content={bio} size="sm" />
              </CardContent>
            </Card>
          </section>
        )}

        {/* Experience */}
        {experiences.length > 0 && (
          <section>
            <SectionHeading
              title="Experience"
              icon={<Briefcase size={20} color="currentColor" variant="Bulk" />}
            />
            <div className="space-y-0">
              {experiences.map((exp, i) => (
                <div
                  key={exp.id}
                  className={cn(
                    'relative pl-8',
                    i < experiences.length - 1 && 'pb-6',
                  )}
                >
                  {/* Timeline line */}
                  {i < experiences.length - 1 && (
                    <div className="absolute left-[9px] top-6 bottom-0 w-px bg-border" />
                  )}
                  {/* Timeline dot */}
                  <div className="absolute left-0 top-1.5 flex h-[18px] w-[18px] items-center justify-center rounded-full border-2 border-primary bg-background">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">{exp.position}</h4>
                    <p className="text-sm text-muted-foreground">
                      {exp.company}
                      {exp.location && ` · ${exp.location}`}
                      {' · '}
                      {employmentTypeLabels[exp.employmentType] ?? exp.employmentType}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {formatDateRange(exp.startDate, exp.endDate, exp.current)}
                    </p>
                    {exp.description && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        {exp.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        {education.length > 0 && (
          <section>
            <SectionHeading
              title="Education"
              icon={<Teacher size={20} color="currentColor" variant="Bulk" />}
            />
            <div className="space-y-0">
              {education.map((edu, i) => (
                <div
                  key={edu.id}
                  className={cn(
                    'relative pl-8',
                    i < education.length - 1 && 'pb-6',
                  )}
                >
                  {i < education.length - 1 && (
                    <div className="absolute left-[9px] top-6 bottom-0 w-px bg-border" />
                  )}
                  <div className="absolute left-0 top-1.5 flex h-[18px] w-[18px] items-center justify-center rounded-full border-2 border-primary bg-background">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">{edu.degree}</h4>
                    <p className="text-sm text-muted-foreground">
                      {edu.institution}
                      {edu.fieldOfStudy && ` · ${edu.fieldOfStudy}`}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {formatDateRange(edu.startDate, edu.endDate, edu.current)}
                    </p>
                    {edu.description && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        {edu.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects Preview */}
        {projects.length > 0 && (
          <section>
            <SectionHeading title="Projects" />
            <div className="grid gap-4 sm:grid-cols-2">
              {projects.slice(0, 4).map((project: any) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </section>
        )}

        {/* Blogs Preview */}
        {blogs.length > 0 && (
          <section>
            <SectionHeading title="Blog Posts" />
            <div className="grid gap-4 sm:grid-cols-2">
              {blogs.slice(0, 4).map((blog: any) => (
                <BlogCard key={blog.id} blog={blog} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ── Sidebar Column ──────────────────────────────────── */}
      <div className="space-y-6">
        {/* Tech Stack */}
        {techStack.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Code1 size={18} color="currentColor" variant="Bulk" />
                Tech Stack
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1.5">
                {techStack.map((tech) => (
                  <TechBadge
                    key={tech.name}
                    name={tech.name}
                    variant="secondary"
                    className="gap-1.5 text-xs"
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Services */}
        {services.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Setting2 size={18} color="currentColor" variant="Bulk" />
                Services
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {services.map((service) => (
                  <div key={service.id}>
                    <h4 className="text-sm font-medium">{service.title}</h4>
                    {service.description && (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {service.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function SectionHeading({
  title,
  icon,
}: {
  title: string;
  icon?: React.ReactNode;
}) {
  return (
    <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
      {icon}
      {title}
    </h2>
  );
}
