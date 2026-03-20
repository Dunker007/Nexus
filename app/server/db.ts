import { PrismaClient } from '@prisma/client';

// ─── Prisma ORM ──────────────────────────────────────────────────────────────
// All data access goes through Prisma. Schema is defined in prisma/schema.prisma.
// Dev: SQLite (file:../nexus.db)  |  Prod (Cloud Run): PostgreSQL via DATABASE_URL

// Lazy init — DATABASE_URL may not be set until migrate-cloud.ts runs
let _prisma: PrismaClient | null = null;
export const getPrisma = () => {
  if (!_prisma) _prisma = new PrismaClient();
  return _prisma;
};

// Back-compat alias for any existing imports of `prisma`
export const prisma = new Proxy({} as PrismaClient, {
  get: (_t, prop) => (getPrisma() as any)[prop],
});

console.log(`[DB] Prisma initialized (provider: ${process.env.DB_PROVIDER || 'sqlite'})`);

