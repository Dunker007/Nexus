import { Router } from 'express';
import { getPrisma } from '../db.js';
import { required } from '../middleware/validate.js';
import { requireAuth } from '../middleware/requireAuth.js';
export const chatRouter = Router();
chatRouter.get('/', requireAuth, async (req, res) => {
    try {
        const { agentId, limit = '200', offset = '0' } = req.query;
        const userId = req.user.id;
        const take = Math.min(parseInt(limit) || 200, 500);
        const skip = parseInt(offset) || 0;
        const results = await getPrisma().chat_history.findMany({
            where: { user_id: userId, ...(agentId ? { agent_id: agentId } : {}) },
            orderBy: { timestamp: 'asc' },
            take,
            skip
        });
        res.json(results);
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
chatRouter.post('/', requireAuth, required(['role', 'content']), async (req, res) => {
    try {
        const { role, content, agent_id } = req.body;
        const userId = req.user.id;
        const result = await getPrisma().chat_history.create({
            data: { role, content, agent_id: agent_id ?? null, user_id: userId }
        });
        res.json(result);
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
chatRouter.delete('/', requireAuth, async (req, res) => {
    try {
        const { agentId } = req.query;
        const userId = req.user.id;
        await getPrisma().chat_history.deleteMany({
            where: { user_id: userId, ...(agentId ? { agent_id: agentId } : {}) }
        });
        res.json({ success: true });
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
