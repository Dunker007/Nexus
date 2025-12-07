'use client';

import { useState, useEffect } from 'react';
import { LUXRIG_BRIDGE_URL } from '@/lib/utils';

interface ServiceStatus {
    online: boolean;
    url?: string;
    modelCount?: number;
    loadedModel?: string;
    runningModels?: string[];
    error?: string;
}

interface SystemMetrics {
    gpu: {
        available: boolean;
        name?: string;
        utilization?: number;
        memoryUsedGB?: string;
        memoryTotalGB?: string;
        memoryPercent?: string;
        temperature?: number;
        powerDraw?: number;
    };
    cpu: {
        name?: string;
        cores?: number;
        utilization?: number;
    };
    memory: {
        totalGB?: string;
        usedGB?: string;
        percentUsed?: string;
    };
}

interface BridgeStatus {
    timestamp: string;
    services: {
        lmstudio: ServiceStatus;
        ollama: ServiceStatus;
    };
    system: SystemMetrics;
}

// Derive WebSocket URL from bridge URL
const WS_URL = LUXRIG_BRIDGE_URL.replace('http://', 'ws://').replace('https://', 'wss://');

export default function SystemStatus() {
    const [status, setStatus] = useState<BridgeStatus | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        async function fetchStatus() {
            try {
                const res = await fetch(`${LUXRIG_BRIDGE_URL}/status`);
                const data = await res.json();
                setStatus(data);
                setError(null);
            } catch {
                setError('Failed to connect to LuxRig');
            }
        }

        // Initial fetch
        fetchStatus();

        // WebSocket for real-time updates
        const ws = new WebSocket(`${WS_URL}/stream`);

        ws.onopen = () => {
            // console.log('🔌 Connected to LuxRig Bridge');
            setConnected(true);
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'status') {
                setStatus(data.data);
                setError(null);
            }
        };

        ws.onerror = () => {
            setError('WebSocket connection failed');
            setConnected(false);
        };

        ws.onclose = () => {
            setConnected(false);
        };

        return () => ws.close();
    }, []);

    if (error && !status) {
        return (
            <div className="glass-card">
                <div className="flex items-center gap-3 mb-4">
                    <div className="status-dot offline"></div>
                    <span className="text-red-400">LuxRig Offline</span>
                </div>
                <p className="text-sm text-gray-400">{error}</p>
            </div>
        );
    }

    if (!status) {
        return (
            <div className="glass-card">
                <div className="skeleton h-20 w-full"></div>
            </div>
        );
    }

    // Safely access services with defaults
    const lmstudio = status.services?.lmstudio || { online: false };
    const ollama = status.services?.ollama || { online: false };
    const gpu = status.system?.gpu || { available: false };
    const cpu = status.system?.cpu || {};
    const memory = status.system?.memory || {};

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* LM Studio Status */}
            <div className="glass-card">
                <div className="flex items-center gap-3 mb-4">
                    <div className={`status-dot ${lmstudio.online ? 'online' : 'offline'}`}></div>
                    <span className="font-semibold">LM Studio</span>
                </div>
                {lmstudio.online ? (
                    <>
                        <p className="text-sm text-gray-400 mb-1">
                            {lmstudio.modelCount} models
                        </p>
                        <p className="text-cyan-400 text-sm truncate">
                            🧠 {lmstudio.loadedModel || 'No model loaded'}
                        </p>
                    </>
                ) : (
                    <p className="text-sm text-red-400">Not responding</p>
                )}
            </div>

            {/* Ollama Status */}
            <div className="glass-card">
                <div className="flex items-center gap-3 mb-4">
                    <div className={`status-dot ${ollama.online ? 'online' : 'offline'}`}></div>
                    <span className="font-semibold">Ollama</span>
                </div>
                {ollama.online ? (
                    <>
                        <p className="text-sm text-gray-400 mb-1">
                            {ollama.modelCount} models
                        </p>
                        <p className="text-purple-400 text-sm">
                            {ollama.runningModels?.length
                                ? `Running: ${ollama.runningModels.join(', ')}`
                                : 'Ready'}
                        </p>
                    </>
                ) : (
                    <p className="text-sm text-red-400">Not responding</p>
                )}
            </div>

            {/* GPU Status */}
            <div className="glass-card">
                <div className="flex items-center gap-3 mb-4">
                    <div className={`status-dot ${gpu.available ? 'online' : 'offline'}`}></div>
                    <span className="font-semibold">GPU</span>
                </div>
                {gpu.available ? (
                    <>
                        <p className="text-sm text-gray-400 mb-1 truncate">
                            {gpu.name}
                        </p>
                        <div className="flex justify-between text-sm">
                            <span className="text-cyan-400">
                                {gpu.memoryUsedGB}/{gpu.memoryTotalGB}GB
                            </span>
                            <span className="text-yellow-400">
                                {gpu.temperature}°C
                            </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                            <div
                                className="bg-gradient-to-r from-cyan-500 to-purple-500 h-2 rounded-full transition-all"
                                style={{ width: `${gpu.memoryPercent || 0}%` }}
                            ></div>
                        </div>
                    </>
                ) : (
                    <p className="text-sm text-red-400">Not available</p>
                )}
            </div>

            {/* System Status */}
            <div className="glass-card">
                <div className="flex items-center gap-3 mb-4">
                    <div className="status-dot online"></div>
                    <span className="font-semibold">System</span>
                </div>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-400">CPU</span>
                        <span className="text-cyan-400">{cpu.utilization || 0}%</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-400">RAM</span>
                        <span className="text-purple-400">
                            {memory.usedGB || '?'}/{memory.totalGB || '?'}GB
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
