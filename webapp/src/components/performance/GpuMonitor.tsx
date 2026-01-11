/**
 * GpuMonitor - Real-time GPU utilization chart
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Cpu, Thermometer, HardDrive, Zap } from 'lucide-react';
import { ProgressRing } from './ProgressRing';
import { CHART_COLORS, THRESHOLDS } from '@/lib/luxrig/constants';

// SVG Sparkline Component
const Sparkline = ({ data, color, height = 40 }: { data: number[]; color: string; height?: number }) => {
    if (!data || data.length < 2) return null;

    // Normalize data 0-100
    const min = 0;
    const max = 100;
    const width = 100;

    const points = data.map((val, i) => {
        const x = (i / (data.length - 1)) * width;
        const normalizedVal = Math.max(0, Math.min(100, val)); // Clamp 0-100
        const y = height - ((normalizedVal - min) / (max - min)) * height;
        return `${x},${y}`;
    }).join(' ');

    const strokeColor = color === 'cyan' ? '#22d3ee' : color === 'yellow' ? '#facc15' : color === 'green' ? '#4ade80' : '#a855f7';
    // Unique ID to avoid conflicts
    const gradientId = `gradient-${color}-${Math.random().toString(36).substr(2, 9)}`;

    return (
        <div className="absolute bottom-0 left-0 right-0 opacity-20 pointer-events-none overflow-hidden rounded-b-xl" style={{ height: `${height}px` }}>
            <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
                <defs>
                    <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor={strokeColor} stopOpacity="0.5" />
                        <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
                    </linearGradient>
                </defs>
                <path d={`M 0 ${height} L ${points} L ${width} ${height} Z`} fill={`url(#${gradientId})`} />
                <polyline points={points} fill="none" stroke={strokeColor} strokeWidth="2" vectorEffect="non-scaling-stroke" />
            </svg>
        </div>
    );
};

const DisplayCard = ({ label, value, unit, max, color, icon: Icon, history }: {
    label: string,
    value: number,
    unit: string,
    max?: number,
    color: string,
    icon: any,
    history?: number[]
}) => {
    const percentage = max ? (value / max) * 100 : value; // Default to assuming value is % if no max

    // Color mapping
    const colorClasses: Record<string, string> = {
        cyan: 'text-cyan-400 bg-cyan-500',
        yellow: 'text-yellow-400 bg-yellow-500',
        green: 'text-green-400 bg-green-500',
        purple: 'text-purple-400 bg-purple-500',
    };

    const baseColor = colorClasses[color] || colorClasses.cyan;
    const textColor = baseColor.split(' ')[0];
    const bgColor = baseColor.split(' ')[1];

    return (
        <div className="bg-black/40 rounded-xl p-4 border border-white/5 relative overflow-hidden group h-full flex flex-col justify-between">
            {/* Sparkline Background */}
            {history && history.length > 0 && <Sparkline data={history} color={color} />}

            <div className="flex justify-between items-start mb-2 relative z-10 w-full">
                <div className="flex items-center gap-2 text-gray-400 text-sm font-medium">
                    <Icon size={16} />
                    {label}
                </div>
                <div className={`text-2xl font-bold font-mono ${textColor}`}>
                    {typeof value === 'number' ? value.toFixed(unit === '%' ? 0 : 1) : value}
                    <span className="text-sm font-sans ml-0.5 text-gray-500">{unit}</span>
                </div>
            </div>

            {/* Minimal Progress Bar */}
            <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden relative z-10 mt-2">
                <motion.div
                    className={`h-full ${bgColor} shadow-[0_0_10px_currentColor]`}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(percentage, 100)}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                />
            </div>
        </div>
    );
};

interface GpuDataPoint {
    time: string;
    utilization: number;
    temperature: number;
    vramUsed: number;
    power: number;
}

interface GpuMonitorProps {
    utilization: number;
    temperature: number;
    vramUsed: number;      // GB
    vramTotal: number;     // GB
    power: number;         // W
    gpuName?: string;
    maxDataPoints?: number;
    gpuHistory?: number[]; // Added: History for core load
    vramHistory?: number[]; // Added: History for VRAM
}

export function GpuMonitor({
    utilization,
    temperature,
    vramUsed,
    vramTotal,
    power,
    gpuName = 'GPU',
    maxDataPoints = 60,
    gpuHistory,
    vramHistory
}: GpuMonitorProps) {
    const [history, setHistory] = useState<GpuDataPoint[]>([]);
    const prevDataRef = useRef({ utilization, temperature, vramUsed, power });

    // Add new data point on value change
    useEffect(() => {
        const prev = prevDataRef.current;

        // Only add if values actually changed
        if (prev.utilization !== utilization || prev.temperature !== temperature) {
            const now = new Date();
            const timeStr = `${now.getMinutes()}:${now.getSeconds().toString().padStart(2, '0')}`;

            setHistory(prev => {
                const newHistory = [...prev, {
                    time: timeStr,
                    utilization,
                    temperature,
                    vramUsed,
                    power,
                }];

                // Keep only last N points
                return newHistory.slice(-maxDataPoints);
            });

            prevDataRef.current = { utilization, temperature, vramUsed, power };
        }
    }, [utilization, temperature, vramUsed, power, maxDataPoints]);

    const vramPercent = vramTotal > 0 ? (vramUsed / vramTotal) * 100 : 0;
    const isTempWarning = temperature >= THRESHOLDS.GPU_TEMP.WARNING;
    const isTempCritical = temperature >= THRESHOLDS.GPU_TEMP.CRITICAL;

    return (
        <motion.div
            className="glass-card p-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
        >
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <Cpu size={20} className="text-purple-400" />
                    {gpuName}
                </h2>
                <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-xs border ${utilization > 90 ? 'bg-red-500/10 border-red-500/30 text-red-400' :
                            utilization > 50 ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' :
                                'bg-green-500/10 border-green-500/30 text-green-400'
                        }`}>
                        {utilization > 90 ? 'HEAVY LOAD' : utilization > 10 ? 'ACTIVE' : 'IDLE'}
                    </span>
                </div>
            </div>

            {/* Main Stats Grid with Sparklines */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <DisplayCard
                    label="Core Load"
                    value={utilization}
                    unit="%"
                    color="cyan"
                    icon={Cpu}
                    history={gpuHistory}
                />

                <DisplayCard
                    label="Temperature"
                    value={temperature}
                    unit="°C"
                    max={100}
                    color="yellow"
                    icon={Thermometer}
                />

                <DisplayCard
                    label="VRAM Usage"
                    value={vramUsed}
                    unit="GB"
                    max={vramTotal}
                    color="purple"
                    icon={HardDrive}
                    history={vramHistory}
                />

                <DisplayCard
                    label="Power Draw"
                    value={power}
                    unit="W"
                    max={350} // 3090/4090 ballpark
                    color="green"
                    icon={Zap}
                />
            </div>

            {/* Detailed Circular Gauges Row */}
            <div className="grid grid-cols-3 gap-8 py-4 border-t border-white/5">
                {/* GPU Utilization */}
                <div className="flex flex-col items-center">
                    <ProgressRing
                        value={utilization}
                        size={80}
                        color="gpu"
                        label="GPU"
                        thresholdType="vram"
                    />
                </div>

                {/* VRAM Usage */}
                <div className="flex flex-col items-center">
                    <ProgressRing
                        value={vramPercent}
                        size={80}
                        color="vram"
                        label="VRAM"
                        thresholdType="vram"
                    />
                    <span className="text-xs text-gray-400 mt-2 font-mono">
                        {vramUsed.toFixed(1)} <span className="text-gray-600">/</span> {vramTotal.toFixed(0)} GB
                    </span>
                </div>

                {/* Temperature */}
                <div className="flex flex-col items-center">
                    <div className={`relative ${isTempCritical ? 'animate-pulse' : ''}`}>
                        <ProgressRing
                            value={(temperature / 100) * 100}
                            size={80}
                            color={isTempCritical ? 'error' : isTempWarning ? '#F59E0B' : 'gpu'}
                            showValue={false}
                        />
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <Thermometer
                                size={16}
                                className={isTempCritical ? 'text-red-400' : isTempWarning ? 'text-yellow-400' : 'text-cyan-400'}
                            />
                            <span
                                className={`text-sm font-bold ${isTempCritical ? 'text-red-400' :
                                    isTempWarning ? 'text-yellow-400' : 'text-cyan-400'
                                    }`}
                            >
                                {temperature}°
                            </span>
                        </div>
                    </div>
                    <span className="text-xs text-gray-500 mt-2">Thermal Cap</span>
                </div>
            </div>

            {/* Full History Area Chart */}
            <div className="mt-4 pt-4 border-t border-white/5">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-500 uppercase tracking-wider font-bold">1 Minute History</span>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-1 text-[10px] text-cyan-400">
                            <div className="w-2 h-2 rounded-full bg-cyan-500"></div> Core
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-purple-400">
                            <div className="w-2 h-2 rounded-full bg-purple-500"></div> VRAM
                        </div>
                    </div>
                </div>
                <div className="h-32 w-full bg-black/20 rounded-lg overflow-hidden border border-white/5">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={history} margin={{ top: 5, right: 0, bottom: 0, left: -20 }}>
                            <defs>
                                <linearGradient id="gpuUtilGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={CHART_COLORS.gpu} stopOpacity={0.3} />
                                    <stop offset="100%" stopColor={CHART_COLORS.gpu} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="time" hide />
                            <YAxis domain={[0, 100]} hide />
                            <Tooltip
                                contentStyle={{
                                    background: '#0a0a0a',
                                    border: '1px solid #333',
                                    borderRadius: '8px',
                                    fontSize: '11px',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
                                }}
                                itemStyle={{ padding: 0 }}
                                labelStyle={{ color: '#666', marginBottom: '4px' }}
                            />
                            <Area
                                type="step"
                                dataKey="utilization"
                                stroke={CHART_COLORS.gpu}
                                strokeWidth={2}
                                fill="url(#gpuUtilGradient)"
                                isAnimationActive={false}
                            />
                            <Area
                                type="step"
                                dataKey="vramPercent"
                                // Note: vramPercent isn't in history yet, would need to calculate or add to data point. 
                                // For now just showing utilization as primary metric.
                                stroke="transparent"
                                fill="transparent"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </motion.div>
    );
}

export default GpuMonitor;
