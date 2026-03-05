import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchPortfolioUser } from '@/lib/portfolio-api';
import { ThemeProvider } from '@/providers/theme-provider';
import { PortfolioNav } from '@/components/portfolio/portfolio-nav';
import { PortfolioFooter } from '@/components/portfolio/portfolio-footer';

interface Props {
  params: Promise<{ username: string }>;
  children: React.ReactNode;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const user = await fetchPortfolioUser(username);

  if (!user) {
    return { title: 'Not Found' };
  }

  const name = user.name ?? username;
  const headline = user.profile?.headline;
  const bio = user.profile?.bio;
  const description =
    headline ?? bio?.slice(0, 160) ?? `${name}'s portfolio`;
  const rootDomain =
    process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'betaversion.io';
  const url = `https://${username}.${rootDomain}`;

  return {
    title: {
      default: `${name} — Portfolio`,
      template: `%s | ${name}`,
    },
    description,
    metadataBase: new URL(url),
    alternates: { canonical: url },
    openGraph: {
      type: 'profile',
      url,
      title: `${name} — Portfolio`,
      description,
      ...(user.avatarUrl && {
        images: [{ url: user.avatarUrl, width: 400, height: 400, alt: name }],
      }),
    },
    twitter: {
      card: 'summary',
      title: `${name} — Portfolio`,
      description,
      ...(user.avatarUrl && { images: [user.avatarUrl] }),
    },
    robots: { index: true, follow: true },
  };
}

function buildJsonLd(user: NonNullable<Awaited<ReturnType<typeof fetchPortfolioUser>>>) {
  const rootDomain =
    process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'betaversion.io';
  const url = `https://${user.username}.${rootDomain}`;

  const currentJob = user.experiences.find((e) => e.current);
  const sameAs = user.socialLinks.map((l) => l.url);
  if (user.profile?.website) sameAs.push(user.profile.website);

  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: user.name ?? user.username,
    url,
    ...(user.avatarUrl && { image: user.avatarUrl }),
    ...(user.profile?.headline && { jobTitle: user.profile.headline }),
    ...(currentJob && {
      worksFor: {
        '@type': 'Organization',
        name: currentJob.company,
      },
    }),
    ...(user.education.length > 0 && {
      alumniOf: user.education.map((edu) => ({
        '@type': 'EducationalOrganization',
        name: edu.institution,
      })),
    }),
    ...(user.techStack.length > 0 && {
      knowsAbout: user.techStack.map((t) => t.name),
    }),
    ...(sameAs.length > 0 && { sameAs }),
  };
}

export default async function PortfolioLayout({ params, children }: Props) {
  const { username } = await params;
  const user = await fetchPortfolioUser(username);

  if (!user) notFound();

  const jsonLd = buildJsonLd(user);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <div className="flex min-h-screen flex-col bg-background text-foreground [scrollbar-gutter:stable]">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <PortfolioNav
          name={user.name ?? user.username}
          avatarUrl={user.avatarUrl}
        />
        <main className="flex-1">{children}</main>
        <PortfolioFooter
          name={user.name ?? user.username}
          socialLinks={user.socialLinks}
        />
      </div>
    </ThemeProvider>
  );
}
