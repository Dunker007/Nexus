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
    // Stable ID based on props to avoid hydration mismatch
    const gradientId = `gradient-${color}-sparkline`;

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
    icon: typeof Cpu,
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
    vramPercent: number;
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
}

export function GpuMonitor({
    utilization,
    temperature,
    vramUsed,
    vramTotal,
    power,
    gpuName = 'GPU',
    maxDataPoints = 60,
}: GpuMonitorProps) {
    const [history, setHistory] = useState<GpuDataPoint[]>([]);
    const prevDataRef = useRef({ utilization, temperature, vramUsed, power });

    // Detect max power roughly from GPU name (simple heuristic)
    // Detect max power roughly from GPU name (simple heuristic)
    const maxPower = gpuName.includes('4090') ? 450 :
        gpuName.includes('3090') ? 350 :
            gpuName.includes('5090') ? 600 :
                gpuName.includes('A100') ? 400 : 350; // Fallback

    // Helpers
    const toFahrenheit = (c: number) => Math.round(c * 1.8 + 32);
    const displayTemp = toFahrenheit(temperature);
    const isTempWarningF = displayTemp >= toFahrenheit(THRESHOLDS.GPU_TEMP.WARNING);
    const isTempCriticalF = displayTemp >= toFahrenheit(THRESHOLDS.GPU_TEMP.CRITICAL);

    // Add new data point on value change
    useEffect(() => {
        const prev = prevDataRef.current;

        // Only add if values actually changed
        if (prev.utilization !== utilization || prev.temperature !== temperature || prev.vramUsed !== vramUsed || prev.power !== power) {
            const now = new Date();
            const timeStr = `${now.getMinutes()}:${now.getSeconds().toString().padStart(2, '0')}`;
            const vramPercent = vramTotal > 0 ? (vramUsed / vramTotal) * 100 : 0;

            setHistory(prev => {
                const newHistory = [...prev, {
                    time: timeStr,
                    utilization,
                    temperature,
                    vramUsed,
                    vramPercent,
                    power,
                }];

                // Keep only last N points
                return newHistory.slice(-maxDataPoints);
            });

            prevDataRef.current = { utilization, temperature, vramUsed, power };
        }
    }, [utilization, temperature, vramUsed, vramTotal, power, maxDataPoints]);

    const vramPercent = vramTotal > 0 ? (vramUsed / vramTotal) * 100 : 0;

    return (
        <motion.div
            className={`glass-card p-6 ${isTempCriticalF ? 'ring-1 ring-red-500/50 animate-pulse-slow' : ''}`}
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
                    history={history.map(p => p.utilization)}
                />

                <DisplayCard
                    label="Temperature"
                    value={displayTemp}
                    unit="°F"
                    max={212}
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
                    history={history.map(p => p.vramPercent)}
                />

                <DisplayCard
                    label="Power Draw"
                    value={power}
                    unit="W"
                    max={maxPower}
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
                    <div className={`relative ${isTempCriticalF ? 'animate-pulse' : ''}`}>
                        <ProgressRing
                            value={(temperature / 100) * 100}
                            size={80}
                            color={isTempCriticalF ? 'error' : isTempWarningF ? '#F59E0B' : 'gpu'}
                            showValue={false}
                        />
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <Thermometer
                                size={16}
                                className={isTempCriticalF ? 'text-red-400' : isTempWarningF ? 'text-yellow-400' : 'text-cyan-400'}
                            />
                            <span
                                className={`text-sm font-bold ${isTempCriticalF ? 'text-red-400' :
                                    isTempWarningF ? 'text-yellow-400' : 'text-cyan-400'
                                    }`}
                            >
                                {displayTemp}°F
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
                        <div className="flex items-center gap-1 text-[10px] text-green-400">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div> Power
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
                                <linearGradient id="powerGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#4ade80" stopOpacity={0.25} />
                                    <stop offset="100%" stopColor="#4ade80" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="time" hide />
                            <YAxis domain={[0, 100]} hide />
                            <Tooltip
                                content={({ active, payload, label }) => {
                                    if (!active || !payload?.length) return null;
                                    const data = payload[0].payload;
                                    return (
                                        <div className="bg-black/90 border border-white/10 rounded-lg p-3 text-xs shadow-xl backdrop-blur-md">
                                            <div className="text-gray-400 mb-2 font-mono border-b border-white/5 pb-1">{label}</div>
                                            <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 font-mono">
                                                <div className="flex justify-between gap-4">
                                                    <span className="text-cyan-400">Core:</span>
                                                    <span className="text-white">{data.utilization.toFixed(1)}%</span>
                                                </div>
                                                <div className="flex justify-between gap-4">
                                                    <span className="text-purple-400">VRAM:</span>
                                                    <span className="text-white">{data.vramPercent.toFixed(1)}%</span>
                                                </div>
                                                <div className="flex justify-between gap-4">
                                                    <span className="text-yellow-400">Temp:</span>
                                                    <span className="text-white">{toFahrenheit(data.temperature)}°F</span>
                                                </div>
                                                <div className="flex justify-between gap-4">
                                                    <span className="text-green-400">Power:</span>
                                                    <span className="text-white">{data.power}W</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }}
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
                                stroke="#a855f7"
                                strokeWidth={1.5}
                                fillOpacity={0.15}
                                fill="#a855f7"
                                isAnimationActive={false}
                            />
                            <Area
                                type="step"
                                dataKey="power"
                                stroke="#4ade80"
                                strokeWidth={1.5}
                                fill="url(#powerGradient)"
                                isAnimationActive={false}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </motion.div>
    );
}

export default GpuMonitor;
