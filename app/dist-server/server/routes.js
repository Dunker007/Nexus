import { z } from 'genkit';
import { GoogleGenAI } from '@google/genai';
import { ollamaConfig, lmStudioConfig } from './config.js';
import { getPrisma } from './db.js';
import { requireAuth } from './middleware/requireAuth.js';
import { ai } from './genkit.js';
import { callLocalLLM, fetchWithTimeout } from './llm.js';
import { getGoogleAuth, resolveFolderId } from './google.js';
import { appendMasterNotes } from './api/drive.js';
import { google } from 'googleapis';
import { getPiecesContext } from './pieces.js';
// Sub-routers
import { agentsRouter } from './api/agents.js';
import { chatRouter } from './api/chat.js';
import { newsRouter } from './api/news.js';
import { songsRouter } from './api/songs.js';
import { tasksRouter } from './api/tasks.js';
import { portfolioRouter } from './api/portfolio.js';
import { pipelineRouter } from './api/pipeline.js';
import { videoRouter } from './api/video.js';
import { driveRouter } from './api/drive.js';
import { memoryRouter } from './api/memory.js';
import { authRouter } from './auth.js';
// ─── Genkit Flows (Phase 7: Tracing) ─────────────────────────────────────────
export const llmInferenceFlow = ai.defineFlow({
    name: 'llmInference',
    inputSchema: z.object({
        prompt: z.string(),
        systemPrompt: z.string().optional()
    }),
    outputSchema: z.string()
}, async (input) => {
    return await callLocalLLM(input.prompt, input.systemPrompt);
});
// ─── Routes ───────────────────────────────────────────────────────────────────
export function setupRoutes(app) {
    // Health check — includes DB ping and LLM reachability
    app.get('/api/health', async (_req, res) => {
        const checks = {};
        // DB ping
        try {
            await getPrisma().$queryRaw `SELECT 1`;
            checks.db = 'ok';
        }
        catch (e) {
            checks.db = `error: ${e.message}`;
        }
        // Ollama ping
        try {
            const r = await fetch(`${ollamaConfig.baseUrl}/api/tags`, { signal: AbortSignal.timeout(2000) });
            checks.ollama = r.ok ? 'ok' : `http ${r.status}`;
        }
        catch {
            checks.ollama = 'unreachable';
        }
        const allOk = Object.values(checks).every(v => v === 'ok');
        res.status(allOk ? 200 : 207).json({
            status: allOk ? 'ok' : 'degraded',
            checks,
            timestamp: new Date().toISOString()
        });
    });
    // ─── AI Inference (Local LLM via Genkit) ──────────────────────────────────
    app.post('/api/brain-link', requireAuth, async (req, res) => {
        try {
            const schema = z.object({
                prompt: z.string().min(1, 'Prompt is required'),
                context: z.string().optional(),
                systemPrompt: z.string().optional(),
                usePiecesContext: z.boolean().optional()
            });
            const { prompt, context, systemPrompt, usePiecesContext } = schema.parse(req.body);
            let injectedPieces = '';
            if (usePiecesContext !== false) { // Default to true if undefined, or you can make it explicit
                const piecesContext = await getPiecesContext(prompt);
                injectedPieces = piecesContext && !piecesContext.includes('Unavailable') ? `\n\n[Pieces OS Internal Context]\n${piecesContext}\n[/Pieces]` : '';
            }
            const fullPrompt = context ? `${prompt}\n\nContext: ${context}${injectedPieces}` : `${prompt}${injectedPieces}`;
            // Execute through Genkit flow for tracing
            const text = await llmInferenceFlow({ prompt: fullPrompt, systemPrompt });
            res.json({ text });
        }
        catch (error) {
            console.error('[brain-link] Error:', error.message);
            res.status(500).json({ error: error.message || 'LLM unavailable' });
        }
    });
    // ─── Debate (Gemini 2.5 Flash + Google Search) ────────────────────────────
    app.post('/api/debate', requireAuth, async (req, res) => {
        try {
            const { messages, systemPrompt, agentName, usePiecesContext } = z.object({
                messages: z.array(z.object({
                    role: z.enum(['user', 'assistant']),
                    content: z.string()
                })).min(1),
                systemPrompt: z.string().optional(),
                agentName: z.string().optional(),
                usePiecesContext: z.boolean().optional()
            }).parse(req.body);
            const timeContext = `SYSTEM TIME OVERRIDE: The exact current date and time is ${new Date().toLocaleString('en-US', { timeZoneName: 'short' })}. You must use THIS date for all current events, forecasting, and references, NEVER a default cached date.\n\nCRITICAL INSTRUCTION: If you discover an important finding, idea, or decision that should be remembered, you MUST save it to the master notes file by wrapping it in <save_note>...</save_note>.\n\nCRITICAL INSTRUCTION 2: If the user asks you to write a lyric, a song, a document, or generate a final markdown asset, you MUST wrap the ENTIRE document content inside a <save_file name="Filename.md">...</save_file> tag. Choose an appropriate filename (like N_SongName_v1.md). This will automatically deploy the file to the artist's Google Drive pipeline!\n\nCRITICAL INSTRUCTION 3: If you use <think> tags to reason, you MUST immediately output your actual response directly below the closing </think> tag! Do NOT stop generating after your thoughts.\n\n`;
            let injectedPieces = '';
            if (usePiecesContext !== false) {
                const latestMessage = messages[messages.length - 1].content;
                const piecesContext = await getPiecesContext(latestMessage);
                injectedPieces = piecesContext && !piecesContext.includes('Unavailable') ? `\n\n[Pieces OS Internal Context for the current topic]\n${piecesContext}\n[/Pieces]\n\n` : '';
            }
            const finalSystemPrompt = systemPrompt ? timeContext + injectedPieces + systemPrompt : timeContext + injectedPieces;
            // Map to Gemini's format
            const geminiMessages = messages.map(m => ({
                role: m.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: m.content }]
            }));
            // Call Gemini 2.5 Flash with native Google Search
            const apiKey = process.env.GEMINI_FREE_KEY || process.env.GEMINI_API_KEY;
            if (!apiKey)
                throw new Error("GEMINI_FREE_KEY is missing from environment");
            const genAI = new GoogleGenAI({ apiKey });
            const response = await genAI.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: geminiMessages,
                config: {
                    systemInstruction: finalSystemPrompt,
                    tools: [{ googleSearch: {} }]
                }
            });
            const text = response.text || 'No response.';
            // Extract and save notes invisibly in background
            const noteMatch = text.match(/<save_note>([\s\S]*?)<\/save_note>/i);
            if (noteMatch) {
                const noteContent = noteMatch[1].trim();
                const fallbackAgentName = systemPrompt?.includes('You are Newsician') ? 'Newsician' : systemPrompt?.includes('You are QPL') ? 'QPL' : 'Lux';
                appendMasterNotes(agentName || fallbackAgentName, noteContent).catch(console.error);
            }
            // Check for document saves to Drive
            const fileMatch = text.match(/<save_file name="([^"]+)">([\s\S]*?)<\/save_file>/i);
            if (fileMatch) {
                const filename = fileMatch[1].trim();
                const fileContent = fileMatch[2].trim();
                try {
                    const auth = getGoogleAuth(['https://www.googleapis.com/auth/drive.file']);
                    const drive = google.drive({ version: 'v3', auth });
                    const parentId = resolveFolderId();
                    await drive.files.create({
                        requestBody: { name: filename, parents: [parentId], mimeType: 'text/markdown' },
                        media: { mimeType: 'text/markdown', body: fileContent },
                        supportsAllDrives: true
                    });
                    console.log(`[Drive] Saved generative file to Drive: ${filename}`);
                }
                catch (err) {
                    console.error('[Drive] Failed to save generative file:', err.message);
                }
            }
            res.json({ text });
        }
        catch (e) {
            console.error('[debate] Error:', e.message);
            res.status(500).json({ error: e.message });
        }
    });
    // ─── LLM Status ──────────────────────────────────────────────────────────
    app.get('/api/llm/status', async (_req, res) => {
        const status = { ollama: false, lmStudio: false, activeModel: null };
        try {
            const r = await fetchWithTimeout(`${ollamaConfig.baseUrl}/api/tags`, {}, 2000);
            if (r.ok) {
                status.ollama = true;
                status.activeModel = ollamaConfig.defaultModel;
            }
        }
        catch { }
        try {
            const r = await fetchWithTimeout(`${lmStudioConfig.baseUrl}/v1/models`, {}, 2000);
            if (r.ok) {
                status.lmStudio = true;
                if (!status.activeModel)
                    status.activeModel = lmStudioConfig.defaultModel;
            }
        }
        catch { }
        res.json(status);
    });
    // ─── Mount Sub-Routers ──────────────────────────────────────────────────
    app.use('/api/auth', authRouter);
    app.use('/api/agents', agentsRouter);
    app.use('/api/chat', chatRouter);
    app.use('/api/news', newsRouter);
    app.use('/api/songs', songsRouter);
    app.use('/api/tasks', tasksRouter);
    app.use('/api/portfolio', portfolioRouter);
    app.use('/api/smartfolio', portfolioRouter); // Alias for laboratory bridge
    app.use('/api/pipeline', pipelineRouter);
    app.use('/api/video', videoRouter);
    app.use('/api/drive', driveRouter);
    app.use('/api/memory', memoryRouter);
    // Backwards-compatible aliases for moved endpoints
    app.get('/api/drive-anchor', (req, res) => res.redirect(307, '/api/drive/anchor'));
    app.get('/api/gsheets/:id', (req, res) => res.redirect(307, `/api/drive/gsheets/${req.params.id}?${new URLSearchParams(req.query)}`));
}
