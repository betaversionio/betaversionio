import { BetaVersionClient } from '@betaversionio/portfolio-sdk';

export type {
  PortfolioUser,
  PortfolioProject,
  PortfolioBlog,
  PortfolioResume,
  FollowCounts,
  PortfolioData,
} from '@betaversionio/portfolio-sdk';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/v1';
const USERNAME = import.meta.env.VITE_PORTFOLIO_USERNAME as string | undefined;

export const client = new BetaVersionClient({ apiUrl: API_URL });

export async function fetchPortfolio() {
  return client.getPortfolio(USERNAME);
}
