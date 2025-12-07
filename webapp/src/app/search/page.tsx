'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';

// Simulated search results
const mockResults = {
    pages: [
        { title: 'AI Chat', href: '/chat', desc: 'Conversation with local LLMs', icon: '💬' },
        { title: 'Agents', href: '/agents', desc: '6 specialized AI agents', icon: '🤖' },
        { title: 'Analytics', href: '/analytics', desc: 'Usage stats and charts', icon: '📊' },
    ],
    chats: [
        { title: 'Debug React component', time: '2 hours ago', model: 'gemma' },
        { title: 'Code review for trading bot', time: '5 hours ago', model: 'llama3.1' },
        { title: 'Explain WebSocket streaming', time: '1 day ago', model: 'qwen' },
    ],
    notes: [
        { title: 'Trading Bot Ideas', excerpt: 'Grid trading for sideways markets...', category: 'Ideas' },
        { title: 'LLM Optimization Notes', excerpt: 'KV Cache optimization...', category: 'Technical' },
    ],
    files: [
        { name: 'gemma-3n-E4B-it-QAT.gguf', path: '/models/', size: '4.2 GB' },
        { name: 'config.json', path: '/root/', size: '2 KB' },
    ],
    docs: [
        { title: 'REST APIs Explained', category: 'Learn', duration: '20 min' },
        { title: 'LLMs for Developers', category: 'Learn', duration: '20 min' },
    ],
};

const searchCategories = ['All', 'Pages', 'Chats', 'Notes', 'Files', 'Docs'];

export default function SearchPage() {
    const [query, setQuery] = useState('');
    const [category, setCategory] = useState('All');
    const [hasSearched, setHasSearched] = useState(false);

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        if (query.trim()) {
            setHasSearched(true);
        }
    }

    const showResults = hasSearched && query.trim();

    return (
        <div className="min-h-screen pt-8">
            {/* Header */}
            <section className="section-padding pb-8">
                <div className="container-main">
                    <motion.div
                        className="text-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            <span className="text-gradient">Search</span>
                        </h1>

                        {/* Search Bar */}
                        <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Search pages, chats, notes, files, docs..."
                                    className="w-full bg-white/10 border border-white/20 rounded-xl px-6 py-4 text-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                    autoFocus
                                />
                                <button
                                    type="submit"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-cyan-500 text-black rounded-lg font-medium hover:bg-cyan-400"
                                >
                                    Search
                                </button>
                            </div>
                        </form>

                        <p className="text-gray-500 mt-4 text-sm">
                            Pro tip: Use <kbd className="px-2 py-0.5 bg-white/10 rounded">Ctrl+K</kbd> to quickly jump to any page
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Category Filters */}
            {showResults && (
                <section className="container-main pb-6">
                    <div className="flex gap-2 justify-center flex-wrap">
                        {searchCategories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setCategory(cat)}
                                className={`px-4 py-2 rounded-lg text-sm ${category === cat
                                        ? 'bg-cyan-500 text-black'
                                        : 'bg-white/10 hover:bg-white/20'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </section>
            )}

            {/* Results */}
            {showResults && (
                <section className="container-main pb-16">
                    <motion.div
                        className="space-y-8"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        {/* Pages */}
                        {(category === 'All' || category === 'Pages') && (
                            <div>
                                <h2 className="text-xl font-bold mb-4">📄 Pages</h2>
                                <div className="grid md:grid-cols-3 gap-4">
                                    {mockResults.pages.map((page) => (
                                        <Link key={page.href} href={page.href}>
                                            <div className="glass-card hover:ring-2 hover:ring-cyan-500/50 cursor-pointer">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="text-2xl">{page.icon}</span>
                                                    <span className="font-bold">{page.title}</span>
                                                </div>
                                                <p className="text-sm text-gray-400">{page.desc}</p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Chats */}
                        {(category === 'All' || category === 'Chats') && (
                            <div>
                                <h2 className="text-xl font-bold mb-4">💬 Chat History</h2>
                                <div className="space-y-3">
                                    {mockResults.chats.map((chat, i) => (
                                        <div key={i} className="glass-card flex items-center justify-between">
                                            <div>
                                                <h3 className="font-medium">{chat.title}</h3>
                                                <p className="text-sm text-gray-500">{chat.model} • {chat.time}</p>
                                            </div>
                                            <button className="text-cyan-400 hover:underline text-sm">
                                                Open →
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Notes */}
                        {(category === 'All' || category === 'Notes') && (
                            <div>
                                <h2 className="text-xl font-bold mb-4">📝 Notes</h2>
                                <div className="grid md:grid-cols-2 gap-4">
                                    {mockResults.notes.map((note, i) => (
                                        <div key={i} className="glass-card">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-bold">{note.title}</span>
                                                <span className="text-xs px-2 py-0.5 bg-white/10 rounded">{note.category}</span>
                                            </div>
                                            <p className="text-sm text-gray-400">{note.excerpt}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Files */}
                        {(category === 'All' || category === 'Files') && (
                            <div>
                                <h2 className="text-xl font-bold mb-4">📁 Files</h2>
                                <div className="space-y-2">
                                    {mockResults.files.map((file, i) => (
                                        <div key={i} className="glass-card flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span>📄</span>
                                                <div>
                                                    <span className="font-mono text-sm">{file.name}</span>
                                                    <span className="text-xs text-gray-500 ml-2">{file.path}</span>
                                                </div>
                                            </div>
                                            <span className="text-sm text-gray-500">{file.size}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Docs */}
                        {(category === 'All' || category === 'Docs') && (
                            <div>
                                <h2 className="text-xl font-bold mb-4">📚 Documentation</h2>
                                <div className="grid md:grid-cols-2 gap-4">
                                    {mockResults.docs.map((doc, i) => (
                                        <div key={i} className="glass-card hover:ring-2 hover:ring-cyan-500/50 cursor-pointer">
                                            <h3 className="font-bold">{doc.title}</h3>
                                            <p className="text-sm text-gray-500">{doc.category} • {doc.duration}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                </section>
            )}

            {/* No Search Yet */}
            {!showResults && (
                <section className="container-main pb-16">
                    <motion.div
                        className="text-center py-16"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <span className="text-6xl">🔍</span>
                        <h2 className="text-xl font-bold mt-4">Start Searching</h2>
                        <p className="text-gray-400">Find anything across your DLX Studio workspace</p>

                        {/* Recent Searches */}
                        <div className="mt-8 max-w-md mx-auto">
                            <h3 className="text-sm font-medium text-gray-500 mb-3">Recent Searches</h3>
                            <div className="space-y-2">
                                {['trading bot', 'gemma model', 'websocket'].map((term) => (
                                    <button
                                        key={term}
                                        onClick={() => { setQuery(term); setHasSearched(true); }}
                                        className="w-full p-3 bg-white/5 rounded-lg text-left hover:bg-white/10"
                                    >
                                        <span className="text-gray-500">🕐</span> {term}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </section>
            )}

            {/* Back link */}
            <div className="container-main pb-8">
                <Link href="/" className="text-gray-400 hover:text-cyan-400 transition-colors">
                    ← Back to Dashboard
                </Link>
            </div>
        </div>
    );
}
