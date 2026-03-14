/**
 * SmartFolio — Live Price Engine
 * ================================
 * Polls Coinbase public API for real-time spot prices.
 * No API key required — uses the free /v2/prices endpoint.
 *
 * Architecture:
 *   - fetchPrices(): One-shot fetch for all symbols
 *   - startPolling(): Continuous polling at configurable interval
 *   - Callbacks: onPriceUpdate fires with { symbol, price } map
 */

import { priceError } from './errorNotificationService';

// ─── Types ───
export interface PriceMap {
    [symbol: string]: number;
}

export interface PriceEngineConfig {
    symbols: string[];
    intervalMs: number;          // Default 30s
    onPriceUpdate: (prices: PriceMap) => void;
    onError?: (error: Error) => void;
    onSyncComplete?: (timestamp: Date) => void;
}

// ─── Coinbase Price Fetch ───
async function fetchCoinbasePrice(symbol: string): Promise<number | null> {
    try {
        const res = await fetch(`https://api.coinbase.com/v2/prices/${symbol}-USD/spot`, {
            cache: 'no-store',
        });

        if (!res.ok) {
            priceError(
                `Price fetch failed for ${symbol}`,
                `HTTP ${res.status}: ${res.statusText}`
            );
            return null;
        }

        const data = await res.json();
        return data?.data?.amount ? parseFloat(data.data.amount) : null;
    } catch (e) {
        const errorMsg = e instanceof Error ? e.message : String(e);
        priceError(
            `Network error fetching ${symbol}`,
            errorMsg
        );
        return null;
    }
}

// ─── Batch Fetch (Sequential to avoid rate limits) ───
export async function fetchPrices(symbols: string[]): Promise<PriceMap> {
    const prices: PriceMap = {};
    const tradableSymbols = symbols.filter(s => s !== 'USD');

    // Fetch in parallel batches of 5 to stay within rate limits
    const batchSize = 5;
    for (let i = 0; i < tradableSymbols.length; i += batchSize) {
        const batch = tradableSymbols.slice(i, i + batchSize);
        await Promise.allSettled(
            batch.map(async (symbol) => {
                const price = await fetchCoinbasePrice(symbol);
                if (price !== null) {
                    prices[symbol] = price;
                }
            })
        );
    }

    // Log batch summary
    const failedSymbols = tradableSymbols.filter(s => prices[s] === undefined);
    if (failedSymbols.length > 0) {
        priceError(
            `Failed to fetch prices for ${failedSymbols.length} symbols`,
            `Symbols: ${failedSymbols.join(', ')}`
        );
    }

    return prices;
}

// ─── Polling Engine ───
// Each startPolling call is self-contained; state is local, not module-level.
// This prevents double-start from React StrictMode double-invoking useEffect.

export function startPolling(config: PriceEngineConfig): () => void {
    const { symbols, intervalMs, onPriceUpdate, onError, onSyncComplete } = config;

    let cancelled = false;
    let isRunning = false;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const poll = async () => {
        if (cancelled || isRunning) return;
        isRunning = true;
        try {
            const prices = await fetchPrices(symbols);
            if (!cancelled && Object.keys(prices).length > 0) {
                onPriceUpdate(prices);
                onSyncComplete?.(new Date());
            }
        } catch (err) {
            if (!cancelled) onError?.(err instanceof Error ? err : new Error(String(err)));
        } finally {
            isRunning = false;
        }
    };

    // Immediate first fetch
    poll();

    // Then poll on interval
    intervalId = setInterval(poll, intervalMs);

    // Return cleanup function
    return () => {
        cancelled = true;
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
        }
    };
}

export function stopPolling(): void {
    // No-op — kept for backwards compatibility; callers should use the cleanup fn returned by startPolling
}

export function isPolling(): boolean {
    return false; // No global state — use the returned cleanup fn to manage lifecycle
}
