import express from 'express';
import { smartfolioService } from '../services/smartfolio.js';
import { analystService } from '../services/analyst.js';
import { asyncHandler } from '../services/errors.js';

const router = express.Router();

// Get full portfolio state
router.get('/:accountId', asyncHandler(async (req, res) => {
    const { accountId } = req.params;
    const data = await smartfolioService.getPortfolio(accountId);
    res.json(data);
}));

// Sync/Import data
router.post('/:accountId/sync', asyncHandler(async (req, res) => {
    const { accountId } = req.params;
    const { assets, journal } = req.body;

    await smartfolioService.syncPortfolio(accountId, { assets, journal });

    // Return updated state
    const data = await smartfolioService.getPortfolio(accountId);
    res.json(data);
}));

// Delete journal entry
router.delete('/:accountId/journal/:id', asyncHandler(async (req, res) => {
    const { accountId, id } = req.params;
    await smartfolioService.deleteJournalEntry(id, accountId);
    res.json({ success: true });
}));

// Reset account
router.post('/:accountId/reset', asyncHandler(async (req, res) => {
    const { accountId } = req.params;
    await smartfolioService.clearAccount(accountId);
    res.json({ success: true });
}));

// AI Analysis
router.post('/analyze', asyncHandler(async (req, res) => {
    const { snapshot, persona, history, message } = req.body;
    const result = await analystService.analyze(snapshot, persona, history, message);
    res.json({ result });
}));

export default router;
