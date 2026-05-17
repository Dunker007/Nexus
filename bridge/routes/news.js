import express from 'express';
import { newsService } from '../services/news.js';

const router = express.Router();

// Get news items
router.get('/', async (req, res) => {
    try {
        const { category, region, limit } = req.query;
        const news = await newsService.getNews({
            category,
            region,
            limit: parseInt(limit) || 100
        });
        res.json(news);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Refresh news items
router.post('/refresh', async (req, res) => {
    try {
        const result = await newsService.refreshNews();
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
