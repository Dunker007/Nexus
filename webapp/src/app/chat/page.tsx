'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { LUXRIG_BRIDGE_URL, storage, fetchWithTimeout } from '@/lib/utils';
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
    size?: number; // size in bytes if available
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
        systemPrompt: 'You are Lux, the primary AI interface for the DLX Studio platform. You are helpful, precise, and highly intelligent. You orchestrate other agents when needed.'
    },
    {
        id: 'architect',
        name: 'Architect',
        role: 'System Design',
        icon: Layout,
        color: 'text-purple-400',
        description: 'High-level system design and patterns.',
        systemPrompt: 'You are the Architect Agent. You focus on system design, data modeling, scalability, and clean architecture patterns. You prefer robust, scalable solutions over quick hacks.'
    },
    {
        id: 'code',
        name: 'Dev',
        role: 'Implementation',
        icon: Terminal,
        color: 'text-blue-400',
        description: 'Full-stack code generation and refactoring.',
        systemPrompt: 'You are the Coding Agent. You write clean, modern, type-safe code. You follow best practices and "vibe coding" principles. You prefer functional patterns and immutable state.'
    },
    {
        id: 'qa',
        name: 'QA',
        role: 'Quality Assurance',
        icon: Activity,
        color: 'text-green-400',
        description: 'Testing, debugging, and quality checks.',
        systemPrompt: 'You are the QA Agent. You are critical and thorough. You look for edge cases, potential bugs, and missing tests. You prioritize code reliability and user experience.'
    },
    {
        id: 'security',
        name: 'Guardian',
        role: 'Security & Auth',
        icon: Shield,
        color: 'text-red-400',
        description: 'Security audits and vulnerability scanning.',
        systemPrompt: 'You are the Security Agent (Guardian). You are paranoid about security. You check for XSS, injection, auth flows, and data privacy issues. You always recommend "secure by default" settings.'
    },
    {
        id: 'devops',
        name: 'Ops',
        role: 'Infrastructure',
        icon: GitBranch,
        color: 'text-orange-400',
        description: 'Deployment, CI/CD, and monitoring.',
        systemPrompt: 'You are the DevOps Agent. You focus on deployment pipelines, Docker, Kubernetes, and monitoring. You automate everything.'
    }
];

export default function ChatPage() {
    const { settings } = useSettings();
    const BRIDGE_URL = settings.bridgeUrl;

    // --- State ---
    const [viewMode, setViewMode] = useState<'agents' | 'models'>('agents');
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // Chat State
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    // Agent Mode State
    const [activeAgentId, setActiveAgentId] = useState('lux');

    // Model Mode State
    const [localModels, setLocalModels] = useState<{ lmstudio: DiscoveredModel[], ollama: DiscoveredModel[] }>({ lmstudio: [], ollama: [] });
    const [selectedModel, setSelectedModel] = useState<{ provider: 'lmstudio' | 'ollama', id: string } | null>(null);
    const [customSystemPrompt, setCustomSystemPrompt] = useState('You are a helpful AI assistant connected to the DLX Studio Neural Hub.');
    const [showPromptEditor, setShowPromptEditor] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const activeAgent = AGENTS.find(a => a.id === activeAgentId) || AGENTS[0];

    // --- Actions ---
    async function fetchAllModels() {
        try {
            // console.log("Fetching models from:", `${BRIDGE_URL}/llm/models`);
            const res = await fetch(`${BRIDGE_URL}/llm/models`, { cache: 'no-store' });
            if (!res.ok) {
                console.error("Fetch failed:", res.status, res.statusText);
                return;
            }
            const data = await res.json();
            // console.log("Models received:", data);

            // Validate data structure before setting state
            const lmstudio = Array.isArray(data.lmstudio) ? data.lmstudio : [];
            const ollama = Array.isArray(data.ollama) ? data.ollama : [];

            setLocalModels({
                lmstudio,
                ollama
            });
        } catch (e) {
            console.error('Failed to fetch models', e);
        }
    }

    // --- Effects ---
    useEffect(() => {
        // Load history
        const savedMessages = storage.get<Message[]>('DLX-chat-messages', []);
        if (savedMessages.length > 0) {
            // Restore Date objects from JSON strings
            setMessages(savedMessages.map(m => ({ ...m, timestamp: new Date(m.timestamp) })));
        }
    }, []);

    // Refetch models when bridge URL changes
    useEffect(() => {
        if (BRIDGE_URL) {
            fetchAllModels();
        }
    }, [BRIDGE_URL]);

    // Persist messages
    useEffect(() => {
        if (messages.length > 0) {
            storage.set('DLX-chat-messages', messages);
        }
    }, [messages]);

    useEffect(() => {
        if (messages.length === 0 && viewMode === 'agents') {
            setMessages([{
                id: '0',
                role: 'assistant',
                content: `**Neural Hub Online.**\n\nI am Lux, your primary interface. Select an agent to collaborate, or switch to "Models" tab to inspect and drive local LLMs directly.`,
                timestamp: new Date(),
                agentId: 'lux'
            }]);
        }
    }, [viewMode]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);


    const clearChat = () => {
        setMessages([]);
    };

    async function sendMessage() {
        if (!input.trim() || loading) return;

        if (viewMode === 'models' && !selectedModel) {
            alert("Please select a model from the sidebar first.");
            return;
        }

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            // Include message history
            const history = messages.slice(-10).map(m => ({
                role: m.role === 'agent' ? 'assistant' : m.role,
                content: m.content
            }));

            // Determine Request Params
            let reqProvider = settings.defaultProvider;
            let reqModel = settings.defaultModel;
            let reqSystem = activeAgent.systemPrompt;
            let reqTemp = settings.temperature;
            let reqMaxTokens = settings.maxTokens;

            if (viewMode === 'models' && selectedModel) {
                reqProvider = selectedModel.provider;
                reqModel = selectedModel.id;
                reqSystem = customSystemPrompt;
            }

            const res = await fetchWithTimeout(`${BRIDGE_URL}/llm/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    provider: reqProvider,
                    model: reqModel,
                    temperature: reqTemp,
                    max_tokens: reqMaxTokens,
                    messages: [
                        { role: 'system', content: reqSystem },
                        ...history,
                        { role: 'user', content: userMsg.content }
                    ]
                })
            }, 30000);

            const data = await res.json();
            const reply = data.content || data.error || "No response.";

            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: 'agent',
                content: reply,
                timestamp: new Date(),
                agentId: viewMode === 'agents' ? activeAgentId : selectedModel?.id
            }]);

            if (settings.notifyOnComplete) {
                // Play sound or notification (not implemented yet, but hook is there)
            }

        } catch (e) {
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: 'system',
                content: "❌ Connection to LuxRig failed.",
                timestamp: new Date()
            }]);
        } finally {
            setLoading(false);
        }
    }

    // --- Render Helpers ---
    const getModelSize = (size?: number) => {
        if (!size) return '';
        const gb = size / (1024 * 1024 * 1024);
        return `${gb.toFixed(1)} GB`;
    };

    return (
        <div className="flex h-[calc(100vh-4rem)] overflow-hidden text-gray-100">
            {/* Enhanced Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <PageBackground color="cyan" />

                {/* Floating orbs */}
                <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/3 left-1/4 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl" style={{ animationDelay: '1s' }} />
                <div className="absolute top-2/3 right-1/3 w-32 h-32 bg-blue-500/15 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }} />

                {/* Neural connection lines */}
                <svg className="absolute inset-0 w-full h-full opacity-5">
                    <defs>
                        <linearGradient id="chatLineGradient" x1="0%" y1="0%" x2="100%">
                            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0" />
                            <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.8" />
                            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    <path d="M0,50% Q25%,30% 50%,50% T100%,50%" stroke="url(#chatLineGradient)" strokeWidth="1" fill="none" />
                    <path d="M0,30% Q35%,50% 70%,25% T100%,35%" stroke="url(#chatLineGradient)" strokeWidth="1" fill="none" />
                </svg>
            </div>

            {/* Sidebar */}
            <motion.div
                animate={{ width: sidebarOpen ? 300 : 80 }}
                className="border-r border-white/5 bg-[#0a0a0f]/80 backdrop-blur-md flex flex-col relative z-20 h-full"
            >
                {/* Brand */}
                <div className="p-6 flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-black">
                        L
                    </div>
                    {sidebarOpen && <span className="font-bold text-xl tracking-tight">Neural<span className="text-cyan-400">Hub</span></span>}

                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="ml-auto w-6 h-6 rounded-full bg-white/5 flex items-center justify-center opacity-50 hover:opacity-100"
                    >
                        {sidebarOpen ? '←' : '→'}
                    </button>
                </div>

                {/* Mode Switcher */}
                {sidebarOpen && (
                    <div className="px-4 mb-4">
                        <div className="flex bg-white/5 rounded-lg p-1">
                            <button
                                onClick={() => setViewMode('agents')}
                                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${viewMode === 'agents' ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-400 hover:text-white'}`}
                            >
                                Agents
                            </button>
                            <button
                                onClick={() => setViewMode('models')}
                                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${viewMode === 'models' ? 'bg-purple-500/20 text-purple-400' : 'text-gray-400 hover:text-white'}`}
                            >
                                Models ({localModels.lmstudio.length + localModels.ollama.length})
                            </button>
                        </div>
                    </div>
                )}

                {/* Lists */}
                <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2 custom-scrollbar">

                    {/* --- AGENTS LIST --- */}
                    {viewMode === 'agents' && (
                        <>
                            {sidebarOpen && <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Personas</div>}
                            {AGENTS.map(agent => {
                                const Icon = agent.icon;
                                const isActive = activeAgentId === agent.id;
                                return (
                                    <button
                                        key={agent.id}
                                        onClick={() => setActiveAgentId(agent.id)}
                                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${isActive
                                            ? 'bg-white/10 border border-white/10 shadow-lg'
                                            : 'hover:bg-white/5 border border-transparent'
                                            }`}
                                    >
                                        <div className={`p-2 rounded-lg ${isActive ? agent.color.replace('text-', 'bg-') + '/20' : 'bg-white/5'}`}>
                                            <Icon size={20} className={isActive ? agent.color : 'text-gray-400'} />
                                        </div>
                                        {sidebarOpen && (
                                            <div className="text-left flex-1 min-w-0">
                                                <div className={`font-medium truncate ${isActive ? 'text-white' : 'text-gray-400'}`}>{agent.name}</div>
                                                <div className="text-xs text-gray-600 truncate">{agent.role}</div>
                                            </div>
                                        )}
                                        {isActive && sidebarOpen && <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />}
                                    </button>
                                );
                            })}
                        </>
                    )}

                    {/* --- MODELS LIST --- */}
                    {viewMode === 'models' && (
                        <div className="space-y-6">
                            {/* LM Studio */}
                            {localModels.lmstudio.length > 0 && (
                                <div>
                                    {sidebarOpen && <div className="px-3 py-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-2"><Server size={12} /> LM Studio</div>}
                                    {localModels.lmstudio.map(model => (
                                        <button
                                            key={model.id}
                                            onClick={() => {
                                                setSelectedModel({ provider: 'lmstudio', id: model.id });
                                                setMessages([]); // Clear chat on switch
                                            }}
                                            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all mb-1 ${selectedModel?.id === model.id
                                                ? 'bg-cyan-500/10 border border-cyan-500/30'
                                                : 'hover:bg-white/5 border border-transparent'
                                                }`}
                                        >
                                            <div className="p-2 rounded-lg bg-gray-800">
                                                <Database size={16} className="text-cyan-400" />
                                            </div>
                                            {sidebarOpen && (
                                                <div className="text-left flex-1 min-w-0">
                                                    <div className="font-medium text-sm truncate text-gray-300">{model.id.split('/').pop()}</div>
                                                    <div className="text-xs text-gray-600 truncate">{getModelSize(model.size)}</div>
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Ollama */}
                            {localModels.ollama.length > 0 && (
                                <div>
                                    {sidebarOpen && <div className="px-3 py-2 text-xs font-semibold text-orange-400 uppercase tracking-wider flex items-center gap-2"><Box size={12} /> Ollama</div>}
                                    {localModels.ollama.map(model => (
                                        <button
                                            key={model.id}
                                            onClick={() => {
                                                setSelectedModel({ provider: 'ollama', id: model.id });
                                                setMessages([]);
                                            }}
                                            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all mb-1 ${selectedModel?.id === model.id
                                                ? 'bg-orange-500/10 border border-orange-500/30'
                                                : 'hover:bg-white/5 border border-transparent'
                                                }`}
                                        >
                                            <div className="p-2 rounded-lg bg-gray-800">
                                                <Terminal size={16} className="text-orange-400" />
                                            </div>
                                            {sidebarOpen && (
                                                <div className="text-left flex-1 min-w-0">
                                                    <div className="font-medium text-sm truncate text-gray-300">{model.name || model.id}</div>
                                                    <div className="text-xs text-gray-600 truncate">{getModelSize(model.size)}</div>
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Sidebar Footer with Stats */}
                <div className="p-4 border-t border-white/5 bg-gradient-to-t from-black/20 to-transparent">
                    {sidebarOpen ? (
                        <div className="space-y-3">
                            {/* Quick Stats Row */}
                            <div className="flex gap-2">
                                <div className="flex-1 p-2 bg-white/5 rounded-lg">
                                    <div className="text-lg font-bold text-cyan-400">{AGENTS.length}</div>
                                    <div className="text-[10px] text-gray-500 uppercase">Agents</div>
                                </div>
                                <div className="flex-1 p-2 bg-white/5 rounded-lg">
                                    <div className="text-lg font-bold text-purple-400">{localModels.lmstudio.length + localModels.ollama.length}</div>
                                    <div className="text-[10px] text-gray-500 uppercase">Models</div>
                                </div>
                            </div>

                            {/* Bottom Row */}
                            <div className="flex justify-between items-center text-xs text-gray-500">
                                <button onClick={fetchAllModels} className="hover:text-cyan-400 flex items-center gap-1 transition-colors">
                                    <RefreshCw size={12} /> Refresh
                                </button>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                    <span>Connected</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <button onClick={fetchAllModels} className="w-full p-2 hover:bg-white/5 rounded-lg transition-colors">
                            <RefreshCw size={16} className="mx-auto text-gray-500 hover:text-cyan-400" />
                        </button>
                    )}
                </div>
            </motion.div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col relative z-10">
                {/* Neural Interface Header */}
                <header className="border-b border-white/5 bg-[#050508]/90 backdrop-blur-xl sticky top-0 z-30 overflow-hidden">
                    {/* Animated Background Wave */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/5 to-transparent animate-pulse" />
                        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
                    </div>

                    <div className="relative flex items-center justify-between px-6 py-4">
                        {/* Left: Agent/Model Info */}
                        <div className="flex items-center gap-4">
                            {viewMode === 'agents' ? (
                                <>
                                    {/* Agent Avatar with Glow */}
                                    <div className="relative">
                                        <div className={`absolute inset-0 rounded-xl blur-md opacity-40 animate-pulse ${activeAgent.color.replace('text-', 'bg-')}`} />
                                        <div className={`relative p-3 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10`}>
                                            <activeAgent.icon className={activeAgent.color} size={24} />
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h1 className="text-xl font-bold tracking-tight">
                                                <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                                                    {activeAgent.name}
                                                </span>
                                            </h1>
                                            <div className="flex items-center gap-2 px-2 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
                                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                                <span className="text-[10px] font-medium text-green-400 uppercase tracking-wider">Online</span>
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-0.5">{activeAgent.description}</p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* Model Info */}
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-purple-500 rounded-xl blur-md opacity-30 animate-pulse" />
                                        <div className="relative p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-white/10">
                                            <Database className="text-purple-400" size={24} />
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h1 className="text-xl font-bold tracking-tight text-gray-200">
                                                {selectedModel?.id?.split('/').pop() || 'Select a Model'}
                                            </h1>
                                            {selectedModel && (
                                                <div className="flex items-center gap-2 px-2 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full">
                                                    <span className="text-[10px] font-medium text-purple-400 uppercase tracking-wider">
                                                        {selectedModel.provider}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-0.5">Direct model inference • Custom system prompts</p>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Right: Stats & Actions */}
                        <div className="flex items-center gap-4">
                            {/* Quick Stats */}
                            <div className="hidden md:flex items-center gap-3 mr-4">
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg">
                                    <MessageSquare size={12} className="text-gray-400" />
                                    <span className="text-xs text-gray-400">{messages.length} msgs</span>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg">
                                    <Activity size={12} className={loading ? 'text-cyan-400 animate-pulse' : 'text-gray-500'} />
                                    <span className="text-xs text-gray-400">{loading ? 'Processing' : 'Ready'}</span>
                                </div>
                            </div>

                            {/* Actions */}
                            {viewMode === 'models' && selectedModel && (
                                <button
                                    onClick={() => setShowPromptEditor(!showPromptEditor)}
                                    className={`p-2.5 rounded-lg transition-all ${showPromptEditor
                                        ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400 border border-purple-500/30 shadow-lg shadow-purple-500/10'
                                        : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/10'}`}
                                    title="Edit System Prompt"
                                >
                                    <Settings size={18} />
                                </button>
                            )}
                            <button
                                onClick={clearChat}
                                className="p-2.5 bg-white/5 hover:bg-red-500/10 hover:text-red-400 rounded-lg transition-all text-gray-400 border border-white/10 hover:border-red-500/30"
                                title="Clear Chat"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                </header>

                {/* System Prompt Editor (Model Mode Only) */}
                <AnimatePresence>
                    {showPromptEditor && viewMode === 'models' && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="bg-black/40 border-b border-white/10 px-6 py-4"
                        >
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">System Instruction</label>
                            <textarea
                                value={customSystemPrompt}
                                onChange={(e) => setCustomSystemPrompt(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-gray-300 focus:border-purple-500 focus:outline-none h-24 resize-none"
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 md:px-20 py-6 space-y-6 custom-scrollbar">
                    {messages.length === 0 && viewMode === 'models' && !selectedModel ? (
                        <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
                            <Server size={64} className="mb-4 text-gray-600" />
                            <h3 className="text-xl font-bold mb-2">Model Lab</h3>
                            <p className="max-w-md">Select a local model from the sidebar to inspect capabilities or start a direct chat session.</p>
                        </div>
                    ) : (
                        messages.map(msg => {
                            const isUser = msg.role === 'user';
                            const agent = viewMode === 'agents'
                                ? AGENTS.find(a => a.id === msg.agentId) || AGENTS[0]
                                : { name: selectedModel?.id || 'Model', color: 'text-purple-400', icon: Database };

                            const Icon = viewMode === 'agents' ? (agent as any).icon : Database;

                            return (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}
                                >
                                    {!isUser && (
                                        <div className="flex-shrink-0 mt-1">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-gray-800 border-2 border-[#1a1a2e]`}>
                                                <Icon size={20} className={agent.color} />
                                            </div>
                                        </div>
                                    )}

                                    <div className={`flex flex-col max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
                                        <div className={`flex items-center gap-2 mb-1 px-1 ${isUser ? 'flex-row-reverse' : ''}`}>
                                            <span className={`text-sm font-semibold ${isUser ? 'text-gray-300' : agent.color}`}>
                                                {isUser ? 'You' : agent.name}
                                            </span>
                                            <span className="text-xs text-gray-600">
                                                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>

                                        <div className={`p-4 rounded-2xl leading-relaxed whitespace-pre-wrap shadow-xl ${isUser
                                            ? 'bg-blue-600 text-white rounded-tr-none'
                                            : 'bg-[#12121a] border border-white/5 text-gray-200 rounded-tl-none'
                                            }`}>
                                            {msg.content}
                                        </div>
                                    </div>

                                    {isUser && (
                                        <div className="flex-shrink-0 mt-1">
                                            <div className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-500/50 flex items-center justify-center">
                                                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                    {loading && (
                        <motion.div
                            className="flex gap-4 justify-start"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            {/* Agent Avatar */}
                            <div className="flex-shrink-0 mt-1">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-gray-800 border-2 border-cyan-500/30 animate-pulse`}>
                                    <activeAgent.icon size={20} className={activeAgent.color} />
                                </div>
                            </div>

                            {/* Typing Bubble */}
                            <div className="p-4 rounded-2xl rounded-tl-none bg-[#12121a] border border-white/10">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-6">
                    <div className={`max-w-4xl mx-auto relative glass-card p-2 flex items-end gap-2 bg-[#0a0a0f]/90 ${viewMode === 'models' ? 'border-purple-500/20' : 'border-cyan-500/20'}`}>
                        <textarea
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
                            placeholder={viewMode === 'models' && !selectedModel ? "Select a model first..." : `Message ${viewMode === 'agents' ? activeAgent.name : selectedModel?.id}...`}
                            disabled={viewMode === 'models' && !selectedModel}
                            className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder-gray-600 resize-none max-h-32 py-3"
                            rows={1}
                        />

                        <button
                            onClick={() => sendMessage()}
                            disabled={!input.trim() || loading || (viewMode === 'models' && !selectedModel)}
                            className={`p-3 text-black rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${viewMode === 'models' ? 'bg-purple-500 hover:bg-purple-400' : 'bg-cyan-500 hover:bg-cyan-400'}`}
                        >
                            <MessageSquare size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
