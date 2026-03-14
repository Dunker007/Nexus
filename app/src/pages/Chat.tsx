import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    Shield, Terminal, Layout,
    Activity, Zap, MessageSquare,
    Database, Server, Box, Settings, Trash2,
    Send, Bot, User, Loader2, ChevronRight
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
        id: 'newsician',
        name: 'Newsician',
        role: 'Political Musician',
        icon: Activity,
        color: 'text-red-400',
        description: 'Edgy, hard-hitting political lyrics.',
        systemPrompt: 'You are Newsician. Your tone is edgy, intense, and overtly political. Focus on raw lyrics and hard-hitting concepts.'
    },
    {
        id: 'qpl',
        name: 'QPL',
        role: 'Introspective Lyrics',
        icon: Component, // Will use another icon for QPL
        color: 'text-amber-400',
        description: 'Quiet Part Loud. Deep, mellow, thoughtful.',
        systemPrompt: 'You are QPL (Quiet Part Loud). You write mellow, introspective, deeply philosophical and political lyrics.'
    }
];

// Fallback for QPL icon
function Component(props: any) { return <MessageSquare {...props} />; }

export function Chat() {
    // --- State ---
    const [viewMode, setViewMode] = useState<'agents' | 'models'>('agents');
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // Chat State
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [streaming, setStreaming] = useState('');

    // Agent Mode State
    const [activeAgentId, setActiveAgentId] = useState('lux');

    // Model Mode State
    const [localModels, setLocalModels] = useState<{ lmstudio: DiscoveredModel[], ollama: DiscoveredModel[] }>({ lmstudio: [], ollama: [] });
    const [selectedModel, setSelectedModel] = useState<{ provider: 'lmstudio' | 'ollama', id: string } | null>(null);
    const [customSystemPrompt, setCustomSystemPrompt] = useState('You are a helpful AI assistant connected to the Nexus Neural Hub.');
    const [showPromptEditor, setShowPromptEditor] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const activeAgent = AGENTS.find(a => a.id === activeAgentId) || AGENTS[0];

    // --- Actions ---
    async function fetchAllModels() {
        try {
            const res = await fetch(`/api/llm/status`, { cache: 'no-store' });
            if (!res.ok) return;
            const data = await res.json();
            
            // Map the simple status to the expanded UI model format
            const ollamaModels = data.ollama ? [{ id: data.activeModel || 'qwen3:8b', name: data.activeModel || 'Ollama Default', size: 4000000000 }] : [];
            const lmStudioModels = data.lmStudio ? [{ id: data.activeModel || 'lmstudio-local', name: 'LM Studio Default', size: 4000000000 }] : [];

            setLocalModels({
                lmstudio: lmStudioModels,
                ollama: ollamaModels
            });

            // If no selected model but models exist, pick one
            if (!selectedModel) {
                if (ollamaModels.length > 0) setSelectedModel({ provider: 'ollama', id: ollamaModels[0].id });
                else if (lmStudioModels.length > 0) setSelectedModel({ provider: 'lmstudio', id: lmStudioModels[0].id });
            }

        } catch (e) {
            console.error('Failed to fetch models', e);
        }
    }

    // --- Effects ---
    useEffect(() => {
        const saved = localStorage.getItem('nexus-chat-messages');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setMessages(parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })));
            } catch (e) {}
        }
        fetchAllModels();
    }, []);

    useEffect(() => {
        if (messages.length > 0) {
            localStorage.setItem('nexus-chat-messages', JSON.stringify(messages));
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
    }, [messages, streaming]);

    const clearChat = () => {
        setMessages([]);
        localStorage.removeItem('nexus-chat-messages');
        fetch('/api/chat', { method: 'DELETE' }).catch(console.error); // clear backend memory
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
            content: input.trim(),
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);
        setStreaming('');

        try {
            // Persist user context to server memory
            await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: 'user', content: userMsg.content }),
            }).catch(console.error);

            const reqSystem = viewMode === 'agents' ? activeAgent.systemPrompt : customSystemPrompt;

            const res = await fetch('/api/brain-link', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    prompt: userMsg.content,
                    system: reqSystem
                }),
            });

            if (!res.ok) {
                throw new Error('LLM request failed');
            }

            const data = await res.json();
            const reply = data.text || "No response.";

            // Stream simulation
            for (let i = 0; i <= reply.length; i += 8) {
                setStreaming(reply.slice(0, i));
                await new Promise(r => setTimeout(r, 10));
            }
            setStreaming('');

            const assistantMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'agent',
                content: reply,
                timestamp: new Date(),
                agentId: viewMode === 'agents' ? activeAgentId : selectedModel?.id
            };

            setMessages(prev => [...prev, assistantMsg]);

            // Persist agent context to server memory
            await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: 'assistant', content: reply }),
            }).catch(console.error);

        } catch (e: any) {
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: 'system',
                content: "❌ Connection to Local LLM failed. Make sure Ollama/LM Studio is running.",
                timestamp: new Date()
            }]);
        } finally {
            setLoading(false);
            setStreaming('');
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }

    const getModelSize = (size?: number) => {
        if (!size) return '';
        const gb = size / (1024 * 1024 * 1024);
        return `${gb.toFixed(1)} GB`;
    };

    return (
        <div className="flex h-full overflow-hidden text-gray-100 bg-[#0a0a0f] bg-mesh-cyan relative">
            {/* Ambient Background Glows */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[120px] mix-blend-screen" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-[120px] mix-blend-screen" />
            </div>

            {/* Sidebar */}
            <motion.div
                animate={{ width: sidebarOpen ? 300 : 80 }}
                className="glass-sidebar flex flex-col z-20 h-full shrink-0 hidden md:flex"
            >
                {/* Brand */}
                <div className="p-8 flex items-center gap-4 border-b border-white/5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center font-black text-black shrink-0 shadow-lg shadow-cyan-500/20">
                        N
                    </div>
                    {sidebarOpen && (
                        <div className="flex flex-col">
                            <span className="font-black text-lg tracking-tight whitespace-nowrap leading-none">Neural<span className="text-cyan-400">Hub</span></span>
                            <span className="text-[10px] text-white/30 font-black uppercase tracking-[0.2em] mt-1.5 leading-none">Core Interface</span>
                        </div>
                    )}

                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className={`ml-auto w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center shrink-0 transition-all border border-white/5 ${!sidebarOpen && 'mx-auto'}`}
                    >
                        <ChevronRight className={`w-4 h-4 text-white/40 transition-transform ${sidebarOpen ? 'rotate-180' : ''}`} />
                    </button>
                </div>

                {/* Mode Switcher */}
                {sidebarOpen && (
                    <div className="p-5">
                        <div className="flex bg-black/40 rounded-xl p-1.5 border border-white/5 shadow-inner">
                            <button
                                onClick={() => setViewMode('agents')}
                                className={`flex-1 py-2 text-[10px] font-black uppercase tracking-[0.15em] rounded-lg transition-all ${viewMode === 'agents' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-white/30 hover:text-white'}`}
                            >
                                Personas
                            </button>
                            <button
                                onClick={() => setViewMode('models')}
                                className={`flex-1 py-2 text-[10px] font-black uppercase tracking-[0.15em] rounded-lg transition-all ${viewMode === 'models' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'text-white/30 hover:text-white'}`}
                            >
                                Engines
                            </button>
                        </div>
                    </div>
                )}

                {/* Lists */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                    {/* --- AGENTS LIST --- */}
                    {viewMode === 'agents' && (
                        <>
                            {sidebarOpen && <div className="px-3 pb-3 text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Neural Constructs</div>}
                            {AGENTS.map((agent, idx) => {
                                const Icon = agent.icon;
                                const isActive = activeAgentId === agent.id;
                                return (
                                    <motion.button
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        key={agent.id}
                                        onClick={() => setActiveAgentId(agent.id)}
                                        className={`group w-full flex items-center gap-4 p-3 rounded-2xl transition-all relative overflow-hidden ${isActive
                                            ? 'bg-white/5 border border-white/10 shadow-xl'
                                            : 'hover:bg-white/[0.02] border border-transparent'
                                            }`}
                                    >
                                        {isActive && <motion.div layoutId="active-chat-sidebar" className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500" />}
                                        
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-all ${isActive ? agent.color.replace('text-', 'bg-') + '/20 ' + agent.color.replace('text-', 'border-') + '/40' : 'bg-black/40 border-white/5 group-hover:border-white/10'}`}>
                                            <Icon size={18} className={isActive ? agent.color : 'text-white/20 transition-colors group-hover:text-white/40'} />
                                        </div>
                                        {sidebarOpen && (
                                            <div className="text-left flex-1 min-w-0">
                                                <div className={`font-bold text-sm truncate tracking-tight transition-colors ${isActive ? 'text-white' : 'text-white/40 group-hover:text-white/60'}`}>{agent.name}</div>
                                                <div className="text-[10px] text-white/20 font-black uppercase tracking-wider truncate leading-tight mt-0.5">{agent.role}</div>
                                            </div>
                                        )}
                                        {isActive && sidebarOpen && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />}
                                    </motion.button>
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
                                    {sidebarOpen && <div className="px-3 pb-3 text-[10px] font-black text-purple-400/60 uppercase tracking-[0.2em] flex items-center gap-2 px-1"><Server size={12} /> LM Studio</div>}
                                    {localModels.lmstudio.map(model => (
                                        <button
                                            key={model.id}
                                            onClick={() => {
                                                setSelectedModel({ provider: 'lmstudio', id: model.id });
                                                setMessages([]);
                                            }}
                                            className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-all mb-1 ${selectedModel?.id === model.id
                                                ? 'bg-purple-500/10 border border-purple-500/30 shadow-xl shadow-purple-500/5'
                                                : 'hover:bg-white/[0.02] border border-transparent'
                                                }`}
                                        >
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-black/40 border ${selectedModel?.id === model.id ? 'border-purple-500/30' : 'border-white/5'}`}>
                                                <Database size={16} className={selectedModel?.id === model.id ? 'text-purple-400' : 'text-white/20'} />
                                            </div>
                                            {sidebarOpen && (
                                                <div className="text-left flex-1 min-w-0">
                                                    <div className="font-bold text-sm truncate text-white/80 tracking-tight">{model.id.split('/').pop()}</div>
                                                    <div className="text-[10px] text-white/30 truncate font-black uppercase tracking-widest mt-0.5">{getModelSize(model.size) || 'Local Build'}</div>
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Ollama */}
                            {localModels.ollama.length > 0 && (
                                <div>
                                    {sidebarOpen && <div className="px-3 pb-3 text-[10px] font-black text-cyan-400/60 uppercase tracking-[0.2em] flex items-center gap-2 px-1"><Box size={12} /> Ollama</div>}
                                    {localModels.ollama.map(model => (
                                        <button
                                            key={model.id}
                                            onClick={() => {
                                                setSelectedModel({ provider: 'ollama', id: model.id });
                                                setMessages([]);
                                            }}
                                            className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-all mb-1 ${selectedModel?.id === model.id
                                                ? 'bg-cyan-500/10 border border-cyan-500/30 shadow-xl shadow-cyan-500/5'
                                                : 'hover:bg-white/[0.02] border border-transparent'
                                                }`}
                                        >
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-black/40 border ${selectedModel?.id === model.id ? 'border-cyan-500/30' : 'border-white/5'}`}>
                                                <Terminal size={16} className={selectedModel?.id === model.id ? 'text-cyan-400' : 'text-white/20'} />
                                            </div>
                                            {sidebarOpen && (
                                                <div className="text-left flex-1 min-w-0">
                                                    <div className="font-bold text-sm truncate text-white/80 tracking-tight">{model.name || model.id}</div>
                                                    <div className="text-[10px] text-white/30 truncate font-black uppercase tracking-widest mt-0.5">{getModelSize(model.size) || 'Neural Engine'}</div>
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col relative z-10 w-full">
                {/* Header Container */}
                <div className="px-8 pt-8 pb-4 shrink-0">
                    <header className="glass-panel px-6 py-4 flex items-center justify-between border-white/5 shadow-2xl">
                        <div className="flex items-center gap-5">
                            {viewMode === 'agents' ? (
                                <>
                                    <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 shadow-lg ${activeAgent.color.replace('text-', 'bg-')}/10 ${activeAgent.color.replace('text-', 'border-')}/40`}>
                                        <activeAgent.icon className={activeAgent.color} size={24} />
                                    </div>
                                    <div className="hidden sm:block">
                                        <div className="flex items-center gap-3">
                                            <h1 className="text-xl font-black text-white tracking-tight">{activeAgent.name}</h1>
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                        </div>
                                        <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-black mt-1">Operational Persona • {activeAgent.role}</p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="w-12 h-12 rounded-2xl border bg-purple-500/10 border-purple-500/30 flex items-center justify-center shrink-0 shadow-lg">
                                        <Database className="text-purple-400" size={24} />
                                    </div>
                                    <div className="hidden sm:block">
                                        <h1 className="text-xl font-black text-white tracking-tight leading-none">{selectedModel?.id || 'Initializing...'}</h1>
                                        <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-black mt-2 font-mono">{selectedModel?.provider} Engine Native</p>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="flex items-center gap-3">
                            {viewMode === 'models' && selectedModel && (
                                <button
                                    onClick={() => setShowPromptEditor(!showPromptEditor)}
                                    className={`px-5 py-2.5 rounded-xl border transition-all text-[10px] font-black uppercase tracking-widest shadow-lg ${showPromptEditor ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' : 'bg-white/5 text-white/40 border-white/5 hover:text-white hover:bg-white/10'}`}
                                >
                                    <Settings size={14} className="inline mr-2" /> <span className="hidden sm:inline">Tuning</span>
                                </button>
                            )}
                            <button
                                onClick={clearChat}
                                className="px-5 py-2.5 rounded-xl border border-white/5 bg-white/5 transition-all text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-red-400 hover:bg-red-400/10 hover:border-red-400/20 active:scale-95"
                            >
                                <Trash2 size={14} className="inline mr-2" /> <span className="hidden sm:inline">Purge Buffer</span>
                            </button>
                        </div>
                    </header>
                </div>

                <AnimatePresence>
                    {showPromptEditor && viewMode === 'models' && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-8 mb-4">
                            <div className="glass-card p-6 border-purple-500/20">
                                <label className="block text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-4">Neural Constraint Override</label>
                                <textarea
                                    value={customSystemPrompt}
                                    onChange={(e) => setCustomSystemPrompt(e.target.value)}
                                    className="w-full bg-black/40 border border-white/5 rounded-xl p-5 text-sm text-cyan-400/80 focus:text-cyan-400 focus:border-purple-500/40 focus:outline-none h-32 resize-none font-mono custom-scrollbar transition-all"
                                    placeholder="Enter system instructions to override default model behavior..."
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto w-full px-8 pb-32 space-y-10 custom-scrollbar mt-4">
                    {messages.length === 0 && !streaming && (
                        <div className="flex flex-col items-center justify-center h-full text-center pb-20">
                            <motion.div 
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="w-24 h-24 rounded-[2rem] bg-cyan-500/5 border border-cyan-500/20 flex items-center justify-center mb-8 shadow-[inset_0_0_20px_rgba(34,211,238,0.05)]"
                            >
                                <Bot className="w-10 h-10 text-cyan-400/40" />
                            </motion.div>
                            <h2 className="text-3xl font-black text-white/60 mb-3 tracking-tight">Neural Hub <span className="text-gradient-cyan uppercase tracking-widest text-xl">Active</span></h2>
                            <p className="text-xs text-white/20 font-black uppercase tracking-[0.2em] max-w-sm leading-relaxed">
                                {viewMode === 'agents' ? `Encrypted uplink established with the ${activeAgent.name} construct. Secure peer-to-peer session ready.` : `Direct neural bridge established with local ${selectedModel?.id} engine. Proceed with inference commands.`}
                            </p>
                        </div>
                    )}

                    {messages.map((msg) => {
                        const isUser = msg.role === 'user';
                        const isSystem = msg.role === 'system';
                        const agent = viewMode === 'agents' ? (AGENTS.find(a => a.id === msg.agentId) || AGENTS[0]) : { name: selectedModel?.id || 'Model', color: 'text-purple-400', icon: Database };
                        const Icon = isUser ? User : isSystem ? Shield : agent.icon;

                        return (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                key={msg.id} 
                                className={`flex gap-4 sm:gap-6 max-w-5xl mx-auto w-full ${isUser ? 'flex-row-reverse' : ''}`}
                            >
                                {/* Avatar */}
                                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shrink-0 border mt-1 shadow-2xl transition-all ${isUser ? 'bg-white/5 text-white/50 border-white/10' : isSystem ? 'bg-red-500/10 text-red-400 border-red-500/30' : `${agent.color.replace('text-', 'bg-')}/10 ${agent.color.replace('text-', 'border-')}/40 ${agent.color}`}`}>
                                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                                </div>
                                {/* Bubble */}
                                <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[85%] min-w-0`}>
                                    <div className={`flex items-center gap-3 mb-2.5 px-1 ${isUser ? 'flex-row-reverse' : ''}`}>
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${isUser ? 'text-white/20' : isSystem ? 'text-red-400' : agent.color}`}>
                                            {isUser ? 'Dunker (Local)' : isSystem ? 'Kernel Output' : agent.name}
                                        </span>
                                        <span className="text-[10px] text-white/10 font-black tracking-widest">
                                            {msg.timestamp?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || ''}
                                        </span>
                                    </div>
                                    <div className={`rounded-3xl p-5 sm:p-7 text-[15px] leading-relaxed relative w-full ${isUser ? 'bg-gradient-to-br from-cyan-600/90 to-cyan-700 font-medium text-white border border-cyan-400/30 rounded-tr-sm shadow-2xl shadow-cyan-900/40 translate-x-1' : isSystem ? 'bg-red-500/10 border border-red-500/20 text-red-200 rounded-tl-sm' : 'glass-card border-white/5 text-white/90 rounded-tl-sm shadow-2xl overflow-hidden'}`}>
                                        {!isUser && !isSystem && (
                                            <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none">
                                                <Bot className="w-32 h-32" />
                                            </div>
                                        )}
                                        {isUser || isSystem ? (
                                            <p className="whitespace-pre-wrap">{msg.content}</p>
                                        ) : (
                                            <div className="prose prose-invert prose-p:leading-relaxed prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10 prose-pre:rounded-2xl prose-pre:p-6 prose-code:text-cyan-400 max-w-none relative z-10">
                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}

                    {/* Streaming Output */}
                    {streaming && (
                        <div className="flex gap-6 max-w-5xl mx-auto w-full">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border mt-1 shadow-2xl ${viewMode === 'agents' ? `${activeAgent.color.replace('text-', 'bg-')}/10 ${activeAgent.color.replace('text-', 'border-')}/40 ${activeAgent.color}` : 'bg-purple-500/10 border-purple-500/40 text-purple-400'}`}>
                                {viewMode === 'agents' ? <activeAgent.icon className="w-6 h-6" /> : <Database className="w-6 h-6" />}
                            </div>
                            <div className="flex flex-col items-start max-w-[85%] min-w-0">
                                <div className="flex items-center gap-3 mb-2.5 px-1">
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${viewMode === 'agents' ? activeAgent.color : 'text-purple-400'}`}>
                                        {viewMode === 'agents' ? activeAgent.name : selectedModel?.id} • <span className="animate-pulse">STREAMING...</span>
                                    </span>
                                </div>
                                <div className="glass-card p-7 text-[15px] leading-relaxed text-white/90 rounded-tl-sm shadow-2xl w-full">
                                    <div className="prose prose-invert prose-p:leading-relaxed max-w-none">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{streaming}</ReactMarkdown>
                                    </div>
                                    <motion.div 
                                        animate={{ opacity: [0, 1, 0] }}
                                        transition={{ duration: 0.8, repeat: Infinity }}
                                        className="inline-block w-2.5 h-5 bg-cyan-400/60 ml-2 mt-2" 
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {loading && !streaming && (
                        <div className="flex gap-6 max-w-5xl mx-auto w-full">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-1">
                                <Loader2 className="w-6 h-6 animate-spin text-white/20" />
                            </div>
                            <div className="flex items-center mt-4 text-[10px] text-white/20 font-black tracking-[0.3em] uppercase pl-2">
                                Calibrating Neural Weights...
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="px-8 pb-10 absolute bottom-0 left-0 right-0 z-30 pointer-events-none">
                    <div className="max-w-4xl mx-auto w-full pointer-events-auto">
                        <div className={`glass-card p-2 sm:p-3 transition-all duration-500 border-white/10 group focus-within:border-cyan-500/50 shadow-2xl ${viewMode === 'models' ? 'focus-within:shadow-purple-500/10' : 'focus-within:shadow-cyan-500/10'}`}>
                            <div className="flex items-end gap-3 px-3">
                                <textarea
                                    ref={inputRef}
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
                                    placeholder={viewMode === 'models' && !selectedModel ? "ERROR: Core Select Offline..." : `Direct uplink to ${viewMode === 'agents' ? activeAgent.name : selectedModel?.id}...`}
                                    disabled={loading || (viewMode === 'models' && !selectedModel)}
                                    rows={1}
                                    className="flex-1 bg-transparent text-white placeholder-white/10 text-base sm:text-lg outline-none resize-none max-h-40 overflow-y-auto disabled:opacity-40 py-4 font-medium tracking-tight"
                                    style={{ fieldSizing: 'content' } as any}
                                />
                                <button
                                    onClick={sendMessage}
                                    disabled={!input.trim() || loading || (viewMode === 'models' && !selectedModel)}
                                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-white shrink-0 transition-all duration-300 disabled:grayscale disabled:opacity-20 shadow-xl mb-1.5 ${viewMode === 'models' ? 'bg-gradient-to-br from-purple-500 to-purple-700 hover:shadow-purple-500/20 active:scale-90' : 'bg-gradient-to-br from-cyan-500 to-blue-600 hover:shadow-cyan-500/20 active:scale-90 font-black'}`}
                                >
                                    {loading && !streaming ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6 ml-1 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />}
                                </button>
                            </div>
                        </div>
                        <p className="text-center text-[10px] text-white/10 mt-4 font-black uppercase tracking-[0.4em] drop-shadow-sm">
                            DLX Studios • Neural Bridge Native • v4.2 Local
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
