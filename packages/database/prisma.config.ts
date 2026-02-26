import { config } from 'dotenv';
import path from 'node:path';
import { defineConfig } from 'prisma/config';

// Load .env from the monorepo root
config({ path: path.resolve(__dirname, '..', '..', '.env') });

export default defineConfig({
  schema: path.join(__dirname, 'prisma', 'schema'),
  migrations: {
    path: path.join(__dirname, 'prisma', 'migrations'),
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url:
      process.env.DATABASE_URL ?? 'postgresql://localhost:5432/betaversionio',
  },
});
