/**
 * Distribution Routes
 * Phase 13: Track music distribution and royalties
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
router.get('/songs', (req, res) => {
    const songs = distributionService.getDistributedSongs();
    res.json({
        success: true,
        songs,
        total: songs.length
    });
});

/**
 * GET /distribution/songs/:id
 * Get specific song
 */
router.get('/songs/:id', (req, res) => {
    const song = distributionService.getSongById(req.params.id);
    if (!song) {
        return res.status(404).json({ success: false, error: 'Song not found' });
    }
    res.json({ success: true, song });
});

/**
 * POST /distribution/songs
 * Add a new song to distribution tracking
 */
router.post('/songs', (req, res) => {
    const { title, artist, genre, album, sunoId, platforms } = req.body;

    if (!title) {
        return res.status(400).json({ success: false, error: 'Title is required' });
    }

    const song = distributionService.addDistributedSong({
        title,
        artist: artist || 'DLX Studios',
        genre,
        album,
        sunoId,
        platforms
    });

    res.json({ success: true, song });
});

/**
 * PUT /distribution/songs/:id/status
 * Update song status (pending, live, rejected)
 */
router.put('/songs/:id/status', (req, res) => {
    const { status, url, isrc, upc } = req.body;

    if (!status) {
        return res.status(400).json({ success: false, error: 'Status is required' });
    }

    const song = distributionService.updateSongStatus(req.params.id, status, { url, isrc, upc });
    if (!song) {
        return res.status(404).json({ success: false, error: 'Song not found' });
    }

    res.json({ success: true, song });
});

/**
 * PUT /distribution/songs/:id/streams
 * Update stream counts for a song
 */
router.put('/songs/:id/streams', (req, res) => {
    const { platform, streams } = req.body;

    if (!platform || streams === undefined) {
        return res.status(400).json({ success: false, error: 'Platform and streams are required' });
    }

    const song = distributionService.updateStreams(req.params.id, platform, streams);
    if (!song) {
        return res.status(404).json({ success: false, error: 'Song not found' });
    }

    res.json({ success: true, song });
});

/**
 * DELETE /distribution/songs/:id
 * Remove song from tracking
 */
router.delete('/songs/:id', (req, res) => {
    const removed = distributionService.deleteSong(req.params.id);
    if (!removed) {
        return res.status(404).json({ success: false, error: 'Song not found' });
    }
    res.json({ success: true, message: 'Song removed', removed });
});

/**
 * GET /distribution/stats
 * Get platform statistics
 */
router.get('/stats', (req, res) => {
    const stats = distributionService.getPlatformStats();
    res.json({ success: true, stats });
});

/**
 * GET /distribution/summary
 * Get revenue summary
 */
router.get('/summary', (req, res) => {
    const summary = distributionService.getRevenueSummary();
    res.json({ success: true, summary });
});

/**
 * GET /distribution/youtube
 * Get YouTube monetization status
 */
router.get('/youtube', (req, res) => {
    const status = distributionService.getYouTubeStatus();
    res.json({ success: true, youtube: status });
});

/**
 * PUT /distribution/youtube
 * Update YouTube stats manually
 */
router.put('/youtube', (req, res) => {
    const { subscribers, watchHours, views, revenue } = req.body;
    const stats = distributionService.updateYouTubeStats({ subscribers, watchHours, views, revenue });
    res.json({ success: true, youtube: stats });
});

export default router;
