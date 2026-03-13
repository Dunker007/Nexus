import { Router } from 'express';
import { db } from '../db.js';
import { required } from '../middleware/validate.js';

export const newsRouter = Router();

newsRouter.get('/', (req, res) => {
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

newsRouter.post('/', required(['id', 'title', 'source']), (req, res) => {
  try {
    const { id, title, source, type, url, summary, bias, time, impact, feed } = req.body;
    db.prepare('INSERT INTO news_items (id, title, source, type, url, summary, bias, time, impact, feed) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .run(id, title, source, type, url, summary, bias, time, impact, feed || 'nexus');
    res.json(db.prepare('SELECT * FROM news_items WHERE id = ?').get(id));
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

newsRouter.delete('/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM news_items WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});
