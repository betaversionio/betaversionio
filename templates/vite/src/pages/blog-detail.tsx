import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { client } from '@/lib/api';
import type { PortfolioBlog } from '@/lib/api';

function estimateReadTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

export function BlogDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [blog, setBlog] = useState<PortfolioBlog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    client
      .getBlog(slug)
      .then((result) => {
        setBlog(result);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-foreground" />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4">
        <h1 className="text-6xl font-bold text-muted-foreground">404</h1>
        <p className="mt-4 text-lg text-muted-foreground">Blog post not found.</p>
        <Link
          to="/"
          className="mt-6 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          Back to portfolio
        </Link>
      </div>
    );
  }

  const date = new Date(blog.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to portfolio
      </Link>

      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{blog.title}</h1>

        {blog.excerpt && (
          <p className="mt-3 text-base text-muted-foreground">{blog.excerpt}</p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <time>{date}</time>
          <span>&middot;</span>
          <span>{estimateReadTime(blog.content)} min read</span>
        </div>

        {blog.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {blog.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </header>

      {blog.coverImage && (
        <div className="mb-8 aspect-[2/1] w-full overflow-hidden rounded-xl">
          <img
            src={blog.coverImage}
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <article className="prose prose-sm max-w-none dark:prose-invert">
        {blog.content.split('\n').map((paragraph, i) =>
          paragraph.trim() ? <p key={i}>{paragraph}</p> : null,
        )}
      </article>
    </div>
  );
}
