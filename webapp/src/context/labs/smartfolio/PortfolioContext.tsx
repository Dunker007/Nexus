"use client";
import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { ACCOUNTS, AccountId, Asset, Order, AccountData, JournalEntry } from '@/lib/labs/smartfolio/store/portfolio';
import { STRATEGIES, Strategy, TRADE_FEE_PERCENT } from '@/lib/labs/smartfolio/store/strategy';
import { startPolling, fetchPrices, type PriceMap } from '@/lib/labs/smartfolio/priceEngine';
import { saveSnapshot } from '@/lib/labs/smartfolio/snapshots';
import { checkAlerts, requestNotificationPermission } from '@/lib/labs/smartfolio/alertEngine';

// ─── localStorage helpers ───
const STORAGE_PREFIX = 'smartfolio_';

function storageKey(accountId: AccountId, key: string) {
    return `${STORAGE_PREFIX}${accountId}_${key}`;
}

function loadFromStorage<T>(key: string, fallback: T): T {
    if (typeof window === 'undefined') return fallback;
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch {
        return fallback;
    }
}

function saveToStorage(key: string, value: unknown) {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch { /* quota exceeded */ }
}

// ─── State Interfaces ───
interface AccountState {
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
    isRefreshing: boolean;
    isSyncing: boolean;
    accounts: typeof ACCOUNTS;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

// ─── Bridge API Helpers ───
const BRIDGE_URL = '/api/bridge/smartfolio';

async function fetchAccountState(accountId: AccountId): Promise<AccountState> {
    const seed = ACCOUNTS[accountId];
    try {
        const res = await fetch(`${BRIDGE_URL}/${accountId}`, {
            headers: { 'x-api-key': process.env.NEXT_PUBLIC_BRIDGE_API_KEY || '' }
        });
        if (!res.ok) throw new Error('Failed to fetch from bridge');
        const data = await res.json();

        if ((!data.positions || data.positions.length === 0) && (!data.journal || data.journal.length === 0)) {
            // Fallback to seed + local storage for orders
            return {
                assets: seed.assets,
                journal: seed.journal || [],
                pendingOrders: loadFromStorage<Order[]>(storageKey(accountId, 'orders'), seed.pendingOrders),
                recycledToSui: loadFromStorage<number>(storageKey(accountId, 'recycled'), seed.recycledToSui || 0),
                targetValue: loadFromStorage<number>(storageKey(accountId, 'target'), seed.targetValue || 0)
            };
        }

        const assets = data.positions.map((p: any) => {
            const seedAsset = seed.assets.find(a => a.symbol === p.symbol);
            const isUSD = p.symbol === 'USD';
            return {
                symbol: p.symbol,
                units: p.units,
                totalCost: p.cost,
                name: seedAsset?.name || p.symbol,
                logo: seedAsset?.logo,
                targetAllocation: seedAsset?.targetAllocation || 0,
                currentPrice: isUSD ? 1 : (seedAsset?.currentPrice || 0),
                currentValue: isUSD ? p.units : 0,
                gainLoss: 0,
                allocation: 0,
                avgCost: isUSD ? 1 : (p.units > 0 ? (p.cost / p.units) : (seedAsset?.avgCost || 0)),
            };
        });

        const journal = data.journal.map((j: any) => ({
            id: j.id,
            timestamp: j.timestamp,
            type: j.type,
            symbol: j.symbol,
            units: j.units,
            price: j.price,
            notes: j.notes
        }));

        // Use bridge pending orders if it is an array (even empty), otherwise fallback
        const pendingOrders = Array.isArray(data.pendingOrders)
            ? data.pendingOrders
            : loadFromStorage<Order[]>(storageKey(accountId, 'orders'), seed.pendingOrders);

        return {
            assets,
            journal,
            pendingOrders,
            recycledToSui: loadFromStorage<number>(storageKey(accountId, 'recycled'), seed.recycledToSui || 0),
            targetValue: loadFromStorage<number>(storageKey(accountId, 'target'), seed.targetValue || 0),
        };
    } catch (e) {
        console.warn(`Bridge sync failed for ${accountId}, falling back to local.`);
        return {
            assets: loadFromStorage<Asset[]>(storageKey(accountId, 'assets'), seed.assets),
            journal: loadFromStorage<JournalEntry[]>(storageKey(accountId, 'journal'), seed.journal || []),
            pendingOrders: loadFromStorage<Order[]>(storageKey(accountId, 'orders'), seed.pendingOrders),
            recycledToSui: loadFromStorage<number>(storageKey(accountId, 'recycled'), seed.recycledToSui || 0),
            targetValue: loadFromStorage<number>(storageKey(accountId, 'target'), seed.targetValue || 0),
        };
    }
}

async function saveAccountStateToBridge(accountId: AccountId, assets: Asset[], journal: JournalEntry[]) {
    try {
        await fetch(`${BRIDGE_URL}/${accountId}/sync`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': process.env.NEXT_PUBLIC_BRIDGE_API_KEY || ''
            },
            body: JSON.stringify({
                assets: assets.map(a => ({
                    symbol: a.symbol,
                    units: a.units,
                    totalCost: a.totalCost
                })),
                journal: journal
            })
        });
    } catch (e) {
        console.error('Bridge save failed', e);
    }
}

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
    const [systemEvents, setSystemEvents] = useState<any[]>([]);

    // Initial Load (Boot Sequence)
    useEffect(() => {
        const savedAccount = loadFromStorage<AccountId>(`${STORAGE_PREFIX}activeAccount`, 'sui');
        setActiveAccount(savedAccount);
        const savedMarket = loadFromStorage<'accumulation' | 'bull' | 'bear' | 'distribution' | 'choppiness'>(`${STORAGE_PREFIX}marketCondition`, 'accumulation');
        setMarketConditionRaw(savedMarket);

        // Load BOTH accounts in parallel
        Promise.all([fetchAccountState('sui'), fetchAccountState('alts')]).then(([suiState, altsState]) => {

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

    // PRICE ENGINE Logic
    const applyPrices = useCallback((prices: PriceMap) => {
        setAccountsState(current => {
            const newState = { ...current };
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
    }, []);

    // LIVE MODE
    useEffect(() => {
        if (!isLiveMode || !mounted) return;
        // Collect all distinct symbols from both accounts
        const allSymbols = new Set<string>();
        [...accountsState.sui.assets, ...accountsState.alts.assets].forEach(a => {
            if (a.symbol !== 'USD') allSymbols.add(a.symbol);
        });

        const cleanup = startPolling({
            symbols: Array.from(allSymbols),
            intervalMs: 30000,
            onPriceUpdate: applyPrices,
            onSyncComplete: (ts) => setLastSync(ts),
            onError: (err) => console.warn('[PriceEngine]', err.message),
        });
        return cleanup;
    }, [isLiveMode, mounted, applyPrices, accountsState]);

    // Manual Refresh
    const refreshPrices = useCallback(async () => {
        setIsRefreshing(true);
        const allSymbols = new Set<string>();
        [...accountsState.sui.assets, ...accountsState.alts.assets].forEach(a => {
            if (a.symbol !== 'USD') allSymbols.add(a.symbol);
        });
        const prices = await fetchPrices(Array.from(allSymbols));
        if (Object.keys(prices).length > 0) {
            applyPrices(prices);
            setLastSync(new Date());
        }
        setIsRefreshing(false);
    }, [accountsState, applyPrices]);

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

    // ─── Trade Execution & Journal ───
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
            marketTrends: ACCOUNTS.sui.marketTrends, // Legacy?
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
