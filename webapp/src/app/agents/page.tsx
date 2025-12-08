'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Play, Terminal, Cpu } from 'lucide-react';
import PageBackground from '@/components/PageBackground';
import { LUXRIG_BRIDGE_URL } from '@/lib/utils';

// Agent Interfaces
interface Agent {
    id: string; // Active ID
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

export default function AgentsPage() {
    const [activeAgents, setActiveAgents] = useState<Agent[]>([]);
    const [availableAgents, setAvailableAgents] = useState<AvailableAgent[]>([]);
    const [loading, setLoading] = useState(true);

    // Invocation State
    const [selectedAgent, setSelectedAgent] = useState<AvailableAgent | null>(null);
    const [prompt, setPrompt] = useState('');
    const [isExecuting, setIsExecuting] = useState(false);
    const [result, setResult] = useState<any>(null);

    // Fetch Agents
    const fetchAgents = async () => {
        try {
            const res = await fetch(`${LUXRIG_BRIDGE_URL}/agents`);
            const data: AgentResponse = await res.json();
            setActiveAgents(data.active || []);
            setAvailableAgents(data.available || []);
        } catch (error) {
            console.error('Failed to fetch agents:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAgents();
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
                        action: 'generate', // Default action for now, could be dynamic
                        prompt: prompt,
                        // Basic task structure support
                        query: prompt,
                        code: prompt
                    }
                })
            });

            const data = await res.json();
            setResult(data);

            // Refresh active list as a new agent might have been created
            fetchAgents();
        } catch (error) {
            console.error('Execution failed:', error);
            setResult({ error: 'Failed to execute task' });
        } finally {
            setIsExecuting(false);
        }
    };

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
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        <span className="text-gradient-purple">Agent</span> Registry
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl">
                        Deploy and orchestrate autonomous AI agents.
                    </p>
                </motion.div>

                {/* Available Agents Grid */}
                <section className="mb-16">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <Cpu className="text-purple-400" /> Available Models
                    </h2>

                    {loading ? (
                        <div className="flex items-center gap-2 text-gray-500">
                            <Loader2 className="animate-spin" /> Loading registry...
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {availableAgents.map((agent) => (
                                <motion.div
                                    key={agent.type}
                                    className="glass-card hover:border-purple-500/50 cursor-pointer transition-all hover:-translate-y-1"
                                    onClick={() => setSelectedAgent(agent)}
                                    layoutId={agent.type}
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 rounded-lg bg-purple-500/20 text-purple-400">
                                            <Terminal size={24} />
                                        </div>
                                        <span className="px-2 py-1 rounded text-xs bg-white/10 text-gray-400">
                                            Ready
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">{agent.name}</h3>
                                    <button className="w-full mt-4 btn-outline-purple flex items-center justify-center gap-2">
                                        <Play size={16} /> Deploy
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Active Agents List */}
                {activeAgents.length > 0 && (
                    <section>
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <Loader2 className="text-green-400" /> Active Instances
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {activeAgents.map((agent) => (
                                <div key={agent.id} className="p-4 rounded-xl bg-white/5 border border-white/10">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="font-bold">{agent.name}</h3>
                                        <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs text-uppercase">
                                            {agent.status || 'Idle'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 font-mono">{agent.id}</p>
                                </div>
                            ))}
                        </div>
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
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                        onClick={() => setSelectedAgent(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="glass-card w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col"
                            onClick={e => e.stopPropagation()}
                            layoutId={selectedAgent.type}
                        >
                            {/* Modal Header */}
                            <div className="p-6 border-b border-white/10 flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-bold flex items-center gap-2">
                                        <Terminal className="text-purple-400" />
                                        Invoke {selectedAgent.name}
                                    </h2>
                                    <p className="text-gray-400 text-sm mt-1">Assign a task to this agent.</p>
                                </div>
                                <button
                                    onClick={() => setSelectedAgent(null)}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-6 flex-1 overflow-y-auto">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Task / Prompt</label>
                                        <textarea
                                            value={prompt}
                                            onChange={(e) => setPrompt(e.target.value)}
                                            placeholder={`Describe what checking ${selectedAgent.name} should do...`}
                                            className="w-full h-32 bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500/50 transition-colors resize-none"
                                            autoFocus
                                        />
                                    </div>

                                    {/* Result Area */}
                                    {result && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            className="bg-black/40 rounded-lg p-4 font-mono text-sm border border-white/5"
                                        >
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-xs text-gray-500">RESULT</span>
                                                {result.result?.timestamp && (
                                                    <span className="text-xs text-gray-600">
                                                        {new Date(result.result.timestamp).toLocaleTimeString()}
                                                    </span>
                                                )}
                                            </div>
                                            <pre className="whitespace-pre-wrap text-gray-300 overflow-x-auto">
                                                {JSON.stringify(result.result || result, null, 2)}
                                            </pre>
                                        </motion.div>
                                    )}
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-6 border-t border-white/10 flex justify-end gap-3 bg-black/20">
                                <button
                                    onClick={() => setSelectedAgent(null)}
                                    className="px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleExecute}
                                    disabled={!prompt.trim() || isExecuting}
                                    className="btn-primary-purple px-6 py-2 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isExecuting ? (
                                        <>
                                            <Loader2 className="animate-spin" size={18} /> Executing...
                                        </>
                                    ) : (
                                        <>
                                            <Play size={18} /> Run Task
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
