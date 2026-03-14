import { NextRequest, NextResponse } from 'next/server';

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'betaversion.io';
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/v1';

const RESERVED_SUBDOMAINS = new Set([
  'www',
  'api',
  'app',
  'admin',
  'mail',
  'docs',
  'status',
  'staging',
  'dev',
  'cdn',
  'assets',
]);

// Cache template URLs in-memory for 60 seconds to avoid hitting the API on every request
const templateUrlCache = new Map<string, { url: string | null; expiresAt: number }>();
const CACHE_TTL_MS = 60_000;

async function getTemplateBaseUrl(username: string): Promise<string | null> {
  const cached = templateUrlCache.get(username);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.url;
  }

  try {
    const res = await fetch(`${API_URL}/portfolio/${username}/template-url`, {
      signal: AbortSignal.timeout(3000),
    });

    if (!res.ok) {
      templateUrlCache.set(username, { url: null, expiresAt: Date.now() + CACHE_TTL_MS });
      return null;
    }

    const json = await res.json();
    const baseUrl: string | null = json?.data?.baseUrl ?? json?.baseUrl ?? null;

    templateUrlCache.set(username, { url: baseUrl, expiresAt: Date.now() + CACHE_TTL_MS });
    return baseUrl;
  } catch {
    return null;
  }
}

/**
 * Check if the request is on the docs subdomain.
 */
function isDocsSubdomain(host: string): boolean {
  return host === `docs.${ROOT_DOMAIN}` || host === 'docs.localhost';
}

/**
 * Detect whether this request is on a template subdomain.
 * Returns the username if yes, null otherwise.
 */
function getSubdomainUsername(host: string): string | null {
  if (
    host === ROOT_DOMAIN ||
    host === `www.${ROOT_DOMAIN}` ||
    host === 'localhost'
  ) {
    return null;
  }

  if (host.endsWith(`.${ROOT_DOMAIN}`) || host.endsWith('.localhost')) {
    const username = host.replace(`.${ROOT_DOMAIN}`, '').replace('.localhost', '');
    if (RESERVED_SUBDOMAINS.has(username)) return null;
    return username;
  }

  return null;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // Strip port for local dev (e.g. "satyam.localhost:3000" → "satyam.localhost")
  const host = (request.headers.get('host') ?? '').split(':')[0]!;

  // docs.betaversion.io → /docs (skip _next assets and paths already under /docs)
  if (isDocsSubdomain(host) && !pathname.startsWith('/_next/') && !pathname.startsWith('/docs')) {
    const url = request.nextUrl.clone();
    url.pathname = `/docs${pathname === '/' ? '' : pathname}`;
    return NextResponse.rewrite(url);
  }

  const username = getSubdomainUsername(host);

  if (username) {
    const templateBaseUrl = await getTemplateBaseUrl(username);

    if (templateBaseUrl) {
      // Reverse-proxy everything (pages, _next/static, _next/image, etc.)
      // to the template app so assets resolve correctly.
      // The username is passed via x-portfolio-username header so template
      // routes don't need /{username} in the URL path.
      const headers = new Headers(request.headers);
      headers.set('x-portfolio-username', username);
      const target = new URL(pathname, templateBaseUrl);
      target.search = request.nextUrl.search;
      return NextResponse.rewrite(target, { request: { headers } });
    }

    // Fallback: built-in portfolio (only for page requests, not static assets)
    if (!pathname.startsWith('/_next/') && !pathname.startsWith('/favicon.ico')) {
      const url = request.nextUrl.clone();
      url.pathname = `/portfolio/${username}${pathname === '/' ? '' : pathname}`;
      return NextResponse.rewrite(url);
    }
  }

  // Rewrite /@username → /profile/username (keeps /@username in the URL bar)
  if (pathname.startsWith('/@')) {
    const rest = pathname.slice(2); // strip "/@"
    const url = request.nextUrl.clone();
    url.pathname = `/profile/${rest}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  // Run on all paths — template subdomains need _next/static proxied too.
  // For the main domain, non-page paths fall through to NextResponse.next().
  matcher: ['/((?!favicon\\.ico|sitemap\\.xml|robots\\.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)'],
};
