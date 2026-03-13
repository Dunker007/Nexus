export const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
export const fmtPercent = (n: number) => n.toFixed(2) + '%';

export const PERSONAS = {
    sui: {
        name: 'The Anchor',
        role: 'Strategic Accumulation Manager',
        icon: '⚓',
        color: 'text-blue-400',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/20',
        gradient: 'from-blue-900/50 to-blue-600/10',
        voice: 'Disciplined. Mathematical. Obsessed with 60/40 ratio.',
        persona: 'anchor' as const,
    },
    alts: {
        name: 'The Tactician',
        role: 'High Conviction Rotator',
        icon: '⚡',
        color: 'text-purple-400',
        bg: 'bg-purple-500/10',
        border: 'border-purple-500/20',
        gradient: 'from-purple-900/50 to-purple-600/10',
        voice: 'Agile. Anti-bloat. Maximizing the High Conviction 5.',
        persona: 'tactician' as const,
    }
};

export interface PositionDetailProps {
    asset: {
        symbol: string;
        name: string;
        currentPrice: number;
        currentValue: number;
        units: number;
        avgCost: number | null;
        totalCost: number | null;
        gainLoss: number | null;
        allocation: number;
        targetAllocation: number;
    };
    orders: { id: string; symbol: string; type: string; units: number; price: number; note?: string }[];
    fillOrder: (id: string) => void;
    killOrder: (id: string) => void;
    addOrder: (order: any) => void;
    currentCashPercent: number;
    activeAccount: string;
    alerts: import('@/lib/smartfolio/alertEngine').PriceAlert[];
    onRefreshAlerts: () => void;
}
