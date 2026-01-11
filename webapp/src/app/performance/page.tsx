'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect, useCallback, memo } from 'react';
import { useSettings } from '@/components/SettingsContext';
import { LUXRIG_BRIDGE_URL } from '@/lib/utils';
import { RefreshCw, Cpu, HardDrive, Thermometer, Zap, Activity, Server, AlertTriangle, ChevronRight, LayoutDashboard, Database, Bot, Clock } from 'lucide-react';
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
import { AIOptimizerAgent } from '@/components/performance/AIOptimizerAgent';

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
    gpu?: { name?: string; memoryUsedGB?: string; utilization?: number; temperature?: number; powerDraw?: number };
    memory?: { used?: number; total?: number };
    cpu?: { utilization?: number; cores?: number; name?: string };
    disk?: { totalGB?: string; usedGB?: string; percentUsed?: string };
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
// Memoized Refresh Select to prevent closing on re-renders
const RefreshSelector = memo(({ value, onChange }: { value: number; onChange: (val: number) => void }) => (
    <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="bg-transparent text-gray-400 text-xs focus:outline-none cursor-pointer hover:text-white"
    >
        <option value={1000}>1s</option>
        <option value={5000}>5s</option>
        <option value={10000}>10s</option>
        <option value={30000}>30s</option>
        <option value={60000}>1m</option>
    </select>
));
RefreshSelector.displayName = 'RefreshSelector';

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

    // Panel Persistence State
    const [modelsPanelOpen, setModelsPanelOpen] = useState(true);
    const [agentsPanelOpen, setAgentsPanelOpen] = useState(true);

    // History for sparklines (kept for future use)
    const [gpuHistory, setGpuHistory] = useState<number[]>([]);
    const [ramHistory, setRamHistory] = useState<number[]>([]);
    const maxHistoryPoints = 30;

    // Helpers
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

    const formatDuration = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        return `${h}h ${m}m`;
    };

    // Computed values
    const operationalCount = services.filter(s => s.status === 'operational').length;

    return (
        <div className="min-h-screen pt-8 pb-20">
            {/* Header Section */}
            <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

                {/* System Overview Header */}
                <SystemOverview
                    health={health}
                    systemInfo={systemInfo}
                    servicesOnline={operationalCount}
                    servicesTotal={services.length}
                />

                {/* Control Bar: Refresh Only */}
                <div className="flex flex-col md:flex-row items-center justify-end gap-4 bg-white/5 p-2 rounded-xl border border-white/10 backdrop-blur-md sticky top-4 z-50">
                    <div className="flex items-center gap-3 bg-black/20 px-3 py-1.5 rounded-lg border border-white/5">
                        <span className="text-xs text-gray-500 font-mono hidden sm:inline">
                            Updated: {lastChecked.toLocaleTimeString()}
                        </span>
                        <div className="h-4 w-px bg-white/10 hidden sm:block"></div>
                        <RefreshSelector value={refreshInterval} onChange={setRefreshInterval} />
                        <button
                            onClick={loadAllData}
                            disabled={isRefreshing}
                            className={`p-1.5 rounded-md hover:bg-white/10 text-cyan-400 transition-all ${isRefreshing ? 'animate-spin opacity-70' : 'hover:shadow-[0_0_10px_rgba(34,211,238,0.2)]'
                                }`}
                            title="Refresh Now"
                        >
                            <RefreshCw size={14} />
                        </button>
                    </div>
                </div>

                {/* SECTION: SYSTEM VITALS */}
                <div className="space-y-6">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <Activity className="text-cyan-400" size={20} />
                        System Vitals
                    </h2>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-8 gap-4">
                        <MetricCard
                            label="CPU Load"
                            value={`${systemInfo?.cpu?.utilization ?? '--'}%`}
                            icon={Cpu} color="cyan"
                        />
                        <MetricCard
                            label="RAM Usage"
                            value={systemInfo?.memory?.used ? `${(systemInfo.memory.used / 1024).toFixed(1)}GB` : '--'}
                            icon={HardDrive} color="purple"
                        />
                        <MetricCard
                            label="Disk (C:)"
                            value={systemInfo?.disk?.percentUsed ? `${systemInfo.disk.percentUsed}%` : '--'}
                            icon={Database} color="blue"
                        />
                        <MetricCard
                            label="Active Agents"
                            value={metrics?.activeAgents ?? '--'}
                            icon={Bot} color="pink"
                        />
                        <MetricCard
                            label="GPU Usage"
                            value={`${systemInfo?.gpu?.utilization ?? '--'}%`}
                            icon={Cpu} color="cyan"
                        />
                        <MetricCard
                            label="GPU Temp"
                            value={systemInfo?.gpu?.temperature != null ? `${(systemInfo.gpu.temperature * 1.8 + 32).toFixed(1)}°F` : '--'}
                            icon={Thermometer} color="yellow"
                        />
                        <MetricCard
                            label="Active Conn"
                            value={metrics?.activeConnections ?? '--'}
                            icon={Activity} color="blue"
                        />
                        <MetricCard
                            label="Sys Uptime"
                            value={health?.uptime ? formatDuration(health.uptime) : '--'}
                            icon={Clock} color="green"
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            {systemInfo?.gpu ? (
                                <GpuMonitor
                                    utilization={systemInfo.gpu.utilization ?? 0}
                                    temperature={systemInfo.gpu.temperature ?? 0}
                                    vramUsed={parseFloat(systemInfo?.gpu?.memoryUsedGB || '0') || 0}
                                    vramTotal={12} // RTX 3060 has 12GB
                                    power={systemInfo.gpu.powerDraw ?? 0}
                                    gpuName={systemInfo.gpu.name || 'GPU'}
                                />
                            ) : (
                                <div className="glass-card flex items-center justify-center p-12 text-gray-500">
                                    <div className="text-center">
                                        <Cpu className="mx-auto mb-4 opacity-50" size={48} />
                                        <p>Waiting for GPU telemetry...</p>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="space-y-6">
                            <AlertsPanel bridgeUrl={BRIDGE_URL} systemData={systemInfo} />

                            {/* Service Status Mini */}
                            <div className="glass-card">
                                <h3 className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider">Service Health</h3>
                                <div className="space-y-2">
                                    {services.map((service) => (
                                        <div key={service.name} className="flex items-center justify-between text-sm">
                                            <span className="flex items-center gap-2 text-gray-300">
                                                <span>{service.icon}</span>
                                                {service.name}
                                            </span>
                                            <div className={`w-2 h-2 rounded-full ${service.status === 'operational' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' :
                                                service.status === 'checking' ? 'bg-gray-500 animate-pulse' : 'bg-red-500'
                                                }`} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SECTION: AI OPTIMIZATION & MODELS */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pt-6">
                    <div className="space-y-6">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <Zap className="text-yellow-400" size={20} />
                            Optimization
                        </h2>
                        <OptimizePanel bridgeUrl={BRIDGE_URL} />
                        <AIOptimizerAgent bridgeUrl={BRIDGE_URL} />
                    </div>

                    <div className="space-y-6">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <Server className="text-purple-400" size={20} />
                            AI Models & Infrastructure
                        </h2>
                        <ModelsPanel
                            bridgeUrl={BRIDGE_URL}
                            refreshInterval={30000}
                            isOpen={modelsPanelOpen}
                            onToggle={() => setModelsPanelOpen(prev => !prev)}
                        />

                        <div className="grid grid-cols-1 gap-6">
                            <AgentsPanel
                                bridgeUrl={BRIDGE_URL}
                                refreshInterval={10000}
                                isOpen={agentsPanelOpen}
                                onToggle={() => setAgentsPanelOpen(prev => !prev)}
                            />
                        </div>
                    </div>
                </div>

                {/* SECTION: NETWORK & STORAGE */}
                <div className="space-y-6 pt-6">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <HardDrive className="text-blue-400" size={20} />
                        Infrastructure
                    </h2>
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        <NetworkPanel bridgeUrl={BRIDGE_URL} refreshInterval={30000} />
                        <StoragePanel bridgeUrl={BRIDGE_URL} refreshInterval={60000} />
                    </div>
                </div>

                {/* SECTION: DEVELOPER TOOLS */}
                <div className="space-y-6 pt-6">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <LayoutDashboard className="text-gray-400" size={20} />
                        Developer Consoles
                    </h2>

                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
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
                        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                            <div className="text-sm text-gray-400 mb-1">Platform</div>
                            <div className="font-mono text-lg text-white">{metrics?.platform ?? '--'}</div>
                        </div>
                        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                            <div className="text-sm text-gray-400 mb-1">Node Version</div>
                            <div className="font-mono text-lg text-white">{metrics?.nodeVersion ?? '--'}</div>
                        </div>
                    </div>

                    <DevToolsPanel bridgeUrl={BRIDGE_URL} />

                    {/* Error Log */}
                    {errors.errors && errors.errors.length > 0 && (
                        <motion.div className="glass-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <AlertTriangle size={20} className="text-red-400" />
                                System Error Logs
                            </h2>
                            <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                                {errors.errors.map((error, i) => (
                                    <div key={i} className="p-3 bg-red-500/5 border border-red-500/10 rounded-lg flex justify-between items-start gap-4">
                                        <div>
                                            <div className="font-medium text-red-400 text-sm">{error.message}</div>
                                            {error.context && (
                                                <div className="text-xs text-gray-600 mt-1 font-mono">
                                                    {error.context.method} {error.context.url}
                                                </div>
                                            )}
                                        </div>
                                        <span className="text-xs text-gray-500 shrink-0">
                                            {new Date(error.timestamp).toLocaleTimeString()}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Back link */}
                <div className="pt-8">
                    <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors">
                        <ChevronRight size={16} className="rotate-180" />
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}
