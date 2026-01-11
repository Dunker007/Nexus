/**
 * SystemOverview - Unified system status header with hardware info
 */

'use client';

import { motion } from 'framer-motion';
import {
    Cpu, HardDrive, Thermometer, Zap, Activity,
    Server, Wifi, CheckCircle, AlertTriangle
} from 'lucide-react';
import { HARDWARE_CONFIG } from '@/lib/luxrig/constants';

interface SystemOverviewProps {
    health?: {
        status: string;
        uptime: number;
    } | null;
    systemInfo?: {
        gpu?: { temp?: number; utilization?: number; name?: string };
        memory?: { used?: number; total?: number };
        cpu?: { usage?: number };
    } | null;
    servicesOnline: number;
    servicesTotal: number;
}

export function SystemOverview({
    health,
    systemInfo,
    servicesOnline,
    servicesTotal
}: SystemOverviewProps) {
    const formatUptime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        if (hours > 24) {
            const days = Math.floor(hours / 24);
            return `${days}d ${hours % 24}h`;
        }
        return `${hours}h ${minutes}m`;
    };

    const getOverallStatus = () => {
        if (!health) return { status: 'checking', color: 'gray', label: 'Checking...' };
        if (health.status === 'healthy' && servicesOnline === servicesTotal) {
            return { status: 'optimal', color: 'green', label: 'All Systems Optimal' };
        }
        if (health.status === 'degraded' || servicesOnline < servicesTotal) {
            return { status: 'degraded', color: 'yellow', label: 'Partial Degradation' };
        }
        return { status: 'critical', color: 'red', label: 'Critical Issues' };
    };

    const status = getOverallStatus();
    const gpuTemp = systemInfo?.gpu?.temp;
    const ramPercent = systemInfo?.memory?.used && systemInfo?.memory?.total
        ? Math.round((systemInfo.memory.used / systemInfo.memory.total) * 100)
        : null;

    return (
        <motion.div
            className="relative overflow-hidden rounded-2xl"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            {/* Background gradient based on status */}
            <div className={`absolute inset-0 bg-gradient-to-r ${status.color === 'green' ? 'from-green-500/20 via-cyan-500/10 to-purple-500/20' :
                    status.color === 'yellow' ? 'from-yellow-500/20 via-orange-500/10 to-red-500/20' :
                        status.color === 'red' ? 'from-red-500/30 via-red-500/20 to-orange-500/20' :
                            'from-gray-500/20 via-gray-500/10 to-gray-500/20'
                }`} />

            {/* Animated pulse overlay for optimal status */}
            {status.status === 'optimal' && (
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-cyan-500/5 animate-pulse" />
            )}

            <div className="relative p-6">
                {/* Top row: Status + Hardware */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        {/* Status indicator */}
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${status.color === 'green' ? 'bg-green-500/20' :
                                status.color === 'yellow' ? 'bg-yellow-500/20' :
                                    status.color === 'red' ? 'bg-red-500/20 animate-pulse' :
                                        'bg-gray-500/20'
                            }`}>
                            {status.status === 'optimal' ? (
                                <CheckCircle size={32} className="text-green-400" />
                            ) : status.status === 'degraded' ? (
                                <AlertTriangle size={32} className="text-yellow-400" />
                            ) : status.status === 'critical' ? (
                                <AlertTriangle size={32} className="text-red-400 animate-bounce" />
                            ) : (
                                <Activity size={32} className="text-gray-400 animate-pulse" />
                            )}
                        </div>

                        <div>
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                                LuxRig Command Center
                            </h1>
                            <p className={`text-sm ${status.color === 'green' ? 'text-green-400' :
                                    status.color === 'yellow' ? 'text-yellow-400' :
                                        status.color === 'red' ? 'text-red-400' :
                                            'text-gray-400'
                                }`}>
                                {status.label}
                            </p>
                        </div>
                    </div>

                    {/* Hardware badge */}
                    <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10">
                        <Server size={16} className="text-cyan-400" />
                        <span className="text-sm text-gray-300">{HARDWARE_CONFIG.MOTHERBOARD.name}</span>
                        <span className="text-gray-500">•</span>
                        <span className="text-sm text-purple-400">{HARDWARE_CONFIG.GPU.name}</span>
                    </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {/* Services */}
                    <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                        <div className="flex items-center gap-2 mb-1">
                            <Wifi size={14} className="text-cyan-400" />
                            <span className="text-xs text-gray-500">Services</span>
                        </div>
                        <div className="text-xl font-bold">
                            <span className="text-green-400">{servicesOnline}</span>
                            <span className="text-gray-500">/{servicesTotal}</span>
                        </div>
                    </div>

                    {/* Uptime */}
                    <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                        <div className="flex items-center gap-2 mb-1">
                            <Activity size={14} className="text-purple-400" />
                            <span className="text-xs text-gray-500">Uptime</span>
                        </div>
                        <div className="text-xl font-bold text-purple-400">
                            {health?.uptime ? formatUptime(health.uptime) : '--'}
                        </div>
                    </div>

                    {/* GPU Temp */}
                    <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                        <div className="flex items-center gap-2 mb-1">
                            <Thermometer size={14} className={
                                gpuTemp && gpuTemp >= 80 ? 'text-red-400' : 'text-orange-400'
                            } />
                            <span className="text-xs text-gray-500">GPU Temp</span>
                        </div>
                        <div className={`text-xl font-bold ${gpuTemp && gpuTemp >= 80 ? 'text-red-400' : 'text-orange-400'
                            }`}>
                            {gpuTemp ? `${gpuTemp}°C` : '--'}
                        </div>
                    </div>

                    {/* RAM Usage */}
                    <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                        <div className="flex items-center gap-2 mb-1">
                            <HardDrive size={14} className="text-violet-400" />
                            <span className="text-xs text-gray-500">RAM</span>
                        </div>
                        <div className="text-xl font-bold text-violet-400">
                            {ramPercent !== null ? `${ramPercent}%` : '--'}
                        </div>
                    </div>

                    {/* GPU Util */}
                    <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                        <div className="flex items-center gap-2 mb-1">
                            <Zap size={14} className="text-cyan-400" />
                            <span className="text-xs text-gray-500">GPU</span>
                        </div>
                        <div className="text-xl font-bold text-cyan-400">
                            {systemInfo?.gpu?.utilization !== undefined
                                ? `${systemInfo.gpu.utilization}%`
                                : '--'}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

export default SystemOverview;
