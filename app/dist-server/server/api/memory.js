import { Router } from 'express';
import { z } from 'genkit';
import { google } from 'googleapis';
import { requireAuth } from '../middleware/requireAuth.js';
import { getGoogleAuth, resolveFolderId, resolveOpsFileId } from '../google.js';
export const memoryRouter = Router();
// ─── Shared Memory (CURRENT_OPS.md) ───────────────────────────────────────
memoryRouter.get('/ops', requireAuth, async (_req, res) => {
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
            const file = search.data.files?.[0];
            fileId = file?.id;
            mimeType = file?.mimeType;
        }
        else {
            const file = await drive.files.get({ fileId, fields: 'mimeType', supportsAllDrives: true });
            mimeType = file.data.mimeType || '';
        }
        if (!fileId) {
            return res.json({ content: '# NEXUS DAILY OPS\n\nSTATUS: Offline\nMEMORY: Local Only\n\n(Create CURRENT_OPS.md in LuxRig_Brain to enable shared memory)' });
        }
        let content = '';
        if (mimeType?.startsWith('application/vnd.google-apps.')) {
            const exportRes = await drive.files.export({ fileId, mimeType: 'text/plain' });
            content = exportRes.data;
        }
        else {
            const response = await drive.files.get({ fileId, alt: 'media', supportsAllDrives: true });
            content = response.data;
        }
        res.json({ content });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
memoryRouter.post('/ops', requireAuth, async (req, res) => {
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
            fileId = search.data.files?.[0]?.id;
        }
        if (fileId) {
            await drive.files.update({ fileId, supportsAllDrives: true, media: { mimeType: 'text/plain', body: content } });
        }
        else {
            const folderId = resolveFolderId();
            const response = await drive.files.create({
                requestBody: { name: 'CURRENT_OPS.md', parents: [folderId] },
                media: { mimeType: 'text/plain', body: content },
                supportsAllDrives: true,
            });
            fileId = response.data.id;
        }
        res.json({ success: true, id: fileId });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
