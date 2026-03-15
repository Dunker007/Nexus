import { Router } from 'express';
import { getPrisma } from '../db.js';
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
const getSyncRow = async (userId: string, accountId: string) => {
  let row = await getPrisma().portfolio_sync.findFirst({
    where: { user_id: userId, account_id: accountId }
  });
  
  if (!row && userId !== 'default') {
    row = await getPrisma().portfolio_sync.findFirst({
      where: { user_id: 'default', account_id: accountId }
    });
  }

  if (!row) return null;
  return {
    positions: JSON.parse(row.positions),
    journal: JSON.parse(row.journal),
    pendingOrders: [],
    lastSync: row.last_sync,
  };
};

// Portfolio summary for dashboard widget
portfolioRouter.get('/summary', async (req, res) => {
  try {
    const userId = getUserId(req);
    const suiData = await getSyncRow(userId, 'sui');
    const altsData = await getSyncRow(userId, 'alts');

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
portfolioRouter.get('/accounts', async (_req, res) => {
  try {
    const accounts = await getPrisma().portfolio_accounts.findMany();
    const allPositions = await getPrisma().portfolio_positions.findMany();
    res.json({ accounts, positions: allPositions });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Retrieve specific account data (Bridge)
portfolioRouter.get('/:accountId', async (req, res) => {
  const { accountId } = req.params;
  const userId = getUserId(req);
  const data = await getSyncRow(userId, accountId.toLowerCase());
  res.json(data || { positions: [], journal: [], pendingOrders: [] });
});

// Sync account data from local agent (Bridge)
portfolioRouter.post('/:accountId/sync', async (req, res) => {
  const { accountId } = req.params;
  const { assets, journal } = req.body;
  const userId = getUserId(req);

  try {
    await getPrisma().portfolio_sync.upsert({
      where: { account_id: accountId.toLowerCase() },
      update: {
        user_id: userId,
        positions: JSON.stringify(assets || []),
        journal: JSON.stringify(journal || []),
        last_sync: new Date()
      },
      create: {
        account_id: accountId.toLowerCase(),
        user_id: userId,
        positions: JSON.stringify(assets || []),
        journal: JSON.stringify(journal || []),
        last_sync: new Date()
      }
    });
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
