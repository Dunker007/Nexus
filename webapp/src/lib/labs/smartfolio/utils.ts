import { Strategy, AllocationHealth } from './data/strategy';

export function getCashHealth(cashPercent: number, strategy: Strategy): AllocationHealth {
    if (cashPercent < strategy.thresholds.cashCriticalBelow) return 'CRITICAL';
    if (cashPercent < strategy.thresholds.cashHealthyAbove) return 'UNDER';
    if (cashPercent > (strategy.targets.cash.max ?? 40)) return 'OVER';
    return 'ON_TARGET';
}

export function getAssetHealth(percent: number, maxConcentration: number): AllocationHealth {
    if (percent > maxConcentration + 5) return 'OVER';
    if (percent > maxConcentration) return 'ON_TARGET';
    return 'ON_TARGET';
}

// Re-export strict types if needed elsewhere, though they are in strategy.ts
export type { AllocationHealth };
