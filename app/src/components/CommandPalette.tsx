import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Command, Sparkles } from 'lucide-react';
import { bridgeFetch } from '../lib/utils';
import FocusTrap from './FocusTrap';

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
  const navigate = useNavigate();

  // Load recent commands from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('nexus-recent-commands');
    if (saved) {
      setRecentCommands(JSON.parse(saved).slice(0, 5));
    }
  }, []);

  // Detect if user is asking AI
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
    localStorage.setItem('nexus-recent-commands', JSON.stringify(updated));
  };

  const commands: CommandItem[] = [
    { id: 'dashboard', icon: '📊', label: 'Go to Dashboard', shortcut: 'G D', category: 'Navigation', action: () => navigate('/dashboard') },
    { id: 'chat', icon: '💬', label: 'Neural Hub (Chat)', shortcut: 'G C', category: 'AI', action: () => navigate('/chat') },
    { id: 'agents', icon: '🤖', label: 'Agent Headquarters', shortcut: 'G A', category: 'AI', action: () => navigate('/agents') },
    { id: 'news', icon: '📰', label: 'Go to News', shortcut: 'G N', category: 'Navigation', action: () => navigate('/news') },
    { id: 'labs', icon: '🔬', label: 'AI Labs', shortcut: 'G L', category: 'AI', action: () => navigate('/labs') },
    { id: 'pipeline', icon: '🚀', label: 'Go to Pipeline', shortcut: 'G P', category: 'Navigation', action: () => navigate('/pipeline') },
    { id: 'settings', icon: '⚙️', label: 'Settings', shortcut: 'G S', category: 'Navigation', action: () => navigate('/settings') },
    { id: 'studios', icon: '🎨', label: 'Studios', category: 'Creative', action: () => navigate('/studios') },
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

  async function handleAiQuery() {
    if (!search.trim()) return;
    setAiLoading(true);
    setAiResponse(null);

    try {
      const query = search.startsWith('?') ? search.slice(1).trim() : search;
      const response = await bridgeFetch('/llm/chat', {
        method: 'POST',
        body: JSON.stringify({
          messages: [
            { role: 'system', content: 'You are Lux, the AI assistant for Nexus. Be very concise.' },
            { role: 'user', content: query }
          ]
        })
      });

      const data = await response.json();
      setAiResponse(data.content || 'I could not process that request.');
    } catch {
      setAiResponse('AI is offline. Ensure Bridge is running.');
    } finally {
      setAiLoading(false);
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(prev => !prev);
        setSearch('');
        setSelectedIndex(0);
        setAiResponse(null);
        setMode('commands');
      }

      if (e.key === 'Escape') {
        setOpen(false);
      }

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
          <motion.div
            className="fixed inset-0 z-[110] bg-black/70 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          <motion.div
            className="fixed top-[15%] left-1/2 -translate-x-1/2 z-[120] w-full max-w-2xl px-4"
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.15 }}
          >
            <FocusTrap isActive={open} onEscape={() => setOpen(false)}>
              <div role="dialog" aria-modal="true" aria-label="Command palette" className="bg-[#0a0a0f]/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden glass-panel">
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
                    className="flex-1 bg-transparent focus:outline-none text-lg text-white placeholder-gray-500"
                    autoFocus
                    aria-label="Search commands or ask AI"
                    role="combobox"
                    aria-expanded={mode === 'commands' && filteredCommands.length > 0}
                    aria-autocomplete="list"
                    aria-controls="command-list"
                  />
                  <div className="flex items-center gap-2">
                    {mode === 'ai' && <span className="px-2 py-1 bg-purple-500/20 rounded text-xs text-purple-400 border border-purple-500/30">AI Mode</span>}
                    <kbd className="px-2 py-1 bg-white/5 rounded text-xs text-gray-500 border border-white/10">ESC</kbd>
                  </div>
                </div>

                {mode === 'ai' && (aiLoading || aiResponse) && (
                  <div className="p-4 border-b border-white/5 bg-purple-500/5">
                    {aiLoading ? (
                      <div className="flex items-center gap-2 text-gray-400">
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}><Sparkles size={16} /></motion.div>
                        <span>Thinking...</span>
                      </div>
                    ) : (
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-xs">✨</div>
                        <p className="text-gray-300 text-sm">{aiResponse}</p>
                      </div>
                    )}
                  </div>
                )}

                  <div className="flex gap-1 p-2 border-b border-white/5 bg-white/[0.02]" role="tablist" aria-label="Command palette modes">
                  <button onClick={() => setMode('commands')} role="tab" aria-selected={mode === 'commands'} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${mode === 'commands' ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-500 hover:text-gray-300'}`}>Commands</button>
                  <button onClick={() => { setMode('ai'); inputRef.current?.focus(); }} role="tab" aria-selected={mode === 'ai'} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${mode === 'ai' ? 'bg-purple-500/20 text-purple-400' : 'text-gray-500 hover:text-gray-300'}`}><Sparkles size={12} aria-hidden="true" /> Ask AI</button>
                </div>

                {mode === 'commands' && (
                  <div id="command-list" role="listbox" aria-label="Available commands" className="max-h-[350px] overflow-y-auto custom-scrollbar">
                    {Object.entries(groupedCommands).map(([category, cmds]) => (
                      <div key={category}>
                        <div className="px-4 py-2 text-xs text-gray-500 uppercase tracking-wide bg-white/[0.02]">{category}</div>
                        {cmds.map((cmd) => {
                          const index = flatCommands.findIndex(c => c.id === cmd.id);
                          const isSelected = index === selectedIndex;
                          return (
                            <button
                              key={cmd.id}
                              role="option"
                              aria-selected={isSelected}
                              className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${isSelected ? 'bg-cyan-500/20 text-white' : 'hover:bg-white/5 text-gray-400'}`}
                              onClick={() => { saveRecentCommand(cmd.id); cmd.action(); setOpen(false); }}
                              onMouseEnter={() => setSelectedIndex(index)}
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-xl">{cmd.icon}</span>
                                <span>{cmd.label}</span>
                              </div>
                              {cmd.shortcut && <kbd className="px-2 py-1 bg-white/5 rounded text-xs text-gray-500 border border-white/10">{cmd.shortcut}</kbd>}
                            </button>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between px-4 py-2 border-t border-white/5 text-xs text-gray-500 bg-black/20">
                  <div className="flex gap-4"><span>↑↓ Navigate</span><span>↵ Select</span><span>? AI Mode</span></div>
                  <span className="flex items-center gap-1"><Command size={12} />K to toggle</span>
                </div>
              </div>
            </FocusTrap>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
