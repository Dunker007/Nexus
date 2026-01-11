/**
 * AgentsPanel - Monitor and control AI agents
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bot, Play, Pause, Square, RefreshCw, ChevronDown, ChevronRight,
    Clock, Activity, CheckCircle, AlertTriangle, XCircle,
    Terminal, History, Settings, Zap
} from 'lucide-react';

interface AgentInfo {
    id: string;
    name: string;
    description?: string;
    status: 'running' | 'idle' | 'paused' | 'error' | 'completed';
    currentTask?: string;
    lastRun?: string;
    memorySize?: number;
    capabilities?: string[];
}

interface AgentLog {
    id: string;
    agent: string;
    message: string;
    timestamp: string;
    type: 'info' | 'error' | 'success' | 'warning';
}

interface AgentsPanelProps {
    bridgeUrl: string;
    refreshInterval?: number;
}

export function AgentsPanel({ bridgeUrl, refreshInterval = 10000 }: AgentsPanelProps) {
    const [agents, setAgents] = useState<{ active: AgentInfo[]; available: { type: string; name: string }[] }>({
        active: [],
        available: [],
    });
    const [logs, setLogs] = useState<AgentLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [expandedAgent, setExpandedAgent] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [showLogs, setShowLogs] = useState(false);

    const fetchAgents = useCallback(async () => {
        if (!bridgeUrl) return;

        setIsRefreshing(true);

        try {
            const res = await fetch(`${bridgeUrl}/agents`);
            if (res.ok) {
                const data = await res.json();
                setAgents({
                    active: data.active || [],
                    available: data.available || [],
                });
            }
        } catch (error) {
            console.warn('Failed to fetch agents:', error);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [bridgeUrl]);

    useEffect(() => {
        fetchAgents();
        const interval = setInterval(fetchAgents, refreshInterval);
        return () => clearInterval(interval);
    }, [fetchAgents, refreshInterval]);

    const executeAgent = async (agentType: string, task: string) => {
        setActionLoading(agentType);
        try {
            const res = await fetch(`${bridgeUrl}/agents/execute`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ agentType, task }),
            });

            if (res.ok) {
                const result = await res.json();
                // Add to logs
                setLogs(prev => [{
                    id: `${Date.now()}`,
                    agent: agentType,
                    message: `Task completed: ${task}`,
                    timestamp: new Date().toISOString(),
                    type: 'success',
                }, ...prev.slice(0, 49)]);

                await fetchAgents();
            }
        } catch (error) {
            setLogs(prev => [{
                id: `${Date.now()}`,
                agent: agentType,
                message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
                timestamp: new Date().toISOString(),
                type: 'error',
            }, ...prev.slice(0, 49)]);
        } finally {
            setActionLoading(null);
        }
    };

    const resetAgent = async (agentType: string) => {
        setActionLoading(agentType);
        try {
            await fetch(`${bridgeUrl}/agents/${agentType}/reset`, { method: 'POST' });
            await fetchAgents();

            setLogs(prev => [{
                id: `${Date.now()}`,
                agent: agentType,
                message: 'Agent reset successfully',
                timestamp: new Date().toISOString(),
                type: 'info',
            }, ...prev.slice(0, 49)]);
        } catch (error) {
            console.error('Failed to reset agent:', error);
        } finally {
            setActionLoading(null);
        }
    };

    const getStatusIcon = (status: AgentInfo['status']) => {
        switch (status) {
            case 'running':
                return <Activity size={14} className="text-green-400 animate-pulse" />;
            case 'idle':
                return <Clock size={14} className="text-gray-400" />;
            case 'paused':
                return <Pause size={14} className="text-yellow-400" />;
            case 'error':
                return <XCircle size={14} className="text-red-400" />;
            case 'completed':
                return <CheckCircle size={14} className="text-cyan-400" />;
            default:
                return <Clock size={14} className="text-gray-400" />;
        }
    };

    const getStatusColor = (status: AgentInfo['status']) => {
        switch (status) {
            case 'running':
                return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'idle':
                return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
            case 'paused':
                return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            case 'error':
                return 'bg-red-500/20 text-red-400 border-red-500/30';
            case 'completed':
                return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
            default:
                return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        }
    };

    const formatTime = (isoString?: string) => {
        if (!isoString) return 'Never';
        const date = new Date(isoString);
        return date.toLocaleTimeString();
    };

    // Quick actions for common agent tasks
    const quickActions = [
        { type: 'housekeeper', task: 'Sync files and clean up', icon: '🧹', label: 'Housekeeper' },
        { type: 'revenue', task: 'Collect revenue data', icon: '💰', label: 'Revenue' },
        { type: 'researcher', task: 'Research current trends', icon: '🔍', label: 'Researcher' },
        { type: 'analyst', task: 'Analyze system metrics', icon: '📊', label: 'Analyst' },
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
                    <Bot size={20} className="text-green-400" />
                    Agent Console
                </h2>
                <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-400">
                        <span className="text-green-400 font-bold">{agents.active.length}</span> active
                    </span>
                    <button
                        onClick={() => setShowLogs(!showLogs)}
                        className={`p-2 rounded-lg transition-colors ${showLogs ? 'bg-purple-500/20 text-purple-400' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                        title="Toggle logs"
                    >
                        <Terminal size={14} />
                    </button>
                    <button
                        onClick={fetchAgents}
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

            {/* Quick Actions */}
            <div className="grid grid-cols-4 gap-2 mb-6">
                {quickActions.map(action => (
                    <button
                        key={action.type}
                        onClick={() => executeAgent(action.type, action.task)}
                        disabled={actionLoading === action.type}
                        className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-center group"
                    >
                        <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">
                            {actionLoading === action.type ? (
                                <RefreshCw size={24} className="mx-auto animate-spin text-green-400" />
                            ) : (
                                action.icon
                            )}
                        </div>
                        <div className="text-xs text-gray-400">{action.label}</div>
                    </button>
                ))}
            </div>

            {/* Loading State */}
            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <RefreshCw size={24} className="animate-spin text-green-400" />
                </div>
            ) : (
                <>
                    {/* Active Agents */}
                    {agents.active.length > 0 && (
                        <div className="space-y-3 mb-6">
                            <h3 className="text-sm font-medium text-gray-400 flex items-center gap-2">
                                <Activity size={14} />
                                Active Agents
                            </h3>
                            {agents.active.map((agent) => (
                                <div
                                    key={agent.id}
                                    className="border border-white/10 rounded-xl overflow-hidden"
                                >
                                    {/* Agent Header */}
                                    <button
                                        onClick={() => setExpandedAgent(expandedAgent === agent.id ? null : agent.id)}
                                        className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                                                <Bot size={20} className="text-green-400" />
                                            </div>
                                            <div className="text-left">
                                                <div className="font-medium text-white">{agent.name}</div>
                                                <div className="text-xs text-gray-500">
                                                    {agent.description || `Agent: ${agent.id}`}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs border ${getStatusColor(agent.status)}`}>
                                                {getStatusIcon(agent.status)}
                                                <span className="capitalize">{agent.status}</span>
                                            </span>
                                            {expandedAgent === agent.id
                                                ? <ChevronDown size={16} className="text-gray-400" />
                                                : <ChevronRight size={16} className="text-gray-400" />
                                            }
                                        </div>
                                    </button>

                                    {/* Expanded Details */}
                                    <AnimatePresence>
                                        {expandedAgent === agent.id && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="p-4 border-t border-white/10 space-y-3">
                                                    {/* Current Task */}
                                                    {agent.currentTask && (
                                                        <div className="p-3 bg-white/5 rounded-lg">
                                                            <div className="text-xs text-gray-500 mb-1">Current Task</div>
                                                            <div className="text-sm text-white">{agent.currentTask}</div>
                                                        </div>
                                                    )}

                                                    {/* Stats */}
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div className="p-3 bg-white/5 rounded-lg">
                                                            <div className="text-xs text-gray-500">Memory</div>
                                                            <div className="font-bold text-cyan-400">
                                                                {agent.memorySize || 0} items
                                                            </div>
                                                        </div>
                                                        <div className="p-3 bg-white/5 rounded-lg">
                                                            <div className="text-xs text-gray-500">Last Run</div>
                                                            <div className="font-bold text-green-400">
                                                                {formatTime(agent.lastRun)}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => resetAgent(agent.id.split('-')[0])}
                                                            disabled={actionLoading === agent.id}
                                                            className="flex-1 flex items-center justify-center gap-2 p-2 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30 transition-colors"
                                                        >
                                                            <RefreshCw size={14} />
                                                            Reset
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Available Agent Types */}
                    {agents.available.length > 0 && (
                        <div className="space-y-3">
                            <h3 className="text-sm font-medium text-gray-400 flex items-center gap-2">
                                <Zap size={14} />
                                Available Agents
                            </h3>
                            <div className="grid grid-cols-2 gap-2">
                                {agents.available.map((agent) => (
                                    <div
                                        key={agent.type}
                                        className="p-3 bg-white/5 rounded-lg flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Bot size={16} className="text-gray-400" />
                                            <span className="text-sm text-gray-300">{agent.name}</span>
                                        </div>
                                        <button
                                            onClick={() => executeAgent(agent.type, `Initialize ${agent.type}`)}
                                            disabled={actionLoading === agent.type}
                                            className="p-1.5 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
                                        >
                                            {actionLoading === agent.type ? (
                                                <RefreshCw size={12} className="animate-spin" />
                                            ) : (
                                                <Play size={12} />
                                            )}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Empty State */}
                    {agents.active.length === 0 && agents.available.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            <Bot size={48} className="mx-auto mb-4 opacity-30" />
                            <p>No agents configured</p>
                            <p className="text-sm mt-2">
                                Agents will appear when tasks are executed
                            </p>
                        </div>
                    )}
                </>
            )}

            {/* Logs Panel */}
            <AnimatePresence>
                {showLogs && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="mt-6 border-t border-white/10 pt-4">
                            <h3 className="text-sm font-medium text-gray-400 flex items-center gap-2 mb-3">
                                <History size={14} />
                                Recent Activity
                            </h3>

                            {logs.length === 0 ? (
                                <div className="text-center py-6 text-gray-500 text-sm">
                                    No activity logs yet
                                </div>
                            ) : (
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {logs.map((log) => (
                                        <div
                                            key={log.id}
                                            className={`p-2 rounded-lg text-xs flex items-start gap-2 ${log.type === 'error' ? 'bg-red-500/10 text-red-400' :
                                                    log.type === 'success' ? 'bg-green-500/10 text-green-400' :
                                                        log.type === 'warning' ? 'bg-yellow-500/10 text-yellow-400' :
                                                            'bg-white/5 text-gray-400'
                                                }`}
                                        >
                                            <span className="text-gray-600 whitespace-nowrap">
                                                {formatTime(log.timestamp)}
                                            </span>
                                            <span className="font-medium">[{log.agent}]</span>
                                            <span className="flex-1">{log.message}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

export default AgentsPanel;
