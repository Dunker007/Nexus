import { Router } from 'express';
import { getPrisma } from '../db.js';
import { required } from '../middleware/validate.js';
import { requireAuth } from '../middleware/requireAuth.js';
export const agentsRouter = Router();
agentsRouter.get('/', async (_req, res) => {
    try {
        res.json(await getPrisma().agents.findMany());
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
agentsRouter.post('/', requireAuth, required(['name', 'role']), async (req, res) => {
    try {
        const { name, role, description, status, system_prompt } = req.body;
        const id = crypto.randomUUID();
        const result = await getPrisma().agents.create({
            data: { id, name, role, description: description ?? '', status: status ?? 'active', system_prompt: system_prompt ?? '' }
        });
        res.json(result);
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
agentsRouter.put('/:id', requireAuth, async (req, res) => {
    try {
        const { name, role, description, status, system_prompt } = req.body;
        const result = await getPrisma().agents.update({
            where: { id: req.params.id },
            data: { name, role, description, status, system_prompt }
        });
        res.json(result);
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
agentsRouter.delete('/:id', requireAuth, async (req, res) => {
    try {
        await getPrisma().agents.delete({ where: { id: req.params.id } });
        res.json({ success: true });
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
