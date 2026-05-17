import express from 'express';
import { githubService } from '../services/github.js';

const router = express.Router();

// Get user info
router.get('/user', async (req, res) => {
    try {
        const accessToken = req.headers.authorization?.replace('Bearer ', '');
        const userInfo = await githubService.getUserInfo(accessToken);
        res.json(userInfo);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// List repos
router.get('/repos', async (req, res) => {
    try {
        const accessToken = req.headers.authorization?.replace('Bearer ', '');
        const limit = parseInt(req.query.limit) || 10;
        const repos = await githubService.listRepos(accessToken, limit);
        res.json(repos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
