import { NextRequest, NextResponse } from 'next/server';

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'betaversion.io';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // Strip port for local dev (e.g. "satyam.localhost:3000" → "satyam.localhost")
  const host = (request.headers.get('host') ?? '').split(':')[0]!;

  // Subdomain routing: {username}.betaversion.io → /profile/{username}
  // In dev: {username}.localhost
  const isSubdomain =
    host !== ROOT_DOMAIN &&
    host !== `www.${ROOT_DOMAIN}` &&
    host !== 'localhost' &&
    (host.endsWith(`.${ROOT_DOMAIN}`) || host.endsWith('.localhost'));

  if (isSubdomain) {
    const username = host.replace(`.${ROOT_DOMAIN}`, '').replace('.localhost', '');
    const url = request.nextUrl.clone();
    url.pathname = `/profile/${username}${pathname === '/' ? '' : pathname}`;
    return NextResponse.rewrite(url);
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
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
