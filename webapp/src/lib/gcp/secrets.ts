import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

const isCloud = process.env.NODE_ENV === 'production' || !!process.env.K_SERVICE || !!process.env.FIREBASE_CONFIG;

/**
 * Loads secrets from Google Cloud Secret Manager and injects them into process.env
 * This allows the Next.js app to run without a .env file in production.
 */
export async function loadSecrets() {
  if (!isCloud) return;
  console.log('[GCP] Loading secrets from Secret Manager...');
  
  try {
    const client = new SecretManagerServiceClient();
    let projectId = process.env.GOOGLE_CLOUD_PROJECT;
    
    // If not set explicitly, try to get it from the client
    if (!projectId) {
      projectId = await client.getProjectId();
    }
    
    // The list of secrets we need to pull from Secret Manager
    const secretsToLoad = [
      'GOOGLE_CLIENT_ID',
      'GOOGLE_CLIENT_SECRET',
      'NEXTAUTH_SECRET',
      'GOOGLE_GEMINI_API_KEY',
      'FIREBASE_SERVICE_ACCOUNT_KEY'
    ];

    for (const secretName of secretsToLoad) {
      if (!process.env[secretName]) { // Only fetch if not already in env
        try {
          const name = `projects/${projectId}/secrets/${secretName}/versions/latest`;
          const [version] = await client.accessSecretVersion({ name });
          if (version.payload?.data) {
            process.env[secretName] = Buffer.from(version.payload.data).toString('utf-8');
            console.log(`[GCP] Successfully loaded secret: ${secretName}`);
          }
        } catch (e: any) {
          console.warn(`[GCP] Could not load secret ${secretName}:`, e.message);
        }
      }
    }
  } catch (error: any) {
    console.error('[GCP] Failed to init Secret Manager:', error.message);
  }
}
