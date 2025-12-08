/**
 * Income Aggregator Service
 * Phase 15: Unified view of all revenue streams
 * 
 * @module services/income-aggregator
 */

import { distributionService } from './distribution.js';
import { artProductsService } from './art-products.js';

// Manual income entries (for revenue not tracked automatically)
let manualEntries = [];

// Goals and projections
let incomeGoals = {
    monthly: 100,
    yearly: 1200,
    firstDollar: false,
    first100: false
};

/**
 * Add manual income entry
 */
export function addManualEntry(entry) {
    const newEntry = {
        id: Date.now(),
        ...entry,
        createdAt: new Date().toISOString(),
        type: entry.type || 'other',
        source: entry.source || 'manual'
    };
    manualEntries.push(newEntry);
    return newEntry;
}

/**
 * Get manual entries
 */
export function getManualEntries(filters = {}) {
    let filtered = [...manualEntries];

    if (filters.type) {
        filtered = filtered.filter(e => e.type === filters.type);
    }
    if (filters.startDate) {
        filtered = filtered.filter(e => new Date(e.createdAt) >= new Date(filters.startDate));
    }
    if (filters.endDate) {
        filtered = filtered.filter(e => new Date(e.createdAt) <= new Date(filters.endDate));
    }

    return filtered;
}

/**
 * Delete manual entry
 */
export function deleteManualEntry(id) {
    const idx = manualEntries.findIndex(e => e.id === parseInt(id));
    if (idx !== -1) {
        return manualEntries.splice(idx, 1)[0];
    }
    return null;
}

/**
 * Get unified income summary across all streams
 */
export function getUnifiedSummary() {
    // Get music revenue
    const musicSummary = distributionService.getRevenueSummary();
    const ytStatus = distributionService.getYouTubeStatus();

    // Get art revenue
    const artSummary = artProductsService.getRevenueSummary();

    // Get manual entries total
    const manualTotal = manualEntries.reduce((sum, e) => sum + (e.amount || 0), 0);

    // Calculate totals
    const totalRevenue = (musicSummary.totalRevenue || 0) +
        (artSummary.totalRevenue || 0) +
        manualTotal;

    // Check milestones
    if (totalRevenue >= 0.01 && !incomeGoals.firstDollar) {
        incomeGoals.firstDollar = true;
    }
    if (totalRevenue >= 100 && !incomeGoals.first100) {
        incomeGoals.first100 = true;
    }

    // Monthly projection (simple average based on current revenue)
    const projectedMonthly = (musicSummary.projectedMonthlyRevenue || 0) +
        (artSummary.totalRevenue * 4) + // Assume weekly sales
        manualTotal;

    return {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        projectedMonthly: Math.round(projectedMonthly * 100) / 100,

        // Revenue by stream
        streams: {
            music: {
                name: 'Music & Streaming',
                revenue: musicSummary.totalRevenue || 0,
                streams: musicSummary.totalStreams || 0,
                items: musicSummary.totalSongs || 0,
                color: '#ec4899' // pink
            },
            art: {
                name: 'Digital Art & POD',
                revenue: artSummary.totalRevenue || 0,
                sales: artSummary.totalSales || 0,
                items: artSummary.totalProducts || 0,
                color: '#f97316' // orange
            },
            content: {
                name: 'Content Pipeline',
                revenue: 0, // Pipeline revenue (AdSense, etc) not yet tracked
                posts: 0,
                color: '#8b5cf6' // purple
            },
            manual: {
                name: 'Other Income',
                revenue: manualTotal,
                entries: manualEntries.length,
                color: '#10b981' // emerald
            }
        },

        // Platform breakdown
        platforms: {
            youtube: {
                name: 'YouTube',
                revenue: musicSummary.platforms?.youtube?.revenue || 0,
                status: ytStatus.monetizationEligible ? 'monetized' : 'building',
                progress: Math.max(ytStatus.subscriberProgress, ytStatus.watchHoursProgress)
            },
            spotify: {
                name: 'Spotify',
                revenue: musicSummary.platforms?.spotify?.revenue || 0,
                streams: musicSummary.platforms?.spotify?.streams || 0
            },
            etsy: {
                name: 'Etsy',
                revenue: artSummary.platforms?.etsy?.revenue || 0,
                sales: artSummary.platforms?.etsy?.sales || 0
            }
        },

        // Goals
        goals: {
            ...incomeGoals,
            monthlyProgress: (totalRevenue / incomeGoals.monthly) * 100,
            yearlyProgress: (totalRevenue / incomeGoals.yearly) * 100
        },

        // Milestones
        milestones: [
            { name: 'First Dollar', achieved: incomeGoals.firstDollar, target: 1 },
            { name: 'First $100', achieved: incomeGoals.first100, target: 100 },
            { name: '$100/month', achieved: projectedMonthly >= 100, target: 100 },
            { name: '$1000/month', achieved: projectedMonthly >= 1000, target: 1000 }
        ]
    };
}

/**
 * Update income goals
 */
export function updateGoals(newGoals) {
    incomeGoals = { ...incomeGoals, ...newGoals };
    return incomeGoals;
}

/**
 * Get goals
 */
export function getGoals() {
    return incomeGoals;
}

/**
 * Get revenue breakdown by time period
 */
export function getRevenueByPeriod(period = 'month') {
    // This would track daily/weekly/monthly revenue
    // For now, return simple structure
    return {
        period,
        data: [],
        total: 0
    };
}

export const incomeAggregatorService = {
    addManualEntry,
    getManualEntries,
    deleteManualEntry,
    getUnifiedSummary,
    updateGoals,
    getGoals,
    getRevenueByPeriod
};

export default incomeAggregatorService;
