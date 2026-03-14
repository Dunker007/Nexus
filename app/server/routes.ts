import { Express } from 'express';
import { z } from 'genkit';
import { db } from './db.js';
import { google } from 'googleapis';
import { driveConfig, ollamaConfig, lmStudioConfig } from './config.js';
import { required } from './middleware/validate.js';
import { ai } from './genkit.js';
import { agentsRouter } from './api/agents.js';
import { chatRouter } from './api/chat.js';
import { newsRouter } from './api/news.js';
import { songsRouter } from './api/songs.js';
import { tasksRouter } from './api/tasks.js';
import { portfolioRouter } from './api/portfolio.js';
import { pipelineRouter } from './api/pipeline.js';
import { authRouter } from './auth.js';
// ─── Google Auth Helper ───────────────────────────────────────────────────────

const getGoogleAuth = (scopes: string[]) => {
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

const DRIVE_ID_RE = /^[a-zA-Z0-9_\-]{10,}$/;
const resolveFolderId = (id?: string) => {
  let folderId = id || process.env.GDRIVE_FOLDER_ID || 'root';
  if (folderId) folderId = folderId.replace(/['"]/g, '').trim().split('?')[0];
  if (!folderId || folderId === '.') return 'root';
  if (folderId !== 'root' && !DRIVE_ID_RE.test(folderId)) return 'root';
  return folderId;
};

const resolveOpsFileId = () => {
  let fileId = process.env.GDRIVE_OPS_FILE_ID;
  if (!fileId) return undefined;
  fileId = fileId.trim();
  if (['auto', 'none', 'null', 'false', 'create', ''].includes(fileId.toLowerCase())) return undefined;
  if (fileId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) return undefined;
  return fileId;
};

// ─── Utility ──────────────────────────────────────────────────────────────────

async function fetchWithTimeout(url: string, options: RequestInit, timeout = 15000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (error: any) {
    clearTimeout(id);
    if (error.name === 'AbortError') throw new Error(`Request timed out after ${timeout}ms`);
    throw error;
  }
}

// ─── Local LLM Helper (Ollama → LM Studio fallback) ──────────────────────────

async function callLocalLLM(prompt: string, systemPrompt?: string): Promise<string> {
  // Try Ollama first
  try {
    const res = await fetchWithTimeout(`${ollamaConfig.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: ollamaConfig.defaultModel,
        prompt: systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt,
        stream: false,
      }),
    }, 30000); // 30s for actual generation
    
    if (res.ok) {
      const data = await res.json() as any;
      if (data.response) return data.response;
    }
  } catch (err: any) {
    console.log(`[LLM] Ollama preferred route failed: ${err.message}. Trying LM Studio...`);
  }

  // Fallback to LM Studio (OpenAI-compatible)
  try {
    const res = await fetchWithTimeout(`${lmStudioConfig.baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: lmStudioConfig.defaultModel,
        messages: [
          ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
          { role: 'user', content: prompt },
        ],
        stream: false,
      }),
    }, 30000);

    if (!res.ok) throw new Error(`LM Studio error: ${res.status}`);
    const data = await res.json() as any;
    if (data.choices?.[0]?.message?.content) {
      return data.choices[0].message.content;
    }
    throw new Error('Invalid response format from LM Studio');
  } catch (err: any) {
    console.error(`[LLM] Fallback failed: ${err.message}`);
    throw new Error('AI Inference Engine unreachable. Ensure Ollama or LM Studio is running.');
  }
}

// ─── Genkit Flows (Phase 7: Tracing) ─────────────────────────────────────────

export const llmInferenceFlow = ai.defineFlow(
  {
    name: 'llmInference',
    inputSchema: z.object({
      prompt: z.string(),
      systemPrompt: z.string().optional()
    }),
    outputSchema: z.string()
  },
  async (input) => {
    return await callLocalLLM(input.prompt, input.systemPrompt);
  }
);

// ─── Routes ───────────────────────────────────────────────────────────────────

export function setupRoutes(app: Express) {

  // Health check — includes DB ping and LLM reachability
  app.get('/api/health', async (_req, res) => {
    const checks: Record<string, string> = {};

    // DB ping
    try {
      db.prepare('SELECT 1').get();
      checks.db = 'ok';
    } catch (e: any) {
      checks.db = `error: ${e.message}`;
    }

    // Ollama ping
    try {
      const r = await fetch(`${ollamaConfig.baseUrl}/api/tags`, { signal: AbortSignal.timeout(2000) });
      checks.ollama = r.ok ? 'ok' : `http ${r.status}`;
    } catch {
      checks.ollama = 'unreachable';
    }

    const allOk = Object.values(checks).every(v => v === 'ok');
    res.status(allOk ? 200 : 207).json({
      status: allOk ? 'ok' : 'degraded',
      checks,
      timestamp: new Date().toISOString()
    });
  });

  // ─── AI Inference ────────────────────────────────────────────────────────


  // LLM inference (Ollama / LM Studio — no Gemini)
  app.post('/api/brain-link', async (req, res) => {
    try {
      const schema = z.object({
        prompt: z.string().min(1, 'Prompt is required'),
        context: z.string().optional(),
        systemPrompt: z.string().optional()
      });
      const { prompt, context, systemPrompt } = schema.parse(req.body);
      const fullPrompt = context ? `${prompt}\n\nContext: ${context}` : prompt;
      
      // Execute through Genkit flow instead of raw function to generate tracing data
      const text = await llmInferenceFlow({ prompt: fullPrompt, systemPrompt });
      
      res.json({ text });
    } catch (error: any) {
      console.error('[brain-link] Error:', error.message);
      res.status(500).json({ error: error.message || 'LLM unavailable' });
    }
  });

  // ─── Debate Pundits — Gemini Free Tier ───────────────────────────────────
  app.post('/api/debate', async (req, res) => {
    const apiKey = process.env.GEMINI_FREE_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({ error: 'No Gemini key found — set GEMINI_FREE_KEY in .env' });
    }
    try {
      const { prompt, systemPrompt } = z.object({
        prompt: z.string().min(1),
        systemPrompt: z.string().optional(),
      }).parse(req.body);

      const body = {
        system_instruction: systemPrompt ? { parts: [{ text: systemPrompt }] } : undefined,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 300 },
      };

      const r = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
      );
      const data: any = await r.json();
      if (!r.ok) throw new Error(data?.error?.message || 'Gemini API error');
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response.';
      res.json({ text });
    } catch (e: any) {
      console.error('[debate] Error:', e.message);
      res.status(500).json({ error: e.message });
    }
  });

  // LLM status check
  app.get('/api/llm/status', async (_req, res) => {
    const status = { ollama: false, lmStudio: false, activeModel: null as string | null };
    try {
      const r = await fetchWithTimeout(`${ollamaConfig.baseUrl}/api/tags`, {}, 2000);
      if (r.ok) { status.ollama = true; status.activeModel = ollamaConfig.defaultModel; }
    } catch {}
    try {
      const r = await fetchWithTimeout(`${lmStudioConfig.baseUrl}/v1/models`, {}, 2000);
      if (r.ok) { status.lmStudio = true; if (!status.activeModel) status.activeModel = lmStudioConfig.defaultModel; }
    } catch {}
    res.json(status);
  });

  // ─── Drive Anchor ──────────────────────────────────────────────────────────

  app.get('/api/drive-anchor', async (_req, res) => {
    try {
      const auth = getGoogleAuth(driveConfig.scopes);
      const drive = google.drive({ version: 'v3', auth });
      const response = await drive.files.list({
        q: `name = '${driveConfig.brainFolderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
        fields: 'files(id, name)',
      });
      let files = response.data.files || [];
      if (files.length === 0) {
        const folder = await drive.files.create({
          requestBody: { name: driveConfig.brainFolderName, mimeType: 'application/vnd.google-apps.folder' },
          fields: 'id, name',
        });
        if (folder.data) files = [folder.data];
      }
      res.json(files);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ─── Drive Files ──────────────────────────────────────────────────────────

  app.get('/api/drive/files', async (req, res) => {
    try {
      const folderId = resolveFolderId(req.query.folderId as string);
      const auth = getGoogleAuth(driveConfig.scopes);
      const drive = google.drive({ version: 'v3', auth });
      const response = await drive.files.list({
        q: `'${folderId}' in parents and trashed = false`,
        fields: 'files(id, name, mimeType, webViewLink, iconLink, modifiedTime)',
        orderBy: 'folder,name',
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
      });
      res.json({ files: response.data.files || [] });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/drive/folders', async (req, res) => {
    try {
      const schema = z.object({
        name: z.string().min(1, 'Name is required'),
        parentId: z.string().optional()
      });
      const { name, parentId } = schema.parse(req.body);
      const auth = getGoogleAuth(driveConfig.scopes);
      const drive = google.drive({ version: 'v3', auth });
      const folder = await drive.files.create({
        requestBody: {
          name,
          mimeType: 'application/vnd.google-apps.folder',
          parents: [resolveFolderId(parentId)],
        },
        fields: 'id, name',
        supportsAllDrives: true,
      });
      res.json(folder.data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/drive/files', async (req, res) => {
    try {
      const schema = z.object({
        name: z.string().min(1, 'Name is required'),
        content: z.string().optional(),
        mimeType: z.string().optional(),
        parentId: z.string().optional()
      });
      const { name, content, mimeType, parentId } = schema.parse(req.body);
      const auth = getGoogleAuth(driveConfig.scopes);
      const drive = google.drive({ version: 'v3', auth });
      const file = await drive.files.create({
        requestBody: { name, parents: [resolveFolderId(parentId)] },
        media: { mimeType: mimeType || 'text/plain', body: content },
        fields: 'id, name, webViewLink',
        supportsAllDrives: true,
      });
      res.json(file.data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ─── Shared Memory (CURRENT_OPS.md) ───────────────────────────────────────

  app.get('/api/memory/ops', async (_req, res) => {
    let fileId = resolveOpsFileId();
    let mimeType = '';
    try {
      const auth = getGoogleAuth(['https://www.googleapis.com/auth/drive.readonly']);
      const drive = google.drive({ version: 'v3', auth });
      if (!fileId) {
        const folderId = resolveFolderId();
        const search = await drive.files.list({
          q: `name = 'CURRENT_OPS.md' and '${folderId}' in parents and trashed = false`,
          fields: 'files(id, mimeType)', pageSize: 1,
          supportsAllDrives: true, includeItemsFromAllDrives: true,
        });
        const file = (search.data as any).files?.[0];
        fileId = file?.id; mimeType = file?.mimeType;
      } else {
        const file = await drive.files.get({ fileId, fields: 'mimeType', supportsAllDrives: true });
        mimeType = file.data.mimeType || '';
      }
      if (!fileId) {
        return res.json({ content: '# NEXUS DAILY OPS\n\nSTATUS: Offline\nMEMORY: Local Only\n\n(Create CURRENT_OPS.md in LuxRig_Brain to enable shared memory)' });
      }
      let content = '';
      if (mimeType?.startsWith('application/vnd.google-apps.')) {
        const exportRes = await drive.files.export({ fileId, mimeType: 'text/plain' });
        content = exportRes.data as string;
      } else {
        const response = await drive.files.get({ fileId, alt: 'media', supportsAllDrives: true });
        content = response.data as string;
      }
      res.json({ content });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/memory/ops', async (req, res) => {
    try {
      const schema = z.object({
        content: z.string()
      });
      const { content } = schema.parse(req.body);
      let fileId = resolveOpsFileId();
      const auth = getGoogleAuth(['https://www.googleapis.com/auth/drive.file']);
      const drive = google.drive({ version: 'v3', auth });
      if (!fileId) {
        const folderId = resolveFolderId();
        const search = await drive.files.list({
          q: `name = 'CURRENT_OPS.md' and '${folderId}' in parents and trashed = false`,
          fields: 'files(id)', pageSize: 1,
          supportsAllDrives: true, includeItemsFromAllDrives: true,
        });
        fileId = (search.data as any).files?.[0]?.id;
      }
      if (fileId) {
        await drive.files.update({ fileId, supportsAllDrives: true, media: { mimeType: 'text/plain', body: content } });
      } else {
        const folderId = resolveFolderId();
        const response = await drive.files.create({
          requestBody: { name: 'CURRENT_OPS.md', parents: [folderId] },
          media: { mimeType: 'text/plain', body: content },
          supportsAllDrives: true,
        });
        fileId = response.data.id!;
      }
      res.json({ success: true, id: fileId });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ─── Agents ───────────────────────────────────────────────────────────────

  app.use('/api/auth', authRouter);
  app.use('/api/agents', agentsRouter);
  app.use('/api/chat', chatRouter);
  app.use('/api/news', newsRouter);
  app.use('/api/songs', songsRouter);
  app.use('/api/tasks', tasksRouter);
  app.use('/api/portfolio', portfolioRouter);
  app.use('/api/smartfolio', portfolioRouter); // Alias for laboratory bridge
  app.use('/api/pipeline', pipelineRouter);

  // ─── Google Sheets (Pipeline Sync) ────────────────────────────────────────

  app.get('/api/gsheets/:id', async (req, res) => {
    try {
      const spreadsheetId = req.params.id;
      const range = (req.query.range as string) || 'A:Z';
      const auth = getGoogleAuth(['https://www.googleapis.com/auth/spreadsheets.readonly']);
      const sheets = google.sheets({ version: 'v4', auth });
      const response = await sheets.spreadsheets.values.get({ spreadsheetId, range });
      res.json(response.data.values || []);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // Env info (for debugging Drive setup)
  app.get('/api/env', (_req, res) => {
    res.json({
      folderId: process.env.GDRIVE_FOLDER_ID ? '✅ Set' : '❌ Missing',
      serviceAccount: process.env.GOOGLE_SERVICE_ACCOUNT_JSON ? '✅ Set' : '❌ Missing',
      oauth: process.env.GOOGLE_CLIENT_ID ? '✅ Set' : '❌ Missing',
      ollama: ollamaConfig.baseUrl,
      lmStudio: lmStudioConfig.baseUrl,
    });
  });
}
