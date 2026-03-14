import { Router } from 'express';
import { db } from '../db.js';
import { verifyToken } from '../auth.js';

export const portfolioRouter = Router();

// ─── Resolve user from cookie (optional — falls back to 'default') ────────────
const getUserId = (req: any): string => {
  const token = req.cookies?.nexus_token;
  if (!token) return 'default';
  const user = verifyToken(token);
  return user?.id || 'default';
};

// ─── DB helpers ───────────────────────────────────────────────────────────────
const getSyncRow = (userId: string, accountId: string) => {
  const row = db.prepare('SELECT * FROM portfolio_sync WHERE user_id = ? AND account_id = ?').get(userId, accountId) as any;
  // Fall back to 'default' user rows for backwards compat
  const fallback = userId !== 'default'
    ? db.prepare('SELECT * FROM portfolio_sync WHERE user_id = ? AND account_id = ?').get('default', accountId) as any
    : null;
  const r = row || fallback;
  if (!r) return null;
  return {
    positions: JSON.parse(r.positions),
    journal: JSON.parse(r.journal),
    pendingOrders: [],
    lastSync: r.last_sync,
  };
};

// Portfolio summary for dashboard widget
portfolioRouter.get('/summary', (req, res) => {
  try {
    const userId = getUserId(req);
    const suiData = getSyncRow(userId, 'sui');
    const altsData = getSyncRow(userId, 'alts');

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
  const userId = getUserId(req);
  const data = getSyncRow(userId, accountId.toLowerCase());
  res.json(data || { positions: [], journal: [], pendingOrders: [] });
});

// Sync account data from local agent (Bridge)
portfolioRouter.post('/:accountId/sync', (req, res) => {
  const { accountId } = req.params;
  const { assets, journal } = req.body;
  const userId = getUserId(req);

  db.prepare(`
    INSERT INTO portfolio_sync (user_id, account_id, positions, journal, last_sync)
    VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(account_id) DO UPDATE SET
      user_id    = excluded.user_id,
      positions  = excluded.positions,
      journal    = excluded.journal,
      last_sync  = excluded.last_sync
  `).run(userId, accountId.toLowerCase(), JSON.stringify(assets || []), JSON.stringify(journal || []));

  res.json({ success: true });
});
