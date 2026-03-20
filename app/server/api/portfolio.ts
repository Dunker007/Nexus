import { Router } from 'express';
import type { AuthRequest } from '../types.js';
import { getPrisma } from '../db.js';
import { requireAuth } from '../middleware/requireAuth.js';

export const portfolioRouter = Router();

// ─── DB helpers ───────────────────────────────────────────────────────────────
const getSyncRow = async (userId: string, accountId: string) => {
  const row = await getPrisma().portfolio_sync.findFirst({
    where: { user_id: userId, account_id: accountId }
  });
  if (!row) return null;
  return {
    positions: JSON.parse(row.positions),
    journal: JSON.parse(row.journal),
    pendingOrders: [],
    lastSync: row.last_sync,
  };
};

// Portfolio summary for dashboard widget
portfolioRouter.get('/summary', requireAuth, async (req, res) => {
  try {
    const userId = (req as AuthRequest).user!.id;
    const suiData = await getSyncRow(userId, 'sui');
    const altsData = await getSyncRow(userId, 'alts');

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
    const cashBalance = calculateCash(suiData) + calculateCash(altsData);
    const safetyNetPercent = totalValue > 0 ? (cashBalance / totalValue) * 100 : 0;

    const lastSuiSync = suiData?.lastSync ? new Date(suiData.lastSync).getTime() : 0;
    const lastAltsSync = altsData?.lastSync ? new Date(altsData.lastSync).getTime() : 0;
    const activeAccount = lastSuiSync > lastAltsSync ? 'sui' : 'alts';

    res.json({
      totalValue,
      cashBalance,
      safetyNetPercent,
      isSafetyNetCritical: safetyNetPercent < 5,
      activeAccount,
      lastSync: suiData?.lastSync || altsData?.lastSync || null,
      isLive: false,
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Account details
portfolioRouter.get('/accounts', requireAuth, async (_req, res) => {
  try {
    const accounts = await getPrisma().portfolio_accounts.findMany();
    const allPositions = await getPrisma().portfolio_positions.findMany();
    res.json({ accounts, positions: allPositions });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Retrieve specific account data (Bridge)
portfolioRouter.get('/:accountId', requireAuth, async (req, res) => {
  const { accountId } = req.params;
  const userId = (req as any).user.id;
  const data = await getSyncRow(userId, (accountId as string).toLowerCase());
  res.json(data || { positions: [], journal: [], pendingOrders: [] });
});

// Sync account data from local agent (Bridge)
portfolioRouter.post('/:accountId/sync', requireAuth, async (req, res) => {
  const { accountId } = req.params;
  const { assets, journal } = req.body;
  const userId = (req as any).user.id;
  const accountIdNorm = (accountId as string).toLowerCase();

  try {
    await getPrisma().portfolio_sync.upsert({
      where: { user_id_account_id: { user_id: userId, account_id: accountIdNorm } } as any,
      update: {
        positions: JSON.stringify(assets || []),
        journal: JSON.stringify(journal || []),
        last_sync: new Date(),
      },
      create: {
        account_id: accountIdNorm,
        user_id: userId,
        positions: JSON.stringify(assets || []),
        journal: JSON.stringify(journal || []),
        last_sync: new Date(),
      }
    });
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
