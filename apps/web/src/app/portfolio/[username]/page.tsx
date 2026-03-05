import { notFound } from 'next/navigation';
import {
  fetchPortfolioUser,
  fetchPortfolioProjects,
  fetchPortfolioBlogs,
  fetchPortfolioResume,
  fetchFollowCounts,
} from '@/lib/portfolio-api';
import { UserAvatar } from '@/components/shared/user-avatar';
import { TechBadge } from '@/components/shared/tech-badge';
import { Markdown } from '@/components/ui/markdown';
import { ProjectCard } from '@/features/projects/components/project-card';
import { BlogCard } from '@/features/blogs/components/blog-card';
import { HeroBackground } from '@/components/ui/hero-background';
import { Card, CardContent } from '@/components/ui/card';
import { SocialIcon } from 'react-social-icons';
import { formatDateRange } from '@/lib/utils';
import { FileText } from 'lucide-react';
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

export default async function PortfolioPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const user = await fetchPortfolioUser(username);

  if (!user) notFound();

  const [projects, blogs, resume, followCounts] = await Promise.all([
    fetchPortfolioProjects(user.id),
    fetchPortfolioBlogs(user.id),
    fetchPortfolioResume(username),
    fetchFollowCounts(user.id),
  ]);

  const bio = user.profile?.bio;
  const headline = user.profile?.headline;
  const location = user.profile?.location;
  const website = user.profile?.website;
  const displayName = user.name ?? user.username;

  return (
    <div className="pb-12">
      <HeroBackground className="pt-24 pb-10">
        <div className="container px-4">
          <div className="mx-auto max-w-5xl">
            {/* ── Hero / Header (centered) ────────────────────────── */}
            <div className="flex flex-col items-center gap-6 text-center">
              <UserAvatar
                src={user.avatarUrl}
                name={displayName}
                className="h-28 w-28 ring-4 ring-background sm:h-36 sm:w-36"
                fallbackClassName="text-3xl"
              />
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  {displayName}
                </h1>
                {headline && (
                  <p className="mt-2 text-md text-muted-foreground">
                    {headline}
                  </p>
                )}

                <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
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
                {user.socialLinks.length > 0 && (
                  <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                    {user.socialLinks.map((link) => (
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

                {/* Follow counts + Resume */}
                <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
                  {resume?.pdfUrl && (
                    <a
                      href={resume.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      Resume
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </HeroBackground>

      <div className="container px-4">
        <div className="mx-auto max-w-5xl space-y-10">
          {/* About — full width, no card */}
          {bio && (
            <section id="about" className="text-center">
              <SectionHeading title="About" />
              <Markdown content={bio} size="default" />
            </section>
          )}

          {/* Experience */}
          {user.experiences.length > 0 && (
            <section id="experience">
              <SectionHeading
                title="Experience"
                icon={
                  <Briefcase size={26} color="currentColor" variant="Bulk" />
                }
              />
              <div className="mx-auto grid max-w-3xl gap-4 sm:grid-cols-2">
                {user.experiences.map((exp) => (
                  <Card
                    key={exp.id}
                    className="transition-colors hover:bg-muted/40"
                  >
                    <CardContent className="p-5">
                      <div className="mb-2 flex items-center gap-2">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                          <Briefcase
                            size={18}
                            color="hsl(var(--primary))"
                            variant="Bulk"
                          />
                        </div>
                        <div className="min-w-0">
                          <h4 className="truncate text-sm font-semibold">
                            {exp.position}
                          </h4>
                          <p className="truncate text-xs text-muted-foreground">
                            {exp.company}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                        <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 font-medium">
                          {employmentTypeLabels[exp.employmentType] ??
                            exp.employmentType}
                        </span>
                        {exp.location && (
                          <span className="flex items-center gap-1">
                            <Location
                              size={12}
                              color="currentColor"
                              variant="Bold"
                            />
                            {exp.location}
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {formatDateRange(
                          exp.startDate,
                          exp.endDate,
                          exp.current,
                        )}
                      </p>
                      {exp.description && (
                        <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                          {exp.description}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Education */}
          {user.education.length > 0 && (
            <section id="education">
              <SectionHeading
                title="Education"
                icon={<Teacher size={26} color="currentColor" variant="Bulk" />}
              />
              <div className="mx-auto grid max-w-3xl gap-4 sm:grid-cols-2">
                {user.education.map((edu) => (
                  <Card
                    key={edu.id}
                    className="transition-colors hover:bg-muted/40"
                  >
                    <CardContent className="p-5">
                      <div className="mb-2 flex items-center gap-2">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                          <Teacher
                            size={18}
                            color="hsl(var(--primary))"
                            variant="Bulk"
                          />
                        </div>
                        <div className="min-w-0">
                          <h4 className="truncate text-sm font-semibold">
                            {edu.degree}
                          </h4>
                          <p className="truncate text-xs text-muted-foreground">
                            {edu.institution}
                          </p>
                        </div>
                      </div>
                      {edu.fieldOfStudy && (
                        <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                          {edu.fieldOfStudy}
                        </span>
                      )}
                      <p className="mt-2 text-xs text-muted-foreground">
                        {formatDateRange(
                          edu.startDate,
                          edu.endDate,
                          edu.current,
                        )}
                      </p>
                      {edu.description && (
                        <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                          {edu.description}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Services */}
          {user.services.length > 0 && (
            <section id="services">
              <SectionHeading
                title="Services"
                icon={
                  <Setting2 size={26} color="currentColor" variant="Bulk" />
                }
              />
              <div className="mx-auto grid max-w-3xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {user.services.map((service) => (
                  <Card key={service.id}>
                    <CardContent className="pt-5">
                      <h4 className="text-sm font-medium">{service.title}</h4>
                      {service.description && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {service.description}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Projects */}
          {projects.length > 0 && (
            <section id="projects">
              <SectionHeading title="Projects" />
              <div className="mx-auto grid max-w-3xl gap-4 sm:grid-cols-2">
                {projects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            </section>
          )}

          {/* Blog Posts */}
          {blogs.length > 0 && (
            <section id="blog">
              <SectionHeading title="Blog Posts" />
              <div className="mx-auto grid max-w-3xl gap-4 sm:grid-cols-2">
                {blogs.map((blog) => (
                  <BlogCard key={blog.id} blog={blog} />
                ))}
              </div>
            </section>
          )}

          {/* Tech Stack — bottom */}
          {user.techStack.length > 0 && (
            <section id="skills">
              <SectionHeading
                title="Tech Stack"
                icon={<Code1 size={26} color="currentColor" variant="Bulk" />}
              />
              <div className="flex flex-wrap justify-center gap-1.5">
                {user.techStack.map((tech) => (
                  <TechBadge
                    key={tech.name}
                    name={tech.name}
                    variant="secondary"
                    className="gap-1.5 text-xs"
                  />
                ))}
              </div>
            </section>
          )}
        </div>
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
    <h2 className="mb-6 flex items-center justify-center gap-2.5 text-3xl font-bold tracking-tight">
      {icon}
      {title}
    </h2>
  );
}
