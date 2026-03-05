import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ username: string }> },
) {
  const { username } = await params;
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'betaversion.io';

  const body = `User-agent: *
Allow: /

Sitemap: https://${username}.${rootDomain}/sitemap.xml
`;

  return new NextResponse(body, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=300, s-maxage=300',
    },
  });
}
