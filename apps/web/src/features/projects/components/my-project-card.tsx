import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Pencil } from 'lucide-react';
import { Heart, Message } from 'iconsax-react';
import { statusColors } from '@/features/projects/constants';

interface MyProjectCardProps {
  project: {
    id: string;
    slug: string;
    title: string;
    logo: string | null;
    tagline: string | null;
    status: string;
    techStack: string[];
    upvotesCount: number;
    commentsCount: number;
  };
}

export function MyProjectCard({ project }: MyProjectCardProps) {
  return (
    <Card className="group relative flex h-full flex-col transition-shadow hover:shadow-md">
      <Link
        href={`/my-projects/${project.slug}`}
        className="absolute inset-0 z-0"
      />

      <CardHeader>
        <div className="flex items-start justify-between">
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
          <Badge
            variant="secondary"
            className={statusColors[project.status] ?? ''}
          >
            {project.status}
          </Badge>
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
            <Badge key={tech} variant="outline" className="text-xs">
              {tech}
            </Badge>
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
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="relative z-10 h-7 w-7 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
          >
            <Link href={`/my-projects/${project.slug}/edit`}>
              <Pencil className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
