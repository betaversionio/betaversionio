import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { fetchPortfolioBlog } from '@/lib/portfolio-api';
import { HeroSection } from '@/components/ui/hero-section';
import { Badge } from '@/components/ui/badge';
import { UserAvatar } from '@/components/shared/user-avatar';
import { Markdown } from '@/components/ui/markdown';
import { ArrowLeft, Clock } from 'lucide-react';

interface Props {
  params: Promise<{ username: string; slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username, slug } = await params;
  const blog = await fetchPortfolioBlog(slug);

  if (!blog) return { title: 'Not Found' };

  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'betaversion.io';

  return {
    title: blog.title,
    description: blog.excerpt ?? blog.content.slice(0, 160),
    openGraph: {
      type: 'article',
      title: blog.title,
      description: blog.excerpt ?? blog.content.slice(0, 160),
      url: `https://${username}.${rootDomain}/blog/${slug}`,
      publishedTime: blog.createdAt,
      modifiedTime: blog.updatedAt,
      ...(blog.coverImage && {
        images: [{ url: blog.coverImage, width: 1200, height: 630, alt: blog.title }],
      }),
      ...(blog.tags.length > 0 && { tags: blog.tags }),
    },
  };
}

function buildArticleJsonLd(
  blog: NonNullable<Awaited<ReturnType<typeof fetchPortfolioBlog>>>,
  username: string,
) {
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'betaversion.io';

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: blog.title,
    ...(blog.excerpt && { description: blog.excerpt }),
    ...(blog.coverImage && { image: blog.coverImage }),
    datePublished: blog.createdAt,
    dateModified: blog.updatedAt,
    author: {
      '@type': 'Person',
      name: blog.author.name ?? blog.author.username,
      url: `https://${username}.${rootDomain}`,
    },
    ...(blog.tags.length > 0 && { keywords: blog.tags.join(', ') }),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://${username}.${rootDomain}/blog/${blog.slug}`,
    },
  };
}

function estimateReadTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

export default async function PortfolioBlogPage({ params }: Props) {
  const { username, slug } = await params;
  const blog = await fetchPortfolioBlog(slug);

  if (!blog) notFound();

  const jsonLd = buildArticleJsonLd(blog, username);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

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

          {/* Author + Read time */}
          <div className="mt-5 flex items-center justify-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-2 text-foreground">
              <UserAvatar
                src={blog.author.avatarUrl}
                name={blog.author.name}
                className="h-6 w-6"
                fallbackClassName="text-[8px]"
              />
              <span className="text-sm font-medium">
                {blog.author.name ?? blog.author.username}
              </span>
            </div>
            <span>&middot;</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {estimateReadTime(blog.content)} min read
            </span>
            <span>&middot;</span>
            <span>
              {new Date(blog.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>
      </HeroSection>

      <div className="container px-4 pb-12">
        <article className="mx-auto max-w-4xl">
          <div className="mb-6">
            <Link
              href="/#blog"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to portfolio
            </Link>
          </div>

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
        </article>
      </div>
    </>
  );
}
