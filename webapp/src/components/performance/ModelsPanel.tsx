/**
 * ModelsPanel - Unified AI model management for LM Studio + Ollama
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Brain, Server, RefreshCw, Play, Square, Settings,
    ChevronDown, ChevronRight, Cpu, HardDrive, Zap,
    CheckCircle, Clock, AlertTriangle
} from 'lucide-react';

interface LLMModel {
    id: string;
    name: string;
    provider: 'lmstudio' | 'ollama';
    loaded?: boolean;
    size?: string;
    quantization?: string;
    contextLength?: number;
    parameters?: string;
}

interface ModelsPanelProps {
    bridgeUrl: string;
    refreshInterval?: number;
    isOpen: boolean;
    onToggle: () => void;
}

export function ModelsPanel({ bridgeUrl, refreshInterval = 30000, isOpen, onToggle }: ModelsPanelProps) {
    const [lmstudioModels, setLMStudioModels] = useState<LLMModel[]>([]);
    const [ollamaModels, setOllamaModels] = useState<LLMModel[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [expandedProvider, setExpandedProvider] = useState<'lmstudio' | 'ollama' | null>('lmstudio');
    const [loadingModel, setLoadingModel] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchModels = useCallback(async () => {
        if (!bridgeUrl) return;

        setIsRefreshing(true);
        setError(null);

        try {
            const [lmRes, ollamaRes] = await Promise.all([
                fetch(`${bridgeUrl}/llm/lmstudio/models`).catch(() => null),
                fetch(`${bridgeUrl}/llm/ollama/models`).catch(() => null),
            ]);

            if (lmRes?.ok) {
                const data = await lmRes.json();
                const models: LLMModel[] = Array.isArray(data)
                    ? data.map((m: { id?: string; name?: string }) => ({
                        id: m.id || m.name || 'unknown',
                        name: m.id || m.name || 'Unknown Model',
                        provider: 'lmstudio' as const,
                        loaded: true,
                    }))
                    : [];
                setLMStudioModels(models);
            }

            if (ollamaRes?.ok) {
                const data = await ollamaRes.json();
                const models: LLMModel[] = Array.isArray(data)
                    ? data.map((m: { name?: string; size?: number; details?: { parameter_size?: string; quantization_level?: string } }) => ({
                        id: m.name || 'unknown',
                        name: m.name || 'Unknown Model',
                        provider: 'ollama' as const,
                        size: m.size ? `${(m.size / 1024 / 1024 / 1024).toFixed(1)}GB` : undefined,
                        parameters: m.details?.parameter_size,
                        quantization: m.details?.quantization_level,
                    }))
                    : [];
                setOllamaModels(models);
            }
        } catch (err) {
            console.error('Failed to fetch models:', err);
            setError('Failed to connect to Bridge');
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [bridgeUrl]);

    useEffect(() => {
        fetchModels();
        const interval = setInterval(fetchModels, refreshInterval);
        return () => clearInterval(interval);
    }, [fetchModels, refreshInterval]);

    const loadModel = async (modelId: string, provider: 'lmstudio' | 'ollama') => {
        setLoadingModel(modelId);
        try {
            const endpoint = provider === 'lmstudio'
                ? `${bridgeUrl}/llm/lmstudio/load`
                : `${bridgeUrl}/llm/ollama/load`;

            await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ model: modelId }),
            });

            await fetchModels();
        } catch (err) {
            console.error('Failed to load model:', err);
        } finally {
            setLoadingModel(null);
        }
    };

    const unloadModel = async (modelId: string, provider: 'lmstudio' | 'ollama') => {
        setLoadingModel(modelId);
        try {
            const endpoint = provider === 'lmstudio'
                ? `${bridgeUrl}/llm/lmstudio/unload`
                : `${bridgeUrl}/llm/ollama/unload`;

            await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ model: modelId }),
            });

            await fetchModels();
        } catch (err) {
            console.error('Failed to unload model:', err);
        } finally {
            setLoadingModel(null);
        }
    };

    const totalModels = lmstudioModels.length + ollamaModels.length;
    const loadedModels = [...lmstudioModels, ...ollamaModels].filter(m => m.loaded).length;

    const ProviderSection = ({
        provider,
        models,
        icon: Icon,
        color
    }: {
        provider: 'lmstudio' | 'ollama';
        models: LLMModel[];
        icon: React.ComponentType<{ size?: number; className?: string }>;
        color: string;
    }) => {
        const isExpanded = expandedProvider === provider;
        const providerName = provider === 'lmstudio' ? 'LM Studio' : 'Ollama';

        return (
            <div className="border border-white/10 rounded-xl overflow-hidden">
                {/* Header */}
                <button
                    onClick={() => setExpandedProvider(isExpanded ? null : provider)}
                    className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${provider === 'lmstudio' ? 'bg-cyan-500/20' : 'bg-purple-500/20'}`}>
                            <Icon size={20} className={provider === 'lmstudio' ? 'text-cyan-400' : 'text-purple-400'} />
                        </div>
                        <div className="text-left">
                            <div className={`font-bold ${provider === 'lmstudio' ? 'text-cyan-400' : 'text-purple-400'}`}>{providerName}</div>
                            <div className="text-xs text-gray-500">
                                {models.length} model{models.length !== 1 ? 's' : ''} available
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {models.length > 0 && (
                            <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
                                {models.filter(m => m.loaded).length} loaded
                            </span>
                        )}
                        {isExpanded ? <ChevronDown size={20} className="text-gray-400" /> : <ChevronRight size={20} className="text-gray-400" />}
                    </div>
                </button>

                {/* Models List */}
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                        >
                            {models.length === 0 ? (
                                <div className="p-6 text-center text-gray-500">
                                    <Server size={32} className="mx-auto mb-2 opacity-30" />
                                    <p>No models found</p>
                                    <p className="text-xs mt-1">
                                        {provider === 'lmstudio'
                                            ? 'Start LM Studio and load a model'
                                            : 'Run: ollama pull <model>'}
                                    </p>
                                </div>
                            ) : (
                                <div className="divide-y divide-white/5">
                                    {models.map((model) => (
                                        <div
                                            key={model.id}
                                            className="p-4 hover:bg-white/5 transition-colors"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium text-white truncate">
                                                            {model.name}
                                                        </span>
                                                        {model.loaded && (
                                                            <span className="flex items-center gap-1 px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full text-xs">
                                                                <CheckCircle size={10} />
                                                                Active
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                                                        {model.size && (
                                                            <span className="flex items-center gap-1">
                                                                <HardDrive size={10} />
                                                                {model.size}
                                                            </span>
                                                        )}
                                                        {model.parameters && (
                                                            <span className="flex items-center gap-1">
                                                                <Cpu size={10} />
                                                                {model.parameters}
                                                            </span>
                                                        )}
                                                        {model.quantization && (
                                                            <span className="flex items-center gap-1">
                                                                <Zap size={10} />
                                                                {model.quantization}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    {loadingModel === model.id ? (
                                                        <RefreshCw size={16} className="animate-spin text-gray-400" />
                                                    ) : model.loaded ? (
                                                        <button
                                                            onClick={() => unloadModel(model.id, provider)}
                                                            className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                                                            title="Unload model"
                                                        >
                                                            <Square size={14} />
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => loadModel(model.id, provider)}
                                                            className="p-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
                                                            title="Load model"
                                                        >
                                                            <Play size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    };

    return (
        <div className="glass-card overflow-hidden">
            {/* Header / Toggle */}
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition-colors text-left"
            >
                <div className="flex items-center gap-3">
                    <Brain size={20} className="text-purple-400" />
                    <h2 className="text-xl font-bold text-white">
                        AI Models
                    </h2>
                </div>
                <div className="flex items-center gap-3">
                    {!isOpen && loadedModels > 0 && (
                        <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-full font-mono font-bold">
                            {loadedModels} Loaded
                        </span>
                    )}
                    <ChevronDown
                        size={20}
                        className={`text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                    />
                </div>
            </button>

            {/* Content - only shown when open */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="p-6 pt-0">

                            <div className="flex items-center justify-end mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="text-sm text-gray-400">
                                        <span className="text-purple-400 font-bold">{loadedModels}</span>
                                        <span className="mx-1">/</span>
                                        <span>{totalModels}</span>
                                        <span className="ml-1">loaded</span>
                                    </div>
                                    <button
                                        onClick={fetchModels}
                                        disabled={isRefreshing}
                                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                                    >
                                        <RefreshCw size={14} className={`text-gray-400 ${isRefreshing ? 'animate-spin' : ''}`} />
                                    </button>
                                </div>
                            </div>

                            {/* Error State */}
                            {error && (
                                <div className="flex items-center gap-2 p-3 mb-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                                    <AlertTriangle size={16} />
                                    {error}
                                </div>
                            )}

                            {/* Loading State */}
                            {isLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <RefreshCw size={24} className="animate-spin text-purple-400" />
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {/* LM Studio */}
                                    <ProviderSection
                                        provider="lmstudio"
                                        models={lmstudioModels}
                                        icon={Server}
                                        color="#06B6D4"
                                    />

                                    {/* Ollama */}
                                    <ProviderSection
                                        provider="ollama"
                                        models={ollamaModels}
                                        icon={Brain}
                                        color="#A855F7"
                                    />
                                </div>
                            )}

                            {/* Quick Stats */}
                            {!isLoading && totalModels > 0 && (
                                <div className="mt-6 p-4 bg-white/5 rounded-xl">
                                    <div className="grid grid-cols-3 gap-4 text-center">
                                        <div>
                                            <div className="text-2xl font-bold text-cyan-400">{lmstudioModels.length}</div>
                                            <div className="text-xs text-gray-500">LM Studio</div>
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold text-purple-400">{ollamaModels.length}</div>
                                            <div className="text-xs text-gray-500">Ollama</div>
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold text-green-400">{loadedModels}</div>
                                            <div className="text-xs text-gray-500">Active</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Empty State */}
                            {!isLoading && totalModels === 0 && !error && (
                                <div className="text-center py-8 text-gray-500">
                                    <Brain size={48} className="mx-auto mb-4 opacity-30" />
                                    <p>No AI models detected</p>
                                    <p className="text-sm mt-2">
                                        Start LM Studio or Ollama to see available models
                                    </p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default ModelsPanel;
