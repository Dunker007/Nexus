import express from 'express';
import { smartfolioService } from '../services/smartfolio.js';
import { analystService } from '../services/analyst.js';

const router = express.Router();

// Get full portfolio state
router.get('/:accountId', async (req, res) => {
    try {
        const { accountId } = req.params;
        const data = await smartfolioService.getPortfolio(accountId);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Sync/Import data
router.post('/:accountId/sync', async (req, res) => {
    try {
        const { accountId } = req.params;
        const { assets, journal } = req.body;

        await smartfolioService.syncPortfolio(accountId, { assets, journal });

        // Return updated state
        const data = await smartfolioService.getPortfolio(accountId);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete journal entry
router.delete('/:accountId/journal/:id', async (req, res) => {
    try {
        const { accountId, id } = req.params;
        await smartfolioService.deleteJournalEntry(id, accountId);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Reset account
router.post('/:accountId/reset', async (req, res) => {
    try {
        const { accountId } = req.params;
        await smartfolioService.clearAccount(accountId);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// AI Analysis
router.post('/analyze', async (req, res) => {
    try {
        const { snapshot, persona, history, message } = req.body;
        const result = await analystService.analyze(snapshot, persona, history, message);
        res.json({ result });
    } catch (error) {
        console.error('Analysis error:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
