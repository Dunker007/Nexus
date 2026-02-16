"use client";
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { usePortfolio } from '@/context/labs/smartfolio/PortfolioContext';
import { LOGO_MAPPING } from '@/lib/labs/smartfolio/store/portfolio';
import { TRADE_FEE_PERCENT } from '@/lib/labs/smartfolio/store/strategy';
import { hasGeminiKey, analyzePortfolio, PortfolioSnapshot } from '@/lib/labs/smartfolio/geminiService';
import { getAlerts, addAlert, removeAlert, toggleAlert, type PriceAlert } from '@/lib/labs/smartfolio/alertEngine';
import CoinResearch from './CoinResearch';

// ─── Constants & Helpers ───
const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const fmtPercent = (n: number) => n.toFixed(2) + '%';

const PERSONAS = {
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

// ─── Interfaces ───
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
    addOrder: (order: any) => void;
    currentCashPercent: number;
    activeAccount: string;
    alerts: PriceAlert[];
    onRefreshAlerts: () => void;
}

// ─── Sub-components ───

function StatRow({ label, value, color }: { label: string; value: string; color?: string }) {
    return (
        <div className="flex justify-between items-center">
            <span className="text-[9px] text-gray-600 uppercase tracking-wider">{label}</span>
            <span className={`text-xs font-mono font-bold ${color || 'text-white'}`}>{value}</span>
        </div>
    );
}

function AlertsSection({ asset, alerts, onRefresh }: { asset: any, alerts: PriceAlert[], onRefresh: () => void }) {
    const [showForm, setShowForm] = useState(false);
    const [price, setPrice] = useState('');
    const [condition, setCondition] = useState<'above' | 'below'>('above');

    const handleAdd = () => {
        if (!price) return;
        addAlert(asset.symbol, condition, parseFloat(price), 'Manual Alert');
        setPrice('');
        setShowForm(false);
        onRefresh();
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-3">
                <h4 className="text-[10px] font-black text-amber-400 uppercase tracking-[0.2em]">Price Alerts ({alerts.length})</h4>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="px-2 py-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 rounded text-[8px] uppercase tracking-widest text-amber-400 transition-colors"
                >
                    + Add Alert
                </button>
            </div>

            {showForm && (
                <div className="mb-4 p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl space-y-2 animate-fade-in">
                    <div className="flex gap-2">
                        <select
                            value={condition} onChange={e => setCondition(e.target.value as any)}
                            className="bg-black/20 border border-white/10 rounded px-2 py-1 text-[10px] text-white outline-none"
                        >
                            <option value="above">Above ↑</option>
                            <option value="below">Below ↓</option>
                        </select>
                        <input
                            type="number" placeholder="Price"
                            value={price} onChange={e => setPrice(e.target.value)}
                            className="flex-1 bg-black/20 border border-white/10 rounded px-2 py-1 text-[10px] text-white"
                        />
                    </div>
                    <button onClick={handleAdd} className="w-full py-1 bg-amber-600 hover:bg-amber-500 text-white text-[9px] font-black uppercase tracking-widest rounded">
                        Set Alert
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {alerts.map(alert => (
                    <div key={alert.id} className="p-2 rounded-lg bg-white/[0.03] border border-white/5 flex items-center justify-between group">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px]">{alert.condition === 'above' ? '📈' : '📉'}</span>
                            <div className="flex flex-col">
                                <span className={`text-[9px] font-bold ${alert.condition === 'above' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {alert.condition === 'above' ? '>' : '<'} {currency.format(alert.price)}
                                </span>
                                <span className="text-[8px] text-gray-500 uppercase tracking-wider">{alert.active ? 'Active' : 'Paused'}</span>
                            </div>
                        </div>
                        <button onClick={() => { removeAlert(alert.id); onRefresh(); }} className="text-gray-600 hover:text-rose-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                    </div>
                ))}
                {alerts.length === 0 && !showForm && (
                    <div className="p-2 text-center text-[9px] text-gray-600 italic border border-dashed border-white/5 rounded-lg">No alerts set</div>
                )}
            </div>
        </div>
    );
}

function AssetAnalyst({ symbol, asset, activeAccount, currentCashPercent }: {
    symbol: string;
    asset: PositionDetailProps['asset'];
    activeAccount: 'sui' | 'alts';
    currentCashPercent: number;
}) {
    const { activeStrategy, assets, pendingOrders, marketCondition } = usePortfolio();
    const [query, setQuery] = useState('');
    const [messages, setMessages] = useState<{ role: 'ai' | 'user'; text: string; timestamp?: string }[]>([]);
    const [typing, setTyping] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    const persona = PERSONAS[activeAccount] || PERSONAS.sui;

    const buildPositionSnapshot = useCallback((): PortfolioSnapshot => {
        const totalValue = assets.reduce((s, a) => s + a.currentValue, 0);
        return {
            accountName: activeAccount === 'sui' ? 'SUI Account' : 'Alts Account',
            strategyName: activeStrategy.name,
            targetMask: activeStrategy.targetMask,
            marketRegime: marketCondition || 'unknown',
            totalValue,
            cashPercent: currentCashPercent,
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
    }, [activeAccount, activeStrategy, assets, pendingOrders, marketCondition, currentCashPercent]);

    // INITIAL ANALYSIS - Runs once on mount or when symbol changes
    // Removed excessive deps to prevent re-renders on price updates
    useEffect(() => {
        setTyping(true);
        const snapshot = buildPositionSnapshot();
        analyzePortfolio(snapshot, persona.persona,
            `Give a status report on ${symbol}. Price $${asset.currentPrice}, PnL $${(asset.gainLoss || 0).toFixed(2)}. Allocation ${asset.allocation.toFixed(1)}% (Target ${asset.targetAllocation.toFixed(1)}%). Cash ${currentCashPercent.toFixed(0)}%. Is this position healthy? Keep it brief.`
        ).then(response => {
            setMessages([{ role: 'ai', text: response.text, timestamp: 'Now' }]);
            setTyping(false);
        }).catch(() => {
            setMessages([{ role: 'ai', text: `${persona.name} here. Monitoring ${symbol}. Standing by for queries.`, timestamp: 'Now' }]);
            setTyping(false);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [symbol]); // ONLY re-run when symbol changes

    const handleSend = useCallback(async () => {
        if (!query.trim()) return;
        const q = query.trim();
        setQuery('');
        setMessages(prev => [...prev, { role: 'user', text: q, timestamp: 'Now' }]);
        setTyping(true);

        try {
            const snapshot = buildPositionSnapshot();
            const response = await analyzePortfolio(snapshot, persona.persona,
                `User asks regarding ${symbol}: "${q}".\n\nContext: ${symbol} Price $${asset.currentPrice}, PnL $${(asset.gainLoss || 0).toFixed(2)}, Alloc ${asset.allocation.toFixed(1)}%.`
            );
            setMessages(prev => [...prev, { role: 'ai', text: response.text, timestamp: 'Now' }]);
        } catch {
            setMessages(prev => [...prev, { role: 'ai', text: "⚠️ Connection unstable. Unable to reach HQ.", timestamp: 'Now' }]);
        }
        setTyping(false);
    }, [query, symbol, asset, persona, buildPositionSnapshot]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className={`flex flex-col h-full rounded-2xl overflow-hidden border ${persona.border} bg-black/20 relative group`}>
            <div className={`px-4 py-3 flex justify-between items-center bg-white/[0.02] border-b ${persona.border}`}>
                <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg ${persona.bg} border ${persona.border} flex items-center justify-center text-lg shadow-sm`}>
                        {persona.icon}
                    </div>
                    <div className="flex flex-col">
                        <span className={`text-[10px] font-black uppercase tracking-widest ${persona.color}`}>{persona.name}</span>
                        <span className="text-[8px] text-gray-500 font-mono">Analyzing {symbol}</span>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest">Live</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar min-h-[250px] max-h-[400px]">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                        <div className={`max-w-[90%] rounded-xl px-3 py-2 text-[10px] leading-relaxed relative shadow-sm ${msg.role === 'user'
                            ? 'bg-blue-600/20 text-blue-100 border border-blue-500/20 rounded-br-none'
                            : `bg-[#1a1a1a] text-gray-300 border ${persona.border} rounded-bl-none`
                            }`}>
                            {msg.role === 'ai' && (
                                <div className={`absolute -left-2 -top-2 w-4 h-4 rounded-md ${persona.bg} border ${persona.border} flex items-center justify-center text-[8px] shadow-sm`}>
                                    {persona.icon}
                                </div>
                            )}
                            <div className="whitespace-pre-wrap">{msg.text}</div>
                        </div>
                    </div>
                ))}
                {typing && (
                    <div className="flex justify-start pl-2">
                        <div className="px-3 py-2 rounded-xl bg-white/5 border border-white/5 flex gap-1 items-center">
                            <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                            <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce"></div>
                        </div>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            <div className="p-3 bg-white/[0.01] border-t border-white/5">
                <div className="flex gap-2 items-center bg-black/40 border border-white/10 rounded-xl px-2 py-1 transition-all focus-within:border-blue-500/50 focus-within:shadow-lg focus-within:shadow-blue-500/10">
                    <input
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                        placeholder={`Ask ${persona.name} about ${symbol}...`}
                        className="flex-1 bg-transparent px-2 py-1.5 text-[10px] text-white placeholder-gray-600 outline-none font-medium"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!query.trim() || typing}
                        className={`p-1.5 rounded-lg transition-all ${query.trim() && !typing ? 'text-blue-400 hover:bg-blue-500/10' : 'text-gray-700'}`}
                    >
                        ➤
                    </button>
                </div>
            </div>
        </div>
    );
}

function PositionDetail({ asset, orders, fillOrder, killOrder, addOrder, currentCashPercent, activeAccount, alerts, onRefreshAlerts }: PositionDetailProps) {
    const buys = orders.filter(o => o.type === 'buy');
    const sells = orders.filter(o => o.type === 'sell');
    const [tab, setTab] = useState<'position' | 'research'>('position');
    const [showOrderForm, setShowOrderForm] = useState(false);
    const [newOrder, setNewOrder] = useState({ type: 'buy', units: 0, price: asset.currentPrice, note: '' });

    const handleAddOrder = () => {
        if (newOrder.units <= 0 || newOrder.price <= 0) return;
        addOrder({
            type: newOrder.type,
            symbol: asset.symbol,
            units: Number(newOrder.units),
            price: Number(newOrder.price),
            note: newOrder.note || 'Manual Entry'
        });
        setShowOrderForm(false);
        setNewOrder({ type: 'buy', units: 0, price: asset.currentPrice, note: '' });
    };

    return (
        <div className="bg-gradient-to-b from-blue-900/10 to-transparent border-t border-blue-500/10 animate-fade-in-up">
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
                <div className="lg:col-span-8 p-6">
                    {tab === 'position' ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                                        Active Orders ({orders.length})
                                    </h4>
                                    <div className="flex items-center gap-3 text-[9px] font-mono">
                                        {buys.length > 0 && <span className="text-emerald-400">{buys.length} buy{buys.length > 1 ? 's' : ''}</span>}
                                        {sells.length > 0 && <span className="text-rose-400">{sells.length} sell{sells.length > 1 ? 's' : ''}</span>}
                                        <button
                                            onClick={() => setShowOrderForm(!showOrderForm)}
                                            className="ml-2 px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/5 rounded text-[8px] uppercase tracking-widest text-blue-400 transition-colors"
                                        >
                                            + New
                                        </button>
                                    </div>
                                </div>
                                {showOrderForm && (
                                    <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/10 mb-2 animate-fade-in-up">
                                        <div className="grid grid-cols-2 gap-2 mb-2">
                                            <button onClick={() => setNewOrder({ ...newOrder, type: 'buy' })} className={`py-1 text-[9px] font-black uppercase tracking-widest rounded ${newOrder.type === 'buy' ? 'bg-emerald-500 text-white' : 'bg-white/5 text-gray-500'}`}>Buy</button>
                                            <button onClick={() => setNewOrder({ ...newOrder, type: 'sell' })} className={`py-1 text-[9px] font-black uppercase tracking-widest rounded ${newOrder.type === 'sell' ? 'bg-rose-500 text-white' : 'bg-white/5 text-gray-500'}`}>Sell</button>
                                        </div>
                                        <div className="flex gap-2 mb-2">
                                            <input type="number" placeholder="Units" className="w-1/2 bg-black/20 border border-white/10 rounded px-2 py-1 text-[10px] text-white"
                                                value={newOrder.units || ''} onChange={e => setNewOrder({ ...newOrder, units: parseFloat(e.target.value) })} />
                                            <input type="number" placeholder="Price" className="w-1/2 bg-black/20 border border-white/10 rounded px-2 py-1 text-[10px] text-white"
                                                value={newOrder.price || ''} onChange={e => setNewOrder({ ...newOrder, price: parseFloat(e.target.value) })} />
                                        </div>
                                        <input type="text" placeholder="Note (optional)" className="w-full bg-black/20 border border-white/10 rounded px-2 py-1 text-[10px] text-white mb-2"
                                            value={newOrder.note} onChange={e => setNewOrder({ ...newOrder, note: e.target.value })} />
                                        <button onClick={handleAddOrder} className="w-full py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[9px] font-black uppercase tracking-widest rounded transition-all">
                                            Stage Order
                                        </button>
                                    </div>
                                )}
                                {orders.length === 0 ? (
                                    <div className="text-center py-8">
                                        <p className="text-gray-600 text-xs font-mono">No active orders</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2 max-h-[280px] overflow-y-auto custom-scrollbar">
                                        {orders.map(order => {
                                            const isBuy = order.type === 'buy';
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
                                                            <button onClick={() => fillOrder(order.id)} className="px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500 text-blue-400 hover:text-white text-[9px] font-black uppercase transition-all border border-blue-500/20">Fill</button>
                                                            <button onClick={() => killOrder(order.id)} className="px-2.5 py-1 rounded-lg bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white text-[9px] font-black uppercase transition-all border border-red-500/20">Kill</button>
                                                        </div>
                                                    </div>
                                                    <div className="mt-1.5 text-[9px] text-gray-600 italic">&ldquo;{order.note}&rdquo;</div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                            <div className="space-y-4 pt-4 border-t border-white/5 col-span-1 lg:col-span-2">
                                <AlertsSection asset={asset} alerts={alerts} onRefresh={onRefreshAlerts} />
                            </div>
                        </div>
                    ) : (
                        <CoinResearch symbol={asset.symbol} />
                    )}
                </div>

                <div className="lg:col-span-4 p-6">
                    <AssetAnalyst symbol={asset.symbol} asset={asset} activeAccount={activeAccount as 'sui' | 'alts'} currentCashPercent={currentCashPercent} />
                </div>
            </div>
        </div>
    );
}

// ─── Main Component ───

export default function AssetTable() {
    const { assets, pendingOrders, fillOrder, killOrder, activeAccount, activeStrategy, fearGreed } = usePortfolio();
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
