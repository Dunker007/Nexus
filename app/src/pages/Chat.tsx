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
        <div className="flex h-full overflow-hidden text-gray-100 bg-[#0a0a0f]">
            {/* Sidebar */}
            <motion.div
                animate={{ width: sidebarOpen ? 300 : 80 }}
                className="border-r border-white/5 bg-[#0d0d14] flex flex-col z-20 h-full shrink-0 hidden md:flex"
            >
                {/* Brand */}
                <div className="p-6 flex items-center gap-3 border-b border-white/5">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-black shrink-0">
                        N
                    </div>
                    {sidebarOpen && <span className="font-bold text-lg tracking-tight whitespace-nowrap">Neural<span className="text-cyan-400">Hub</span></span>}

                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="ml-auto w-6 h-6 rounded-md bg-white/5 hover:bg-white/10 flex items-center justify-center shrink-0 transition-colors"
                    >
                        <ChevronRight className={`w-4 h-4 transition-transform ${sidebarOpen ? 'rotate-180' : ''}`} />
                    </button>
                </div>

                {/* Mode Switcher */}
                {sidebarOpen && (
                    <div className="p-4 border-b border-white/5">
                        <div className="flex bg-black/40 rounded-lg p-1 border border-white/5">
                            <button
                                onClick={() => setViewMode('agents')}
                                className={`flex-1 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${viewMode === 'agents' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-gray-500 hover:text-white'}`}
                            >
                                Agents
                            </button>
                            <button
                                onClick={() => setViewMode('models')}
                                className={`flex-1 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${viewMode === 'models' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'text-gray-500 hover:text-white'}`}
                            >
                                Models
                            </button>
                        </div>
                    </div>
                )}

                {/* Lists */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                    {/* --- AGENTS LIST --- */}
                    {viewMode === 'agents' && (
                        <>
                            {sidebarOpen && <div className="px-2 pb-2 text-[10px] font-bold text-white/30 uppercase tracking-widest">Active Personas</div>}
                            {AGENTS.map(agent => {
                                const Icon = agent.icon;
                                const isActive = activeAgentId === agent.id;
                                return (
                                    <button
                                        key={agent.id}
                                        onClick={() => setActiveAgentId(agent.id)}
                                        className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all ${isActive
                                            ? 'bg-white/5 border border-white/10 shadow-lg'
                                            : 'hover:bg-white/[0.02] border border-transparent'
                                            }`}
                                    >
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border ${isActive ? agent.color.replace('text-', 'bg-') + '/10 ' + agent.color.replace('text-', 'border-') + '/30' : 'bg-black/40 border-white/5'}`}>
                                            <Icon size={18} className={isActive ? agent.color : 'text-white/40'} />
                                        </div>
                                        {sidebarOpen && (
                                            <div className="text-left flex-1 min-w-0">
                                                <div className={`font-bold text-sm truncate ${isActive ? 'text-white' : 'text-white/60'}`}>{agent.name}</div>
                                                <div className="text-xs text-white/30 font-mono truncate">{agent.role}</div>
                                            </div>
                                        )}
                                        {isActive && sidebarOpen && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />}
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
                                    {sidebarOpen && <div className="px-2 pb-2 text-[10px] font-bold text-purple-400 uppercase tracking-widest flex items-center gap-2"><Server size={12} /> LM Studio</div>}
                                    {localModels.lmstudio.map(model => (
                                        <button
                                            key={model.id}
                                            onClick={() => {
                                                setSelectedModel({ provider: 'lmstudio', id: model.id });
                                                setMessages([]);
                                            }}
                                            className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all mb-1 ${selectedModel?.id === model.id
                                                ? 'bg-purple-500/10 border border-purple-500/30'
                                                : 'hover:bg-white/[0.02] border border-transparent'
                                                }`}
                                        >
                                            <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-black/40 border border-white/5">
                                                <Database size={16} className={selectedModel?.id === model.id ? 'text-purple-400' : 'text-white/40'} />
                                            </div>
                                            {sidebarOpen && (
                                                <div className="text-left flex-1 min-w-0">
                                                    <div className="font-bold text-sm truncate text-white/80">{model.id.split('/').pop()}</div>
                                                    <div className="text-xs text-white/30 truncate font-mono">{getModelSize(model.size) || 'Local'}</div>
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Ollama */}
                            {localModels.ollama.length > 0 && (
                                <div>
                                    {sidebarOpen && <div className="px-2 pb-2 text-[10px] font-bold text-orange-400 uppercase tracking-widest flex items-center gap-2"><Box size={12} /> Ollama Engine</div>}
                                    {localModels.ollama.map(model => (
                                        <button
                                            key={model.id}
                                            onClick={() => {
                                                setSelectedModel({ provider: 'ollama', id: model.id });
                                                setMessages([]);
                                            }}
                                            className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all mb-1 ${selectedModel?.id === model.id
                                                ? 'bg-orange-500/10 border border-orange-500/30'
                                                : 'hover:bg-white/[0.02] border border-transparent'
                                                }`}
                                        >
                                            <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-black/40 border border-white/5">
                                                <Terminal size={16} className={selectedModel?.id === model.id ? 'text-orange-400' : 'text-white/40'} />
                                            </div>
                                            {sidebarOpen && (
                                                <div className="text-left flex-1 min-w-0">
                                                    <div className="font-bold text-sm truncate text-white/80">{model.name || model.id}</div>
                                                    <div className="text-xs text-white/30 truncate font-mono">{getModelSize(model.size) || 'Local'}</div>
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
                {/* Header */}
                <header className="border-b border-white/5 bg-[#0d0d14] p-4 shrink-0 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {viewMode === 'agents' ? (
                            <>
                                <div className={`w-10 h-10 rounded-lg border flex items-center justify-center shrink-0 ${activeAgent.color.replace('text-', 'bg-')}/10 ${activeAgent.color.replace('text-', 'border-')}/30`}>
                                    <activeAgent.icon className={activeAgent.color} size={20} />
                                </div>
                                <div className="hidden sm:block">
                                    <div className="flex items-center gap-2">
                                        <h1 className="text-lg font-bold text-white tracking-tight">{activeAgent.name}</h1>
                                    </div>
                                    <p className="text-[11px] text-white/40 uppercase tracking-widest font-bold">{activeAgent.role}</p>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="w-10 h-10 rounded-lg border bg-purple-500/10 border-purple-500/30 flex items-center justify-center shrink-0">
                                    <Database className="text-purple-400" size={20} />
                                </div>
                                <div className="hidden sm:block">
                                    <h1 className="text-lg font-bold text-white tracking-tight">{selectedModel?.id || 'Select a Model'}</h1>
                                    <p className="text-[11px] text-white/40 uppercase tracking-widest font-bold font-mono">{selectedModel?.provider}</p>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        {viewMode === 'models' && selectedModel && (
                            <button
                                onClick={() => setShowPromptEditor(!showPromptEditor)}
                                className={`px-3 py-1.5 rounded-lg border transition-colors flex items-center gap-1.5 text-xs font-bold ${showPromptEditor ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' : 'bg-transparent text-white/40 border-transparent hover:text-white/80 hover:bg-white/5'}`}
                            >
                                <Settings size={14} /> <span className="hidden sm:inline">Prompt</span>
                            </button>
                        )}
                        <button
                            onClick={clearChat}
                            className="px-3 py-1.5 rounded-lg border border-transparent transition-colors flex items-center gap-1.5 text-xs font-bold text-white/40 hover:text-red-400 hover:bg-red-400/10"
                        >
                            <Trash2 size={14} /> <span className="hidden sm:inline">Clear</span>
                        </button>
                    </div>
                </header>

                <AnimatePresence>
                    {showPromptEditor && viewMode === 'models' && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="bg-[#12121a] border-b border-white/5 p-4 shrink-0 overflow-hidden">
                            <label className="block text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2">System Instruction Override</label>
                            <textarea
                                value={customSystemPrompt}
                                onChange={(e) => setCustomSystemPrompt(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white/80 focus:border-purple-500/50 focus:outline-none h-20 resize-none font-mono"
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar">
                    {messages.length === 0 && !streaming && (
                        <div className="flex flex-col items-center justify-center h-full text-center pb-20">
                            <div className="w-16 h-16 rounded-2xl bg-cyan-500/5 border border-cyan-500/20 flex items-center justify-center mb-4">
                                <Bot className="w-8 h-8 text-cyan-400/50" />
                            </div>
                            <h2 className="text-xl font-bold text-white/50 mb-2">Nexus Brain Active</h2>
                            <p className="text-sm text-white/30 max-w-sm">
                                {viewMode === 'agents' ? `Communicate securely with the local ${activeAgent.name} agent.` : 'Send direct inference commands to the selected local model.'}
                            </p>
                        </div>
                    )}

                    {messages.map((msg) => {
                        const isUser = msg.role === 'user';
                        const isSystem = msg.role === 'system';
                        const agent = viewMode === 'agents' ? (AGENTS.find(a => a.id === msg.agentId) || AGENTS[0]) : { name: selectedModel?.id || 'Model', color: 'text-purple-400', icon: Database };
                        const Icon = isUser ? User : isSystem ? Shield : agent.icon;

                        return (
                            <div key={msg.id} className={`flex gap-3 sm:gap-4 max-w-4xl mx-auto w-full ${isUser ? 'flex-row-reverse' : ''}`}>
                                {/* Avatar */}
                                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 border mt-1 shadow-sm ${isUser ? 'bg-white/5 text-white/50 border-white/10' : isSystem ? 'bg-red-500/10 text-red-400 border-red-500/30' : `${agent.color.replace('text-', 'bg-')}/10 ${agent.color.replace('text-', 'border-')}/30 ${agent.color}`}`}>
                                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                                </div>
                                {/* Bubble */}
                                <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[85%]`}>
                                    <div className={`flex items-center gap-2 mb-1.5 px-1 ${isUser ? 'flex-row-reverse' : ''}`}>
                                        <span className={`text-xs font-bold uppercase tracking-widest ${isUser ? 'text-white/40' : isSystem ? 'text-red-400' : agent.color}`}>
                                            {isUser ? 'You' : isSystem ? 'System' : agent.name}
                                        </span>
                                        <span className="text-[10px] text-white/20 font-mono">
                                            {msg.timestamp?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || ''}
                                        </span>
                                    </div>
                                    <div className={`rounded-2xl p-4 sm:p-5 text-[15px] leading-relaxed relative ${isUser ? 'bg-cyan-600 font-medium text-white border border-cyan-500 rounded-tr-sm shadow-lg shadow-cyan-900/20' : isSystem ? 'bg-red-500/10 border border-red-500/20 text-red-200 rounded-tl-sm' : 'bg-[#12121a] border border-white/5 text-white/90 rounded-tl-sm shadow-md'}`}>
                                        {isUser || isSystem ? (
                                            <p className="whitespace-pre-wrap">{msg.content}</p>
                                        ) : (
                                            <div className="prose prose-invert prose-p:leading-relaxed prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10 prose-pre:rounded-xl max-w-none">
                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {/* Streaming Output */}
                    {streaming && (
                        <div className="flex gap-4 max-w-4xl mx-auto w-full">
                            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 border mt-1 shadow-sm ${viewMode === 'agents' ? `${activeAgent.color.replace('text-', 'bg-')}/10 ${activeAgent.color.replace('text-', 'border-')}/30 ${activeAgent.color}` : 'bg-purple-500/10 border-purple-500/30 text-purple-400'}`}>
                                {viewMode === 'agents' ? <activeAgent.icon className="w-5 h-5" /> : <Database className="w-5 h-5" />}
                            </div>
                            <div className="flex flex-col items-start max-w-[85%]">
                                <div className="flex items-center gap-2 mb-1.5 px-1">
                                    <span className={`text-xs font-bold uppercase tracking-widest ${viewMode === 'agents' ? activeAgent.color : 'text-purple-400'}`}>
                                        {viewMode === 'agents' ? activeAgent.name : selectedModel?.id}
                                    </span>
                                </div>
                                <div className="rounded-2xl p-4 sm:p-5 text-[15px] leading-relaxed bg-[#12121a] border border-white/5 text-white/90 rounded-tl-sm shadow-md">
                                    <div className="prose prose-invert prose-p:leading-relaxed max-w-none">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{streaming}</ReactMarkdown>
                                    </div>
                                    <span className="inline-block w-2 h-4 bg-white/50 ml-1 mt-1 animate-pulse" />
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {loading && !streaming && (
                        <div className="flex gap-4 max-w-4xl mx-auto w-full opacity-60">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-1">
                                <Loader2 className="w-5 h-5 animate-spin text-white/40" />
                            </div>
                            <div className="flex items-center mt-3 text-sm text-white/40 font-mono tracking-widest pl-2">
                                COMPUTING...
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 sm:p-6 bg-[#0a0a0f] shrink-0 border-t border-white/5 z-20">
                    <div className="max-w-4xl mx-auto">
                        <div className={`flex items-end gap-3 bg-[#12121a] border rounded-2xl p-2 sm:p-3 transition-colors ${viewMode === 'models' ? 'border-purple-500/30 focus-within:border-purple-500' : 'border-cyan-500/30 focus-within:border-cyan-500'}`}>
                            <textarea
                                ref={inputRef}
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
                                placeholder={viewMode === 'models' && !selectedModel ? "Select a model first..." : `Message ${viewMode === 'agents' ? activeAgent.name : selectedModel?.id}... (Shift+Enter for newline)`}
                                disabled={loading || (viewMode === 'models' && !selectedModel)}
                                rows={1}
                                className="flex-1 bg-transparent text-white placeholder-white/20 text-sm sm:text-base outline-none resize-none max-h-40 overflow-y-auto disabled:opacity-40 py-2 sm:py-3 px-2 sm:px-3 mb-1"
                                style={{ fieldSizing: 'content' } as any}
                            />
                            <button
                                onClick={sendMessage}
                                disabled={!input.trim() || loading || (viewMode === 'models' && !selectedModel)}
                                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-white shrink-0 transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${viewMode === 'models' ? 'bg-purple-600 hover:bg-purple-500' : 'bg-cyan-600 hover:bg-cyan-500'}`}
                            >
                                {loading && !streaming ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-1" />}
                            </button>
                        </div>
                        <p className="text-center text-[10px] text-white/20 mt-3 font-mono tracking-widest">
                            LOCAL INFERENCE ENABLED • NO CLOUD TELEMETRY
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
