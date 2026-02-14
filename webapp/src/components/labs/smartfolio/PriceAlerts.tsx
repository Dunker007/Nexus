"use client";
import React, { useState, useEffect, useCallback } from 'react';
import {
    getAlerts,
    addAlert,
    removeAlert,
    toggleAlert,
    resetAlert,
    clearTriggered,
    requestNotificationPermission,
    type PriceAlert
} from '@/lib/labs/smartfolio/alertEngine';
import { usePortfolio } from '@/context/labs/smartfolio/PortfolioContext';

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 6 });

export default function PriceAlerts() {
    const { assets } = usePortfolio();
    const [alerts, setAlerts] = useState<PriceAlert[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [notifPermission, setNotifPermission] = useState<boolean>(false);

    // Form state
    const [formSymbol, setFormSymbol] = useState('');
    const [formCondition, setFormCondition] = useState<'above' | 'below'>('above');
    const [formPrice, setFormPrice] = useState('');
    const [formNote, setFormNote] = useState('');

    const refreshAlerts = useCallback(() => setAlerts(getAlerts()), []);

    useEffect(() => {
        refreshAlerts();
        // Check notification permission
        if (typeof window !== 'undefined' && 'Notification' in window) {
            setNotifPermission(Notification.permission === 'granted');
        }
    }, [refreshAlerts]);

    const handleAdd = () => {
        if (!formSymbol || !formPrice || isNaN(parseFloat(formPrice))) return;
        addAlert(formSymbol, formCondition, parseFloat(formPrice), formNote);
        setFormSymbol('');
        setFormPrice('');
        setFormNote('');
        setShowForm(false);
        refreshAlerts();
    };

    const handleRequestPermission = async () => {
        const granted = await requestNotificationPermission();
        setNotifPermission(granted);
    };

    const activeAlerts = alerts.filter(a => a.active && !a.triggered);
    const triggeredAlerts = alerts.filter(a => a.triggered);
    const coinSymbols = assets.filter(a => a.symbol !== 'USD').map(a => a.symbol);

    return (
        <div className="glass-card p-6 space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">🔔 Price Alerts</h3>
                    <span className="text-[8px] text-gray-600 font-mono bg-white/5 px-1.5 py-0.5 rounded border border-white/10">
                        {activeAlerts.length} active
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    {!notifPermission && (
                        <button
                            onClick={handleRequestPermission}
                            className="text-[8px] text-amber-400 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20 hover:bg-amber-500/20 transition-all"
                        >
                            Enable Notifications
                        </button>
                    )}
                    <button
                        onClick={() => setShowForm(p => !p)}
                        className="text-[9px] font-bold text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 px-3 py-1 rounded-lg border border-blue-500/20 transition-all"
                    >
                        {showForm ? '✕ Cancel' : '+ New Alert'}
                    </button>
                </div>
            </div>

            {/* New Alert Form */}
            {showForm && (
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-3 animate-fade-in-up">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        <div>
                            <label className="text-[8px] text-gray-500 uppercase tracking-widest block mb-1">Asset</label>
                            <select
                                value={formSymbol}
                                onChange={e => setFormSymbol(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-blue-500/50"
                            >
                                <option value="">Select...</option>
                                {coinSymbols.map(s => (
                                    <option key={s} value={s} className="bg-gray-900">{s}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-[8px] text-gray-500 uppercase tracking-widest block mb-1">Condition</label>
                            <select
                                value={formCondition}
                                onChange={e => setFormCondition(e.target.value as 'above' | 'below')}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-blue-500/50"
                            >
                                <option value="above" className="bg-gray-900">Crosses Above ↑</option>
                                <option value="below" className="bg-gray-900">Drops Below ↓</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[8px] text-gray-500 uppercase tracking-widest block mb-1">Price ($)</label>
                            <input
                                type="number"
                                step="any"
                                value={formPrice}
                                onChange={e => setFormPrice(e.target.value)}
                                placeholder="0.00"
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono outline-none focus:border-blue-500/50"
                            />
                        </div>
                        <div>
                            <label className="text-[8px] text-gray-500 uppercase tracking-widest block mb-1">Note</label>
                            <input
                                value={formNote}
                                onChange={e => setFormNote(e.target.value)}
                                placeholder="Optional note..."
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-blue-500/50"
                            />
                        </div>
                    </div>
                    {formSymbol && formPrice && (
                        <div className="text-[10px] text-gray-500 font-mono">
                            Current: {currency.format(assets.find(a => a.symbol === formSymbol)?.currentPrice || 0)}
                            {' → '}Alert when {formCondition} {currency.format(parseFloat(formPrice) || 0)}
                        </div>
                    )}
                    <button
                        onClick={handleAdd}
                        disabled={!formSymbol || !formPrice}
                        className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        Create Alert
                    </button>
                </div>
            )}

            {/* Active Alerts */}
            {activeAlerts.length > 0 ? (
                <div className="space-y-2">
                    {activeAlerts.map(alert => {
                        const currentPrice = assets.find(a => a.symbol === alert.symbol)?.currentPrice || 0;
                        const distance = alert.condition === 'above'
                            ? ((alert.price - currentPrice) / currentPrice) * 100
                            : ((currentPrice - alert.price) / currentPrice) * 100;
                        const isClose = distance < 5;

                        return (
                            <div
                                key={alert.id}
                                className={`p-3 rounded-xl border flex items-center justify-between transition-all ${isClose
                                    ? 'bg-amber-500/5 border-amber-500/20 animate-pulse'
                                    : 'bg-white/[0.02] border-white/5'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-sm">{alert.condition === 'above' ? '📈' : '📉'}</span>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-black text-white">{alert.symbol}</span>
                                            <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border ${alert.condition === 'above'
                                                ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                                                : 'text-rose-400 bg-rose-500/10 border-rose-500/20'
                                                }`}>
                                                {alert.condition === 'above' ? '↑ Above' : '↓ Below'} {currency.format(alert.price)}
                                            </span>
                                            {isClose && (
                                                <span className="text-[7px] text-amber-400 font-bold animate-pulse">CLOSE!</span>
                                            )}
                                        </div>
                                        <div className="text-[9px] text-gray-600 font-mono mt-0.5">
                                            Current: {currency.format(currentPrice)} · {distance > 0 ? distance.toFixed(1) : '0.0'}% away
                                            {alert.note && ` · ${alert.note}`}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <button
                                        onClick={() => { toggleAlert(alert.id); refreshAlerts(); }}
                                        className="px-2 py-1 rounded-lg text-[8px] font-bold bg-white/5 hover:bg-white/10 text-gray-400 border border-white/10 transition-all"
                                    >
                                        Pause
                                    </button>
                                    <button
                                        onClick={() => { removeAlert(alert.id); refreshAlerts(); }}
                                        className="px-2 py-1 rounded-lg text-[8px] font-bold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-all"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : !showForm && triggeredAlerts.length === 0 && (
                <div className="text-center py-6">
                    <p className="text-xs text-gray-600 font-mono">No active alerts. Click "+ New Alert" to set price triggers.</p>
                </div>
            )}

            {/* Triggered Alerts */}
            {triggeredAlerts.length > 0 && (
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">Triggered</span>
                        <button
                            onClick={() => { clearTriggered(); refreshAlerts(); }}
                            className="text-[8px] text-gray-500 hover:text-gray-300 transition-all"
                        >
                            Clear all
                        </button>
                    </div>
                    {triggeredAlerts.map(alert => (
                        <div
                            key={alert.id}
                            className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-between"
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-sm">✅</span>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-black text-emerald-400">{alert.symbol}</span>
                                        <span className="text-[8px] text-gray-500">
                                            Hit {alert.condition} {currency.format(alert.price)}
                                        </span>
                                    </div>
                                    <span className="text-[8px] text-gray-600 font-mono">
                                        {alert.triggeredAt ? new Date(alert.triggeredAt).toLocaleString() : ''}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => { resetAlert(alert.id); refreshAlerts(); }}
                                className="px-2 py-1 rounded-lg text-[8px] font-bold bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 transition-all"
                            >
                                Re-arm
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
