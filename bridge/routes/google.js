import express from 'express';
import { googleService } from '../services/google.js';

const router = express.Router();

// Get user info
router.get('/user', async (req, res) => {
    try {
        const accessToken = req.headers.authorization?.replace('Bearer ', '');
        if (!accessToken) {
            return res.status(401).json({ error: 'No access token provided' });
        }

        const userInfo = await googleService.getUserInfo(accessToken);
        res.json(userInfo);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// List calendar events
router.get('/calendar/events', async (req, res) => {
    try {
        const accessToken = req.headers.authorization?.replace('Bearer ', '');
        if (!accessToken) {
            return res.status(401).json({ error: 'No access token provided' });
        }

        const maxResults = parseInt(req.query.maxResults) || 10;
        const events = await googleService.listCalendarEvents(accessToken, maxResults);
        res.json(events);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// List Drive files
router.get('/drive/files', async (req, res) => {
    try {
        const accessToken = req.headers.authorization?.replace('Bearer ', '');
        if (!accessToken) {
            return res.status(401).json({ error: 'No access token provided' });
        }

        const maxResults = parseInt(req.query.maxResults) || 10;
        const files = await googleService.listDriveFiles(accessToken, maxResults);
        res.json(files);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
