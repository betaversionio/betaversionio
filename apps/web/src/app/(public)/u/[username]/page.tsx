"use client";

import { use } from "react";
import Link from "next/link";
import { useUserProfile } from "@/hooks/queries/use-user-queries";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  MapPin,
  Globe,
  Github,
  Linkedin,
  Twitter,
  ExternalLink,
  Loader2,
  FolderKanban,
} from "lucide-react";

function getInitials(name: string | null | undefined): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const socialIcons: Record<string, React.ElementType> = {
  GITHUB: Github,
  LINKEDIN: Linkedin,
  TWITTER: Twitter,
  WEBSITE: Globe,
};

const proficiencyColors: Record<string, string> = {
  BEGINNER: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  INTERMEDIATE: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  ADVANCED: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  EXPERT: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
};

const statusColors: Record<string, string> = {
  DRAFT: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  ACTIVE: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  COMPLETED: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  ARCHIVED: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
};

export default function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = use(params);
  const { data: profile, isLoading, error } = useUserProfile(username);

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
    <div className="container px-4 py-8 md:py-12">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Profile Header */}
        <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
          <Avatar className="h-24 w-24 md:h-32 md:w-32">
            <AvatarImage src={profile.avatarUrl ?? undefined} />
            <AvatarFallback className="text-2xl">
              {getInitials(profile.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold">{profile.name}</h1>
            <p className="text-lg text-muted-foreground">
              @{profile.username}
            </p>
            {profile.headline && (
              <p className="mt-2 text-muted-foreground">
                {profile.headline}
              </p>
            )}
            {profile.bio && (
              <p className="mt-3 text-sm">{profile.bio}</p>
            )}
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
                  {profile.website.replace(/^https?:\/\//, "")}
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
                  className={proficiencyColors[tech.proficiency] ?? ""}
                >
                  {tech.name}
                  <span className="ml-1 text-[10px] opacity-70">
                    {tech.category.replace(/_/g, " ")}
                  </span>
                </Badge>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {profile.projects.length > 0 && (
          <section>
            <h2 className="mb-4 text-xl font-semibold">Projects</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {profile.projects.map((project) => (
                <Card
                  key={project.id}
                  className="transition-shadow hover:shadow-md"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <FolderKanban className="h-4 w-4 text-muted-foreground" />
                        <CardTitle className="line-clamp-1 text-base">
                          {project.title}
                        </CardTitle>
                      </div>
                      <Badge
                        variant="secondary"
                        className={statusColors[project.status] ?? ""}
                      >
                        {project.status}
                      </Badge>
                    </div>
                    {project.shortDescription && (
                      <CardDescription className="line-clamp-2">
                        {project.shortDescription}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1">
                      {project.techStack.slice(0, 5).map((tech) => (
                        <Badge
                          key={tech}
                          variant="outline"
                          className="text-xs"
                        >
                          {tech}
                        </Badge>
                      ))}
                      {project.techStack.length > 5 && (
                        <Badge variant="outline" className="text-xs">
                          +{project.techStack.length - 5}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {profile.techStack.length === 0 && profile.projects.length === 0 && (
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
