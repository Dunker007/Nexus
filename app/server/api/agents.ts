import { Router } from 'express';
import { db } from '../db.js';
import { required } from '../middleware/validate.js';

export const agentsRouter = Router();

agentsRouter.get('/', (_req, res) => {
  try { res.json(db.prepare('SELECT * FROM agents').all()); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});

agentsRouter.post('/', required(['name', 'role']), (req, res) => {
  try {
    const { id, name, role, description, status, system_prompt } = req.body;
    db.prepare('INSERT INTO agents (id, name, role, description, status, system_prompt) VALUES (?, ?, ?, ?, ?, ?)')
      .run(id, name, role, description, status, system_prompt);
    res.json(db.prepare('SELECT * FROM agents WHERE id = ?').get(id));
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

agentsRouter.put('/:id', (req, res) => {
  try {
    const { name, role, description, status, system_prompt } = req.body;
    db.prepare('UPDATE agents SET name = ?, role = ?, description = ?, status = ?, system_prompt = ? WHERE id = ?')
      .run(name, role, description, status, system_prompt, req.params.id);
    res.json(db.prepare('SELECT * FROM agents WHERE id = ?').get(req.params.id));
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

agentsRouter.delete('/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM agents WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});
