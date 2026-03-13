import { Router } from 'express';
import { db } from '../db.js';
import { required } from '../middleware/validate.js';

export const chatRouter = Router();

chatRouter.get('/', (req, res) => {
  try {
    const { agentId } = req.query as Record<string, string>;
    if (agentId) {
      res.json(db.prepare('SELECT * FROM chat_history WHERE agent_id = ? ORDER BY timestamp ASC').all(agentId));
    } else {
      res.json(db.prepare('SELECT * FROM chat_history ORDER BY timestamp ASC').all());
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
