'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useUserProfile } from '@/hooks/queries/use-user-queries';
import { useProjects } from '@/hooks/queries/use-project-queries';
import { useBlogs } from '@/hooks/queries/use-blog-queries';
import { useFollowCounts } from '@/hooks/queries/use-follow-queries';
import { usePublicResume } from '@/hooks/queries/use-resume-queries';
import { FollowButton } from '@/components/shared/follow-button';
import { useAuth } from '@/providers/auth-provider';
import { useUserPosts } from '@/features/feed';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/shared/user-avatar';
import { TechBadge } from '@/components/shared/tech-badge';
import { Markdown } from '@/components/ui/markdown';
import { ProjectCard } from '@/features/projects/components/project-card';
import { BlogCard } from '@/features/blogs/components/blog-card';
import { PostCard } from '@/features/feed';
import { formatDateRange } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HeroBackground } from '@/components/ui/hero-background';
import { FileText, Loader2, Pencil } from 'lucide-react';
import { SocialIcon } from 'react-social-icons';
import {
  Location,
  Global,
  Briefcase,
  Teacher,
  Setting2,
  Code1,
} from 'iconsax-react';

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
  const { data: followCounts } = useFollowCounts(profile?.id);
  const { data: publicResume } = usePublicResume(username);
  const { user } = useAuth();
  const isOwnProfile = user?.id === profile?.id;

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

  const projects = (projectsData?.items ?? []).filter(
    (p) => p.status === 'Published',
  );
  const blogs = blogsData?.items ?? [];
  const posts = postsData?.items ?? [];

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'projects', label: 'Projects', count: projects.length },
    { id: 'blogs', label: 'Blogs', count: blogs.length },
    { id: 'posts', label: 'Posts', count: posts.length },
  ];

  return (
    <div className="pb-12">
      <HeroBackground className="pt-24 pb-10">
        <div className="container px-4">
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
                  <p className="mt-2 text-md text-muted-foreground">
                    {headline}
                  </p>
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
                    {profile.socialLinks.map((link) => (
                      <span
                        key={link.platform}
                        className="rounded-full transition-colors hover:bg-muted"
                      >
                        <SocialIcon
                          url={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          bgColor="transparent"
                          fgColor="hsl(var(--foreground))"
                          title={link.platform}
                          style={{ height: 36, width: 36 }}
                        />
                      </span>
                    ))}
                  </div>
                )}

                {/* Follow counts + button */}
                <div className="mt-4 flex flex-wrap items-center justify-center gap-4 md:justify-start">
                  {followCounts && (
                    <div className="flex items-center gap-3 text-sm">
                      <span>
                        <span className="font-semibold">
                          {followCounts.followersCount}
                        </span>{' '}
                        <span className="text-muted-foreground">followers</span>
                      </span>
                      <span>
                        <span className="font-semibold">
                          {followCounts.followingCount}
                        </span>{' '}
                        <span className="text-muted-foreground">following</span>
                      </span>
                    </div>
                  )}
                  {publicResume?.pdfUrl && (
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={`/profile/${username}/resume.pdf`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FileText className="mr-1.5 h-3.5 w-3.5" />
                        Resume
                      </a>
                    </Button>
                  )}
                  {isOwnProfile ? (
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/profile">
                        <Pencil className="mr-1.5 h-3.5 w-3.5" />
                        Edit Profile
                      </Link>
                    </Button>
                  ) : (
                    user && <FollowButton targetUserId={profile.id} />
                  )}
                </div>
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
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-[10px] font-medium">
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </HeroBackground>

      <div className="container px-4">
        <div className="mx-auto max-w-5xl">
          {/* ── Tab Content ───────────────────────────────────────── */}
          <div>
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
                      {employmentTypeLabels[exp.employmentType] ??
                        exp.employmentType}
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
