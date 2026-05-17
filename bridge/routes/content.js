import express from 'express';
import { contentService } from '../services/content.js';
import { asyncHandler, ValidationError } from '../services/errors.js';

const router = express.Router();

router.get('/queue', asyncHandler(async (req, res) => {
    const { status, type } = req.query;
    const queue = await contentService.getQueue(status, type);
    res.json(queue);
}));

router.post('/queue', asyncHandler(async (req, res) => {
    const { type, data } = req.body;
    if (!type || !data) {
        throw new ValidationError('Type and data are required');
    }
    const item = await contentService.addToQueue(type, data);
    res.json(item);
}));

router.patch('/queue/:id', asyncHandler(async (req, res) => {
    const { status, result } = req.body;
    const item = await contentService.updateStatus(req.params.id, status, result);
    res.json(item);
}));

router.delete('/queue/:id', asyncHandler(async (req, res) => {
    await contentService.deleteItem(req.params.id);
    res.json({ success: true });
}));

export default router;
