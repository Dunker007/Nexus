/**
 * OptimizePanel - Quick system optimization actions
 */

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Zap, Cpu, HardDrive, Trash2, RefreshCw,
    Gauge, Fan, Power, CheckCircle, Clock,
    MemoryStick, Thermometer, Lightbulb
} from 'lucide-react';
import { HARDWARE_CONFIG } from '@/lib/luxrig/constants';

interface OptimizeAction {
    id: string;
    name: string;
    description: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    color: string;
    category: 'performance' | 'cleanup' | 'thermal' | 'rgb';
    action: string;
    duration?: string;
}

interface OptimizePanelProps {
    bridgeUrl: string;
}

export function OptimizePanel({ bridgeUrl }: OptimizePanelProps) {
    const [runningAction, setRunningAction] = useState<string | null>(null);
    const [completedActions, setCompletedActions] = useState<Set<string>>(new Set());
    const [lastResult, setLastResult] = useState<{ action: string; message: string } | null>(null);

    const optimizeActions: OptimizeAction[] = [
        // Performance
        {
            id: 'boost-gpu',
            name: 'GPU Power Mode',
            description: 'Set NVIDIA to Prefer Maximum Performance',
            icon: Zap,
            color: 'cyan',
            category: 'performance',
            action: 'gpu_power_max',
            duration: '~2s',
        },
        {
            id: 'cpu-high',
            name: 'CPU High Performance',
            description: `Unlock ${HARDWARE_CONFIG.CPU.model} boost clocks`,
            icon: Cpu,
            color: 'orange',
            category: 'performance',
            action: 'cpu_high_perf',
            duration: '~1s',
        },
        {
            id: 'ram-optimize',
            name: 'RAM Optimizer',
            description: 'Clear standby list and compress memory',
            icon: MemoryStick,
            color: 'purple',
            category: 'performance',
            action: 'ram_optimize',
            duration: '~3s',
        },
        // Cleanup
        {
            id: 'temp-clean',
            name: 'Temp Files',
            description: 'Clear Windows temp and browser cache',
            icon: Trash2,
            color: 'red',
            category: 'cleanup',
            action: 'clean_temp',
            duration: '~5s',
        },
        {
            id: 'shader-cache',
            name: 'Shader Cache',
            description: 'Rebuild NVIDIA shader cache',
            icon: HardDrive,
            color: 'emerald',
            category: 'cleanup',
            action: 'rebuild_shaders',
            duration: '~10s',
        },
        {
            id: 'prefetch',
            name: 'Prefetch Clear',
            description: 'Clear Windows prefetch data',
            icon: RefreshCw,
            color: 'blue',
            category: 'cleanup',
            action: 'clear_prefetch',
            duration: '~2s',
        },
        // Thermal
        {
            id: 'fan-boost',
            name: 'Fan Boost',
            description: 'Temporarily increase fan curves',
            icon: Fan,
            color: 'sky',
            category: 'thermal',
            action: 'fan_boost',
            duration: '~1s',
        },
        {
            id: 'power-balanced',
            name: 'Balanced Mode',
            description: 'Switch to balanced power plan',
            icon: Power,
            color: 'yellow',
            category: 'thermal',
            action: 'power_balanced',
            duration: '~1s',
        },
        {
            id: 'thermal-check',
            name: 'Thermal Check',
            description: 'Run full thermal diagnostic',
            icon: Thermometer,
            color: 'rose',
            category: 'thermal',
            action: 'thermal_check',
            duration: '~5s',
        },
        // RGB Lighting (OpenRGB)
        {
            id: 'rgb-off',
            name: 'Lights Off',
            description: 'Turn off all RGB lighting',
            icon: Lightbulb,
            color: 'gray',
            category: 'rgb',
            action: 'rgb_off',
            duration: '~1s',
        },
        {
            id: 'rgb-static',
            name: 'Static White',
            description: 'Clean white ambient lighting',
            icon: Lightbulb,
            color: 'white',
            category: 'rgb',
            action: 'rgb_static',
            duration: '~1s',
        },
        {
            id: 'rgb-rainbow',
            name: 'Rainbow Wave',
            description: 'Animated rainbow cycle',
            icon: Lightbulb,
            color: 'pink',
            category: 'rgb',
            action: 'rgb_rainbow',
            duration: '~1s',
        },
        {
            id: 'rgb-breathing',
            name: 'Breathing',
            description: 'Slow fade in/out effect',
            icon: Lightbulb,
            color: 'indigo',
            category: 'rgb',
            action: 'rgb_breathing',
            duration: '~1s',
        },
    ];

    const runAction = async (action: OptimizeAction) => {
        setRunningAction(action.id);
        setLastResult(null);

        try {
            // Route RGB actions to different endpoint
            const isRgb = action.category === 'rgb';
            const endpoint = isRgb ? '/system/rgb' : '/system/optimize';
            const body = isRgb
                ? { mode: action.action.replace('rgb_', '') }
                : { action: action.action };

            const res = await fetch(`${bridgeUrl}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            const result = await res.json();
            setCompletedActions(prev => new Set([...prev, action.id]));
            setLastResult({
                action: action.name,
                message: result.message || 'Completed successfully'
            });
        } catch (error) {
            setLastResult({
                action: action.name,
                message: 'Bridge unreachable - action simulated'
            });
            // Simulate completion for demo
            setCompletedActions(prev => new Set([...prev, action.id]));
        } finally {
            setRunningAction(null);
        }
    };

    const runAllOptimizations = async () => {
        const performanceActions = optimizeActions.filter(a => a.category === 'performance');
        for (const action of performanceActions) {
            await runAction(action);
            await new Promise(r => setTimeout(r, 500));
        }
    };

    const getColorClasses = (color: string) => {
        const colors: Record<string, { bg: string; text: string; border: string }> = {
            cyan: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500/30' },
            orange: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30' },
            purple: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30' },
            red: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
            emerald: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' },
            blue: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
            sky: { bg: 'bg-sky-500/20', text: 'text-sky-400', border: 'border-sky-500/30' },
            yellow: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' },
            rose: { bg: 'bg-rose-500/20', text: 'text-rose-400', border: 'border-rose-500/30' },
            gray: { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500/30' },
            white: { bg: 'bg-white/10', text: 'text-white', border: 'border-white/30' },
            pink: { bg: 'bg-pink-500/20', text: 'text-pink-400', border: 'border-pink-500/30' },
            indigo: { bg: 'bg-indigo-500/20', text: 'text-indigo-400', border: 'border-indigo-500/30' },
        };
        return colors[color] || colors.cyan;
    };

    const categories = [
        { id: 'performance', label: '⚡ Performance', icon: Gauge },
        { id: 'cleanup', label: '🧹 Cleanup', icon: Trash2 },
        { id: 'thermal', label: '🌡️ Thermal', icon: Thermometer },
        { id: 'rgb', label: '💡 RGB Lighting', icon: Lightbulb },
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
                    <Zap size={20} className="text-yellow-400" />
                    Optimization Tools
                </h2>
                <button
                    onClick={runAllOptimizations}
                    disabled={runningAction !== null}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-white rounded-lg hover:from-cyan-500/30 hover:to-purple-500/30 transition-all text-sm border border-white/10"
                >
                    <Zap size={14} />
                    Quick Boost
                </button>
            </div>

            {/* Result Banner */}
            {lastResult && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-3 mb-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm"
                >
                    <CheckCircle size={16} />
                    <span className="font-medium">{lastResult.action}:</span>
                    {lastResult.message}
                </motion.div>
            )}

            {/* Hardware Quick Info */}
            <div className="flex items-center gap-4 mb-6 p-3 bg-white/5 rounded-xl text-xs">
                <div className="flex items-center gap-2">
                    <Cpu size={14} className="text-orange-400" />
                    <span className="text-gray-400">{HARDWARE_CONFIG.CPU.model}</span>
                    <span className="text-gray-600">({HARDWARE_CONFIG.CPU.cores}C/{HARDWARE_CONFIG.CPU.threads}T)</span>
                </div>
                <span className="text-gray-700">|</span>
                <div className="flex items-center gap-2">
                    <Zap size={14} className="text-cyan-400" />
                    <span className="text-gray-400">{HARDWARE_CONFIG.GPU.name}</span>
                </div>
            </div>

            {/* Action Categories */}
            {categories.map(category => (
                <div key={category.id} className="mb-6 last:mb-0">
                    <h3 className="text-sm font-medium text-gray-400 mb-3">{category.label}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {optimizeActions
                            .filter(a => a.category === category.id)
                            .map(action => {
                                const colors = getColorClasses(action.color);
                                const isRunning = runningAction === action.id;
                                const isCompleted = completedActions.has(action.id);

                                return (
                                    <button
                                        key={action.id}
                                        onClick={() => runAction(action)}
                                        disabled={isRunning}
                                        className={`relative p-4 rounded-xl border transition-all text-left group ${colors.border} ${isCompleted ? 'bg-green-500/10' : colors.bg
                                            } hover:scale-[1.02]`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                {isRunning ? (
                                                    <RefreshCw size={20} className={`animate-spin ${colors.text}`} />
                                                ) : isCompleted ? (
                                                    <CheckCircle size={20} className="text-green-400" />
                                                ) : (
                                                    <action.icon size={20} className={colors.text} />
                                                )}
                                                <div>
                                                    <div className={`font-medium ${isCompleted ? 'text-green-400' : colors.text}`}>
                                                        {action.name}
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-0.5">
                                                        {action.description}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Duration badge */}
                                        {action.duration && !isCompleted && (
                                            <span className="absolute top-2 right-2 flex items-center gap-1 text-xs text-gray-600">
                                                <Clock size={10} />
                                                {action.duration}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                    </div>
                </div>
            ))}

            {/* Footer */}
            <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-gray-500">
                <span>{completedActions.size} of {optimizeActions.length} optimizations applied</span>
                {completedActions.size > 0 && (
                    <button
                        onClick={() => setCompletedActions(new Set())}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        Reset
                    </button>
                )}
            </div>
        </motion.div>
    );
}

export default OptimizePanel;
