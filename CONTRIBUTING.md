# Contributing to BetaVersion.IO

Thank you for your interest in contributing! This guide will help you get started.

## Prerequisites

- [Node.js](https://nodejs.org/) v20+
- [pnpm](https://pnpm.io/) v10+
- [PostgreSQL](https://www.postgresql.org/) running locally or via Docker
- [Git](https://git-scm.com/)

## Getting Started

```bash
# Clone the repo
git clone https://github.com/betaversionio/betaversionio.git
cd betaversionio

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database URL, OAuth keys, etc.

# Generate Prisma client & push schema
pnpm db:generate
pnpm db:push

# Start development
pnpm dev        # all apps
pnpm dev:api    # API only (localhost:4000)
pnpm dev:web    # Web only (localhost:3000)
```

## Project Structure

```
betaversionio/
├── apps/
│   ├── api/          # NestJS backend
│   └── web/          # Next.js frontend
├── packages/
│   ├── database/     # Prisma schema & client
│   ├── shared/       # Shared types, schemas, constants
│   └── config/       # Shared TypeScript configs
└── .claude/
    └── skills/       # Claude Code slash commands
```

## Available Scripts

| Command            | Description                           |
| ------------------ | ------------------------------------- |
| `pnpm dev`         | Start all apps in dev mode            |
| `pnpm dev:api`     | Start API only                        |
| `pnpm dev:web`     | Start web only                        |
| `pnpm build`       | Build all packages                    |
| `pnpm typecheck`   | Run TypeScript checks across monorepo |
| `pnpm lint`        | Lint all packages                     |
| `pnpm format`      | Format all files with Prettier        |
| `pnpm db:generate` | Regenerate Prisma client              |
| `pnpm db:push`     | Push schema changes to database       |
| `pnpm db:migrate`  | Create & apply a migration            |
| `pnpm db:seed`     | Seed the database                     |
| `pnpm db:studio`   | Open Prisma Studio                    |

## Development Workflow

1. **Create a branch** from `main`:

   ```bash
   git checkout -b feature/your-feature
   ```

2. **Make your changes** — follow existing code patterns and conventions.

3. **Typecheck** before committing:

   ```bash
   pnpm typecheck
   ```

4. **Commit** using gitmoji convention (see below).

5. **Push & create a PR** against `main`.

## Commit Convention

We use **gitmoji** — a single emoji followed by a short lowercase description.

```
<emoji> <description>
```

| Emoji | When to use          |
| ----- | -------------------- |
| ✨    | New feature          |
| 🐛    | Bug fix              |
| ♻️    | Refactor             |
| 🔧    | Config / tooling     |
| 🎨    | Style / formatting   |
| 🔥    | Remove code or files |
| 📝    | Documentation        |
| ✅    | Tests                |
| 🚀    | Performance / deploy |
| 📦    | Dependencies         |
| 🏗️    | Architecture changes |
| 🔒    | Security fix         |
| 💄    | UI / cosmetic        |
| 🚚    | Move / rename files  |
| 🗃️    | Database changes     |
| 🎉    | Initial commit       |

**Examples:**

```
✨ add user profile page
🐛 fix refresh token cookie duplication
♻️ extract auth middleware into shared module
📦 upgrade prisma to v7
```

**Rules:**

- Use the actual unicode emoji, not `:shortcode:`
- Keep subject under 72 characters
- Lowercase after the emoji
- No period at the end
- No `Co-Authored-By` lines

## Adding a New API Module

When adding a new feature to the API:

1. Create the Prisma model in `packages/database/prisma/schema/`
2. Run `pnpm db:generate` to update the client
3. Create the module in `apps/api/src/modules/<name>/` with:
   - `<name>.module.ts`
   - `<name>.controller.ts`
   - `<name>.service.ts`
   - `index.ts` (barrel export)
4. Register the module in `apps/api/src/app.module.ts`
5. Add shared types/schemas in `packages/shared/src/`

Follow existing modules (e.g. `user`, `auth`) for patterns.

## Adding Shared Types

Shared validation schemas and inferred types live in `packages/shared/`:

- Schemas: `src/schemas/<domain>.ts` (zod)
- Types: `src/types/inferred.ts` (auto-inferred from schemas)

Both the API and web app import from `@betaversionio/shared`.

## Database Changes

1. Edit the schema files in `packages/database/prisma/schema/`
2. Run `pnpm db:generate` to regenerate the client
3. Run `pnpm db:push` (dev) or `pnpm db:migrate` (production) to apply changes
4. Rebuild the package if the API doesn't pick up new types:
   ```bash
   pnpm --filter @betaversionio/database build
   ```

## Need Help?

- Check existing [issues](https://github.com/betaversionio/betaversionio/issues) before creating a new one
- Use the appropriate issue template
- Be clear and provide context

Thank you for contributing!
