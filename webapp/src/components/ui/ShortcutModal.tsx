'use client';

import { motion } from 'framer-motion';
import { X, Command } from 'lucide-react';
import FocusTrap from './FocusTrap';

interface Shortcut {
    keys: string[];
    description: string;
    category: string;
}

interface ShortcutModalProps {
    onClose: () => void;
    groupedShortcuts: Record<string, Shortcut[]>;
}

export function ShortcutModal({ onClose, groupedShortcuts }: ShortcutModalProps) {
    return (
        <motion.div
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl px-4"
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2 }}
        >
            <FocusTrap onEscape={onClose}>
                <div className="bg-[#0a0a0f]/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-cyan-500/20 rounded-lg">
                                <Command size={20} className="text-cyan-400" />
                            </div>
                            <div>
                                <h2 className="font-bold text-lg">Keyboard Shortcuts</h2>
                                <p className="text-xs text-gray-500">Press ? anytime to show this</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <X size={20} className="text-gray-400" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
                        <div className="grid md:grid-cols-2 gap-6">
                            {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
                                <div key={category}>
                                    <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-3">
                                        {category}
                                    </h3>
                                    <div className="space-y-2">
                                        {categoryShortcuts.map((shortcut, idx) => (
                                            <div
                                                key={idx}
                                                className="flex items-center justify-between py-2 px-3 bg-white/[0.02] rounded-lg"
                                            >
                                                <span className="text-gray-300 text-sm">
                                                    {shortcut.description}
                                                </span>
                                                <div className="flex gap-1">
                                                    {shortcut.keys.map((key, keyIdx) => (
                                                        <kbd
                                                            key={keyIdx}
                                                            className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-gray-400 font-mono min-w-[28px] text-center"
                                                        >
                                                            {key}
                                                        </kbd>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-3 border-t border-white/5 text-center text-xs text-gray-500">
                        Press <kbd className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded">?</kbd> to toggle
                    </div>
                </div>
            </FocusTrap>
        </motion.div>
    );
}
