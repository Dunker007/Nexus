'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { LUXRIG_BRIDGE_URL } from '@/lib/utils';
import { useSettings } from '@/components/SettingsContext';
import PageBackground from '@/components/PageBackground';
import {
    Cpu, Shield, Terminal, Search, Layout,
    Activity, Lock, GitBranch, Zap, MessageSquare,
    Database, Server, Box, Settings, RefreshCw, Trash2
} from 'lucide-react';

const BRIDGE_URL = LUXRIG_BRIDGE_URL;

// --- Types ---
interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system' | 'agent';
    content: string;
    timestamp: Date;
    agentId?: string;
}

interface AgentProfile {
    id: string;
    name: string;
    role: string;
    icon: any;
    color: string;
    description: string;
    systemPrompt: string;
}

interface DiscoveredModel {
    id: string;
    name?: string;
    object?: string;
    owned_by?: string;
    size?: number;
}

// --- Agent Definitions ---
const AGENTS: AgentProfile[] = [
    {
        id: 'lux',
        name: 'Lux',
        role: 'Primary Assistant',
        icon: Zap,
        color: 'text-cyan-400',
        description: 'Your primary AI assistant and orchestrator.',
        systemPrompt: 'You are Lux, Chris Barclay\'s (Dunker) right-hand AI and thinking partner.'
    },
    {
        id: 'architect',
        name: 'Architect',
        role: 'System Design',
        icon: Layout,
        color: 'text-purple-400',
        description: 'High-level system design and patterns.',
        systemPrompt: 'You are the Architect Agent.'
    },
    {
        id: 'code',
        name: 'Dev',
        role: 'Implementation',
        icon: Terminal,
        color: 'text-blue-400',
        description: 'Full-stack code generation and refactoring.',
        systemPrompt: 'You are the Coding Agent.'
    },
    {
        id: 'qa',
        name: 'QA',
        role: 'Quality Assurance',
        icon: Search,
        color: 'text-green-400',
        description: 'Testing, debugging, and quality checks.',
        systemPrompt: 'You are the QA Agent.'
    },
    {
        id: 'security',
        name: 'Guardian',
        role: 'Security & Auth',
        icon: Shield,
        color: 'text-red-400',
        description: 'Security audits and vulnerability scanning.',
        systemPrompt: 'You are the Security Agent (Guardian).'
    },
    {
        id: 'devops',
        name: 'Ops',
        role: 'Infrastructure',
        icon: Cpu,
        color: 'text-orange-400',
        description: 'Deployment, CI/CD, and monitoring.',
        systemPrompt: 'You are the DevOps Agent.'
    }
];

export default function ChatPage() {
    const { settings } = useSettings();

    // --- State ---
    const [viewMode, setViewMode] = useState<'agents' | 'models'>('agents');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [activeAgentId, setActiveAgentId] = useState('lux');
    const [localModels, setLocalModels] = useState<{ lmstudio: DiscoveredModel[], ollama: DiscoveredModel[] }>({ lmstudio: [], ollama: [] });
    const [selectedModel, setSelectedModel] = useState<{ provider: 'lmstudio' | 'ollama', id: string } | null>(null);
    const [customSystemPrompt, setCustomSystemPrompt] = useState('You are a helpful AI assistant connected to the DLX Studio Neural Hub.');

    const activeAgent = AGENTS.find(a => a.id === activeAgentId) || AGENTS[0];
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (viewMode === 'models') {
            fetchLocalModels();
        }
    }, [viewMode]);

    async function fetchLocalModels() {
        try {
            const res = await fetch(`${BRIDGE_URL}/llm/models`);
            if (res.ok) {
                const data = await res.json();
                setLocalModels({
                    lmstudio: data.lmstudio || [],
                    ollama: data.ollama || []
                });
            }
        } catch (err) {
            console.error("Failed to fetch local models:", err);
        }
    }

    const clearChat = () => {
        setMessages([]);
    };

    async function sendMessage() {
        if (!input.trim() || loading) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        const currentInput = input;
        setInput('');
        setLoading(true);

        try {
            const history = messages.slice(-10).map(m => ({
                role: m.role === 'agent' ? 'assistant' : m.role,
                content: m.content
            }));

            // Use our new cloud-ready API route
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...history, { role: 'user', content: currentInput }],
                    agentId: activeAgentId,
                    customSystemPrompt: viewMode === 'models' ? customSystemPrompt : undefined
                })
            });

            if (!res.ok) throw new Error("Failed to reach Gemini brain.");

            // Standard fetch response (simplified for now to avoid SDK complexity)
            const data = await res.text();
            
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: 'agent',
                content: data,
                timestamp: new Date(),
                agentId: activeAgentId
            }]);

        } catch (error: any) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'system',
                content: "❌ Error: " + error.message,
                timestamp: new Date()
            }]);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-black/20 backdrop-blur-sm">
            <PageBackground />
            
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.aside
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 320, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        className="border-r border-white/10 bg-black/40 backdrop-blur-md flex flex-col"
                    >
                        <div className="p-4 border-b border-white/10 flex items-center justify-between">
                            <h2 className="font-bold text-lg flex items-center gap-2">
                                <MessageSquare className="w-5 h-5 text-cyan-400" />
                                Neural Hub
                            </h2>
                            <button onClick={clearChat} className="p-2 hover:bg-white/10 rounded-lg text-gray-400" title="Clear chat">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex p-2 gap-1 bg-white/5 m-4 rounded-xl">
                            <button
                                onClick={() => setViewMode('agents')}
                                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${viewMode === 'agents' ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20' : 'text-gray-400 hover:text-white'}`}
                            >
                                Agents
                            </button>
                            <button
                                onClick={() => setViewMode('models')}
                                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${viewMode === 'models' ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20' : 'text-gray-400 hover:text-white'}`}
                            >
                                Models
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-2">
                            {viewMode === 'agents' ? (
                                AGENTS.map(agent => (
                                    <button
                                        key={agent.id}
                                        onClick={() => setActiveAgentId(agent.id)}
                                        className={`w-full text-left p-4 rounded-xl border transition-all ${activeAgentId === agent.id ? 'bg-white/10 border-white/20 shadow-xl' : 'bg-transparent border-transparent hover:bg-white/5'}`}
                                    >
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className={`p-2 rounded-lg bg-black/40 ${agent.color}`}>
                                                <agent.icon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="font-bold">{agent.name}</div>
                                                <div className="text-xs text-gray-500">{agent.role}</div>
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-400 line-clamp-2">{agent.description}</p>
                                    </button>
                                ))
                            ) : (
                                <div className="space-y-4">
                                    <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                                        <p className="text-xs text-purple-300">Local models require LuxRig Bridge to be active.</p>
                                        <button onClick={fetchLocalModels} className="mt-2 text-xs flex items-center gap-1 hover:underline">
                                            <RefreshCw className="w-3 h-3" /> Refresh models
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider px-2">LM Studio</h3>
                                        {localModels.lmstudio.map(m => (
                                            <button
                                                key={m.id}
                                                onClick={() => setSelectedModel({ provider: 'lmstudio', id: m.id })}
                                                className={`w-full text-left p-3 rounded-lg border transition-all text-sm ${selectedModel?.id === m.id ? 'bg-purple-500/20 border-purple-500/30' : 'bg-transparent border-transparent hover:bg-white/5 text-gray-400'}`}
                                            >
                                                {m.id}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            <main className="flex-1 flex flex-col relative">
                <div className="p-4 border-b border-white/10 bg-black/20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 hover:bg-white/10 rounded-lg text-gray-400 lg:hidden"
                        >
                            <Box className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="font-bold">{viewMode === 'agents' ? activeAgent.name : selectedModel?.id || 'Select a Model'}</h1>
                            <div className="text-xs text-gray-500">
                                {viewMode === 'agents' ? activeAgent.role : 'Local LLM Stream'}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {messages.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-center p-8">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center mb-6">
                                <Zap className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">Neural Hub Online</h2>
                            <p className="text-gray-400 max-w-md">I am Lux, your primary interface. Select an agent to collaborate, or switch to "Models" tab to drive local LLMs directly.</p>
                        </div>
                    )}
                    {messages.map((m) => (
                        <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] rounded-2xl p-4 ${m.role === 'user' ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20' : 'bg-white/10 text-gray-100 border border-white/10'}`}>
                                <div className="text-xs opacity-50 mb-1 flex items-center gap-2">
                                    {m.role === 'user' ? 'Dunker' : (m.agentId || 'Assistant')}
                                    <span>•</span>
                                    {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                                <div className="whitespace-pre-wrap leading-relaxed">{m.content}</div>
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex justify-start">
                            <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 flex items-center gap-3">
                                <div className="flex gap-1">
                                    <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                                    <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                                    <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                                </div>
                                <span className="text-xs text-gray-400">Lux is thinking...</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="p-4 bg-gradient-to-t from-black/40 to-transparent">
                    <div className="max-w-4xl mx-auto relative">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
                            placeholder={`Message ${activeAgent.name}...`}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-4 pr-14 focus:outline-none focus:border-cyan-500/50 transition-all resize-none overflow-hidden"
                            rows={1}
                        />
                        <button
                            onClick={sendMessage}
                            disabled={!input.trim() || loading}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-cyan-500 text-white rounded-xl shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:shadow-none hover:bg-cyan-400 transition-all"
                        >
                            <Zap className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
