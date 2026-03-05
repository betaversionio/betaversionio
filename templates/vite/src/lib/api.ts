import { BetaVersionClient } from '@betaversionio/portfolio-sdk';

export type {
  PortfolioUser,
  PortfolioProject,
  PortfolioBlog,
  PortfolioResume,
  FollowCounts,
  PortfolioData,
} from '@betaversionio/portfolio-sdk';

const API_URL = import.meta.env.VITE_BETAVERSION_API_URL ?? 'http://localhost:4000/v1';

export const client = new BetaVersionClient({ apiUrl: API_URL });
