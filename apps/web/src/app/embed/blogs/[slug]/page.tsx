'use client';

import { use } from 'react';
import { useBlog } from '@/hooks/queries/use-blog-queries';
import { UserAvatar } from '@/components/shared/user-avatar';
import { Badge } from '@/components/ui/badge';
import { Eye, Heart, Message } from 'iconsax-react';

function BlogEmbedSkeleton() {
  return (
    <div className="flex min-h-screen items-center gap-4 bg-card p-4 animate-pulse">
      <div className="h-16 w-24 shrink-0 rounded-md bg-muted" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="h-4 w-2/3 rounded bg-muted" />
        <div className="h-3 w-full rounded bg-muted" />
        <div className="flex gap-1.5">
          <div className="h-5 w-12 rounded-full bg-muted" />
          <div className="h-5 w-12 rounded-full bg-muted" />
        </div>
      </div>
    </div>
  );
}

export default function BlogEmbedPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { data: blog, isLoading, isError } = useBlog(slug);

  if (isLoading) return <BlogEmbedSkeleton />;

  if (isError || !blog) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-card p-4">
        <p className="text-sm text-muted-foreground">Blog not found</p>
      </div>
    );
  }

  return (
    <a
      href={`/blogs/${blog.slug}`}
      target="_top"
      className="group flex min-h-screen items-center gap-4 bg-card p-4 transition-colors hover:bg-muted/50"
    >
      {blog.coverImage && (
        <img
          src={blog.coverImage}
          alt=""
          className="h-16 w-24 shrink-0 rounded-md object-cover"
        />
      )}

      <div className="min-w-0 flex-1">
        <h3 className="line-clamp-1 text-sm font-semibold">{blog.title}</h3>
        {blog.excerpt && (
          <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
            {blog.excerpt}
          </p>
        )}

        <div className="mt-2 flex flex-wrap gap-1">
          {blog.tags.slice(0, 4).map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="text-[10px] px-1.5 py-0"
            >
              {tag}
            </Badge>
          ))}
          {blog.tags.length > 4 && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              +{blog.tags.length - 4}
            </Badge>
          )}
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-2">
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
        <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
          <span className="flex items-center gap-0.5">
            <Heart size={14} color="currentColor" variant="Linear" />
            {blog.upvotesCount}
          </span>
          <span className="flex items-center gap-0.5">
            <Message size={14} color="currentColor" variant="Linear" />
            {blog.commentsCount}
          </span>
          <span className="flex items-center gap-0.5">
            <Eye size={14} color="currentColor" variant="Linear" />
            {blog.viewsCount}
          </span>
        </div>
      </div>
    </a>
  );
}
