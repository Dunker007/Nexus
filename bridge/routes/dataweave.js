/**
 * Data Weave Routes
 * ETL Pipeline Management Endpoints
 */

import { Router } from 'express';
import etlRunner from '../services/etlRunner.js';

const router = Router();

/**
 * GET /dataweave/jobs
 * List all ETL jobs
 */
router.get('/jobs', (req, res) => {
    try {
        const jobs = etlRunner.listJobs();
        res.json({ success: true, jobs });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /dataweave/jobs/:id
 * Get job details
 */
router.get('/jobs/:id', (req, res) => {
    try {
        const job = etlRunner.getJob(req.params.id);
        if (!job) {
            return res.status(404).json({ success: false, error: 'Job not found' });
        }
        res.json({ success: true, job });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /dataweave/jobs/:id/run
 * Execute an ETL job
 */
router.post('/jobs/:id/run', async (req, res) => {
    try {
        const result = await etlRunner.runJob(req.params.id);
        res.json({ success: true, result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /dataweave/jobs/:id/status
 * Get job status
 */
router.get('/jobs/:id/status', (req, res) => {
    try {
        const job = etlRunner.getJob(req.params.id);
        if (!job) {
            return res.status(404).json({ success: false, error: 'Job not found' });
        }
        res.json({
            success: true,
            status: job.status,
            lastRun: job.lastRun,
            lastResult: job.lastResult,
            lastError: job.lastError
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /dataweave/history
 * Get job execution history
 */
router.get('/history', (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const history = etlRunner.getHistory(limit);
        res.json({ success: true, history });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
