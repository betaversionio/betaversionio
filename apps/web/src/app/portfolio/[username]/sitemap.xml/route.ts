import { NextRequest, NextResponse } from 'next/server';
import {
  fetchPortfolioUser,
  fetchPortfolioProjects,
  fetchPortfolioBlogs,
} from '@/lib/portfolio-api';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ username: string }> },
) {
  const { username } = await params;
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'betaversion.io';
  const baseUrl = `https://${username}.${rootDomain}`;

  const user = await fetchPortfolioUser(username);
  if (!user) {
    return new NextResponse('Not found', { status: 404 });
  }

  const [projects, blogs] = await Promise.all([
    fetchPortfolioProjects(user.id),
    fetchPortfolioBlogs(user.id),
  ]);

  const urls: Array<{ loc: string; lastmod?: string; priority: string }> = [
    { loc: baseUrl, priority: '1.0' },
    ...projects.map((p) => ({
      loc: `${baseUrl}/projects/${p.slug}`,
      lastmod: p.updatedAt,
      priority: '0.8',
    })),
    ...blogs.map((b) => ({
      loc: `${baseUrl}/blog/${b.slug}`,
      lastmod: b.updatedAt,
      priority: '0.8',
    })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>${u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ''}
    <priority>${u.priority}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=300, s-maxage=300',
    },
  });
}
