'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Play,
    Square,
    RefreshCw,
    Settings,
    FileText,
    CheckCircle,
    XCircle,
    Clock,
    Zap,
    Eye,
    Trash2,
    Send,
    AlertTriangle,
    Activity,
    FolderOpen,
    Terminal
} from 'lucide-react';

interface PipelineStatus {
    running: boolean;
    lastRun: string | null;
    lastResult: string | null;
    output: string[];
    errors: string[];
}

interface ContentItem {
    id: number;
    topic: string;
    generatedAt: string;
    status: 'pending_review' | 'approved' | 'rejected' | 'published';
    output?: string;
    content?: string;
}

interface PipelineConfig {
    LMStudio: {
        ApiUrl: string;
        Model: string;
        MaxTokens: number;
        Temperature: number;
    };
    WordPress: {
        Enabled: boolean;
        SiteUrl: string;
        DefaultStatus: string;
        Categories: string[];
        Tags: string[];
        credentialsSet: boolean;
    };
    Revenue: {
        AdSense: { Enabled: boolean; configured: boolean };
        Affiliates: { Enabled: boolean; programCount: number };
    };
    Defaults: {
        Topic: string;
        SystemPrompt: string;
    };
}

const BRIDGE_URL = 'http://localhost:3456';

export default function PipelinePage() {
    const [status, setStatus] = useState<PipelineStatus | null>(null);
    const [queue, setQueue] = useState<ContentItem[]>([]);
    const [config, setConfig] = useState<PipelineConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [topic, setTopic] = useState('');
    const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
    const [showConfig, setShowConfig] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch pipeline status
    const fetchStatus = useCallback(async () => {
        try {
            const res = await fetch(`${BRIDGE_URL}/pipeline/status`);
            const data = await res.json();
            if (data.success) {
                setStatus(data.status);
            }
        } catch (err) {
            console.error('Failed to fetch status:', err);
        }
    }, []);

    // Fetch content queue
    const fetchQueue = useCallback(async () => {
        try {
            const res = await fetch(`${BRIDGE_URL}/pipeline/queue`);
            const data = await res.json();
            if (data.success) {
                setQueue(data.queue);
            }
        } catch (err) {
            console.error('Failed to fetch queue:', err);
        }
    }, []);

    // Fetch config
    const fetchConfig = useCallback(async () => {
        try {
            const res = await fetch(`${BRIDGE_URL}/pipeline/config`);
            const data = await res.json();
            if (data.success) {
                setConfig(data.config);
            }
        } catch (err) {
            console.error('Failed to fetch config:', err);
        }
    }, []);

    // Initial load
    useEffect(() => {
        const load = async () => {
            setLoading(true);
            await Promise.all([fetchStatus(), fetchQueue(), fetchConfig()]);
            setLoading(false);
        };
        load();

        // Poll for status updates
        const interval = setInterval(fetchStatus, 3000);
        return () => clearInterval(interval);
    }, [fetchStatus, fetchQueue, fetchConfig]);

    // Generate content
    const handleGenerate = async () => {
        setGenerating(true);
        setError(null);
        try {
            const res = await fetch(`${BRIDGE_URL}/pipeline/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic: topic || undefined })
            });
            const data = await res.json();
            if (!data.success) {
                setError(data.error);
            }
            // Refresh status and queue
            await fetchStatus();
            setTimeout(fetchQueue, 2000);
        } catch (err) {
            setError('Failed to start pipeline');
        } finally {
            setGenerating(false);
        }
    };

    // Stop pipeline
    const handleStop = async () => {
        try {
            await fetch(`${BRIDGE_URL}/pipeline/stop`, { method: 'POST' });
            await fetchStatus();
        } catch (err) {
            setError('Failed to stop pipeline');
        }
    };

    // Update content status
    const updateContentStatus = async (id: number, newStatus: string) => {
        try {
            await fetch(`${BRIDGE_URL}/pipeline/queue/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            await fetchQueue();
        } catch (err) {
            setError('Failed to update content');
        }
    };

    // Delete content
    const deleteContent = async (id: number) => {
        try {
            await fetch(`${BRIDGE_URL}/pipeline/queue/${id}`, { method: 'DELETE' });
            await fetchQueue();
            if (selectedItem?.id === id) {
                setSelectedItem(null);
            }
        } catch (err) {
            setError('Failed to delete content');
        }
    };

    // Publish content
    const publishContent = async (id: number) => {
        try {
            const res = await fetch(`${BRIDGE_URL}/pipeline/publish/${id}`, { method: 'POST' });
            const data = await res.json();
            if (!data.success) {
                setError(data.error);
            }
            await fetchQueue();
        } catch (err) {
            setError('Failed to publish content');
        }
    };

    const getStatusColor = (itemStatus: string) => {
        switch (itemStatus) {
            case 'pending_review': return 'text-amber-400';
            case 'approved': return 'text-emerald-400';
            case 'rejected': return 'text-red-400';
            case 'published': return 'text-blue-400';
            default: return 'text-gray-400';
        }
    };

    const getStatusIcon = (itemStatus: string) => {
        switch (itemStatus) {
            case 'pending_review': return <Clock className="w-4 h-4" />;
            case 'approved': return <CheckCircle className="w-4 h-4" />;
            case 'rejected': return <XCircle className="w-4 h-4" />;
            case 'published': return <Send className="w-4 h-4" />;
            default: return <FileText className="w-4 h-4" />;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 flex items-center justify-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                    <RefreshCw className="w-8 h-8 text-purple-400" />
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 p-6">
            {/* Header */}
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <Terminal className="w-8 h-8 text-purple-400" />
                            Content Pipeline
                        </h1>
                        <p className="text-gray-400 mt-1">Growth Phase • Revenue Engine Active</p>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Status Indicator */}
                        <div className={`px-4 py-2 rounded-full flex items-center gap-2 ${status?.running
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-gray-800 text-gray-400 border border-gray-700'
                            }`}>
                            {status?.running ? (
                                <>
                                    <motion.div
                                        animate={{ scale: [1, 1.2, 1] }}
                                        transition={{ duration: 1, repeat: Infinity }}
                                        className="w-2 h-2 bg-emerald-400 rounded-full"
                                    />
                                    Running
                                </>
                            ) : (
                                <>
                                    <div className="w-2 h-2 bg-gray-500 rounded-full" />
                                    Idle
                                </>
                            )}
                        </div>

                        <button
                            onClick={() => setShowConfig(!showConfig)}
                            className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                        >
                            <Settings className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Error Banner */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl flex items-center justify-between"
                        >
                            <div className="flex items-center gap-3 text-red-400">
                                <AlertTriangle className="w-5 h-5" />
                                {error}
                            </div>
                            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300">
                                <XCircle className="w-5 h-5" />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Config Panel */}
                <AnimatePresence>
                    {showConfig && config && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-6 overflow-hidden"
                        >
                            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
                                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                    <Settings className="w-5 h-5 text-purple-400" />
                                    Pipeline Configuration
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* LM Studio */}
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-medium text-purple-400">LM Studio</h4>
                                        <div className="text-sm text-gray-400">
                                            <p>Model: <span className="text-white">{config.LMStudio.Model}</span></p>
                                            <p>Max Tokens: <span className="text-white">{config.LMStudio.MaxTokens}</span></p>
                                            <p>Temperature: <span className="text-white">{config.LMStudio.Temperature}</span></p>
                                        </div>
                                    </div>

                                    {/* WordPress */}
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-medium text-purple-400">WordPress</h4>
                                        <div className="text-sm text-gray-400">
                                            <p>Status: <span className={config.WordPress.Enabled ? 'text-emerald-400' : 'text-amber-400'}>
                                                {config.WordPress.Enabled ? 'Enabled' : 'Disabled'}
                                            </span></p>
                                            <p>Site: <span className="text-white">{config.WordPress.SiteUrl}</span></p>
                                            <p>Credentials: <span className={config.WordPress.credentialsSet ? 'text-emerald-400' : 'text-red-400'}>
                                                {config.WordPress.credentialsSet ? 'Set' : 'Not Set'}
                                            </span></p>
                                        </div>
                                    </div>

                                    {/* Revenue */}
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-medium text-purple-400">Revenue</h4>
                                        <div className="text-sm text-gray-400">
                                            <p>AdSense: <span className={config.Revenue.AdSense.Enabled ? 'text-emerald-400' : 'text-gray-500'}>
                                                {config.Revenue.AdSense.Enabled ? 'Active' : 'Disabled'}
                                            </span></p>
                                            <p>Affiliates: <span className={config.Revenue.Affiliates.Enabled ? 'text-emerald-400' : 'text-gray-500'}>
                                                {config.Revenue.Affiliates.Enabled ? `${config.Revenue.Affiliates.programCount} programs` : 'Disabled'}
                                            </span></p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Generation Panel */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Generate Card */}
                        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <Zap className="w-5 h-5 text-amber-400" />
                                Generate Content
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Topic (optional)</label>
                                    <input
                                        type="text"
                                        value={topic}
                                        onChange={(e) => setTopic(e.target.value)}
                                        placeholder={config?.Defaults?.Topic || 'Enter topic...'}
                                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-colors"
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={handleGenerate}
                                        disabled={status?.running || generating}
                                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all ${status?.running || generating
                                                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                                : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg shadow-purple-500/25'
                                            }`}
                                    >
                                        {generating ? (
                                            <RefreshCw className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <Play className="w-5 h-5" />
                                        )}
                                        {generating ? 'Starting...' : 'Generate'}
                                    </button>

                                    {status?.running && (
                                        <button
                                            onClick={handleStop}
                                            className="px-4 py-3 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/30 border border-red-600/30 transition-colors"
                                        >
                                            <Square className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Last Run Info */}
                        {status?.lastRun && (
                            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
                                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-blue-400" />
                                    Last Run
                                </h3>
                                <div className="space-y-2 text-sm">
                                    <p className="text-gray-400">
                                        Time: <span className="text-white">{new Date(status.lastRun).toLocaleString()}</span>
                                    </p>
                                    <p className="text-gray-400">
                                        Result: <span className={status.lastResult === 'success' ? 'text-emerald-400' : 'text-red-400'}>
                                            {status.lastResult}
                                        </span>
                                    </p>
                                </div>

                                {status.output.length > 0 && (
                                    <div className="mt-4">
                                        <p className="text-xs text-gray-500 mb-2">Output Log:</p>
                                        <div className="bg-gray-900 rounded-lg p-3 max-h-40 overflow-y-auto">
                                            <pre className="text-xs text-gray-400 whitespace-pre-wrap">
                                                {status.output.slice(-10).join('')}
                                            </pre>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Content Queue */}
                    <div className="lg:col-span-2">
                        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <FolderOpen className="w-5 h-5 text-purple-400" />
                                Content Queue
                                <span className="ml-auto text-sm text-gray-400">{queue.length} items</span>
                            </h3>

                            {queue.length === 0 ? (
                                <div className="text-center py-12">
                                    <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                                    <p className="text-gray-400">No content in queue</p>
                                    <p className="text-sm text-gray-500 mt-1">Generate content to see it here</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {queue.map((item) => (
                                        <motion.div
                                            key={item.id}
                                            layout
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`p-4 rounded-lg border transition-colors cursor-pointer ${selectedItem?.id === item.id
                                                    ? 'bg-purple-900/30 border-purple-500/50'
                                                    : 'bg-gray-900/50 border-gray-700 hover:border-gray-600'
                                                }`}
                                            onClick={() => setSelectedItem(item)}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <span className={getStatusColor(item.status)}>
                                                        {getStatusIcon(item.status)}
                                                    </span>
                                                    <div>
                                                        <p className="text-white font-medium">{item.topic}</p>
                                                        <p className="text-xs text-gray-500">
                                                            {new Date(item.generatedAt).toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    {item.status === 'pending_review' && (
                                                        <>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); updateContentStatus(item.id, 'approved'); }}
                                                                className="p-2 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 transition-colors"
                                                                title="Approve"
                                                            >
                                                                <CheckCircle className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); updateContentStatus(item.id, 'rejected'); }}
                                                                className="p-2 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-colors"
                                                                title="Reject"
                                                            >
                                                                <XCircle className="w-4 h-4" />
                                                            </button>
                                                        </>
                                                    )}
                                                    {item.status === 'approved' && (
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); publishContent(item.id); }}
                                                            className="p-2 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 transition-colors"
                                                            title="Publish"
                                                        >
                                                            <Send className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setSelectedItem(item); }}
                                                        className="p-2 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
                                                        title="View"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); deleteContent(item.id); }}
                                                        className="p-2 rounded-lg bg-gray-700 text-gray-400 hover:bg-red-600/20 hover:text-red-400 transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Selected Content Preview */}
                        <AnimatePresence>
                            {selectedItem && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 20 }}
                                    className="mt-6 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                            <Eye className="w-5 h-5 text-purple-400" />
                                            Content Preview
                                        </h3>
                                        <button
                                            onClick={() => setSelectedItem(null)}
                                            className="text-gray-400 hover:text-white"
                                        >
                                            <XCircle className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="bg-gray-900 rounded-lg p-4 max-h-96 overflow-y-auto">
                                        <pre className="text-sm text-gray-300 whitespace-pre-wrap">
                                            {selectedItem.output || selectedItem.content || 'No content available'}
                                        </pre>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
