'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useSettings } from '@/components/SettingsContext';
import { LUXRIG_BRIDGE_URL } from '@/lib/utils';
import { RefreshCw, Cpu, HardDrive, Thermometer, Zap, Activity, Server, AlertTriangle, CheckCircle, Clock, Wifi, Globe, Router, Network } from 'lucide-react';
import { GpuMonitor } from '@/components/performance/GpuMonitor';
import { MetricCard } from '@/components/performance/MetricCard';
import { NetworkPanel } from '@/components/performance/NetworkPanel';
import { ModelsPanel } from '@/components/performance/ModelsPanel';
import { AgentsPanel } from '@/components/performance/AgentsPanel';
import { StoragePanel } from '@/components/performance/StoragePanel';
import { AlertsPanel } from '@/components/performance/AlertsPanel';
import { DevToolsPanel } from '@/components/performance/DevToolsPanel';
import { SystemOverview } from '@/components/performance/SystemOverview';
import { OptimizePanel } from '@/components/performance/OptimizePanel';

// ============= TYPES =============
interface ServiceStatus {
    name: string;
    status: 'operational' | 'degraded' | 'down' | 'checking';
    latency?: number;
    icon: string;
}

interface Health {
    status: string;
    uptime: number;
    memory: { used: number; total: number };
    services: Record<string, string>;
}

interface Metrics {
    activeConnections: number;
    activeAgents: number;
    memory: { heapUsed: number; heapTotal: number };
    platform: string;
    nodeVersion: string;
}

interface SystemInfo {
    gpu?: { name?: string; vram?: string; utilization?: number; temp?: number; power?: number };
    memory?: { used?: number; total?: number };
    cpu?: { usage?: number; cores?: number };
}

interface ErrorLog {
    message: string;
    timestamp: string;
    context?: { method?: string; url?: string };
}

interface ErrorStats {
    errors: ErrorLog[];
    stats: { last24Hours: number; lastHour: number };
}

// ============= MAIN COMPONENT =============
export default function PerformancePage() {
    const { settings } = useSettings();
    const BRIDGE_URL = settings.bridgeUrl || LUXRIG_BRIDGE_URL;

    // State
    const [services, setServices] = useState<ServiceStatus[]>([
        { name: 'LuxRig Bridge', status: 'checking', icon: '🌉' },
        { name: 'LM Studio', status: 'checking', icon: '🖥️' },
        { name: 'Ollama', status: 'checking', icon: '🦙' },
        { name: 'GPU Metrics', status: 'checking', icon: '🎮' },
    ]);
    const [health, setHealth] = useState<Health | null>(null);
    const [metrics, setMetrics] = useState<Metrics | null>(null);
    const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
    const [errors, setErrors] = useState<ErrorStats>({ errors: [], stats: { last24Hours: 0, lastHour: 0 } });
    const [lastChecked, setLastChecked] = useState<Date>(new Date());
    const [refreshInterval, setRefreshInterval] = useState(5000);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // History for sparklines
    const [gpuHistory, setGpuHistory] = useState<number[]>([]);
    const [ramHistory, setRamHistory] = useState<number[]>([]);
    const maxHistoryPoints = 30;

    // Helpers
    const formatUptime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${hours}h ${minutes}m`;
    };

    const formatBytes = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(1)} MB`;

    const updateService = useCallback((name: string, status: ServiceStatus['status'], latency?: number) => {
        setServices(prev => prev.map(s =>
            s.name === name ? { ...s, status, latency } : s
        ));
    }, []);

    // Main data fetch
    const loadAllData = useCallback(async () => {
        if (!BRIDGE_URL) return;
        setIsRefreshing(true);
        const startTime = Date.now();

        try {
            // Fetch all data in parallel
            const [healthRes, metricsRes, errorsRes, systemRes] = await Promise.all([
                fetch(`${BRIDGE_URL}/health`).catch(() => null),
                fetch(`${BRIDGE_URL}/monitoring/metrics`).catch(() => null),
                fetch(`${BRIDGE_URL}/monitoring/errors?limit=5`).catch(() => null),
                fetch(`${BRIDGE_URL}/system`).catch(() => null),
            ]);

            const bridgeLatency = Date.now() - startTime;

            // Bridge status
            if (healthRes?.ok) {
                const data = await healthRes.json();
                setHealth(data);
                updateService('LuxRig Bridge', 'operational', bridgeLatency);
            } else {
                updateService('LuxRig Bridge', 'down');
            }

            // Metrics
            if (metricsRes?.ok) {
                setMetrics(await metricsRes.json());
            }

            // Errors
            if (errorsRes?.ok) {
                setErrors(await errorsRes.json());
            }

            // System Info & GPU
            if (systemRes?.ok) {
                const data = await systemRes.json();
                setSystemInfo(data);
                updateService('GPU Metrics', 'operational');

                // Track history for sparklines
                if (data.gpu?.utilization !== undefined) {
                    setGpuHistory(prev => [...prev.slice(-maxHistoryPoints + 1), data.gpu.utilization]);
                }
                if (data.memory?.used !== undefined) {
                    const ramPercent = data.memory.total ? (data.memory.used / data.memory.total) * 100 : 0;
                    setRamHistory(prev => [...prev.slice(-maxHistoryPoints + 1), ramPercent]);
                }
            } else {
                updateService('GPU Metrics', 'down');
            }

            // Check LM Studio
            try {
                const lmRes = await fetch(`${BRIDGE_URL}/llm/lmstudio/models`);
                if (lmRes.ok) {
                    const data = await lmRes.json();
                    updateService('LM Studio', data.length > 0 ? 'operational' : 'degraded');
                } else {
                    updateService('LM Studio', 'down');
                }
            } catch { updateService('LM Studio', 'down'); }

            // Check Ollama
            try {
                const ollamaRes = await fetch(`${BRIDGE_URL}/llm/ollama/models`);
                if (ollamaRes.ok) {
                    const data = await ollamaRes.json();
                    updateService('Ollama', data.length > 0 ? 'operational' : 'degraded');
                } else {
                    updateService('Ollama', 'down');
                }
            } catch { updateService('Ollama', 'down'); }

        } catch (e) {
            console.error('Failed to load performance data:', e);
            updateService('LuxRig Bridge', 'down');
            updateService('LM Studio', 'down');
            updateService('Ollama', 'down');
            updateService('GPU Metrics', 'down');
        }

        setLastChecked(new Date());
        setIsRefreshing(false);
    }, [BRIDGE_URL, updateService]);

    useEffect(() => {
        setTimeout(() => loadAllData(), 0);
        const interval = setInterval(loadAllData, refreshInterval);
        return () => clearInterval(interval);
    }, [loadAllData, refreshInterval]);

    // Computed values
    const operationalCount = services.filter(s => s.status === 'operational').length;
    const overallStatus = operationalCount === services.length ? 'operational' :
        operationalCount > 0 ? 'degraded' : 'down';

    const statusColors = {
        operational: { bg: 'bg-green-500', text: 'text-green-400', label: 'Operational' },
        degraded: { bg: 'bg-yellow-500', text: 'text-yellow-400', label: 'Degraded' },
        down: { bg: 'bg-red-500', text: 'text-red-400', label: 'Down' },
        checking: { bg: 'bg-gray-500', text: 'text-gray-400', label: 'Checking...' },
    };

    return (
        <div className="min-h-screen pt-8">
            {/* System Overview Header */}
            <section className="container-main pb-8">
                <SystemOverview
                    health={health}
                    systemInfo={systemInfo}
                    servicesOnline={operationalCount}
                    servicesTotal={services.length}
                />

                {/* Refresh Controls */}
                <div className="flex items-center justify-end gap-4 mt-4">
                    <span className="text-xs text-gray-500">
                        Last: {lastChecked.toLocaleTimeString()}
                    </span>
                    <select
                        value={refreshInterval}
                        onChange={(e) => setRefreshInterval(Number(e.target.value))}
                        className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs"
                    >
                        <option value={1000}>1s</option>
                        <option value={5000}>5s</option>
                        <option value={10000}>10s</option>
                        <option value={30000}>30s</option>
                    </select>
                    <button
                        onClick={loadAllData}
                        disabled={isRefreshing}
                        className="flex items-center gap-2 px-3 py-1.5 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors text-sm"
                    >
                        <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
                        Refresh
                    </button>
                </div>
            </section>

            {/* Quick Stats Grid */}
            <section className="container-main pb-8">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {/* GPU Usage */}
                    <motion.div className="glass-card text-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <Cpu className="mx-auto mb-2 text-cyan-400" size={24} />
                        <div className="text-2xl font-bold text-cyan-400">
                            {systemInfo?.gpu?.utilization ?? '--'}%
                        </div>
                        <div className="text-xs text-gray-500">GPU Usage</div>
                    </motion.div>

                    {/* GPU Temp */}
                    <motion.div className="glass-card text-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                        <Thermometer className="mx-auto mb-2 text-yellow-400" size={24} />
                        <div className="text-2xl font-bold text-yellow-400">
                            {systemInfo?.gpu?.temp ?? '--'}°C
                        </div>
                        <div className="text-xs text-gray-500">GPU Temp</div>
                    </motion.div>

                    {/* GPU Power */}
                    <motion.div className="glass-card text-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                        <Zap className="mx-auto mb-2 text-green-400" size={24} />
                        <div className="text-2xl font-bold text-green-400">
                            {systemInfo?.gpu?.power ?? '--'}W
                        </div>
                        <div className="text-xs text-gray-500">GPU Power</div>
                    </motion.div>

                    {/* RAM Used */}
                    <motion.div className="glass-card text-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                        <HardDrive className="mx-auto mb-2 text-purple-400" size={24} />
                        <div className="text-2xl font-bold text-purple-400">
                            {systemInfo?.memory?.used ? `${(systemInfo.memory.used / 1024).toFixed(1)}GB` : '--'}
                        </div>
                        <div className="text-xs text-gray-500">RAM Used</div>
                    </motion.div>

                    {/* Connections */}
                    <motion.div className="glass-card text-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <Activity className="mx-auto mb-2 text-pink-400" size={24} />
                        <div className="text-2xl font-bold text-pink-400">
                            {metrics?.activeConnections ?? '--'}
                        </div>
                        <div className="text-xs text-gray-500">Connections</div>
                    </motion.div>

                    {/* Errors (24h) */}
                    <motion.div className="glass-card text-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                        <AlertTriangle className="mx-auto mb-2 text-red-400" size={24} />
                        <div className="text-2xl font-bold text-red-400">
                            {errors.stats?.last24Hours ?? 0}
                        </div>
                        <div className="text-xs text-gray-500">Errors (24h)</div>
                    </motion.div>
                </div>
            </section>

            {/* Services + GPU Info Grid */}
            <section className="container-main pb-8">
                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Services Status */}
                    <motion.div className="glass-card" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Server size={20} className="text-cyan-400" />
                            Service Status
                        </h2>
                        <div className="space-y-3">
                            {services.map((service) => {
                                const config = statusColors[service.status];
                                return (
                                    <div key={service.name} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <span className="text-xl">{service.icon}</span>
                                            <span className="font-medium">{service.name}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {service.latency && (
                                                <span className="text-xs text-gray-500">{service.latency}ms</span>
                                            )}
                                            <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs ${config.bg}/20 ${config.text}`}>
                                                {service.status === 'operational' ? <CheckCircle size={12} /> : null}
                                                {config.label}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>

                    {/* GPU Card - Now with real-time monitoring */}
                    {systemInfo?.gpu ? (
                        <GpuMonitor
                            utilization={systemInfo.gpu.utilization ?? 0}
                            temperature={systemInfo.gpu.temp ?? 0}
                            vramUsed={parseFloat(systemInfo.gpu.vram?.replace(/[^\d.]/g, '') || '0') || 0}
                            vramTotal={24} // RTX 4090 has 24GB - adjust as needed
                            power={systemInfo.gpu.power ?? 0}
                            gpuName={systemInfo.gpu.name || 'GPU'}
                        />
                    ) : (
                        <motion.div className="glass-card" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <Cpu size={20} className="text-purple-400" />
                                GPU Information
                            </h2>
                            <div className="text-center py-8 text-gray-500">
                                <Cpu size={48} className="mx-auto mb-4 opacity-30" />
                                <p>GPU data unavailable</p>
                                <p className="text-sm">Bridge may be offline</p>
                            </div>
                        </motion.div>
                    )}
                </div>
            </section>

            {/* Heap Memory + Platform Info */}
            <section className="container-main pb-8">
                <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <h2 className="text-xl font-bold mb-4">📊 Bridge Performance</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="p-4 bg-white/5 rounded-lg">
                            <div className="text-sm text-gray-400 mb-2">Heap Memory</div>
                            <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
                                <div
                                    className="bg-gradient-to-r from-cyan-500 to-purple-500 h-3 rounded-full transition-all"
                                    style={{ width: metrics ? `${(metrics.memory.heapUsed / metrics.memory.heapTotal) * 100}%` : '0%' }}
                                ></div>
                            </div>
                            <div className="flex justify-between text-xs text-gray-500">
                                <span>{metrics ? formatBytes(metrics.memory.heapUsed) : '--'}</span>
                                <span>{metrics ? formatBytes(metrics.memory.heapTotal) : '--'}</span>
                            </div>
                        </div>
                        <div className="p-4 bg-white/5 rounded-lg">
                            <div className="text-sm text-gray-400 mb-1">Platform</div>
                            <div className="font-mono text-lg">{metrics?.platform ?? '--'}</div>
                        </div>
                        <div className="p-4 bg-white/5 rounded-lg">
                            <div className="text-sm text-gray-400 mb-1">Node Version</div>
                            <div className="font-mono text-lg">{metrics?.nodeVersion ?? '--'}</div>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* Recent Errors */}
            {errors.errors && errors.errors.length > 0 && (
                <section className="container-main pb-8">
                    <motion.div className="glass-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <AlertTriangle size={20} className="text-red-400" />
                            Recent Errors
                        </h2>
                        <div className="space-y-3 max-h-[200px] overflow-y-auto">
                            {errors.errors.slice(0, 5).map((error, i) => (
                                <div key={i} className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                                    <div className="flex justify-between">
                                        <span className="font-medium text-red-400">{error.message}</span>
                                        <span className="text-xs text-gray-500">
                                            {new Date(error.timestamp).toLocaleTimeString()}
                                        </span>
                                    </div>
                                    {error.context && (
                                        <div className="text-xs text-gray-500 mt-1 font-mono">
                                            {error.context.method} {error.context.url}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </section>
            )}

            {/* Network Infrastructure - Now with live monitoring */}
            <section className="container-main pb-8">
                <NetworkPanel bridgeUrl={BRIDGE_URL} refreshInterval={30000} />
            </section>

            {/* AI Models Panel */}
            <section className="container-main pb-8">
                <ModelsPanel bridgeUrl={BRIDGE_URL} refreshInterval={30000} />
            </section>

            {/* Agent Console */}
            <section className="container-main pb-8">
                <AgentsPanel bridgeUrl={BRIDGE_URL} refreshInterval={10000} />
            </section>

            {/* Storage & Resources */}
            <section className="container-main pb-8">
                <StoragePanel bridgeUrl={BRIDGE_URL} refreshInterval={60000} />
            </section>

            {/* Alerts & Notifications */}
            <section className="container-main pb-8">
                <AlertsPanel bridgeUrl={BRIDGE_URL} systemData={systemInfo} />
            </section>

            {/* Developer Tools */}
            <section className="container-main pb-8">
                <DevToolsPanel bridgeUrl={BRIDGE_URL} />
            </section>

            {/* Optimization Tools */}
            <section className="container-main pb-8">
                <OptimizePanel bridgeUrl={BRIDGE_URL} />
            </section>

            {/* Back link */}
            <div className="container-main pb-8">
                <Link href="/" className="text-gray-400 hover:text-cyan-400 transition-colors">
                    ← Back to Dashboard
                </Link>
            </div>
        </div>
    );
}
