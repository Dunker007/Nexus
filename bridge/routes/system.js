import express from 'express';
import { systemService } from '../services/system.js';

const router = express.Router();

// Real-time system metrics
router.get('/', async (req, res) => {
    try {
        const metrics = await systemService.getMetrics();
        res.json(metrics);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GPU stats (nvidia-smi)
router.get('/gpu', async (req, res) => {
    try {
        const gpu = await systemService.getGPU();
        res.json(gpu);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
