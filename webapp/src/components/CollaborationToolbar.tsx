'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Edit3, Check, X, MessageSquarePlus } from 'lucide-react';

export default function CollaborationToolbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [suggestion, setSuggestion] = useState<string | null>(null);

    const handleSuggest = () => {
        // Mock AI suggestion
        const mockSuggestion = "Try refactoring this component to use a custom hook for state management.";
        setSuggestion(mockSuggestion);
        localStorage.setItem('dlx-last-suggestion', mockSuggestion);
    };

    const handleDecision = (accepted: boolean) => {
        setSuggestion(null);
        localStorage.setItem('dlx-collaboration-history', JSON.stringify({
            timestamp: Date.now(),
            suggestion,
            accepted
        }));
    };

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
            <AnimatePresence>
                {isOpen ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className="glass-card p-2 flex items-center gap-2 mb-4 bg-[#0a0a0f]/90"
                    >
                        <div className="flex items-center gap-2 px-3 py-2 border-r border-white/10">
                            <Sparkles size={16} className="text-cyan-400" />
                            <span className="text-sm font-bold text-white">Co-Pilot</span>
                        </div>

                        {suggestion ? (
                            <div className="flex items-center gap-4 px-2">
                                <span className="text-xs text-gray-300 max-w-xs truncate">{suggestion}</span>
                                <div className="flex gap-1">
                                    <button onClick={() => handleDecision(true)} className="p-1 hover:bg-green-500/20 text-green-400 rounded"><Check size={14} /></button>
                                    <button onClick={() => handleDecision(false)} className="p-1 hover:bg-red-500/20 text-red-400 rounded"><X size={14} /></button>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={handleSuggest}
                                className="px-3 py-1.5 hover:bg-white/10 rounded text-xs text-gray-400 flex items-center gap-2 transition-colors"
                            >
                                <MessageSquarePlus size={14} />
                                <span>Get Suggestions</span>
                            </button>
                        )}

                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-2 hover:bg-white/10 rounded-full text-gray-500"
                        >
                            <X size={14} />
                        </button>
                    </motion.div>
                ) : (
                    <motion.button
                        onClick={() => setIsOpen(true)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="glass-panel p-3 rounded-full flex items-center gap-2 shadow-lg shadow-cyan-500/10 border-cyan-500/20"
                    >
                        <Edit3 size={18} className="text-cyan-400" />
                        <span className="text-xs font-bold text-gray-300 pr-2">Collab</span>
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
}
