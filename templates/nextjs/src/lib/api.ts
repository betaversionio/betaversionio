import { headers } from 'next/headers';
import { BetaVersionClient, resolveUsername } from '@betaversionio/portfolio-sdk';

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

/**
 * Read the portfolio username from the x-portfolio-username header
 * set by the proxy, or fall back to PORTFOLIO_USERNAME env var for local dev.
 */
export async function getUsername(): Promise<string> {
  const hdrs = await headers();
  return resolveUsername({
    request: new Request('http://localhost', { headers: hdrs }),
  });
}

export async function fetchPortfolio(username: string) {
  return client.getPortfolio(username, { next: { revalidate: 300 } } as RequestInit);
}

export async function fetchProject(slug: string) {
  return client.getProject(slug, { next: { revalidate: 300 } } as RequestInit);
}

export async function fetchBlog(slug: string) {
  return client.getBlog(slug, { next: { revalidate: 300 } } as RequestInit);
}
