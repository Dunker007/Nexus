import express from 'express';
import { systemService } from '../services/system.js';
import { asyncHandler } from '../services/errors.js';

const router = express.Router();

// Real-time system metrics
router.get('/', asyncHandler(async (req, res) => {
    const metrics = await systemService.getMetrics();
    res.json(metrics);
}));

// GPU stats (nvidia-smi)
router.get('/gpu', asyncHandler(async (req, res) => {
    const gpu = await systemService.getGPU();
    res.json(gpu);
}));

export default router;
