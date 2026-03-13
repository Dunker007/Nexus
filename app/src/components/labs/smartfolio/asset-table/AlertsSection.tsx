import { useState } from 'react';
import { addAlert, removeAlert, type PriceAlert } from '@/lib/smartfolio/alertEngine';
import { currency } from '@/config/smartfolioConfig';

export function AlertsSection({ asset, alerts, onRefresh }: { asset: any, alerts: PriceAlert[], onRefresh: () => void }) {
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
