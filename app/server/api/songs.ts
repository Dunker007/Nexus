import { Router } from 'express';
import { getPrisma } from '../db.js';
import { required } from '../middleware/validate.js';
import { requireAuth } from '../middleware/requireAuth.js';

export const songsRouter = Router();

songsRouter.get('/', async (_req, res) => {
  try { res.json(await getPrisma().songs.findMany({ orderBy: { created_at: 'desc' } })); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});

songsRouter.post('/', requireAuth, required(['title', 'artist']), async (req, res) => {
  try {
    const { id, title, artist, genre, mood, lyrics, suno_prompt, status } = req.body;
    const song = await getPrisma().songs.create({
      data: {
        id: id || crypto.randomUUID(),
        title, artist, genre, mood, lyrics, suno_prompt, status: status || 'draft'
      }
    });
    res.json(song);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

songsRouter.put('/:id', requireAuth, async (req, res) => {
  try {
    const { title, artist, genre, mood, lyrics, suno_prompt, status } = req.body;
    const song = await getPrisma().songs.update({
      where: { id: req.params.id as string },
      data: { title, artist, genre, mood, lyrics, suno_prompt, status, updated_at: new Date() }
    });
    res.json(song);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

songsRouter.delete('/:id', requireAuth, async (req, res) => {
  try {
    await getPrisma().songs.delete({ where: { id: req.params.id as string } });
    res.json({ success: true });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});
