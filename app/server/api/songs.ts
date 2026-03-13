import { Router } from 'express';
import { db } from '../db.js';
import { required } from '../middleware/validate.js';

export const songsRouter = Router();

songsRouter.get('/', (_req, res) => {
  try { res.json(db.prepare('SELECT * FROM songs ORDER BY created_at DESC').all()); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});

songsRouter.post('/', required(['title', 'artist']), (req, res) => {
  try {
    const { id, title, artist, genre, mood, lyrics, suno_prompt, status } = req.body;
    db.prepare('INSERT INTO songs (id, title, artist, genre, mood, lyrics, suno_prompt, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
      .run(id, title, artist, genre, mood, lyrics, suno_prompt, status || 'draft');
    res.json(db.prepare('SELECT * FROM songs WHERE id = ?').get(id));
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

songsRouter.put('/:id', (req, res) => {
  try {
    const { title, artist, genre, mood, lyrics, suno_prompt, status } = req.body;
    db.prepare('UPDATE songs SET title = ?, artist = ?, genre = ?, mood = ?, lyrics = ?, suno_prompt = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(title, artist, genre, mood, lyrics, suno_prompt, status, req.params.id);
    res.json(db.prepare('SELECT * FROM songs WHERE id = ?').get(req.params.id));
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

songsRouter.delete('/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM songs WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});
