// ─── Environment variable validation ─────────────────────────────────────────
// Validates required env vars at startup. Server will exit with a clear message
// listing exactly which variables are missing rather than crashing mid-request.
const REQUIRED_ENV_VARS = [
    'JWT_SECRET',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'GEMINI_API_KEY',
];
const IS_PROD = process.env.NODE_ENV === 'production';
if (IS_PROD) {
    const missing = REQUIRED_ENV_VARS.filter(key => !process.env[key]);
    if (missing.length > 0) {
        console.error(`[config] FATAL: Missing required environment variables:\n  ${missing.join('\n  ')}`);
        process.exit(1);
    }
}
else {
    const missing = REQUIRED_ENV_VARS.filter(key => !process.env[key]);
    if (missing.length > 0) {
        console.warn(`[config] WARNING: Missing environment variables (non-fatal in dev):\n  ${missing.join('\n  ')}`);
    }
}
export const driveConfig = {
    brainFolderName: 'LuxRig_Brain',
    scopes: [
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/drive.readonly',
        'https://www.googleapis.com/auth/spreadsheets'
    ]
};
export const ollamaConfig = {
    baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
    defaultModel: process.env.OLLAMA_DEFAULT_MODEL || 'llama3.2',
};
export const lmStudioConfig = {
    baseUrl: process.env.LM_STUDIO_BASE_URL || 'http://localhost:1234',
    defaultModel: process.env.LM_STUDIO_DEFAULT_MODEL || 'local-model',
};
