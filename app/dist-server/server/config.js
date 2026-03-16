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
