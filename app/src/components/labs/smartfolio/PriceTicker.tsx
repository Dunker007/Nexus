"use client";
import { usePortfolio } from '@/contexts/labs/smartfolio/PortfolioContext';

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 4 });

export default function PriceTicker() {
    const { assets, pendingOrders } = usePortfolio();

    const coins = assets.filter(a => a.symbol !== 'USD');
    const cashPercent = ((assets.find(a => a.symbol === 'USD')?.currentValue || 0) / assets.reduce((s, a) => s + a.currentValue, 0) * 100);
    const totalValue = assets.reduce((s, a) => s + a.currentValue, 0);

    const items = coins.map(a => ({
        symbol: a.symbol,
        price: a.currentPrice,
        change: ((a.currentPrice - (a.avgCost || a.currentPrice)) / (a.avgCost || a.currentPrice)) * 100,
        allocation: a.allocation,
    }));

    // Add key stats as "ticker items"
    const stats = [
        { symbol: 'CASH', price: cashPercent, isPercent: true, color: cashPercent < 15 ? 'text-rose-400' : 'text-amber-400' },
        { symbol: 'TOTAL', price: totalValue, isCurrency: true },
        { symbol: 'ORDERS', price: pendingOrders.length, isCount: true },
    ];

    return (
        <div className="w-full bg-white/[0.02] border-y border-white/5 py-0.5 overflow-hidden flex items-center">
            <div className="flex animate-infinite-scroll gap-12 whitespace-nowrap px-6">
                {[...items, ...items].map((p, i) => (
                    <div key={`coin-${i}`} className="flex items-center gap-3">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{p.symbol}</span>
                        <span className="text-xs font-mono font-bold text-white">${p.price.toFixed(4)}</span>
                        <span className={`text-[10px] font-mono ${p.change >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {p.change >= 0 ? '▲' : '▼'} {Math.abs(p.change).toFixed(2)}%
                        </span>
                        <span className="text-[9px] font-mono text-gray-600">{p.allocation.toFixed(1)}%</span>
                    </div>
                ))}
                
                {stats.map((s, i) => (
                    <div key={`stat-${i}`} className="flex items-center gap-3">
                        <span className={`text-[10px] font-black uppercase tracking-widest ${s.color || 'text-gray-400'}`}>
                            {s.symbol === 'CASH' ? '💰 ' : s.symbol === 'TOTAL' ? '📊 ' : '📋 '}{s.symbol}
                        </span>
                        <span className="text-xs font-mono font-bold text-white">
                            {s.isCurrency ? currency.format(s.price) : s.isPercent ? `${s.price.toFixed(1)}%` : `${s.price} pending`}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
