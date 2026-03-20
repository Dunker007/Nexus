import { Router } from 'express';
import { getPrisma } from '../db.js';
import { getIO } from '../socket.js';
import { requireAuth } from '../middleware/requireAuth.js';
const router = Router();
// Get all pipeline tracks
router.get('/', requireAuth, async (_req, res) => {
    try {
        const tracks = await getPrisma().pipeline_tracks.findMany({
            orderBy: { created_at: 'desc' }
        });
        res.json(tracks);
    }
    catch (error) {
        console.error('Pipeline fetch error:', error);
        res.json([]); // Return empty array instead of error
    }
});
// Get single track
router.get('/:id', requireAuth, async (req, res) => {
    try {
        const track = await getPrisma().pipeline_tracks.findUnique({ where: { id: req.params.id } });
        if (!track) {
            return res.status(404).json({ error: 'Track not found' });
        }
        res.json(track);
    }
    catch (error) {
        console.error('Pipeline track fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch track' });
    }
});
// Create track
router.post('/', requireAuth, async (req, res) => {
    try {
        const { id, title, artist, genre, bpm, key, status, progress, notes } = req.body;
        const track = await getPrisma().pipeline_tracks.create({
            data: {
                id, title, artist, genre, bpm: bpm != null ? Number(bpm) : null, key, status, progress: progress != null ? Number(progress) : 0, notes
            }
        });
        try {
            getIO().emit('pipeline_update', { type: 'create', track });
        }
        catch (e) { }
        res.json(track);
    }
    catch (error) {
        console.error('Pipeline create error:', error);
        res.status(500).json({ error: 'Failed to create track' });
    }
});
// Update track
router.put('/:id', requireAuth, async (req, res) => {
    try {
        const { title, artist, genre, bpm, key, status, progress, notes } = req.body;
        const track = await getPrisma().pipeline_tracks.update({
            where: { id: req.params.id },
            data: {
                title, artist, genre, bpm: bpm != null ? Number(bpm) : null, key, status, progress: progress != null ? Number(progress) : 0, notes
            }
        });
        try {
            getIO().emit('pipeline_update', { type: 'update', track });
        }
        catch (e) { }
        res.json(track);
    }
    catch (error) {
        console.error('Pipeline update error:', error);
        res.status(500).json({ error: 'Failed to update track' });
    }
});
// Delete track
router.delete('/:id', requireAuth, async (req, res) => {
    try {
        await getPrisma().pipeline_tracks.delete({ where: { id: req.params.id } });
        try {
            getIO().emit('pipeline_update', { type: 'delete', id: req.params.id });
        }
        catch (e) { }
        res.json({ success: true });
    }
    catch (error) {
        console.error('Pipeline delete error:', error);
        res.status(500).json({ error: 'Failed to delete track' });
    }
});
// Sync from Google Drive
router.post('/sync', requireAuth, async (req, res) => {
    try {
        // TODO: Implement Google Drive sync
        res.json({ success: true, message: 'Sync not yet implemented' });
    }
    catch (error) {
        console.error('Pipeline sync error:', error);
        res.status(500).json({ error: 'Failed to sync' });
    }
});
export { router as pipelineRouter };
