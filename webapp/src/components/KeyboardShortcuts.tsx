'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Backdrop } from '@/components/ui/Backdrop';
import { ShortcutModal } from '@/components/ui/ShortcutModal';

interface Shortcut {
    keys: string[];
    description: string;
    category: string;
}

const shortcuts: Shortcut[] = [
    // Navigation
    { keys: ['Ctrl', 'K'], description: 'Open Command Palette', category: 'Navigation' },
    { keys: ['G', 'H'], description: 'Go to Home', category: 'Navigation' },
    { keys: ['G', 'D'], description: 'Go to Dashboard', category: 'Navigation' },
    { keys: ['G', 'S'], description: 'Go to Settings', category: 'Navigation' },
    { keys: ['G', 'C'], description: 'Go to Chat', category: 'Navigation' },
    { keys: ['G', 'A'], description: 'Go to Agents', category: 'Navigation' },
    { keys: ['G', 'I'], description: 'Go to Income', category: 'Navigation' },
    { keys: ['G', 'N'], description: 'Go to News', category: 'Navigation' },
    { keys: ['G', 'L'], description: 'Go to Labs', category: 'Navigation' },

    // General
    { keys: ['?'], description: 'Show Keyboard Shortcuts', category: 'General' },
    { keys: ['Esc'], description: 'Close Modal / Cancel', category: 'General' },
    { keys: ['↑', '↓'], description: 'Navigate Lists', category: 'General' },
    { keys: ['Enter'], description: 'Confirm / Select', category: 'General' },

    // AI
    { keys: ['Ctrl', 'K', '?'], description: 'Ask AI in Palette', category: 'AI' },
];

// G + key navigation map
const gNavigation: Record<string, string> = {
    'h': '/',
    'd': '/dashboard',
    's': '/settings',
    'c': '/chat',
    'a': '/agents',
    'i': '/income',
    'n': '/news',
    'l': '/labs',
};

export default function KeyboardShortcuts() {
    const [open, setOpen] = useState(false);
    const [gPressed, setGPressed] = useState(false);
    const [showGHint, setShowGHint] = useState(false);
    const router = useRouter();

    useEffect(() => {
        let gTimeout: NodeJS.Timeout;

        const handleKeyDown = (e: KeyboardEvent) => {
            // Skip if in input
            if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
                return;
            }

            // Open on ? key
            if (e.key === '?') {
                e.preventDefault();
                setOpen(prev => !prev);
                return;
            }

            // Close on Escape
            if (e.key === 'Escape') {
                setOpen(false);
                setGPressed(false);
                setShowGHint(false);
                return;
            }

            // Handle G + key navigation
            if (e.key.toLowerCase() === 'g' && !gPressed) {
                setGPressed(true);
                setShowGHint(true);
                gTimeout = setTimeout(() => {
                    setGPressed(false);
                    setShowGHint(false);
                }, 1500); // 1.5 second window to press second key
                return;
            }

            if (gPressed) {
                const targetPath = gNavigation[e.key.toLowerCase()];
                if (targetPath) {
                    e.preventDefault();
                    router.push(targetPath);
                }
                setGPressed(false);
                setShowGHint(false);
                clearTimeout(gTimeout);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            clearTimeout(gTimeout);
        };
    }, [gPressed, router]);

    const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
        if (!acc[shortcut.category]) acc[shortcut.category] = [];
        acc[shortcut.category].push(shortcut);
        return acc;
    }, {} as Record<string, Shortcut[]>);

    return (
        <AnimatePresence>
            {open && (
                <>
                    <Backdrop onClick={() => setOpen(false)} />
                    <ShortcutModal onClose={() => setOpen(false)} groupedShortcuts={groupedShortcuts} />
                </>
            )}

            {/* G key hint */}
            {showGHint && (
                <motion.div
                    className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                >
                    <div className="bg-[#0a0a0f]/95 backdrop-blur-xl rounded-xl border border-cyan-500/30 shadow-lg shadow-cyan-500/10 px-4 py-3">
                        <div className="flex items-center gap-3 text-sm">
                            <kbd className="px-2 py-1 bg-cyan-500/20 border border-cyan-500/30 rounded text-cyan-400 font-mono">G</kbd>
                            <span className="text-gray-400">then</span>
                            <div className="flex gap-1">
                                {Object.keys(gNavigation).slice(0, 5).map(key => (
                                    <kbd key={key} className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-gray-400 font-mono uppercase">
                                        {key}
                                    </kbd>
                                ))}
                                <span className="text-gray-500">...</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

