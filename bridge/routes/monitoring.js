import express from 'express';
import { lmstudioService } from '../services/lmstudio.js';
import { ollamaService } from '../services/ollama.js';
import { systemService } from '../services/system.js';
import { errorLogger, asyncHandler } from '../services/errors.js';
import { performanceMonitor, cache } from '../services/performance.js';

const router = express.Router();

// Health check with detailed status
// Mounted at both /health and /monitoring in server.js
router.get('/', asyncHandler(async (req, res) => {
    const [lmstudio, ollama, system] = await Promise.all([
        lmstudioService.getStatus(),
        ollamaService.getStatus(),
        systemService.getMetrics()
    ]);

    const health = {
        status: 'healthy',
        timestamp: new Date(),
        uptime: process.uptime(),
        services: {
            lmstudio: lmstudio.online ? 'up' : 'down',
            ollama: ollama.online ? 'up' : 'down',
            system: system.gpu?.available ? 'up' : 'degraded'
        },
        memory: {
            used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
            total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
            external: Math.round(process.memoryUsage().external / 1024 / 1024)
        }
    };

    // Check if any service is down
    const allUp = Object.values(health.services).every(s => s === 'up');
    if (!allUp) {
        health.status = 'degraded';
    }

    res.json(health);
}));

// Error logs
router.get('/errors', asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 100;
    const [errors, stats] = await Promise.all([
        errorLogger.getErrors(limit),
        errorLogger.getErrorStats()
    ]);
    res.json({ errors, stats });
}));

// Performance metrics
router.get('/metrics', asyncHandler(async (req, res) => {
    const metrics = {
        timestamp: new Date(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        platform: process.platform,
        nodeVersion: process.version
    };

    res.json(metrics);
}));

// Clear error logs (admin only)
router.post('/errors/clear', asyncHandler(async (req, res) => {
    await errorLogger.clear();
    res.json({ success: true, message: 'Error logs cleared' });
}));

// Performance stats
router.get('/performance', asyncHandler(async (req, res) => {
    const stats = await performanceMonitor.getAllStats();
    res.json({
        stats,
        cache: cache.getStats()
    });
}));

export default router;
