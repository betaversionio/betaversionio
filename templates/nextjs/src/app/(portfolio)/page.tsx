import { notFound } from 'next/navigation';
import { fetchPortfolio, getUsername } from '@/lib/api';
import { Sidebar } from '@/components/sidebar';
import { ProjectCard } from '@/components/project-card';
import { BlogCard } from '@/components/blog-card';

const employmentTypeLabels: Record<string, string> = {
  FullTime: 'Full-time',
  PartTime: 'Part-time',
  Contract: 'Contract',
  Freelance: 'Freelance',
  Internship: 'Internship',
};

function formatDateRange(start: string, end: string | null, current: boolean): string {
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  return `${fmt(start)} — ${current ? 'Present' : end ? fmt(end) : ''}`;
}

export default async function PortfolioHome() {
  const username = await getUsername();
  const data = await fetchPortfolio(username);

  if (!data) notFound();

  const { user, projects, blogs, resume, followCounts } = data;
  const bio = user.profile?.bio;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-10 lg:flex-row">
        {/* Left sidebar */}
        <Sidebar user={user} resume={resume} followCounts={followCounts} />

        {/* Main content */}
        <main className="min-w-0 flex-1 space-y-10">
          {/* About */}
          {bio && (
            <section>
              <SectionHeading title="About" />
              <div className="rounded-xl border border-border bg-card p-5">
                <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                  {bio}
                </p>
              </div>
            </section>
          )}

          {/* Experience */}
          {user.experiences.length > 0 && (
            <section>
              <SectionHeading title="Experience" />
              <div className="space-y-3">
                {user.experiences.map((exp) => (
                  <div
                    key={exp.id}
                    className="rounded-xl border border-border bg-card p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-semibold">{exp.position}</h3>
                        <p className="text-xs text-muted-foreground">
                          {exp.company}
                          {exp.location && ` · ${exp.location}`}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        {employmentTypeLabels[exp.employmentType] ?? exp.employmentType}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      {formatDateRange(exp.startDate, exp.endDate, exp.current)}
                    </p>
                    {exp.description && (
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {exp.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Projects */}
          {projects.length > 0 && (
            <section>
              <SectionHeading title="Projects" />
              <div className="grid gap-3 sm:grid-cols-2">
                {projects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            </section>
          )}

          {/* Blog Posts */}
          {blogs.length > 0 && (
            <section>
              <SectionHeading title="Blog Posts" />
              <div className="grid gap-3 sm:grid-cols-2">
                {blogs.map((blog) => (
                  <BlogCard key={blog.id} blog={blog} />
                ))}
              </div>
            </section>
          )}

          {/* Education */}
          {user.education.length > 0 && (
            <section>
              <SectionHeading title="Education" />
              <div className="space-y-3">
                {user.education.map((edu) => (
                  <div
                    key={edu.id}
                    className="rounded-xl border border-border bg-card p-5"
                  >
                    <h3 className="text-sm font-semibold">{edu.degree}</h3>
                    <p className="text-xs text-muted-foreground">
                      {edu.institution}
                      {edu.fieldOfStudy && ` · ${edu.fieldOfStudy}`}
                    </p>
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      {formatDateRange(edu.startDate, edu.endDate, edu.current)}
                    </p>
                    {edu.description && (
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {edu.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Services */}
          {user.services.length > 0 && (
            <section>
              <SectionHeading title="Services" />
              <div className="grid gap-3 sm:grid-cols-2">
                {user.services.map((service) => (
                  <div
                    key={service.id}
                    className="rounded-xl border border-border bg-card p-5"
                  >
                    <h3 className="text-sm font-semibold">{service.title}</h3>
                    {service.description && (
                      <p className="mt-1.5 text-xs text-muted-foreground">
                        {service.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

function SectionHeading({ title }: { title: string }) {
  return <h2 className="mb-4 text-lg font-bold tracking-tight">{title}</h2>;
}
