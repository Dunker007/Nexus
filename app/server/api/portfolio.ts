import { Router } from 'express';
import { db } from '../db.js';

export const portfolioRouter = Router();

// ─── DB helpers ───────────────────────────────────────────────────────────────
const getSyncRow = (accountId: string) => {
  const row = db.prepare('SELECT * FROM portfolio_sync WHERE account_id = ?').get(accountId) as any;
  if (!row) return null;
  return {
    positions: JSON.parse(row.positions),
    journal: JSON.parse(row.journal),
    pendingOrders: [],
    lastSync: row.last_sync,
  };
};

// Portfolio summary for dashboard widget
portfolioRouter.get('/summary', (_req, res) => {
  try {
    const suiData = getSyncRow('sui');
    const altsData = getSyncRow('alts');

    // Calculate totals from both accounts
    const calculateTotal = (data: any) => {
      if (!data || !data.positions) return 0;
      return data.positions.reduce((sum: number, p: any) => {
        const value = p.symbol === 'USD' ? p.units : (p.units * (p.currentPrice || 0));
        return sum + value;
      }, 0);
    };

    const calculateCash = (data: any) => {
      if (!data || !data.positions) return 0;
      const usd = data.positions.find((p: any) => p.symbol === 'USD');
      return usd ? usd.units : 0;
    };

    const suiTotal = calculateTotal(suiData);
    const altsTotal = calculateTotal(altsData);
    const totalValue = suiTotal + altsTotal;

    const suiCash = calculateCash(suiData);
    const altsCash = calculateCash(altsData);
    const cashBalance = suiCash + altsCash;

    const safetyNetPercent = totalValue > 0 ? (cashBalance / totalValue) * 100 : 0;

    // Get active account from latest sync
    const lastSuiSync = suiData?.lastSync ? new Date(suiData.lastSync).getTime() : 0;
    const lastAltsSync = altsData?.lastSync ? new Date(altsData.lastSync).getTime() : 0;
    const activeAccount = lastSuiSync > lastAltsSync ? 'sui' : 'alts';

    const lastSync = suiData?.lastSync || altsData?.lastSync || null;

    res.json({
      totalValue,
      cashBalance,
      safetyNetPercent,
      isSafetyNetCritical: safetyNetPercent < 5,
      activeAccount,
      lastSync,
      isLive: false // Will be true when live price updates are enabled
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Account details
portfolioRouter.get('/accounts', (_req, res) => {
  try {
    const accounts = db.prepare('SELECT * FROM portfolio_accounts').all() as any[];
    const allPositions = db.prepare('SELECT * FROM portfolio_positions').all() as any[];
    res.json({ accounts, positions: allPositions });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Retrieve specific account data (Bridge)
portfolioRouter.get('/:accountId', (req, res) => {
  const { accountId } = req.params;
  const data = getSyncRow(accountId.toLowerCase());
  res.json(data || { positions: [], journal: [], pendingOrders: [] });
});

// Sync account data from local agent (Bridge)
portfolioRouter.post('/:accountId/sync', (req, res) => {
  const { accountId } = req.params;
  const { assets, journal } = req.body;

  db.prepare(`
    INSERT INTO portfolio_sync (account_id, positions, journal, last_sync)
    VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(account_id) DO UPDATE SET
      positions  = excluded.positions,
      journal    = excluded.journal,
      last_sync  = excluded.last_sync
  `).run(accountId.toLowerCase(), JSON.stringify(assets || []), JSON.stringify(journal || []));

  res.json({ success: true });
});
