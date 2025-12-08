/**
 * Income Routes
 * Phase 15: Unified Income Dashboard API
 * 
 * @module routes/income
 */

import { Router } from 'express';
import { incomeAggregatorService } from '../services/income-aggregator.js';

const router = Router();

/**
 * GET /income/summary
 * Get unified income summary across all streams
 */
router.get('/summary', (req, res) => {
    const summary = incomeAggregatorService.getUnifiedSummary();
    res.json({ success: true, summary });
});

/**
 * GET /income/goals
 * Get income goals
 */
router.get('/goals', (req, res) => {
    const goals = incomeAggregatorService.getGoals();
    res.json({ success: true, goals });
});

/**
 * PUT /income/goals
 * Update income goals
 */
router.put('/goals', (req, res) => {
    const goals = incomeAggregatorService.updateGoals(req.body);
    res.json({ success: true, goals });
});

/**
 * GET /income/manual
 * Get manual income entries
 */
router.get('/manual', (req, res) => {
    const { type, startDate, endDate } = req.query;
    const entries = incomeAggregatorService.getManualEntries({ type, startDate, endDate });
    res.json({ success: true, entries, total: entries.length });
});

/**
 * POST /income/manual
 * Add manual income entry
 */
router.post('/manual', (req, res) => {
    const { amount, description, type, source, date } = req.body;

    if (amount === undefined) {
        return res.status(400).json({ success: false, error: 'Amount is required' });
    }

    const entry = incomeAggregatorService.addManualEntry({
        amount: parseFloat(amount),
        description,
        type,
        source,
        date: date || new Date().toISOString()
    });

    res.json({ success: true, entry });
});

/**
 * DELETE /income/manual/:id
 * Delete manual income entry
 */
router.delete('/manual/:id', (req, res) => {
    const removed = incomeAggregatorService.deleteManualEntry(req.params.id);
    if (!removed) {
        return res.status(404).json({ success: false, error: 'Entry not found' });
    }
    res.json({ success: true, message: 'Entry deleted', removed });
});

/**
 * GET /income/breakdown
 * Get revenue breakdown by time period
 */
router.get('/breakdown', (req, res) => {
    const { period = 'month' } = req.query;
    const breakdown = incomeAggregatorService.getRevenueByPeriod(period);
    res.json({ success: true, breakdown });
});

export default router;
