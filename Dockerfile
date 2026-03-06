# ============================================================
# Stage 1: Base — Node 22 Alpine with pnpm
# ============================================================
FROM node:22-alpine AS base

RUN apk add --no-cache openssl
RUN corepack enable && corepack prepare pnpm@10.29.3 --activate

WORKDIR /app

# ============================================================
# Stage 2: Dependencies — install all deps with lockfile
# ============================================================
FROM base AS deps

# bcrypt native compilation needs build tools
RUN apk add --no-cache python3 make g++

# Copy workspace config
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./

# Copy all package.json files to leverage Docker layer caching
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/database/package.json packages/database/package.json
COPY packages/shared/package.json packages/shared/package.json
COPY packages/config/typescript/package.json packages/config/typescript/package.json
COPY packages/config/eslint/package.json packages/config/eslint/package.json
COPY packages/config/prettier/package.json packages/config/prettier/package.json

RUN pnpm install --frozen-lockfile

# ============================================================
# Stage 3: Builder — copy source and build shared packages
# ============================================================
FROM base AS builder

COPY --from=deps /app /app
COPY . .

# Build pipeline: Prisma → database → shared
RUN pnpm db:generate
RUN pnpm --filter @betaversionio/database build
RUN pnpm --filter @betaversionio/shared build

# ============================================================
# Stage 3a: Build API
# ============================================================
FROM builder AS build-api

RUN pnpm --filter @betaversionio/api build
RUN pnpm --filter @betaversionio/api deploy --prod /app/api-deploy

# Copy Prisma generated client into deploy output
RUN cp -r /app/packages/database/prisma/generated /app/api-deploy/node_modules/@betaversionio/database/prisma/generated

# ============================================================
# Stage 3b: Build Web
# ============================================================
FROM builder AS build-web

RUN pnpm --filter @betaversionio/web build

# ============================================================
# Target: api — production API image
# ============================================================
FROM base AS api

ENV NODE_ENV=production

COPY --from=build-api /app/api-deploy /app

EXPOSE 4000

CMD ["node", "dist/main"]

# ============================================================
# Target: web — production Next.js standalone image
# ============================================================
FROM base AS web

ENV NODE_ENV=production

# Copy Next.js standalone output
COPY --from=build-web /app/apps/web/.next/standalone /app
COPY --from=build-web /app/apps/web/.next/static /app/apps/web/.next/static
COPY --from=build-web /app/apps/web/public /app/apps/web/public

EXPOSE 3000

CMD ["node", "apps/web/server.js"]
