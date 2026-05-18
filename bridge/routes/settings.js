import express from 'express';
import { settingsService } from '../services/settings.js';
import { asyncHandler } from '../services/errors.js';

const router = express.Router();

router.get('/', (req, res) => {
    res.json(settingsService.getAll());
});

router.post('/', asyncHandler(async (req, res) => {
    const updates = req.body;
    await settingsService.updateMany(updates);
    res.json({ success: true, settings: settingsService.getAll() });
}));

export default router;
