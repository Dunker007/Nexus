/**
 * NetworkPanel - Live network infrastructure monitoring
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
    Globe, Router, Wifi, Network, RefreshCw,
    Activity, CheckCircle, XCircle, AlertTriangle,
    Zap
} from 'lucide-react';
import { NETWORK_CONFIG, CHART_COLORS } from '@/lib/luxrig/constants';

interface ISPStatus {
    id: string;
    name: string;
    model: string;
    type: 'primary' | 'failover';
    status: 'online' | 'offline' | 'degraded';
    gatewayLatency: number | null;
    externalLatency: number | null;
    gatewayReachable: boolean;
    internetReachable: boolean;
}

interface RouterStatus {
    name: string;
    role: string;
    gateway: string;
    status: 'online' | 'offline';
    latency: number | null;
}

interface NetworkStatus {
    overallStatus: 'optimal' | 'degraded' | 'offline';
    isps: ISPStatus[];
    router: RouterStatus;
    timestamp: string;
}

interface NetworkPanelProps {
    bridgeUrl: string;
    refreshInterval?: number;
}

export function NetworkPanel({ bridgeUrl, refreshInterval = 30000 }: NetworkPanelProps) {
    const [status, setStatus] = useState<NetworkStatus | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastChecked, setLastChecked] = useState<Date | null>(null);
    const [speedTestResult, setSpeedTestResult] = useState<{
        running: boolean;
        download?: string;
        upload?: string;
        latency?: number;
    }>({ running: false });

    const fetchStatus = useCallback(async () => {
        if (!bridgeUrl) return;

        try {
            setIsRefreshing(true);
            const res = await fetch(`${bridgeUrl}/network/status`);
            if (res.ok) {
                const data = await res.json();
                setStatus(data);
                setLastChecked(new Date());
            }
        } catch (error) {
            console.warn('Failed to fetch network status:', error);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [bridgeUrl]);

    const runSpeedTest = async () => {
        if (!bridgeUrl || speedTestResult.running) return;

        setSpeedTestResult({ running: true });

        try {
            const res = await fetch(`${bridgeUrl}/network/speedtest`, { method: 'POST' });
            if (res.ok) {
                const data = await res.json();
                setSpeedTestResult({
                    running: false,
                    download: data.download,
                    upload: data.upload,
                    latency: data.ping || data.latency?.average,
                });
            }
        } catch (error) {
            console.warn('Speed test failed:', error);
            setSpeedTestResult({ running: false });
        }
    };

    useEffect(() => {
        fetchStatus();
        const interval = setInterval(fetchStatus, refreshInterval);
        return () => clearInterval(interval);
    }, [fetchStatus, refreshInterval]);

    const StatusIcon = ({ status }: { status: string }) => {
        switch (status) {
            case 'online':
            case 'optimal':
                return <CheckCircle size={16} className="text-green-400" />;
            case 'degraded':
                return <AlertTriangle size={16} className="text-yellow-400" />;
            default:
                return <XCircle size={16} className="text-red-400" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'online':
            case 'optimal':
                return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'degraded':
                return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            default:
                return 'bg-red-500/20 text-red-400 border-red-500/30';
        }
    };

    // Use static config if no live data
    const displayISPs = status?.isps || [
        {
            id: 'verizon',
            name: NETWORK_CONFIG.ISP_PRIMARY.name,
            model: NETWORK_CONFIG.ISP_PRIMARY.model,
            type: 'primary' as const,
            status: 'online' as const,
            gatewayLatency: null,
            externalLatency: null,
            gatewayReachable: false,
            internetReachable: false,
        },
        {
            id: 'tmobile',
            name: NETWORK_CONFIG.ISP_FAILOVER.name,
            model: NETWORK_CONFIG.ISP_FAILOVER.model,
            type: 'failover' as const,
            status: 'online' as const,
            gatewayLatency: null,
            externalLatency: null,
            gatewayReachable: false,
            internetReachable: false,
        },
    ];

    return (
        <motion.div
            className="glass-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <Network size={20} className="text-cyan-400" />
                    Network Infrastructure
                </h2>
                <div className="flex items-center gap-2">
                    {lastChecked && (
                        <span className="text-xs text-gray-500">
                            {lastChecked.toLocaleTimeString()}
                        </span>
                    )}
                    <button
                        onClick={fetchStatus}
                        disabled={isRefreshing}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                    >
                        <RefreshCw
                            size={14}
                            className={`text-gray-400 ${isRefreshing ? 'animate-spin' : ''}`}
                        />
                    </button>
                </div>
            </div>

            {/* Overall Status */}
            {status && (
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg mb-6 border ${getStatusColor(status.overallStatus)}`}>
                    <StatusIcon status={status.overallStatus} />
                    <span className="text-sm font-medium capitalize">
                        {status.overallStatus === 'optimal' ? 'All Systems Online' :
                            status.overallStatus === 'degraded' ? 'Partial Connectivity' : 'Network Offline'}
                    </span>
                </div>
            )}

            {/* ISPs Grid */}
            <div className="grid md:grid-cols-2 gap-4 mb-6">
                {displayISPs.map((isp) => (
                    <div
                        key={isp.id}
                        className={`p-4 rounded-xl border transition-all ${isp.id === 'verizon'
                                ? 'bg-gradient-to-br from-red-500/10 to-black/20 border-red-500/20'
                                : 'bg-gradient-to-br from-pink-500/10 to-black/20 border-pink-500/20'
                            }`}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isp.id === 'verizon' ? 'bg-red-500/20' : 'bg-pink-500/20'
                                    }`}>
                                    <Globe size={20} className={isp.id === 'verizon' ? 'text-red-400' : 'text-pink-400'} />
                                </div>
                                <div>
                                    <div className={`font-bold ${isp.id === 'verizon' ? 'text-red-400' : 'text-pink-400'}`}>
                                        {isp.name}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        ISP {isp.type === 'primary' ? '1 • Primary' : '2 • Failover'}
                                    </div>
                                </div>
                            </div>
                            <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs border ${getStatusColor(isp.status)}`}>
                                {isp.status === 'online' && (
                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                )}
                                <StatusIcon status={isp.status} />
                                <span className="capitalize">{isp.status}</span>
                            </span>
                        </div>

                        <div className="text-sm text-gray-400 space-y-1">
                            <div className="flex justify-between py-1 border-b border-white/5">
                                <span>Model</span>
                                <span className="font-mono text-white">{isp.model}</span>
                            </div>
                            {isp.gatewayLatency !== null && (
                                <div className="flex justify-between py-1 border-b border-white/5">
                                    <span>Gateway Latency</span>
                                    <span className="text-cyan-400">{isp.gatewayLatency}ms</span>
                                </div>
                            )}
                            {isp.externalLatency !== null && (
                                <div className="flex justify-between py-1">
                                    <span>Internet Latency</span>
                                    <span className="text-green-400">{isp.externalLatency}ms</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Router */}
            <div className="p-4 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-cyan-500/10 rounded-xl border border-cyan-500/20 mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/30 to-purple-500/30 flex items-center justify-center">
                            <Router size={24} className="text-cyan-400" />
                        </div>
                        <div>
                            <div className="font-bold text-lg text-cyan-400">
                                {status?.router?.name || NETWORK_CONFIG.ROUTER.name}
                            </div>
                            <div className="text-sm text-gray-400">
                                {status?.router?.role || NETWORK_CONFIG.ROUTER.role} • {NETWORK_CONFIG.ROUTER.mode}
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        {status?.router && (
                            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm border ${getStatusColor(status.router.status)}`}>
                                <StatusIcon status={status.router.status} />
                                <span className="capitalize">{status.router.status}</span>
                                {status.router.latency && (
                                    <span className="text-gray-400">• {status.router.latency}ms</span>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-4 gap-3 mt-4">
                    <div className="p-2 bg-white/5 rounded-lg text-center">
                        <div className="text-xs text-gray-500">WAN Ports</div>
                        <div className="font-bold text-cyan-400">{NETWORK_CONFIG.ROUTER.wanPorts} Active</div>
                    </div>
                    <div className="p-2 bg-white/5 rounded-lg text-center">
                        <div className="text-xs text-gray-500">LAN Ports</div>
                        <div className="font-bold text-green-400">{NETWORK_CONFIG.ROUTER.lanPorts} Gigabit</div>
                    </div>
                    <div className="p-2 bg-white/5 rounded-lg text-center">
                        <div className="text-xs text-gray-500">VPN</div>
                        <div className="font-bold text-purple-400">Enabled</div>
                    </div>
                    <div className="p-2 bg-white/5 rounded-lg text-center">
                        <div className="text-xs text-gray-500">Firewall</div>
                        <div className="font-bold text-yellow-400">Active</div>
                    </div>
                </div>
            </div>

            {/* WiFi Mesh */}
            <div className="p-4 bg-gradient-to-br from-green-500/10 to-black/20 rounded-xl border border-green-500/20 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                            <Wifi size={24} className="text-green-400" />
                        </div>
                        <div>
                            <div className="font-bold text-lg text-green-400">{NETWORK_CONFIG.WIFI.name}</div>
                            <div className="text-sm text-gray-400">
                                {NETWORK_CONFIG.WIFI.standard} {NETWORK_CONFIG.WIFI.topology} System
                            </div>
                        </div>
                    </div>
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-green-500/20 text-green-400 border border-green-500/30">
                        <CheckCircle size={12} />
                        Broadcasting
                    </span>
                </div>
                <div className="p-3 bg-white/5 rounded-lg">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Bands</span>
                        <span className="font-mono text-white">{NETWORK_CONFIG.WIFI.bands.join(' • ')}</span>
                    </div>
                </div>
            </div>

            {/* Speed Test */}
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Zap size={16} className="text-yellow-400" />
                        <span className="font-medium">Speed Test</span>
                    </div>
                    <button
                        onClick={runSpeedTest}
                        disabled={speedTestResult.running}
                        className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${speedTestResult.running
                                ? 'bg-gray-600 cursor-not-allowed'
                                : 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30'
                            }`}
                    >
                        {speedTestResult.running ? (
                            <span className="flex items-center gap-2">
                                <RefreshCw size={12} className="animate-spin" />
                                Testing...
                            </span>
                        ) : (
                            'Run Test'
                        )}
                    </button>
                </div>

                {(speedTestResult.download || speedTestResult.upload || speedTestResult.latency) && (
                    <div className="grid grid-cols-3 gap-3">
                        {speedTestResult.download && (
                            <div className="p-2 bg-white/5 rounded-lg text-center">
                                <div className="text-xs text-gray-500">Download</div>
                                <div className="font-bold text-green-400">{speedTestResult.download} Mbps</div>
                            </div>
                        )}
                        {speedTestResult.upload && (
                            <div className="p-2 bg-white/5 rounded-lg text-center">
                                <div className="text-xs text-gray-500">Upload</div>
                                <div className="font-bold text-cyan-400">{speedTestResult.upload} Mbps</div>
                            </div>
                        )}
                        {speedTestResult.latency && (
                            <div className="p-2 bg-white/5 rounded-lg text-center">
                                <div className="text-xs text-gray-500">Latency</div>
                                <div className="font-bold text-yellow-400">{speedTestResult.latency}ms</div>
                            </div>
                        )}
                    </div>
                )}

                {!speedTestResult.download && !speedTestResult.running && (
                    <p className="text-xs text-gray-500 text-center py-2">
                        Click &quot;Run Test&quot; to measure connection speed
                    </p>
                )}
            </div>
        </motion.div>
    );
}

export default NetworkPanel;
