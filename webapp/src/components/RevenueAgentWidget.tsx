'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const LUXRIG_BRIDGE_URL = process.env.NEXT_PUBLIC_BRIDGE_URL || 'http://localhost:3456';

interface RevenueStatus {
    currentProfile: string;
    estimatedDailyRevenue: number;
    lastCheck: string;
    prices?: Record<string, { usd: number; usd_24h_change: number }>;
    profitability?: Record<string, number>;
}

export default function RevenueAgentWidget() {
    const [status, setStatus] = useState<RevenueStatus | null>(null);
    const [loading, setLoading] = useState(false);
    const [optimizing, setOptimizing] = useState(false);

    useEffect(() => {
        fetchStatus();
        const interval = setInterval(fetchStatus, 10000);
        return () => clearInterval(interval);
    }, []);

    async function fetchStatus() {
        try {
            // First check if agent exists/is created
            // For now, we'll just try to execute 'get-status' on the revenue agent
            // If it doesn't exist, the backend creates it on first execute call usually? 
            // Wait, my backend logic in server.js creates agent if not exists on /agents/execute.
            // But here I want to just get status.

            // Let's try to get status directly
            const res = await fetch(`${LUXRIG_BRIDGE_URL}/agents/revenue/status`);
            if (res.ok) {
                // This returns generic agent status. 
                // I need the specific state of the RevenueAgent.
                // The generic status endpoint returns { id, name, status, currentTask, memorySize }
                // It doesn't return the internal state (currentProfile, etc).

                // So I should use /agents/execute with action 'get-status' which returns the state.
                const execRes = await fetch(`${LUXRIG_BRIDGE_URL}/agents/execute`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ agentType: 'revenue', task: { action: 'get-status' } })
                });
                const data = await execRes.json();
                if (data.result) {
                    setStatus(data.result);
                }
            }
        } catch (error) {
            console.error('Failed to fetch revenue status:', error);
        }
    }

    async function optimize() {
        setOptimizing(true);
        try {
            const res = await fetch(`${LUXRIG_BRIDGE_URL}/agents/execute`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    agentType: 'revenue',
                    task: {
                        action: 'optimize-revenue',
                        config: { electricityCost: 0.12 }
                    }
                })
            });
            const data = await res.json();
            if (data.result) {
                setStatus(prev => ({ ...prev, ...data.result }));
            }
        } catch (error) {
            console.error('Optimization failed:', error);
        } finally {
            setOptimizing(false);
        }
    }

    return (
        <motion.div
            className="glass-card relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <span className="text-6xl">💸</span>
            </div>

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-green-500/20 rounded-lg">
                        <span className="text-2xl">🤖</span>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">Revenue Agent</h2>
                        <p className="text-xs text-gray-400">Autonomous Yield Optimizer</p>
                    </div>
                    <div className={`ml-auto px-2 py-1 rounded text-xs ${status ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                        {status ? 'Active' : 'Connecting...'}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-3 bg-white/5 rounded-lg">
                        <div className="text-xs text-gray-500 mb-1">Current Profile</div>
                        <div className="text-lg font-bold text-cyan-400 capitalize">
                            {status?.currentProfile || 'Unknown'}
                        </div>
                    </div>
                    <div className="p-3 bg-white/5 rounded-lg">
                        <div className="text-xs text-gray-500 mb-1">Est. Daily Revenue</div>
                        <div className="text-lg font-bold text-green-400">
                            ${status?.estimatedDailyRevenue?.toFixed(2) || '0.00'}
                        </div>
                    </div>
                </div>

                {status?.prices && (
                    <div className="mb-6">
                        <h3 className="text-xs font-bold text-gray-500 uppercase mb-3">Live Market Data</h3>
                        <div className="space-y-2">
                            {Object.entries(status.prices).map(([coin, data]) => (
                                <div key={coin} className="flex justify-between items-center text-sm">
                                    <span className="capitalize text-gray-300">{coin}</span>
                                    <div className="flex items-center gap-2">
                                        <span>${data.usd.toLocaleString()}</span>
                                        <span className={data.usd_24h_change >= 0 ? 'text-green-400' : 'text-red-400'}>
                                            {data.usd_24h_change >= 0 ? '↑' : '↓'} {Math.abs(data.usd_24h_change).toFixed(1)}%
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <button
                    onClick={optimize}
                    disabled={optimizing}
                    className="w-full btn-primary flex items-center justify-center gap-2"
                >
                    {optimizing ? (
                        <>
                            <span className="animate-spin">⚡</span> Optimizing...
                        </>
                    ) : (
                        <>
                            <span>⚡</span> Run Optimization
                        </>
                    )}
                </button>
            </div>
        </motion.div>
    );
}
