import { Router } from 'express';
import { db } from '../db.js';
import { required } from '../middleware/validate.js';

export const tasksRouter = Router();

tasksRouter.get('/', (_req, res) => {
  try { res.json(db.prepare('SELECT * FROM tasks ORDER BY completed ASC, id DESC').all()); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});

tasksRouter.post('/', required(['id', 'title']), (req, res) => {
  try {
    const { id, title, completed, category } = req.body;
    db.prepare('INSERT INTO tasks (id, title, completed, category) VALUES (?, ?, ?, ?)').run(id, title, completed ? 1 : 0, category);
    res.json(db.prepare('SELECT * FROM tasks WHERE id = ?').get(id));
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

tasksRouter.put('/:id', (req, res) => {
  try {
    const { title, completed, category } = req.body;
    db.prepare('UPDATE tasks SET title = COALESCE(?, title), completed = COALESCE(?, completed), category = COALESCE(?, category) WHERE id = ?')
      .run(title ?? null, completed !== undefined ? (completed ? 1 : 0) : null, category ?? null, req.params.id);
    res.json(db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id));
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

tasksRouter.delete('/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});
