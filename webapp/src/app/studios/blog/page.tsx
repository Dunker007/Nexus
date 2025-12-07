'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, PenTool, Search, Send, FileText, Check, RefreshCw, Globe, ArrowRight, Save, Layout, Settings } from 'lucide-react';
import Link from 'next/link';

// Mock Data
const MOCK_IDEAS = [
    "The Future of AI in 2026: What to Expect",
    "How to Build a Passive Income Empire with LuxRig",
    "10 Tools Every AI Developer Needs Today",
    "Why Local LLMs are the Privacy Revolution"
];

const MOCK_DRAFTS = [
    { id: 1, title: 'Getting Started with Agentic AI', status: 'draft', date: '2h ago' },
    { id: 2, title: 'Neural Frames vs. Sora', status: 'review', date: '1d ago' },
];

export default function BlogStudioPage() {
    // Mode: 'dashboard', 'write', 'settings'
    const [mode, setMode] = useState('dashboard');

    // Writing State
    const [topic, setTopic] = useState('');
    const [generatedIdeas, setGeneratedIdeas] = useState<string[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [currentPost, setCurrentPost] = useState({ title: '', content: '' });
    const [seoScore, setSeoScore] = useState(85);

    // AI Agents State
    const [activeAgent, setActiveAgent] = useState<string | null>(null);

    const handleGenerateIdeas = () => {
        setIsGenerating(true);
        setActiveAgent('Lux (Creative)');

        // Sim
        setTimeout(() => {
            setGeneratedIdeas(MOCK_IDEAS);
            setIsGenerating(false);
            setActiveAgent(null);
        }, 2000);
    };

    const handleStartWriting = (title: string) => {
        setCurrentPost({ title, content: `# ${title}\n\n## Introduction\n\nWrite something amazing here...` });
        setMode('write');
    };

    const handlePublish = () => {
        alert("Connecting to WordPress... (Backend Integration Required)");
    };

    return (
        <div className="min-h-screen pt-20 pb-12 bg-[#050508] text-white">
            {/* Background Gradients */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-emerald-900/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-teal-900/10 rounded-full blur-[120px]"></div>
            </div>

            <div className="container-main relative z-10">
                {/* Header */}
                <div className="flex items-center gap-2 mb-8 text-sm text-emerald-400">
                    <Link href="/studios" className="hover:underline">Studios</Link>
                    <span>/</span>
                    <span>Blog</span>
                </div>

                {mode === 'dashboard' && (
                    <div className="space-y-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gradient-to-r from-emerald-900/40 to-teal-900/40 border border-emerald-500/20 rounded-2xl p-8"
                        >
                            <h1 className="text-4xl font-bold mb-4 flex items-center gap-3">
                                <BookOpen className="text-emerald-400" />
                                Content Command Center
                            </h1>
                            <p className="text-gray-400 text-lg max-w-2xl mb-8">
                                Manage your WordPress empire. Generate ideas, write SEO-optimized articles, and publish instantly with AI assistance.
                            </p>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setMode('create')}
                                    className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 rounded-xl font-bold text-black transition-colors flex items-center gap-2"
                                >
                                    <PenTool size={20} />
                                    New Article
                                </button>
                                <button className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-medium transition-colors flex items-center gap-2">
                                    <Globe size={20} />
                                    View Site
                                </button>
                            </div>
                        </motion.div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Quick Stats */}
                            <div className="glass-card p-6 space-y-6">
                                <h3 className="font-bold text-gray-400 uppercase tracking-widest text-sm">Performance</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-white/5 rounded-xl">
                                        <div className="text-3xl font-bold text-white mb-1">12</div>
                                        <div className="text-xs text-gray-500">Published Posts</div>
                                    </div>
                                    <div className="p-4 bg-white/5 rounded-xl">
                                        <div className="text-3xl font-bold text-emerald-400 mb-1">4.2k</div>
                                        <div className="text-xs text-gray-500">Monthly Views</div>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Drafts */}
                            <div className="glass-card p-6 col-span-2">
                                <h3 className="font-bold text-gray-400 uppercase tracking-widest text-sm mb-4">Recent Drafts</h3>
                                <div className="space-y-3">
                                    {MOCK_DRAFTS.map(draft => (
                                        <div key={draft.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer group">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                                                    <FileText size={20} />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-white group-hover:text-emerald-400 transition-colors">{draft.title}</div>
                                                    <div className="text-xs text-gray-500">{draft.date} • {draft.status}</div>
                                                </div>
                                            </div>
                                            <ArrowRight size={18} className="text-gray-500 group-hover:text-white" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* CREATION WIZARD */}
                {(mode === 'create' || mode === 'write') && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="grid grid-cols-1 lg:grid-cols-12 gap-8"
                    >
                        {/* Sidebar */}
                        <div className="lg:col-span-3 space-y-6">
                            <div className="glass-card p-4">
                                <button
                                    onClick={() => setMode('dashboard')}
                                    className="text-sm text-gray-400 hover:text-white flex items-center gap-2 mb-6"
                                >
                                    ← Back to Dashboard
                                </button>

                                <div className="space-y-1">
                                    <div className={`p-3 rounded-lg flex items-center gap-3 ${mode === 'create' ? 'bg-emerald-500/20 text-emerald-400' : 'text-gray-500'}`}>
                                        <div className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs">1</div>
                                        <span className="font-medium">Ideation</span>
                                    </div>
                                    <div className={`p-3 rounded-lg flex items-center gap-3 ${mode === 'write' ? 'bg-emerald-500/20 text-emerald-400' : 'text-gray-500'}`}>
                                        <div className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs">2</div>
                                        <span className="font-medium">Editor</span>
                                    </div>
                                    <div className="p-3 rounded-lg flex items-center gap-3 text-gray-500">
                                        <div className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs">3</div>
                                        <span className="font-medium">Publish</span>
                                    </div>
                                </div>
                            </div>

                            {mode === 'write' && (
                                <div className="glass-card p-4">
                                    <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
                                        <Search size={16} className="text-emerald-400" /> SEO Analysis
                                    </h3>
                                    <div className="mb-4">
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>Score</span>
                                            <span className="text-emerald-400 font-bold">{seoScore}/100</span>
                                        </div>
                                        <div className="w-full bg-white/10 rounded-full h-2">
                                            <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${seoScore}%` }}></div>
                                        </div>
                                    </div>
                                    <ul className="space-y-2 text-xs text-gray-400">
                                        <li className="flex items-center gap-2 text-green-400"><Check size={12} /> Keyword in Title</li>
                                        <li className="flex items-center gap-2 text-green-400"><Check size={12} /> Keyword in First Paragraph</li>
                                        <li className="flex items-center gap-2 text-gray-500"><div className="w-3 h-3 border border-gray-600 rounded-full"></div> Add 2 Internal Links</li>
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* Main Content */}
                        <div className="lg:col-span-9">
                            {mode === 'create' && (
                                <div className="glass-card p-8 min-h-[500px]">
                                    <h2 className="text-2xl font-bold mb-6">What should we write about?</h2>
                                    <div className="flex gap-4 mb-8">
                                        <input
                                            type="text"
                                            placeholder="Enter a broad topic (e.g., 'Agentic AI')..."
                                            value={topic}
                                            onChange={(e) => setTopic(e.target.value)}
                                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition-colors"
                                        />
                                        <button
                                            onClick={handleGenerateIdeas}
                                            disabled={!topic || isGenerating}
                                            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
                                        >
                                            {isGenerating ? <RefreshCw className="animate-spin" /> : <Settings />}
                                            Generate Ideas
                                        </button>
                                    </div>

                                    {isGenerating && (
                                        <div className="text-center py-12 text-gray-500 animate-pulse">
                                            {activeAgent} is brainstorming titles...
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {generatedIdeas.map((idea, i) => (
                                            <button
                                                key={i}
                                                onClick={() => handleStartWriting(idea)}
                                                className="text-left p-6 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-emerald-500/50 rounded-xl transition-all group"
                                            >
                                                <h3 className="font-bold text-lg mb-2 group-hover:text-emerald-400">{idea}</h3>
                                                <span className="text-xs text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">Select & Start Writing →</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {mode === 'write' && (
                                <div className="glass-card p-0 overflow-hidden flex flex-col h-[700px]">
                                    {/* Toolbar */}
                                    <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
                                        <div className="flex gap-2">
                                            <button className="p-2 hover:bg-white/10 rounded"><Save size={18} /></button>
                                            <div className="w-px h-6 bg-white/10 mx-2"></div>
                                            <button className="p-2 hover:bg-white/10 rounded font-bold">B</button>
                                            <button className="p-2 hover:bg-white/10 rounded italic">I</button>
                                        </div>
                                        <button
                                            onClick={handlePublish}
                                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm font-bold flex items-center gap-2"
                                        >
                                            <Send size={16} /> Publish to WP
                                        </button>
                                    </div>

                                    {/* Editor Input */}
                                    <div className="flex-1 p-8 overflow-y-auto">
                                        <input
                                            type="text"
                                            value={currentPost.title}
                                            onChange={(e) => setCurrentPost({ ...currentPost, title: e.target.value })}
                                            className="w-full bg-transparent text-4xl font-bold mb-6 outline-none placeholder-gray-600"
                                            placeholder="Article Title"
                                        />
                                        <textarea
                                            value={currentPost.content}
                                            onChange={(e) => setCurrentPost({ ...currentPost, content: e.target.value })}
                                            className="w-full h-full bg-transparent resize-none outline-none text-lg text-gray-300 leading-relaxed font-mono"
                                            placeholder="Start writing..."
                                        />
                                    </div>

                                    {/* AI Assist Bar */}
                                    <div className="p-4 border-t border-white/10 bg-black/20 flex items-center gap-4">
                                        <span className="text-xs font-bold text-teal-400">AI ASSIST:</span>
                                        <button className="text-xs px-3 py-1 bg-white/5 rounded-full hover:bg-white/10">Continue writing</button>
                                        <button className="text-xs px-3 py-1 bg-white/5 rounded-full hover:bg-white/10">Fix Grammar</button>
                                        <button className="text-xs px-3 py-1 bg-white/5 rounded-full hover:bg-white/10">Make more punchy</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
