'use client';

import { use } from 'react';
import Link from 'next/link';
import { useUserProfile } from '@/hooks/queries/use-user-queries';
import { useProjects } from '@/hooks/queries/use-project-queries';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/shared/user-avatar';
import { Separator } from '@/components/ui/separator';
import { ProjectCard } from '@/features/projects/components/project-card';
import { formatDate } from '@/lib/format';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  MapPin,
  Globe,
  Github,
  Linkedin,
  Twitter,
  ExternalLink,
  Loader2,
  Briefcase,
  GraduationCap,
  Wrench,
} from 'lucide-react';

const socialIcons: Record<string, React.ElementType> = {
  Github: Github,
  Linkedin: Linkedin,
  Twitter: Twitter,
  Website: Globe,
};

const proficiencyColors: Record<string, string> = {
  Beginner: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  Intermediate: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  Advanced:
    'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  Expert: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
};

export default function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = use(params);
  const { data: profile, isLoading, error } = useUserProfile(username);
  const { data: projectsData } = useProjects(
    { authorId: profile?.id ?? '' },
    { enabled: !!profile },
  );

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

  return (
    <div className="container px-4 pb-8 md:pb-12 pt-20">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Profile Header */}
        <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
          <UserAvatar
            src={profile.avatarUrl}
            name={profile.name}
            className="h-24 w-24 md:h-32 md:w-32"
            fallbackClassName="text-2xl"
          />
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold">{profile.name}</h1>
            <p className="text-lg text-muted-foreground">@{profile.username}</p>
            {profile.headline && (
              <p className="mt-2 text-muted-foreground">{profile.headline}</p>
            )}
            {profile.bio && <p className="mt-3 text-sm">{profile.bio}</p>}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground md:justify-start">
              {profile.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {profile.location}
                </span>
              )}
              {profile.website && (
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-foreground"
                >
                  <Globe className="h-4 w-4" />
                  {profile.website.replace(/^https?:\/\//, '')}
                </a>
              )}
            </div>

            {/* Social Links */}
            {profile.socialLinks.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2 md:justify-start">
                {profile.socialLinks.map((link) => {
                  const Icon = socialIcons[link.platform] ?? ExternalLink;
                  return (
                    <Button
                      key={link.platform}
                      variant="outline"
                      size="icon"
                      asChild
                    >
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={link.platform}
                      >
                        <Icon className="h-4 w-4" />
                      </a>
                    </Button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Tech Stack */}
        {profile.techStack.length > 0 && (
          <section>
            <h2 className="mb-4 text-xl font-semibold">Tech Stack</h2>
            <div className="flex flex-wrap gap-2">
              {profile.techStack.map((tech) => (
                <Badge
                  key={tech.name}
                  variant="secondary"
                  className={proficiencyColors[tech.proficiency] ?? ''}
                >
                  {tech.name}
                  <span className="ml-1 text-[10px] opacity-70">
                    {tech.category.replace(/_/g, ' ')}
                  </span>
                </Badge>
              ))}
            </div>
          </section>
        )}

        {/* Experience */}
        {profile.experiences.length > 0 && (
          <section>
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
              <Briefcase className="h-5 w-5" />
              Experience
            </h2>
            <div className="space-y-4">
              {profile.experiences.map((exp) => (
                <div
                  key={exp.id}
                  className="relative border-l-2 border-muted-foreground/20 pl-6"
                >
                  <div className="absolute -left-[5px] top-1.5 h-2 w-2 rounded-full bg-primary" />
                  <div className="flex flex-col gap-1">
                    <h3 className="font-semibold">{exp.position}</h3>
                    <p className="text-sm text-muted-foreground">
                      {exp.company}
                      {exp.location && ` · ${exp.location}`}
                      {' · '}
                      {exp.employmentType.replace(/([A-Z])/g, ' $1').trim()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(exp.startDate, 'MMM YYYY')} &ndash;{' '}
                      {exp.current
                        ? 'Present'
                        : exp.endDate
                          ? formatDate(exp.endDate, 'MMM YYYY')
                          : ''}
                    </p>
                    {exp.description && (
                      <p className="mt-1 text-sm">{exp.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        {profile.education.length > 0 && (
          <section>
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
              <GraduationCap className="h-5 w-5" />
              Education
            </h2>
            <div className="space-y-4">
              {profile.education.map((edu) => (
                <div
                  key={edu.id}
                  className="relative border-l-2 border-muted-foreground/20 pl-6"
                >
                  <div className="absolute -left-[5px] top-1.5 h-2 w-2 rounded-full bg-primary" />
                  <div className="flex flex-col gap-1">
                    <h3 className="font-semibold">{edu.institution}</h3>
                    <p className="text-sm text-muted-foreground">
                      {edu.degree}
                      {edu.fieldOfStudy && ` · ${edu.fieldOfStudy}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(edu.startDate, 'MMM YYYY')} &ndash;{' '}
                      {edu.current
                        ? 'Present'
                        : edu.endDate
                          ? formatDate(edu.endDate, 'MMM YYYY')
                          : ''}
                    </p>
                    {edu.description && (
                      <p className="mt-1 text-sm">{edu.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {projectsData && projectsData.items.length > 0 && (
          <section>
            <h2 className="mb-4 text-xl font-semibold">Projects</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {projectsData.items.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </section>
        )}

        {/* Services */}
        {profile.services.length > 0 && (
          <section>
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
              <Wrench className="h-5 w-5" />
              Services
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {profile.services.map((service) => (
                <Card key={service.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{service.title}</CardTitle>
                  </CardHeader>
                  {service.description && (
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {service.description}
                      </p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {profile.techStack.length === 0 &&
          profile.experiences.length === 0 &&
          profile.education.length === 0 &&
          profile.services.length === 0 &&
          (!projectsData || projectsData.items.length === 0) && (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">
              This developer hasn&apos;t added any content yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
