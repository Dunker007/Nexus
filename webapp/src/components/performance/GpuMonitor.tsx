/**
 * GpuMonitor - Real-time GPU utilization chart
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Cpu, Thermometer } from 'lucide-react';
import { ProgressRing } from './ProgressRing';
import { CHART_COLORS, THRESHOLDS } from '@/lib/luxrig/constants';

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
            className="glass-card"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
        >
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Cpu size={20} className="text-purple-400" />
                {gpuName}
            </h2>

            {/* Gauges Row */}
            <div className="grid grid-cols-3 gap-4 mb-6">
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
                    <span className="text-xs text-gray-500 mt-1">
                        {vramUsed.toFixed(1)} / {vramTotal.toFixed(0)} GB
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
                    <span className="text-xs text-gray-500 mt-1">Temp</span>
                </div>
            </div>

            {/* Power Draw */}
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg mb-4">
                <span className="text-gray-400 text-sm">Power Draw</span>
                <span className="font-bold text-green-400">{power}W</span>
            </div>

            {/* History Chart */}
            {history.length > 1 && (
                <div className="h-32">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={history} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                            <defs>
                                <linearGradient id="gpuGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={CHART_COLORS.gpu} stopOpacity={0.4} />
                                    <stop offset="100%" stopColor={CHART_COLORS.gpu} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis
                                dataKey="time"
                                tick={{ fontSize: 10, fill: '#6B7280' }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                domain={[0, 100]}
                                tick={{ fontSize: 10, fill: '#6B7280' }}
                                axisLine={false}
                                tickLine={false}
                                width={25}
                            />
                            <Tooltip
                                contentStyle={{
                                    background: 'rgba(0,0,0,0.8)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '8px',
                                    fontSize: '12px'
                                }}
                                labelStyle={{ color: '#9CA3AF' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="utilization"
                                stroke={CHART_COLORS.gpu}
                                strokeWidth={2}
                                fill="url(#gpuGradient)"
                                isAnimationActive={false}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}
        </motion.div>
    );
}

export default GpuMonitor;
