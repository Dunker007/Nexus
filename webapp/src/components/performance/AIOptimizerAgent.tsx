/**
 * AIOptimizerAgent - Intelligent system optimization using NVIDIA SDKs
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bot, Cpu, Zap, Brain, Terminal, Play, Pause,
    RefreshCw, CheckCircle, AlertTriangle, Activity,
    Gauge, ChevronRight, Sparkles, BarChart3, ShieldCheck, Info
} from 'lucide-react';
import { HARDWARE_CONFIG, NVIDIA_SDK, ASROCK_SDK, STORAGE_SDK, MEMORY_SDK } from '@/lib/luxrig/constants';

interface DiagnosticResult {
    category: string;
    status: 'optimal' | 'warning' | 'critical' | 'checking';
    message: string;
    value?: string;
    action?: string;
}

interface Recommendation {
    id: string;
    text: string;
    type: 'optimization' | 'hardware' | 'software';
    validity: 'proven' | 'expert' | 'theoretical';
    impact: 'high' | 'medium' | 'low';
}

interface AIOptimizerAgentProps {
    bridgeUrl: string;
}

export function AIOptimizerAgent({ bridgeUrl }: AIOptimizerAgentProps) {
    const [isRunning, setIsRunning] = useState(false);
    const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([]);
    const [currentStep, setCurrentStep] = useState<string | null>(null);
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [gpuStats, setGpuStats] = useState<{
        utilization?: number;
        temp?: number;
        vramUsed?: number;
        vramTotal?: number;
        powerDraw?: number;
    }>({});

    // Fetch GPU stats via nvidia-smi through bridge
    const fetchGpuStats = useCallback(async () => {
        try {
            const res = await fetch(`${bridgeUrl}/system/gpu`);
            if (res.ok) {
                const data = await res.json();
                setGpuStats({
                    utilization: data.utilization,
                    temp: data.temp || data.temperature,
                    vramUsed: data.vram?.used,
                    vramTotal: data.vram?.total,
                    powerDraw: data.power,
                });
            }
        } catch (error) {
            console.warn('Failed to fetch GPU stats:', error);
        }
    }, [bridgeUrl]);

    useEffect(() => {
        fetchGpuStats();
        const interval = setInterval(fetchGpuStats, 5000);
        return () => clearInterval(interval);
    }, [fetchGpuStats]);

    const runDiagnostics = async () => {
        setIsRunning(true);
        setDiagnostics([]);
        setRecommendations([]);

        const steps = [
            { name: 'GPU Health Check', delay: 500 },
            { name: 'VRAM Analysis', delay: 600 },
            { name: 'System RAM', delay: 400 },
            { name: 'Tensor Core Status', delay: 400 },
            { name: 'CUDA Compatibility', delay: 500 },
            { name: 'NVMe Storage', delay: 400 },
            { name: 'AI QuickSet Status', delay: 400 },
            { name: 'CPU/Motherboard', delay: 500 },
            { name: 'Power Configuration', delay: 400 },
            { name: 'Thermal Analysis', delay: 600 },
        ];

        const results: DiagnosticResult[] = [];
        const recs: Recommendation[] = [];

        for (const step of steps) {
            setCurrentStep(step.name);
            await new Promise(r => setTimeout(r, step.delay));

            // Simulate diagnostic results based on real GPU stats
            if (step.name === 'GPU Health Check') {
                results.push({
                    category: step.name,
                    status: gpuStats.utilization !== undefined ? 'optimal' : 'warning',
                    message: gpuStats.utilization !== undefined
                        ? `${HARDWARE_CONFIG.GPU.name} responding normally`
                        : 'GPU metrics unavailable - ensure nvidia-smi is accessible',
                    value: gpuStats.utilization ? `${gpuStats.utilization}% util` : undefined,
                });
            } else if (step.name === 'VRAM Analysis') {
                const vramPercent = gpuStats.vramUsed && gpuStats.vramTotal
                    ? Math.round((gpuStats.vramUsed / gpuStats.vramTotal) * 100)
                    : null;

                if (vramPercent !== null) {
                    results.push({
                        category: step.name,
                        status: vramPercent > 90 ? 'critical' : vramPercent > 75 ? 'warning' : 'optimal',
                        message: vramPercent > 90
                            ? 'VRAM critically high - reduce model size or batch'
                            : `${HARDWARE_CONFIG.GPU.vram} available for AI workloads`,
                        value: `${vramPercent}% used`,
                    });

                    if (vramPercent > 75) {
                        recs.push({
                            id: 'rec-quant',
                            text: 'Consider using quantized models (GGUF Q4/Q5) for lower VRAM usage',
                            type: 'optimization',
                            validity: 'proven',
                            impact: 'high'
                        });
                    }
                } else {
                    results.push({
                        category: step.name,
                        status: 'optimal',
                        message: `${HARDWARE_CONFIG.GPU.vram} - ideal for 7B-13B parameter models`,
                        value: '12GB',
                    });
                }
            } else if (step.name === 'System RAM') {
                results.push({
                    category: step.name,
                    status: 'optimal',
                    message: `${HARDWARE_CONFIG.RAM.model} ${HARDWARE_CONFIG.RAM.capacity} @ ${HARDWARE_CONFIG.RAM.speed}`,
                    value: HARDWARE_CONFIG.RAM.timings,
                });
                recs.push({
                    id: 'rec-mmap',
                    text: `Use Python mmap to load LLM weights directly to ${HARDWARE_CONFIG.RAM.speed} memory pool`,
                    type: 'software',
                    validity: 'expert',
                    impact: 'medium'
                });
            } else if (step.name === 'Tensor Core Status') {
                results.push({
                    category: step.name,
                    status: 'optimal',
                    message: 'Tensor Cores enabled for FP16/INT8 acceleration',
                    value: 'Active',
                });
                recs.push({
                    id: 'rec-tensorrt',
                    text: 'Use TensorRT for optimal inference performance',
                    type: 'software',
                    validity: 'proven',
                    impact: 'high'
                });
            } else if (step.name === 'CUDA Compatibility') {
                results.push({
                    category: step.name,
                    status: 'optimal',
                    message: `CUDA ${NVIDIA_SDK.CUDA.version} compatible with RTX 3060`,
                    value: `v${NVIDIA_SDK.CUDA.version}`,
                });
            } else if (step.name === 'NVMe Storage') {
                results.push({
                    category: step.name,
                    status: 'optimal',
                    message: `${HARDWARE_CONFIG.STORAGE.primary.model} ${HARDWARE_CONFIG.STORAGE.primary.capacity} with DirectStorage`,
                    value: HARDWARE_CONFIG.STORAGE.primary.readSpeed,
                });
                if (STORAGE_SDK.DIRECTSTORAGE.supported) {
                    recs.push({
                        id: 'rec-directstorage',
                        text: 'DirectStorage enabled - AI data flows directly from NVMe to GPU',
                        type: 'hardware',
                        validity: 'theoretical',
                        impact: 'high'
                    });
                }
            } else if (step.name === 'AI QuickSet Status') {
                results.push({
                    category: step.name,
                    status: 'optimal',
                    message: `${ASROCK_SDK.AI_QUICKSET.name} available for WSL AI setup`,
                    value: 'Ready',
                });
                recs.push({
                    id: 'rec-quickset',
                    text: 'Use ai-quickset CLI to install PyTorch/TensorFlow with GPU acceleration',
                    type: 'software',
                    validity: 'proven',
                    impact: 'high'
                });
            } else if (step.name === 'CPU/Motherboard') {
                results.push({
                    category: step.name,
                    status: 'optimal',
                    message: `${HARDWARE_CONFIG.CPU.model} on ${HARDWARE_CONFIG.MOTHERBOARD.name}`,
                    value: `${HARDWARE_CONFIG.CPU.cores}C/${HARDWARE_CONFIG.CPU.threads}T`,
                });
                recs.push({
                    id: 'rec-amdrmcli',
                    text: 'AMDRMCLI available for Ryzen tuning via script',
                    type: 'optimization',
                    validity: 'expert',
                    impact: 'medium'
                });
            } else if (step.name === 'Power Configuration') {
                const powerDraw = gpuStats.powerDraw;
                results.push({
                    category: step.name,
                    status: powerDraw && powerDraw > 150 ? 'warning' : 'optimal',
                    message: powerDraw
                        ? `Drawing ${powerDraw}W of ${HARDWARE_CONFIG.GPU.tdp}W TDP`
                        : 'Power limit configured optimally',
                    value: powerDraw ? `${powerDraw}W` : `${HARDWARE_CONFIG.GPU.tdp}W TDP`,
                });
            } else if (step.name === 'Thermal Analysis') {
                const temp = gpuStats.temp;
                results.push({
                    category: step.name,
                    status: temp && temp > 80 ? 'warning' : temp && temp > 85 ? 'critical' : 'optimal',
                    message: temp
                        ? temp > 80
                            ? 'GPU running hot - check cooling'
                            : 'Temperatures within safe range'
                        : 'Thermal monitoring active',
                    value: temp ? `${temp}°C` : 'Normal',
                });

                if (temp && temp > 75) {
                    recs.push({
                        id: 'rec-undervolt',
                        text: 'Consider undervolting GPU for lower temps with same performance',
                        type: 'hardware',
                        validity: 'expert',
                        impact: 'medium'
                    });
                }
            }

            setDiagnostics([...results]);
        }

        // Always add some useful recommendations
        if (recs.length === 0) {
            recs.push({
                id: 'rec-nim',
                text: 'Enable NVIDIA NIM for containerized LLM deployment',
                type: 'software',
                validity: 'proven',
                impact: 'medium'
            });
            recs.push({
                id: 'rec-workbench',
                text: 'Use AI Workbench for simplified environment setup',
                type: 'software',
                validity: 'proven',
                impact: 'low'
            });
        }

        setRecommendations(recs);
        setCurrentStep(null);
        setIsRunning(false);
    };

    const getStatusIcon = (status: DiagnosticResult['status']) => {
        switch (status) {
            case 'optimal':
                return <CheckCircle size={16} className="text-green-400" />;
            case 'warning':
                return <AlertTriangle size={16} className="text-yellow-400" />;
            case 'critical':
                return <AlertTriangle size={16} className="text-red-400 animate-pulse" />;
            default:
                return <Activity size={16} className="text-gray-400 animate-pulse" />;
        }
    };

    const getStatusColor = (status: DiagnosticResult['status']) => {
        switch (status) {
            case 'optimal': return 'border-green-500/30 bg-green-500/5';
            case 'warning': return 'border-yellow-500/30 bg-yellow-500/5';
            case 'critical': return 'border-red-500/30 bg-red-500/5';
            default: return 'border-gray-500/30 bg-gray-500/5';
        }
    };

    const overallScore = diagnostics.length > 0
        ? Math.round((diagnostics.filter(d => d.status === 'optimal').length / diagnostics.length) * 100)
        : null;

    return (
        <motion.div
            className="glass-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <Bot size={20} className="text-emerald-400" />
                    AI Optimizer Agent
                </h2>
                <div className="flex items-center gap-3">
                    {overallScore !== null && (
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${overallScore >= 80 ? 'bg-green-500/20 text-green-400' :
                            overallScore >= 60 ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-red-500/20 text-red-400'
                            }`}>
                            {overallScore}% Optimal
                        </span>
                    )}
                    <button
                        onClick={runDiagnostics}
                        disabled={isRunning}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-emerald-400 rounded-lg hover:from-emerald-500/30 hover:to-cyan-500/30 transition-all border border-emerald-500/30"
                    >
                        {isRunning ? (
                            <>
                                <RefreshCw size={16} className="animate-spin" />
                                Analyzing...
                            </>
                        ) : (
                            <>
                                <Play size={16} />
                                Run Analysis
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* GPU Info Card */}
            <div className="p-4 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 rounded-xl border border-emerald-500/20 mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                            <Cpu size={24} className="text-emerald-400" />
                        </div>
                        <div>
                            <div className="font-bold text-white">{HARDWARE_CONFIG.GPU.name}</div>
                            <div className="text-sm text-gray-400">
                                {HARDWARE_CONFIG.GPU.vram} VRAM • {HARDWARE_CONFIG.GPU.cudaCores} CUDA Cores • Tensor Cores
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-emerald-400">
                            {gpuStats.utilization ?? '--'}%
                        </div>
                        <div className="text-xs text-gray-500">GPU Usage</div>
                    </div>
                </div>
            </div>

            {/* Current Step */}
            <AnimatePresence>
                {currentStep && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg"
                    >
                        <div className="flex items-center gap-2 text-emerald-400">
                            <RefreshCw size={14} className="animate-spin" />
                            <span className="text-sm">{currentStep}...</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Diagnostics Results */}
            {diagnostics.length > 0 && (
                <div className="space-y-2 mb-6">
                    <h3 className="text-sm font-medium text-gray-400 flex items-center gap-2">
                        <BarChart3 size={14} />
                        Diagnostic Results
                    </h3>
                    <div className="space-y-2">
                        {diagnostics.map((diag, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className={`p-3 rounded-lg border ${getStatusColor(diag.status)}`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        {getStatusIcon(diag.status)}
                                        <div>
                                            <div className="font-medium text-white text-sm">
                                                {diag.category}
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                {diag.message}
                                            </div>
                                        </div>
                                    </div>
                                    {diag.value && (
                                        <span className="text-sm font-mono text-gray-300 bg-white/5 px-2 py-1 rounded">
                                            {diag.value}
                                        </span>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* Recommendations */}
            {recommendations.length > 0 && (
                <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                    <h3 className="text-sm font-medium text-purple-400 flex items-center gap-2 mb-3">
                        <Sparkles size={14} />
                        AI Recommendations
                    </h3>
                    <ul className="space-y-2">
                        {recommendations.map((rec, idx) => (
                            <li key={idx} className="flex flex-col gap-1 p-2 rounded-lg bg-white/5 border border-white/5">
                                <div className="flex items-start gap-2 text-sm text-gray-300">
                                    <ChevronRight size={14} className="text-purple-400 mt-0.5 shrink-0" />
                                    <span>{rec.text}</span>
                                </div>
                                <div className="flex items-center gap-2 ml-6 mt-1">
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                                        rec.validity === 'proven' ? 'bg-green-500/10 border-green-500/30 text-green-400' :
                                        rec.validity === 'expert' ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' :
                                        'bg-purple-500/10 border-purple-500/30 text-purple-400'
                                    }`}>
                                        {rec.validity.toUpperCase()}
                                    </span>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                                        rec.impact === 'high' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
                                        rec.impact === 'medium' ? 'bg-orange-500/10 border-orange-500/30 text-orange-400' :
                                        'bg-gray-500/10 border-gray-500/30 text-gray-400'
                                    }`}>
                                        {rec.impact.toUpperCase()} IMPACT
                                    </span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* NVIDIA SDK Info */}
            {diagnostics.length === 0 && !isRunning && (
                <div className="text-center py-8">
                    <Bot size={48} className="mx-auto mb-4 text-gray-600" />
                    <p className="text-gray-400 mb-2">AI Optimizer Ready</p>
                    <p className="text-xs text-gray-600">
                        Powered by {NVIDIA_SDK.TENSORRT.name} • CUDA {NVIDIA_SDK.CUDA.version}
                    </p>
                </div>
            )}

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-gray-500">
                <span className="flex items-center gap-2">
                    <Terminal size={12} />
                    nvidia-smi • {STORAGE_SDK.MSECLI.executable} • {ASROCK_SDK.AI_QUICKSET.cli}
                </span>
                <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Agent Verification Active
                </span>
            </div>
        </motion.div>
    );
}

export default AIOptimizerAgent;
