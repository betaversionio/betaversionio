import { headers } from 'next/headers';
import { BetaVersionClient } from '@betaversionio/portfolio-sdk';

export type {
  PortfolioUser,
  PortfolioProject,
  PortfolioBlog,
  PortfolioResume,
  FollowCounts,
  PortfolioData,
} from '@betaversionio/portfolio-sdk';

const API_URL = process.env.BETAVERSION_API_URL ?? 'http://localhost:4000/v1';

export const client = new BetaVersionClient({ apiUrl: API_URL });

async function fetchOptions(): Promise<RequestInit> {
  const hdrs = await headers();
  const forwarded: Record<string, string> = {};

  const origin = hdrs.get('origin');
  if (origin) forwarded['origin'] = origin;

  const referer = hdrs.get('referer');
  if (referer) forwarded['referer'] = referer;

  const host = hdrs.get('host');
  if (host) forwarded['x-forwarded-host'] = host;

  // Explicit header from proxy or env var fallback for local dev
  const portfolioHeader = hdrs.get('x-portfolio-username') || process.env.PORTFOLIO_USERNAME;
  if (portfolioHeader) forwarded['x-portfolio-username'] = portfolioHeader;

  return { headers: forwarded, next: { revalidate: 300 } } as RequestInit;
}

export async function fetchPortfolio() {
  return client.getPortfolio(undefined, await fetchOptions());
}

export async function fetchProject(slug: string) {
  return client.getProject(slug, await fetchOptions());
}

export async function fetchBlog(slug: string) {
  return client.getBlog(slug, await fetchOptions());
}
