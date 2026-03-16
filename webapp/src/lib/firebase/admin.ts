import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Admin initialization for server-side code (Next.js API routes)
// This requires the FIREBASE_SERVICE_ACCOUNT_KEY env var
// Format: FIREBASE_SERVICE_ACCOUNT_KEY={"type": "service_account", "project_id": "...", ...}
export function getAdminApp() {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const serviceAccountEnv = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (!serviceAccountEnv) {
    console.warn("FIREBASE_SERVICE_ACCOUNT_KEY is missing. Admin SDK cannot initialize.");
    return null;
  }

  try {
    const serviceAccount = JSON.parse(serviceAccountEnv);
    return initializeApp({
      credential: cert(serviceAccount)
    });
  } catch (error) {
    console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY JSON:", error);
    return null;
  }
}

export function getAdminDb() {
  const app = getAdminApp();
  if (!app) return null;
  return getFirestore(app);
}
