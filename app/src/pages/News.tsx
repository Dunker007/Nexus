import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PlayCircle, Plus, Trash2, Target, RefreshCw, Filter, Search, ShieldAlert, Cpu, X } from 'lucide-react';
import {
    NEWS_SOURCES,
    BIAS_COLORS,
    type NewsArticle,
    fetchAllNews,
    type SubjectTracker,
    countTrackerMatches
} from '../services/newsService';

type FilterTab = 'all' | 'local' | 'national' | 'alternative' | 'saved' | 'watch';

export function News() {
    const [articles, setArticles] = useState<NewsArticle[]>([]);
    const [activeTab, setActiveTab] = useState<FilterTab>('all');
    const [savedArticles, setSavedArticles] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedBias, setSelectedBias] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    
    // Fact Checker Panel
    const [showFactChecker, setShowFactChecker] = useState(false);
    const [factCheckQuery, setFactCheckQuery] = useState('');
    const [factCheckResult, setFactCheckResult] = useState<any>(null);

    // Subject Radar
    const [showRadar, setShowRadar] = useState(false);
    const [trackers, setTrackers] = useState<SubjectTracker[]>([]);
    const [newTrackerKeyword, setNewTrackerKeyword] = useState('');

    // Source Management
    const [showSourceManager, setShowSourceManager] = useState(false);
    const [customSources] = useState<any[]>([]);
    const [disabledSources, setDisabledSources] = useState<Set<string>>(new Set());
    const [showTicker, setShowTicker] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setShowTicker(false), 10000);
        return () => clearTimeout(timer);
    }, []);

    const fetchNews = async () => {
        setIsRefreshing(true);
        await refreshNews();
        setIsRefreshing(false);
    };

    // Load initial data
    useEffect(() => {
        const fetchInitial = async () => {
            setIsLoading(true);
            try {
                const liveNews = await fetchAllNews();
                if (liveNews && liveNews.length > 0) {
                    setArticles(liveNews);
                } else {
                    // Fallback to sample data if API is empty
                    setArticles([{
                        id: 'demo-1',
                        title: 'Demo Headline: The Bridge Is Online',
                        source: { id: 'sys', name: 'Nexus Status', logo: '🌐', bias: 'center' },
                        category: 'national',
                        description: 'The API returned an empty list, showing placeholder data.',
                        link: '#',
                        pubDate: new Date().toISOString()
                    }]);
                }
            } catch(e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };
        fetchInitial();
    }, []);

    const refreshNews = async () => {
        setIsLoading(true);
        try {
            const data = await fetch('/api/news/refresh', { method: 'POST' });
            if (data.ok) {
                const liveNews = await fetchAllNews();
                setArticles(liveNews);
            }
        } catch (error) {
            console.error('Failed to refresh news:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Update matches on refresh
    useEffect(() => {
        if (articles.length > 0) {
            setTrackers(prev => countTrackerMatches(articles, prev));
        }
    }, [articles]);

    const addTracker = () => {
        if (!newTrackerKeyword.trim()) return;
        const colors = ['red', 'cyan', 'emerald', 'purple', 'amber'];
        const color = colors[trackers.length % colors.length];
        setTrackers([...trackers, {
            id: `tracker-${Date.now()}`,
            keyword: newTrackerKeyword.trim(),
            color,
            lastCount: 0
        }]);
        setNewTrackerKeyword('');
    };

    const removeTracker = (id: string) => setTrackers(trackers.filter(t => t.id !== id));
    const toggleSourceEnabled = (id: string) => {
        setDisabledSources(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };

    const allSources = [
        ...NEWS_SOURCES.national,
        ...NEWS_SOURCES.local,
        ...NEWS_SOURCES.alternative,
        ...NEWS_SOURCES.center,
        ...NEWS_SOURCES.left,
        ...customSources
    ];

    const filteredArticles = articles.filter(article => {
        // Source Disabled
        if (disabledSources.has(article.source.id)) return false;
        // Tab filter
        if (activeTab === 'local' && article.category !== 'local') return false;
        if (activeTab === 'national' && !['national', 'center', 'left'].includes(article.category)) return false;
        if (activeTab === 'alternative' && article.category !== 'alternative') return false;
        if (activeTab === 'saved' && !savedArticles.has(article.id)) return false;
        if (activeTab === 'watch') {
            const isVideoSource = ['banned-video', 'infowars', 'fox-news', 'joe-rogan'].includes(article.source.id);
            const hasVideoLink = article.link.includes('youtube') || article.link.includes('rumble') || article.link.includes('video');
            const hasVideoTitle = article.title.toLowerCase().includes('watch:') || article.title.toLowerCase().includes('video:');
            return isVideoSource || hasVideoLink || hasVideoTitle;
        }

        // Bias filter
        if (selectedBias && article.source.bias !== selectedBias) return false;

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return article.title.toLowerCase().includes(query) ||
                (article.description || '').toLowerCase().includes(query) ||
                article.source.name.toLowerCase().includes(query);
        }

        return true;
    });

    const runFactCheck = async () => {
        if (!factCheckQuery.trim()) return;
        setIsLoading(true);
        setTimeout(() => {
            setFactCheckResult({
                query: factCheckQuery,
                status: 'analyzed',
                findings: [
                    { source: 'Nexus AI', rating: 'Context Needed', url: '#' }
                ],
                aiAnalysis: 'Local LLM analysis suggests this claim requires broader context. Consider verifying the source\'s direct quotations.'
            });
            setIsLoading(false);
        }, 1200);
    };

    const toggleSave = (id: string) => {
        setSavedArticles(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };


    return (
        <div className="flex flex-col h-full bg-[#050507] text-gray-100 overflow-hidden relative">
            {/* Ambient War Room Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-red-600/5 rounded-full blur-[140px] mix-blend-screen opacity-50" />
                <div className="absolute -bottom-40 -left-40 w-[800px] h-[800px] bg-purple-600/5 rounded-full blur-[140px] mix-blend-screen opacity-50" />
            </div>

            {/* Header / Global Stats Strip */}
            <div className="flex-none z-30 glass-panel border-b border-white/5 px-8 py-4 backdrop-blur-2xl">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    {/* Tactical Brand */}
                    <div className="flex items-center gap-6">
                        <motion.div 
                            whileHover={{ scale: 1.05 }}
                            className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center shadow-[0_0_30px_rgba(220,38,38,0.2)] border border-red-500/30"
                        >
                            <Target className="w-7 h-7 text-white" />
                        </motion.div>
                        <div className="space-y-1">
                            <h1 className="text-3xl font-black text-white tracking-tighter flex items-center gap-3">
                                NEXUS <span className="text-gradient-red">INTELLIGENCE</span>
                            </h1>
                            <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-[0.4em] text-white/30">
                                <span className="flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
                                    OPERATIONAL UNIT
                                </span>
                                <span className="h-3 w-px bg-white/10" />
                                <span>{allSources.length - disabledSources.size} NODES ACTIVE</span>
                                <span className="h-3 w-px bg-white/10" />
                                <span>GRID STATUS: SECURE</span>
                            </div>
                        </div>
                    </div>

                    {/* Desktop Toolbar */}
                    <div className="flex items-center gap-3 ml-auto">
                        <div className="relative mr-4 hidden xl:block">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                            <input
                                type="text"
                                placeholder="IDENTIFY TARGETS..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white focus:outline-none focus:border-red-500/50 transition-all w-64 placeholder:text-white/10"
                            />
                        </div>

                        <div className="flex gap-2">
                            <button onClick={refreshNews} disabled={isLoading} className="w-11 h-11 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-red-500/10 hover:border-red-500/30 transition-all">
                                <RefreshCw size={18} className={isLoading ? 'animate-spin text-red-500' : ''} />
                            </button>
                            <button onClick={() => setShowRadar(!showRadar)} className={`w-11 h-11 flex items-center justify-center rounded-xl border transition-all ${showRadar ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 'bg-white/5 border-white/10 text-white/40 hover:text-white'}`}>
                                <Target size={18} />
                            </button>
                            <button onClick={() => setShowFactChecker(!showFactChecker)} className={`w-11 h-11 flex items-center justify-center rounded-xl border transition-all ${showFactChecker ? 'bg-purple-500/20 border-purple-500/30 text-purple-400' : 'bg-white/5 border-white/10 text-white/40 hover:text-white'}`}>
                                <ShieldAlert size={18} />
                            </button>
                            <button onClick={() => setShowSourceManager(!showSourceManager)} className={`w-11 h-11 flex items-center justify-center rounded-xl border transition-all ${showSourceManager ? 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400' : 'bg-white/5 border-white/10 text-white/40 hover:text-white'}`}>
                                <Cpu size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tactical Filter Strip */}
                <div className="flex items-center gap-8 mt-8 border-t border-white/5 pt-6">
                    <div className="flex items-center gap-3 pb-0.5">
                        <Filter size={14} className="text-white/20" />
                        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
                            {(['all', 'local', 'national', 'alternative', 'saved', 'watch'] as FilterTab[]).map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap transition-all border ${activeTab === tab 
                                        ? 'bg-red-500/10 text-red-500 border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.1)]' 
                                        : 'text-white/20 border-transparent hover:text-white/60 hover:bg-white/5'}`}
                                >
                                    {tab === 'watch' ? <span className="flex items-center gap-1.5"><PlayCircle size={12}/> VIDEO STREAM</span> : tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="h-6 w-px bg-white/10" />

                    <div className="flex items-center gap-4">
                        <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">PERSPECTIVE ::</span>
                        <select
                            value={selectedBias || ''}
                            onChange={(e) => setSelectedBias(e.target.value || null)}
                            className="bg-transparent border-none text-[10px] font-black text-white/40 focus:outline-none focus:text-white cursor-pointer hover:text-white/60 transition-all uppercase tracking-[0.2em]"
                        >
                            <option value="" className="bg-[#0a0a0f]">Full Spectrum</option>
                            {Object.entries(BIAS_COLORS).map(([key, info]) => (
                                <option key={key} value={key} className="bg-[#0a0a0f]">{info.label.toUpperCase()}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Main Operational Field */}
            <div className="flex-1 overflow-y-auto w-full h-full relative z-10 custom-scrollbar">
                <div className="p-8 pb-32">

                    {/* Expanded Tactical Panels */}
                    <AnimatePresence>
                        {showRadar && (
                            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="mb-10">
                                <div className="glass-card p-8 border-emerald-500/20 relative overflow-hidden">
                                     <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[80px] -mr-20 -mt-20" />
                                     <div className="relative z-10">
                                        <div className="flex items-center justify-between mb-8">
                                            <h3 className="text-xl font-black text-emerald-400 flex items-center gap-4 uppercase tracking-tighter"><Target size={24}/> SUBJECT TRACKING RADAR</h3>
                                            <div className="flex items-center gap-4">
                                                <input type="text" value={newTrackerKeyword} onChange={e=>setNewTrackerKeyword(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addTracker()} placeholder="IDENTIFY TARGET..." className="glass-input w-64 border-emerald-500/20 placeholder:text-emerald-900/40" />
                                                <button onClick={addTracker} className="p-3 bg-emerald-500 text-black rounded-xl hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"><Plus size={20}/></button>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                            {trackers.map(t => (
                                                <div key={t.id} className="glass-card p-5 border-emerald-500/10 hover:border-emerald-500/30 transition-all group relative">
                                                    <button onClick={() => removeTracker(t.id)} className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 p-2 text-white/20 hover:text-red-500"><Trash2 size={12}/></button>
                                                    <div className="text-[10px] font-black text-emerald-400/40 uppercase tracking-[0.2em] mb-3">Priority Sector</div>
                                                    <div className="text-lg font-black text-white mb-6 uppercase tracking-tight truncate">{t.keyword}</div>
                                                    <div className="flex items-end justify-between">
                                                        <div className="w-1.5 h-10 bg-emerald-500/20 rounded-full overflow-hidden">
                                                            <div className="bg-emerald-500 w-full h-1/2 mt-auto" />
                                                        </div>
                                                        <div className="text-3xl font-black text-white leading-none">{t.lastCount}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                     </div>
                                </div>
                            </motion.div>
                        )}
                        
                        {showFactChecker && (
                            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="mb-10">
                                <div className="glass-card p-8 border-purple-500/20">
                                    <h3 className="text-xl font-black text-purple-400 mb-8 flex items-center gap-4 uppercase tracking-tighter"><ShieldAlert size={24}/> NEURAL VERACITY ANALYSIS</h3>
                                    <div className="flex items-center gap-6 mb-10">
                                        <input type="text" value={factCheckQuery} onChange={e=>setFactCheckQuery(e.target.value)} onKeyDown={e=>e.key==='Enter'&&runFactCheck()} placeholder="INPUT DATA PACKET FOR ANALYSIS..." className="flex-1 glass-input border-purple-500/20 text-lg" />
                                        <button onClick={runFactCheck} disabled={isLoading} className="px-10 py-4 bg-gradient-to-r from-purple-600 to-indigo-700 text-white font-black uppercase tracking-[0.3em] rounded-2xl shadow-2xl hover:brightness-110 active:scale-95 transition-all text-[11px] disabled:opacity-50">{isLoading ? 'PROCESSING...' : 'EXECUTE ANALYSIS'}</button>
                                    </div>
                                    {factCheckResult && (
                                        <div className="bg-black/50 border border-white/5 rounded-3xl p-10 relative overflow-hidden">
                                            <div className="absolute inset-0 bg-purple-500/[0.02] pointer-events-none" />
                                            <div className="relative z-10 flex flex-col xl:flex-row gap-12 items-start">
                                                <div className="flex-1 space-y-8">
                                                    <div className="space-y-2">
                                                        <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em]">SOURCE MATERIAL</span>
                                                        <p className="text-xl font-black text-white/60 italic leading-relaxed">"{factCheckResult.query}"</p>
                                                    </div>
                                                    <div className="flex flex-wrap gap-4">
                                                        {factCheckResult.findings.map((f: any, i: number) => (
                                                            <a key={i} href={f.url} className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-4 hover:bg-white/10 transition-all group">
                                                                <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">{f.source}</span>
                                                                <span className="h-4 w-px bg-white/10" />
                                                                <span className="text-[11px] font-black text-yellow-400 uppercase tracking-widest">{f.rating}</span>
                                                            </a>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="w-full xl:w-[400px] p-8 glass-card border-purple-500/30 bg-purple-500/10 backdrop-blur-3xl rounded-[2.5rem]">
                                                    <div className="text-[10px] font-black text-purple-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                                                       <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" /> AI SYNTHESIS RESULTS
                                                    </div>
                                                    <p className="text-md font-black text-white leading-relaxed tracking-tight group-hover:text-purple-100 transition-colors capitalize">
                                                       {factCheckResult.aiAnalysis}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Breaking Intelligence Ticker (Auto-collapsing) */}
                    <AnimatePresence>
                        {showTicker && !isLoading && filteredArticles.length > 0 && activeTab === 'all' && !searchQuery && (
                            <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="mb-8 w-full bg-red-600/10 border-y border-red-500/20 py-4 relative overflow-hidden group"
                            >
                                <div className="flex items-center">
                                    <div className="px-8 py-2 bg-red-600 text-white text-xs font-black uppercase tracking-[0.4em] z-30 relative shadow-[15px_0_40px_rgba(220,38,38,0.6)] flex items-center gap-4 shrink-0">
                                        <span className="w-3 h-3 rounded-full bg-white animate-pulse" />
                                        BREAKING INTELLIGENCE
                                    </div>
                                    <div className="flex-1 overflow-hidden relative h-12">
                                        <motion.div 
                                            className="flex gap-16 items-center absolute whitespace-nowrap h-full"
                                            animate={{ x: ["0%", "-50%"] }}
                                            transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
                                        >
                                            {[...filteredArticles.slice(15, 25), ...filteredArticles.slice(15, 25)].map((article, idx) => (
                                                <a 
                                                    key={`${article.id}-${idx}`}
                                                    href={article.link}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="flex items-center gap-6 group/item h-full"
                                                >
                                                    <span className="text-sm font-black text-white/50 group-hover/item:text-red-500 transition-colors uppercase tracking-tight">
                                                        {article.title}
                                                    </span>
                                                    <span className="text-red-600 font-bold opacity-30 text-lg">//</span>
                                                </a>
                                            ))}
                                        </motion.div>
                                        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-red-600/0 via-red-600/0 to-transparent z-20" />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Intelligence Matrix (Dominant Centered Matrix) */}
                    {!isLoading && filteredArticles.length > 0 && activeTab === 'all' && !searchQuery && (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12 h-auto lg:h-[450px] relative z-20">
                            
                            {/* Node Pack 01 (Column 1: 3 Tiles) */}
                            <div className="lg:col-span-3 flex flex-col gap-4 order-2 lg:order-1">
                                {filteredArticles.slice(1, 4).map((article, idx) => (
                                    <motion.a
                                        key={article.id}
                                        href={article.link}
                                        target="_blank"
                                        rel="noreferrer"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="group relative flex-1 rounded-[1.5rem] overflow-hidden border border-white/5 shadow-xl transition-all hover:border-red-500/20 bg-black/40 p-4 flex flex-col justify-center"
                                    >
                                        <div className="flex items-center justify-between mb-2 relative z-10">
                                            <div className="flex items-center gap-2">
                                                <span className="text-base">{article.source.logo}</span>
                                                <span className="text-[7px] font-black text-white/20 uppercase tracking-widest truncate max-w-[80px]">{article.source.name}</span>
                                            </div>
                                            <div className={`w-1 h-1 rounded-full ${ (article as any).priority ? 'bg-red-500 animate-pulse' : 'bg-white/10'}`} />
                                        </div>
                                        <h3 className="text-[10px] font-black text-white/70 leading-tight group-hover:text-red-400 transition-colors uppercase line-clamp-2 tracking-tighter">
                                            {article.title}
                                        </h3>
                                    </motion.a>
                                ))}
                            </div>

                            {/* Feature Alpha (Column 2: Dominant Centered) */}
                            <motion.a
                                href={filteredArticles[0].link}
                                target="_blank"
                                rel="noreferrer"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="lg:col-span-6 group relative rounded-[2.5rem] overflow-hidden border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.5)] transition-all hover:border-red-500/30 flex flex-col order-1 lg:order-2"
                            >
                                <div className="absolute inset-0 z-0 bg-neutral-950">
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent z-10" />
                                    <div className={`absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity ${(filteredArticles[0] as any).priority ? 'bg-mesh-red' : 'bg-mesh-purple'}`} />
                                </div>

                                <div className="mt-auto p-10 z-20 space-y-4">
                                    <div className="flex items-center gap-3">
                                         <div className="px-4 py-1.5 bg-red-600 text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-lg shadow-xl">PRIORITY ALPHA</div>
                                    </div>

                                    <h2 className="text-2xl lg:text-4xl font-black text-white leading-none tracking-tighter group-hover:text-red-500 transition-colors uppercase line-clamp-4">
                                        {filteredArticles[0].title}
                                    </h2>

                                    <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                                         <div className="flex items-center gap-3">
                                             <span className="text-2xl">{filteredArticles[0].source.logo}</span>
                                             <span className="text-[10px] font-black uppercase tracking-widest text-white/50">{filteredArticles[0].source.name}</span>
                                         </div>
                                         <div className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">
                                             {filteredArticles[0].pubDate ? new Date(filteredArticles[0].pubDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'LIVE'}
                                         </div>
                                    </div>
                                </div>
                            </motion.a>

                            {/* Node Pack 02 (Column 3: 3 Tiles) */}
                            <div className="lg:col-span-3 flex flex-col gap-4 order-3">
                                {filteredArticles.slice(4, 7).map((article, idx) => (
                                    <motion.a
                                        key={article.id}
                                        href={article.link}
                                        target="_blank"
                                        rel="noreferrer"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: (idx + 3) * 0.1 }}
                                        className="group relative flex-1 rounded-[1.5rem] overflow-hidden border border-white/5 shadow-xl transition-all hover:border-cyan-500/20 bg-black/40 p-4 flex flex-col justify-center"
                                    >
                                        <div className="flex items-center justify-between mb-2 relative z-10">
                                            <div className="flex items-center gap-2">
                                                <span className="text-base">{article.source.logo}</span>
                                                <span className="text-[7px] font-black text-white/20 uppercase tracking-widest truncate max-w-[80px]">{article.source.name}</span>
                                            </div>
                                            <div className="w-1 h-1 rounded-full bg-white/10" />
                                        </div>
                                        <h3 className="text-[10px] font-black text-white/70 leading-tight group-hover:text-cyan-400 transition-colors uppercase line-clamp-2 tracking-tighter">
                                            {article.title}
                                        </h3>
                                    </motion.a>
                                ))}
                            </div>

                        </div>
                    )}

                    {/* Tactical Status HUD / Integrated Control Bar */}
                    {!isLoading && activeTab === 'all' && !searchQuery && (
                        <div className="mb-12 relative z-30">
                            <div className="bg-black/60 border border-white/10 p-4 rounded-[2rem] backdrop-blur-2xl shadow-2xl flex flex-wrap items-center gap-6">
                                <div className="flex items-center gap-3 pr-6 border-r border-white/10">
                                    <div className="w-10 h-10 rounded-2xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-500">
                                        <span className="text-xl">📡</span>
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] leading-tight">Nexus Intelligence</div>
                                        <div className="text-[14px] font-black text-red-500 uppercase tracking-tighter leading-tight">System Online</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 px-6 border-r border-white/10">
                                    <div className="flex flex-col">
                                        <span className="text-[8px] font-bold text-white/20 uppercase tracking-[0.3em]">Operational Scan</span>
                                        <span className="text-[12px] font-black text-white/60 tracking-tight">8 SOURCES ACTIVE</span>
                                    </div>
                                    <div className="h-6 w-[1px] bg-white/10" />
                                </div>

                                {/* Integrated Tactical Filters */}
                                <div className="flex items-center gap-2 bg-white/[0.03] p-1.5 rounded-2xl border border-white/5">
                                    {[
                                        { id: 'all', name: 'All', icon: '' },
                                        { id: 'local', name: 'Local', icon: '🏠' },
                                        { id: 'national', name: 'National', icon: '🇺🇸' },
                                        { id: 'alternative', name: 'Alternative', icon: '👀' },
                                        { id: 'saved', name: 'Saved', icon: '⭐' },
                                    ].map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id as FilterTab)}
                                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                                                activeTab === tab.id 
                                                    ? "bg-red-600 text-white shadow-lg shadow-red-600/20" 
                                                    : "text-white/30 hover:text-white hover:bg-white/5"
                                            }`}
                                        >
                                            {tab.icon && <span>{tab.icon}</span>}
                                            {tab.name}
                                        </button>
                                    ))}
                                </div>

                                {/* HUD Action Pack */}
                                <div className="ml-auto flex items-center gap-3">
                                    <button onClick={() => fetchNews()} className="p-3 bg-white/5 border border-white/10 rounded-2xl text-white/40 hover:text-red-500 hover:border-red-500/50 transition-all group">
                                        <RefreshCw className={`w-4 h-4 group-hover:rotate-180 transition-transform duration-500 ${isRefreshing ? "animate-spin" : ""}`} />
                                    </button>
                                    <button className="flex items-center gap-2 px-5 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-white/40 uppercase tracking-widest hover:text-cyan-400 hover:border-cyan-500/50 transition-all">
                                        <span>🔍</span> Fact Check
                                    </button>
                                    <button className="flex items-center gap-2 px-5 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-white/40 uppercase tracking-widest hover:text-purple-400 hover:border-purple-500/50 transition-all">
                                        <span>📚</span> Research
                                    </button>
                                    <button className="flex items-center gap-2 px-5 py-3 bg-red-600/20 border border-red-500/30 rounded-2xl text-[10px] font-black text-red-500 uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all">
                                        Radar
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Operational Feed Grid */}
                    {articles.length === 0 && !isLoading ? (
                        <div className="flex flex-col items-center justify-center py-40 text-center">
                            <motion.div 
                                animate={{ rotate: [0, 10, -10, 0] }}
                                transition={{ duration: 4, repeat: Infinity }}
                                className="w-32 h-32 rounded-[3.5rem] bg-white/[0.02] border border-white/5 flex items-center justify-center mb-10"
                            >
                                <Target className="w-12 h-12 text-white/10" />
                            </motion.div>
                            <h3 className="text-4xl font-black text-white/20 uppercase tracking-tighter mb-4">Signal Lost</h3>
                            <p className="text-[10px] font-black text-white/10 uppercase tracking-[0.5em]">Verify node connection to resume decryption</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                            {(activeTab === 'all' && !searchQuery ? filteredArticles.slice(7) : filteredArticles).map((article, i) => {
                                const biasInfo = BIAS_COLORS[article.source.bias as keyof typeof BIAS_COLORS] || { text: 'text-gray-400', bg: 'bg-white/5', border: 'border-white/10', label: 'Unknown' };
                                const isSaved = savedArticles.has(article.id);
                                const isHot = (article as any).priority || article.title.toLowerCase().includes('breaking');

                                return (
                                    <motion.a
                                        href={article.link}
                                        target="_blank"
                                        rel="noreferrer"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.4, delay: Math.min(i * 0.04, 0.4) }}
                                        key={article.id}
                                        className={`group block glass-card p-0 border-white/5 hover:border-red-500/40 relative overflow-hidden flex flex-col min-h-[420px] shadow-2xl transition-all ${isHot ? 'shadow-red-950/10 border-red-950/20' : ''}`}
                                    >
                                        {/* Visual Lead (Pseudo-Image area for tactical feel) */}
                                        <div className="h-40 relative bg-black/80 overflow-hidden">
                                             <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent z-10" />
                                             <div className={`absolute inset-0 opacity-10 group-hover:scale-110 transition-transform duration-700 ${isHot ? 'bg-mesh-red' : 'bg-mesh-purple'}`} />
                                             
                                             <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
                                                 <div className="px-3 py-1 bg-black/60 backdrop-blur-xl border border-white/10 rounded-lg text-[9px] font-black text-white uppercase tracking-widest leading-none">
                                                     {article.source.name}
                                                 </div>
                                                 {isHot && (
                                                     <div className="px-2 py-1 bg-red-600 rounded-lg text-[8px] font-black text-white uppercase animate-pulse shadow-lg shadow-red-600/30">
                                                         PRIORITY
                                                     </div>
                                                 )}
                                             </div>

                                             <div className="absolute bottom-[-15px] left-8 w-12 h-12 bg-black border border-white/10 rounded-2xl flex items-center justify-center text-2xl z-20 shadow-2xl group-hover:border-red-500/30 group-hover:-translate-y-1 transition-all">
                                                 {article.source.logo}
                                             </div>
                                        </div>
                                        
                                        <div className="p-8 pt-10 flex-1 flex flex-col">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">
                                                    IDENT :: {article.pubDate ? new Date(article.pubDate).toLocaleDateString() : 'REALTIME'}
                                                </div>
                                                <button onClick={(e) => { e.preventDefault(); toggleSave(article.id); }} className={`p-2 transition-all active:scale-95 ${isSaved ? 'text-red-500' : 'text-white/10 hover:text-white/40'}`}>
                                                    <Target size={14} className={isSaved ? 'fill-current' : ''} />
                                                </button>
                                            </div>

                                            <h2 className="text-xl font-black text-white leading-tight mb-4 group-hover:text-red-500 transition-colors line-clamp-3 tracking-tighter uppercase">
                                                {article.title}
                                            </h2>
                                            
                                            <p className="text-[11px] text-white/30 leading-relaxed line-clamp-3 mb-8 font-black uppercase tracking-tight">
                                                {article.description || 'RAW DATA PACKET :: No summary available in current sector.'}
                                            </p>

                                            <div className="mt-auto grid grid-cols-2 gap-px bg-white/5 border border-white/5 rounded-2xl overflow-hidden">
                                                <div className="p-3 flex flex-col gap-1 items-center bg-[#07070a]/80">
                                                    <span className="text-[8px] font-black text-white/10 tracking-[0.2em]">VERACITY</span>
                                                    <span className="text-[10px] font-black text-emerald-400">UNMATCHED</span>
                                                </div>
                                                <div className={`${biasInfo.bg} ${biasInfo.text} p-3 flex flex-col gap-1 items-center`}>
                                                    <span className="text-[8px] font-black opacity-30 tracking-[0.2em] text-current">BIAS.MOD</span>
                                                    <span className="text-[10px] font-black uppercase tracking-widest">{biasInfo.label}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="absolute inset-x-0 bottom-0 h-1 bg-red-600/0 group-hover:bg-red-600/20 transition-all" />
                                    </motion.a>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Source Configuration Overlay */}
            <AnimatePresence>
                {showSourceManager && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-3xl flex items-center justify-center p-8"
                    >
                         <motion.div 
                            initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }}
                            className="w-full max-w-6xl glass-card border-cyan-500/20 max-h-[90vh] flex flex-col"
                         >
                            <div className="p-8 border-b border-white/5 flex items-center justify-between">
                                <div className="space-y-1">
                                    <h3 className="text-3xl font-black text-cyan-400 uppercase tracking-tighter">SOURCE NODE CONFIGURATION</h3>
                                    <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.5em]">Managing {allSources.length - disabledSources.size} / {allSources.length} Decryption Nodes</p>
                                </div>
                                <button onClick={() => setShowSourceManager(false)} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-white/20 hover:text-white transition-all">
                                    <X size={24} />
                                </button>
                            </div>
                            <div className="p-8 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 custom-scrollbar">
                                {allSources.map(source => {
                                    const isOff = disabledSources.has(source.id);
                                    const biasInfo = BIAS_COLORS[source.bias as keyof typeof BIAS_COLORS] || { text: 'text-gray-400', bg: 'bg-white/5', border: 'border-white/10', label: source.bias };
                                    return (
                                        <div key={source.id} className={`flex items-center justify-between p-5 rounded-[1.5rem] border transition-all ${isOff ? 'bg-black opacity-30 grayscale' : 'bg-white/5 border-white/10 hover:border-cyan-500/40'}`}>
                                            <div className="flex items-center gap-4 min-w-0 pr-4">
                                                <span className="text-3xl">{source.logo}</span>
                                                <div className="truncate">
                                                    <div className="text-sm font-black text-white truncate uppercase tracking-tight">{source.name}</div>
                                                    <div className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg border mt-2 inline-block ${biasInfo.bg} ${biasInfo.text} ${biasInfo.border}`}>{biasInfo.label}</div>
                                                </div>
                                            </div>
                                            <button onClick={() => toggleSourceEnabled(source.id)} className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all shrink-0 active:scale-90 ${isOff ? 'bg-black text-white/10 border-white/10' : 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.1)]'}`}>
                                                {isOff ? 'OFF' : 'ON'}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                         </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );

}
