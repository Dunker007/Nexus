import { ACCOUNTS, type AccountId, type Asset, type JournalEntry, type Order } from './store/portfolio';
import { loadFromStorage, storageKey } from './storage';
import { bridgeError, bridgeWarning } from './errorNotificationService';
import type { AccountState } from '@/contexts/labs/smartfolio/PortfolioContext';

const BRIDGE_URL = '/api/smartfolio';

export async function fetchAccountState(accountId: AccountId): Promise<AccountState> {
    const seed = ACCOUNTS[accountId];
    try {
        const res = await fetch(`${BRIDGE_URL}/${accountId}`);

        if (!res.ok) {
            throw new Error(`Bridge returned ${res.status}: ${res.statusText}`);
        }

        // Check if response is actually JSON before parsing
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error(`Bridge returned ${contentType} instead of JSON - check server routes`);
        }

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
        const errorMsg = e instanceof Error ? e.message : String(e);
        bridgeWarning(
            `Bridge sync failed for ${accountId}`,
            errorMsg
        );

        // Fallback to local storage
        return {
            assets: loadFromStorage<Asset[]>(storageKey(accountId, 'assets'), seed.assets),
            journal: loadFromStorage<JournalEntry[]>(storageKey(accountId, 'journal'), seed.journal || []),
            pendingOrders: loadFromStorage<Order[]>(storageKey(accountId, 'orders'), seed.pendingOrders),
            recycledToSui: loadFromStorage<number>(storageKey(accountId, 'recycled'), seed.recycledToSui || 0),
            targetValue: loadFromStorage<number>(storageKey(accountId, 'target'), seed.targetValue || 0),
        };
    }
}

export async function saveAccountStateToBridge(accountId: AccountId, assets: Asset[], journal: JournalEntry[]) {
    try {
        await fetch(`${BRIDGE_URL}/${accountId}/sync`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
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
        const errorMsg = e instanceof Error ? e.message : String(e);
        bridgeError(
            'Failed to save portfolio to bridge',
            errorMsg,
            'Portfolio sync failed. Changes saved locally but may not persist across devices.'
        );
    }
}
