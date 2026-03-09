# @betaversionio/portfolio-sdk

SDK for fetching portfolio data from the [BetaVersion.io](https://betaversion.io) API. Ships two entry points:

- **`@betaversionio/portfolio-sdk`** — framework-agnostic client using global `fetch` (works everywhere)
- **`@betaversionio/portfolio-sdk/hooks`** — React hooks with built-in caching (powered by TanStack Query)

## Installation

```bash
npm install @betaversionio/portfolio-sdk
```

## React Hooks

The hooks entry point provides a `PortfolioProvider` and three data hooks. No extra dependencies needed — TanStack Query is bundled internally.

### Setup

Wrap your app with `PortfolioProvider`:

```tsx
import { PortfolioProvider } from '@betaversionio/portfolio-sdk/hooks';

function App() {
  return (
    <PortfolioProvider
      apiUrl="https://api.betaversion.io/v1"
      fallbackUsername="johndoe"
    >
      <YourApp />
    </PortfolioProvider>
  );
}
```

#### `PortfolioProvider` props

| Prop               | Type     | Required | Description                                                                                      |
| ------------------ | -------- | -------- | ------------------------------------------------------------------------------------------------ |
| `apiUrl`           | `string` | Yes      | Base API URL (e.g. `https://api.betaversion.io/v1`)                                              |
| `username`         | `string` | No       | Explicit username — always fetches `/portfolio/:username`                                        |
| `fallbackUsername`  | `string` | No       | Used as a fallback when auto-detection fails (recommended for local development)                 |

**Username resolution order:**
1. `username` prop — if provided, always used directly
2. Auto-detection — `GET /portfolio`, backend resolves user from Origin header / subdomain
3. `fallbackUsername` — retried if auto-detection fails

For production deployments behind a custom domain, omit `username` and set `fallbackUsername` as a safety net. For local development, use `fallbackUsername` with your username.

### Hooks

All hooks must be used inside `<PortfolioProvider>`. They return TanStack Query results (`data`, `isPending`, `isError`, `error`, etc.) with built-in caching (5 min stale time).

#### `usePortfolio(options?)`

Fetches the complete portfolio.

```tsx
import { usePortfolio } from '@betaversionio/portfolio-sdk/hooks';

function Profile() {
  const { data, isPending, isError } = usePortfolio();

  if (isPending) return <p>Loading...</p>;
  if (isError || !data) return <p>Failed to load</p>;

  return (
    <div>
      <h1>{data.user.name}</h1>
      <p>{data.user.profile.bio}</p>
      <p>{data.projects.length} projects</p>
    </div>
  );
}
```

| Option      | Type      | Default    | Description                    |
| ----------- | --------- | ---------- | ------------------------------ |
| `enabled`   | `boolean` | `true`     | Enable/disable the query       |
| `staleTime` | `number`  | `300000`   | Cache duration in milliseconds |

#### `useProject(slug, options?)`

Fetches a single project by slug.

```tsx
import { useProject } from '@betaversionio/portfolio-sdk/hooks';

function ProjectPage({ slug }: { slug: string }) {
  const { data: project, isPending } = useProject(slug);

  if (isPending) return <p>Loading...</p>;
  if (!project) return <p>Not found</p>;

  return <h1>{project.title}</h1>;
}
```

#### `useBlog(slug, options?)`

Fetches a single blog post by slug.

```tsx
import { useBlog } from '@betaversionio/portfolio-sdk/hooks';

function BlogPost({ slug }: { slug: string }) {
  const { data: blog, isPending } = useBlog(slug);

  if (isPending) return <p>Loading...</p>;
  if (!blog) return <p>Not found</p>;

  return <h1>{blog.title}</h1>;
}
```

`useProject` and `useBlog` accept the same `options` as `usePortfolio`.

## Client (framework-agnostic)

For non-React environments or server-side usage, use the `BetaVersionClient` directly.

### Quick start

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

### `new BetaVersionClient(options?)`

| Option             | Type     | Default                         | Description                                          |
| ------------------ | -------- | ------------------------------- | ---------------------------------------------------- |
| `apiUrl`           | `string` | `https://api.betaversion.io/v1` | Base API URL                                         |
| `fallbackUsername`  | `string` | —                               | Fallback username when auto-detection fails          |

### Methods

Every method accepts an optional `fetchOptions` parameter (`RequestInit`) forwarded to the underlying `fetch` call. Use this for framework-specific options like Next.js revalidation:

```ts
await client.getPortfolio('johndoe', { next: { revalidate: 300 } });
```

#### `client.getPortfolio(username?, fetchOptions?)`

Returns all portfolio data for a user, or `null` on failure.

- **With username:** `GET /portfolio/:username`
- **Without username:** `GET /portfolio` — backend auto-detects from Origin / subdomain. Falls back to `fallbackUsername` if the auto-detection request fails.

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

All types are exported from the main entry point:

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

All methods (both client and hooks) return `null` on failure instead of throwing, allowing graceful degradation:

```ts
// Client
const portfolio = await client.getPortfolio();
if (!portfolio) {
  // show fallback UI
}

// Hooks
const { data, isError } = usePortfolio();
if (isError || !data) {
  // show fallback UI
}
```

## License

MIT
