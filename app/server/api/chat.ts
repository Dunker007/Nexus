import { Router } from 'express';
import { db } from '../db.js';
import { required } from '../middleware/validate.js';

export const chatRouter = Router();

chatRouter.get('/', (req, res) => {
  try {
    const { agentId, limit = '200', offset = '0' } = req.query as Record<string, string>;
    const lim = Math.min(parseInt(limit) || 200, 500);
    const off = parseInt(offset) || 0;
    if (agentId) {
      res.json(db.prepare('SELECT * FROM chat_history WHERE agent_id = ? ORDER BY timestamp ASC LIMIT ? OFFSET ?').all(agentId, lim, off));
    } else {
      res.json(db.prepare('SELECT * FROM chat_history ORDER BY timestamp ASC LIMIT ? OFFSET ?').all(lim, off));
    }
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

chatRouter.post('/', required(['role', 'content']), (req, res) => {
  try {
    const { role, content, agent_id } = req.body;
    const result = db.prepare('INSERT INTO chat_history (role, content, agent_id) VALUES (?, ?, ?)').run(role, content, agent_id ?? null);
    res.json({ id: result.lastInsertRowid, role, content, agent_id: agent_id ?? null });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

chatRouter.delete('/', (req, res) => {
  try {
    const { agentId } = req.query as Record<string, string>;
    if (agentId) {
      db.prepare('DELETE FROM chat_history WHERE agent_id = ?').run(agentId);
    } else {
      db.prepare('DELETE FROM chat_history').run();
    }
    res.json({ success: true });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});
