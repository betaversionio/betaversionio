export const siteConfig = {
  name: 'BetaVersion.IO',
  description:
    'The developer identity platform. Portfolio, resume, projects, feed, and ideas — unified under one subdomain.',
  url: process.env.NEXT_PUBLIC_BASE_URL || 'https://betaversion.io',
  ogImage: '/opengraph-image.png',
  logo: '/icon.svg',
  links: {
    twitter: 'https://twitter.com/betaversion_io',
    github: 'https://github.com/betaversion-io',
    discord: 'https://discord.gg/betaversion',
  },
  keywords: [
    'developer portfolio',
    'developer identity',
    'resume builder',
    'project showcase',
    'developer feed',
    'BetaVersion.IO',
    'DevCom',
  ],
  authors: [
    {
      name: 'BetaVersion.IO',
      url: 'https://betaversion.io',
    },
  ],
  contact: {
    email: 'hello@betaversion.io',
    languages: ['English'],
  },
};

export type SiteConfig = typeof siteConfig;
