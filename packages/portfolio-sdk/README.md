# @betaversionio/portfolio-sdk

SDK for fetching portfolio data from the [BetaVersion.io](https://betaversion.io) API. Framework-agnostic — works with Next.js, Remix, Astro, Vite, or any environment that provides a global `fetch`.

## Installation

```bash
npm install @betaversionio/portfolio-sdk
```

## Quick start

```ts
import { BetaVersionClient } from '@betaversionio/portfolio-sdk';

const client = new BetaVersionClient();

const portfolio = await client.getPortfolio('johndoe');

if (portfolio) {
  console.log(portfolio.user.name);
  console.log(portfolio.projects);
  console.log(portfolio.blogs);
}
```

## Resolving the username

The SDK provides a `resolveUsername()` helper that works across frameworks. It checks three sources in order:

1. `x-portfolio-username` request header (SSR)
2. `PORTFOLIO_USERNAME` environment variable
3. `<meta name="portfolio-username">` tag in the DOM (SPA)

### Next.js / Remix / Astro (SSR)

Pass the incoming `Request` object:

```ts
import { resolveUsername } from '@betaversionio/portfolio-sdk';

// Next.js App Router
import { headers } from 'next/headers';

export async function getUsername() {
  const hdrs = await headers();
  return resolveUsername({
    request: new Request('http://localhost', { headers: hdrs }),
  });
}

// Remix loader
export async function loader({ request }: LoaderFunctionArgs) {
  const username = resolveUsername({ request });
  // ...
}

// Astro
const username = resolveUsername({ request: Astro.request });
```

### Vite / SPA

Add a meta tag to your `index.html` (the proxy can inject this):

```html
<meta name="portfolio-username" content="johndoe" />
```

Then call `resolveUsername()` with no arguments:

```ts
import { resolveUsername } from '@betaversionio/portfolio-sdk';

const username = resolveUsername();
```

### Custom options

```ts
resolveUsername({
  envVar: 'MY_CUSTOM_ENV_VAR',    // override env var name
  metaTag: 'my-custom-meta-name', // override meta tag name
});
```

## API

### `new BetaVersionClient(options?)`

| Option   | Type     | Default                            | Description       |
| -------- | -------- | ---------------------------------- | ----------------- |
| `apiUrl` | `string` | `https://api.betaversion.io/v1`    | Base API URL      |

### Methods

Every method accepts an optional `fetchOptions` parameter (`RequestInit`) that gets forwarded to the underlying `fetch` call. This lets you pass framework-specific options like Next.js revalidation:

```ts
await client.getPortfolio('johndoe', { next: { revalidate: 300 } });
```

#### `client.getPortfolio(username, fetchOptions?)`

Returns all portfolio data for a user, or `null` if the user is not found.

```ts
const data: PortfolioData | null = await client.getPortfolio('johndoe');
```

The returned `PortfolioData` includes:

| Field          | Type                     |
| -------------- | ------------------------ |
| `user`         | `PortfolioUser`          |
| `projects`     | `PortfolioProject[]`     |
| `blogs`        | `PortfolioBlog[]`        |
| `resume`       | `PortfolioResume \| null`|
| `followCounts` | `FollowCounts`           |

#### `client.getProject(slug, fetchOptions?)`

Returns a single project by slug, or `null` if not found.

```ts
const project: PortfolioProject | null = await client.getProject('my-project');
```

#### `client.getBlog(slug, fetchOptions?)`

Returns a single blog post by slug, or `null` if not found.

```ts
const blog: PortfolioBlog | null = await client.getBlog('my-post');
```

## Types

All types are exported from the package:

```ts
import type {
  PortfolioUser,
  PortfolioProject,
  PortfolioBlog,
  PortfolioResume,
  FollowCounts,
  PortfolioData,
  BetaVersionClientOptions,
  ResolveUsernameOptions,
} from '@betaversionio/portfolio-sdk';
```

## License

MIT
