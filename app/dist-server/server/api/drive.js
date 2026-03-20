import { Router } from 'express';
import { z } from 'genkit';
import { google } from 'googleapis';
import { driveConfig } from '../config.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { getGoogleAuth, resolveFolderId } from '../google.js';
export const driveRouter = Router();
// ─── Drive Anchor ──────────────────────────────────────────────────────────
driveRouter.get('/anchor', requireAuth, async (_req, res) => {
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
            if (folder.data)
                files = [folder.data];
        }
        res.json(files);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// ─── Drive Files ──────────────────────────────────────────────────────────
driveRouter.get('/files', requireAuth, async (req, res) => {
    try {
        const folderId = resolveFolderId(req.query.folderId);
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
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
driveRouter.post('/folders', requireAuth, async (req, res) => {
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
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
driveRouter.post('/files', requireAuth, async (req, res) => {
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
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// ─── Master Notes (Append to shared MASTER_NOTES.md) ─────────────────────
export async function appendMasterNotes(agentName, noteContent) {
    try {
        const auth = getGoogleAuth(['https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/drive.readonly']);
        const drive = google.drive({ version: 'v3', auth });
        const folderId = resolveFolderId();
        const search = await drive.files.list({
            q: `name = 'MASTER_NOTES.md' and '${folderId}' in parents and trashed = false`,
            fields: 'files(id)', pageSize: 1,
            supportsAllDrives: true, includeItemsFromAllDrives: true,
        });
        let fileId = search.data.files?.[0]?.id;
        let currentContent = '';
        if (fileId) {
            const exportRes = await drive.files.export({ fileId, mimeType: 'text/plain' }).catch(() => null);
            if (exportRes)
                currentContent = exportRes.data;
            else {
                const response = await drive.files.get({ fileId, alt: 'media', supportsAllDrives: true }).catch(() => null);
                if (response)
                    currentContent = response.data;
            }
        }
        const timestamp = new Date().toLocaleString('en-US', { timeZoneName: 'short' });
        const newEntry = `\n\n### [${timestamp}] Finding from ${agentName}\n${noteContent}\n`;
        const updatedContent = (currentContent + newEntry).trim() + '\n';
        if (fileId) {
            await drive.files.update({ fileId, supportsAllDrives: true, media: { mimeType: 'text/plain', body: updatedContent } });
        }
        else {
            await drive.files.create({
                requestBody: { name: 'MASTER_NOTES.md', parents: [folderId] },
                media: { mimeType: 'text/plain', body: `# NEXUS MASTER NOTES\n\nShared memory and findings from all DLX agents.${newEntry}` },
                supportsAllDrives: true,
            });
        }
        console.log(`[Master Notes] Appended note from ${agentName}`);
    }
    catch (error) {
        console.error(`[Master Notes] Failed to append note:`, error.message);
    }
}
// ─── Google Sheets (Pipeline Sync) ──────────────────────────────────────────
driveRouter.get('/gsheets/:id', requireAuth, async (req, res) => {
    try {
        const spreadsheetId = req.params.id;
        const range = req.query.range || 'A:Z';
        const auth = getGoogleAuth(['https://www.googleapis.com/auth/spreadsheets.readonly']);
        const sheets = google.sheets({ version: 'v4', auth });
        const response = await sheets.spreadsheets.values.get({ spreadsheetId: spreadsheetId, range: range });
        res.json(response.data.values || []);
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
