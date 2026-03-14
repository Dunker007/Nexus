import { Router } from 'express';
import { db } from '../db.js';
import { getIO } from '../socket.js';

const router = Router();

// Get all pipeline tracks
router.get('/', (_req, res) => {
  try {
    const tracks = db.prepare(`
      SELECT * FROM pipeline_tracks ORDER BY created_at DESC
    `).all();
    res.json(tracks);
  } catch (error) {
    console.error('Pipeline fetch error:', error);
    res.json([]); // Return empty array instead of error
  }
});

// Get single track
router.get('/:id', (req, res) => {
  try {
    const track = db.prepare('SELECT * FROM pipeline_tracks WHERE id = ?').get(req.params.id);
    if (!track) {
      return res.status(404).json({ error: 'Track not found' });
    }
    res.json(track);
  } catch (error) {
    console.error('Pipeline track fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch track' });
  }
});

// Create track
router.post('/', (req, res) => {
  try {
    const { id, title, artist, genre, bpm, key, status, progress, notes } = req.body;

    db.prepare(`
      INSERT INTO pipeline_tracks (id, title, artist, genre, bpm, key, status, progress, notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `).run(id, title, artist, genre, bpm, key, status, progress, notes);

    const track = db.prepare('SELECT * FROM pipeline_tracks WHERE id = ?').get(id);
    
    try { getIO().emit('pipeline_update', { type: 'create', track }); } catch(e) {}
    
    res.json(track);
  } catch (error) {
    console.error('Pipeline create error:', error);
    res.status(500).json({ error: 'Failed to create track' });
  }
});

// Update track
router.put('/:id', (req, res) => {
  try {
    const { title, artist, genre, bpm, key, status, progress, notes } = req.body;

    db.prepare(`
      UPDATE pipeline_tracks
      SET title = ?, artist = ?, genre = ?, bpm = ?, key = ?, status = ?, progress = ?, notes = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(title, artist, genre, bpm, key, status, progress, notes, req.params.id);

    const track = db.prepare('SELECT * FROM pipeline_tracks WHERE id = ?').get(req.params.id);
    
    try { getIO().emit('pipeline_update', { type: 'update', track }); } catch(e) {}
    
    res.json(track);
  } catch (error) {
    console.error('Pipeline update error:', error);
    res.status(500).json({ error: 'Failed to update track' });
  }
});

// Delete track
router.delete('/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM pipeline_tracks WHERE id = ?').run(req.params.id);
    
    try { getIO().emit('pipeline_update', { type: 'delete', id: req.params.id }); } catch(e) {}

    res.json({ success: true });
  } catch (error) {
    console.error('Pipeline delete error:', error);
    res.status(500).json({ error: 'Failed to delete track' });
  }
});

// Sync from Google Drive
router.post('/sync', async (req, res) => {
  try {
    // TODO: Implement Google Drive sync
    res.json({ success: true, message: 'Sync not yet implemented' });
  } catch (error) {
    console.error('Pipeline sync error:', error);
    res.status(500).json({ error: 'Failed to sync' });
  }
});

export { router as pipelineRouter };
