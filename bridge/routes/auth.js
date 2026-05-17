import express from 'express';
import { googleService } from '../services/google.js';
import { githubService } from '../services/github.js';
import { asyncHandler } from '../services/errors.js';

const router = express.Router();

// ============ Google OAuth Routes ============

// Get OAuth URL
router.get('/google', asyncHandler(async (req, res) => {
    const authUrl = googleService.getAuthUrl();
    res.json({ authUrl });
}));

// OAuth callback
router.get('/google/callback', asyncHandler(async (req, res) => {
    const { code } = req.query;
    const tokens = await googleService.getTokens(code);

    // In production, store tokens securely
    // For now, return them to the client
    res.json({
        success: true,
        tokens,
        message: 'Authentication successful! Store these tokens securely.'
    });
}));

// ============ GitHub OAuth Routes ============

// Get OAuth URL
router.get('/github', asyncHandler(async (req, res) => {
    const authUrl = githubService.getAuthUrl();
    res.json({ authUrl });
}));

// Check system connection status
router.get('/github/status', (req, res) => {
    res.json({
        connected: !!process.env.GITHUB_ACCESS_TOKEN
    });
});

// OAuth callback
router.get('/github/callback', asyncHandler(async (req, res) => {
    const { code } = req.query;
    const tokens = await githubService.getTokens(code);

    res.json({
        success: true,
        tokens,
        message: 'GitHub connected successfully!'
    });
}));

export default router;
