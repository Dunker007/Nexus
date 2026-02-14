"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { usePortfolio } from '@/context/labs/smartfolio/PortfolioContext';

interface FearGreedData {
    value: number;
    valueClassification: string;
    timestamp: number;
    history: { value: number; classification: string; date: string }[];
}

const CLASSIFICATION_COLORS: Record<string, string> = {
    'Extreme Fear': 'text-rose-400',
    'Fear': 'text-orange-400',
    'Neutral': 'text-gray-300',
    'Greed': 'text-lime-400',
    'Extreme Greed': 'text-emerald-400',
};

const CLASSIFICATION_BG: Record<string, string> = {
    'Extreme Fear': 'from-rose-500/20 to-rose-900/10',
    'Fear': 'from-orange-500/20 to-orange-900/10',
    'Neutral': 'from-gray-500/20 to-gray-900/10',
    'Greed': 'from-lime-500/20 to-lime-900/10',
    'Extreme Greed': 'from-emerald-500/20 to-emerald-900/10',
};

export default function FearGreedIndex() {
    const [data, setData] = useState<FearGreedData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Alternative.me API — free, no key needed
            const response = await fetch('https://api.alternative.me/fng/?limit=8');
            const json = await response.json();

            if (json?.data && json.data.length > 0) {
                const current = json.data[0];
                setData({
                    value: parseInt(current.value, 10),
                    valueClassification: current.value_classification,
                    timestamp: parseInt(current.timestamp, 10) * 1000,
                    history: json.data.slice(1).map((d: any) => ({
                        value: parseInt(d.value, 10),
                        classification: d.value_classification,
                        date: new Date(parseInt(d.timestamp, 10) * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    })),
                });
            }
        } catch (e) {
            setError('Failed to fetch Fear & Greed data');
            console.warn('[F&G]', e);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchData();
        // Refresh every 10 minutes
        const interval = setInterval(fetchData, 10 * 60 * 1000);
        return () => clearInterval(interval);
    }, [fetchData]);

    if (loading) {
        return (
            <div className="glass-card p-6">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4">😱 Fear & Greed Index</h3>
                <div className="flex items-center justify-center py-8">
                    <div className="flex gap-1">
                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></span>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="glass-card p-6">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4">😱 Fear & Greed Index</h3>
                <div className="flex flex-col items-center justify-center py-6 space-y-2">
                    <span className="text-gray-500 text-xs">⚠️ {error || 'No data available'}</span>
                    <button onClick={fetchData} className="text-[9px] text-blue-400 hover:text-blue-300 underline">Retry</button>
                </div>
            </div>
        );
    }

    const classification = data.valueClassification;
    const colorClass = CLASSIFICATION_COLORS[classification] || 'text-gray-300';
    const bgGradient = CLASSIFICATION_BG[classification] || 'from-gray-500/20 to-gray-900/10';

    // Gauge math — semicircle
    const angle = (data.value / 100) * 180; // 0 = left, 180 = right
    const needleAngle = angle - 90; // SVG rotation from top

    return (
        <div className={`glass-card p-6 space-y-4 bg-gradient-to-br ${bgGradient}`}>
            <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">😱 Fear & Greed Index</h3>
                <div className="flex items-center gap-2">
                    <span className="text-[8px] text-gray-600 font-mono">Crypto Market</span>
                    <button
                        onClick={fetchData}
                        className="text-[8px] text-blue-400 hover:text-blue-300 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20 transition-all"
                    >
                        ↻
                    </button>
                </div>
            </div>

            {/* Gauge */}
            <div className="flex flex-col items-center">
                <div className="relative w-[200px] h-[108px]">
                    <svg viewBox="0 0 200 110" className="w-full h-full">
                        {/* Background arc segments */}
                        <path d="M 20 100 A 80 80 0 0 1 60 34" fill="none" stroke="#ef4444" strokeWidth="8" strokeLinecap="round" opacity="0.3" />
                        <path d="M 60 34 A 80 80 0 0 1 100 20" fill="none" stroke="#f97316" strokeWidth="8" strokeLinecap="round" opacity="0.3" />
                        <path d="M 100 20 A 80 80 0 0 1 140 34" fill="none" stroke="#a3a3a3" strokeWidth="8" strokeLinecap="round" opacity="0.3" />
                        <path d="M 140 34 A 80 80 0 0 1 160 56" fill="none" stroke="#84cc16" strokeWidth="8" strokeLinecap="round" opacity="0.3" />
                        <path d="M 160 56 A 80 80 0 0 1 180 100" fill="none" stroke="#10b981" strokeWidth="8" strokeLinecap="round" opacity="0.3" />

                        {/* Needle */}
                        <g transform={`rotate(${needleAngle}, 100, 100)`}>
                            <line x1="100" y1="100" x2="100" y2="30" stroke="white" strokeWidth="2" strokeLinecap="round" />
                            <circle cx="100" cy="100" r="4" fill="white" />
                        </g>

                        {/* Labels */}
                        <text x="15" y="108" fontSize="7" fill="#888" textAnchor="start">0</text>
                        <text x="99" y="14" fontSize="7" fill="#888" textAnchor="middle">50</text>
                        <text x="185" y="108" fontSize="7" fill="#888" textAnchor="end">100</text>
                    </svg>
                </div>

                {/* Value and classification */}
                <div className="text-center -mt-6">
                    <div className={`text-4xl font-black font-mono ${colorClass}`}>{data.value}</div>
                    <div className={`text-sm font-bold uppercase tracking-wider ${colorClass}`}>{classification}</div>
                </div>
            </div>

            {/* Recent History */}
            {data.history.length > 0 && (
                <div className="space-y-2">
                    <div className="text-[9px] text-gray-600 uppercase tracking-widest font-bold">Recent History</div>
                    <div className="flex gap-2">
                        {data.history.map((h, i) => (
                            <div key={i} className="flex-1 text-center p-2 rounded-lg bg-white/[0.03] border border-white/5">
                                <div className={`text-sm font-black font-mono ${CLASSIFICATION_COLORS[h.classification] || 'text-gray-400'}`}>
                                    {h.value}
                                </div>
                                <div className="text-[7px] text-gray-600 font-mono mt-0.5">{h.date}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Strategy implication */}
            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                <div className="text-[9px] text-gray-500 font-mono leading-relaxed">
                    {data.value <= 25
                        ? '📉 Extreme fear signals potential buying opportunity. Historical dips often recover. DCA into conviction picks.'
                        : data.value <= 45
                            ? '⚠️ Market is fearful. Monitor for capitulation bottoms. Patience before deploying cash.'
                            : data.value <= 55
                                ? '⚖️ Neutral sentiment. Stay the course with current strategy. No urgency to change.'
                                : data.value <= 75
                                    ? '📈 Greed is rising. Consider tightening stops and taking partial profits on runners.'
                                    : '🚨 Extreme greed — high risk of correction. Take profit, raise cash, tighten risk.'}
                </div>
            </div>
        </div>
    );
}
