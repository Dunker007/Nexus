/**
 * Distribution Routes
 * Phase 13: Track music distribution and royalties
 * Updated: Jan 8, 2026 - Now uses async database operations
 * 
 * @module routes/distribution
 */

import { Router } from 'express';
import { distributionService } from '../services/distribution.js';

const router = Router();

/**
 * GET /distribution/songs
 * Get all distributed songs
 */
router.get('/songs', async (req, res) => {
    try {
        const songs = await distributionService.getDistributedSongs();
        res.json({
            success: true,
            songs,
            total: songs.length
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /distribution/songs/:id
 * Get specific song
 */
router.get('/songs/:id', async (req, res) => {
    try {
        const song = await distributionService.getSongById(req.params.id);
        if (!song) {
            return res.status(404).json({ success: false, error: 'Song not found' });
        }
        res.json({ success: true, song });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /distribution/songs
 * Add a new song to distribution tracking
 */
router.post('/songs', async (req, res) => {
    try {
        const { title, artist, genre, album, sunoId, platforms } = req.body;

        if (!title) {
            return res.status(400).json({ success: false, error: 'Title is required' });
        }

        const song = await distributionService.addDistributedSong({
            title,
            artist: artist || 'DLX Studios',
            genre,
            album,
            sunoId,
            platforms
        });

        res.json({ success: true, song });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * PUT /distribution/songs/:id/status
 * Update song status (pending, live, rejected)
 */
router.put('/songs/:id/status', async (req, res) => {
    try {
        const { status, url, isrc, upc } = req.body;

        if (!status) {
            return res.status(400).json({ success: false, error: 'Status is required' });
        }

        const song = await distributionService.updateSongStatus(req.params.id, status, { url, isrc, upc });
        if (!song) {
            return res.status(404).json({ success: false, error: 'Song not found' });
        }

        res.json({ success: true, song });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * PUT /distribution/songs/:id/streams
 * Update stream counts for a song
 */
router.put('/songs/:id/streams', async (req, res) => {
    try {
        const { platform, streams } = req.body;

        if (!platform || streams === undefined) {
            return res.status(400).json({ success: false, error: 'Platform and streams are required' });
        }

        const song = await distributionService.updateStreams(req.params.id, platform, streams);
        if (!song) {
            return res.status(404).json({ success: false, error: 'Song not found' });
        }

        res.json({ success: true, song });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * DELETE /distribution/songs/:id
 * Remove song from tracking
 */
router.delete('/songs/:id', async (req, res) => {
    try {
        const removed = await distributionService.deleteSong(req.params.id);
        if (!removed) {
            return res.status(404).json({ success: false, error: 'Song not found' });
        }
        res.json({ success: true, message: 'Song removed', removed });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /distribution/stats
 * Get platform statistics
 */
router.get('/stats', async (req, res) => {
    try {
        const stats = await distributionService.getPlatformStats();
        res.json({ success: true, stats });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /distribution/summary
 * Get revenue summary
 */
router.get('/summary', async (req, res) => {
    try {
        const summary = await distributionService.getRevenueSummary();
        res.json({ success: true, summary });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /distribution/youtube
 * Get YouTube monetization status
 */
router.get('/youtube', async (req, res) => {
    try {
        const status = await distributionService.getYouTubeStatus();
        res.json({ success: true, youtube: status });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * PUT /distribution/youtube
 * Update YouTube stats manually
 */
router.put('/youtube', async (req, res) => {
    try {
        const { subscribers, watchHours, views, revenue } = req.body;
        const stats = await distributionService.updateYouTubeStats({ subscribers, watchHours, views, revenue });
        res.json({ success: true, youtube: stats });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
