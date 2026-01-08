'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Loader2, Play, Terminal, Cpu, Shield, DollarSign,
    Briefcase, Code, Database, Search, Layers, Mic, FileText,
    Music, Users, Bot
} from 'lucide-react';
import PageBackground from '@/components/PageBackground';
import { LUXRIG_BRIDGE_URL } from '@/lib/utils';

// --- Interfaces ---

interface Agent {
    id: string;
    type?: string;
    name: string;
    description?: string;
    status?: string;
    capabilities?: string[];
}

interface AvailableAgent {
    type: string;
    name: string;
}

interface AgentResponse {
    active: Agent[];
    available: AvailableAgent[];
}

// --- Configuration & Helpers ---

const AGENT_CATEGORIES: Record<string, string[]> = {
    'Core': ['research', 'workflow', 'intent'],
    'Dev Studio': ['architect', 'code', 'qa', 'security', 'devops'],
    'Music Studio': ['lyricist', 'composer', 'critic', 'producer', 'newsician', 'midwest-sentinel', 'mic'],
    'Business': ['revenue', 'staff-meeting']
};

const getAgentCategory = (type: string): string => {
    for (const [category, types] of Object.entries(AGENT_CATEGORIES)) {
        if (types.includes(type)) return category;
    }
    return 'Other';
};

const getAgentIcon = (type: string) => {
    switch (type) {
        case 'research': return <Search className="text-blue-400" size={24} />;
        case 'workflow': return <Layers className="text-indigo-400" size={24} />;
        case 'intent': return <Bot className="text-purple-400" size={24} />;

        case 'architect': return <Database className="text-cyan-400" size={24} />;
        case 'code': return <Code className="text-green-400" size={24} />;
        case 'qa': return <Terminal className="text-orange-400" size={24} />;
        case 'security': return <Shield className="text-red-400" size={24} />;
        case 'devops': return <Cpu className="text-slate-400" size={24} />;

        case 'lyricist': return <FileText className="text-pink-400" size={24} />;
        case 'composer': return <Music className="text-indigo-400" size={24} />;
        case 'critic': return <Search className="text-yellow-400" size={24} />;
        case 'producer': return <Mic className="text-purple-400" size={24} />;
        case 'newsician': return <Mic className="text-red-500" size={24} />;
        case 'midwest-sentinel': return <Shield className="text-blue-600" size={24} />;
        case 'mic': return <Mic className="text-fuchsia-400" size={24} />;

        case 'revenue': return <DollarSign className="text-emerald-400" size={24} />;
        case 'staff-meeting': return <Users className="text-amber-400" size={24} />;

        default: return <Bot className="text-gray-400" size={24} />;
    }
};

// --- Main Component ---

export default function AgentsPage() {
    const [activeAgents, setActiveAgents] = useState<Agent[]>([]);
    const [availableAgents, setAvailableAgents] = useState<AvailableAgent[]>([]);
    const [loading, setLoading] = useState(true);
    const [bridgeOnline, setBridgeOnline] = useState<boolean | null>(null);

    // Filter/View State
    const [selectedCategory, setSelectedCategory] = useState<string>('All');

    // Invocation State
    const [selectedAgent, setSelectedAgent] = useState<AvailableAgent | null>(null);
    const [prompt, setPrompt] = useState('');
    const [isExecuting, setIsExecuting] = useState(false);
    const [result, setResult] = useState<any>(null);

    // Model State
    const [models, setModels] = useState<{ id: string; provider: string }[]>([]);
    const [selectedModel, setSelectedModel] = useState('');

    // Fetch Agents
    const fetchAgents = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${LUXRIG_BRIDGE_URL}/agents`);
            const data: AgentResponse = await res.json();
            setActiveAgents(data.active || []);
            setAvailableAgents(data.available || []);
            setBridgeOnline(true);
        } catch (error) {
            console.error('Failed to fetch agents:', error);
            setBridgeOnline(false);
        } finally {
            setLoading(false);
        }
    };

    // Fetch Models
    const fetchModels = async () => {
        try {
            const res = await fetch(`${LUXRIG_BRIDGE_URL}/llm/lmstudio/models`);
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
                setModels(data);
                setSelectedModel(data[0].id);
            }
        } catch (err) {
            console.warn('Failed to fetch models:', err);
        }
    };

    useEffect(() => {
        fetchAgents();
        fetchModels();
    }, []);

    // Execute Agent Task
    const handleExecute = async () => {
        if (!selectedAgent || !prompt.trim()) return;

        setIsExecuting(true);
        setResult(null);

        try {
            const res = await fetch(`${LUXRIG_BRIDGE_URL}/agents/execute`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    agentType: selectedAgent.type,
                    task: {
                        action: 'generate', // This should be dynamic based on capabilities, defaulting for generic test
                        prompt: prompt,
                        // Provide fallback fields for specific agents (e.g. CodeAgent uses 'code', others 'query')
                        query: prompt,
                        code: prompt,
                        topic: prompt // For staff meetings
                    },
                    context: {
                        model: selectedModel || undefined
                    }
                })
            });

            const data = await res.json();
            setResult(data);

            // Refresh active list if needed
            fetchAgents();
        } catch (error) {
            console.error('Execution failed:', error);
            setResult({ error: 'Failed to execute task' });
        } finally {
            setIsExecuting(false);
        }
    };

    // Grouping Logic
    const categories = ['All', ...Object.keys(AGENT_CATEGORIES), 'Other'];

    const filteredAgents = availableAgents.filter(agent => {
        if (selectedCategory === 'All') return true;
        const category = getAgentCategory(agent.type);
        return category === selectedCategory;
    });

    return (
        <div className="min-h-screen pt-24 pb-20 px-6">
            <PageBackground color="purple" />

            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold mb-2">
                                <span className="text-gradient-purple">Agent</span> Registry
                            </h1>
                            <p className="text-xl text-gray-400 max-w-2xl">
                                Deploy and orchestrate autonomous AI agents.
                            </p>
                        </div>

                        <div className="flex items-center gap-3 self-end md:self-auto">
                            {/* Connection Status */}
                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border ${bridgeOnline === true
                                ? 'bg-green-500/10 border-green-500/20 text-green-400'
                                : bridgeOnline === false
                                    ? 'bg-red-500/10 border-red-500/20 text-red-400'
                                    : 'bg-gray-500/10 border-gray-500/20 text-gray-400'
                                }`}>
                                <div className={`w-2 h-2 rounded-full ${bridgeOnline === true ? 'bg-green-400 animate-pulse'
                                    : bridgeOnline === false ? 'bg-red-400'
                                        : 'bg-gray-400'
                                    }`} />
                                {bridgeOnline === true ? 'Bridge Online' : bridgeOnline === false ? 'Bridge Offline' : 'Checking...'}
                            </div>

                            <button
                                onClick={() => fetchAgents()}
                                disabled={loading}
                                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm transition-colors disabled:opacity-50"
                            >
                                {loading ? '↻' : '↻ Refresh'}
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Bridge Offline State */}
                {bridgeOnline === false && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mb-12 p-8 rounded-2xl bg-red-500/10 border border-red-500/20 text-center"
                    >
                        <Shield className="w-12 h-12 text-red-400 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">Bridge Disconnected</h3>
                        <p className="text-gray-400 mb-6 max-w-md mx-auto">
                            The Nexus Bridge API is unreachable. Ensure the local bridge service is running on port 3456 or that the correct Tunnel URL is set in Vercel.
                        </p>
                        <button
                            onClick={() => fetchAgents()}
                            className="px-6 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors border border-red-500/30"
                        >
                            Retry Connection
                        </button>
                    </motion.div>
                )}

                {/* Active Agents Section */}
                {activeAgents.length > 0 && bridgeOnline && (
                    <section className="mb-16">
                        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-6 flex items-center gap-2">
                            Active Instances ({activeAgents.length})
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {activeAgents.map((agent) => (
                                <motion.div
                                    key={agent.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-4 rounded-xl bg-gradient-to-br from-green-500/5 to-transparent border border-green-500/20 relative overflow-hidden group"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="p-2 rounded-lg bg-green-500/10 text-green-400">
                                            {getAgentIcon(agent.type?.toLowerCase() || '')}
                                        </div>
                                        <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs font-medium uppercase tracking-wide">
                                            {agent.status || 'Idle'}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-lg mb-1">{agent.name}</h3>
                                    <p className="text-xs text-green-400/50 font-mono mb-2 truncate">{agent.id}</p>
                                    {agent.capabilities && (
                                        <div className="flex flex-wrap gap-1 mt-3">
                                            {agent.capabilities.slice(0, 3).map(cap => (
                                                <span key={cap} className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-gray-400 border border-white/5">
                                                    {cap}
                                                </span>
                                            ))}
                                            {agent.capabilities.length > 3 && (
                                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-gray-500 border border-white/5">
                                                    +{agent.capabilities.length - 3}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Category Filter */}
                {bridgeOnline && (
                    <div className="flex flex-wrap gap-2 mb-8">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCategory === cat
                                    ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/25'
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                )}

                {/* Available Agents Grid */}
                {bridgeOnline && (
                    <section className="mb-16">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                                <Loader2 className="animate-spin mb-4" size={32} />
                                <p>Syncing Registry...</p>
                            </div>
                        ) : (
                            <AnimatePresence mode='popLayout'>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {filteredAgents.map((agent) => (
                                        <motion.div
                                            key={agent.type}
                                            layout
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            className="glass-card group hover:border-purple-500/50 cursor-pointer transition-all hover:-translate-y-1 relative p-3 flex items-center gap-3"
                                            onClick={() => setSelectedAgent(agent)}
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />

                                            {/* Icon */}
                                            <div className="flex-shrink-0 p-2.5 rounded-lg bg-white/5 text-gray-300 group-hover:bg-purple-500/20 group-hover:text-purple-300 transition-colors relative z-10">
                                                {getAgentIcon(agent.type)}
                                            </div>

                                            {/* Text Content */}
                                            <div className="flex-1 min-w-0 relative z-10">
                                                <div className="flex justify-between items-center mb-0.5">
                                                    <div className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">
                                                        {getAgentCategory(agent.type)}
                                                    </div>
                                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity -mr-1">
                                                        <Play size={12} className="text-purple-400" />
                                                    </div>
                                                </div>
                                                <h3 className="text-sm font-bold group-hover:text-white transition-colors truncate">
                                                    {agent.name}
                                                </h3>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </AnimatePresence>
                        )}
                    </section>
                )}
            </div>

            {/* Invocation Modal */}
            <AnimatePresence>
                {selectedAgent && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
                        onClick={() => setSelectedAgent(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="glass-card w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl shadow-purple-900/20 border border-white/10 bg-[#0a0a0a]"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-xl bg-purple-500/20 text-purple-400">
                                        {getAgentIcon(selectedAgent.type)}
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold flex items-center gap-2">
                                            {selectedAgent.name}
                                        </h2>
                                        <div className="flex items-center gap-2 text-sm text-gray-400">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                            Ready to Initialize
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedAgent(null)}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-6 flex-1 overflow-y-auto">
                                <div className="space-y-6">
                                    {/* Model Selector - Show for code-related agents */}
                                    {['code', 'architect', 'qa', 'security'].includes(selectedAgent.type) && models.length > 0 && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2 uppercase tracking-wide">
                                                Model
                                            </label>
                                            <select
                                                value={selectedModel}
                                                onChange={(e) => setSelectedModel(e.target.value)}
                                                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50 cursor-pointer"
                                            >
                                                {models.map((model) => (
                                                    <option key={model.id} value={model.id} className="bg-gray-900">
                                                        {model.id}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2 uppercase tracking-wide">
                                            Mission Directive / Prompt
                                        </label>
                                        <div className="relative">
                                            <textarea
                                                value={prompt}
                                                onChange={(e) => setPrompt(e.target.value)}
                                                placeholder={`Use natural language to instruct ${selectedAgent.name}...`}
                                                className="w-full h-32 bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all resize-none placeholder-gray-600 font-medium"
                                                autoFocus
                                            />
                                            <div className="absolute bottom-3 right-3 text-xs text-gray-600 pointer-events-none">
                                                Enter to submit
                                            </div>
                                        </div>
                                    </div>

                                    {/* Result Area */}
                                    {result && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            className="border border-white/10 rounded-xl overflow-hidden"
                                        >
                                            <div className="bg-white/5 px-4 py-2 border-b border-white/5 flex justify-between items-center">
                                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Output Log</span>
                                                <div className="flex items-center gap-3">
                                                    {result.result?.timestamp && (
                                                        <span className="text-xs font-mono text-gray-500">
                                                            {new Date(result.result.timestamp).toLocaleTimeString()}
                                                        </span>
                                                    )}
                                                    <button
                                                        onClick={() => setResult(null)}
                                                        className="text-xs text-gray-500 hover:text-red-400 transition-colors flex items-center gap-1"
                                                        title="Clear Output"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                                        </svg>
                                                        Clear
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="bg-black/40 p-4 font-mono text-sm overflow-x-auto max-h-60">
                                                {result.error ? (
                                                    <span className="text-red-400">Error: {result.error}</span>
                                                ) : (
                                                    <pre className="whitespace-pre-wrap text-gray-300">
                                                        {JSON.stringify(result.result || result, null, 2)}
                                                    </pre>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-6 border-t border-white/10 flex justify-between items-center bg-white/5">
                                <div className="text-xs text-gray-500">
                                    Executes on: <span className="text-gray-400">Local Bridge (Port 3456)</span>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setSelectedAgent(null)}
                                        className="px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleExecute}
                                        disabled={!prompt.trim() || isExecuting}
                                        className="btn-primary-purple px-6 py-2 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-900/20"
                                    >
                                        {isExecuting ? (
                                            <>
                                                <Loader2 className="animate-spin" size={18} /> Processing...
                                            </>
                                        ) : (
                                            <>
                                                <Play size={18} className="fill-current" /> Execute Agent
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
