import React, { useState, useCallback, useEffect } from 'react';
import { usePortfolio } from '@/contexts/labs/smartfolio/PortfolioContext';
import { TRADE_FEE_PERCENT } from '@/lib/smartfolio/store/strategy';
import { LOGO_MAPPING } from '@/lib/smartfolio/store/portfolio';
import { getAlerts, type PriceAlert } from '@/lib/smartfolio/alertEngine';
import { currency, fmtPercent } from '@/config/smartfolioConfig';
import { PositionDetail } from './asset-table/PositionDetail';



// ─── Main Component ───

export default function AssetTable() {
    const { assets, pendingOrders, fillOrder, killOrder, activeAccount, fearGreed } = usePortfolio();
    const [expandedSymbol, setExpandedSymbol] = useState<string | null>(null);
    const [alerts, setAlerts] = useState<PriceAlert[]>([]);
    const refreshAlerts = useCallback(() => setAlerts(getAlerts()), []);

    const getStrategyBadge = (symbol: string) => {
        if (symbol === 'USD') return { label: 'Safety Net', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
        if (activeAccount === 'sui' && symbol === 'SUI') return { label: 'Anchor / King', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' };
        return { label: 'Balanced Alt', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' };
    };

    const sortedAssets = [...assets].sort((a, b) => b.currentValue - a.currentValue);
    const isLoading = assets.length === 0;


    useEffect(() => {
        refreshAlerts();
        const interval = setInterval(refreshAlerts, 5000);
        return () => clearInterval(interval);
    }, [refreshAlerts]);

    if (isLoading) {
        return (
            <div className="w-full h-full flex items-center justify-center p-12 bg-[#0b0e11]/50 backdrop-blur-xl rounded-2xl border border-white/5">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-full border-2 border-t-blue-500 border-r-transparent border-b-blue-500/30 border-l-transparent animate-spin"></div>
                    <p className="text-xs font-mono text-blue-400 uppercase tracking-widest animate-pulse">Syncing Strategy...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full flex flex-col bg-[#0b0e11]/60 backdrop-blur-xl rounded-2xl border border-white/5 overflow-hidden shadow-2xl shadow-black/50">
            <div className="px-6 py-3 border-b border-white/5 flex justify-between items-center bg-white/[0.02] backdrop-blur-md">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)] animate-pulse"></div>
                        <h3 className="text-xs font-black text-gray-200 uppercase tracking-[0.2em]">{activeAccount === 'sui' ? 'SUI Anchor' : 'Altcoin Tactics'}</h3>
                    </div>
                    <div className="hidden md:flex items-center gap-4 pl-6 border-l border-white/5">
                        <div className="flex flex-col">
                            <span className="text-[8px] text-gray-500 uppercase tracking-wider">Fee</span>
                            <span className="text-[10px] font-mono font-bold text-gray-300">{TRADE_FEE_PERCENT}%</span>
                        </div>
                        {fearGreed && (
                            <div className="flex flex-col">
                                <span className="text-[8px] text-gray-500 uppercase tracking-wider">Sentiment</span>
                                <span className={`text-[10px] font-mono font-bold ${fearGreed.value > 75 ? 'text-emerald-400' : fearGreed.value < 25 ? 'text-rose-400' : 'text-gray-300'}`}>
                                    {fearGreed.value} <span className="text-[8px] opacity-60">/ 100</span>
                                </span>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded border border-white/5">
                        <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                        <span className="text-[9px] text-gray-400 font-mono">{assets.length} Active Positions</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white/[0.01] border-b border-white/5">
                            <th className="p-4 pl-6 text-[9px] font-black text-gray-500 uppercase tracking-[0.1em]">Asset / Role</th>
                            <th className="p-4 text-[9px] font-black text-gray-500 uppercase tracking-[0.1em] text-right">Holdings</th>
                            <th className="p-4 text-[9px] font-black text-gray-500 uppercase tracking-[0.1em] text-right hidden md:table-cell">Basis</th>
                            <th className="p-4 text-[9px] font-black text-gray-500 uppercase tracking-[0.1em] text-right">Price</th>
                            <th className="p-4 text-[9px] font-black text-gray-500 uppercase tracking-[0.1em] text-right">PnL</th>
                            <th className="p-4 pr-6 text-[9px] font-black text-gray-500 uppercase tracking-[0.1em] text-right">Alloc vs Target</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {sortedAssets.map((asset) => {
                            const logoUrl = asset.logo || LOGO_MAPPING[asset.symbol];
                            const badge = getStrategyBadge(asset.symbol);
                            const isAnchor = activeAccount === 'sui' && asset.symbol === 'SUI';
                            const pnlPercent = asset.totalCost && asset.totalCost > 0 ? ((asset.gainLoss || 0) / asset.totalCost) * 100 : 0;
                            const isExpanded = expandedSymbol === asset.symbol;
                            const symbolOrders = pendingOrders.filter(o => o.symbol === asset.symbol);
                            const isClickable = asset.symbol !== 'USD';

                            return (
                                <React.Fragment key={asset.symbol}>
                                    <tr
                                        onClick={() => isClickable && setExpandedSymbol(isExpanded ? null : asset.symbol)}
                                        className={`group transition-all duration-200 
                                            ${isClickable ? 'cursor-pointer hover:bg-white/[0.03]' : ''} 
                                            ${isExpanded ? 'bg-white/[0.04] border-l-2 border-l-blue-500' : 'border-l-2 border-l-transparent'}
                                            ${isAnchor ? 'bg-blue-500/[0.02]' : ''}
                                        `}
                                    >
                                        <td className="p-4 pl-6">
                                            <div className="flex items-center gap-4">
                                                <div className="relative">
                                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden bg-[#0F1216] border border-white/10 group-hover:border-white/20 group-hover:scale-105 transition-all shadow-lg ${isAnchor ? 'shadow-blue-500/10 ring-1 ring-blue-500/20' : ''}`}>
                                                        {logoUrl ? (
                                                            <img src={logoUrl} alt={asset.symbol} className="w-5 h-5 object-contain filter brightness-110" />
                                                        ) : (
                                                            <span className="text-[10px] font-bold text-gray-400">{asset.symbol[0]}</span>
                                                        )}
                                                    </div>
                                                    {symbolOrders.length > 0 && (
                                                        <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-blue-500 rounded-md border border-[#0b0e11] flex items-center justify-center shadow-lg">
                                                            <span className="text-[8px] font-bold text-white">{symbolOrders.length}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-sm font-black tracking-tight ${isAnchor ? 'text-blue-100' : 'text-gray-200 group-hover:text-white'}`}>{asset.symbol}</span>
                                                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-tighter ${badge.color}`}>{badge.label}</span>
                                                    </div>
                                                    <span className="text-[9px] text-gray-500 font-medium uppercase tracking-tight truncate max-w-[120px]">{asset.name}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex flex-col items-end">
                                                <span className="text-xs font-bold font-mono text-gray-300">{asset.units.toLocaleString()}</span>
                                                <span className="text-[9px] text-gray-600 font-mono">{currency.format(asset.currentValue)}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-right hidden md:table-cell">
                                            <div className="flex flex-col items-end">
                                                <span className="text-xs font-mono text-gray-400">{asset.avgCost ? currency.format(asset.avgCost) : '—'}</span>
                                                <span className="text-[9px] text-gray-700 font-mono">Avg</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex flex-col items-end">
                                                <span className="text-xs font-mono font-bold text-blue-400 group-hover:text-blue-300 transition-colors">{currency.format(asset.currentPrice)}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex flex-col items-end">
                                                <span className={`text-xs font-mono font-black ${(asset.gainLoss || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                    {(asset.gainLoss || 0) >= 0 ? '+' : ''}{currency.format(asset.gainLoss || 0)}
                                                </span>
                                                <span className={`text-[9px] font-mono font-bold ${(asset.gainLoss || 0) >= 0 ? 'text-emerald-500/70' : 'text-rose-500/70'}`}>
                                                    {pnlPercent > 0 ? '+' : ''}{pnlPercent.toFixed(1)}%
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4 pr-6 text-right w-[140px]">
                                            <div className="flex flex-col items-end w-full">
                                                <div className="flex justify-between w-full mb-1">
                                                    <span className="text-[9px] text-gray-600 font-mono">Goal {fmtPercent(asset.targetAllocation)}</span>
                                                    <span className="text-xs font-black text-gray-200">{fmtPercent(asset.allocation)}</span>
                                                </div>
                                                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden relative">
                                                    <div
                                                        className={`h-full rounded-full ${isAnchor ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'bg-gray-500'}`}
                                                        style={{ width: `${Math.min(asset.allocation, 100)}%` }}
                                                    ></div>
                                                    <div className="absolute top-0 h-full w-0.5 bg-white shadow-[0_0_4px_white] z-10" style={{ left: `${Math.min(asset.targetAllocation, 100)}%` }}></div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                    {isExpanded && (
                                        <tr>
                                            <td colSpan={6} className="p-0 border-b border-white/5">
                                                <PositionDetail
                                                    asset={asset}
                                                    orders={symbolOrders}
                                                    fillOrder={fillOrder}
                                                    killOrder={killOrder}
                                                    addOrder={usePortfolio().addOrder}
                                                    currentCashPercent={(assets.find(a => a.symbol === 'USD')?.allocation || 0)}
                                                    activeAccount={activeAccount}
                                                    alerts={alerts.filter(a => a.symbol === asset.symbol)}
                                                    onRefreshAlerts={refreshAlerts}
                                                />
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            <div className="px-6 py-2 border-t border-white/5 bg-white/[0.01] flex justify-between items-center">
                <div className="flex gap-4">
                    <span className="text-[9px] text-gray-600 flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-white rounded-full"></span> Target</span>
                    <span className="text-[9px] text-gray-600 flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-gray-500 rounded-full"></span> Actual</span>
                </div>
                <span className="text-[9px] text-gray-700 italic">Data refreshes every 30s</span>
            </div>
        </div>
    );
}

// ─── AI Helper Fallbacks ───
// These are available for grounding or future logic expansion
/*
function generateInitialBrief(symbol: string, asset: any, account: string, cashPercent: number): string { ... }
function generatePositionResponse(q: string, symbol: string, asset: any, account: string, cashPercent: number): string { ... }
*/
