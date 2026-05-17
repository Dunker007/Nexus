import express from 'express';
import { settingsService } from '../services/settings.js';

const router = express.Router();

router.get('/', (req, res) => {
    res.json(settingsService.getAll());
});

router.post('/', async (req, res) => {
    try {
        const updates = req.body;
        await settingsService.updateMany(updates);
        res.json({ success: true, settings: settingsService.getAll() });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
