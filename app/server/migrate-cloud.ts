import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);
const isCloudRun = !!process.env.K_SERVICE;

/**
 * Runs `prisma migrate deploy` on Cloud Run boot to apply any pending tracked migrations.
 *
 * IMPORTANT: Do NOT use `prisma db push` in production — it can drop and recreate tables
 * when it detects schema drift it cannot resolve non-destructively. Always use
 * `prisma migrate deploy` with a tracked migrations history instead.
 *
 * To create a new migration locally: `npx prisma migrate dev --name <description>`
 * This generates a SQL file in prisma/migrations/ that is safe to deploy.
 */
export async function autoMigrateCloud() {
  if (!isCloudRun) return;
  console.log('[DB] Running in Cloud deployment. Applying pending Prisma migrations...');

  try {
    const { CLOUD_SQL_CONNECTION_NAME, DB_USER, DB_PASS, DB_NAME } = process.env;
    if (!CLOUD_SQL_CONNECTION_NAME || !DB_USER || !DB_PASS || !DB_NAME) {
      console.warn('[DB] Missing Cloud SQL environment variables. Skipping auto-migration.');
      return;
    }

    process.env.DATABASE_URL = `postgresql://${DB_USER}:${DB_PASS}@localhost/${DB_NAME}?host=/cloudsql/${CLOUD_SQL_CONNECTION_NAME}`;
    process.env.DB_PROVIDER = 'postgresql';

    await execFileAsync('npx', ['prisma', 'migrate', 'deploy'], { stdio: 'inherit' } as any);
    console.log('[DB] PostgreSQL migrations successfully applied.');
  } catch (err: any) {
    console.error('[DB] Auto-migration failed:', err.message);
  }
}
