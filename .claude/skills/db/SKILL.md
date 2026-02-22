---
name: db
description: Run database operations (generate, push, migrate, seed, studio)
disable-model-invocation: true
argument-hint: "<generate | push | migrate | seed | studio>"
allowed-tools:
  - Bash
  - Read
---

Run a database operation via the monorepo root scripts.

Command mapping:
- `generate` → `pnpm db:generate` — regenerate Prisma client after schema changes
- `push` → `pnpm db:push` — push schema to database without creating a migration
- `migrate` → `pnpm db:migrate` — create and apply a migration
- `seed` → `pnpm db:seed` — seed the database
- `studio` → `pnpm db:studio` — open Prisma Studio

Run the command matching `$ARGUMENTS`. If no argument is provided, show the available commands and ask which one to run.

After `generate`, remind the user to rebuild the database package (`pnpm --filter @devcom/database build`) if the API doesn't pick up the new types.
