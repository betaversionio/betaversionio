import { notFound } from 'next/navigation';
import Link from 'next/link';
import { fetchBlog } from '@/lib/api';

interface Props {
  params: Promise<{ slug: string }>;
}

function estimateReadTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;
  const blog = await fetchBlog(slug);

  if (!blog) notFound();

  const date = new Date(blog.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Back link */}
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to portfolio
      </Link>

      {/* Header */}
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

      {/* Cover image */}
      {blog.coverImage && (
        <div className="mb-8 aspect-[2/1] w-full overflow-hidden rounded-xl">
          <img
            src={blog.coverImage}
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
      )}

      {/* Content */}
      <article className="prose prose-sm max-w-none dark:prose-invert">
        {blog.content.split('\n').map((paragraph, i) =>
          paragraph.trim() ? <p key={i}>{paragraph}</p> : null,
        )}
      </article>
    </div>
  );
}
