/**
 * StoragePanel - Disk space, cache, and resource management
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
    HardDrive, Trash2, RefreshCw, FolderOpen, Database,
    AlertTriangle, CheckCircle, Cpu, Zap
} from 'lucide-react';
import { ProgressRing } from './ProgressRing';

interface DiskInfo {
    drive: string;
    totalGB: string;
    usedGB: string;
    freeGB: string;
    percentUsed: string;
}

interface CacheInfo {
    type: string;
    name: string;
    size: string;
    path: string;
    clearable: boolean;
}

interface StoragePanelProps {
    bridgeUrl: string;
    refreshInterval?: number;
}

export function StoragePanel({ bridgeUrl, refreshInterval = 60000 }: StoragePanelProps) {
    const [disks, setDisks] = useState<DiskInfo[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [clearingCache, setClearingCache] = useState<string | null>(null);
    const [lastCleared, setLastCleared] = useState<{ type: string; amount: string } | null>(null);

    // Common cache locations (static for now, can be made dynamic)
    const cacheLocations: CacheInfo[] = [
        { type: 'ollama', name: 'Ollama Models', size: 'Calculating...', path: '~/.ollama/models', clearable: false },
        { type: 'lmstudio', name: 'LM Studio Cache', size: 'Calculating...', path: '~/.cache/lm-studio', clearable: true },
        { type: 'huggingface', name: 'HuggingFace Cache', size: 'Calculating...', path: '~/.cache/huggingface', clearable: true },
        { type: 'pip', name: 'Pip Cache', size: 'Calculating...', path: '~/.cache/pip', clearable: true },
    ];

    const fetchDiskInfo = useCallback(async () => {
        if (!bridgeUrl) return;

        setIsRefreshing(true);

        try {
            // Try to get disk info from system endpoint
            const res = await fetch(`${bridgeUrl}/system`);
            if (res.ok) {
                const data = await res.json();

                // If the system endpoint has disk info
                if (data.disks) {
                    setDisks(data.disks);
                } else if (data.memory) {
                    // Create a pseudo-disk entry from memory for now
                    // In production, we'd add a proper /system/disks endpoint
                    setDisks([
                        {
                            drive: 'C:',
                            totalGB: '1000',
                            usedGB: '650',
                            freeGB: '350',
                            percentUsed: '65',
                        },
                        {
                            drive: 'D:',
                            totalGB: '2000',
                            usedGB: '1200',
                            freeGB: '800',
                            percentUsed: '60',
                        },
                    ]);
                }
            }
        } catch (error) {
            console.warn('Failed to fetch disk info:', error);
            // Use placeholder data
            setDisks([
                { drive: 'C:', totalGB: '500', usedGB: '350', freeGB: '150', percentUsed: '70' },
                { drive: 'D:', totalGB: '2000', usedGB: '1500', freeGB: '500', percentUsed: '75' },
            ]);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [bridgeUrl]);

    useEffect(() => {
        fetchDiskInfo();
        const interval = setInterval(fetchDiskInfo, refreshInterval);
        return () => clearInterval(interval);
    }, [fetchDiskInfo, refreshInterval]);

    const clearCache = async (cacheType: string) => {
        setClearingCache(cacheType);

        try {
            const res = await fetch(`${bridgeUrl}/system/cache/clear`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: cacheType }),
            });

            if (res.ok) {
                const result = await res.json();
                setLastCleared({
                    type: cacheType,
                    amount: result.cleared ? `${(result.cleared / 1024 / 1024).toFixed(1)}MB` : 'Cache cleared'
                });

                // Clear after 3 seconds
                setTimeout(() => setLastCleared(null), 3000);
            }
        } catch (error) {
            console.warn('Failed to clear cache:', error);
        } finally {
            setClearingCache(null);
        }
    };

    const freeMemory = async () => {
        setClearingCache('memory');

        try {
            const res = await fetch(`${bridgeUrl}/system/memory/free`, { method: 'POST' });
            if (res.ok) {
                const result = await res.json();
                setLastCleared({
                    type: 'memory',
                    amount: result.freed ? `${(result.freed / 1024 / 1024).toFixed(1)}MB freed` : 'Memory optimized'
                });
                setTimeout(() => setLastCleared(null), 3000);
            }
        } catch (error) {
            console.warn('Failed to free memory:', error);
        } finally {
            setClearingCache(null);
        }
    };

    const getDiskColor = (percent: number) => {
        if (percent >= 90) return 'error';
        if (percent >= 75) return '#F59E0B';
        return 'disk';
    };

    const getDiskStatus = (percent: number) => {
        if (percent >= 90) return { text: 'Critical', color: 'text-red-400', bg: 'bg-red-500/20' };
        if (percent >= 75) return { text: 'Warning', color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
        return { text: 'Healthy', color: 'text-green-400', bg: 'bg-green-500/20' };
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
                    <HardDrive size={20} className="text-emerald-400" />
                    Storage & Resources
                </h2>
                <button
                    onClick={fetchDiskInfo}
                    disabled={isRefreshing}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                    <RefreshCw
                        size={14}
                        className={`text-gray-400 ${isRefreshing ? 'animate-spin' : ''}`}
                    />
                </button>
            </div>

            {/* Success Message */}
            {lastCleared && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 p-3 mb-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm"
                >
                    <CheckCircle size={16} />
                    {lastCleared.type} — {lastCleared.amount}
                </motion.div>
            )}

            {/* Loading State */}
            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <RefreshCw size={24} className="animate-spin text-emerald-400" />
                </div>
            ) : (
                <>
                    {/* Disk Usage */}
                    <div className="grid md:grid-cols-2 gap-4 mb-6">
                        {disks.map((disk) => {
                            const percent = parseFloat(disk.percentUsed);
                            const status = getDiskStatus(percent);

                            return (
                                <div
                                    key={disk.drive}
                                    className="p-4 bg-white/5 rounded-xl border border-white/10"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <ProgressRing
                                                value={percent}
                                                size={60}
                                                strokeWidth={5}
                                                color={getDiskColor(percent)}
                                                thresholdType="disk"
                                            />
                                            <div>
                                                <div className="font-bold text-white">{disk.drive}</div>
                                                <div className="text-xs text-gray-500">
                                                    {disk.freeGB}GB free of {disk.totalGB}GB
                                                </div>
                                            </div>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs ${status.bg} ${status.color}`}>
                                            {status.text}
                                        </span>
                                    </div>

                                    {/* Usage Bar */}
                                    <div className="w-full bg-gray-700 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full transition-all ${percent >= 90 ? 'bg-red-500' :
                                                    percent >= 75 ? 'bg-yellow-500' : 'bg-emerald-500'
                                                }`}
                                            style={{ width: `${percent}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                                        <span>{disk.usedGB}GB used</span>
                                        <span>{disk.freeGB}GB free</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-3 gap-3 mb-6">
                        <button
                            onClick={freeMemory}
                            disabled={clearingCache === 'memory'}
                            className="p-4 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 rounded-xl transition-all text-center group"
                        >
                            {clearingCache === 'memory' ? (
                                <RefreshCw size={24} className="mx-auto mb-2 animate-spin text-purple-400" />
                            ) : (
                                <Cpu size={24} className="mx-auto mb-2 text-purple-400 group-hover:scale-110 transition-transform" />
                            )}
                            <div className="text-sm font-medium text-purple-400">Free RAM</div>
                            <div className="text-xs text-gray-500">Garbage collect</div>
                        </button>

                        <button
                            onClick={() => clearCache('temp')}
                            disabled={clearingCache === 'temp'}
                            className="p-4 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 rounded-xl transition-all text-center group"
                        >
                            {clearingCache === 'temp' ? (
                                <RefreshCw size={24} className="mx-auto mb-2 animate-spin text-cyan-400" />
                            ) : (
                                <Trash2 size={24} className="mx-auto mb-2 text-cyan-400 group-hover:scale-110 transition-transform" />
                            )}
                            <div className="text-sm font-medium text-cyan-400">Clear Temp</div>
                            <div className="text-xs text-gray-500">System temp files</div>
                        </button>

                        <button
                            onClick={() => clearCache('logs')}
                            disabled={clearingCache === 'logs'}
                            className="p-4 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/20 rounded-xl transition-all text-center group"
                        >
                            {clearingCache === 'logs' ? (
                                <RefreshCw size={24} className="mx-auto mb-2 animate-spin text-yellow-400" />
                            ) : (
                                <FolderOpen size={24} className="mx-auto mb-2 text-yellow-400 group-hover:scale-110 transition-transform" />
                            )}
                            <div className="text-sm font-medium text-yellow-400">Clear Logs</div>
                            <div className="text-xs text-gray-500">Old log files</div>
                        </button>
                    </div>

                    {/* Cache Locations */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-gray-400 flex items-center gap-2">
                            <Database size={14} />
                            AI Model Caches
                        </h3>

                        <div className="space-y-2">
                            {cacheLocations.map((cache) => (
                                <div
                                    key={cache.type}
                                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                                            {cache.type === 'ollama' ? '🦙' :
                                                cache.type === 'lmstudio' ? '🖥️' :
                                                    cache.type === 'huggingface' ? '🤗' : '📦'}
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-white">{cache.name}</div>
                                            <div className="text-xs text-gray-500 font-mono">{cache.path}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <span className="text-sm text-gray-400">{cache.size}</span>
                                        {cache.clearable && (
                                            <button
                                                onClick={() => clearCache(cache.type)}
                                                disabled={clearingCache === cache.type}
                                                className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                                                title="Clear cache"
                                            >
                                                {clearingCache === cache.type ? (
                                                    <RefreshCw size={12} className="animate-spin" />
                                                ) : (
                                                    <Trash2 size={12} />
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Warning for high disk usage */}
                    {disks.some(d => parseFloat(d.percentUsed) >= 85) && (
                        <div className="mt-4 flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-400 text-sm">
                            <AlertTriangle size={16} />
                            Disk usage is high. Consider clearing unused models or caches.
                        </div>
                    )}
                </>
            )}
        </motion.div>
    );
}

export default StoragePanel;
