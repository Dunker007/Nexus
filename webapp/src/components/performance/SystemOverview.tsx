'use client';

import { motion } from 'framer-motion';
import {
    Zap, Activity,
    Server, Wifi, CheckCircle, AlertTriangle,
    Thermometer,
    Cpu, Clock, AlertCircle
} from 'lucide-react';
import { HARDWARE_CONFIG, THRESHOLDS } from '@/lib/luxrig/constants';

interface SystemOverviewProps {
    health?: {
        status: string;
        uptime: number;
    } | null;
    systemInfo?: {
        gpu?: { temperature?: number; utilization?: number; name?: string };
        memory?: { used?: number; total?: number };
        cpu?: { utilization?: number };
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

    // Helper: Format Uptime
    const formatUptime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        if (hours > 24) {
            const days = Math.floor(hours / 24);
            return `${days}d ${hours % 24}h`;
        }
        return `${hours}h ${minutes}m`;
    };

    // Helper: Get Status
    const getOverallStatus = () => {
        if (!health) return { status: 'checking', color: 'text-gray-400', label: 'Checking...', icon: Activity };
        if (health.status === 'healthy' && servicesOnline === servicesTotal) {
            return { status: 'optimal', color: 'text-green-400', label: 'All Systems Optimal', icon: CheckCircle };
        }
        if (health.status === 'degraded' || servicesOnline < servicesTotal) {
            return { status: 'degraded', color: 'text-yellow-400', label: 'Partial Degradation', icon: AlertTriangle };
        }
        return { status: 'critical', color: 'text-red-400', label: 'Critical Issues', icon: AlertCircle };
    };

    const status = getOverallStatus();

    // Metrics
    const gpuTemp = systemInfo?.gpu?.temperature;
    const gpuUtil = systemInfo?.gpu?.utilization;

    // RAM %
    const ramPercent = systemInfo?.memory?.used && systemInfo?.memory?.total
        ? Math.round((systemInfo.memory.used / systemInfo.memory.total) * 100)
        : null;

    // --- Color Logic from User ---

    const tempColor =
        gpuTemp && gpuTemp >= THRESHOLDS.GPU_TEMP.CRITICAL ? 'text-red-500 animate-pulse' :
            gpuTemp && gpuTemp >= THRESHOLDS.GPU_TEMP.WARNING ? 'text-yellow-400' :
                'text-cyan-400';

    // GPU Util Color
    const gpuUtilColor =
        gpuUtil && gpuUtil >= 90 ? 'text-red-400 animate-pulse' :
            gpuUtil && gpuUtil >= 50 ? 'text-yellow-400' :
                'text-cyan-400';

    // Uptime Color
    const uptimeColor = health?.uptime && health.uptime < 3600 ? 'text-yellow-400' : 'text-purple-400';

    // Services Color
    const servicesColor =
        servicesOnline === servicesTotal ? 'text-green-400' :
            servicesOnline === 0 ? 'text-red-400 animate-pulse' :
                'text-yellow-400';

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 border-b border-white/5 relative overflow-hidden group"
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
            {/* Ambient Background Glow based on Status */}
            <div className={`absolute inset-0 opacity-10 blur-3xl transition-colors duration-700 pointer-events-none ${status.color.replace('text-', 'bg-')}`} />

            <div className="relative z-10 flex flex-col md:flex-row justify-between md:items-center gap-6">

                {/* Left: Overall Health & Status */}
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 shadow-lg relative`}>
                        <div className={`absolute inset-0 rounded-xl opacity-20 animate-pulse ${status.color.replace('text-', 'bg-')}`} />
                        <status.icon size={32} className={`${status.color} relative z-10`} aria-label={`System status: ${status.label}`} role="status" />
                    </div>
                    <div>
                        <h2 className={`text-2xl font-bold tracking-tight ${status.color} drop-shadow-sm`}>
                            {status.label}
                        </h2>
                        <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                            <span className="font-mono bg-white/5 px-2 py-0.5 rounded text-xs border border-white/5">
                                {HARDWARE_CONFIG?.MOTHERBOARD?.name || 'Unknown MB'} • {HARDWARE_CONFIG?.GPU?.name || 'Unknown GPU'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Right: Key KPI Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 md:gap-6 w-full md:w-auto">

                    {/* GPU Utilization */}
                    <div className="text-center md:text-right">
                        <div className="flex items-center justify-end gap-1.5 mb-1 text-xs text-gray-500 font-medium uppercase tracking-wider">
                            <Zap size={12} className={gpuUtilColor} /> GPU
                        </div>
                        <div className={`text-xl md:text-2xl font-bold ${gpuUtilColor} font-mono tabular-nums leading-none`}>
                            {gpuUtil != null ? `${gpuUtil}%` : <span className="text-gray-600">--</span>}
                        </div>
                    </div>

                    {/* GPU Temp */}
                    <div className="text-center md:text-right">
                        <div className="flex items-center justify-end gap-1.5 mb-1 text-xs text-gray-500 font-medium uppercase tracking-wider">
                            <Thermometer size={12} className={tempColor} /> Temp
                        </div>
                        <div className={`text-xl md:text-2xl font-bold ${tempColor} font-mono tabular-nums leading-none`}>
                            {gpuTemp != null ? (
                                <span>{(gpuTemp * 1.8 + 32).toFixed(0)}<span className="text-base align-top ml-0.5">°F</span></span>
                            ) : <span className="text-gray-600">--</span>}
                        </div>
                    </div>

                    {/* RAM Usage */}
                    <div className="text-center md:text-right">
                        <div className="flex items-center justify-end gap-1.5 mb-1 text-xs text-gray-500 font-medium uppercase tracking-wider">
                            <Cpu size={12} className="text-blue-400" /> RAM
                        </div>
                        <div className="text-xl md:text-2xl font-bold text-blue-400 font-mono tabular-nums leading-none">
                            {ramPercent != null ? `${ramPercent}%` : <span className="text-gray-600">--</span>}
                        </div>
                    </div>

                    {/* Active Services */}
                    <div className="text-center md:text-right">
                        <div className="flex items-center justify-end gap-1.5 mb-1 text-xs text-gray-500 font-medium uppercase tracking-wider">
                            <Activity size={12} className={servicesColor} /> Svc
                        </div>
                        <div className={`text-xl md:text-2xl font-bold ${servicesColor} font-mono tabular-nums leading-none`}>
                            {servicesOnline}<span className="text-base text-gray-600">/{servicesTotal}</span>
                        </div>
                    </div>

                    {/* Uptime */}
                    <div className="text-center md:text-right sm:block hidden">
                        <div className="flex items-center justify-end gap-1.5 mb-1 text-xs text-gray-500 font-medium uppercase tracking-wider">
                            <Clock size={12} className={uptimeColor} /> Up
                        </div>
                        <div className={`text-xl md:text-2xl font-bold ${uptimeColor} font-mono tabular-nums leading-none`}>
                            {health?.uptime ? formatUptime(health.uptime) : <span className="text-gray-600">--</span>}
                        </div>
                    </div>

                </div>
            </div>
        </motion.div>
    );
}

export default SystemOverview;
