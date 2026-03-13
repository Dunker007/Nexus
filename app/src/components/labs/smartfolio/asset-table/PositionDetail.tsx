import { useState } from 'react';
import { currency, fmtPercent, type PositionDetailProps } from '@/config/smartfolioConfig';
import CoinResearch from '../CoinResearch';
import { StatRow } from './StatRow';
import { AlertsSection } from './AlertsSection';
import { AssetAnalyst } from './AssetAnalyst';

export function PositionDetail({ asset, orders, fillOrder, killOrder, addOrder, currentCashPercent, activeAccount, alerts, onRefreshAlerts }: PositionDetailProps) {
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
