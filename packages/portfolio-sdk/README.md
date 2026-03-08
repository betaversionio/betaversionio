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

// Username is optional — when omitted, the API auto-detects the user
// from the request Origin header / subdomain
const portfolio = await client.getPortfolio();

if (portfolio) {
  console.log(portfolio.user.name);
  console.log(portfolio.projects);
  console.log(portfolio.blogs);
}
```

## Username

The `username` parameter in `getPortfolio()` is **optional**. When omitted, the API identifies the user from the Origin header or subdomain of the deployed portfolio site. This is the recommended approach for production deployments.

For local development or when you need to explicitly specify a user, pass it directly:

```ts
const portfolio = await client.getPortfolio('johndoe');
```

## API

### `new BetaVersionClient(options?)`

| Option   | Type     | Default                         | Description  |
| -------- | -------- | ------------------------------- | ------------ |
| `apiUrl` | `string` | `https://api.betaversion.io/v1` | Base API URL |

### Methods

Every method accepts an optional `fetchOptions` parameter (`RequestInit`) forwarded to the underlying `fetch` call. Use this for framework-specific options like Next.js revalidation:

```ts
await client.getPortfolio('johndoe', { next: { revalidate: 300 } });
```

#### `client.getPortfolio(username?, fetchOptions?)`

Returns all portfolio data for a user, or `null` on failure.

- **With username:** `GET /portfolio/:username`
- **Without username:** `GET /portfolio` — backend auto-detects from Origin / subdomain

```ts
const data: PortfolioData | null = await client.getPortfolio();
```

The returned `PortfolioData` includes:

| Field          | Type                      | Description                        |
| -------------- | ------------------------- | ---------------------------------- |
| `user`         | `PortfolioUser`           | Profile, social links, tech stack, experiences, education, services |
| `projects`     | `PortfolioProject[]`      | Published projects with images, tech stack, links |
| `blogs`        | `PortfolioBlog[]`         | Published blog posts               |
| `resume`       | `PortfolioResume \| null` | Resume PDF URL if available        |
| `followCounts` | `FollowCounts`            | Follower and following counts      |

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
  PortfolioData,
  PortfolioUser,
  PortfolioProject,
  PortfolioBlog,
  PortfolioResume,
  FollowCounts,
  BetaVersionClientOptions,
} from '@betaversionio/portfolio-sdk';
```

### Key type shapes

#### `PortfolioUser`

```ts
{
  id, email, username, name, avatarUrl,
  profile: { bio, headline, location, website },
  socialLinks: [{ platform, url }],
  techStack: [{ name, category, proficiency }],
  experiences: [{ company, position, startDate, endDate, current, ... }],
  education: [{ institution, degree, fieldOfStudy, startDate, endDate, ... }],
  services: [{ title, description }],
  projects: [{ id, title, slug, shortDescription, techStack, status }],
}
```

#### `PortfolioProject`

```ts
{
  id, title, slug, description, tagline, logo,
  images, techStack, tags, links,
  demoUrl, videoUrl, launchDate, phase, status, isOpenSource,
  upvotesCount, commentsCount, viewsCount,
  author: { id, username, name, avatarUrl },
  createdAt, updatedAt,
}
```

#### `PortfolioBlog`

```ts
{
  id, title, slug, excerpt, content, coverImage,
  tags, status,
  upvotesCount, commentsCount, viewsCount,
  author: { id, username, name, avatarUrl },
  createdAt, updatedAt,
}
```

## Error handling

All API methods return `null` on failure instead of throwing, allowing graceful degradation:

```ts
const portfolio = await client.getPortfolio();
if (!portfolio) {
  // show fallback UI
}
```

## License

MIT
