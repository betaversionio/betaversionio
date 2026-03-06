'use client';

import { use } from 'react';
import Link from 'next/link';
import { useBlog } from '@/hooks/queries/use-blog-queries';
import { BlogFloatingBar } from '@/features/blogs/components/detail/blog-sidebar';
import {
  BlogCommentsTab,
  BlogCommentComposer,
} from '@/features/blogs/components/detail/blog-comments-tab';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { HeroSection } from '@/components/ui/hero-section';
import { UserAvatar } from '@/components/shared/user-avatar';
import { Markdown } from '@/components/ui/markdown';
import { timeAgo } from '@/lib/format';
import { Loader2, Clock } from 'lucide-react';

function estimateReadTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

export default function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { data: blog, isLoading, error } = useBlog(slug);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="container flex min-h-[60vh] flex-col items-center justify-center px-4">
        <h2 className="text-2xl font-bold">Blog not found</h2>
        <p className="mt-2 text-muted-foreground">
          The blog post you&apos;re looking for doesn&apos;t exist.
        </p>
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/blogs">Back to blogs</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <HeroSection
        title={blog.title}
        description={blog.excerpt ?? undefined}
        className="border-none"
      >
        <div className="mx-auto max-w-4xl px-4 text-center">
          {/* Tags */}
          {blog.tags.length > 0 && (
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {blog.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Author + Read time + Updated */}
          <div className="mt-5 flex items-center justify-center gap-3 text-xs text-muted-foreground">
            <Link
              href={`/@${blog.author.username}`}
              className="flex items-center gap-2 text-foreground hover:underline"
            >
              <UserAvatar
                src={blog.author.avatarUrl}
                name={blog.author.name}
                className="h-6 w-6"
                fallbackClassName="text-[8px]"
              />
              <span className="text-sm font-medium">
                {blog.author.name ?? blog.author.username}
              </span>
            </Link>
            <span>&middot;</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {estimateReadTime(blog.content)} min read
            </span>
            <span>&middot;</span>
            <span>Updated {timeAgo(blog.updatedAt)}</span>
          </div>
        </div>
      </HeroSection>

      <div className="container px-4 pb-24 md:pb-28">
        <article className="mx-auto max-w-4xl">
          {/* Cover Image */}
          {blog.coverImage && (
            <div className="mb-8 aspect-[2/1] w-full overflow-hidden rounded-lg">
              <img
                src={blog.coverImage}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
          )}

          {/* Content */}
          <div className="min-w-0 overflow-hidden">
            <Markdown content={blog.content} />
          </div>

          {/* Comments Section */}
          <Separator className="my-10" />

          <section id="blog-comments">
            <h2 className="mb-6 text-xl font-semibold">
              Comments ({blog.commentsCount})
            </h2>

            <div className="mb-8">
              <BlogCommentComposer blogId={blog.id} />
            </div>

            <BlogCommentsTab blogId={blog.id} />
          </section>
        </article>

        {/* Floating Action Bar */}
        <BlogFloatingBar blog={blog} commentsCount={blog.commentsCount} />
      </div>
    </>
  );
}
