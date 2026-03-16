import { Router } from 'express';
import { getPrisma } from '../db.js';
import { required } from '../middleware/validate.js';

export const chatRouter = Router();

chatRouter.get('/', async (req, res) => {
  try {
    const { agentId, limit = '200', offset = '0' } = req.query as Record<string, string>;
    const take = Math.min(parseInt(limit) || 200, 500);
    const skip = parseInt(offset) || 0;
    
    const results = await getPrisma().chat_history.findMany({
      where: agentId ? { agent_id: agentId } : undefined,
      orderBy: { timestamp: 'asc' },
      take,
      skip
    });
    
    res.json(results);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

chatRouter.post('/', required(['role', 'content']), async (req, res) => {
  try {
    const { role, content, agent_id } = req.body;
    const result = await getPrisma().chat_history.create({
      data: { role, content, agent_id: agent_id ?? null }
    });
    res.json(result);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

chatRouter.delete('/', async (req, res) => {
  try {
    const { agentId } = req.query as Record<string, string>;
    if (agentId) {
      await getPrisma().chat_history.deleteMany({ where: { agent_id: agentId } });
    } else {
      await getPrisma().chat_history.deleteMany();
    }
    res.json({ success: true });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});
