import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: InstanceType<typeof PrismaClient> | undefined;
};

/**
 * Lazy singleton for standalone scripts (seeds, CLI tools).
 * NestJS apps should use their own PrismaService instead.
 */
export function getPrismaClient(): InstanceType<typeof PrismaClient> {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  const adapter = new PrismaPg({ connectionString });
  const client = new PrismaClient({ adapter });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
  }

  return client;
}

export { PrismaClient };
export { PrismaPg } from "@prisma/adapter-pg";
export * from "@prisma/client";
