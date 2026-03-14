import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import { Storage } from '@google-cloud/storage';

const isCloudRun = !!process.env.K_SERVICE;

// ─── IAP Verification ────────────────────────────────────────────────────────
export const requireIAP = (req: any, res: any, next: any) => {
  // If we are not running in Cloud Run, skip IAP verification
  if (!isCloudRun) return next();

  const assertion = req.headers['x-goog-iap-jwt-assertion'];
  if (!assertion) {
    return res.status(401).json({ error: 'Unauthorized: Missing IAP JWT assertion' });
  }
  
  // Basic existence check. 
  // TODO: Verify the JWT signature using google-auth-library for strict production security.
  next();
};

// ─── Secret Manager ──────────────────────────────────────────────────────────
export async function loadSecrets() {
  if (!isCloudRun) return;
  console.log('[GCP] Loading secrets from Secret Manager...');
  try {
    const client = new SecretManagerServiceClient();
    const projectId = process.env.GOOGLE_CLOUD_PROJECT || await client.getProjectId();
    
    // List of secrets necessary to run Nexus without .env
    const secretsToLoad = [
      'GOOGLE_CLIENT_ID',
      'GOOGLE_CLIENT_SECRET',
      'GOOGLE_REFRESH_TOKEN',
      'GOOGLE_SERVICE_ACCOUNT_JSON'
    ];

    for (const secretName of secretsToLoad) {
      if (!process.env[secretName]) { // Only fetch if not already in env
        try {
          const name = `projects/${projectId}/secrets/${secretName}/versions/latest`;
          const [version] = await client.accessSecretVersion({ name });
          if (version.payload?.data) {
            process.env[secretName] = version.payload.data.toString();
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

// ─── Google Cloud Storage ────────────────────────────────────────────────────
export const gcs = new Storage();
export const GCS_BUCKET_NAME = process.env.GCS_BUCKET_NAME || 'nexus-media-assets';

export async function uploadToGCS(fileName: string, mimeType: string, buffer: Buffer) {
  const bucket = gcs.bucket(GCS_BUCKET_NAME);
  const file = bucket.file(fileName);
  await file.save(buffer, {
    metadata: { contentType: mimeType },
    resumable: false
  });
  return `https://storage.googleapis.com/${GCS_BUCKET_NAME}/${fileName}`;
}
