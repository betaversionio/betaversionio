# BetaVersion.IO

A developer community platform for sharing projects, ideas, and resumes. Built as a monorepo with a NestJS API and Next.js frontend.

## Tech Stack

- **Frontend** — Next.js, React, Tailwind CSS, shadcn/ui, TanStack Query
- **Backend** — NestJS, Passport.js (JWT + OAuth), Prisma ORM
- **Database** — PostgreSQL
- **Shared** — Zod schemas, shared types & constants
- **Tooling** — Turborepo, pnpm, TypeScript, Prettier, ESLint

## Project Structure

```
betaversionio/
├── apps/
│   ├── api/              # NestJS backend (localhost:4000)
│   └── web/              # Next.js frontend (localhost:3000)
├── packages/
│   ├── database/         # Prisma schema & client
│   ├── shared/           # Shared types, schemas, constants
│   └── config/           # Shared TypeScript & ESLint configs
├── .claude/
│   └── skills/           # Claude Code slash commands
└── .github/
    └── CONTRIBUTING.md
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v20+
- [pnpm](https://pnpm.io/) v10+
- [PostgreSQL](https://www.postgresql.org/)

### Setup

```bash
# Clone
git clone https://github.com/betaversionio/betaversionio.git
cd betaversionio

# Install dependencies
pnpm install

# Configure environment
cp .env.example .env
# Edit .env with your database URL, OAuth keys, etc.

# Set up database
pnpm db:generate
pnpm db:push

# Start development
pnpm dev
```

### Scripts

| Command            | Description              |
| ------------------ | ------------------------ |
| `pnpm dev`         | Start all apps           |
| `pnpm dev:api`     | Start API only           |
| `pnpm dev:web`     | Start web only           |
| `pnpm build`       | Build all packages       |
| `pnpm typecheck`   | TypeScript checks        |
| `pnpm lint`        | Lint all packages        |
| `pnpm format`      | Format with Prettier     |
| `pnpm db:generate` | Regenerate Prisma client |
| `pnpm db:push`     | Push schema to database  |
| `pnpm db:migrate`  | Create & apply migration |
| `pnpm db:seed`     | Seed the database        |
| `pnpm db:studio`   | Open Prisma Studio       |

## Features

- **Authentication** — Email/password, GitHub OAuth, Google OAuth with JWT + httpOnly cookie refresh tokens
- **User Profiles** — Bio, social links, tech stack
- **Projects** — Showcase work with collaborators and media
- **Ideas** — Post project ideas, define roles, accept applications
- **Resumes** — Upload and manage developer resumes
- **Feed** — Community activity feed with posts, comments, and reactions

## Contributing

See [CONTRIBUTING.md](.github/CONTRIBUTING.md) for setup instructions, commit conventions, and development workflow.

## License

[MIT](LICENSE)
