'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { LUXRIG_BRIDGE_URL } from '@/lib/utils';

export default function MonitoringPage() {
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

    interface ErrorLog {
        message: string;
        timestamp: string;
        context?: { method?: string; url?: string };
        stack?: string;
    }

    interface ErrorStats {
        errors: ErrorLog[];
        stats: { last24Hours: number; lastHour: number };
    }

    const [health, setHealth] = useState<Health | null>(null);
    const [metrics, setMetrics] = useState<Metrics | null>(null);
    const [errors, setErrors] = useState<ErrorStats>({ errors: [], stats: { last24Hours: 0, lastHour: 0 } });
    const [refreshInterval, setRefreshInterval] = useState(5000);

    async function loadData() {
        try {
            const [healthRes, metricsRes, errorsRes] = await Promise.all([
                fetch(`${LUXRIG_BRIDGE_URL}/health`),
                fetch(`${LUXRIG_BRIDGE_URL}/monitoring/metrics`),
                fetch(`${LUXRIG_BRIDGE_URL}/monitoring/errors?limit=10`)
            ]);

            if (healthRes.ok) setHealth(await healthRes.json());
            if (metricsRes.ok) setMetrics(await metricsRes.json());
            if (errorsRes.ok) setErrors(await errorsRes.json());
        } catch (error) {
            console.error('Failed to load monitoring data:', error);
        }
    }

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, refreshInterval);
        return () => clearInterval(interval);
    }, [refreshInterval]);

    async function clearErrors() {
        try {
            await fetch(`${LUXRIG_BRIDGE_URL}/monitoring/errors/clear`, { method: 'POST' });
            loadData();
        } catch (error) {
            console.error('Failed to clear errors:', error);
        }
    }

    function formatUptime(seconds: number) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        return `${hours}h ${minutes}m ${secs}s`;
    }

    function formatBytes(bytes: number) {
        return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
    }

    const statusColor = health?.status === 'healthy' ? 'green' :
        health?.status === 'degraded' ? 'yellow' : 'red';

    return (
        <div className="min-h-screen pt-8">
            {/* Header */}
            <section className="section-padding pb-8">
                <div className="container-main">
                    <motion.div
                        className="text-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h1 className="text-5xl md:text-6xl font-bold mb-4">
                            System <span className="text-gradient">Monitoring</span>
                        </h1>
                        <p className="text-xl text-gray-400">
                            Real-time health, performance, and error tracking
                        </p>
                    </motion.div>
                </div>
            </section>

            <section className="container-main pb-16">
                {/* Health Overview */}
                <div className="grid md:grid-cols-4 gap-6 mb-8">
                    <motion.div
                        className="glass-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <div className={`w-4 h-4 rounded-full bg-${statusColor}-500 animate-pulse`}></div>
                            <h3 className="font-bold">System Status</h3>
                        </div>
                        <p className={`text-2xl font-bold text-${statusColor}-400 capitalize`}>
                            {health?.status || 'Loading...'}
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                            Uptime: {health ? formatUptime(health.uptime) : '--'}
                        </p>
                    </motion.div>

                    <motion.div
                        className="glass-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">💾</span>
                            <h3 className="font-bold">Memory</h3>
                        </div>
                        <p className="text-2xl font-bold text-cyan-400">
                            {health ? formatBytes(health.memory.used * 1024 * 1024) : '--'}
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                            of {health ? formatBytes(health.memory.total * 1024 * 1024) : '--'}
                        </p>
                    </motion.div>

                    <motion.div
                        className="glass-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">🔌</span>
                            <h3 className="font-bold">Connections</h3>
                        </div>
                        <p className="text-2xl font-bold text-purple-400">
                            {metrics?.activeConnections ?? '--'}
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                            {metrics?.activeAgents ?? 0} active agents
                        </p>
                    </motion.div>

                    <motion.div
                        className="glass-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">⚠️</span>
                            <h3 className="font-bold">Errors (24h)</h3>
                        </div>
                        <p className="text-2xl font-bold text-red-400">
                            {errors.stats?.last24Hours ?? 0}
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                            {errors.stats?.lastHour ?? 0} in last hour
                        </p>
                    </motion.div>
                </div>

                <div className="grid lg:grid-cols-2 gap-6 mb-8">
                    {/* Service Status */}
                    <motion.div
                        className="glass-card"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h2 className="text-xl font-bold mb-4">🔧 Service Status</h2>
                        <div className="space-y-3">
                            {health?.services && Object.entries(health.services).map(([service, status]) => (
                                <div key={service} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                    <span className="font-medium capitalize">{service}</span>
                                    <span className={`px-3 py-1 rounded-full text-sm ${status === 'up' ? 'bg-green-500/20 text-green-400' :
                                        status === 'degraded' ? 'bg-yellow-500/20 text-yellow-400' :
                                            'bg-red-500/20 text-red-400'
                                        }`}>
                                        {status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Performance Metrics */}
                    <motion.div
                        className="glass-card"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h2 className="text-xl font-bold mb-4">📊 Performance</h2>
                        <div className="space-y-3">
                            <div className="p-3 bg-white/5 rounded-lg">
                                <div className="flex justify-between mb-1">
                                    <span className="text-sm text-gray-400">Heap Used</span>
                                    <span className="font-mono text-sm">
                                        {metrics ? formatBytes(metrics.memory.heapUsed) : '--'}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-2">
                                    <div
                                        className="bg-cyan-500 h-2 rounded-full transition-all"
                                        style={{
                                            width: metrics ? `${(metrics.memory.heapUsed / metrics.memory.heapTotal) * 100}%` : '0%'
                                        }}
                                    ></div>
                                </div>
                            </div>

                            <div className="p-3 bg-white/5 rounded-lg">
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-400">Platform</span>
                                    <span className="font-mono text-sm">{metrics?.platform ?? '--'}</span>
                                </div>
                            </div>

                            <div className="p-3 bg-white/5 rounded-lg">
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-400">Node Version</span>
                                    <span className="font-mono text-sm">{metrics?.nodeVersion ?? '--'}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Error Log */}
                <motion.div
                    className="glass-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold">🐛 Recent Errors</h2>
                        <button
                            onClick={clearErrors}
                            className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm"
                        >
                            Clear All
                        </button>
                    </div>

                    {errors.errors && errors.errors.length > 0 ? (
                        <div className="space-y-3 max-h-[400px] overflow-y-auto">
                            {errors.errors.map((error, i) => (
                                <div key={i} className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                                    <div className="flex items-start justify-between mb-2">
                                        <span className="font-bold text-red-400">{error.message}</span>
                                        <span className="text-xs text-gray-400">
                                            {new Date(error.timestamp).toLocaleTimeString()}
                                        </span>
                                    </div>
                                    {error.context && (
                                        <div className="text-sm text-gray-400">
                                            <span className="font-mono">{error.context.method} {error.context.url}</span>
                                        </div>
                                    )}
                                    {error.stack && (
                                        <details className="mt-2">
                                            <summary className="text-xs text-gray-500 cursor-pointer">Stack trace</summary>
                                            <pre className="text-xs text-gray-500 mt-2 overflow-x-auto">
                                                {error.stack}
                                            </pre>
                                        </details>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-gray-400 mb-2">✨ No errors logged</p>
                            <p className="text-sm text-gray-500">System is running smoothly</p>
                        </div>
                    )}
                </motion.div>

                {/* Refresh Controls */}
                <motion.div
                    className="glass-card mt-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Auto-refresh interval</span>
                        <select
                            value={refreshInterval}
                            onChange={(e) => setRefreshInterval(Number(e.target.value))}
                            className="bg-white/10 border border-white/20 rounded-lg px-4 py-2"
                        >
                            <option value={1000}>1 second</option>
                            <option value={5000}>5 seconds</option>
                            <option value={10000}>10 seconds</option>
                            <option value={30000}>30 seconds</option>
                            <option value={60000}>1 minute</option>
                        </select>
                    </div>
                </motion.div>
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
