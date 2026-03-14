import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, PenTool, Search, Send, FileText, Check, RefreshCw, Globe, ArrowRight, Save } from 'lucide-react';
import { Link } from 'react-router-dom';

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

export function BlogStudio() {
    const [mode, setMode] = useState('dashboard');
    const [topic, setTopic] = useState('');
    const [generatedIdeas, setGeneratedIdeas] = useState<string[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [currentPost, setCurrentPost] = useState({ title: '', content: '' });
    const [seoScore] = useState(85);
    const [activeAgent, setActiveAgent] = useState<string | null>(null);

    const handleGenerateIdeas = () => {
        setIsGenerating(true);
        setActiveAgent('Lux (Creative)');
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

    return (
        <div className="flex-1 overflow-y-auto w-full custom-scrollbar bg-[#050508] text-white relative">
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-emerald-900/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-teal-900/10 rounded-full blur-[120px]"></div>
            </div>

            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-8 z-10 relative">
                <div className="flex items-center gap-2 mb-8 text-xs font-bold uppercase tracking-widest text-emerald-400">
                    <Link to="/studios" className="hover:text-emerald-300 transition-colors">Studios</Link>
                    <span className="opacity-30">/</span>
                    <span className="text-white/40">Blog</span>
                </div>

                {mode === 'dashboard' && (
                    <div className="space-y-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gradient-to-r from-emerald-900/40 to-teal-900/40 border border-emerald-500/20 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                            <h1 className="text-4xl font-bold mb-4 flex items-center gap-4 relative z-10">
                                <BookOpen className="text-emerald-400" size={32} />
                                Content Command Center
                            </h1>
                            <p className="text-white/40 text-lg max-w-2xl mb-8 relative z-10 font-medium leading-relaxed">
                                Manage your WordPress empire. Generate ideas, write SEO-optimized articles, and publish instantly with AI assistance.
                            </p>

                            <div className="flex gap-4 relative z-10">
                                <button
                                    onClick={() => setMode('create')}
                                    className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 rounded-2xl font-bold text-black transition-all flex items-center gap-3 shadow-lg shadow-emerald-500/20 active:scale-95"
                                >
                                    <PenTool size={20} />
                                    <span className="uppercase tracking-widest text-xs">New Article</span>
                                </button>
                                <button className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-bold transition-all flex items-center gap-3 active:scale-95">
                                    <Globe size={20} className="text-emerald-400/60" />
                                    <span className="uppercase tracking-widest text-xs">View Site</span>
                                </button>
                            </div>
                        </motion.div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="bg-[#12121a] border border-white/5 p-6 rounded-3xl shadow-xl space-y-6">
                                <h3 className="font-bold text-white/30 uppercase tracking-[0.2em] text-[10px]">Performance Metrics</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-5 bg-black/40 rounded-2xl border border-white/5 group hover:border-emerald-500/30 transition-all">
                                        <div className="text-3xl font-bold text-white mb-1">12</div>
                                        <div className="text-[10px] text-white/30 uppercase font-bold tracking-widest">Published</div>
                                    </div>
                                    <div className="p-5 bg-black/40 rounded-2xl border border-white/5 group hover:border-emerald-500/30 transition-all">
                                        <div className="text-3xl font-bold text-emerald-400 mb-1">4.2k</div>
                                        <div className="text-[10px] text-white/30 uppercase font-bold tracking-widest">Views</div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-[#12121a] border border-white/5 p-6 rounded-3xl shadow-xl col-span-2">
                                <h3 className="font-bold text-white/30 uppercase tracking-[0.2em] text-[10px] mb-4">Recent Drafts</h3>
                                <div className="space-y-3">
                                    {MOCK_DRAFTS.map(draft => (
                                        <div key={draft.id} className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-transparent hover:border-emerald-500/20 hover:bg-emerald-500/5 transition-all cursor-pointer group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/20">
                                                    <FileText size={20} />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-sm text-white/90 group-hover:text-emerald-400 transition-colors uppercase tracking-tight">{draft.title}</div>
                                                    <div className="text-[10px] text-white/30 font-bold uppercase tracking-widest mt-1">{draft.date} • {draft.status}</div>
                                                </div>
                                            </div>
                                            <ArrowRight size={18} className="text-white/20 group-hover:text-white group-hover:translate-x-1 transition-all" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {(mode === 'create' || mode === 'write') && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="grid grid-cols-1 lg:grid-cols-12 gap-8"
                    >
                        <div className="lg:col-span-3 space-y-6">
                            <div className="bg-[#12121a] border border-white/5 p-5 rounded-2xl shadow-xl">
                                <button
                                    onClick={() => setMode('dashboard')}
                                    className="text-[10px] font-bold uppercase tracking-widest text-white/30 hover:text-white flex items-center gap-2 mb-8 transition-colors group"
                                >
                                    <ArrowRight className="rotate-180 group-hover:-translate-x-1 transition-transform" size={14} /> Back to Dashboard
                                </button>

                                <div className="space-y-1">
                                    <div className={`p-4 rounded-xl flex items-center gap-4 transition-all border ${mode === 'create' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-lg shadow-emerald-500/5' : 'text-white/20 border-transparent'}`}>
                                        <div className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-[10px] font-bold">1</div>
                                        <span className="font-bold text-xs uppercase tracking-widest">Ideation</span>
                                    </div>
                                    <div className={`p-4 rounded-xl flex items-center gap-4 transition-all border ${mode === 'write' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-lg shadow-emerald-500/5' : 'text-white/20 border-transparent'}`}>
                                        <div className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-[10px] font-bold">2</div>
                                        <span className="font-bold text-xs uppercase tracking-widest">Editor</span>
                                    </div>
                                    <div className="p-4 rounded-xl flex items-center gap-4 text-white/10 border border-transparent">
                                        <div className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-[10px] font-bold">3</div>
                                        <span className="font-bold text-xs uppercase tracking-widest">Publish</span>
                                    </div>
                                </div>
                            </div>

                            {mode === 'write' && (
                                <div className="bg-[#12121a] border border-white/5 p-5 rounded-2xl shadow-xl">
                                    <h3 className="font-bold text-[10px] text-white/30 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                        <Search size={14} className="text-emerald-400" /> SEO Integrity
                                    </h3>
                                    <div className="mb-6">
                                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-2">
                                            <span className="text-white/40">Market Score</span>
                                            <span className="text-emerald-400">{seoScore}/100</span>
                                        </div>
                                        <div className="w-full bg-black/40 rounded-full h-1.5 overflow-hidden">
                                            <div className="bg-gradient-to-r from-emerald-600 to-teal-400 h-full" style={{ width: `${seoScore}%` }}></div>
                                        </div>
                                    </div>
                                    <ul className="space-y-3">
                                        <li className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-wide text-emerald-400/80"><Check size={14} /> Keyword in Title</li>
                                        <li className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-wide text-emerald-400/80"><Check size={14} /> Meta Description</li>
                                        <li className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-wide text-white/20"><div className="w-3.5 h-3.5 border-2 border-white/10 rounded-full"></div> Internal Links</li>
                                    </ul>
                                </div>
                            )}
                        </div>

                        <div className="lg:col-span-9">
                            <AnimatePresence mode="wait">
                                {mode === 'create' ? (
                                    <motion.div
                                        key="create"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="bg-[#12121a] border border-white/5 p-8 min-h-[500px] rounded-3xl shadow-xl"
                                    >
                                        <h2 className="text-2xl font-bold mb-8 uppercase tracking-tight text-white/90">Curate New Narrative</h2>
                                        <div className="flex gap-4 mb-10">
                                            <input
                                                type="text"
                                                placeholder="Enter a broad topic (e.g., 'Agentic AI')..."
                                                value={topic}
                                                onChange={(e) => setTopic(e.target.value)}
                                                className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors placeholder-white/20"
                                            />
                                            <button
                                                onClick={handleGenerateIdeas}
                                                disabled={!topic || isGenerating}
                                                className="px-8 bg-emerald-600 hover:bg-emerald-500 text-black rounded-2xl font-bold flex items-center gap-3 transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                                            >
                                                {isGenerating ? <RefreshCw className="animate-spin" size={18} /> : <Search size={18} />}
                                                <span className="uppercase tracking-widest text-xs">Ideate</span>
                                            </button>
                                        </div>

                                        {isGenerating && (
                                            <div className="text-center py-16 text-emerald-500/40 font-bold uppercase tracking-[0.3em] animate-pulse">
                                                {activeAgent} is dreaming...
                                            </div>
                                        )}

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {generatedIdeas.map((idea, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => handleStartWriting(idea)}
                                                    className="text-left p-6 bg-black/40 hover:bg-emerald-500/5 border border-white/5 hover:border-emerald-500/30 rounded-2xl transition-all group"
                                                >
                                                    <h3 className="font-bold text-sm mb-3 group-hover:text-emerald-400 uppercase tracking-tight leading-relaxed">{idea}</h3>
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500/0 group-hover:text-emerald-500/60 transition-all">Begin Drafting →</span>
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="write"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="bg-[#0a0a0f] border border-white/10 rounded-3xl overflow-hidden flex flex-col h-[750px] shadow-2xl"
                                    >
                                        <div className="flex items-center justify-between p-5 border-b border-white/5 bg-white/[0.02] backdrop-blur-md">
                                            <div className="flex gap-2">
                                                <button className="p-2.5 hover:bg-white/5 rounded-xl text-white/40 transition-colors"><Save size={18} /></button>
                                                <div className="w-px h-6 bg-white/5 mx-2"></div>
                                                <button className="px-3 py-2 hover:bg-white/5 rounded-xl text-[10px] font-bold font-serif">B</button>
                                                <button className="px-3 py-2 hover:bg-white/5 rounded-xl text-[10px] font-bold italic">I</button>
                                            </div>
                                            <button className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-black rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all">
                                                <Send size={14} /> Publish to WP
                                            </button>
                                        </div>

                                        <div className="flex-1 p-10 overflow-y-auto custom-scrollbar">
                                            <input
                                                type="text"
                                                value={currentPost.title}
                                                onChange={(e) => setCurrentPost({ ...currentPost, title: e.target.value })}
                                                className="w-full bg-transparent text-4xl font-bold mb-10 outline-none placeholder-white/10 uppercase tracking-tighter"
                                                placeholder="Article Title"
                                            />
                                            <textarea
                                                value={currentPost.content}
                                                onChange={(e) => setCurrentPost({ ...currentPost, content: e.target.value })}
                                                className="w-full h-full bg-transparent resize-none outline-none text-md text-white/60 leading-relaxed font-mono"
                                                placeholder="Start writing..."
                                            />
                                        </div>

                                        <div className="p-4 border-t border-white/5 bg-white/[0.01] flex items-center gap-4 overflow-x-auto no-scrollbar">
                                            <span className="text-[10px] font-bold text-teal-500/60 uppercase tracking-widest shrink-0">AI Assistant:</span>
                                            <button className="text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 bg-white/5 rounded-full hover:bg-white/10 shrink-0 transition-colors">Expand Thought</button>
                                            <button className="text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 bg-white/5 rounded-full hover:bg-white/10 shrink-0 transition-colors">Fix Dialect</button>
                                            <button className="text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 bg-white/5 rounded-full hover:bg-white/10 shrink-0 transition-colors">Add Punch</button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
