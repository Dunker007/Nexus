import express from 'express';
import { googleService } from '../services/google.js';
import { asyncHandler, AuthenticationError } from '../services/errors.js';

const router = express.Router();

// Get user info
router.get('/user', asyncHandler(async (req, res) => {
    const accessToken = req.headers.authorization?.replace('Bearer ', '');
    if (!accessToken) {
        throw new AuthenticationError('No access token provided');
    }

    const userInfo = await googleService.getUserInfo(accessToken);
    res.json(userInfo);
}));

// List calendar events
router.get('/calendar/events', asyncHandler(async (req, res) => {
    const accessToken = req.headers.authorization?.replace('Bearer ', '');
    if (!accessToken) {
        throw new AuthenticationError('No access token provided');
    }

    const maxResults = parseInt(req.query.maxResults) || 10;
    const events = await googleService.listCalendarEvents(accessToken, maxResults);
    res.json(events);
}));

// List Drive files
router.get('/drive/files', asyncHandler(async (req, res) => {
    const accessToken = req.headers.authorization?.replace('Bearer ', '');
    if (!accessToken) {
        throw new AuthenticationError('No access token provided');
    }

    const maxResults = parseInt(req.query.maxResults) || 10;
    const files = await googleService.listDriveFiles(accessToken, maxResults);
    res.json(files);
}));

export default router;
