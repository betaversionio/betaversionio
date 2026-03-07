# BetaVersion.IO

A developer community platform that replaces fragmented developer presence across GitHub, LinkedIn, personal portfolios, and blogs with a single, unified professional identity.

Every developer gets a personalized subdomain (e.g., `satyam.betaversion.io`) that serves as their complete professional identity — portfolio, resume, blog, projects, and proof of work in one place.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router), React 19, Tailwind CSS v4, shadcn/ui |
| Backend | NestJS 11, Passport.js (JWT + OAuth), Zod v4 |
| Database | PostgreSQL with Prisma 7 ORM |
| Editor | Tiptap + Shiki (rich text & syntax highlighting), Monaco Editor |
| Monorepo | Turborepo, pnpm workspaces, TypeScript 5.9 |
| Infra | Vercel (web), Docker, Nginx, Cloudflare, Let's Encrypt |

## Features

### Developer Portfolio
- Personalized subdomain (`username.betaversion.io`)
- Customizable portfolio templates
- Profile with experience, education, tech stack, social links
- QR code generation for business cards
- Visitor analytics

### Project Showcase
- Rich project pages with cover images, tech stack tags, and demo links
- Multiple collaborators with roles
- Media gallery (screenshots, GIFs, demo videos, diagrams)
- Community engagement — upvotes, reviews with ratings, comments, bookmarks
- Project collections (curated groups of projects)
- Version updates and changelog

### Resume Builder
- Structured resume editor with multiple templates (professional, minimal, academic, creative)
- Live PDF preview and generation
- Auto-populated from profile data
- Hosted at `username.betaversion.io/resume.pdf`
- Multi-format export (PDF, DOCX, LaTeX, JSON Resume)
- Version history tracking

### Community Feed
- Multiple post types: text, articles, code snippets, milestones, links
- Rich text editing with markdown and code blocks
- Reactions (Like, Celebrate, Insightful, Curious, Support)
- Threaded comments and hashtag discovery

### Blog Engine
- Built-in blogging with markdown and syntax highlighting
- Drafts, publishing, and archiving
- Comments, votes, and view tracking
- SEO-optimized with server-rendered pages

### Social
- Follow/follower system
- Real-time notifications
- Project collaboration invitations
- Bookmarking

## Project Structure

```
betaversionio/
├── apps/
│   ├── api/                    # NestJS backend (port 4000)
│   │   └── src/modules/
│   │       ├── auth/           # JWT + OAuth (GitHub, Google, email)
│   │       ├── project/        # Projects, comments, votes, reviews
│   │       ├── feed/           # Posts, reactions, hashtags
│   │       ├── blog/           # Blog posts, comments, votes
│   │       ├── resume/         # Resume generation & templates
│   │       ├── user/           # Profiles, tech stack, social links
│   │       ├── follow/         # Follow relationships
│   │       ├── notification/   # Real-time notifications
│   │       ├── collection/     # Project collections
│   │       ├── github/         # GitHub integration
│   │       ├── mail/           # Email (verification, reset)
│   │       └── storage/        # File uploads (S3-compatible)
│   │
│   └── web/                    # Next.js frontend (port 3000)
│       └── src/app/
│           ├── (auth)/         # Login, register, OAuth callbacks
│           ├── (dashboard)/    # Feed, projects, profile, settings
│           ├── (studio)/       # Content creation (blog, project, resume editors)
│           ├── (public)/       # Browse projects, blogs, collections
│           ├── (portfolio)/    # Subdomain portfolio pages
│           └── embed/          # Embeddable widgets
│
├── packages/
│   ├── database/               # Prisma schema & client
│   ├── shared/                 # Zod schemas, types, constants
│   └── config/                 # TypeScript, ESLint, Prettier configs
│
├── nginx/                      # Nginx configs (API & web)
├── scripts/                    # Server setup scripts
├── Dockerfile                  # Multi-stage build (API & web targets)
└── docker-compose.yml          # Local dev environment
```

## Authentication

- Email/password, GitHub OAuth, Google OAuth
- Access token via cookie (7 days) + Authorization header fallback
- Refresh token via httpOnly cookie (15 days)
- Cookie-based flow with `credentials: 'include'`

## Subdomain Routing

Next.js edge middleware detects the subdomain and internally routes `username.betaversion.io` to `/portfolio/username`. Reserved subdomains (`www`, `api`, `app`, `admin`, `docs`) are excluded.

## Development

```bash
# Install dependencies
pnpm install

# Generate Prisma client
pnpm db:generate

# Build shared packages
pnpm --filter @devcom/database build
pnpm --filter @devcom/shared build

# Start dev servers
pnpm dev
```

Or with Docker:

```bash
docker compose up
```

## Deployment

| Component | Where | How |
|---|---|---|
| Web (Next.js) | GitHub Actions -> Self-hosted | Built on GitHub runner, standalone artifact deployed via pm2 |
| API (NestJS) | Self-hosted runner | Built and deployed directly via pm2 |
| Database | PostgreSQL | Managed or self-hosted |
| DNS & CDN | Cloudflare | Wildcard domain `*.betaversion.io` with SSL |
