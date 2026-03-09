import type {
  PortfolioProject,
  PortfolioBlog,
  PortfolioData,
} from './types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface BetaVersionClientOptions {
  apiUrl?: string;
  fallbackUsername?: string;
}

export class BetaVersionClient {
  private readonly apiUrl: string;
  private readonly fallbackUsername?: string;

  constructor(options?: BetaVersionClientOptions) {
    this.apiUrl = options?.apiUrl ?? 'https://api.betaversion.io/v1';
    this.fallbackUsername = options?.fallbackUsername;
  }

  private async fetchApi<T>(
    endpoint: string,
    fetchOptions?: RequestInit,
  ): Promise<T | null> {
    try {
      const res = await fetch(`${this.apiUrl}${endpoint}`, fetchOptions);

      if (!res.ok) return null;

      const json = await res.json();

      if (json && typeof json === 'object' && 'success' in json && 'data' in json) {
        return (json as ApiResponse<T>).data;
      }

      return json as T;
    } catch {
      return null;
    }
  }

  /**
   * Fetch full portfolio data.
   *
   * - With username: `GET /portfolio/:username`
   * - Without username: `GET /portfolio` — backend auto-detects from Origin header / subdomain
   */
  async getPortfolio(
    username?: string,
    fetchOptions?: RequestInit,
  ): Promise<PortfolioData | null> {
    const endpoint = username ? `/portfolio/${username}` : '/portfolio';
    const result = await this.fetchApi<PortfolioData>(endpoint, fetchOptions);

    // If no username was provided and the request failed, retry with fallbackUsername
    if (!result && !username && this.fallbackUsername) {
      return this.fetchApi<PortfolioData>(`/portfolio/${this.fallbackUsername}`, fetchOptions);
    }

    return result;
  }

  async getProject(
    slug: string,
    fetchOptions?: RequestInit,
  ): Promise<PortfolioProject | null> {
    return this.fetchApi<PortfolioProject>(`/portfolio/project/${slug}`, fetchOptions);
  }

  async getBlog(
    slug: string,
    fetchOptions?: RequestInit,
  ): Promise<PortfolioBlog | null> {
    return this.fetchApi<PortfolioBlog>(`/portfolio/blog/${slug}`, fetchOptions);
  }
}
