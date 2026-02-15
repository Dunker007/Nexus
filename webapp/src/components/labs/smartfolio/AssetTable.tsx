"use client";
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { usePortfolio } from '@/context/labs/smartfolio/PortfolioContext';
import { LOGO_MAPPING } from '@/lib/labs/smartfolio/store/portfolio';
import { TRADE_FEE_PERCENT } from '@/lib/labs/smartfolio/store/strategy';
import { hasGeminiKey, analyzePortfolio, PortfolioSnapshot } from '@/lib/labs/smartfolio/geminiService';
import CoinResearch from './CoinResearch';

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const fmtPercent = (n: number) => n.toFixed(2) + '%';

export default function AssetTable() {
    const { assets, pendingOrders, fillOrder, killOrder, activeAccount, activeStrategy } = usePortfolio();
    const [expandedSymbol, setExpandedSymbol] = useState<string | null>(null);

    const getStrategyBadge = (symbol: string) => {
        if (symbol === 'USD') return { label: 'Safety Net', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
        if (activeAccount === 'sui' && symbol === 'SUI') return { label: 'Anchor / King', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' };
        if (activeAccount === 'alts') return { label: 'Balanced Alt', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' };
        return { label: 'Tactical Swing', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' };
    };

    const sortedAssets = [...assets].sort((a, b) => b.currentValue - a.currentValue);


    const isLoading = assets.length === 0;

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
            <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse"></div>
                    <h3 className="text-xs font-black text-gray-200 uppercase tracking-[0.2em]">Strategy Positions</h3>
                </div>
                <div className="flex items-center gap-3">
                    <div className="hidden md:flex items-center gap-2 px-2 py-1 rounded bg-white/5 border border-white/5">
                        <span className="text-[9px] text-gray-500 uppercase tracking-widest">Fee</span>
                        <span className="text-[10px] font-mono text-amber-400 font-bold">{TRADE_FEE_PERCENT}%</span>
                    </div>
                    <span className="text-[9px] text-gray-600 font-mono hidden sm:block">Total: {assets.length} Assets</span>
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
                            const showTakeProfit = asset.symbol !== 'USD' && pnlPercent >= 25;
                            const overConcentrated = activeAccount === 'alts' && asset.symbol !== 'USD' && asset.allocation > activeStrategy.thresholds.maxConcentration;
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
                                                    {/* Target Marker */}
                                                    <div className="absolute top-0 h-full w-0.5 bg-white shadow-[0_0_4px_white] z-10" style={{ left: `${Math.min(asset.targetAllocation, 100)}%` }}></div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>

                                    {/* ═══ Expanded Detail Panel ═══ */}
                                    {isExpanded && (
                                        <tr>
                                            <td colSpan={6} className="p-0 border-b border-white/5">
                                                <PositionDetail
                                                    asset={asset}
                                                    orders={symbolOrders}
                                                    fillOrder={fillOrder}
                                                    killOrder={killOrder}
                                                    currentCashPercent={(assets.find(a => a.symbol === 'USD')?.allocation || 0)}
                                                    activeAccount={activeAccount}
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
            {/* Footer / Legend */}
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

// ═══════════════════════════════════════════════════
// POSITION DETAIL PANEL — inline expanded view
// ═══════════════════════════════════════════════════
interface PositionDetailProps {
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
    currentCashPercent: number;
    activeAccount: string;
}

function PositionDetail({ asset, orders, fillOrder, killOrder, currentCashPercent, activeAccount }: PositionDetailProps) {
    const buys = orders.filter(o => o.type === 'buy');
    const sells = orders.filter(o => o.type === 'sell');
    const [tab, setTab] = useState<'position' | 'research'>('position');

    return (
        <div className="bg-gradient-to-b from-blue-900/10 to-transparent border-t border-blue-500/10 animate-fade-in-up">
            {/* Tab Header */}
            <div className="flex items-center gap-1 px-6 pt-4 border-b border-white/5">
                <button
                    onClick={() => setTab('position')}
                    className={`text-[9px] font-black uppercase tracking-widest px-3 py-2 border-b-2 transition-all ${tab === 'position' ? 'text-white border-blue-500' : 'text-gray-600 border-transparent hover:text-gray-400'}`}
                >
                    Position
                </button>
                <button
                    onClick={() => setTab('research')}
                    className={`text-[9px] font-black uppercase tracking-widest px-3 py-2 border-b-2 transition-all ${tab === 'research' ? 'text-white border-amber-500' : 'text-gray-600 border-transparent hover:text-gray-400'}`}
                >
                    Fundamental Research
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-white/5">

                {/* ── Left: Main Content (Stats or Research) ── */}
                <div className="lg:col-span-8 p-6">
                    {tab === 'position' ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Stats Column */}
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                    Position Summary
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                                </h4>

                                <div className="space-y-3">
                                    <StatRow label="Holdings" value={`${asset.units.toLocaleString()} units`} />
                                    <StatRow label="Market Value" value={currency.format(asset.currentValue)} />
                                    <StatRow label="Avg Cost" value={asset.avgCost ? currency.format(asset.avgCost) : '—'} />
                                    <StatRow label="Total Cost" value={asset.totalCost ? currency.format(asset.totalCost) : '—'} />
                                    <StatRow
                                        label="Unrealized PnL"
                                        value={`${(asset.gainLoss || 0) >= 0 ? '+' : ''}${currency.format(asset.gainLoss || 0)}`}
                                        color={(asset.gainLoss || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}
                                    />
                                    <StatRow
                                        label="ROI"
                                        value={asset.totalCost ? `${(((asset.gainLoss || 0) / asset.totalCost) * 100).toFixed(1)}%` : '—'}
                                        color={(asset.gainLoss || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}
                                    />

                                    <div className="pt-2 border-t border-white/5">
                                        <StatRow label="Allocation" value={fmtPercent(asset.allocation)} />
                                        <StatRow label="Target" value={fmtPercent(asset.targetAllocation)} />
                                        <StatRow
                                            label="Deviation"
                                            value={`${(asset.allocation - asset.targetAllocation) >= 0 ? '+' : ''}${(asset.allocation - asset.targetAllocation).toFixed(1)}%`}
                                            color={(asset.allocation - asset.targetAllocation) > 5 ? 'text-amber-400' : 'text-gray-400'}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Orders Column (moved into this tab) */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                                        Active Orders ({orders.length})
                                    </h4>
                                    <div className="flex items-center gap-3 text-[9px] font-mono">
                                        {buys.length > 0 && <span className="text-emerald-400">{buys.length} buy{buys.length > 1 ? 's' : ''}</span>}
                                        {sells.length > 0 && <span className="text-rose-400">{sells.length} sell{sells.length > 1 ? 's' : ''}</span>}
                                    </div>
                                </div>

                                {orders.length === 0 ? (
                                    <div className="text-center py-8">
                                        <p className="text-gray-600 text-xs font-mono">No active orders</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2 max-h-[280px] overflow-y-auto custom-scrollbar">
                                        {orders.map(order => {
                                            const isBuy = order.type === 'buy';
                                            const fillValue = order.units * order.price;
                                            const fee = fillValue * (TRADE_FEE_PERCENT / 100);
                                            const net = isBuy ? fillValue + fee : fillValue - fee;
                                            const distPercent = ((order.price - asset.currentPrice) / asset.currentPrice * 100);

                                            return (
                                                <div key={order.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all group">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[9px] font-black text-white ${isBuy ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}`}>
                                                                {isBuy ? 'B' : 'S'}
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-xs font-black text-white">{order.units.toLocaleString()} units</span>
                                                                    <span className="text-[9px] font-mono text-blue-400">@ {currency.format(order.price)}</span>
                                                                    <span className={`text-[8px] px-1 py-0.5 rounded border ${distPercent > 0 ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                                                                        {distPercent >= 0 ? '+' : ''}{distPercent.toFixed(1)}%
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={() => fillOrder(order.id)}
                                                                className="px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500 text-blue-400 hover:text-white text-[9px] font-black uppercase transition-all border border-blue-500/20"
                                                            >
                                                                Fill
                                                            </button>
                                                            <button
                                                                onClick={() => killOrder(order.id)}
                                                                className="px-2.5 py-1 rounded-lg bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white text-[9px] font-black uppercase transition-all border border-red-500/20"
                                                            >
                                                                Kill
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="mt-1.5 text-[9px] text-gray-600 italic">&ldquo;{order.note}&rdquo;</div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <CoinResearch symbol={asset.symbol} />
                    )}
                </div>

                {/* ── Right: Mini AI Chat ── */}
                <div className="lg:col-span-4 p-6">
                    <MiniAIChat symbol={asset.symbol} asset={asset} activeAccount={activeAccount} currentCashPercent={currentCashPercent} />
                </div>
            </div>
        </div>
    );
}

// ─── Stat Row ───
function StatRow({ label, value, color }: { label: string; value: string; color?: string }) {
    return (
        <div className="flex justify-between items-center">
            <span className="text-[9px] text-gray-600 uppercase tracking-wider">{label}</span>
            <span className={`text-xs font-mono font-bold ${color || 'text-white'}`}>{value}</span>
        </div>
    );
}

// ═══════════════════════════════════════════════════
// MINI AI CHAT — focused on a single position
// ═══════════════════════════════════════════════════
function MiniAIChat({ symbol, asset, activeAccount, currentCashPercent }: {
    symbol: string;
    asset: PositionDetailProps['asset'];
    activeAccount: string;
    currentCashPercent: number;
}) {
    const { activeStrategy, assets, pendingOrders, marketCondition } = usePortfolio();
    const [query, setQuery] = useState('');
    const [messages, setMessages] = useState<{ role: 'ai' | 'user'; text: string }[]>([]);
    const [typing, setTyping] = useState(false);
    const [isGemini, setIsGemini] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    // Build position-focused snapshot for Gemini
    const buildPositionSnapshot = useCallback((): PortfolioSnapshot => {
        const totalValue = assets.reduce((s, a) => s + a.currentValue, 0);
        const cashAsset = assets.find(a => a.symbol === 'USD');
        const cashPct = ((cashAsset?.currentValue || 0) / totalValue * 100);
        return {
            accountName: activeAccount === 'sui' ? 'SUI Account' : 'Alts Account',
            strategyName: activeStrategy.name,
            targetMask: activeStrategy.targetMask,
            marketRegime: marketCondition || 'unknown',
            totalValue,
            cashPercent: cashPct,
            positions: assets.filter(a => a.symbol !== 'USD').map(a => ({
                symbol: a.symbol,
                units: a.units,
                avgCost: a.avgCost,
                currentPrice: a.currentPrice,
                currentValue: a.currentValue,
                allocation: a.allocation,
                targetAllocation: a.targetAllocation,
                gainLoss: a.gainLoss,
            })),
            pendingOrders: pendingOrders.map(o => ({
                type: o.type,
                symbol: o.symbol,
                units: o.units,
                price: o.price,
                note: o.note,
            })),
            strategyRules: activeStrategy.rules,
        };
    }, [activeAccount, activeStrategy, assets, pendingOrders, marketCondition]);

    // Initialize with Gemini or fallback
    useEffect(() => {
        const geminiAvailable = hasGeminiKey();
        setIsGemini(geminiAvailable);

        if (geminiAvailable) {
            setTyping(true);
            const snapshot = buildPositionSnapshot();
            const persona = activeAccount === 'sui' ? 'anchor' as const : 'tactician' as const;
            analyzePortfolio(snapshot, persona,
                `Give a 2-3 sentence brief on ${symbol}. Current price: $${asset.currentPrice}, avg cost: ${asset.avgCost ? '$' + asset.avgCost : 'unknown'}, PnL: $${(asset.gainLoss || 0).toFixed(2)}, allocation: ${asset.allocation.toFixed(1)}% (target ${asset.targetAllocation.toFixed(1)}%). Cash at ${currentCashPercent.toFixed(0)}%. Focus on actionable insight.`
            ).then(response => {
                setMessages([{ role: 'ai', text: response }]);
                setTyping(false);
            }).catch(() => {
                setMessages([{ role: 'ai', text: generateInitialBrief(symbol, asset, activeAccount, currentCashPercent) }]);
                setTyping(false);
            });
        } else {
            setMessages([{ role: 'ai', text: generateInitialBrief(symbol, asset, activeAccount, currentCashPercent) }]);
        }
    }, [symbol]);

    const handleSend = useCallback(async () => {
        if (!query.trim()) return;
        const q = query.trim();
        setQuery('');
        setMessages(prev => [...prev, { role: 'user', text: q }]);
        setTyping(true);

        if (isGemini) {
            try {
                const snapshot = buildPositionSnapshot();
                const persona = activeAccount === 'sui' ? 'anchor' as const : 'tactician' as const;
                const response = await analyzePortfolio(snapshot, persona,
                    `User asks about ${symbol}: "${q}". Focus your answer on this specific position. ${symbol} details: price $${asset.currentPrice}, cost ${asset.avgCost ? '$' + asset.avgCost : 'unknown'}, PnL $${(asset.gainLoss || 0).toFixed(2)}, allocation ${asset.allocation.toFixed(1)}% (target ${asset.targetAllocation.toFixed(1)}%). Cash: ${currentCashPercent.toFixed(0)}%. Keep under 80 words.`
                );
                setMessages(prev => [...prev, { role: 'ai', text: response }]);
            } catch {
                const fallback = generatePositionResponse(q.toLowerCase(), symbol, asset, activeAccount, currentCashPercent);
                setMessages(prev => [...prev, { role: 'ai', text: fallback }]);
            }
        } else {
            const response = generatePositionResponse(q.toLowerCase(), symbol, asset, activeAccount, currentCashPercent);
            setMessages(prev => [...prev, { role: 'ai', text: response }]);
        }

        setTyping(false);
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [query, symbol, asset, activeAccount, currentCashPercent, isGemini, buildPositionSnapshot]);

    return (
        <div className="flex flex-col h-full">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                AI on {symbol}
                <span className={`px-1.5 py-0.5 rounded border text-[8px] font-bold ${isGemini
                    ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                    : 'text-blue-400 bg-blue-500/10 border-blue-500/20'
                    }`}>{isGemini ? '🧠 GEMINI' : 'FOCUSED'}</span>
            </h4>

            <div className="flex-1 overflow-y-auto space-y-2 mb-3 custom-scrollbar max-h-[240px]">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[90%] px-2.5 py-1.5 rounded-lg text-[10px] leading-relaxed ${msg.role === 'user'
                            ? 'bg-blue-600/20 text-blue-200 border border-blue-500/20'
                            : 'bg-white/5 text-gray-300 border border-white/5'
                            }`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {typing && (
                    <div className="flex justify-start">
                        <div className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/5 flex gap-1 items-center">
                            <span className="w-1 h-1 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                            <span className="w-1 h-1 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="w-1 h-1 bg-gray-500 rounded-full animate-bounce"></span>
                        </div>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            <div className="flex gap-1.5">
                <input
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                    placeholder={`Ask about ${symbol}...`}
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-[10px] text-white placeholder-gray-600 outline-none focus:border-blue-500/50 transition-all"
                />
                <button onClick={handleSend} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[8px] font-black uppercase tracking-widest rounded-lg transition-all">
                    Ask
                </button>
            </div>
        </div>
    );
}

// ─── AI Response Generation ───

function generateInitialBrief(symbol: string, asset: PositionDetailProps['asset'], account: string, cashPercent: number): string {
    const pnl = asset.gainLoss || 0;
    const pnlDir = pnl >= 0 ? 'green' : 'red';
    const roi = asset.totalCost ? ((pnl / asset.totalCost) * 100).toFixed(1) : '0';

    if (pnl >= 0) {
        return `${symbol} is ${pnlDir} at +${currency.format(pnl)} (${roi}% ROI). ${asset.allocation.toFixed(1)}% of portfolio. ${account === 'sui' ? 'Consider profit-taking if momentum fades.' : `Watch for 30-100% profit targets. Max ${20}% concentration.`}`;
    } else {
        return `${symbol} is ${pnlDir} at ${currency.format(pnl)} (${roi}% ROI). ${asset.allocation.toFixed(1)}% of portfolio. ${Math.abs(pnl) > 300 ? 'Significant drawdown — patience or average-down dip buys.' : 'Minor drawdown — hold and monitor.'} Cash at ${cashPercent.toFixed(0)}%.`;
    }
}

function generatePositionResponse(q: string, symbol: string, asset: PositionDetailProps['asset'], account: string, cashPercent: number): string {
    const pnl = asset.gainLoss || 0;
    const roi = asset.totalCost ? ((pnl / asset.totalCost) * 100).toFixed(1) : '0';

    if (q.includes('sell') || q.includes('exit') || q.includes('trim')) {
        if (pnl > 0) return `${symbol} is +${currency.format(pnl)} (${roi}%). Taking profit here nets ${currency.format(pnl * 0.99)} after 1% fee. ${cashPercent < 20 ? 'Cash is low — selling makes sense to rebuild reserves.' : 'Cash is healthy — only sell if momentum is fading.'}`;
        return `${symbol} is in the red at ${currency.format(pnl)}. Selling now locks in the loss. Unless you need to cut risk, patience is better. Wait for recovery.`;
    }
    if (q.includes('buy') || q.includes('add') || q.includes('more') || q.includes('dip')) {
        return `Averaging down on ${symbol} would lower your cost basis from ${asset.avgCost ? currency.format(asset.avgCost) : 'unknown'}. Cash at ${cashPercent.toFixed(0)}% — ${cashPercent < 20 ? 'tight. Only add if conviction is high.' : 'healthy. A small dip buy is viable.'} Remember: 1% fee on every trade.`;
    }
    if (q.includes('target') || q.includes('price')) {
        return `Current: ${currency.format(asset.currentPrice)}, avg cost: ${asset.avgCost ? currency.format(asset.avgCost) : '—'}. ${pnl > 0 ? `Already +${roi}%. ${account === 'alts' ? 'Strategy says 30-100% profit targets.' : 'Strategy says 20-50% profit targets.'}` : `Need ${currency.format(Math.abs(pnl))} recovery to break even.`}`;
    }
    if (q.includes('risk') || q.includes('concentration')) {
        return `${symbol} is ${asset.allocation.toFixed(1)}% of portfolio (target: ${asset.targetAllocation.toFixed(1)}%). ${asset.allocation > asset.targetAllocation + 5 ? 'Over-allocated — consider trimming.' : asset.allocation < asset.targetAllocation - 5 ? 'Under-allocated — room to add.' : 'Near target — balanced.'} ${account === 'alts' ? `Max concentration rule: 20%.` : ''}`;
    }

    return `${symbol}: ${currency.format(asset.currentValue)} value, ${asset.units.toLocaleString()} units at ${currency.format(asset.currentPrice)}. PnL: ${pnl >= 0 ? '+' : ''}${currency.format(pnl)} (${roi}%). Allocation: ${asset.allocation.toFixed(1)}% vs ${asset.targetAllocation.toFixed(1)}% target. Ask about sell, buy, targets, or risk.`;
}

