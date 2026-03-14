import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { ACCOUNTS } from '@/lib/smartfolio/store/portfolio';
import { STRATEGIES } from '@/lib/smartfolio/store/strategy';
import type { AccountId, Asset, Order, AccountData, JournalEntry } from '@/lib/smartfolio/store/portfolio';
import type { Strategy } from '@/lib/smartfolio/store/strategy';
import { startPolling, fetchPrices, type PriceMap } from '@/lib/smartfolio/priceEngine';
import { checkAlerts, requestNotificationPermission } from '@/lib/smartfolio/alertEngine';
import { priceError, requestErrorNotificationPermission } from '@/lib/smartfolio/errorNotificationService';

import { storageKey, loadFromStorage, saveToStorage, STORAGE_PREFIX } from '@/lib/smartfolio/storage';
import { fetchAccountState, saveAccountStateToBridge } from '@/lib/smartfolio/bridgeSync';
import { useTradeExecution } from '@/hooks/smartfolio/useTradeExecution';

// ─── State Interfaces ───
export interface AccountState {
    assets: Asset[];
    journal: JournalEntry[];
    pendingOrders: Order[];
    recycledToSui: number;
    targetValue: number;
}

// ─── Context Interface ───
interface PortfolioContextType {
    // 1. Navigation & Active View
    activeAccount: AccountId;
    activeStrategy: Strategy;
    accountData: AccountData;
    switchAccount: (id: AccountId) => void;

    // 2. Unified State Access
    globalTotalValue: number;
    globalCashBalance: number;
    safetyNetPercent: number;
    isSafetyNetCritical: boolean;
    getAccountState: (id: AccountId) => AccountState;
    systemEvents: any[]; // New queue for reconciliation events

    // 3. Active Account Convenience Accessors (Legacy Compat)
    totalValue: number;
    targetValue: number;
    setTargetValue: (v: number) => void;
    cashBalance: number;
    assets: Asset[];
    pendingOrders: Order[];
    recycledToSui: number;
    marketTrends: Record<string, number[]>;
    journal: JournalEntry[];
    mounted: boolean;

    // 4. Actions (Targeting Active Account, but could be extended)
    recyclePnL: (symbol: string) => void;
    fillOrder: (orderId: string) => void;
    killOrder: (orderId: string) => void;
    addOrder: (order: Omit<Order, 'status' | 'id' | 'date'> & { status?: 'open' | 'filled' | 'cancelled'; date?: string; id?: string }) => void;
    addJournalEntry: (entry: Omit<JournalEntry, 'id' | 'timestamp'> & { id?: string; timestamp?: string; silent?: boolean }) => void;
    removeJournalEntry: (id: string) => void;
    syncAssetBalance: (symbol: string, units: number) => void;
    resetToDefaults: () => void;

    // 5. System
    isLiveMode: boolean;
    toggleLiveMode: () => void;
    lastSync: Date | null;
    refreshPrices: () => Promise<void>;
    importAsset: (symbol: string) => Promise<void>;
    exportData: () => string;
    importData: (json: string) => boolean;
    marketCondition: 'accumulation' | 'bull' | 'bear' | 'distribution' | 'choppiness';
    setMarketCondition: (condition: 'accumulation' | 'bull' | 'bear' | 'distribution' | 'choppiness') => void;
    fearGreed: { value: number; classification: string } | null;
    isRefreshing: boolean;
    isSyncing: boolean;
    accounts: typeof ACCOUNTS;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

// ═══════════════════════════════════════════════════
// PROVIDER
// ═══════════════════════════════════════════════════
export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [mounted, setMounted] = useState(false);
    const [activeAccount, setActiveAccount] = useState<AccountId>('sui');

    // ─── Unified State ───
    const [accountsState, setAccountsState] = useState<Record<AccountId, AccountState>>({
        sui: { assets: [], journal: [], pendingOrders: [], recycledToSui: 0, targetValue: 35000 },
        alts: { assets: [], journal: [], pendingOrders: [], recycledToSui: 0, targetValue: 35000 }
    });

    const [marketCondition, setMarketConditionRaw] = useState<'accumulation' | 'bull' | 'bear' | 'distribution' | 'choppiness'>('accumulation');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [lastSync, setLastSync] = useState<Date | null>(null);
    const [isLiveMode, setIsLiveMode] = useState(false);
    const [fearGreed, setFearGreed] = useState<{ value: number; classification: string } | null>(null);
    const [systemEvents, setSystemEvents] = useState<any[]>([]);

    // Keep ref in sync with accountsState to prevent stale closures in polling
    const accountsStateRef = useRef(accountsState);
    useEffect(() => {
        accountsStateRef.current = accountsState;
    }, [accountsState]);

    // Initial Load (Boot Sequence)
    useEffect(() => {
        let cancelled = false;

        const savedAccount = loadFromStorage<AccountId>(`${STORAGE_PREFIX}activeAccount`, 'sui');
        setActiveAccount(savedAccount);
        const savedMarket = loadFromStorage<'accumulation' | 'bull' | 'bear' | 'distribution' | 'choppiness'>(`${STORAGE_PREFIX}marketCondition`, 'accumulation');
        setMarketConditionRaw(savedMarket);

        // Load BOTH accounts in parallel
        Promise.all([fetchAccountState('sui'), fetchAccountState('alts')]).then(([suiState, altsState]) => {
            if (cancelled) return;

            // ─── RECONCILIATION LOGIC ───
            const events: any[] = [];

            // Check SUI Orders
            const localSuiOrders = loadFromStorage<Order[]>(storageKey('sui', 'orders'), []);
            const missingSui = localSuiOrders.filter(l => !suiState.pendingOrders.some(r => r.id === l.id));

            missingSui.forEach(lost => {
                // Is there a matching journal entry? (Same symbol, ~same units, DIFFERENT price implies manual fill)
                // We check the LAST 5 entries to be safe
                const match = suiState.journal.slice(0, 5).find(j =>
                    j.symbol === lost.symbol &&
                    Math.abs((j.units || 0) - lost.units) < (lost.units * 0.1) && // 10% unit tolerance
                    j.type === lost.type // same direction
                );

                if (match) {
                    events.push({
                        type: 'reconciliation',
                        account: 'sui',
                        payload: {
                            order: lost,
                            trade: match,
                            message: `Detected manual override: ${lost.units} ${lost.symbol} order @ $${lost.price} was replaced by trade @ $${match.price}.`
                        }
                    });
                }
            });

            setSystemEvents(events);

            setAccountsState({
                sui: suiState,
                alts: altsState
            });
            setMounted(true);
        });

        requestNotificationPermission();
        requestErrorNotificationPermission();

        // Fear & Greed Polling
        const fetchFng = () => {
            fetch('https://api.alternative.me/fng/?limit=1')
                .then(res => res.json())
                .then(json => {
                    if (cancelled) return;
                    if (json?.data && json.data.length > 0) {
                        setFearGreed({ value: parseInt(json.data[0].value), classification: json.data[0].value_classification });
                    }
                })
                .catch(console.warn);
        };
        fetchFng();
        const interval = setInterval(fetchFng, 3600000); // Poll hourly
        return () => {
            cancelled = true;
            clearInterval(interval);
        };
    }, []);

    // ─── Persistence ───
    const hasHydrated = useRef(false);
    useEffect(() => {
        if (!mounted) return;
        if (!hasHydrated.current) { hasHydrated.current = true; return; }

        const queueSave = async () => {
            setIsSyncing(true);

            // Save Active to Bridge (Minimal network traffic, we trust active account updates most)
            const activeState = accountsState[activeAccount];
            await saveAccountStateToBridge(activeAccount, activeState.assets, activeState.journal);

            // Persist ALL local data to storage
            (Object.keys(accountsState) as AccountId[]).forEach(id => {
                const s = accountsState[id];
                saveToStorage(storageKey(id, 'orders'), s.pendingOrders);
                saveToStorage(storageKey(id, 'recycled'), s.recycledToSui);
                saveToStorage(storageKey(id, 'target'), s.targetValue);
            });

            setTimeout(() => setIsSyncing(false), 500);
        };
        queueSave();

    }, [accountsState, activeAccount, mounted]);

    // ─── Setters Helper ───
    const updateActive = useCallback((transform: (prev: AccountState) => AccountState) => {
        setAccountsState(prev => ({
            ...prev,
            [activeAccount]: transform(prev[activeAccount])
        }));
    }, [activeAccount]);


    // ─── Global Computations ───
    const globalMetrics = useMemo(() => {
        const suiState = accountsState.sui;
        const altsState = accountsState.alts;

        const getVal = (assets: Asset[]) => assets.reduce((s, a) => s + a.currentValue, 0);
        const getCash = (assets: Asset[]) => assets.find(a => a.symbol === 'USD')?.currentValue || 0;

        const suiVal = getVal(suiState.assets);
        const altsVal = getVal(altsState.assets);
        const globalTotal = suiVal + altsVal;

        const globalCash = getCash(suiState.assets) + getCash(altsState.assets);
        const safetyNetPercent = globalTotal > 0 ? (globalCash / globalTotal) * 100 : 0;

        return {
            globalTotal,
            globalCash,
            safetyNetPercent,
            isSafetyNetCritical: safetyNetPercent < 5
        };
    }, [accountsState]);

    // ─── Active View Convenience ───
    const activeState = accountsState[activeAccount];
    const totalValue = activeState.assets.reduce((s, a) => s + a.currentValue, 0);
    const cashBalance = activeState.assets.find(a => a.symbol === 'USD')?.currentValue || 0;

    // ─── Helper Functions ───

    // Switch Account
    const switchAccount = useCallback((id: AccountId) => {
        setActiveAccount(id);
        saveToStorage(`${STORAGE_PREFIX}activeAccount`, id);
    }, []);

    // Set Target Value
    const setTargetValue = useCallback((v: number) => {
        updateActive(prev => ({ ...prev, targetValue: v }));
    }, [updateActive]);

    const setMarketCondition = useCallback((condition: 'accumulation' | 'bull' | 'bear' | 'distribution' | 'choppiness') => {
        setMarketConditionRaw(condition);
        saveToStorage(`${STORAGE_PREFIX}marketCondition`, condition);
    }, []);

    // ─── Logic Actions ───
    const {
        recyclePnL,
        addOrder,
        killOrder,
        addJournalEntry,
        fillOrder,
        removeJournalEntry,
        syncAssetBalance
    } = useTradeExecution({ activeAccount, accountsState, updateActive });


    // PRICE ENGINE Logic
    const applyPrices = useCallback((prices: PriceMap) => {
        setAccountsState(current => {
            // Use latest state from ref to avoid stale closure
            const latestState = accountsStateRef.current;
            const newState = { ...latestState };
            let changed = false;

            // Update BOTH accounts
            (Object.keys(newState) as AccountId[]).forEach(accId => {
                const state = newState[accId];
                const updatedAssets = state.assets.map(asset => {
                    if (asset.symbol === 'USD') return asset;
                    const newPrice = prices[asset.symbol];
                    if (newPrice === undefined) return asset;

                    const newValue = asset.units * newPrice;
                    return {
                        ...asset,
                        currentPrice: newPrice,
                        currentValue: newValue,
                        gainLoss: newValue - (asset.totalCost || 0),
                    };
                });

                // Re-calc allocations
                const total = updatedAssets.reduce((s, a) => s + a.currentValue, 0);
                const finalAssets = updatedAssets.map(a => ({
                    ...a,
                    allocation: total > 0 ? (a.currentValue / total) * 100 : 0
                }));

                newState[accId] = { ...state, assets: finalAssets };
                changed = true;
            });

            return changed ? newState : current;
        });

        checkAlerts(prices);
    }, []); // Empty deps - no stale closures

    // LIVE MODE - Use ref to access latest symbols
    useEffect(() => {
        if (!isLiveMode || !mounted) return;

        // Collect symbols from LATEST state (via ref)
        const getSymbols = () => {
            const latest = accountsStateRef.current;
            const allSymbols = new Set<string>();
            [...latest.sui.assets, ...latest.alts.assets].forEach(a => {
                if (a.symbol !== 'USD') allSymbols.add(a.symbol);
            });
            return Array.from(allSymbols);
        };

        const cleanup = startPolling({
            symbols: getSymbols(),
            intervalMs: 30000,
            onPriceUpdate: applyPrices,
            onSyncComplete: (ts) => setLastSync(ts),
            onError: (err) => {
                priceError('Price fetch failed', err.message);
            },
        });
        return cleanup;
    }, [isLiveMode, mounted, applyPrices]); // accountsState removed

    // Manual Refresh - Use ref for latest state
    const refreshPrices = useCallback(async () => {
        setIsRefreshing(true);

        // Use latest state via ref
        const latest = accountsStateRef.current;
        const allSymbols = new Set<string>();
        [...latest.sui.assets, ...latest.alts.assets].forEach(a => {
            if (a.symbol !== 'USD') allSymbols.add(a.symbol);
        });

        const prices = await fetchPrices(Array.from(allSymbols));
        if (Object.keys(prices).length > 0) {
            applyPrices(prices);
            setLastSync(new Date());
        }
        setIsRefreshing(false);
    }, [applyPrices]); // accountsState removed

    // Import Asset
    const importAsset = useCallback(async (symbol: string) => {
        const target = symbol.trim().toUpperCase();
        let price = 0;
        let logo = '';

        try {
            const res = await fetch(`https://api.coinbase.com/v2/prices/${target}-USD/spot`);
            const data = await res.json();
            if (data?.data?.amount) price = parseFloat(data.data.amount);
        } catch { }

        try {
            const res = await fetch(`https://api.coingecko.com/api/v3/search?query=${target}`);
            const data = await res.json();
            const coin = data.coins?.find((c: any) => c.symbol === target || c.symbol.toUpperCase() === target);
            if (coin) logo = coin.large || coin.thumb;
        } catch { }

        updateActive(prev => {
            if (prev.assets.some(a => a.symbol === target)) return prev;
            return {
                ...prev,
                assets: [...prev.assets, {
                    symbol: target, name: target, units: 0, avgCost: 0,
                    currentPrice: price, currentValue: 0, totalCost: 0,
                    gainLoss: 0, allocation: 0, targetAllocation: 0, logo
                }]
            };
        });
    }, [updateActive]);

    const resetToDefaults = useCallback(() => {
        const seed = ACCOUNTS[activeAccount];
        updateActive(() => ({
            assets: seed.assets,
            journal: seed.journal || [],
            pendingOrders: seed.pendingOrders,
            recycledToSui: seed.recycledToSui || 0,
            targetValue: seed.targetValue || 35000
        }));
        ['assets', 'orders', 'recycled', 'journal', 'target'].forEach(key =>
            localStorage.removeItem(storageKey(activeAccount, key))
        );
    }, [activeAccount, updateActive]);

    // Data Export/Import
    const exportData = useCallback(() => {
        return JSON.stringify({
            activeAccount,
            ...accountsState[activeAccount]
        }, null, 2);
    }, [activeAccount, accountsState]);

    const importData = useCallback((json: string): boolean => {
        try {
            const data = JSON.parse(json);
            updateActive(prev => ({
                ...prev,
                assets: data.assets || prev.assets,
                journal: data.journal || prev.journal,
                pendingOrders: data.pendingOrders || prev.pendingOrders,
                recycledToSui: data.recycledToSui ?? prev.recycledToSui
            }));
            return true;
        } catch { return false; }
    }, [updateActive]);


    return (
        <PortfolioContext.Provider value={{
            // 1. Navigation
            activeAccount,
            activeStrategy: STRATEGIES[activeAccount],
            accountData: ACCOUNTS[activeAccount],
            switchAccount,

            // 2. Unified State
            globalTotalValue: globalMetrics.globalTotal,
            globalCashBalance: globalMetrics.globalCash,
            safetyNetPercent: globalMetrics.safetyNetPercent,
            isSafetyNetCritical: globalMetrics.isSafetyNetCritical,
            getAccountState: (id) => accountsState[id],
            systemEvents,

            // 3. Active Account Accessors
            totalValue,
            targetValue: activeState.targetValue,
            setTargetValue,
            assets: activeState.assets,
            cashBalance,
            pendingOrders: activeState.pendingOrders,
            recycledToSui: activeState.recycledToSui,
            marketTrends: ACCOUNTS[activeAccount].marketTrends,
            journal: activeState.journal,
            mounted,

            // 4. Actions
            recyclePnL,
            fillOrder,
            killOrder,
            addOrder,
            addJournalEntry,
            removeJournalEntry,
            syncAssetBalance,
            resetToDefaults,

            // 5. System
            isLiveMode,
            toggleLiveMode: () => setIsLiveMode(!isLiveMode),
            lastSync,
            refreshPrices,
            importAsset,
            exportData,
            importData,
            marketCondition,
            setMarketCondition,
            fearGreed,
            isRefreshing,
            isSyncing,
            accounts: ACCOUNTS,
        }}>
            {children}
        </PortfolioContext.Provider>
    );
};

export const usePortfolio = () => {
    const context = useContext(PortfolioContext);
    if (!context) throw new Error('usePortfolio must be used within a PortfolioProvider');
    return context;
};
