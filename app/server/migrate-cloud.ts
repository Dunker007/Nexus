import { execSync } from 'child_process';
import { Connector } from '@google-cloud/cloud-sql-connector';
import pg from 'pg';

const isCloudRun = !!process.env.K_SERVICE;

/**
 * Executes Prisma DB Push during Cloud Run boot-up to auto-migrate the remote Postgres instance.
 * For production, consider using 'prisma migrate deploy' with tracked migrations.
 */
export async function autoMigrateCloud() {
  if (!isCloudRun) return;
  console.log('[DB] Running in Cloud deployment. Verifying remote Postgres schema...');
  
  try {
    const { CLOUD_SQL_CONNECTION_NAME, DB_USER, DB_PASS, DB_NAME } = process.env;
    if (!CLOUD_SQL_CONNECTION_NAME || !DB_USER || !DB_PASS || !DB_NAME) {
      console.warn('[DB] Missing Cloud SQL environment variables. Skipping auto-migration.');
      return;
    }

    // Set DATABASE_URL to use the Unix socket for the connection via the Cloud Run proxy
    // Standard Prisma connection pattern for Cloud SQL:
    process.env.DATABASE_URL = `postgresql://${DB_USER}:${DB_PASS}@localhost/${DB_NAME}?host=/cloudsql/${CLOUD_SQL_CONNECTION_NAME}`;
    process.env.DB_PROVIDER = 'postgresql';

    // Push the schema to ensuring the database matches prisma/schema.prisma (now our postgres schema)
    execSync('npx prisma db push', { stdio: 'inherit' });
    console.log('[DB] PostgreSQL schema successfully synced.');
  } catch (err: any) {
    console.error('[DB] Auto-migration failed:', err.message);
  }
}
