import { Router } from 'express';
import { getPrisma } from '../db.js';
import { required } from '../middleware/validate.js';
import { requireAuth } from '../middleware/requireAuth.js';
export const tasksRouter = Router();
tasksRouter.get('/', requireAuth, async (_req, res) => {
    try {
        res.json(await getPrisma().tasks.findMany({
            orderBy: [
                { completed: 'asc' },
                { id: 'desc' }
            ]
        }));
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
tasksRouter.post('/', requireAuth, required(['id', 'title']), async (req, res) => {
    try {
        const { id, title, completed, category } = req.body;
        const task = await getPrisma().tasks.create({
            data: {
                id,
                title,
                completed: completed ? 1 : 0,
                category
            }
        });
        res.json(task);
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
tasksRouter.put('/:id', requireAuth, async (req, res) => {
    try {
        const { title, completed, category } = req.body;
        const updateData = {};
        if (title !== undefined)
            updateData.title = title;
        if (completed !== undefined)
            updateData.completed = completed ? 1 : 0;
        if (category !== undefined)
            updateData.category = category;
        const task = await getPrisma().tasks.update({
            where: { id: req.params.id },
            data: updateData
        });
        res.json(task);
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
tasksRouter.delete('/:id', requireAuth, async (req, res) => {
    try {
        await getPrisma().tasks.delete({ where: { id: req.params.id } });
        res.json({ success: true });
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
