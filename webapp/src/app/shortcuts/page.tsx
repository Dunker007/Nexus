'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

const shortcuts = [
    {
        category: 'Navigation',
        items: [
            { keys: ['Ctrl', 'K'], desc: 'Open command palette' },
            { keys: ['Ctrl', '/'], desc: 'Open keyboard shortcuts' },
            { keys: ['G', 'H'], desc: 'Go to Home' },
            { keys: ['G', 'D'], desc: 'Go to Dashboard' },
            { keys: ['G', 'C'], desc: 'Go to Chat' },
            { keys: ['G', 'A'], desc: 'Go to Agents' },
            { keys: ['G', 'L'], desc: 'Go to Labs' },
            { keys: ['Esc'], desc: 'Close modal / Cancel' },
        ]
    },
    {
        category: 'Chat',
        items: [
            { keys: ['Ctrl', 'N'], desc: 'New chat' },
            { keys: ['Ctrl', 'Enter'], desc: 'Send message' },
            { keys: ['Ctrl', 'L'], desc: 'Clear chat' },
            { keys: ['↑'], desc: 'Edit last message' },
            { keys: ['Ctrl', 'C'], desc: 'Copy last response' },
            { keys: ['Ctrl', 'Shift', 'C'], desc: 'Copy as markdown' },
        ]
    },
    {
        category: 'Editor',
        items: [
            { keys: ['Ctrl', 'S'], desc: 'Save' },
            { keys: ['Ctrl', 'Z'], desc: 'Undo' },
            { keys: ['Ctrl', 'Shift', 'Z'], desc: 'Redo' },
            { keys: ['Ctrl', 'F'], desc: 'Find' },
            { keys: ['Ctrl', 'H'], desc: 'Find and replace' },
            { keys: ['Ctrl', 'D'], desc: 'Duplicate line' },
            { keys: ['Alt', '↑/↓'], desc: 'Move line up/down' },
        ]
    },
    {
        category: 'AI Actions',
        items: [
            { keys: ['Ctrl', 'Shift', 'A'], desc: 'AI assist selection' },
            { keys: ['Ctrl', 'Shift', 'E'], desc: 'Explain selection' },
            { keys: ['Ctrl', 'Shift', 'R'], desc: 'Refactor selection' },
            { keys: ['Ctrl', 'Shift', 'T'], desc: 'Generate tests' },
            { keys: ['Ctrl', 'Shift', 'D'], desc: 'Generate docs' },
        ]
    },
    {
        category: 'Window',
        items: [
            { keys: ['Ctrl', 'B'], desc: 'Toggle sidebar' },
            { keys: ['Ctrl', '\\'], desc: 'Split view' },
            { keys: ['F11'], desc: 'Fullscreen' },
            { keys: ['Ctrl', '+/-'], desc: 'Zoom in/out' },
            { keys: ['Ctrl', '0'], desc: 'Reset zoom' },
        ]
    },
];

export default function ShortcutsPage() {
    return (
        <div className="min-h-screen pt-8">
            {/* Header */}
            <section className="section-padding pb-12">
                <div className="container-main">
                    <motion.div
                        className="text-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h1 className="text-5xl md:text-6xl font-bold mb-4">
                            Keyboard <span className="text-gradient">Shortcuts</span>
                        </h1>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                            Less mouse, more flow. Master these shortcuts to fly through DLX Studio.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Pro tip */}
            <section className="container-main pb-12">
                <motion.div
                    className="glass-card flex items-center gap-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <span className="text-3xl">💡</span>
                    <div>
                        <h3 className="font-bold">Pro Tip: Command Palette</h3>
                        <p className="text-gray-400">
                            Press <kbd className="px-2 py-1 bg-white/10 rounded mx-1">Ctrl</kbd> + <kbd className="px-2 py-1 bg-white/10 rounded mx-1">K</kbd> to open the command palette.
                            From there, you can quickly navigate, run commands, and access everything.
                        </p>
                    </div>
                </motion.div>
            </section>

            {/* Shortcuts Grid */}
            <section className="container-main pb-16">
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    initial="initial"
                    animate="animate"
                    variants={{ animate: { transition: { staggerChildren: 0.05 } } }}
                >
                    {shortcuts.map((category) => (
                        <motion.div
                            key={category.category}
                            className="glass-card"
                            variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }}
                        >
                            <h2 className="text-xl font-bold mb-4 text-cyan-400">{category.category}</h2>
                            <ul className="space-y-3">
                                {category.items.map((shortcut) => (
                                    <li key={shortcut.desc} className="flex items-center justify-between">
                                        <span className="text-gray-300">{shortcut.desc}</span>
                                        <div className="flex gap-1">
                                            {shortcut.keys.map((key, i) => (
                                                <span key={i}>
                                                    <kbd className="px-2 py-1 bg-white/10 border border-white/20 rounded text-sm font-mono">
                                                        {key}
                                                    </kbd>
                                                    {i < shortcut.keys.length - 1 && <span className="text-gray-500 mx-0.5">+</span>}
                                                </span>
                                            ))}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    ))}
                </motion.div>
            </section>

            {/* Custom shortcuts */}
            {/* Custom shortcuts */}
            <section className="section-padding bg-[#050508]">
                <div className="container-main">
                    <motion.div
                        className="glass-card text-center py-12"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl font-bold mb-4">Customize Your Shortcuts</h2>
                        <p className="text-gray-400 mb-6">
                            In DLX Studio, you can customize all keyboard shortcuts in Settings → Keyboard.
                        </p>
                        <a href="/DLX Studio Setup 1.0.0.exe" download className="btn-primary inline-block px-8 py-3">
                            Download DLX Studio
                        </a>
                    </motion.div>
                </div>
            </section>

            {/* Back link */}
            <div className="container-main py-8">
                <Link href="/" className="text-gray-400 hover:text-cyan-400 transition-colors">
                    ← Back to Dashboard
                </Link>
            </div>
        </div>
    );
}
