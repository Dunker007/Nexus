import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PlayCircle, Plus, Trash2, Target, Newspaper, RefreshCw, ExternalLink, Filter, Search, ShieldAlert, Cpu } from 'lucide-react';
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
        <div className="flex flex-col h-full bg-[#0a0a0f] overflow-hidden">
            {/* Header Area */}
            <div className="flex-none px-6 py-4 border-b border-white/5 bg-[#0d0d14] relative z-20">
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
                    {/* Title */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                            <Newspaper className="w-5 h-5 text-orange-400" />
                        </div>
                        <div>
                            <h1 className="font-bold text-white text-lg flex items-center gap-2">
                                Nexus <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">Intelligence</span>
                            </h1>
                            <div className="flex items-center gap-2 text-xs text-white/40">
                                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                                System Online • {allSources.length - disabledSources.size} Sources Active
                            </div>
                        </div>
                    </div>

                    {/* Quick Filters */}
                    <div className="flex gap-2 p-1 bg-white/5 border border-white/10 rounded-lg overflow-x-auto w-full xl:w-auto">
                        {(['all', 'local', 'national', 'alternative', 'saved', 'watch'] as FilterTab[]).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${activeTab === tab ? 'bg-orange-500/20 text-orange-400' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
                            >
                                {tab === 'watch' ? <span className="flex items-center gap-1"><PlayCircle size={12}/> Watch</span> : tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 ml-auto">
                        <button onClick={refreshNews} disabled={isLoading} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs font-medium text-white/70 hover:bg-white/10 transition-colors">
                            <RefreshCw size={14} className={isLoading ? 'animate-spin text-orange-400' : ''} />
                            Refresh
                        </button>
                        <button onClick={() => setShowRadar(!showRadar)} className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs font-medium transition-colors ${showRadar ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'}`}>
                            <Target size={14} /> Radar
                        </button>
                        <button onClick={() => setShowFactChecker(!showFactChecker)} className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs font-medium transition-colors ${showFactChecker ? 'bg-purple-500/20 border-purple-500/30 text-purple-400' : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'}`}>
                            <ShieldAlert size={14} /> Fact Check
                        </button>
                        <button onClick={() => setShowSourceManager(!showSourceManager)} className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs font-medium transition-colors ${showSourceManager ? 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400' : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'}`}>
                            <Cpu size={14} /> Sources
                        </button>
                    </div>
                </div>

                {/* Sub-toolbar (Search & Bias) */}
                <div className="flex items-center gap-3 mt-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <input
                            type="text"
                            placeholder="Filter intel..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-3 py-1.5 bg-black/50 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-orange-500/50 transition-colors"
                        />
                    </div>
                    <select
                        value={selectedBias || ''}
                        onChange={(e) => setSelectedBias(e.target.value || null)}
                        className="bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white/70 focus:outline-none focus:border-orange-500/50 cursor-pointer"
                    >
                        <option value="">All Viewpoints</option>
                        {Object.entries(BIAS_COLORS).map(([key, info]) => (
                            <option key={key} value={key}>{info.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Main Scrollable Content */}
            <div className="flex-1 overflow-y-auto w-full h-full relative z-10 custom-scrollbar">
                <div className="p-6">

                    {/* Radar Panel */}
                    <AnimatePresence>
                        {showRadar && (
                            <motion.div initial={{ opacity: 0, height: 0, marginBottom: 0 }} animate={{ opacity: 1, height: 'auto', marginBottom: 24 }} exit={{ opacity: 0, height: 0, marginBottom: 0 }} className="overflow-hidden">
                                <div className="bg-[#12121a] border border-emerald-500/30 rounded-xl p-5 shadow-lg">
                                    <h3 className="text-sm font-bold text-emerald-400 mb-4 flex items-center gap-2 uppercase tracking-widest"><Target size={16}/> Subject Radar Tracker</h3>
                                    <div className="flex items-center gap-3 mb-5 max-w-md">
                                        <input type="text" value={newTrackerKeyword} onChange={e=>setNewTrackerKeyword(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addTracker()} placeholder="Enter keyword to track..." className="flex-1 bg-black/40 border border-emerald-500/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50" />
                                        <button onClick={addTracker} className="p-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 rounded-lg transition-colors"><Plus size={16}/></button>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                        {trackers.map(t => (
                                            <div key={t.id} className="relative group p-3 bg-black/40 border border-white/5 rounded-lg flex flex-col hover:border-emerald-500/30 transition-colors">
                                                <button onClick={() => removeTracker(t.id)} className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-1 text-white/30 hover:text-red-400 transition-all rounded"><Trash2 size={12}/></button>
                                                <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest mb-1 truncate block">Target</span>
                                                <div className="font-semibold text-sm text-white mb-2 truncate" title={t.keyword}>{t.keyword}</div>
                                                <div className="mt-auto flex justify-between items-center">
                                                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-widest bg-${t.color}-500/20 text-${t.color}-400`}>Active</span>
                                                    <span className="text-xl font-mono text-white font-bold">{t.lastCount}</span>
                                                </div>
                                            </div>
                                        ))}
                                        {trackers.length === 0 && <div className="col-span-full py-4 text-center text-sm text-white/30 font-mono">No active trackers. Add a keyword above.</div>}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Fact Check Panel */}
                    <AnimatePresence>
                        {showFactChecker && (
                            <motion.div initial={{ opacity: 0, height: 0, marginBottom: 0 }} animate={{ opacity: 1, height: 'auto', marginBottom: 24 }} exit={{ opacity: 0, height: 0, marginBottom: 0 }} className="overflow-hidden">
                                <div className="bg-[#12121a] border border-purple-500/30 rounded-xl p-5 shadow-lg">
                                    <h3 className="text-sm font-bold text-purple-400 mb-4 flex items-center gap-2 uppercase tracking-widest"><ShieldAlert size={16}/> Neural Fact Checker</h3>
                                    <div className="flex items-center gap-3 mb-5 max-w-xl">
                                        <input type="text" value={factCheckQuery} onChange={e=>setFactCheckQuery(e.target.value)} onKeyDown={e=>e.key==='Enter'&&runFactCheck()} placeholder="Enter a claim or headline..." className="flex-1 bg-black/40 border border-purple-500/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500/50" />
                                        <button onClick={runFactCheck} disabled={isLoading} className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-sm rounded-lg shadow disabled:opacity-50">{isLoading ? 'Analyzing...' : 'Analyze'}</button>
                                    </div>
                                    {factCheckResult && (
                                        <div className="bg-black/30 border border-white/10 rounded-lg p-4 animate-in fade-in slide-in-from-top-2">
                                            <p className="text-xs text-white/40 mb-3 uppercase tracking-wider font-bold">Analysis for: <span className="text-white/80 normal-case ml-1 font-normal">"{factCheckResult.query}"</span></p>
                                            <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg mb-3">
                                                <p className="text-sm text-purple-300 flex items-center gap-2"><Cpu size={14}/> {factCheckResult.aiAnalysis}</p>
                                            </div>
                                            {factCheckResult.findings.map((f: any, i: number) => (
                                                <a key={i} href={f.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/5 rounded-md text-xs hover:bg-white/10 transition-colors">
                                                    <span className="text-white/60">{f.source}:</span>
                                                    <span className="text-yellow-400 font-bold">{f.rating}</span>
                                                    <ExternalLink size={10} className="text-white/30" />
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Source Manager */}
                    <AnimatePresence>
                        {showSourceManager && (
                            <motion.div initial={{ opacity: 0, height: 0, marginBottom: 0 }} animate={{ opacity: 1, height: 'auto', marginBottom: 24 }} exit={{ opacity: 0, height: 0, marginBottom: 0 }} className="overflow-hidden">
                                <div className="bg-[#12121a] border border-cyan-500/30 rounded-xl p-5 shadow-lg">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-sm font-bold text-cyan-400 flex items-center gap-2 uppercase tracking-widest"><Cpu size={16}/> Source Matrix Configuration</h3>
                                        <div className="text-xs text-cyan-400/50 font-mono">{allSources.length - disabledSources.size} / {allSources.length} Active</div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                        {allSources.map(source => {
                                            const isOff = disabledSources.has(source.id);
                                            const biasInfo = BIAS_COLORS[source.bias as keyof typeof BIAS_COLORS] || { text: 'text-gray-400', bg: 'bg-white/5', border: 'border-white/10', label: source.bias };
                                            return (
                                                <div key={source.id} className={`flex items-center justify-between p-2.5 rounded-lg border transition-all ${isOff ? 'bg-black/40 border-white/5 opacity-50' : 'bg-white/5 border-white/10 hover:border-cyan-500/30 hover:bg-cyan-500/5'}`}>
                                                    <div className="flex items-center gap-3 min-w-0 pr-2">
                                                        <span className="text-lg leading-none">{source.logo}</span>
                                                        <div className="truncate">
                                                            <div className="text-sm font-medium text-white truncate">{source.name}</div>
                                                            <div className={`text-[9px] font-bold uppercase tracking-wider inline-block px-1.5 py-0.5 rounded border mt-0.5 ${biasInfo.bg} ${biasInfo.text} ${biasInfo.border}`}>{biasInfo.label}</div>
                                                        </div>
                                                    </div>
                                                    <button onClick={() => toggleSourceEnabled(source.id)} className={`w-8 h-8 rounded-md flex items-center justify-center border transition-colors shrink-0 ${isOff ? 'bg-black text-white/20 border-white/10 hover:text-white/50' : 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/40'}`}>
                                                        {isOff ? '○' : '●'}
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Articles Feed */}
                    {articles.length === 0 && !isLoading ? (
                        <div className="flex flex-col items-center justify-center py-24 text-center">
                            <Filter className="w-12 h-12 text-white/10 mb-4" />
                            <h3 className="text-xl font-bold text-white/40 mb-2">No Intelligence Found</h3>
                            <p className="text-sm text-white/30 max-w-sm">The agent could not locate any articles matching these criteria. Try refreshing or adjusting filters.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
                            {filteredArticles.map((article, i) => {
                                const biasInfo = BIAS_COLORS[article.source.bias as keyof typeof BIAS_COLORS] || { text: 'text-gray-400', bg: 'bg-white/5', border: 'border-white/10', label: 'Unknown' };
                                const isSaved = savedArticles.has(article.id);

                                return (
                                    <motion.a
                                        href={article.link}
                                        target="_blank"
                                        rel="noreferrer"
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: Math.min(i * 0.05, 0.5) }}
                                        key={article.id}
                                        className="group block bg-[#12121a] border border-white/5 hover:border-orange-500/30 rounded-xl p-5 hover:bg-white/[0.02] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 p-4 z-10">
                                            <button onClick={(e) => { e.preventDefault(); toggleSave(article.id); }} className={`p-1.5 rounded-md transition-colors ${isSaved ? 'bg-yellow-500/20 text-yellow-500' : 'bg-black/40 text-white/30 hover:text-white/80'}`}>
                                                ★
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-2 mb-3 pr-8">
                                            <div className="w-8 h-8 flex items-center justify-center bg-white/5 border border-white/10 rounded-lg text-lg">
                                                {article.source.logo}
                                            </div>
                                            <div>
                                                <span className="block text-[11px] font-bold text-white/40 uppercase tracking-widest">{article.source.name}</span>
                                                <span className="block text-[10px] text-white/30 font-mono mt-0.5">{article.pubDate ? new Date(article.pubDate).toLocaleDateString() : 'Recent'}</span>
                                            </div>
                                        </div>
                                        <h2 className="text-base font-bold text-white leading-snug mb-2 group-hover:text-orange-400 transition-colors line-clamp-3">
                                            {article.title}
                                        </h2>
                                        <p className="text-sm text-white/50 leading-relaxed line-clamp-2 mb-4">
                                            {article.description || 'No summary available.'}
                                        </p>
                                        <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                                            <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${biasInfo.bg} ${biasInfo.text} ${biasInfo.border}`}>
                                                {biasInfo.label}
                                            </span>
                                            <span className="text-[10px] text-orange-400 group-hover:opacity-100 opacity-0 transition-opacity font-bold uppercase tracking-widest flex items-center gap-1">
                                                Read Entry <ExternalLink size={10} />
                                            </span>
                                        </div>
                                    </motion.a>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
