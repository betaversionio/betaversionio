export interface ResolveUsernameOptions {
  /** Pass the incoming Request object in SSR contexts (Next.js, Remix, Astro, etc.) */
  request?: Request;
  /** Environment variable name to check. Defaults to "PORTFOLIO_USERNAME". */
  envVar?: string;
  /** HTML meta tag name to check in the DOM. Defaults to "portfolio-username". */
  metaTag?: string;
}

/**
 * Resolve the portfolio username from multiple sources, in order:
 *
 * 1. `x-portfolio-username` request header (SSR — any framework)
 * 2. Environment variable (defaults to `PORTFOLIO_USERNAME`)
 * 3. `<meta name="portfolio-username" content="...">` in the DOM (SPA / Vite)
 *
 * Throws if no username can be resolved.
 */
export function resolveUsername(options?: ResolveUsernameOptions): string {
  // 1. Request header (SSR)
  if (options?.request) {
    const header = options.request.headers.get('x-portfolio-username');
    if (header) return header;
  }

  // 2. Environment variable
  const varName = options?.envVar ?? 'PORTFOLIO_USERNAME';
  if (typeof process !== 'undefined' && process.env?.[varName]) {
    return process.env[varName] as string;
  }

  // 3. Meta tag in the DOM (SPA)
  const tag = options?.metaTag ?? 'portfolio-username';
  if (typeof document !== 'undefined') {
    const meta = document.querySelector(`meta[name="${tag}"]`);
    const content = meta?.getAttribute('content');
    if (content) return content;
  }

  throw new Error(
    'Could not resolve portfolio username. ' +
      'Provide a Request with the x-portfolio-username header, ' +
      `set the ${varName} environment variable, ` +
      `or add <meta name="${tag}" content="..."> to your HTML.`,
  );
}
