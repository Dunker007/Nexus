'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';

interface Capture {
    id: string;
    content: string;
    timestamp: string;
    type: 'text' | 'code' | 'link' | 'idea';
}

const initialCaptures: Capture[] = [
    { id: '1', content: 'Research: How to implement WebSocket reconnection with exponential backoff', timestamp: '2 min ago', type: 'idea' },
    { id: '2', content: 'const debounce = (fn, ms) => {\n  let timeout;\n  return (...args) => {\n    clearTimeout(timeout);\n    timeout = setTimeout(() => fn(...args), ms);\n  };\n};', timestamp: '15 min ago', type: 'code' },
    { id: '3', content: 'https://github.com/ggerganov/llama.cpp/releases', timestamp: '1 hour ago', type: 'link' },
    { id: '4', content: 'Try using grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)) for responsive layouts', timestamp: '3 hours ago', type: 'text' },
    { id: '5', content: 'Build a CLI tool that generates component boilerplates', timestamp: '5 hours ago', type: 'idea' },
];

const typeColors = {
    text: 'bg-gray-500/20 text-gray-400',
    code: 'bg-purple-500/20 text-purple-400',
    link: 'bg-blue-500/20 text-blue-400',
    idea: 'bg-yellow-500/20 text-yellow-400',
};

const typeIcons = {
    text: '📝',
    code: '💻',
    link: '🔗',
    idea: '💡',
};

export default function ScratchpadPage() {
    const [captures, setCaptures] = useState<Capture[]>(initialCaptures);
    const [newCapture, setNewCapture] = useState('');
    const [captureType, setCaptureType] = useState<'text' | 'code' | 'link' | 'idea'>('text');

    function handleCapture() {
        if (!newCapture.trim()) return;

        const capture: Capture = {
            id: Date.now().toString(),
            content: newCapture,
            timestamp: 'Just now',
            type: captureType
        };

        setCaptures([capture, ...captures]);
        setNewCapture('');
    }

    function handleDelete(id: string) {
        setCaptures(captures.filter(c => c.id !== id));
    }

    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            handleCapture();
        }
    }

    return (
        <div className="min-h-screen pt-8">
            {/* Header */}
            <section className="section-padding pb-8">
                <div className="container-main">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h1 className="text-4xl md:text-5xl font-bold mb-2">
                            <span className="text-gradient">Scratchpad</span>
                        </h1>
                        <p className="text-gray-400">Quick capture for fleeting thoughts, code snippets, and links</p>
                    </motion.div>
                </div>
            </section>

            {/* Quick Capture */}
            <section className="container-main pb-8">
                <motion.div
                    className="glass-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="flex gap-2 mb-4">
                        {(['text', 'code', 'link', 'idea'] as const).map((type) => (
                            <button
                                key={type}
                                onClick={() => setCaptureType(type)}
                                className={`px-3 py-1 rounded-lg text-sm ${captureType === type
                                        ? typeColors[type] + ' ring-2 ring-current'
                                        : 'bg-white/5 hover:bg-white/10'
                                    }`}
                            >
                                {typeIcons[type]} {type.charAt(0).toUpperCase() + type.slice(1)}
                            </button>
                        ))}
                    </div>

                    <textarea
                        value={newCapture}
                        onChange={(e) => setNewCapture(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={
                            captureType === 'code' ? 'Paste your code snippet...' :
                                captureType === 'link' ? 'Paste a URL...' :
                                    captureType === 'idea' ? 'What\'s your idea?' :
                                        'What\'s on your mind?'
                        }
                        className={`w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 resize-none ${captureType === 'code' ? 'font-mono text-sm' : ''
                            }`}
                        rows={captureType === 'code' ? 6 : 3}
                    />

                    <div className="flex items-center justify-between mt-4">
                        <span className="text-xs text-gray-500">
                            Press <kbd className="px-1 bg-white/10 rounded">Ctrl</kbd>+<kbd className="px-1 bg-white/10 rounded">Enter</kbd> to capture
                        </span>
                        <button
                            onClick={handleCapture}
                            className="px-6 py-2 bg-cyan-500 text-black rounded-lg font-medium hover:bg-cyan-400"
                        >
                            ⚡ Capture
                        </button>
                    </div>
                </motion.div>
            </section>

            {/* Captures List */}
            <section className="container-main pb-16">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">Recent Captures</h2>
                    <span className="text-sm text-gray-500">{captures.length} items</span>
                </div>

                <motion.div
                    className="space-y-4"
                    initial="initial"
                    animate="animate"
                    variants={{ animate: { transition: { staggerChildren: 0.03 } } }}
                >
                    {captures.map((capture) => (
                        <motion.div
                            key={capture.id}
                            className="glass-card group"
                            variants={{ initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 } }}
                        >
                            <div className="flex items-start gap-4">
                                <span className="text-2xl">{typeIcons[capture.type]}</span>

                                <div className="flex-1 min-w-0">
                                    {capture.type === 'code' ? (
                                        <pre className="bg-black/50 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                                            {capture.content}
                                        </pre>
                                    ) : capture.type === 'link' ? (
                                        <a
                                            href={capture.content}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-400 hover:underline break-all"
                                        >
                                            {capture.content}
                                        </a>
                                    ) : (
                                        <p className="whitespace-pre-wrap">{capture.content}</p>
                                    )}

                                    <div className="flex items-center gap-3 mt-3">
                                        <span className={`text-xs px-2 py-0.5 rounded ${typeColors[capture.type]}`}>
                                            {capture.type}
                                        </span>
                                        <span className="text-xs text-gray-500">{capture.timestamp}</span>
                                    </div>
                                </div>

                                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                    <button className="p-1 hover:bg-white/10 rounded">📋</button>
                                    <button className="p-1 hover:bg-white/10 rounded">📝</button>
                                    <button
                                        onClick={() => handleDelete(capture.id)}
                                        className="p-1 hover:bg-red-500/20 rounded text-red-400"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {captures.length === 0 && (
                    <div className="text-center py-16 text-gray-500">
                        <span className="text-5xl">📝</span>
                        <p className="mt-4">No captures yet. Start typing above!</p>
                    </div>
                )}
            </section>

            {/* Back link */}
            <div className="container-main pb-8">
                <Link href="/" className="text-gray-400 hover:text-cyan-400 transition-colors">
                    ← Back to Dashboard
                </Link>
            </div>
        </div>
    );
}
