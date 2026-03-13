import { Express } from 'express';
import { db } from './db.js';
import { google } from 'googleapis';
import { driveConfig, ollamaConfig, lmStudioConfig } from './config.js';

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

const resolveFolderId = (id?: string) => {
  let folderId = id || process.env.GDRIVE_FOLDER_ID || 'root';
  if (folderId) folderId = folderId.replace(/['"]/g, '').trim().split('?')[0];
  if (!folderId || folderId === '.') return 'root';
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

// ─── Routes ───────────────────────────────────────────────────────────────────

export function setupRoutes(app: Express) {

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', message: 'Nexus Backend Online', timestamp: new Date().toISOString() });
  });

  // LLM inference (Ollama / LM Studio — no Gemini)
  app.post('/api/brain-link', async (req, res) => {
    try {
      const { prompt, context, systemPrompt } = req.body;
      const fullPrompt = context ? `${prompt}\n\nContext: ${context}` : prompt;
      const text = await callLocalLLM(fullPrompt, systemPrompt);
      res.json({ text });
    } catch (error: any) {
      console.error('[brain-link] Error:', error.message);
      res.status(500).json({ error: error.message || 'LLM unavailable' });
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
      const { name, parentId } = req.body;
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
      const { name, content, mimeType, parentId } = req.body;
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
      const { content } = req.body;
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

  app.get('/api/agents', (_req, res) => {
    try { res.json(db.prepare('SELECT * FROM agents').all()); }
    catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.post('/api/agents', (req, res) => {
    try {
      const { id, name, role, description, status, system_prompt } = req.body;
      db.prepare('INSERT INTO agents (id, name, role, description, status, system_prompt) VALUES (?, ?, ?, ?, ?, ?)')
        .run(id, name, role, description, status, system_prompt);
      res.json(db.prepare('SELECT * FROM agents WHERE id = ?').get(id));
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.put('/api/agents/:id', (req, res) => {
    try {
      const { name, role, description, status, system_prompt } = req.body;
      db.prepare('UPDATE agents SET name = ?, role = ?, description = ?, status = ?, system_prompt = ? WHERE id = ?')
        .run(name, role, description, status, system_prompt, req.params.id);
      res.json(db.prepare('SELECT * FROM agents WHERE id = ?').get(req.params.id));
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.delete('/api/agents/:id', (req, res) => {
    try {
      db.prepare('DELETE FROM agents WHERE id = ?').run(req.params.id);
      res.json({ success: true });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // ─── Chat ─────────────────────────────────────────────────────────────────

  app.get('/api/chat', (_req, res) => {
    try { res.json(db.prepare('SELECT * FROM chat_history ORDER BY timestamp ASC').all()); }
    catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.post('/api/chat', (req, res) => {
    try {
      const { role, content } = req.body;
      const result = db.prepare('INSERT INTO chat_history (role, content) VALUES (?, ?)').run(role, content);
      res.json({ id: result.lastInsertRowid, role, content });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.delete('/api/chat', (_req, res) => {
    try {
      db.prepare('DELETE FROM chat_history').run();
      res.json({ success: true });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // ─── News ─────────────────────────────────────────────────────────────────

  app.get('/api/news', (req, res) => {
    try {
      const { feed, search } = req.query as Record<string, string>;
      let query = 'SELECT * FROM news_items';
      const params: any[] = [];
      const conditions: string[] = [];
      if (feed) { conditions.push('feed = ?'); params.push(feed); }
      if (search) { conditions.push('(title LIKE ? OR summary LIKE ?)'); params.push(`%${search}%`, `%${search}%`); }
      if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
      query += ' ORDER BY id DESC';
      res.json(db.prepare(query).all(...params));
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.post('/api/news', (req, res) => {
    try {
      const { id, title, source, type, url, summary, bias, time, impact, feed } = req.body;
      db.prepare('INSERT INTO news_items (id, title, source, type, url, summary, bias, time, impact, feed) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
        .run(id, title, source, type, url, summary, bias, time, impact, feed || 'nexus');
      res.json(db.prepare('SELECT * FROM news_items WHERE id = ?').get(id));
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.delete('/api/news/:id', (req, res) => {
    try {
      db.prepare('DELETE FROM news_items WHERE id = ?').run(req.params.id);
      res.json({ success: true });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // ─── Pipeline ─────────────────────────────────────────────────────────────

  app.get('/api/pipeline', (_req, res) => {
    try {
      const tracks = db.prepare('SELECT * FROM pipeline_tracks').all() as any[];
      res.json(tracks.map(t => ({ ...t, steps: JSON.parse(t.steps) })));
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.post('/api/pipeline', (req, res) => {
    try {
      const { id, artist, title, status, progress, steps, target_date } = req.body;
      db.prepare('INSERT INTO pipeline_tracks (id, artist, title, status, progress, steps, target_date) VALUES (?, ?, ?, ?, ?, ?, ?)')
        .run(id, artist, title, status, progress, JSON.stringify(steps), target_date);
      const track = db.prepare('SELECT * FROM pipeline_tracks WHERE id = ?').get(id) as any;
      res.json({ ...track, steps: JSON.parse(track.steps) });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.put('/api/pipeline/:id', (req, res) => {
    try {
      const { artist, title, status, progress, steps, target_date } = req.body;
      db.prepare('UPDATE pipeline_tracks SET artist = ?, title = ?, status = ?, progress = ?, steps = ?, target_date = ? WHERE id = ?')
        .run(artist, title, status, progress, JSON.stringify(steps), target_date, req.params.id);
      const track = db.prepare('SELECT * FROM pipeline_tracks WHERE id = ?').get(req.params.id) as any;
      res.json({ ...track, steps: JSON.parse(track.steps) });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.delete('/api/pipeline/:id', (req, res) => {
    try {
      db.prepare('DELETE FROM pipeline_tracks WHERE id = ?').run(req.params.id);
      res.json({ success: true });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.post('/api/pipeline/sync', async (_req, res) => {
    try {
      const spreadsheetId = process.env.GSHEETS_PIPELINE_TRACKER_ID;
      if (!spreadsheetId) {
        return res.status(400).json({ error: 'GSHEETS_PIPELINE_TRACKER_ID not configured in .env' });
      }

      const auth = getGoogleAuth([
         'https://www.googleapis.com/auth/spreadsheets',
         'https://www.googleapis.com/auth/drive.readonly',
         'https://www.googleapis.com/auth/drive.file'
      ]);
      const sheets = google.sheets({ version: 'v4', auth });
      const range = 'Sheet1!A:G';

      // 1. Get current local tracks
      const localTracks = db.prepare('SELECT * FROM pipeline_tracks').all() as any[];

      // 2. Fetch remote Google Sheet
      const response = await sheets.spreadsheets.values.get({ spreadsheetId, range }).catch(() => null);
      const rows = response?.data?.values || [];

      // 3. Bidirectional logic (Sheet wins conflicts for simplicity)
      if (rows.length > 1) {
         const sheetData = rows.slice(1); // skip headers
         const updateTrack = db.prepare('INSERT OR REPLACE INTO pipeline_tracks (id, artist, title, status, progress, target_date, steps) VALUES (?, ?, ?, ?, ?, ?, ?)');
         db.transaction(() => {
           for (const row of sheetData) {
             const [id, artist, title, status, progress, target_date, steps] = row;
             if (id) {
               updateTrack.run(id, artist || '', title || '', status || 'planning', parseInt(progress) || 0, target_date || '', steps || '[]');
             }
           }
         })();
      }

      // 4. Overwrite Sheet with merged local DB (ensures new local tracks propagate up)
      const refreshedLocal = db.prepare('SELECT * FROM pipeline_tracks').all() as any[];
      const values = [
         ['ID', 'Artist', 'Title', 'Status', 'Progress', 'Target Date', 'Steps'],
         ...refreshedLocal.map(t => [t.id, t.artist, t.title, t.status, t.progress, t.target_date, t.steps])
      ];

      await sheets.spreadsheets.values.clear({ spreadsheetId, range });
      await sheets.spreadsheets.values.update({
         spreadsheetId, range: 'Sheet1!A1', valueInputOption: 'USER_ENTERED', requestBody: { values }
      });

      res.json({ success: true, tracks: refreshedLocal.map(t => ({ ...t, steps: JSON.parse(t.steps) })) });
    } catch (e: any) { 
      res.status(500).json({ error: e.message }); 
    }
  });

  // ─── Songs (Music Studio) ─────────────────────────────────────────────────

  app.get('/api/songs', (_req, res) => {
    try { res.json(db.prepare('SELECT * FROM songs ORDER BY created_at DESC').all()); }
    catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.post('/api/songs', (req, res) => {
    try {
      const { id, title, artist, genre, mood, lyrics, suno_prompt, status } = req.body;
      db.prepare('INSERT INTO songs (id, title, artist, genre, mood, lyrics, suno_prompt, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
        .run(id, title, artist, genre, mood, lyrics, suno_prompt, status || 'draft');
      res.json(db.prepare('SELECT * FROM songs WHERE id = ?').get(id));
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.put('/api/songs/:id', (req, res) => {
    try {
      const { title, artist, genre, mood, lyrics, suno_prompt, status } = req.body;
      db.prepare('UPDATE songs SET title = ?, artist = ?, genre = ?, mood = ?, lyrics = ?, suno_prompt = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        .run(title, artist, genre, mood, lyrics, suno_prompt, status, req.params.id);
      res.json(db.prepare('SELECT * FROM songs WHERE id = ?').get(req.params.id));
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.delete('/api/songs/:id', (req, res) => {
    try {
      db.prepare('DELETE FROM songs WHERE id = ?').run(req.params.id);
      res.json({ success: true });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // ─── Tasks ────────────────────────────────────────────────────────────────

  app.get('/api/tasks', (_req, res) => {
    try { res.json(db.prepare('SELECT * FROM tasks ORDER BY completed ASC, id DESC').all()); }
    catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.post('/api/tasks', (req, res) => {
    try {
      const { id, title, completed, category } = req.body;
      db.prepare('INSERT INTO tasks (id, title, completed, category) VALUES (?, ?, ?, ?)').run(id, title, completed ? 1 : 0, category);
      res.json(db.prepare('SELECT * FROM tasks WHERE id = ?').get(id));
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.put('/api/tasks/:id', (req, res) => {
    try {
      const { title, completed, category } = req.body;
      db.prepare('UPDATE tasks SET title = COALESCE(?, title), completed = COALESCE(?, completed), category = COALESCE(?, category) WHERE id = ?')
        .run(title ?? null, completed !== undefined ? (completed ? 1 : 0) : null, category ?? null, req.params.id);
      res.json(db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id));
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.delete('/api/tasks/:id', (req, res) => {
    try {
      db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);
      res.json({ success: true });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

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

  // ─── Portfolio ────────────────────────────────────────────────────────────

  app.get('/api/portfolio/accounts', (_req, res) => {
    try {
      const accounts = db.prepare('SELECT * FROM portfolio_accounts').all() as any[];
      const allPositions = db.prepare('SELECT * FROM portfolio_positions').all() as any[];
      res.json(accounts.map(acc => ({ ...acc, positions: allPositions.filter(p => p.account_id === acc.id) })));
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.get('/api/portfolio/summary', (_req, res) => {
    try {
      const accounts = db.prepare('SELECT * FROM portfolio_accounts').all() as any[];
      const positions = db.prepare('SELECT * FROM portfolio_positions').all() as any[];
      const totalAum = accounts.reduce((s, a) => s + a.balance, 0);
      const totalPnl = accounts.reduce((s, a) => s + a.pnl, 0);
      const totalCash = accounts.reduce((s, a) => s + (a.balance * (a.cash_percent / 100)), 0);
      res.json({
        totalAum, totalPnl,
        pnlPercent: totalAum > 0 ? (totalPnl / (totalAum - totalPnl)) * 100 : 0,
        totalCash,
        cashPercent: totalAum > 0 ? (totalCash / totalAum) * 100 : 0,
        totalPositions: positions.length,
      });
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
