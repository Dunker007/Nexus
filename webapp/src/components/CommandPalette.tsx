'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Command, Sparkles, Clock, ArrowRight, Mic } from 'lucide-react';
import { LUXRIG_BRIDGE_URL } from '@/lib/utils';
import FocusTrap from '@/components/ui/FocusTrap';

interface CommandItem {
    id: string;
    icon: string;
    label: string;
    shortcut?: string;
    category: string;
    action: () => void;
}

export default function CommandPalette() {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [mode, setMode] = useState<'commands' | 'ai'>('commands');
    const [aiResponse, setAiResponse] = useState<string | null>(null);
    const [aiLoading, setAiLoading] = useState(false);
    const [recentCommands, setRecentCommands] = useState<string[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    // Load recent commands from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('dlx-recent-commands');
        if (saved) {
            setRecentCommands(JSON.parse(saved).slice(0, 5));
        }
    }, []);

    // Detect if user is asking AI (natural language query)
    useEffect(() => {
        const looksLikeQuestion = search.startsWith('?') ||
            search.toLowerCase().startsWith('how') ||
            search.toLowerCase().startsWith('what') ||
            search.toLowerCase().startsWith('why') ||
            search.toLowerCase().startsWith('can you') ||
            search.toLowerCase().startsWith('help me');

        if (looksLikeQuestion && search.length > 5) {
            setMode('ai');
        } else {
            setMode('commands');
        }
    }, [search]);

    const saveRecentCommand = (cmdId: string) => {
        const updated = [cmdId, ...recentCommands.filter(r => r !== cmdId)].slice(0, 5);
        setRecentCommands(updated);
        localStorage.setItem('dlx-recent-commands', JSON.stringify(updated));
    };

    const triggerThemeToggle = () => {
        window.dispatchEvent(new CustomEvent('toggle-theme'));
    };

    const commands: CommandItem[] = [
        // Quick Actions
        { id: 'new-chat', icon: '💬', label: 'New Chat with Lux', shortcut: 'N', category: 'Quick Actions', action: () => router.push('/chat') },
        { id: 'deploy-agent', icon: '🚀', label: 'Deploy an Agent', category: 'Quick Actions', action: () => router.push('/agents') },
        { id: 'check-revenue', icon: '💰', label: 'Check Revenue', category: 'Quick Actions', action: () => router.push('/income') },
        { id: 'run-pipeline', icon: '⚡', label: 'Run Content Pipeline', category: 'Quick Actions', action: () => router.push('/pipeline') },
        { id: 'start-meeting', icon: '👥', label: 'Start AI Meeting', category: 'Quick Actions', action: () => router.push('/meeting') },
        { id: 'voice-mode', icon: '🎙️', label: 'Activate Voice Mode', category: 'Quick Actions', action: () => router.push('/voice') },

        // Core Navigation
        { id: 'home', icon: '🏠', label: 'Go to Home', shortcut: 'G H', category: 'Navigation', action: () => router.push('/') },
        { id: 'dashboard', icon: '📊', label: 'Go to Dashboard', shortcut: 'G D', category: 'Navigation', action: () => router.push('/dashboard') },
        { id: 'pipeline', icon: '🚀', label: 'Go to Pipeline', shortcut: 'G P', category: 'Navigation', action: () => router.push('/pipeline') },
        { id: 'news', icon: '📰', label: 'Go to News', shortcut: 'G N', category: 'Navigation', action: () => router.push('/news') },
        { id: 'settings', icon: '⚙️', label: 'Settings', shortcut: 'G S', category: 'Navigation', action: () => router.push('/settings') },

        // AI & LLM
        { id: 'chat', icon: '💬', label: 'Neural Hub (Chat)', shortcut: 'G C', category: 'AI', action: () => router.push('/chat') },
        { id: 'agents', icon: '🤖', label: 'Agent Headquarters', category: 'AI', action: () => router.push('/agents') },
        { id: 'labs', icon: '🔬', label: 'AI Labs', shortcut: 'G L', category: 'AI', action: () => router.push('/labs') },
        { id: 'studios', icon: '🎨', label: 'Studios', category: 'AI', action: () => router.push('/studios') },
        { id: 'meeting', icon: '👥', label: 'AI Staff Meeting', category: 'AI', action: () => router.push('/meeting') },
        { id: 'voice', icon: '🎙️', label: 'Voice Control', category: 'AI', action: () => router.push('/voice') },

        // Creative
        { id: 'music', icon: '🎵', label: 'Music Studio', shortcut: 'G M', category: 'Creative', action: () => router.push('/music') },
        { id: 'playground', icon: '🎮', label: 'Playground', category: 'Creative', action: () => router.push('/playground') },

        // Revenue (Growth Phase)
        { id: 'income', icon: '💸', label: 'Revenue Hub', shortcut: 'G I', category: 'Revenue', action: () => router.push('/income') },
        { id: 'music-revenue', icon: '🎵', label: 'Music Revenue', category: 'Revenue', action: () => router.push('/income/music') },
        { id: 'art-revenue', icon: '🎨', label: 'Art Revenue', category: 'Revenue', action: () => router.push('/income/art') },
        { id: 'ideas', icon: '💡', label: 'Income Ideas', category: 'Revenue', action: () => router.push('/income/ideas') },
        { id: 'tracker', icon: '📈', label: 'Income Tracker', category: 'Revenue', action: () => router.push('/income/tracker') },
        { id: 'crypto', icon: '💎', label: 'Crypto Lab', category: 'Revenue', action: () => router.push('/crypto') },

        // System
        { id: 'theme-switch', icon: '🌓', label: 'Toggle Theme', shortcut: 'T', category: 'System', action: triggerThemeToggle },
        { id: 'status', icon: '🚦', label: 'System Status', category: 'System', action: () => router.push('/status') },
        { id: 'housekeeper', icon: '🧹', label: 'Housekeeper (Backup/Cleanup)', category: 'System', action: () => router.push('/backup') },
        { id: 'models', icon: '🧠', label: 'LLM Models', category: 'System', action: () => router.push('/models') },
    ];

    const filteredCommands = search
        ? commands.filter(cmd =>
            cmd.label.toLowerCase().includes(search.toLowerCase()) ||
            cmd.category.toLowerCase().includes(search.toLowerCase())
        )
        : commands;

    const groupedCommands = filteredCommands.reduce((acc, cmd) => {
        if (!acc[cmd.category]) acc[cmd.category] = [];
        acc[cmd.category].push(cmd);
        return acc;
    }, {} as Record<string, CommandItem[]>);

    const flatCommands = filteredCommands;

    // Handle AI query
    async function handleAiQuery() {
        if (!search.trim()) return;

        setAiLoading(true);
        setAiResponse(null);

        try {
            const query = search.startsWith('?') ? search.slice(1).trim() : search;
            const response = await fetch(`${LUXRIG_BRIDGE_URL}/llm/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [
                        { role: 'system', content: 'You are Lux, the AI assistant for DLX Studio. Be very concise (1-2 sentences max). You can suggest navigation commands like "go to /dashboard" or actions.' },
                        { role: 'user', content: query }
                    ]
                })
            });

            const data = await response.json();
            setAiResponse(data.content || 'I could not process that request.');
        } catch {
            setAiResponse('AI is offline. Make sure LuxRig Bridge is running.');
        } finally {
            setAiLoading(false);
        }
    }

    // Keyboard handlers
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Open palette
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setOpen(prev => !prev);
                setSearch('');
                setSelectedIndex(0);
                setAiResponse(null);
                setMode('commands');
            }

            // Close on escape
            if (e.key === 'Escape') {
                setOpen(false);
            }

            // Navigate with arrows
            if (open && mode === 'commands') {
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setSelectedIndex(prev => Math.min(prev + 1, flatCommands.length - 1));
                }
                if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setSelectedIndex(prev => Math.max(prev - 1, 0));
                }
                if (e.key === 'Enter' && flatCommands[selectedIndex]) {
                    e.preventDefault();
                    saveRecentCommand(flatCommands[selectedIndex].id);
                    flatCommands[selectedIndex].action();
                    setOpen(false);
                }
            }

            // AI mode enter
            if (open && mode === 'ai' && e.key === 'Enter') {
                e.preventDefault();
                handleAiQuery();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [open, selectedIndex, flatCommands, mode, search]);

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setOpen(false)}
                    />

                    {/* Palette */}
                    <motion.div
                        className="fixed top-[15%] left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4"
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                    >
                        <FocusTrap isActive={open} onEscape={() => setOpen(false)}>
                            <div className="bg-[#0a0a0f]/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl shadow-cyan-500/10 overflow-hidden">
                                {/* Header */}
                                <div className="flex items-center gap-3 p-4 border-b border-white/5">
                                    <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-lg">
                                        {mode === 'ai' ? <Sparkles size={20} className="text-cyan-400" /> : <Command size={20} className="text-cyan-400" />}
                                    </div>
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        placeholder={mode === 'ai' ? "Ask Lux anything..." : "Search commands... (? for AI)"}
                                        value={search}
                                        onChange={(e) => {
                                            setSearch(e.target.value);
                                            setSelectedIndex(0);
                                        }}
                                        className="flex-1 bg-transparent focus:outline-none text-lg placeholder-gray-500"
                                        autoFocus
                                        aria-label={mode === 'ai' ? "Ask AI query" : "Search commands"}
                                    />
                                    <div className="flex items-center gap-2">
                                        {mode === 'ai' && (
                                            <span className="px-2 py-1 bg-purple-500/20 rounded text-xs text-purple-400 border border-purple-500/30">
                                                AI Mode
                                            </span>
                                        )}
                                        <kbd className="px-2 py-1 bg-white/5 rounded text-xs text-gray-500 border border-white/10">ESC</kbd>
                                    </div>
                                </div>

                                {/* AI Response */}
                                {mode === 'ai' && (aiLoading || aiResponse) && (
                                    <div className="p-4 border-b border-white/5 bg-purple-500/5">
                                        {aiLoading ? (
                                            <div className="flex items-center gap-2 text-gray-400">
                                                <motion.div
                                                    animate={{ rotate: 360 }}
                                                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                                                >
                                                    <Sparkles size={16} />
                                                </motion.div>
                                                <span>Thinking...</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-start gap-3">
                                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-xs">
                                                    ✨
                                                </div>
                                                <p className="text-gray-300 text-sm">{aiResponse}</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Mode switcher */}
                                <div className="flex gap-1 p-2 border-b border-white/5 bg-white/[0.02]">
                                    <button
                                        onClick={() => setMode('commands')}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${mode === 'commands' ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-500 hover:text-gray-300'
                                            }`}
                                    >
                                        Commands
                                    </button>
                                    <button
                                        onClick={() => { setMode('ai'); inputRef.current?.focus(); }}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${mode === 'ai' ? 'bg-purple-500/20 text-purple-400' : 'text-gray-500 hover:text-gray-300'
                                            }`}
                                    >
                                        <Sparkles size={12} /> Ask AI
                                    </button>
                                </div>

                                {/* Results */}
                                {mode === 'commands' && (
                                    <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                                        {/* Recent Commands */}
                                        {!search && recentCommands.length > 0 && (
                                            <div>
                                                <div className="px-4 py-2 text-xs text-gray-500 uppercase tracking-wide flex items-center gap-1">
                                                    <Clock size={12} /> Recent
                                                </div>
                                                {recentCommands.map(cmdId => {
                                                    const cmd = commands.find(c => c.id === cmdId);
                                                    if (!cmd) return null;
                                                    return (
                                                        <button
                                                            key={`recent-${cmd.id}`}
                                                            className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-white/5 transition-colors text-gray-400"
                                                            onClick={() => {
                                                                cmd.action();
                                                                setOpen(false);
                                                            }}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-lg opacity-60">{cmd.icon}</span>
                                                                <span>{cmd.label}</span>
                                                            </div>
                                                            <ArrowRight size={14} className="opacity-40" />
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {Object.entries(groupedCommands).length === 0 ? (
                                            <div className="p-8 text-center text-gray-500">
                                                No commands found. Try asking AI with "?"
                                            </div>
                                        ) : (
                                            Object.entries(groupedCommands).map(([category, cmds]) => (
                                                <div key={category}>
                                                    <div className="px-4 py-2 text-xs text-gray-500 uppercase tracking-wide bg-white/[0.02]">
                                                        {category}
                                                    </div>
                                                    {cmds.map((cmd) => {
                                                        const index = flatCommands.findIndex(c => c.id === cmd.id);
                                                        const isSelected = index === selectedIndex;

                                                        return (
                                                            <button
                                                                key={cmd.id}
                                                                className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${isSelected ? 'bg-cyan-500/20 text-white' : 'hover:bg-white/5'
                                                                    }`}
                                                                onClick={() => {
                                                                    saveRecentCommand(cmd.id);
                                                                    cmd.action();
                                                                    setOpen(false);
                                                                }}
                                                                onMouseEnter={() => setSelectedIndex(index)}
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <span className="text-xl">{cmd.icon}</span>
                                                                    <span>{cmd.label}</span>
                                                                </div>
                                                                {cmd.shortcut && (
                                                                    <kbd className="px-2 py-1 bg-white/5 rounded text-xs text-gray-500 border border-white/10">
                                                                        {cmd.shortcut}
                                                                    </kbd>
                                                                )}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}

                                {/* AI mode instructions */}
                                {mode === 'ai' && !aiResponse && !aiLoading && (
                                    <div className="p-8 text-center">
                                        <div className="text-4xl mb-3">✨</div>
                                        <p className="text-gray-400 mb-2">Ask Lux anything</p>
                                        <p className="text-xs text-gray-600">
                                            "How do I deploy an agent?" • "What's my revenue?" • "Help me with..."
                                        </p>
                                    </div>
                                )}

                                {/* Footer */}
                                <div className="flex items-center justify-between px-4 py-2 border-t border-white/5 text-xs text-gray-500 bg-white/[0.02]">
                                    <div className="flex gap-4">
                                        <span>↑↓ Navigate</span>
                                        <span>↵ {mode === 'ai' ? 'Ask' : 'Select'}</span>
                                        <span>? AI Mode</span>
                                    </div>
                                    <span className="flex items-center gap-1">
                                        <Command size={12} />K to toggle
                                    </span>
                                </div>
                            </div>
                        </FocusTrap>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
