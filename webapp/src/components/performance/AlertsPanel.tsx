/**
 * AlertsPanel - System alerts and notification management
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bell, AlertTriangle, AlertCircle, CheckCircle, Info,
    X, Settings, Volume2, VolumeX, Trash2
} from 'lucide-react';
import { THRESHOLDS } from '@/lib/luxrig/constants';

interface Alert {
    id: string;
    type: 'critical' | 'warning' | 'info' | 'success';
    title: string;
    message: string;
    source: string;
    timestamp: string;
    acknowledged: boolean;
}

interface AlertThreshold {
    id: string;
    name: string;
    metric: string;
    operator: '>' | '<' | '=' | '>=';
    value: number;
    unit: string;
    enabled: boolean;
}

interface AlertsPanelProps {
    bridgeUrl?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    systemData?: any;
}

export function AlertsPanel({ systemData }: AlertsPanelProps) {
    const [alerts, setAlerts] = useState<Alert[]>(() => [
        {
            id: '1',
            type: 'info',
            title: 'System Started',
            message: 'LuxRig Command Center is now monitoring your system.',
            source: 'System',
            timestamp: new Date().toISOString(),
            acknowledged: true,
        },
    ]);
    const [showSettings, setShowSettings] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [thresholds, setThresholds] = useState<AlertThreshold[]>([
        { id: 'gpu-temp', name: 'GPU Temperature', metric: 'gpu.temperature', operator: '>', value: THRESHOLDS.GPU_TEMP.WARNING, unit: '°C', enabled: true },
        { id: 'gpu-temp-crit', name: 'GPU Critical Temp', metric: 'gpu.temperature', operator: '>', value: THRESHOLDS.GPU_TEMP.CRITICAL, unit: '°C', enabled: true },
        { id: 'vram-usage', name: 'VRAM Usage', metric: 'vram.percent', operator: '>', value: THRESHOLDS.VRAM.WARNING, unit: '%', enabled: true },
        { id: 'ram-usage', name: 'RAM Usage', metric: 'ram.percent', operator: '>', value: THRESHOLDS.RAM.WARNING, unit: '%', enabled: true },
        { id: 'disk-usage', name: 'Disk Usage', metric: 'disk.percent', operator: '>', value: THRESHOLDS.DISK.WARNING, unit: '%', enabled: true },
    ]);

    // Generate alerts based on system data
    const checkThresholds = useCallback(() => {
        if (!systemData) return;

        const newAlerts: Alert[] = [];
        const now = new Date().toISOString();

        // Extract GPU temp - handle different data shapes
        const gpu = systemData.gpu as { temp?: number; temperature?: number } | undefined;
        const gpuTemp = gpu?.temp ?? gpu?.temperature;

        if (typeof gpuTemp === 'number') {
            if (gpuTemp >= THRESHOLDS.GPU_TEMP.CRITICAL) {
                newAlerts.push({
                    id: `gpu-temp-crit-${Date.now()}`,
                    type: 'critical',
                    title: 'GPU Temperature Critical',
                    message: `GPU is at ${gpuTemp}°C - immediate action required!`,
                    source: 'GPU Monitor',
                    timestamp: now,
                    acknowledged: false,
                });
            } else if (gpuTemp >= THRESHOLDS.GPU_TEMP.WARNING) {
                newAlerts.push({
                    id: `gpu-temp-warn-${Date.now()}`,
                    type: 'warning',
                    title: 'GPU Temperature High',
                    message: `GPU is at ${gpuTemp}°C - consider improving cooling`,
                    source: 'GPU Monitor',
                    timestamp: now,
                    acknowledged: false,
                });
            }
        }

        // Add new alerts (avoid duplicates)
        if (newAlerts.length > 0) {
            setAlerts(prev => {
                const existing = new Set(prev.map(a => a.title));
                const unique = newAlerts.filter(a => !existing.has(a.title) || !a.acknowledged);
                return [...unique, ...prev].slice(0, 50);
            });
        }
    }, [systemData]);

    // Monitor thresholds when system data changes
    useEffect(() => {
        if (!systemData) return;
        checkThresholds();
    }, [systemData, checkThresholds]);


    const acknowledgeAlert = (id: string) => {
        setAlerts(prev => prev.map(a =>
            a.id === id ? { ...a, acknowledged: true } : a
        ));
    };

    const dismissAlert = (id: string) => {
        setAlerts(prev => prev.filter(a => a.id !== id));
    };

    const clearAll = () => {
        setAlerts([]);
    };

    const toggleThreshold = (id: string) => {
        setThresholds(prev => prev.map(t =>
            t.id === id ? { ...t, enabled: !t.enabled } : t
        ));
    };

    const getAlertIcon = (type: Alert['type']) => {
        switch (type) {
            case 'critical':
                return <AlertCircle size={16} className="text-red-400" />;
            case 'warning':
                return <AlertTriangle size={16} className="text-yellow-400" />;
            case 'success':
                return <CheckCircle size={16} className="text-green-400" />;
            default:
                return <Info size={16} className="text-blue-400" />;
        }
    };

    const getAlertStyle = (type: Alert['type'], acknowledged: boolean) => {
        const opacity = acknowledged ? 'opacity-60' : '';
        switch (type) {
            case 'critical':
                return `bg-red-500/10 border-red-500/30 ${opacity}`;
            case 'warning':
                return `bg-yellow-500/10 border-yellow-500/30 ${opacity}`;
            case 'success':
                return `bg-green-500/10 border-green-500/30 ${opacity}`;
            default:
                return `bg-blue-500/10 border-blue-500/30 ${opacity}`;
        }
    };

    const formatTime = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const unacknowledgedCount = alerts.filter(a => !a.acknowledged).length;
    const criticalCount = alerts.filter(a => a.type === 'critical' && !a.acknowledged).length;

    return (
        <motion.div
            className="glass-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <Bell size={20} className="text-orange-400" />
                    Alerts
                    {unacknowledgedCount > 0 && (
                        <span className={`px-2 py-0.5 rounded-full text-xs ${criticalCount > 0 ? 'bg-red-500 text-white animate-pulse' : 'bg-orange-500/20 text-orange-400'
                            }`}>
                            {unacknowledgedCount}
                        </span>
                    )}
                </h2>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setSoundEnabled(!soundEnabled)}
                        className={`p-2 rounded-lg transition-colors ${soundEnabled ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-gray-400'
                            }`}
                        title={soundEnabled ? 'Sound on' : 'Sound off'}
                    >
                        {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
                    </button>
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className={`p-2 rounded-lg transition-colors ${showSettings ? 'bg-purple-500/20 text-purple-400' : 'bg-white/5 text-gray-400 hover:bg-white/10'
                            }`}
                    >
                        <Settings size={14} />
                    </button>
                    {alerts.length > 0 && (
                        <button
                            onClick={clearAll}
                            className="p-2 rounded-lg bg-white/5 text-gray-400 hover:bg-red-500/20 hover:text-red-400 transition-colors"
                            title="Clear all"
                        >
                            <Trash2 size={14} />
                        </button>
                    )}
                </div>
            </div>

            {/* Settings Panel */}
            <AnimatePresence>
                {showSettings && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden mb-6"
                    >
                        <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                            <h3 className="text-sm font-medium text-gray-400 mb-3">Alert Thresholds</h3>
                            <div className="space-y-2">
                                {thresholds.map(threshold => (
                                    <div
                                        key={threshold.id}
                                        className="flex items-center justify-between p-2 bg-white/5 rounded-lg"
                                    >
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => toggleThreshold(threshold.id)}
                                                className={`w-10 h-5 rounded-full transition-colors relative ${threshold.enabled ? 'bg-green-500' : 'bg-gray-600'
                                                    }`}
                                            >
                                                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${threshold.enabled ? 'left-5' : 'left-0.5'
                                                    }`} />
                                            </button>
                                            <span className="text-sm text-white">{threshold.name}</span>
                                        </div>
                                        <span className="text-sm text-gray-400">
                                            {threshold.operator} {threshold.value}{threshold.unit}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Alerts List */}
            {alerts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    <CheckCircle size={32} className="mx-auto mb-2 opacity-30" />
                    <p>All systems nominal</p>
                    <p className="text-xs mt-1">No active alerts</p>
                </div>
            ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                    <AnimatePresence>
                        {alerts.map((alert) => (
                            <motion.div
                                key={alert.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className={`p-3 rounded-lg border transition-all ${getAlertStyle(alert.type, alert.acknowledged)}`}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-start gap-3">
                                        <div className="mt-0.5">
                                            {getAlertIcon(alert.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-sm text-white">
                                                    {alert.title}
                                                </span>
                                                {!alert.acknowledged && alert.type === 'critical' && (
                                                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-400 mt-0.5">
                                                {alert.message}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                                <span>{alert.source}</span>
                                                <span>•</span>
                                                <span>{formatTime(alert.timestamp)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {!alert.acknowledged && (
                                            <button
                                                onClick={() => acknowledgeAlert(alert.id)}
                                                className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-green-400 transition-colors"
                                                title="Acknowledge"
                                            >
                                                <CheckCircle size={14} />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => dismissAlert(alert.id)}
                                            className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-red-400 transition-colors"
                                            title="Dismiss"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Status Bar */}
            <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-gray-500">
                <span>
                    {thresholds.filter(t => t.enabled).length} thresholds active
                </span>
                <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    Monitoring
                </span>
            </div>
        </motion.div>
    );
}

export default AlertsPanel;
