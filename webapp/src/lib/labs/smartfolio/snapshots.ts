/**
 * SmartFolio — Portfolio Snapshot Service
 * ========================================
 * Saves daily portfolio value snapshots to localStorage.
 * Used to build equity curves and track historical performance.
 */

// ─── Types ───
export interface PortfolioSnapshotEntry {
    date: string;           // ISO date string (YYYY-MM-DD)
    timestamp: number;      // Unix ms
    totalValue: number;
    cashValue: number;
    cashPercent: number;
    positions: {
        symbol: string;
        value: number;
        allocation: number;
        price: number;
    }[];
}

export interface SnapshotStore {
    [accountId: string]: PortfolioSnapshotEntry[];
}

// ─── Constants ───
const STORAGE_KEY = 'smartfolio_snapshots';
const MAX_SNAPSHOTS = 365; // Keep 1 year of daily snapshots

// ─── Load / Save ───
function loadStore(): SnapshotStore {
    if (typeof window === 'undefined') return {};
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
}

function saveStore(store: SnapshotStore): void {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    } catch (e) {
        console.warn('[Snapshots] Failed to save:', e);
    }
}

// ─── Public API ───

/**
 * Save a snapshot for today. Only one snapshot per day per account.
 * If a snapshot already exists for today, it will be updated with latest values.
 */
export function saveSnapshot(
    accountId: string,
    totalValue: number,
    cashValue: number,
    positions: { symbol: string; value: number; allocation: number; price: number }[]
): void {
    const store = loadStore();
    if (!store[accountId]) store[accountId] = [];

    const today = new Date().toISOString().split('T')[0];
    const cashPercent = totalValue > 0 ? (cashValue / totalValue) * 100 : 0;

    const entry: PortfolioSnapshotEntry = {
        date: today,
        timestamp: Date.now(),
        totalValue,
        cashValue,
        cashPercent,
        positions,
    };

    // Replace today's entry if exists, otherwise push
    const existingIdx = store[accountId].findIndex(s => s.date === today);
    if (existingIdx >= 0) {
        store[accountId][existingIdx] = entry;
    } else {
        store[accountId].push(entry);
    }

    // Trim to max
    if (store[accountId].length > MAX_SNAPSHOTS) {
        store[accountId] = store[accountId].slice(-MAX_SNAPSHOTS);
    }

    saveStore(store);
}

/**
 * Get all snapshots for an account, sorted by date ascending.
 */
export function getSnapshots(accountId: string): PortfolioSnapshotEntry[] {
    const store = loadStore();
    return (store[accountId] || []).sort((a, b) => a.timestamp - b.timestamp);
}

/**
 * Get the latest snapshot for an account.
 */
export function getLatestSnapshot(accountId: string): PortfolioSnapshotEntry | null {
    const snapshots = getSnapshots(accountId);
    return snapshots.length > 0 ? snapshots[snapshots.length - 1] : null;
}

/**
 * Calculate performance metrics from snapshots.
 */
export function calculatePerformance(accountId: string): {
    daily: number | null;
    weekly: number | null;
    monthly: number | null;
    allTime: number | null;
    highWaterMark: number;
    drawdown: number;
} {
    const snapshots = getSnapshots(accountId);
    if (snapshots.length === 0) {
        return { daily: null, weekly: null, monthly: null, allTime: null, highWaterMark: 0, drawdown: 0 };
    }

    const latest = snapshots[snapshots.length - 1];
    const now = new Date();

    // Find comparison points
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const findNearest = (targetDate: string) => {
        let closest: PortfolioSnapshotEntry | null = null;
        let minDiff = Infinity;
        for (const s of snapshots) {
            const diff = Math.abs(new Date(s.date).getTime() - new Date(targetDate).getTime());
            if (diff < minDiff) {
                minDiff = diff;
                closest = s;
            }
        }
        return closest;
    };

    const calcChange = (ref: PortfolioSnapshotEntry | null) => {
        if (!ref || ref.date === latest.date) return null;
        return ((latest.totalValue - ref.totalValue) / ref.totalValue) * 100;
    };

    const highWaterMark = Math.max(...snapshots.map(s => s.totalValue));
    const drawdown = highWaterMark > 0 ? ((latest.totalValue - highWaterMark) / highWaterMark) * 100 : 0;

    return {
        daily: calcChange(findNearest(dayAgo)),
        weekly: calcChange(findNearest(weekAgo)),
        monthly: calcChange(findNearest(monthAgo)),
        allTime: snapshots.length > 1 ? calcChange(snapshots[0]) : null,
        highWaterMark,
        drawdown,
    };
}

/**
 * Get snapshot data formatted for chart rendering.
 */
export function getChartData(accountId: string): { date: string; value: number }[] {
    return getSnapshots(accountId).map(s => ({
        date: s.date,
        value: s.totalValue,
    }));
}

/**
 * Clear all snapshots for an account.
 */
export function clearSnapshots(accountId: string): void {
    const store = loadStore();
    delete store[accountId];
    saveStore(store);
}
