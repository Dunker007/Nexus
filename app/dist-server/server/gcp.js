import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import { Storage } from '@google-cloud/storage';
const isCloudRun = !!process.env.K_SERVICE;
// ─── Secret Manager ──────────────────────────────────────────────────────────
export async function loadSecrets() {
    if (!isCloudRun)
        return;
    console.log('[GCP] Loading secrets from Secret Manager...');
    try {
        const client = new SecretManagerServiceClient();
        const projectId = process.env.GOOGLE_CLOUD_PROJECT || await client.getProjectId();
        // List of secrets necessary to run Nexus without .env
        const secretsToLoad = [
            'GOOGLE_CLIENT_ID',
            'GOOGLE_CLIENT_SECRET',
            'GOOGLE_SERVICE_ACCOUNT_JSON',
            'DATABASE_URL',
            'GEMINI_FREE_KEY',
            'JWT_SECRET'
        ];
        for (const secretName of secretsToLoad) {
            if (!process.env[secretName]) { // Only fetch if not already in env
                try {
                    const name = `projects/${projectId}/secrets/${secretName}/versions/latest`;
                    const [version] = await client.accessSecretVersion({ name });
                    if (version.payload?.data) {
                        process.env[secretName] = Buffer.from(version.payload.data).toString('utf-8').trim();
                    }
                }
                catch (e) {
                    console.warn(`[GCP] Could not load secret ${secretName}:`, e.message);
                }
            }
        }
    }
    catch (error) {
        console.error('[GCP] Failed to init Secret Manager:', error.message);
    }
}
// ─── Google Cloud Storage ────────────────────────────────────────────────────
export const gcs = new Storage();
export const GCS_BUCKET_NAME = process.env.GCS_BUCKET_NAME || 'nexus-media-assets';
export async function uploadToGCS(fileName, mimeType, buffer) {
    const bucket = gcs.bucket(GCS_BUCKET_NAME);
    const file = bucket.file(fileName);
    await file.save(buffer, {
        metadata: { contentType: mimeType },
        resumable: false
    });
    return `https://storage.googleapis.com/${GCS_BUCKET_NAME}/${fileName}`;
}
