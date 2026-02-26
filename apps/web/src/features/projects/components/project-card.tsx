'use client';

import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserAvatar } from '@/components/shared/user-avatar';
import { TechBadge } from '@/components/shared/tech-badge';
import { Heart, Message } from 'iconsax-react';


interface ProjectCardProps {
  project: {
    id: string;
    slug: string;
    title: string;
    logo: string | null;
    tagline: string | null;
    techStack: string[];
    upvotesCount: number;
    commentsCount: number;
    author: {
      username: string;
      name: string | null;
      avatarUrl: string | null;
    };
  };
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Card className="group relative flex h-full flex-col transition-shadow hover:shadow-md">
      <Link
        href={`/projects/${project.slug}`}
        className="absolute inset-0 z-0"
      />

      <CardHeader>
        <div className="flex items-center gap-2.5">
          {project.logo && (
            <img
              src={project.logo}
              alt=""
              className="h-8 w-8 rounded-md object-cover"
            />
          )}
          <CardTitle className="line-clamp-1 text-lg">
            {project.title}
          </CardTitle>
        </div>
        {project.tagline && (
          <CardDescription className="line-clamp-2">
            {project.tagline}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="px-6 pb-4">
        <div className="flex flex-wrap gap-1.5">
          {project.techStack.slice(0, 4).map((tech) => (
            <TechBadge key={tech} name={tech} variant="outline" className="gap-1.5 text-xs" />
          ))}
          {project.techStack.length > 4 && (
            <Badge variant="outline" className="text-xs">
              +{project.techStack.length - 4}
            </Badge>
          )}
        </div>
      </CardContent>

      <CardContent className="mt-auto border-t py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <UserAvatar
              src={project.author.avatarUrl}
              name={project.author.name}
              className="h-5 w-5"
              fallbackClassName="text-[10px]"
            />
            <span className="text-xs text-muted-foreground">
              {project.author.username}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Heart size={16} color="currentColor" variant="Linear" />
              {project.upvotesCount}
            </span>
            <span className="flex items-center gap-1">
              <Message size={16} color="currentColor" variant="Linear" />
              {project.commentsCount}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
