'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { LUXRIG_BRIDGE_URL } from '@/lib/utils';

const BRIDGE_URL = LUXRIG_BRIDGE_URL;

interface ServiceStatus {
    name: string;
    status: 'operational' | 'degraded' | 'down' | 'checking';
    latency?: number;
    icon: string;
}

export default function StatusPage() {
    const [services, setServices] = useState<ServiceStatus[]>([
        { name: 'LuxRig Bridge', status: 'checking', icon: '🌉' },
        { name: 'LM Studio API', status: 'checking', icon: '🖥️' },
        { name: 'Ollama API', status: 'checking', icon: '🦙' },
        { name: 'Website', status: 'operational', latency: 45, icon: '🌐' },
        { name: 'GPU Metrics', status: 'checking', icon: '🎮' },
    ]);

    const [systemInfo, setSystemInfo] = useState<any>(null);
    const [lastChecked, setLastChecked] = useState<Date>(new Date());
    const [overallStatus, setOverallStatus] = useState<'operational' | 'degraded' | 'down'>('operational');

    async function checkAllServices() {
        const startTime = Date.now();

        try {
            // Check Bridge
            const bridgeRes = await fetch(`${BRIDGE_URL}/status`);
            const bridgeLatency = Date.now() - startTime;

            if (bridgeRes.ok) {
                updateService('LuxRig Bridge', 'operational', bridgeLatency);
            } else {
                updateService('LuxRig Bridge', 'down');
            }

            // Check LM Studio
            try {
                const lmRes = await fetch(`${BRIDGE_URL}/llm/lmstudio/models`);
                if (lmRes.ok) {
                    const data = await lmRes.json();
                    updateService('LM Studio API', data.length > 0 ? 'operational' : 'degraded');
                } else {
                    updateService('LM Studio API', 'down');
                }
            } catch {
                updateService('LM Studio API', 'down');
            }

            // Check Ollama
            try {
                const ollamaRes = await fetch(`${BRIDGE_URL}/llm/ollama/models`);
                if (ollamaRes.ok) {
                    const data = await ollamaRes.json();
                    updateService('Ollama API', data.length > 0 ? 'operational' : 'degraded');
                } else {
                    updateService('Ollama API', 'down');
                }
            } catch {
                updateService('Ollama API', 'down');
            }

            // Check GPU Metrics
            try {
                const gpuRes = await fetch(`${BRIDGE_URL}/system`);
                if (gpuRes.ok) {
                    const data = await gpuRes.json();
                    setSystemInfo(data);
                    updateService('GPU Metrics', 'operational');
                } else {
                    updateService('GPU Metrics', 'down');
                }
            } catch {
                updateService('GPU Metrics', 'down');
            }

        } catch (e) {
            // Bridge is down
            updateService('LuxRig Bridge', 'down');
            updateService('LM Studio API', 'down');
            updateService('Ollama API', 'down');
            updateService('GPU Metrics', 'down');
        }

        setLastChecked(new Date());
        updateOverallStatus();
    }

    useEffect(() => {
        checkAllServices();
        const interval = setInterval(checkAllServices, 30000); // Check every 30s
        return () => clearInterval(interval);
    }, []);

    function updateService(name: string, status: ServiceStatus['status'], latency?: number) {
        setServices(prev => prev.map(s =>
            s.name === name ? { ...s, status, latency } : s
        ));
    }

    function updateOverallStatus() {
        setServices(prev => {
            const down = prev.filter(s => s.status === 'down').length;
            const degraded = prev.filter(s => s.status === 'degraded').length;

            if (down >= 2) {
                setOverallStatus('down');
            } else if (down > 0 || degraded > 0) {
                setOverallStatus('degraded');
            } else {
                setOverallStatus('operational');
            }
            return prev;
        });
    }

    const statusColors = {
        operational: { bg: 'bg-green-500', text: 'text-green-400', label: 'Operational' },
        degraded: { bg: 'bg-yellow-500', text: 'text-yellow-400', label: 'Degraded' },
        down: { bg: 'bg-red-500', text: 'text-red-400', label: 'Down' },
        checking: { bg: 'bg-gray-500', text: 'text-gray-400', label: 'Checking...' },
    };

    const overallStatusConfig = statusColors[overallStatus];

    return (
        <div className="min-h-screen pt-8">
            {/* Header */}
            <section className="section-padding pb-12">
                <div className="container-main">
                    <motion.div
                        className="text-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h1 className="text-5xl md:text-6xl font-bold mb-4">
                            System <span className="text-gradient">Status</span>
                        </h1>
                        <p className="text-xl text-gray-400">
                            Real-time status of DLX Studio services on LuxRig
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Overall Status */}
            <section className="container-main pb-12">
                <motion.div
                    className={`glass-card text-center py-8 border-2 ${overallStatus === 'operational' ? 'border-green-500/30' :
                        overallStatus === 'degraded' ? 'border-yellow-500/30' : 'border-red-500/30'
                        }`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-full ${overallStatusConfig.bg}/20`}>
                        <span className={`w-3 h-3 rounded-full ${overallStatusConfig.bg} animate-pulse`}></span>
                        <span className={`text-xl font-bold ${overallStatusConfig.text}`}>
                            {overallStatus === 'operational' ? 'All Systems Operational' :
                                overallStatus === 'degraded' ? 'Some Services Degraded' : 'Major Outage'}
                        </span>
                    </div>
                    <p className="text-gray-500 mt-4 text-sm">
                        Last checked: {lastChecked.toLocaleTimeString()}
                    </p>
                </motion.div>
            </section>

            {/* Services Grid */}
            <section className="container-main pb-12">
                <h2 className="text-xl font-bold mb-6">Services</h2>
                <motion.div
                    className="space-y-4"
                    initial="initial"
                    animate="animate"
                    variants={{ animate: { transition: { staggerChildren: 0.05 } } }}
                >
                    {services.map((service) => {
                        const config = statusColors[service.status];
                        return (
                            <motion.div
                                key={service.name}
                                className="glass-card flex items-center justify-between"
                                variants={{ initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 } }}
                            >
                                <div className="flex items-center gap-4">
                                    <span className="text-2xl">{service.icon}</span>
                                    <span className="font-medium">{service.name}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    {service.latency && (
                                        <span className="text-sm text-gray-500">{service.latency}ms</span>
                                    )}
                                    <span className={`flex items-center gap-2 px-3 py-1 rounded-full ${config.bg}/20 ${config.text}`}>
                                        <span className={`w-2 h-2 rounded-full ${config.bg} ${service.status === 'operational' ? 'animate-pulse' : ''}`}></span>
                                        {config.label}
                                    </span>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </section>

            {/* System Info */}
            {systemInfo && (
                <section className="container-main pb-12">
                    <h2 className="text-xl font-bold mb-6">System Metrics</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="glass-card text-center">
                            <div className="text-3xl mb-2">🎮</div>
                            <div className="text-2xl font-bold text-cyan-400">
                                {systemInfo.gpu?.utilization || 'N/A'}%
                            </div>
                            <div className="text-sm text-gray-500">GPU Usage</div>
                        </div>
                        <div className="glass-card text-center">
                            <div className="text-3xl mb-2">🌡️</div>
                            <div className="text-2xl font-bold text-yellow-400">
                                {systemInfo.gpu?.temp || 'N/A'}°C
                            </div>
                            <div className="text-sm text-gray-500">GPU Temp</div>
                        </div>
                        <div className="glass-card text-center">
                            <div className="text-3xl mb-2">💾</div>
                            <div className="text-2xl font-bold text-purple-400">
                                {systemInfo.memory?.used ? `${(systemInfo.memory.used / 1024).toFixed(1)}GB` : 'N/A'}
                            </div>
                            <div className="text-sm text-gray-500">RAM Used</div>
                        </div>
                        <div className="glass-card text-center">
                            <div className="text-3xl mb-2">⚡</div>
                            <div className="text-2xl font-bold text-green-400">
                                {systemInfo.gpu?.power || 'N/A'}W
                            </div>
                            <div className="text-sm text-gray-500">GPU Power</div>
                        </div>
                    </div>
                </section>
            )}

            {/* Incident History */}
            <section className="section-padding bg-[#050508]">
                <div className="container-main">
                    <h2 className="text-xl font-bold mb-6">Recent Incidents</h2>
                    <div className="space-y-4">
                        <div className="glass-card">
                            <div className="flex items-start gap-3">
                                <span className="text-green-400">✓</span>
                                <div>
                                    <h3 className="font-medium">No incidents reported</h3>
                                    <p className="text-sm text-gray-500">All systems have been operating normally for the past 30 days.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Subscribe */}
            <section className="section-padding">
                <div className="container-main">
                    <motion.div
                        className="glass-card text-center py-12"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl font-bold mb-4">Get Status Updates</h2>
                        <p className="text-gray-400 mb-6">
                            Subscribe to receive notifications when services go down or recover.
                        </p>
                        <button
                            onClick={checkAllServices}
                            className="btn-primary"
                        >
                            Refresh Status
                        </button>
                    </motion.div>
                </div>
            </section>

            {/* Back link */}
            <div className="container-main py-8">
                <Link href="/" className="text-gray-400 hover:text-cyan-400 transition-colors">
                    ← Back to Dashboard
                </Link>
            </div>
        </div>
    );
}
