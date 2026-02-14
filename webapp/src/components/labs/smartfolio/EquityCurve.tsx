"use client";
import React, { useMemo } from 'react';
import { getSnapshots, calculatePerformance, type PortfolioSnapshotEntry } from '@/lib/labs/smartfolio/snapshots';
import { AccountId } from '@/lib/labs/smartfolio/data/portfolio';

interface EquityCurveProps {
    accountId: string;
    currentValue: number;
}

export default function EquityCurve({ accountId, currentValue }: EquityCurveProps) {
    const snapshots = useMemo(() => getSnapshots(accountId), [accountId]);
    const perf = useMemo(() => calculatePerformance(accountId), [accountId]);

    // Build data points including today's live value
    const dataPoints = useMemo(() => {
        const points = snapshots.map(s => ({ date: s.date, value: s.totalValue }));
        const today = new Date().toISOString().split('T')[0];
        const lastPoint = points[points.length - 1];
        if (!lastPoint || lastPoint.date !== today) {
            points.push({ date: today, value: currentValue });
        } else {
            points[points.length - 1] = { date: today, value: currentValue };
        }
        return points;
    }, [snapshots, currentValue]);

    if (dataPoints.length < 2) {
        return (
            <div className="glass-card p-6 space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">📈 Equity Curve</h3>
                    <span className="text-[8px] text-gray-600 font-mono">Collecting data...</span>
                </div>
                <div className="flex flex-col items-center justify-center py-10 space-y-3">
                    <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                        <span className="text-2xl">📊</span>
                    </div>
                    <p className="text-xs text-gray-500 text-center font-mono max-w-[300px]">
                        Equity curve will appear after 2+ daily snapshots. Snapshots are saved automatically when prices sync.
                    </p>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="text-[9px] text-emerald-400 font-mono">1 snapshot saved today</span>
                    </div>
                </div>
            </div>
        );
    }

    // Calculate chart dimensions
    const values = dataPoints.map(p => p.value);
    const minVal = Math.min(...values) * 0.98;
    const maxVal = Math.max(...values) * 1.02;
    const range = maxVal - minVal;

    const chartWidth = 100;
    const chartHeight = 100;

    // Build SVG path
    const points = dataPoints.map((p, i) => {
        const x = (i / (dataPoints.length - 1)) * chartWidth;
        const y = chartHeight - ((p.value - minVal) / range) * chartHeight;
        return { x, y, ...p };
    });

    const pathData = points
        .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y} `)
        .join(' ');

    // Gradient fill path
    const fillPath = pathData +
        ` L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`;

    const isPositive = dataPoints[dataPoints.length - 1].value >= dataPoints[0].value;
    const totalChange = ((dataPoints[dataPoints.length - 1].value - dataPoints[0].value) / dataPoints[0].value) * 100;

    return (
        <div className="glass-card p-6 space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">📈 Equity Curve</h3>
                <div className="flex items-center gap-3">
                    <span className="text-[9px] text-gray-600 font-mono">{dataPoints.length} snapshots</span>
                    <span className={`text - xs font - black font - mono ${isPositive ? 'text-emerald-400' : 'text-rose-400'} `}>
                        {isPositive ? '+' : ''}{totalChange.toFixed(1)}%
                    </span>
                </div>
            </div>

            {/* SVG Chart */}
            <div className="relative h-[180px] w-full">
                <svg viewBox={`0 0 ${chartWidth} ${chartHeight} `} className="w-full h-full" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id={`equity - gradient - ${accountId} `} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={isPositive ? '#10b981' : '#f43f5e'} stopOpacity="0.3" />
                            <stop offset="100%" stopColor={isPositive ? '#10b981' : '#f43f5e'} stopOpacity="0.02" />
                        </linearGradient>
                    </defs>

                    {/* Grid lines */}
                    {[0.25, 0.5, 0.75].map(frac => (
                        <line
                            key={frac}
                            x1="0" y1={chartHeight * frac}
                            x2={chartWidth} y2={chartHeight * frac}
                            stroke="rgba(255,255,255,0.05)"
                            strokeWidth="0.3"
                        />
                    ))}

                    {/* Fill area */}
                    <path
                        d={fillPath}
                        fill={`url(#equity - gradient - ${accountId})`}
                    />

                    {/* Line */}
                    <path
                        d={pathData}
                        fill="none"
                        stroke={isPositive ? '#10b981' : '#f43f5e'}
                        strokeWidth="1"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        vectorEffect="non-scaling-stroke"
                    />

                    {/* Current value dot */}
                    <circle
                        cx={points[points.length - 1].x}
                        cy={points[points.length - 1].y}
                        r="1.5"
                        fill={isPositive ? '#10b981' : '#f43f5e'}
                        className="animate-pulse"
                    />
                </svg>

                {/* Y-axis labels */}
                <div className="absolute top-0 right-0 h-full flex flex-col justify-between py-1 pointer-events-none">
                    <span className="text-[8px] text-gray-600 font-mono">${maxVal.toFixed(0)}</span>
                    <span className="text-[8px] text-gray-600 font-mono">${minVal.toFixed(0)}</span>
                </div>

                {/* X-axis labels */}
                <div className="absolute bottom-[-16px] left-0 w-full flex justify-between pointer-events-none">
                    <span className="text-[7px] text-gray-700 font-mono">{dataPoints[0].date.slice(5)}</span>
                    <span className="text-[7px] text-gray-700 font-mono">{dataPoints[dataPoints.length - 1].date.slice(5)}</span>
                </div>
            </div>

            {/* Performance stats */}
            <div className="grid grid-cols-4 gap-3 pt-2">
                {[
                    { label: '24h', value: perf.daily },
                    { label: '7d', value: perf.weekly },
                    { label: '30d', value: perf.monthly },
                    { label: 'All Time', value: perf.allTime },
                ].map(stat => (
                    <div key={stat.label} className="text-center p-2 rounded-lg bg-white/[0.02] border border-white/5">
                        <div className="text-[8px] text-gray-600 uppercase tracking-widest mb-1">{stat.label}</div>
                        <div className={`text - xs font - black font - mono ${stat.value === null ? 'text-gray-600' :
                                stat.value >= 0 ? 'text-emerald-400' : 'text-rose-400'
                            } `}>
                            {stat.value !== null ? `${stat.value >= 0 ? '+' : ''}${stat.value.toFixed(1)}% ` : '—'}
                        </div>
                    </div>
                ))}
            </div>

            {/* HWM / Drawdown */}
            {perf.highWaterMark > 0 && (
                <div className="flex justify-between items-center pt-1 px-1">
                    <span className="text-[8px] text-gray-600 font-mono">
                        HWM: ${perf.highWaterMark.toFixed(0)}
                    </span>
                    <span className={`text - [8px] font - mono ${perf.drawdown < -5 ? 'text-rose-400' : 'text-gray-600'} `}>
                        Drawdown: {perf.drawdown.toFixed(1)}%
                    </span>
                </div>
            )}
        </div>
    );
}
