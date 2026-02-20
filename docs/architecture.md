# BetaVersion.IO — Tech Stack & Architecture

> Opinionated decisions for a solo developer, zero budget, ship-fast-and-scale-later approach.

---

## Guiding Principles

1. **Free tier everything** — $0/month until you have real traction
2. **Minimize moving parts** — fewer services = fewer things to debug at 2am alone
3. **Convention over configuration** — pick frameworks that make decisions for you
4. **Managed over self-hosted** — don't waste time being a sysadmin, write product code
5. **Monolith first** — no microservices until you have a team and a reason to split

---

## The Stack (Final Decision)

```
┌─────────────────────────────────────────────────────────┐
│                      CLOUDFLARE                         │
│          DNS (wildcard *.betaversion.io)                │
│          CDN · SSL · DDoS Protection · Cache            │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│                       VERCEL                            │
│                                                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │              NEXT.JS 15 (App Router)            │    │
│  │                                                 │    │
│  │  ┌──────────┐ ┌──────────┐ ┌───────────────┐   │    │
│  │  │   SSR    │ │   API    │ │  Edge         │   │    │
│  │  │  Pages   │ │  Routes  │ │  Middleware    │   │    │
│  │  │(profiles)│ │(backend) │ │ (subdomain    │   │    │
│  │  │          │ │          │ │  routing)     │   │    │
│  │  └──────────┘ └────┬─────┘ └───────────────┘   │    │
│  │                    │                            │    │
│  └────────────────────┼────────────────────────────┘    │
└───────────────────────┼─────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
┌───────▼──────┐ ┌──────▼──────┐ ┌──────▼──────┐
│  SUPABASE    │ │ CLOUDFLARE  │ │   RESEND    │
│              │ │     R2      │ │             │
│ PostgreSQL   │ │             │ │ Transactional│
│ Auth         │ │ Resume PDFs │ │ Emails      │
│ Realtime     │ │ Images      │ │             │
│ Edge Funcs   │ │ Media       │ │ 3k/mo free  │
│              │ │             │ │             │
│ 500MB free   │ │ 10GB free   │ └─────────────┘
└──────────────┘ │ 0 egress $  │
                 └─────────────┘
```

---

## Layer-by-Layer Decisions

### Frontend + Backend: Next.js 15 (App Router)

**Why Next.js as a full-stack monolith:**
- SSR/SSG for portfolio pages → SEO out of the box
- API Routes replace the need for a separate backend
- Edge Middleware for subdomain routing at zero latency
- React Server Components reduce client-side JS
- One codebase, one deployment, one framework to learn
- Vercel deploys it for free with generous limits

**Why NOT separate frontend/backend:**
- You're solo. Two repos, two deployments, CORS issues, two CI pipelines = wasted time.
- Next.js API routes handle everything a REST/GraphQL backend would do.
- When you outgrow it (10k+ users), you can extract API routes into a separate service.

```
app/
├── (marketing)/          # Landing page, pricing, docs
│   ├── page.tsx
│   ├── pricing/
│   └── about/
├── (app)/                # Logged-in dashboard
│   ├── dashboard/
│   ├── projects/
│   ├── feed/
│   ├── ideas/
│   ├── resume-builder/
│   └── settings/
├── (portfolio)/          # Public portfolio (subdomain-routed)
│   ├── page.tsx          # username.betaversion.io
│   ├── projects/
│   ├── blog/
│   └── resume/
├── api/                  # API routes (backend)
│   ├── auth/
│   ├── projects/
│   ├── posts/
│   ├── ideas/
│   ├── resume/
│   └── webhooks/
└── middleware.ts          # Subdomain detection & routing
```

---

### Database: Supabase (PostgreSQL)

**Why Supabase:**
- Managed PostgreSQL — no database administration
- Built-in Auth (GitHub OAuth, Google, email/password, magic links) — don't build auth yourself
- Built-in Realtime subscriptions — live notifications, feed updates
- Row Level Security (RLS) — security at the database level
- Auto-generated REST API — CRUD without writing endpoints for simple cases
- Dashboard & SQL editor — inspect data without a separate tool
- **Free tier: 500MB database, 50k monthly active users auth, 1GB file storage, 2M edge function invocations**

**Schema overview (key tables):**

```sql
-- Users & Profiles
users                    -- Supabase auth (managed)
profiles                 -- username, bio, avatar, tagline, social_links, tech_stack
profile_experiences      -- work history, education
profile_certifications   -- certs

-- Projects
projects                 -- title, description, cover_image, tech_stack, status, links
project_collaborators    -- project_id, user_id, role
project_media            -- screenshots, videos, diagrams

-- Feed
posts                    -- author_id, content (markdown), post_type, created_at
post_reactions           -- post_id, user_id, reaction_type
comments                 -- post_id, author_id, parent_comment_id (threaded), content

-- Ideas
ideas                    -- author_id, title, description, tech_stack, commitment, stage
idea_roles               -- idea_id, role_title, description
idea_applications        -- idea_id, user_id, pitch
idea_comments            -- idea_id, author_id, content

-- Resume
resumes                  -- user_id, template_id, data (JSONB), custom_pdf_url, generated_pdf_url

-- Social
follows                  -- follower_id, following_id
endorsements             -- endorser_id, endorsed_id, skill
notifications            -- user_id, type, data (JSONB), read_at
```

**Why NOT MongoDB:**
- Your data is heavily relational (users → projects → collaborators → endorsements)
- PostgreSQL handles JSON (JSONB) just fine for flexible fields like `tech_stack` or `social_links`
- Supabase doesn't support MongoDB

**Why NOT Prisma ORM:**
- Use Drizzle ORM instead — lighter, faster, better TypeScript inference, closer to SQL
- Prisma's client is heavy and slow on serverless cold starts

---

### Auth: Supabase Auth

**Why not build your own or use NextAuth/Auth.js:**
- Supabase Auth is free, handles OAuth, email/password, magic links, and session management
- Integrates natively with RLS — the database itself enforces "this user can only edit their own data"
- One less dependency to manage

**OAuth Providers (Phase 1):**
- GitHub (primary — this is a developer platform)
- Google
- Email/Password (fallback)

---

### File Storage: Cloudflare R2

**Why R2 over Supabase Storage:**
- **Zero egress fees** — this matters when you serve resume PDFs and portfolio images to the public
- 10GB free storage, 10M reads/month free
- S3-compatible API — easy to integrate
- Served via Cloudflare CDN automatically

**What goes in R2:**
- Generated resume PDFs
- Custom uploaded resume PDFs
- Profile avatars
- Project cover images, screenshots, media
- Blog post images

**Why NOT Supabase Storage:**
- Supabase Storage free tier is 1GB with egress limits
- Resume PDFs served publicly will eat through egress fast
- R2's zero egress is a massive cost advantage

---

### PDF Resume Generation: @react-pdf/renderer

**Why:**
- Runs in Node.js — no headless browser needed
- Works in Vercel serverless functions (unlike Puppeteer which needs special config)
- Define resume templates as React components — you already know React
- Fast generation (< 1 second per resume)
- Output is clean, ATS-friendly PDF

**Pipeline:**
```
User edits resume in dashboard
        │
        ▼
JSONB data saved to `resumes` table
        │
        ▼
API route: /api/resume/generate
        │
        ▼
@react-pdf/renderer builds PDF from React template + data
        │
        ▼
Upload to Cloudflare R2 at: resumes/{username}/resume.pdf
        │
        ▼
username.betaversion.io/resume.pdf serves from R2 via redirect/proxy
```

**Why NOT Puppeteer / Playwright:**
- Heavy (~300MB), slow cold starts on serverless
- Vercel serverless has a 50MB function size limit (Puppeteer exceeds this without hacks)
- Overkill for structured resume PDFs

---

### Subdomain Routing: Next.js Edge Middleware + Cloudflare DNS

This is the trickiest part. Here's how it works:

**1. Cloudflare DNS:**
```
*.betaversion.io  →  CNAME  →  cname.vercel-dns.com
betaversion.io    →  CNAME  →  cname.vercel-dns.com
```

**2. Vercel Wildcard Domain:**
- Add `*.betaversion.io` as a domain in Vercel project settings
- Vercel automatically handles SSL for all subdomains

**3. Next.js Middleware (`middleware.ts`):**
```typescript
import { NextRequest, NextResponse } from 'next/server'

const RESERVED = new Set(['www', 'app', 'api', 'admin', 'docs', 'blog', 'status'])

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const subdomain = hostname.split('.')[0]

  // Main site: betaversion.io or www.betaversion.io
  if (!subdomain || subdomain === 'www' || hostname === 'betaversion.io') {
    return NextResponse.next()
  }

  // Reserved subdomains
  if (RESERVED.has(subdomain)) {
    return NextResponse.next()
  }

  // Rewrite to portfolio route: satyam.betaversion.io → /portfolio/satyam
  const url = request.nextUrl.clone()
  url.pathname = `/portfolio/${subdomain}${url.pathname}`
  return NextResponse.rewrite(url)
}
```

This means `satyam.betaversion.io/projects` internally resolves to `/portfolio/satyam/projects` — no separate server needed.

---

### Search: PostgreSQL Full-Text Search

**Phase 1 — just use Postgres:**
```sql
-- Add tsvector columns
ALTER TABLE profiles ADD COLUMN search_vector tsvector;
ALTER TABLE projects ADD COLUMN search_vector tsvector;
ALTER TABLE posts ADD COLUMN search_vector tsvector;

-- Create GIN indexes
CREATE INDEX idx_profiles_search ON profiles USING GIN(search_vector);

-- Query
SELECT * FROM profiles
WHERE search_vector @@ plainto_tsquery('english', 'react typescript');
```

**Why not Elasticsearch / Meilisearch yet:**
- Another service to manage and pay for
- PostgreSQL full-text search handles 10k-50k records easily
- Upgrade to Meilisearch Cloud (free tier: 100k documents) when search becomes a bottleneck

---

### Realtime: Supabase Realtime

- Subscribe to new notifications, feed updates, comments in real-time
- Built into Supabase — no extra infra
- Uses WebSockets under the hood
- Free tier is generous (200 concurrent connections)

---

### Email: Resend

**Why Resend:**
- 3,000 emails/month free
- Great DX — simple API, React Email for templates
- Built by developers, for developers

**Use cases:**
- Email verification
- Weekly digest
- Notification emails (new follower, collaboration request)
- Password reset

---

### Styling: Tailwind CSS + shadcn/ui

**Why:**
- Tailwind — utility-first, fast to build, no CSS files to manage
- shadcn/ui — copy-paste accessible components, not a bloated library
- Consistent design system from day one without hiring a designer
- shadcn components are yours — no dependency lock-in

---

### ORM: Drizzle

**Why Drizzle over Prisma:**
- Lighter bundle size (matters on serverless)
- Faster cold starts
- SQL-like API — you write what you mean
- Better TypeScript inference
- Works great with Supabase PostgreSQL

---

### Validation: Zod

- Schema validation for API routes, form inputs, environment variables
- Pairs perfectly with TypeScript — infer types from schemas
- Use with React Hook Form for client-side validation

---

### Rich Text / Markdown: MDX + Tiptap

- **Blog posts / Idea descriptions:** MDX (markdown + React components) parsed with `next-mdx-remote`
- **Feed posts / Comments:** Tiptap editor (rich text, but stores as markdown/JSON)
- **Code blocks:** Shiki for syntax highlighting (same engine as VS Code)

---

## Full Stack Summary

| Concern | Technology | Cost |
|---|---|---|
| Framework | Next.js 15 (App Router) | Free |
| Language | TypeScript | Free |
| Hosting | Vercel (Hobby) | Free |
| Database | Supabase PostgreSQL | Free (500MB) |
| Auth | Supabase Auth | Free (50k MAU) |
| Realtime | Supabase Realtime | Free (200 connections) |
| File Storage | Cloudflare R2 | Free (10GB, 0 egress) |
| DNS + CDN | Cloudflare | Free |
| PDF Generation | @react-pdf/renderer | Free (runs in serverless) |
| Email | Resend | Free (3k/mo) |
| ORM | Drizzle | Free |
| Styling | Tailwind CSS + shadcn/ui | Free |
| Validation | Zod | Free |
| Editor | Tiptap + Shiki | Free |
| Search | PostgreSQL full-text search | Free (included in Supabase) |
| Analytics | Vercel Analytics | Free (basic) |
| **Total** | | **$0/month** |

---

## When to Upgrade (Growth Triggers)

| Trigger | Action | Cost |
|---|---|---|
| Database > 500MB | Supabase Pro ($25/mo, 8GB) | $25/mo |
| File storage > 10GB | R2 paid tier ($0.015/GB/mo) | ~$5/mo |
| Need custom domain support | Vercel Pro ($20/mo for wildcard domains) | $20/mo |
| 50k+ MAU auth | Supabase Pro (included) | — |
| Search across 100k+ records | Meilisearch Cloud ($30/mo) | $30/mo |
| Email > 3k/month | Resend Pro ($20/mo, 50k emails) | $20/mo |
| Need background jobs | Trigger.dev or Vercel Cron | Free tier |
| **Realistic "we're growing" cost** | | **~$100/mo** |

---

## Project Structure (Monorepo)

```
betaversion/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (marketing)/        # Public landing pages
│   │   ├── (app)/              # Dashboard (authenticated)
│   │   ├── (portfolio)/        # Subdomain portfolio pages
│   │   └── api/                # API routes
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── feed/               # Feed-specific components
│   │   ├── projects/           # Project showcase components
│   │   ├── resume/             # Resume builder components
│   │   └── shared/             # Shared/layout components
│   ├── lib/
│   │   ├── db/
│   │   │   ├── schema.ts       # Drizzle schema definitions
│   │   │   ├── queries/        # Reusable query functions
│   │   │   └── migrations/     # Database migrations
│   │   ├── supabase/
│   │   │   ├── client.ts       # Browser client
│   │   │   ├── server.ts       # Server client
│   │   │   └── middleware.ts    # Auth middleware helper
│   │   ├── r2/                 # Cloudflare R2 helpers
│   │   ├── resume/             # PDF templates & generation
│   │   ├── validations/        # Zod schemas
│   │   └── utils.ts            # Shared utilities
│   ├── hooks/                  # Custom React hooks
│   ├── types/                  # TypeScript type definitions
│   └── middleware.ts           # Subdomain routing
├── public/                     # Static assets
├── drizzle.config.ts           # Drizzle ORM config
├── next.config.ts              # Next.js config
├── tailwind.config.ts          # Tailwind config
├── .env.local                  # Environment variables
├── package.json
└── tsconfig.json
```

---

## Key Architecture Decisions Log

| Decision | Choice | Rationale |
|---|---|---|
| Monolith vs Microservices | Monolith | Solo dev, ship fast, split later |
| REST vs GraphQL | REST (API routes) | Simpler, no extra tooling, good enough |
| Prisma vs Drizzle | Drizzle | Lighter, faster on serverless |
| Supabase Storage vs R2 | R2 | Zero egress fees for public files |
| Puppeteer vs react-pdf | react-pdf | Runs on serverless, no browser needed |
| Elasticsearch vs Postgres FTS | Postgres FTS | Free, no extra service, enough for MVP |
| Separate backend vs Next.js API | Next.js API routes | One codebase, one deploy |
| NextAuth vs Supabase Auth | Supabase Auth | Integrated with RLS, less config |

---

> **Next step:** Initialize the Next.js project, configure Supabase + Drizzle, set up Cloudflare DNS, and build the auth flow.
