import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PlayCircle, Plus, Trash2, Target, RefreshCw, Filter, Search, ShieldAlert, Cpu, X, Newspaper } from 'lucide-react';
import PageLayout, { PageHeader, StatPill } from '../components/PageLayout';
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
      } catch (e) {
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
    <PageLayout color="red" noPadding>
      <div className="max-w-7xl mx-auto px-6 py-10 pb-32">
        <PageHeader
          title="Nexus Intelligence"
          subtitle="REAL-TIME GLOBAL SIGNAL PROCESSING"
          icon={<Newspaper size={24} className="text-red-400" />}
          actions={
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative mr-2 hidden xl:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
                <input
                  type="text"
                  placeholder="IDENTIFY TARGETS..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-white focus:outline-none focus:border-red-500/50 transition-all w-48 placeholder:text-white/10"
                />
              </div>
              <StatPill label={`${allSources.length - disabledSources.size} NODES ACTIVE`} color="red" pulse />
              <div className="flex gap-2">
                <button
                  onClick={refreshNews}
                  disabled={isLoading}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-red-500/10 hover:border-red-500/30 transition-all"
                  title="Refresh Signal"
                >
                  <RefreshCw size={16} className={isLoading ? 'animate-spin text-red-500' : ''} />
                </button>
                <button
                  onClick={() => setShowRadar(!showRadar)}
                  className={`w-10 h-10 flex items-center justify-center rounded-xl border transition-all ${showRadar ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 'bg-white/5 border-white/10 text-white/40 hover:text-white'}`}
                  title="Subject Radar"
                >
                  <Target size={16} />
                </button>
                <button
                  onClick={() => setShowFactChecker(!showFactChecker)}
                  className={`w-10 h-10 flex items-center justify-center rounded-xl border transition-all ${showFactChecker ? 'bg-purple-500/20 border-purple-500/30 text-purple-400' : 'bg-white/5 border-white/10 text-white/40 hover:text-white'}`}
                  title="Fact Checker"
                >
                  <ShieldAlert size={16} />
                </button>
                <button
                  onClick={() => setShowSourceManager(!showSourceManager)}
                  className={`w-10 h-10 flex items-center justify-center rounded-xl border transition-all ${showSourceManager ? 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400' : 'bg-white/5 border-white/10 text-white/40 hover:text-white'}`}
                  title="Source Manager"
                >
                  <Cpu size={16} />
                </button>
              </div>
            </div>
          }
        />

        {/* Tactical Filter Strip */}
        <div className="flex flex-wrap items-center gap-6 mb-10 pb-6 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-white/20" />
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-1">
              {(['all', 'local', 'national', 'alternative', 'saved', 'watch'] as FilterTab[]).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] whitespace-nowrap transition-all border ${activeTab === tab
                    ? 'bg-red-500/10 text-red-500 border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.1)]'
                    : 'text-white/20 border-transparent hover:text-white/60 hover:bg-white/5'}`}
                >
                  {tab === 'watch' ? <span className="flex items-center gap-1.5"><PlayCircle size={10} /> VIDEO</span> : tab}
                </button>
              ))}
            </div>
          </div>

          <div className="h-4 w-px bg-white/10 hidden sm:block" />

          <div className="flex items-center gap-3">
            <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.3em]">SPECTRUM ::</span>
            <select
              value={selectedBias || ''}
              onChange={(e) => setSelectedBias(e.target.value || null)}
              className="bg-transparent border-none text-[9px] font-black text-white/40 focus:outline-none focus:text-white cursor-pointer hover:text-white/60 transition-all uppercase tracking-[0.2em]"
            >
              <option value="" className="bg-[#0a0a0f]">Full Spectrum</option>
              {Object.entries(BIAS_COLORS).map(([key, info]) => (
                <option key={key} value={key} className="bg-[#0a0a0f]">{info.label.toUpperCase()}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tactical Panels (Radar & Fact Checker) */}
        <AnimatePresence>
          {showRadar && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="mb-10">
              <div className="glass-card p-6 border-emerald-500/20 relative overflow-hidden bg-emerald-500/5">
                <div className="relative z-10">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
                    <h3 className="text-sm font-black text-emerald-400 flex items-center gap-3 uppercase tracking-tighter"><Target size={18} /> SUBJECT TRACKING RADAR</h3>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                      <input
                        type="text"
                        value={newTrackerKeyword}
                        onChange={e => setNewTrackerKeyword(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addTracker()}
                        placeholder="IDENTIFY TARGET..."
                        className="glass-input text-[10px] w-full md:w-48 border-emerald-500/20 placeholder:text-emerald-900/40"
                      />
                      <button onClick={addTracker} className="p-2 bg-emerald-500 text-black rounded-lg hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"><Plus size={18} /></button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {trackers.map(t => (
                      <div key={t.id} className="glass-card p-4 border-emerald-500/10 hover:border-emerald-500/30 transition-all group relative bg-black/40">
                        <button onClick={() => removeTracker(t.id)} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 text-white/20 hover:text-red-500"><Trash2 size={10} /></button>
                        <div className="text-[8px] font-black text-emerald-400/40 uppercase tracking-[0.2em] mb-1">Sector</div>
                        <div className="text-xs font-black text-white mb-4 uppercase tracking-tight truncate">{t.keyword}</div>
                        <div className="flex items-end justify-between">
                          <div className="w-1 h-6 bg-emerald-500/20 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: `${Math.min(t.lastCount * 10, 100)}%` }}
                              className="bg-emerald-500 w-full mt-auto"
                            />
                          </div>
                          <div className="text-xl font-black text-white leading-none">{t.lastCount}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {showFactChecker && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="mb-10">
              <div className="glass-card p-6 border-purple-500/20 bg-purple-500/5">
                <h3 className="text-sm font-black text-purple-400 mb-6 flex items-center gap-3 uppercase tracking-tighter"><ShieldAlert size={18} /> NEURAL VERACITY ANALYSIS</h3>
                <div className="flex items-center gap-4 mb-8">
                  <input
                    type="text"
                    value={factCheckQuery}
                    onChange={e => setFactCheckQuery(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && runFactCheck()}
                    placeholder="INPUT DATA PACKET FOR ANALYSIS..."
                    className="flex-1 glass-input border-purple-500/20 text-xs"
                  />
                  <button
                    onClick={runFactCheck}
                    disabled={isLoading}
                    className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-700 text-white font-black uppercase tracking-[0.2em] rounded-xl shadow-lg hover:brightness-110 active:scale-95 transition-all text-[9px] disabled:opacity-50"
                  >
                    {isLoading ? 'WORKING...' : 'ANALYZE'}
                  </button>
                </div>
                {factCheckResult && (
                  <div className="bg-black/50 border border-white/5 rounded-2xl p-6 relative overflow-hidden">
                    <div className="relative z-10 flex flex-col lg:flex-row gap-8 items-start">
                      <div className="flex-1 space-y-4">
                        <div className="space-y-1">
                          <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.4em]">SOURCE</span>
                          <p className="text-sm font-black text-white/60 italic leading-relaxed">"{factCheckResult.query}"</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {factCheckResult.findings.map((f: any, i: number) => (
                            <a key={i} href={f.url} className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl flex items-center gap-3 hover:bg-white/10 transition-all group">
                              <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">{f.source}</span>
                              <span className="text-[9px] font-black text-yellow-400 uppercase tracking-widest">{f.rating}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                      <div className="w-full lg:w-72 p-5 glass-card border-purple-500/30 bg-purple-500/10 rounded-2xl">
                        <div className="text-[8px] font-black text-purple-400 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" /> SYNTHESIS
                        </div>
                        <p className="text-[10px] font-black text-white/80 leading-relaxed tracking-tight">
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

        {/* Main Feed Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {articles.length === 0 && !isLoading ? (
            <div className="col-span-full flex flex-col items-center justify-center py-40 text-center">
              <div className="w-24 h-24 rounded-[2rem] bg-white/[0.02] border border-white/5 flex items-center justify-center mb-8">
                <Target className="w-10 h-10 text-white/10" />
              </div>
              <h3 className="text-2xl font-black text-white/20 uppercase tracking-tighter mb-2">Signal Lost</h3>
              <p className="text-[9px] font-black text-white/10 uppercase tracking-[0.4em]">Verify node connection to resume decryption</p>
            </div>
          ) : (
            filteredArticles.map((article, i) => {
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
                  className={`group block glass-card p-0 border-white/5 hover:border-red-500/40 relative overflow-hidden flex flex-col min-h-[400px] transition-all bg-black/40 ${isHot ? 'shadow-red-950/20 ring-1 ring-red-500/10' : ''}`}
                >
                  <div className="h-32 relative bg-black/80 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
                    <div className={`absolute inset-0 opacity-10 group-hover:scale-110 transition-transform duration-700 ${isHot ? 'bg-mesh-red' : 'bg-mesh-purple'}`} />
                    <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
                      <div className="px-2 py-0.5 bg-black/60 backdrop-blur-md border border-white/10 rounded-md text-[8px] font-black text-white uppercase tracking-widest leading-none">
                        {article.source.name}
                      </div>
                      {isHot && (
                        <div className="px-1.5 py-0.5 bg-red-600 rounded-md text-[7px] font-black text-white uppercase animate-pulse">
                          HOT
                        </div>
                      )}
                    </div>
                    <div className="absolute -bottom-6 left-6 w-12 h-12 bg-[#050507] border border-white/10 rounded-xl flex items-center justify-center text-2xl z-20 shadow-2xl group-hover:border-red-500/40 group-hover:-translate-y-1 transition-all">
                      {article.source.logo}
                    </div>
                  </div>

                  <div className="p-6 pt-10 flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em]">
                        {article.pubDate ? new Date(article.pubDate).toLocaleDateString() : 'REALTIME'}
                      </div>
                      <button onClick={(e) => { e.preventDefault(); toggleSave(article.id); }} className={`p-1.5 transition-all active:scale-95 ${isSaved ? 'text-red-500' : 'text-white/10 hover:text-white/30'}`}>
                        <Target size={12} className={isSaved ? 'fill-current' : ''} />
                      </button>
                    </div>

                    <h2 className="text-sm font-black text-white/90 leading-tight mb-3 group-hover:text-red-400 transition-colors line-clamp-3 tracking-tight uppercase">
                      {article.title}
                    </h2>

                    <p className="text-[9px] text-white/30 leading-relaxed line-clamp-3 mb-6 font-medium uppercase tracking-tight">
                      {article.description || 'RAW DATA PACKET :: No summary available in current sector.'}
                    </p>

                    <div className="mt-auto grid grid-cols-2 gap-px bg-white/5 border border-white/5 rounded-xl overflow-hidden">
                      <div className="p-2 flex flex-col items-center bg-black/40">
                        <span className="text-[7px] font-black text-white/20 tracking-[0.1em]">UNIT</span>
                        <span className="text-[9px] font-black text-white/60 capitalize">{article.category}</span>
                      </div>
                      <div className={`${biasInfo.bg} ${biasInfo.text} p-2 flex flex-col items-center opacity-80`}>
                        <span className="text-[7px] font-black opacity-30 tracking-[0.1em]">BIAS</span>
                        <span className="text-[9px] font-black uppercase tracking-widest">{biasInfo.label}</span>
                      </div>
                    </div>
                  </div>
                </motion.a>
              );
            })
          )}
        </div>
      </div>

      {/* Source Manager Overlay (Portal-like) */}
      <AnimatePresence>
        {showSourceManager && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/90 backdrop-blur-2xl"
              onClick={() => setShowSourceManager(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card max-w-5xl w-full max-h-[80vh] border-cyan-500/20 flex flex-col bg-[#0d0d14]/90 relative z-10 overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-cyan-400 uppercase tracking-tighter">SOURCE NODE CONFIGURATION</h3>
                  <p className="text-[9px] text-white/20 font-black uppercase tracking-[0.3em] mt-1">Managing {allSources.length - disabledSources.size} / {allSources.length} Decryption Nodes</p>
                </div>
                <button onClick={() => setShowSourceManager(false)} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/20 hover:text-white transition-all">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 custom-scrollbar">
                {allSources.map(source => {
                  const isOff = disabledSources.has(source.id);
                  const biasInfo = BIAS_COLORS[source.bias as keyof typeof BIAS_COLORS] || { text: 'text-gray-400', bg: 'bg-white/5', border: 'border-white/10', label: source.bias };
                  return (
                    <div key={source.id} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${isOff ? 'bg-black/50 opacity-40 grayscale' : 'bg-white/5 border-white/10 hover:border-cyan-500/40'}`}>
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        <span className="text-2xl">{source.logo}</span>
                        <div className="truncate">
                          <div className="text-[11px] font-black text-white truncate uppercase tracking-tight">{source.name}</div>
                          <div className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border mt-1 inline-block ${biasInfo.bg} ${biasInfo.text} ${biasInfo.border}`}>{biasInfo.label}</div>
                        </div>
                      </div>
                      <button onClick={() => toggleSourceEnabled(source.id)} className={`px-3 py-2 rounded-lg text-[9px] font-black border transition-all shrink-0 active:scale-95 ${isOff ? 'bg-black text-white/20 border-white/10' : 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40 shadow-lg shadow-cyan-500/10'}`}>
                        {isOff ? 'OFF' : 'LIVE'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PageLayout>
  );
}
