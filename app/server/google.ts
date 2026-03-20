import { google } from 'googleapis';
import { driveConfig } from './config.js';

// ─── Google Auth Helper ───────────────────────────────────────────────────────

export const getGoogleAuth = (scopes: string[]) => {
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_REFRESH_TOKEN) {
    const auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
    auth.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
    return auth;
  }

  const credentialsJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!credentialsJson) throw new Error('Missing Google Auth Credentials');
  try {
    const credentials = JSON.parse(credentialsJson);
    return new google.auth.GoogleAuth({ credentials, scopes });
  } catch {
    throw new Error('Invalid GOOGLE_SERVICE_ACCOUNT_JSON format');
  }
};

// ─── Drive Folder ID Helpers ─────────────────────────────────────────────────

const DRIVE_ID_RE = /^[a-zA-Z0-9_\-]{10,}$/;

export const resolveFolderId = (id?: string) => {
  let folderId = id || process.env.GDRIVE_FOLDER_ID || 'root';
  if (folderId) folderId = folderId.replace(/['"]/g, '').trim().split('?')[0];
  if (!folderId || folderId === '.') return 'root';
  if (folderId !== 'root' && !DRIVE_ID_RE.test(folderId)) return 'root';
  return folderId;
};

export const resolveOpsFileId = () => {
  let fileId = process.env.GDRIVE_OPS_FILE_ID;
  if (!fileId) return undefined;
  fileId = fileId.trim();
  if (['auto', 'none', 'null', 'false', 'create', ''].includes(fileId.toLowerCase())) return undefined;
  if (fileId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) return undefined;
  return fileId;
};
