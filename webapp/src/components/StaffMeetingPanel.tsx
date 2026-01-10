'use client';

import { useState, useEffect, useRef, useCallback, useId } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Send, Bot, Shield, Zap, Brain, Sparkles, Check, X, ChevronRight } from 'lucide-react';

// Agent Definitions
const AGENTS = [
    { id: 'architect', name: 'Architect', role: 'System Design', color: 'purple', icon: <Brain size={16} /> },
    { id: 'guardian', name: 'Guardian', role: 'Security & Safety', color: 'green', icon: <Shield size={16} /> },
    { id: 'lux', name: 'Lux', role: 'Creative Director', color: 'cyan', icon: <Sparkles size={16} /> },
    { id: 'oracle', name: 'Oracle', role: 'Data Strategy', color: 'indigo', icon: <Zap size={16} /> },
    { id: 'bytebot', name: 'ByteBot', role: 'Automation', color: 'orange', icon: <Bot size={16} /> },
];

interface LabData {
    id: string;
    name: string;
    category: string;
    status: string;
    priority: string;
}

interface Message {
    id: string;
    agentId: string;
    text: string;
    type: 'chat' | 'proposal' | 'alert';
    proposalData?: { labId: string; updates: Record<string, string> };
    timestamp: number;
}

interface StaffMeetingPanelProps {
    labsData: LabData[];
    onUpdateLab: (id: string, updates: Record<string, string>) => void;
    selectedLabId: string | null;
}

export default function StaffMeetingPanel({ labsData, onUpdateLab, selectedLabId }: StaffMeetingPanelProps) {
    const [isOpen, setIsOpen] = useState(true);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const instanceId = useId();
    const messageCounterRef = useRef(0);

    // Memoized function to generate unique message IDs
    const generateMessageId = useCallback(() => {
        messageCounterRef.current += 1;
        return `${instanceId}-msg-${messageCounterRef.current}`;
    }, [instanceId]);

    // Helper to add a message with typing simulation
    const addMessage = useCallback((
        agentId: string,
        text: string,
        type: 'chat' | 'proposal' | 'alert' = 'chat',
        proposalData?: { labId: string; updates: Record<string, string> }
    ) => {
        setIsTyping(agentId);
        const typingDelay = 1000 + (messageCounterRef.current % 10) * 100; // Deterministic delay

        setTimeout(() => {
            setMessages(prev => [...prev, {
                id: generateMessageId(),
                agentId,
                text,
                type,
                proposalData,
                timestamp: Date.now() // Allowed inside event handler/timeout
            }]);
            setIsTyping(null);
            // Auto scroll
            setTimeout(() => {
                if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            }, 100);
        }, typingDelay);
    }, [generateMessageId]);

    // Run audit function - declared before useEffect
    const runAudit = useCallback(() => {
        addMessage('architect', "Initializing system audit. Reviewing active initiatives...");

        // Heuristic: Check High Priority Count
        const highPriCount = labsData.filter(l => l.priority === 'High').length;
        if (highPriCount > 4) {
            setTimeout(() => {
                addMessage('guardian', `Warning: Resource strain detected. ${highPriCount} High Priority initiatives is risky.`, 'alert');
            }, 2000);
        }

        // Heuristic: Check Concept Count
        const conceptCount = labsData.filter(l => l.status === 'concept').length;
        if (conceptCount < 2) {
            setTimeout(() => {
                addMessage('lux', "We're stagnating! We need more wild concepts in the pipeline.", 'chat');
            }, 3500);
        }
    }, [addMessage, labsData]);

    // Discuss lab function - declared before useEffect
    const discussLab = useCallback((lab: LabData) => {
        if (lab.category === 'Operations') {
            addMessage('guardian', `Reviewing ${lab.name}. Operational security is paramount here.`);
        } else if (lab.category === 'Creation') {
            addMessage('lux', `${lab.name} has huge potential. Are we pushing the visuals enough?`);
        } else if (lab.category === 'Capital') {
            addMessage('oracle', `Analyzing ROI potential for ${lab.name}...`);
        } else {
            addMessage('architect', `Let's discuss the architecture for ${lab.name}.`);
        }

        // Deterministic proposal based on lab id hash instead of Math.random
        const shouldPropose = lab.id.charCodeAt(0) % 3 === 0;
        if (shouldPropose && lab.status !== 'active') {
            setTimeout(() => {
                addMessage('bytebot', `I can accelerate ${lab.name} deployment. Move to Active?`, 'proposal', { labId: lab.id, updates: { status: 'active' } });
            }, 3000);
        }
    }, [addMessage]);

    // Initial Audit Simulation
    useEffect(() => {
        if (messages.length === 0) {
            setTimeout(() => runAudit(), 0);
        }
    }, [messages.length, runAudit]);

    // Reactive: When selectedLabId changes
    useEffect(() => {
        if (selectedLabId) {
            const lab = labsData.find(l => l.id === selectedLabId);
            if (lab) {
                setTimeout(() => discussLab(lab), 0);
            }
        }
    }, [selectedLabId, labsData, discussLab]);

    const handleSendMessage = useCallback(() => {
        if (!inputValue.trim()) return;

        const userMsg: Message = {
            id: generateMessageId(),
            agentId: 'user',
            text: inputValue,
            type: 'chat',
            timestamp: Date.now() // Allowed in event handler
        };
        setMessages(prev => [...prev, userMsg]);
        setInputValue('');

        // Simple Router
        const lower = inputValue.toLowerCase();
        if (lower.includes('deploy') || lower.includes('build')) {
            addMessage('bytebot', "I'm on it. Preparing deployment pipelines.");
        } else if (lower.includes('secure') || lower.includes('safe')) {
            addMessage('guardian', "Security protocols are my top priority.");
        } else if (lower.includes('idea') || lower.includes('brainstorm')) {
            addMessage('lux', "Let's get crazy! What if we added more neon?");
        } else {
            addMessage('architect', "Acknowledged. Updating system parameters.");
        }
    }, [inputValue, generateMessageId, addMessage]);

    const handleAcceptProposal = useCallback((msgId: string, data: { labId: string; updates: Record<string, string> }) => {
        onUpdateLab(data.labId, data.updates);
        setMessages(prev => prev.map(m => m.id === msgId ? { ...m, type: 'chat' as const, text: `${m.text} [ACCEPTED]` } : m));
        addMessage('architect', `Changes applied to roadmap.`);
    }, [onUpdateLab, addMessage]);

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-8 right-8 w-14 h-14 bg-indigo-600 hover:bg-indigo-500 rounded-full flex items-center justify-center shadow-xl z-50 transition-transform hover:scale-110"
            >
                <MessageSquare className="text-white" />
            </button>
        );
    }

    return (
        <div className="flex flex-col h-full bg-[#0a0a0e] border-l border-white/5 relative">
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/20">
                <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                        {AGENTS.map(agent => (
                            <div key={agent.id} className={`w-8 h-8 rounded-full border-2 border-[#0a0a0e] flex items-center justify-center bg-${agent.color}-900/50 text-${agent.color}-400`} title={agent.name}>
                                {agent.icon}
                            </div>
                        ))}
                    </div>
                    <div>
                        <h3 className="font-bold text-sm text-white">Staff Meeting</h3>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            <span className="text-xs text-green-400">Live Session</span>
                        </div>
                    </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white"><ChevronRight /></button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                {messages.map((msg) => {
                    const agent = AGENTS.find(a => a.id === msg.agentId);
                    const isUser = msg.agentId === 'user';

                    return (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, x: isUser ? 20 : -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
                        >
                            {!isUser && (
                                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mt-1 bg-${agent?.color}-900/20 text-${agent?.color}-400 border border-${agent?.color}-500/30`}>
                                    {agent?.icon}
                                </div>
                            )}

                            <div className={`space-y-2 max-w-[80%]`}>
                                <div className={`p-3 rounded-2xl text-sm ${isUser
                                    ? 'bg-indigo-600 text-white rounded-tr-none'
                                    : msg.type === 'alert'
                                        ? 'bg-red-900/20 border border-red-500/30 text-red-200 rounded-tl-none'
                                        : 'bg-white/5 border border-white/10 text-gray-200 rounded-tl-none'
                                    }`}>
                                    {!isUser && <div className={`text-xs font-bold mb-1 text-${agent?.color}-400`}>{agent?.name}</div>}
                                    {msg.text}
                                </div>

                                {msg.type === 'proposal' && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => msg.proposalData && handleAcceptProposal(msg.id, msg.proposalData)}
                                            className="flex-1 py-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-400 text-xs font-bold rounded flex items-center justify-center gap-1 border border-green-500/30 transition-colors"
                                        >
                                            <Check size={14} /> Accept
                                        </button>
                                        <button className="flex-1 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs font-bold rounded flex items-center justify-center gap-1 border border-red-500/30 transition-colors">
                                            <X size={14} /> Reject
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    );
                })}

                {isTyping && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/5 animate-pulse"></div>
                        <div className="p-3 rounded-2xl bg-white/5 text-xs text-gray-500 flex items-center gap-1">
                            typing...
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-white/10 bg-black/20">
                <div className="relative">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Ask the team..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-12 py-3 text-sm focus:border-indigo-500 outline-none transition-colors"
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}
