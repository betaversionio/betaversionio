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
import { Heart, Message } from 'iconsax-react';
import { blogStatusColors } from '@/features/blogs/constants';

interface BlogCardProps {
  blog: {
    id: string;
    slug: string;
    title: string;
    coverImage: string | null;
    excerpt: string | null;
    status: string;
    tags: string[];
    upvotesCount: number;
    commentsCount: number;
    author: {
      username: string;
      name: string | null;
      avatarUrl: string | null;
    };
  };
}

export function BlogCard({ blog }: BlogCardProps) {
  return (
    <Card className="group relative flex h-full flex-col transition-shadow hover:shadow-md">
      <Link
        href={`/blogs/${blog.slug}`}
        className="absolute inset-0 z-0"
      />

      {blog.coverImage && (
        <div className="aspect-[2/1] w-full overflow-hidden rounded-t-lg">
          <img
            src={blog.coverImage}
            alt=""
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        </div>
      )}

      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="line-clamp-2 text-lg">
            {blog.title}
          </CardTitle>
          <Badge
            variant="secondary"
            className={blogStatusColors[blog.status] ?? ''}
          >
            {blog.status}
          </Badge>
        </div>
        {blog.excerpt && (
          <CardDescription className="line-clamp-2">
            {blog.excerpt}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="px-6 pb-4">
        <div className="flex flex-wrap gap-1.5">
          {blog.tags.slice(0, 4).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {blog.tags.length > 4 && (
            <Badge variant="outline" className="text-xs">
              +{blog.tags.length - 4}
            </Badge>
          )}
        </div>
      </CardContent>

      <CardContent className="mt-auto border-t py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <UserAvatar
              src={blog.author.avatarUrl}
              name={blog.author.name}
              className="h-5 w-5"
              fallbackClassName="text-[10px]"
            />
            <span className="text-xs text-muted-foreground">
              {blog.author.username}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Heart size={16} color="currentColor" variant="Linear" />
              {blog.upvotesCount}
            </span>
            <span className="flex items-center gap-1">
              <Message size={16} color="currentColor" variant="Linear" />
              {blog.commentsCount}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
