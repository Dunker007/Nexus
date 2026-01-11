/**
 * DevToolsPanel - Developer utilities and diagnostics
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Code, Terminal, RefreshCw, Copy, Check, ExternalLink,
    Server, Database, Wifi, Clock, ChevronDown, ChevronRight,
    Play, Bug, Trash2
} from 'lucide-react';

interface Endpoint {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    path: string;
    description: string;
}

interface DevToolsPanelProps {
    bridgeUrl: string;
}

export function DevToolsPanel({ bridgeUrl }: DevToolsPanelProps) {
    const [copied, setCopied] = useState<string | null>(null);
    const [expandedSection, setExpandedSection] = useState<string | null>('endpoints');
    const [pingResult, setPingResult] = useState<{ latency: number; status: string } | null>(null);
    const [isPinging, setIsPinging] = useState(false);
    const [wsStatus, setWsStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected');
    const [logs, setLogs] = useState<string[]>([]);

    // API Endpoints
    const endpoints: Endpoint[] = [
        { method: 'GET', path: '/', description: 'Health check' },
        { method: 'GET', path: '/status', description: 'Full system status' },
        { method: 'GET', path: '/health', description: 'Detailed health' },
        { method: 'GET', path: '/system', description: 'System metrics' },
        { method: 'GET', path: '/system/gpu', description: 'GPU stats' },
        { method: 'GET', path: '/llm/models', description: 'All models' },
        { method: 'POST', path: '/llm/chat', description: 'Chat completion' },
        { method: 'GET', path: '/agents', description: 'List agents' },
        { method: 'POST', path: '/agents/execute', description: 'Run agent task' },
        { method: 'GET', path: '/network/status', description: 'Network status' },
        { method: 'POST', path: '/network/speedtest', description: 'Speed test' },
        { method: 'GET', path: '/monitoring/metrics', description: 'Performance metrics' },
        { method: 'GET', path: '/monitoring/errors', description: 'Error logs' },
    ];

    // Environment info
    const envInfo = [
        { label: 'Bridge URL', value: bridgeUrl },
        { label: 'Node.js', value: 'v20.x' },
        { label: 'Next.js', value: '15.x' },
        { label: 'Platform', value: 'Windows' },
    ];

    // Quick commands
    const commands = [
        { id: 'ping', label: 'Ping Bridge', icon: Wifi, action: 'ping' },
        { id: 'clear-cache', label: 'Clear Cache', icon: Trash2, action: 'clearCache' },
        { id: 'reload', label: 'Hard Reload', icon: RefreshCw, action: 'reload' },
        { id: 'console', label: 'Open Console', icon: Terminal, action: 'console' },
    ];

    const pingBridge = useCallback(async () => {
        setIsPinging(true);
        const start = performance.now();

        try {
            const res = await fetch(`${bridgeUrl}/health`);
            const latency = Math.round(performance.now() - start);

            if (res.ok) {
                setPingResult({ latency, status: 'ok' });
                addLog(`✓ Bridge responded in ${latency}ms`);
            } else {
                setPingResult({ latency, status: 'error' });
                addLog(`✗ Bridge returned ${res.status}`);
            }
        } catch (error) {
            setPingResult({ latency: 0, status: 'failed' });
            addLog(`✗ Bridge unreachable: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsPinging(false);
        }
    }, [bridgeUrl]);

    const addLog = (message: string) => {
        const timestamp = new Date().toLocaleTimeString();
        setLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 49)]);
    };

    const copyToClipboard = async (text: string, id: string) => {
        await navigator.clipboard.writeText(text);
        setCopied(id);
        addLog(`Copied: ${text}`);
        setTimeout(() => setCopied(null), 2000);
    };

    const executeCommand = async (action: string) => {
        switch (action) {
            case 'ping':
                await pingBridge();
                break;
            case 'clearCache':
                if (typeof window !== 'undefined' && 'caches' in window) {
                    const keys = await caches.keys();
                    await Promise.all(keys.map(key => caches.delete(key)));
                    addLog('✓ Browser cache cleared');
                }
                break;
            case 'reload':
                addLog('Reloading...');
                window.location.reload();
                break;
            case 'console':
                addLog('Opening dev console (F12)');
                break;
        }
    };

    // Check WebSocket status on mount
    useEffect(() => {
        const checkWs = () => {
            const wsUrl = bridgeUrl.replace('http', 'ws') + '/stream';
            setWsStatus('connecting');

            try {
                const ws = new WebSocket(wsUrl);
                ws.onopen = () => {
                    setWsStatus('connected');
                    addLog('✓ WebSocket connected');
                    ws.close();
                };
                ws.onerror = () => {
                    setWsStatus('disconnected');
                };
                ws.onclose = () => {
                    setWsStatus('disconnected');
                };
            } catch {
                setWsStatus('disconnected');
            }
        };

        checkWs();
    }, [bridgeUrl]);

    const getMethodColor = (method: Endpoint['method']) => {
        switch (method) {
            case 'GET': return 'bg-green-500/20 text-green-400';
            case 'POST': return 'bg-blue-500/20 text-blue-400';
            case 'PUT': return 'bg-yellow-500/20 text-yellow-400';
            case 'DELETE': return 'bg-red-500/20 text-red-400';
        }
    };

    const Section = ({ id, title, icon: Icon, children }: {
        id: string;
        title: string;
        icon: React.ComponentType<{ size?: number; className?: string }>;
        children: React.ReactNode;
    }) => {
        const isExpanded = expandedSection === id;

        return (
            <div className="border border-white/10 rounded-xl overflow-hidden">
                <button
                    onClick={() => setExpandedSection(isExpanded ? null : id)}
                    className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 transition-colors"
                >
                    <div className="flex items-center gap-2">
                        <Icon size={16} className="text-indigo-400" />
                        <span className="font-medium text-sm">{title}</span>
                    </div>
                    {isExpanded ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
                </button>

                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="p-3 bg-black/20">
                                {children}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    };

    return (
        <motion.div
            className="glass-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <Code size={20} className="text-indigo-400" />
                    Developer Tools
                </h2>
                <div className="flex items-center gap-2">
                    <span className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs ${wsStatus === 'connected' ? 'bg-green-500/20 text-green-400' :
                            wsStatus === 'connecting' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-red-500/20 text-red-400'
                        }`}>
                        <span className={`w-2 h-2 rounded-full ${wsStatus === 'connected' ? 'bg-green-500' :
                                wsStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' :
                                    'bg-red-500'
                            }`} />
                        WS {wsStatus}
                    </span>
                </div>
            </div>

            {/* Quick Commands */}
            <div className="grid grid-cols-4 gap-2 mb-6">
                {commands.map(cmd => (
                    <button
                        key={cmd.id}
                        onClick={() => executeCommand(cmd.action)}
                        disabled={cmd.id === 'ping' && isPinging}
                        className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-center group"
                    >
                        {cmd.id === 'ping' && isPinging ? (
                            <RefreshCw size={20} className="mx-auto mb-1 animate-spin text-indigo-400" />
                        ) : (
                            <cmd.icon size={20} className="mx-auto mb-1 text-indigo-400 group-hover:scale-110 transition-transform" />
                        )}
                        <div className="text-xs text-gray-400">{cmd.label}</div>
                    </button>
                ))}
            </div>

            {/* Ping Result */}
            {pingResult && (
                <div className={`flex items-center gap-2 p-2 mb-4 rounded-lg text-sm ${pingResult.status === 'ok' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                    }`}>
                    <Clock size={14} />
                    {pingResult.status === 'ok'
                        ? `Bridge responded in ${pingResult.latency}ms`
                        : 'Bridge unreachable'
                    }
                </div>
            )}

            <div className="space-y-3">
                {/* API Endpoints */}
                <Section id="endpoints" title="API Endpoints" icon={Server}>
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                        {endpoints.map((ep, idx) => (
                            <div
                                key={idx}
                                className="flex items-center justify-between p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors group"
                            >
                                <div className="flex items-center gap-2">
                                    <span className={`px-1.5 py-0.5 rounded text-xs font-mono ${getMethodColor(ep.method)}`}>
                                        {ep.method}
                                    </span>
                                    <span className="text-sm font-mono text-white">{ep.path}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500 hidden group-hover:inline">
                                        {ep.description}
                                    </span>
                                    <button
                                        onClick={() => copyToClipboard(`${bridgeUrl}${ep.path}`, `ep-${idx}`)}
                                        className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                                    >
                                        {copied === `ep-${idx}` ? <Check size={12} /> : <Copy size={12} />}
                                    </button>
                                    <a
                                        href={`${bridgeUrl}${ep.path}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                                    >
                                        <ExternalLink size={12} />
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </Section>

                {/* Environment */}
                <Section id="env" title="Environment" icon={Database}>
                    <div className="space-y-1">
                        {envInfo.map((info, idx) => (
                            <div
                                key={idx}
                                className="flex items-center justify-between p-2 bg-white/5 rounded-lg"
                            >
                                <span className="text-sm text-gray-400">{info.label}</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-mono text-white">{info.value}</span>
                                    <button
                                        onClick={() => copyToClipboard(info.value, `env-${idx}`)}
                                        className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                                    >
                                        {copied === `env-${idx}` ? <Check size={12} /> : <Copy size={12} />}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </Section>

                {/* Console Logs */}
                <Section id="logs" title="Activity Log" icon={Bug}>
                    {logs.length === 0 ? (
                        <div className="text-center py-4 text-gray-500 text-sm">
                            No activity yet
                        </div>
                    ) : (
                        <div className="space-y-1 max-h-32 overflow-y-auto font-mono text-xs">
                            {logs.map((log, idx) => (
                                <div key={idx} className="p-1 text-gray-400 border-l-2 border-indigo-500/30 pl-2">
                                    {log}
                                </div>
                            ))}
                        </div>
                    )}
                </Section>
            </div>

            {/* Footer */}
            <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-gray-500">
                <span>Press F12 for browser DevTools</span>
                <a
                    href={`${bridgeUrl}/api-docs`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300"
                >
                    API Docs <ExternalLink size={10} />
                </a>
            </div>
        </motion.div>
    );
}

export default DevToolsPanel;
