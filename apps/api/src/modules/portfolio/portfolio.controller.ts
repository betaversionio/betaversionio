import {
  Controller,
  Get,
  Param,
  Req,
  BadRequestException,
} from '@nestjs/common';

import { Public } from '../../common/decorators/public.decorator';
import { PortfolioService } from './portfolio.service';

@Public()
@Controller('portfolio')
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  /**
   * Auto-detect username from the request:
   *   1. x-portfolio-username header (local dev / proxy)
   *   2. Origin header subdomain (satyam.betaversion.io → satyam)
   *   3. Referer header subdomain (fallback)
   *   4. Future: custom domain lookup
   */
  @Get()
  async getPortfolioAuto(
    @Req() req: { headers: Record<string, string | string[] | undefined> },
  ) {
    const username = this.resolveUsername(req.headers);
    return this.portfolioService.getPortfolio(username);
  }

  @Get('project/:slug')
  async getProject(@Param('slug') slug: string) {
    return this.portfolioService.getProject(slug);
  }

  @Get('blog/:slug')
  async getBlog(@Param('slug') slug: string) {
    return this.portfolioService.getBlog(slug);
  }

  @Get(':username')
  async getPortfolio(@Param('username') username: string) {
    return this.portfolioService.getPortfolio(username);
  }

  @Get(':username/template-url')
  async getTemplateUrl(@Param('username') username: string) {
    const baseUrl = await this.portfolioService.getTemplateUrl(username);
    return { baseUrl };
  }

  private resolveUsername(
    headers: Record<string, string | string[] | undefined>,
  ): string {
    // 1. Explicit header (local dev / proxy)
    const header = headers['x-portfolio-username'];
    if (typeof header === 'string') return header;
    if (Array.isArray(header) && header[0]) return header[0];

    // 2. Origin / Referer header (browser cross-origin requests)
    const subdomain =
      this.extractSubdomain(headers['origin']) ??
      this.extractSubdomain(headers['referer']);

    if (subdomain) return subdomain;

    throw new BadRequestException(
      'Could not resolve portfolio username. ' +
        'Set the x-portfolio-username header or make the request from a subdomain.',
    );
  }

  private extractSubdomain(
    url: string | string[] | undefined,
  ): string | null {
    if (!url || Array.isArray(url)) return null;
    try {
      const hostname = new URL(url).hostname;
      const parts = hostname.split('.');
      const sub = parts[0];
      if (!sub || sub === 'www' || sub === 'api') return null;
      // satyam.localhost (dev) or satyam.betaversion.io (prod)
      if (parts.length === 2 && parts[1] === 'localhost') return sub;
      if (parts.length >= 3) return sub;
    } catch {
      // invalid URL
    }
    return null;
  }
}
