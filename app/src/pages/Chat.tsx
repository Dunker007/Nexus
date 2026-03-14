import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield, Terminal, Layout,
  Activity, Zap, MessageSquare,
  Database, Settings, Trash2,
  Send, User, Loader2, ChevronRight
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import PageLayout from '../components/PageLayout';
import { useToast } from '../contexts/ToastContext';

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
    icon: (props: any) => <MessageSquare {...props} />, 
    color: 'text-amber-400',
    description: 'Quiet Part Loud. Deep, mellow, thoughtful.',
    systemPrompt: 'You are QPL (Quiet Part Loud). You write mellow, introspective, deeply philosophical and political lyrics.'
  }
];

export function Chat() {
  const { toast } = useToast();

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
      
      const ollamaModels = data.ollama ? [{ id: data.activeModel || 'qwen3:8b', name: data.activeModel || 'Ollama Default', size: 4000000000 }] : [];
      const lmStudioModels = data.lmStudio ? [{ id: data.activeModel || 'lmstudio-local', name: 'LM Studio Default', size: 4000000000 }] : [];

      setLocalModels({
        lmstudio: lmStudioModels,
        ollama: ollamaModels
      });

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
      // Keep last 100 messages to avoid localStorage quota exhaustion
      const trimmed = messages.slice(-100);
      try {
        localStorage.setItem('nexus-chat-messages', JSON.stringify(trimmed));
      } catch { /* quota exceeded — skip */ }
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
    fetch('/api/chat', { method: 'DELETE' }).catch(console.error);
  };

  async function sendMessage() {
    if (!input.trim() || loading) return;

    if (viewMode === 'models' && !selectedModel) {
      toast.error("Please select an engine first.");
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
          systemPrompt: reqSystem
        }),
      });

      if (!res.ok) throw new Error('LLM request failed');

      const data = await res.json();
      const reply = data.text || "No response.";

      // Stream simulation
      for (let i = 0; i <= reply.length; i += 8) {
        setStreaming(reply.slice(0, i));
        await new Promise(r => setTimeout(r, 5));
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



  return (
    <PageLayout color="cyan" noPadding>
      <div className="flex h-[calc(100vh-64px)] relative overflow-hidden">
        
        {/* Workspace Sidebar */}
        <motion.aside
          animate={{ width: sidebarOpen ? 300 : 80 }}
          className="border-r border-white/5 bg-black/40 backdrop-blur-xl flex flex-col shrink-0 relative z-20 shadow-2xl transition-all"
        >
          <div className="p-8 border-b border-white/5 flex items-center justify-between">
            {sidebarOpen && (
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-black tracking-[0.4em] text-cyan-400 mb-1.5 leading-none">Neural Link</span>
                <span className="text-xl font-black text-white tracking-tighter leading-none">WORKSPACE</span>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/30 hover:text-white transition-all ${!sidebarOpen && 'mx-auto'}`}
            >
              <ChevronRight size={16} className={`transition-transform ${sidebarOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {sidebarOpen && (
            <div className="p-4">
              <div className="flex bg-white/5 rounded-xl p-1 border border-white/5 shadow-inner">
                <button
                  onClick={() => setViewMode('agents')}
                  className={`flex-1 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${viewMode === 'agents' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-white/20 hover:text-white'}`}
                >
                  Personas
                </button>
                <button
                  onClick={() => setViewMode('models')}
                  className={`flex-1 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${viewMode === 'models' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'text-white/20 hover:text-white'}`}
                >
                  Engines
                </button>
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1">
            {viewMode === 'agents' ? (
              AGENTS.map((agent) => {
                const Icon = agent.icon;
                const isActive = activeAgentId === agent.id;
                return (
                  <button
                    key={agent.id}
                    onClick={() => setActiveAgentId(agent.id)}
                    className={`group w-full flex items-center gap-4 p-3 rounded-xl transition-all border relative ${isActive ? 'bg-cyan-500/10 border-cyan-500/30 text-white' : 'hover:bg-white/[0.03] border-transparent text-white/30 hover:text-white'}`}
                  >
                    {isActive && sidebarOpen && <motion.div layoutId="active-chat-marker" className="absolute left-1.5 top-3 bottom-3 w-0.5 bg-cyan-500 rounded-full" />}
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-black/40 border transition-all ${isActive ? 'border-cyan-500/30 text-cyan-400' : 'border-white/5'}`}>
                      <Icon size={18} />
                    </div>
                    {sidebarOpen && (
                      <div className="text-left flex-1 min-w-0">
                        <div className="text-xs font-black truncate uppercase tracking-tight">{agent.name}</div>
                        <div className="text-[8px] font-black uppercase tracking-widest opacity-30 mt-0.5">{agent.role}</div>
                      </div>
                    )}
                  </button>
                );
              })
            ) : (
              <div className="space-y-4">
                 {/* Simplified Model Listing */}
                 {localModels.ollama.map(m => (
                    <button
                      key={m.id}
                      onClick={() => setSelectedModel({ provider: 'ollama', id: m.id })}
                      className={`group w-full flex items-center gap-4 p-3 rounded-xl transition-all border ${selectedModel?.id === m.id ? 'bg-purple-500/10 border-purple-500/30 text-white' : 'hover:bg-white/[0.03] border-transparent text-white/30'}`}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-black/40 border ${selectedModel?.id === m.id ? 'border-purple-500/30 text-purple-400' : 'border-white/5'}`}>
                        <Database size={16} />
                      </div>
                      {sidebarOpen && (
                        <div className="text-left flex-1 min-w-0">
                          <div className="text-[10px] font-black truncate uppercase tracking-tight">{m.id}</div>
                          <div className="text-[7px] font-black uppercase tracking-widest opacity-30 mt-1">Ollama Native</div>
                        </div>
                      )}
                    </button>
                 ))}
              </div>
            )}
          </div>
        </motion.aside>

        {/* Primary Interaction Field */}
        <main className="flex-1 flex flex-col relative z-10">
          
          {/* Sub-Header HUD */}
          <div className="px-6 py-4 flex items-center justify-between border-b border-white/5 bg-black/10 backdrop-blur-sm">
             <div className="flex items-center gap-4">
                {viewMode === 'agents' ? (
                  <>
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${activeAgent.color.replace('text-', 'bg-')}/10 ${activeAgent.color.replace('text-', 'border-')}/40`}>
                      <activeAgent.icon className={activeAgent.color} size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-white tracking-tight uppercase">{activeAgent.name}</span>
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                      </div>
                      <div className="text-[8px] font-black uppercase tracking-[0.2em] text-white/30">{activeAgent.role}</div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-xl border bg-purple-500/10 border-purple-500/30 flex items-center justify-center shrink-0">
                      <Database className="text-purple-400" size={20} />
                    </div>
                    <div>
                      <span className="text-sm font-black text-white tracking-tight uppercase">{selectedModel?.id || 'NO_ENGINE_SELECTED'}</span>
                      <div className="text-[8px] font-black uppercase tracking-[0.2em] text-white/30">{selectedModel?.provider} Native Pipeline</div>
                    </div>
                  </>
                )}
             </div>

             <div className="flex items-center gap-2">
                {viewMode === 'models' && (
                   <button onClick={() => setShowPromptEditor(!showPromptEditor)} className={`p-2 rounded-lg border transition-all ${showPromptEditor ? 'bg-purple-500/20 border-purple-500/40 text-purple-400' : 'bg-white/5 border-white/5 text-white/30 hover:text-white'}`}>
                      <Settings size={14} />
                   </button>
                )}
                <button onClick={clearChat} className="p-2 rounded-lg bg-white/5 border border-white/5 text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all">
                  <Trash2 size={14} />
                </button>
             </div>
          </div>

          {/* System Prompt Editor */}
          <AnimatePresence>
            {showPromptEditor && viewMode === 'models' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden border-b border-white/5"
              >
                <div className="px-6 py-4 bg-purple-500/5">
                  <label className="text-[8px] font-black text-purple-400 uppercase tracking-[0.3em] mb-2 block">System Prompt</label>
                  <textarea
                    value={customSystemPrompt}
                    onChange={e => setCustomSystemPrompt(e.target.value)}
                    rows={4}
                    className="w-full glass-input border-purple-500/20 text-xs resize-none font-mono"
                    placeholder="You are a helpful AI assistant..."
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Buffer Message Field */}
          <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8 custom-scrollbar pb-40">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center opacity-40 select-none">
                <div className="text-[8px] font-black uppercase tracking-[0.4em] text-white/30 mb-2">NEURAL LINK READY</div>
                <div className="text-[9px] text-white/20">Send a message to begin.</div>
              </div>
            )}
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              const isSystem = msg.role === 'system';
              const agent = viewMode === 'agents' ? (AGENTS.find(a => a.id === msg.agentId) || AGENTS[0]) : { name: selectedModel?.id || 'Bridge', color: 'text-purple-400', icon: Database };
              const Icon = isUser ? User : isSystem ? Shield : agent.icon;

              return (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={msg.id}
                  className={`flex gap-4 max-w-4xl mx-auto w-full ${isUser ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border mt-1 shadow-xl ${isUser ? 'bg-white/5 border-white/10 text-white/40' : isSystem ? 'bg-red-500/10 border-red-500/30 text-red-400' : `${agent.color.replace('text-', 'bg-')}/10 ${agent.color.replace('text-', 'border-')}/40 ${agent.color}`}`}>
                    <Icon size={18} />
                  </div>
                  <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[85%] min-w-0`}>
                    <div className="flex items-center gap-3 mb-1.5 px-1 font-black uppercase text-[8px] tracking-[0.2em] opacity-30">
                      <span>{isUser ? 'LOCAL_USER' : isSystem ? 'KERNEL' : agent.name}</span>
                      <span>{msg.timestamp?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className={`rounded-2xl p-4 text-sm leading-relaxed relative w-full border ${isUser ? 'bg-cyan-500/10 border-cyan-500/30 text-white' : 'bg-white/[0.03] border-white/5 text-white/80'}`}>
                       {isUser || isSystem ? (
                         <p className="whitespace-pre-wrap">{msg.content}</p>
                       ) : (
                         <div className="prose prose-invert prose-p:leading-relaxed prose-pre:bg-black/50 prose-pre:p-4 prose-pre:rounded-xl prose-code:text-cyan-400 max-w-none">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                         </div>
                       )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
            
            {streaming && (
              <div className="flex gap-4 max-w-4xl mx-auto w-full">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border mt-1 animate-pulse ${viewMode === 'agents' ? `${activeAgent.color.replace('text-', 'bg-')}/10 ${activeAgent.color.replace('text-', 'border-')}/40 ${activeAgent.color}` : 'bg-purple-500/10 border-purple-500/40 text-purple-400'}`}>
                  {viewMode === 'agents' ? <activeAgent.icon size={18} /> : <Database size={18} />}
                </div>
                <div className="max-w-[85%] w-full">
                   <div className="flex items-center gap-3 mb-1.5 px-1 font-black uppercase text-[8px] tracking-[0.2em] text-cyan-400">
                      IDENTIFYING SIGNAL...
                   </div>
                   <div className="glass-card p-4 text-sm text-white/80 border-cyan-500/20 ring-1 ring-cyan-500/10">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{streaming}</ReactMarkdown>
                      <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ duration: 0.6, repeat: Infinity }} className="inline-block w-1.5 h-4 bg-cyan-400 ml-1 translate-y-0.5" />
                   </div>
                </div>
              </div>
            )}

            {loading && !streaming && (
               <div className="flex justify-center py-4">
                  <div className="flex items-center gap-4 px-5 py-2 rounded-full bg-white/5 border border-white/5 shadow-2xl">
                     <Loader2 size={14} className="animate-spin text-cyan-400" />
                     <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30">Calibrating Neural Weights...</span>
                  </div>
               </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Interactive Console HUD (Input) */}
          <div className="absolute bottom-6 inset-x-0 px-6 z-20 pointer-events-none">
            <div className="max-w-3xl mx-auto w-full pointer-events-auto">
               <div className="glass-card p-1.5 border-white/10 group focus-within:border-cyan-500/40 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] bg-[#0d0d14]/80 backdrop-blur-xl">
                  <div className="flex items-end gap-2 px-2">
                    <textarea
                      ref={inputRef}
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
                      placeholder={`TRANSMIT COMMAND TO ${viewMode === 'agents' ? activeAgent.name.toUpperCase() : 'ENGINE'}...`}
                      disabled={loading}
                      rows={1}
                      className="flex-1 bg-transparent text-white placeholder-white/10 text-sm outline-none resize-none py-4 font-medium tracking-tight min-h-[56px] max-h-40 overflow-y-auto"
                      style={{ fieldSizing: 'content' } as any}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!input.trim() || loading}
                      className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0 transition-all shadow-xl mb-1 ${viewMode === 'models' ? 'bg-purple-600 hover:bg-purple-500 shadow-purple-500/20' : 'bg-cyan-600 hover:bg-cyan-500 shadow-cyan-500/20'} active:scale-95 disabled:opacity-20 disabled:grayscale`}
                    >
                      <Send size={18} />
                    </button>
                  </div>
               </div>
               <div className="mt-3 flex justify-center">
                  <span className="text-[8px] font-black uppercase tracking-[0.5em] text-white/10">Neural Hub Bridge Alpha • Secure Layer 4</span>
               </div>
            </div>
          </div>

        </main>
      </div>
    </PageLayout>
  );
}
