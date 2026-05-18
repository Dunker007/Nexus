import express from 'express';
import { newsService } from '../services/news.js';
import { asyncHandler } from '../services/errors.js';

const router = express.Router();

// Get news items
router.get('/', asyncHandler(async (req, res) => {
    const { category, region, limit } = req.query;
    const news = await newsService.getNews({
        category,
        region,
        limit: parseInt(limit) || 100
    });
    res.json(news);
}));

// Refresh news items
router.post('/refresh', asyncHandler(async (req, res) => {
    const result = await newsService.refreshNews();
    res.json(result);
}));

export default router;
