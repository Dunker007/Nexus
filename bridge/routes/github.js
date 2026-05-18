import express from 'express';
import { githubService } from '../services/github.js';
import { asyncHandler } from '../services/errors.js';

const router = express.Router();

// Get user info
router.get('/user', asyncHandler(async (req, res) => {
    const accessToken = req.headers.authorization?.replace('Bearer ', '');
    const userInfo = await githubService.getUserInfo(accessToken);
    res.json(userInfo);
}));

// List repos
router.get('/repos', asyncHandler(async (req, res) => {
    const accessToken = req.headers.authorization?.replace('Bearer ', '');
    const limit = parseInt(req.query.limit) || 10;
    const repos = await githubService.listRepos(accessToken, limit);
    res.json(repos);
}));

export default router;
