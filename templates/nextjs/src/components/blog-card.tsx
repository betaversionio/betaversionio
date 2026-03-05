import Link from 'next/link';
import type { PortfolioBlog } from '@/lib/api';

interface BlogCardProps {
  blog: PortfolioBlog;
}

export function BlogCard({ blog }: BlogCardProps) {
  const date = new Date(blog.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Link
      href={`/blog/${blog.slug}`}
      className="group block rounded-xl border border-border bg-card p-5 transition-colors hover:bg-muted/50"
    >
      <h3 className="text-sm font-semibold group-hover:text-accent-foreground">
        {blog.title}
      </h3>
      {blog.excerpt && (
        <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">
          {blog.excerpt}
        </p>
      )}
      <div className="mt-3 flex items-center gap-2">
        <time className="text-xs text-muted-foreground">{date}</time>
        {blog.tags.length > 0 && (
          <>
            <span className="text-xs text-muted-foreground">&middot;</span>
            <div className="flex flex-wrap gap-1">
              {blog.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          </>
        )}
      </div>
    </Link>
  );
}
