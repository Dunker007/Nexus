'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';

interface Note {
    id: string;
    title: string;
    content: string;
    category: string;
    color: string;
    pinned: boolean;
    lastEdited: string;
}

const initialNotes: Note[] = [
    {
        id: '1',
        title: 'Trading Bot Ideas',
        content: '• Grid trading for sideways markets\n• DCA on dips\n• AI sentiment analysis\n• Multi-exchange arbitrage',
        category: 'Ideas',
        color: 'bg-purple-500/20',
        pinned: true,
        lastEdited: '2 hours ago'
    },
    {
        id: '2',
        title: 'LLM Optimization Notes',
        content: 'KV Cache optimization:\n- Use sliding window\n- Quantize to int8\n- Batch similar requests\n\nContext management:\n- Trim old messages\n- Summarize long convos',
        category: 'Technical',
        color: 'bg-cyan-500/20',
        pinned: true,
        lastEdited: '1 day ago'
    },
    {
        id: '3',
        title: 'DLX Studio Roadmap',
        content: '✅ Core chat interface\n✅ Agent system\n✅ Finance tools\n⏳ Workflow automation\n⏳ Voice control\n⏳ Mobile app',
        category: 'Project',
        color: 'bg-green-500/20',
        pinned: false,
        lastEdited: '3 days ago'
    },
    {
        id: '4',
        title: 'Smart Home Automations',
        content: 'Morning routine:\n1. Lights fade in at 6:30am\n2. Coffee maker starts\n3. News briefing plays\n\nNight routine:\n1. All lights off\n2. Cameras armed\n3. Thermostat to 68°',
        category: 'Home',
        color: 'bg-orange-500/20',
        pinned: false,
        lastEdited: '1 week ago'
    },
    {
        id: '5',
        title: 'Prompt Templates',
        content: 'Code Review:\n"Review this code for bugs, performance issues, and best practices. Be specific."\n\nExplain:\n"Explain this like I\'m 5, then like I\'m a senior dev."',
        category: 'AI',
        color: 'bg-pink-500/20',
        pinned: false,
        lastEdited: '2 weeks ago'
    },
    {
        id: '6',
        title: 'Meeting Notes - Dec 1',
        content: 'Discussed:\n- Phase 2 timeline\n- Budget allocation\n- New feature priorities\n\nAction items:\n- Review trading bot performance\n- Test new Gemini model\n- Update documentation',
        category: 'Meeting',
        color: 'bg-yellow-500/20',
        pinned: false,
        lastEdited: '3 days ago'
    },
];

const categories = ['All', 'Ideas', 'Technical', 'Project', 'Home', 'AI', 'Meeting'];

export default function NotesPage() {
    const [notes, setNotes] = useState<Note[]>(initialNotes);
    const [filter, setFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [view, setView] = useState<'grid' | 'list'>('grid');
    const [selectedNote, setSelectedNote] = useState<Note | null>(null);

    const filteredNotes = notes.filter(n => {
        const matchesCategory = filter === 'All' || n.category === filter;
        const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            n.content.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const pinnedNotes = filteredNotes.filter(n => n.pinned);
    const unpinnedNotes = filteredNotes.filter(n => !n.pinned);

    return (
        <div className="min-h-screen pt-8">
            {/* Header */}
            <section className="section-padding pb-8">
                <div className="container-main">
                    <motion.div
                        className="flex items-center justify-between"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold mb-2">
                                <span className="text-gradient">Notes</span>
                            </h1>
                            <p className="text-gray-400">{notes.length} notes • Quick capture for ideas</p>
                        </div>
                        <button className="btn-primary">+ New Note</button>
                    </motion.div>
                </div>
            </section>

            {/* Filters */}
            <section className="container-main pb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <input
                        type="text"
                        placeholder="Search notes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2"
                    />
                    <div className="flex gap-2">
                        <button
                            onClick={() => setView('grid')}
                            className={`px-3 py-2 rounded-lg ${view === 'grid' ? 'bg-cyan-500 text-black' : 'bg-white/10'}`}
                        >
                            ▦ Grid
                        </button>
                        <button
                            onClick={() => setView('list')}
                            className={`px-3 py-2 rounded-lg ${view === 'list' ? 'bg-cyan-500 text-black' : 'bg-white/10'}`}
                        >
                            ☰ List
                        </button>
                    </div>
                </div>
                <div className="flex gap-2 mt-4 flex-wrap">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setFilter(cat)}
                            className={`px-3 py-1 rounded-full text-sm ${filter === cat
                                    ? 'bg-cyan-500 text-black'
                                    : 'bg-white/10 hover:bg-white/20'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </section>

            {/* Notes Grid/List */}
            <section className="container-main pb-16">
                {/* Pinned */}
                {pinnedNotes.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-sm font-bold text-gray-500 mb-3">📌 PINNED</h2>
                        <motion.div
                            className={view === 'grid'
                                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                                : 'space-y-3'
                            }
                            initial="initial"
                            animate="animate"
                            variants={{ animate: { transition: { staggerChildren: 0.03 } } }}
                        >
                            {pinnedNotes.map((note) => (
                                <motion.div
                                    key={note.id}
                                    className={`glass-card cursor-pointer hover:ring-2 hover:ring-cyan-500/50 transition-all ${note.color}`}
                                    variants={{ initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 } }}
                                    onClick={() => setSelectedNote(note)}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-bold">{note.title}</h3>
                                        <span className="text-yellow-400">📌</span>
                                    </div>
                                    <p className="text-gray-400 text-sm whitespace-pre-line line-clamp-4">{note.content}</p>
                                    <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                                        <span className="px-2 py-0.5 bg-white/10 rounded">{note.category}</span>
                                        <span>{note.lastEdited}</span>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                )}

                {/* Other Notes */}
                <div>
                    <h2 className="text-sm font-bold text-gray-500 mb-3">📝 NOTES</h2>
                    <motion.div
                        className={view === 'grid'
                            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                            : 'space-y-3'
                        }
                        initial="initial"
                        animate="animate"
                        variants={{ animate: { transition: { staggerChildren: 0.03 } } }}
                    >
                        {unpinnedNotes.map((note) => (
                            <motion.div
                                key={note.id}
                                className={`glass-card cursor-pointer hover:ring-2 hover:ring-cyan-500/50 transition-all ${note.color}`}
                                variants={{ initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 } }}
                                onClick={() => setSelectedNote(note)}
                            >
                                <h3 className="font-bold mb-2">{note.title}</h3>
                                <p className="text-gray-400 text-sm whitespace-pre-line line-clamp-4">{note.content}</p>
                                <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                                    <span className="px-2 py-0.5 bg-white/10 rounded">{note.category}</span>
                                    <span>{note.lastEdited}</span>
                                </div>
                            </motion.div>
                        ))}

                        {/* Add Note Card */}
                        <div className="glass-card border-2 border-dashed border-gray-700 flex items-center justify-center min-h-[150px] cursor-pointer hover:border-cyan-500 transition-colors">
                            <div className="text-center text-gray-500">
                                <div className="text-3xl mb-2">+</div>
                                <div>Add Note</div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Note Modal */}
            {selectedNote && (
                <div
                    className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
                    onClick={() => setSelectedNote(null)}
                >
                    <motion.div
                        className={`glass-card max-w-2xl w-full max-h-[80vh] overflow-auto ${selectedNote.color}`}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-bold">{selectedNote.title}</h2>
                            <button
                                onClick={() => setSelectedNote(null)}
                                className="text-gray-400 hover:text-white text-xl"
                            >
                                ×
                            </button>
                        </div>
                        <pre className="text-gray-300 whitespace-pre-wrap font-sans">{selectedNote.content}</pre>
                        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-700">
                            <span className="text-sm text-gray-500">Edited {selectedNote.lastEdited}</span>
                            <div className="flex gap-2">
                                <button className="px-3 py-1 bg-white/10 rounded text-sm">Edit</button>
                                <button className="px-3 py-1 bg-red-500/20 text-red-400 rounded text-sm">Delete</button>
                            </div>
                        </div>
                    </motion.div>
                </div>
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
