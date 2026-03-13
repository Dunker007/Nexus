import { useCallback } from 'react';
import type { AccountState } from '@/contexts/labs/smartfolio/PortfolioContext';
import { TRADE_FEE_PERCENT } from '@/lib/smartfolio/store/strategy';
import type { AccountId } from '@/lib/smartfolio/store/portfolio';

interface UseTradeExecutionProps {
    activeAccount: AccountId;
    accountsState: Record<AccountId, AccountState>;
    updateActive: (transform: (prev: AccountState) => AccountState) => void;
}

export function useTradeExecution({ activeAccount, accountsState, updateActive }: UseTradeExecutionProps) {

    const recyclePnL = useCallback((symbol: string) => {
        if (activeAccount !== 'sui') return;
        updateActive(prev => {
            const anchorSymbol = 'SUI';
            const assets = [...prev.assets];
            const assetIndex = assets.findIndex(a => a.symbol === symbol);
            const anchorIndex = assets.findIndex(a => a.symbol === anchorSymbol);

            if (assetIndex === -1 || anchorIndex === -1) return prev;

            const asset = assets[assetIndex];
            const profit = Math.max(0, asset.gainLoss || 0);
            if (profit <= 0) return prev;

            // Sell Asset
            assets[assetIndex] = {
                ...asset,
                units: asset.units - (profit / asset.currentPrice),
                currentValue: asset.currentValue - profit,
                gainLoss: (asset.gainLoss || 0) - profit,
                totalCost: asset.totalCost || 0
            };

            // Buy Anchor
            const anchor = assets[anchorIndex];
            assets[anchorIndex] = {
                ...anchor,
                units: anchor.units + (profit / anchor.currentPrice),
                currentValue: anchor.currentValue + profit,
                totalCost: (anchor.totalCost || 0) + profit
            };

            return {
                ...prev,
                assets,
                recycledToSui: prev.recycledToSui + profit
            };
        });
    }, [activeAccount, updateActive]);

    const addOrder = useCallback((order: any) => {
        updateActive(prev => {
            const newOrder = {
                ...order,
                status: order.status || 'open',
                date: order.date || new Date().toISOString().split('T')[0],
                id: order.id || `${order.symbol}-${order.type}-${Date.now()}`
            };
            if (prev.pendingOrders.some(o => o.id === newOrder.id)) return prev;
            return { ...prev, pendingOrders: [...prev.pendingOrders, newOrder] };
        });
    }, [updateActive]);

    const killOrder = useCallback((id: string) => {
        updateActive(prev => ({
            ...prev,
            pendingOrders: prev.pendingOrders.filter(o => o.id !== id)
        }));
    }, [updateActive]);

    const addJournalEntry = useCallback((entry: any) => {
        const { silent, ...entryData } = entry;
        const newEntry = {
            id: entry.id || Date.now().toString(36),
            timestamp: entry.timestamp || new Date().toISOString(),
            ...entryData,
        };

        updateActive(prev => {
            // 1. Add to Journal
            if (prev.journal.some(e => e.id === newEntry.id)) return prev;
            const nextJournal = [newEntry, ...prev.journal];

            // 2. Remove matching Pending Order
            let nextOrders = prev.pendingOrders;
            if (newEntry.id && prev.pendingOrders.some(o => o.id === newEntry.id)) {
                nextOrders = prev.pendingOrders.filter(o => o.id !== newEntry.id);
            }

            // 3. Update Assets (if not silent)
            let nextAssets = prev.assets;
            if (newEntry.units && newEntry.price && !silent) {
                const targetSymbol = newEntry.symbol.trim().toUpperCase();
                const assetIdx = prev.assets.findIndex(a => a.symbol.toUpperCase() === targetSymbol);
                const cashIdx = prev.assets.findIndex(a => a.symbol === 'USD');

                if (assetIdx !== -1 && cashIdx !== -1) {
                    nextAssets = [...prev.assets];
                    const asset = nextAssets[assetIdx];
                    const cash = nextAssets[cashIdx];

                    const gross = newEntry.units * newEntry.price;
                    const fee = gross * (TRADE_FEE_PERCENT / 100);

                    if (newEntry.type === 'buy') {
                        const cost = gross + fee;
                        nextAssets[cashIdx] = { ...cash, currentValue: cash.currentValue - cost, units: cash.units - cost };
                        nextAssets[assetIdx] = {
                            ...asset,
                            units: asset.units + newEntry.units,
                            currentValue: (asset.units + newEntry.units) * asset.currentPrice,
                            totalCost: (asset.totalCost || 0) + cost
                        };
                    } else if (newEntry.type === 'sell') {
                        const proceeds = gross - fee;
                        nextAssets[cashIdx] = { ...cash, currentValue: cash.currentValue + proceeds, units: cash.units + proceeds };
                        const remaining = Math.max(0, asset.units - newEntry.units);
                        const unitRatio = asset.units > 0 ? remaining / asset.units : 0;
                        nextAssets[assetIdx] = {
                            ...asset,
                            units: remaining,
                            currentValue: remaining * asset.currentPrice,
                            totalCost: (asset.totalCost || 0) * unitRatio
                        };
                    }
                    // Recalc Allocations
                    const total = nextAssets.reduce((s, a) => s + a.currentValue, 0);
                    nextAssets.forEach(a => { a.allocation = total > 0 ? (a.currentValue / total) * 100 : 0 });
                }
            }

            return {
                ...prev,
                journal: nextJournal,
                pendingOrders: nextOrders,
                assets: nextAssets
            };
        });
    }, [updateActive]);

    const fillOrder = useCallback((orderId: string) => {
        const currentOrder = accountsState[activeAccount].pendingOrders.find(o => o.id === orderId);
        if (!currentOrder) return;

        addJournalEntry({
            ...currentOrder,
            timestamp: new Date().toISOString(),
            notes: 'Filled Order'
        });
    }, [accountsState, activeAccount, addJournalEntry]);

    const removeJournalEntry = useCallback((id: string) => {
        updateActive(prev => ({
            ...prev,
            journal: prev.journal.filter(e => e.id !== id)
        }));
    }, [updateActive]);

    const syncAssetBalance = useCallback((symbol: string, units: number) => {
        updateActive(prev => {
            const target = symbol.trim().toUpperCase();
            const idx = prev.assets.findIndex(a => a.symbol.toUpperCase() === target);
            if (idx === -1) return prev;

            const nextAssets = [...prev.assets];
            const asset = nextAssets[idx];
            const safeUnits = isNaN(units) ? 0 : units;

            // Proportional cost adjustment
            let newCost = asset.totalCost || 0;
            if (asset.units > 0) {
                newCost = (asset.totalCost || 0) * (safeUnits / asset.units);
            } else if (safeUnits > 0) {
                newCost = safeUnits * asset.currentPrice;
            }

            nextAssets[idx] = {
                ...asset,
                units: safeUnits,
                currentValue: safeUnits * asset.currentPrice,
                totalCost: newCost
            };

            // Recalc Allocations
            const total = nextAssets.reduce((s, a) => s + a.currentValue, 0);
            nextAssets.forEach(a => { a.allocation = total > 0 ? (a.currentValue / total) * 100 : 0 });

            return { ...prev, assets: nextAssets };
        });
    }, [updateActive]);

    return {
        recyclePnL,
        addOrder,
        killOrder,
        addJournalEntry,
        fillOrder,
        removeJournalEntry,
        syncAssetBalance
    };
}
