import { useState, useEffect, useRef, useCallback } from 'react';
import { m, AnimatePresence } from 'motion/react';
import { Plus, Target, RefreshCw, ShieldAlert, Cpu, X, Send } from 'lucide-react';
import PageLayout from '../components/PageLayout';
import {
  NEWS_SOURCES,
  BIAS_COLORS,
  type NewsArticle,
  fetchAllNews,
  type SubjectTracker,
  countTrackerMatches
} from '../services/newsService';

type FilterTab = 'all' | 'local' | 'national' | 'alternative' | 'saved' | 'watch';

// ─── Pundit prompts ───────────────────────────────────────────────────────────
const REX_PROMPT = `You are Rex, a blunt conservative commentator. Respond in 3-5 sentences max. Cite at least one real statistic, law, or named source. No emotional language. Lead with your strongest factual point. Label your source type at the end like [GOV DATA] [ECONOMIC] [LEGAL] [THINK TANK] [ACADEMIC].`;
const VAL_PROMPT = `You are Val, a direct progressive analyst. Respond in 3-5 sentences max. Cite at least one real study, report, or named institution. No emotional language. Lead with your strongest evidence. Label your source type at the end like [GOV DATA] [ECONOMIC] [LEGAL] [THINK TANK] [ACADEMIC].`;

// ─── POV Engine ───────────────────────────────────────────────────────────────
function PovEngine({ article }: { article: NewsArticle | null }) {
  const [rexText, setRexText]     = useState('');
  const [valText, setValText]     = useState('');
  const [rexBusy, setRexBusy]     = useState(false);
  const [valBusy, setValBusy]     = useState(false);
  const [followUp, setFollowUp]   = useState('');
  const [submitting, setSubmitting] = useState(false);
  const prevId = useRef<string | null>(null);

  const fire = useCallback(async (pundit: 'rex' | 'val', prompt: string, system: string) => {
    const setB = pundit === 'rex' ? setRexBusy : setValBusy;
    const setT = pundit === 'rex' ? setRexText  : setValText;
    setB(true); setT('');
    try {
      const r = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/debate`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt, systemPrompt: system }) });
      const d = await r.json();
      setT(r.ok ? (d.text || d.response || 'No response.') : 'API error.');
    } catch { setT('Could not reach AI.'); }
    finally { setB(false); }
  }, []);

  useEffect(() => {
    if (!article) return;
    if (article.id === prevId.current) return;
    prevId.current = article.id;
    const seed = `Headline: ${article.title}\n\nSummary: ${article.description || ''}`;
    fire('rex', seed, REX_PROMPT);
    fire('val', seed, VAL_PROMPT);
  }, [article, fire]);

  const ask = async () => {
    const q = followUp.trim();
    if (!q || submitting) return;
    setFollowUp(''); setSubmitting(true);
    const p = `Re: "${article?.title}" — ${q}`;
    await Promise.allSettled([fire('rex', p, REX_PROMPT), fire('val', p, VAL_PROMPT)]);
    setSubmitting(false);
  };

  const Dots = ({ color }: { color: string }) => (
    <div className="flex gap-1 items-center py-1">
      {[0,1,2].map(i => (
        <m.div key={i} className={`w-1 h-1 rounded-full ${color}`}
          animate={{ opacity: [0.2,1,0.2] }} transition={{ duration: 0.9, repeat: Infinity, delay: i*0.2 }} />
      ))}
    </div>
  );

  if (!article) return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6 text-center">
      <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-2xl">⚖️</div>
      <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Select a story</p>
      <p className="text-[9px] text-white/10 uppercase tracking-widest">or drop text in the radar</p>
    </div>
  );

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Article context */}
      <div className="shrink-0 px-3 pt-3 pb-2 border-b border-white/5">
        <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-0.5">{article.source.name}</p>
        <p className="text-[10px] font-black text-white/70 leading-snug line-clamp-2">{article.title}</p>
      </div>
      {/* Dual columns */}
      <div className="flex-1 grid grid-cols-2 divide-x divide-white/5 min-h-0 overflow-hidden">
        <div className="overflow-y-auto custom-scrollbar p-3 space-y-3" style={{ background: 'rgba(127,29,29,0.05)' }}>
          <div className="flex items-center gap-1.5">
            <span className="text-[8px]">🔴</span>
            <span className="text-[8px] font-black text-red-400 uppercase tracking-widest">Rex</span>
            {rexBusy && <Dots color="bg-red-400" />}
          </div>
          {rexText && <p className="text-[10px] text-white/75 leading-relaxed">{rexText}</p>}
        </div>
        <div className="overflow-y-auto custom-scrollbar p-3 space-y-3" style={{ background: 'rgba(29,78,216,0.05)' }}>
          <div className="flex items-center gap-1.5">
            <span className="text-[8px]">🔵</span>
            <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest">Val</span>
            {valBusy && <Dots color="bg-blue-400" />}
          </div>
          {valText && <p className="text-[10px] text-white/75 leading-relaxed">{valText}</p>}
        </div>
      </div>
      {/* Follow-up */}
      <div className="shrink-0 border-t border-white/5 p-2">
        <div className="flex gap-1.5">
          <input value={followUp} onChange={e => setFollowUp(e.target.value)} onKeyDown={e => e.key === 'Enter' && ask()}
            placeholder="Push back on both..." disabled={submitting || rexBusy || valBusy}
            className="flex-1 glass-input text-[10px] py-1.5 border-white/10 placeholder:text-white/10 disabled:opacity-40" />
          <button onClick={ask} disabled={!followUp.trim() || submitting || rexBusy || valBusy}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 text-white/30 hover:text-white disabled:opacity-30 transition-all">
            <Send size={11} />
          </button>
        </div>
      </div>
    </div>
  );
}

export function News() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [savedArticles, setSavedArticles] = useState<Set<string>>(new Set());
  const [radarInput, setRadarInput] = useState('');
  const [selectedBias, setSelectedBias] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fact Checker Panel
  const [showFactChecker, setShowFactChecker] = useState(false);
  const [factCheckQuery, setFactCheckQuery] = useState('');
  const [factCheckResult, setFactCheckResult] = useState<any>(null);
  const [isFactChecking, setIsFactChecking] = useState(false);

  // Subject Radar
  const [trackers, setTrackers] = useState<SubjectTracker[]>([]);
  const [newTrackerKeyword, setNewTrackerKeyword] = useState('');

  // Source Management
  const [showSourceManager, setShowSourceManager] = useState(false);
  const [customSources] = useState<any[]>([]);
  const [disabledSources, setDisabledSources] = useState<Set<string>>(new Set());

  // Article reader modal
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);


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
      const data = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/news/refresh`, { method: 'POST' });
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

    return true;
  });

  const runFactCheck = async () => {
    if (!factCheckQuery.trim()) return;
    setIsFactChecking(true);
    setFactCheckResult(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/brain-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Fact-check the following claim or headline. Assess its accuracy, provide context, identify potential bias, and give a clear rating (True / Mostly True / Misleading / False / Unverifiable). Claim: "${factCheckQuery}"`,
          systemPrompt: 'You are a professional fact-checker and media analyst. Be concise, objective, and cite your reasoning.'
        })
      });
      const data = await res.json();
      const aiAnalysis = res.ok ? (data.text || data.response || JSON.stringify(data)) : 'LLM unavailable — ensure Ollama or LM Studio is running.';
      setFactCheckResult({
        query: factCheckQuery,
        status: 'analyzed',
        findings: [{ source: 'Nexus AI', rating: 'Analyzed', url: '#' }],
        aiAnalysis
      });
    } catch {
      setFactCheckResult({
        query: factCheckQuery,
        status: 'error',
        findings: [{ source: 'Nexus AI', rating: 'Error', url: '#' }],
        aiAnalysis: 'Failed to reach the AI inference engine. Ensure Ollama or LM Studio is running.'
      });
    } finally {
      setIsFactChecking(false);
    }
  };

  const toggleSave = (id: string) => {
    setSavedArticles(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const timeAgo = (dateStr: string): string => {
    if (!dateStr) return 'REALTIME';
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  const isRecent = (dateStr: string) => {
    if (!dateStr) return false;
    return Date.now() - new Date(dateStr).getTime() < 2 * 60 * 60 * 1000;
  };

  const LEFT_BIASES   = new Set(['left', 'left-center', 'center-left']);
  const RIGHT_BIASES  = new Set(['right', 'right-center', 'far-right', 'right-libertarian', 'center-right']);
  const CENTER_BIASES = new Set(['center']);

  const leftArticles   = filteredArticles.filter(a => LEFT_BIASES.has(a.source.bias)).slice(0, 3);
  const rightArticles  = filteredArticles.filter(a => RIGHT_BIASES.has(a.source.bias)).slice(0, 3);
  // Center hero: prefer true-center, fall back to left-leaning, then anything with an image
  const centerArticle  = filteredArticles.find(a => CENTER_BIASES.has(a.source.bias) && a.image)
                      || filteredArticles.find(a => CENTER_BIASES.has(a.source.bias))
                      || filteredArticles.find(a => LEFT_BIASES.has(a.source.bias) && a.image)
                      || filteredArticles.find(a => a.image)
                      || filteredArticles[0];
  const streamArticles = filteredArticles.filter(a => a !== centerArticle);

  return (
    <PageLayout color="red" noPadding>

      {/* BREAKING TICKER */}
      <div className="w-full overflow-hidden shrink-0"
        style={{ height: '36px', background: '#0a0a0f', borderBottom: '2px solid #cc0000' }}>
        <div className="flex items-center h-full">
          <div className="shrink-0 flex items-center gap-2 px-4 h-full z-10" style={{ background: '#cc0000', minWidth: '100px' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span style={{ fontSize: '9px', fontWeight: 900, color: '#fff', letterSpacing: '0.2em', textTransform: 'uppercase' }}>BREAKING</span>
          </div>
          <div className="overflow-hidden flex-1 h-full flex items-center">
            <div className="ticker-track">
              {[...filteredArticles, ...filteredArticles].map((a, i) => (
                <button key={`tick-${i}`} onClick={() => setSelectedArticle(a)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '0 20px', fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.65)', whiteSpace: 'nowrap', background: 'none', border: 'none', cursor: 'pointer' }}>
                  <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '7px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em' }}>{a.source.name}</span>
                  {a.title}
                  <span style={{ color: 'rgba(255,255,255,0.15)', margin: '0 4px' }}>·</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* MASTHEAD LINE */}
      <div className="shrink-0 flex items-center justify-between px-4"
        style={{ height: '22px', borderBottom: '3px double rgba(255,255,255,0.12)', background: '#0a0a0f' }}>
        <span style={{ fontSize: '7px', fontWeight: 900, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.3em' }}>NEXUS INTELLIGENCE</span>
        <span style={{ fontSize: '7px', color: 'rgba(255,255,255,0.15)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).toUpperCase()}
        </span>
        <span style={{ fontSize: '7px', fontWeight: 900, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.3em' }}>{filteredArticles.length} SIGNALS</span>
      </div>

      {/* FRONT PAGE: LEFT / CENTER / RIGHT */}
      <div className="shrink-0 grid" style={{ gridTemplateColumns: '1fr 2.2fr 1fr', height: '300px', borderBottom: '1px solid rgba(255,255,255,0.1)', background: '#0a0a0f' }}>

        {/* LEFT COLUMN */}
        <div className="flex flex-col overflow-hidden" style={{ borderRight: '1px solid rgba(255,255,255,0.08)', borderLeft: '2px solid #2563eb' }}>
          <div style={{ padding: '5px 10px 4px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ display: 'inline-block', width: '8px', height: '1px', background: '#2563eb' }} />
            <span style={{ fontSize: '7px', fontWeight: 900, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.3em' }}>LEFT SPECTRUM</span>
          </div>
          {leftArticles.map(a => (
            <button key={a.id} onClick={() => setSelectedArticle(a)} className="flex-1 text-left"
              style={{ padding: '8px 10px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: selectedArticle?.id === a.id ? 'rgba(37,99,235,0.08)' : 'transparent', cursor: 'pointer', outline: 'none', fontFamily: 'inherit' }}>
              <div style={{ fontSize: '7px', fontWeight: 900, color: 'rgba(59,130,246,0.4)', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '3px' }}>{a.source.name}</div>
              <p style={{ fontSize: '10px', fontWeight: 800, color: 'rgba(255,255,255,0.82)', lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', margin: 0 }}>{a.title}</p>
              <div style={{ fontSize: '7px', color: 'rgba(255,255,255,0.2)', marginTop: '3px' }}>{timeAgo(a.pubDate || '')}</div>
            </button>
          ))}
          {leftArticles.length === 0 && <div className="flex-1 flex items-center justify-center"><span style={{ fontSize: '7px', color: 'rgba(255,255,255,0.1)', textTransform: 'uppercase', letterSpacing: '0.2em' }}>NO SIGNALS</span></div>}
        </div>

        {/* CENTER HERO */}
        {centerArticle ? (
          <button onClick={() => setSelectedArticle(centerArticle)} className="relative overflow-hidden group text-left w-full h-full"
            style={{ borderRight: '1px solid rgba(255,255,255,0.08)', background: '#060608', cursor: 'pointer', outline: 'none', padding: 0 }}>
            {centerArticle.image
              ? <img src={centerArticle.image} alt="" className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-[1.02] transition-transform duration-500" style={{ filter: 'brightness(0.7) contrast(1.1)' }} />
              : <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg,#111118 0%,#0a0a0f 100%)' }} />
            }
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top,rgba(0,0,0,0.96) 0%,rgba(0,0,0,0.5) 45%,rgba(0,0,0,0.1) 100%)' }} />
            {(centerArticle.title.toLowerCase().includes('breaking') || (centerArticle as any).priority) && (
              <div className="absolute top-3 left-3 z-10 animate-pulse" style={{ background: '#cc0000', padding: '2px 8px' }}>
                <span style={{ fontSize: '7px', fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.2em' }}>BREAKING</span>
              </div>
            )}
            <div className="absolute top-3 right-3 z-10" style={{ background: 'rgba(0,0,0,0.7)', padding: '3px 8px', border: '1px solid rgba(255,255,255,0.12)' }}>
              <span style={{ fontSize: '7px', fontWeight: 900, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>{centerArticle.source.name}</span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 z-10" style={{ padding: '16px 18px 14px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#fff', lineHeight: 1.2, letterSpacing: '-0.02em', margin: '0 0 6px', textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>{centerArticle.title}</h2>
              {centerArticle.description && <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', margin: '0 0 5px' }}>{centerArticle.description}</p>}
              <div style={{ fontSize: '7px', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700 }}>{timeAgo(centerArticle.pubDate || '')}</div>
            </div>
          </button>
        ) : (
          <div className="flex items-center justify-center" style={{ borderRight: '1px solid rgba(255,255,255,0.08)', background: '#060608' }}>
            <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.1)', textTransform: 'uppercase', letterSpacing: '0.2em' }}>NO CENTER SIGNAL</span>
          </div>
        )}

        {/* RIGHT COLUMN */}
        <div className="flex flex-col overflow-hidden" style={{ borderRight: '2px solid #dc2626' }}>
          <div style={{ padding: '5px 10px 4px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
            <span style={{ fontSize: '7px', fontWeight: 900, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.3em' }}>RIGHT SPECTRUM</span>
            <span style={{ display: 'inline-block', width: '8px', height: '1px', background: '#dc2626' }} />
          </div>
          {rightArticles.map(a => (
            <button key={a.id} onClick={() => setSelectedArticle(a)} className="flex-1 text-right"
              style={{ padding: '8px 10px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: selectedArticle?.id === a.id ? 'rgba(220,38,38,0.08)' : 'transparent', cursor: 'pointer', outline: 'none', fontFamily: 'inherit' }}>
              <div style={{ fontSize: '7px', fontWeight: 900, color: 'rgba(239,68,68,0.4)', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '3px' }}>{a.source.name}</div>
              <p style={{ fontSize: '10px', fontWeight: 800, color: 'rgba(255,255,255,0.82)', lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', margin: 0 }}>{a.title}</p>
              <div style={{ fontSize: '7px', color: 'rgba(255,255,255,0.2)', marginTop: '3px' }}>{timeAgo(a.pubDate || '')}</div>
            </button>
          ))}
          {rightArticles.length === 0 && <div className="flex-1 flex items-center justify-center"><span style={{ fontSize: '7px', color: 'rgba(255,255,255,0.1)', textTransform: 'uppercase', letterSpacing: '0.2em' }}>NO SIGNALS</span></div>}
        </div>
      </div>

      {/* SECTION RULE */}
      <div className="shrink-0 flex items-center justify-center gap-6"
        style={{ height: '18px', background: '#0a0a0f', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        {['NATIONAL','POLITICS','ECONOMY','ANALYSIS','OPINION'].map(label => (
          <span key={label} style={{ fontSize: '6px', fontWeight: 900, color: 'rgba(255,255,255,0.15)', textTransform: 'uppercase', letterSpacing: '0.3em' }}>{label}</span>
        ))}
      </div>

      {/* THREE-COLUMN WAR ROOM */}
      <div className="flex-1 grid min-h-0 overflow-hidden" style={{ gridTemplateColumns: '220px 1fr 340px', background: '#0a0a0f' }}>

        {/* SIGNAL RADAR */}
        <div className="flex flex-col overflow-hidden" style={{ borderRight: '1px solid rgba(255,255,255,0.08)', background: '#08080c' }}>
          <div style={{ padding: '6px 10px 5px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '7px', fontWeight: 900, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.3em' }}>— SIGNAL RADAR</span>
            <button onClick={refreshNews} disabled={isLoading} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.2)', padding: '2px' }}>
              <RefreshCw size={9} className={isLoading ? 'animate-spin' : ''} style={{ color: isLoading ? '#10b981' : undefined }} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar" style={{ padding: '10px' }}>
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '6px', fontWeight: 900, color: 'rgba(255,255,255,0.18)', textTransform: 'uppercase', letterSpacing: '0.3em', marginBottom: '5px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '6px' }}>DROP ANYTHING</div>
              <div style={{ display: 'flex', gap: '4px' }}>
                <input value={radarInput} onChange={e => setRadarInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && radarInput.trim()) { setSelectedArticle({ id: 'manual-' + Date.now(), title: radarInput.trim(), description: '', link: '#', pubDate: new Date().toISOString(), source: { id: 'manual', name: 'Manual Input', logo: '', bias: 'center' }, category: 'national' }); setRadarInput(''); } }}
                  placeholder="Quote, idea, headline..."
                  style={{ flex: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', fontSize: '9px', padding: '5px 7px', outline: 'none', fontFamily: 'inherit' }} />
                <button onClick={() => { if (radarInput.trim()) { setSelectedArticle({ id: 'manual-' + Date.now(), title: radarInput.trim(), description: '', link: '#', pubDate: new Date().toISOString(), source: { id: 'manual', name: 'Manual Input', logo: '', bias: 'center' }, category: 'national' }); setRadarInput(''); } }}
                  style={{ width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', color: 'rgba(255,255,255,0.3)' }}>
                  <Send size={9} />
                </button>
              </div>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '6px', fontWeight: 900, color: 'rgba(255,255,255,0.18)', textTransform: 'uppercase', letterSpacing: '0.3em', marginBottom: '5px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '6px' }}>TRACK KEYWORDS</div>
              <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
                <input value={newTrackerKeyword} onChange={e => setNewTrackerKeyword(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTracker()} placeholder="Add keyword..."
                  style={{ flex: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', fontSize: '9px', padding: '5px 7px', outline: 'none', fontFamily: 'inherit' }} />
                <button onClick={addTracker} style={{ width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', cursor: 'pointer', color: '#10b981' }}>
                  <Plus size={9} />
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {trackers.map(t => (
                  <div key={t.id} className="group" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                        <span style={{ fontSize: '8px', fontWeight: 900, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.keyword}</span>
                        <span style={{ fontSize: '8px', fontWeight: 900, color: 'rgba(255,255,255,0.25)' }}>{t.lastCount}</span>
                      </div>
                      <div style={{ height: '2px', background: 'rgba(255,255,255,0.05)' }}>
                        <div style={{ height: '100%', background: 'rgba(16,185,129,0.5)', width: Math.min(t.lastCount * 8, 100) + '%' }} />
                      </div>
                    </div>
                    <button onClick={() => removeTracker(t.id)} className="opacity-0 group-hover:opacity-100"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.2)', padding: 0, flexShrink: 0 }}>
                      <X size={8} />
                    </button>
                  </div>
                ))}
                {trackers.length === 0 && <span style={{ fontSize: '7px', color: 'rgba(255,255,255,0.1)', textTransform: 'uppercase', letterSpacing: '0.2em' }}>No trackers</span>}
              </div>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '6px', fontWeight: 900, color: 'rgba(255,255,255,0.18)', textTransform: 'uppercase', letterSpacing: '0.3em', marginBottom: '5px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '6px' }}>BIAS DISTRIBUTION</div>
              {(() => {
                const l = filteredArticles.filter(a => LEFT_BIASES.has(a.source.bias)).length;
                const r = filteredArticles.filter(a => RIGHT_BIASES.has(a.source.bias)).length;
                const c = filteredArticles.length - l - r;
                const total = filteredArticles.length || 1;
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    {[{label:'LEFT',count:l,color:'rgba(37,99,235,0.6)'},{label:'CENTER',count:c,color:'rgba(255,255,255,0.25)'},{label:'RIGHT',count:r,color:'rgba(220,38,38,0.6)'}].map(({label,count,color}) => (
                      <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '6px', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', width: '38px', flexShrink: 0 }}>{label}</span>
                        <div style={{ flex: 1, height: '2px', background: 'rgba(255,255,255,0.05)' }}>
                          <div style={{ height: '100%', background: color, width: (count/total*100) + '%' }} />
                        </div>
                        <span style={{ fontSize: '7px', color: 'rgba(255,255,255,0.2)', width: '16px', textAlign: 'right' }}>{count}</span>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '6px', fontWeight: 900, color: 'rgba(255,255,255,0.18)', textTransform: 'uppercase', letterSpacing: '0.3em', marginBottom: '5px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '6px' }}>SOURCE NODES</div>
              <button onClick={() => setShowSourceManager(true)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 8px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', fontFamily: 'inherit' }}>
                <span style={{ fontSize: '7px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em' }}>{allSources.length - disabledSources.size} / {allSources.length} ACTIVE</span>
                <Cpu size={9} />
              </button>
            </div>
            <div>
              <div style={{ fontSize: '6px', fontWeight: 900, color: 'rgba(255,255,255,0.18)', textTransform: 'uppercase', letterSpacing: '0.3em', marginBottom: '5px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '6px' }}>FILTER</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {(['all','local','national','alternative','saved'] as FilterTab[]).map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    style={{ padding: '3px 8px', fontSize: '7px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', border: activeTab === tab ? '1px solid rgba(204,0,0,0.4)' : '1px solid rgba(255,255,255,0.07)', background: activeTab === tab ? 'rgba(204,0,0,0.1)' : 'transparent', color: activeTab === tab ? '#f87171' : 'rgba(255,255,255,0.25)', cursor: 'pointer', fontFamily: 'inherit' }}>
                    {tab.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ARTICLE STREAM */}
        <div className="flex flex-col overflow-hidden" style={{ borderRight: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '12px', padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.08)', background: '#08080c' }}>
            <span style={{ fontSize: '7px', fontWeight: 900, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.3em' }}>— ARTICLE STREAM</span>
            <span style={{ fontSize: '7px', color: 'rgba(255,255,255,0.1)' }}>{filteredArticles.length} SIGNALS</span>
            <div style={{ flex: 1 }} />
            <select value={selectedBias || ''} onChange={e => setSelectedBias(e.target.value || null)}
              style={{ background: 'transparent', border: 'none', fontSize: '7px', fontWeight: 900, color: 'rgba(255,255,255,0.25)', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.15em', outline: 'none', fontFamily: 'inherit' }}>
              <option value="" style={{ background: '#0a0a0f' }}>FULL SPECTRUM</option>
              {Object.entries(BIAS_COLORS).map(([key, info]) => (
                <option key={key} value={key} style={{ background: '#0a0a0f' }}>{info.label.toUpperCase()}</option>
              ))}
            </select>
            <button onClick={() => setShowFactChecker(!showFactChecker)}
              style={{ width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: showFactChecker ? 'rgba(168,85,247,0.15)' : 'transparent', border: showFactChecker ? '1px solid rgba(168,85,247,0.3)' : '1px solid rgba(255,255,255,0.07)', cursor: 'pointer', color: showFactChecker ? '#a855f7' : 'rgba(255,255,255,0.25)' }}>
              <ShieldAlert size={10} />
            </button>
          </div>
          <AnimatePresence>
            {showFactChecker && (
              <m.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                style={{ flexShrink: 0, borderBottom: '1px solid rgba(168,85,247,0.2)', background: 'rgba(168,85,247,0.04)', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px' }}>
                  <span style={{ fontSize: '6px', fontWeight: 900, color: 'rgba(168,85,247,0.6)', textTransform: 'uppercase', letterSpacing: '0.25em', whiteSpace: 'nowrap' }}>FACT CHECK</span>
                  <input value={factCheckQuery} onChange={e => setFactCheckQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && runFactCheck()} placeholder="Enter claim or headline..."
                    style={{ flex: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(168,85,247,0.2)', color: 'rgba(255,255,255,0.7)', fontSize: '9px', padding: '4px 7px', outline: 'none', fontFamily: 'inherit' }} />
                  <button onClick={runFactCheck} disabled={isFactChecking}
                    style={{ padding: '4px 10px', background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.3)', color: '#a855f7', fontSize: '7px', fontWeight: 900, textTransform: 'uppercase', cursor: isFactChecking ? 'not-allowed' : 'pointer', opacity: isFactChecking ? 0.5 : 1, fontFamily: 'inherit' }}>
                    {isFactChecking ? '...' : 'CHECK'}
                  </button>
                </div>
                {factCheckResult && <div style={{ padding: '0 12px 8px' }}><p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.5, margin: 0 }}>{factCheckResult.aiAnalysis}</p></div>}
              </m.div>
            )}
          </AnimatePresence>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {streamArticles.length === 0 && !isLoading && (
              <div className="flex flex-col items-center justify-center h-full gap-2">
                <Target className="w-8 h-8" style={{ color: 'rgba(255,255,255,0.05)' }} />
                <span style={{ fontSize: '7px', color: 'rgba(255,255,255,0.08)', textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: 900 }}>SIGNAL LOST</span>
              </div>
            )}
            {streamArticles.map(article => {
              const isLeft  = LEFT_BIASES.has(article.source.bias);
              const isRight = RIGHT_BIASES.has(article.source.bias);
              const ruleColor = isLeft ? '#2563eb' : isRight ? '#dc2626' : 'rgba(255,255,255,0.15)';
              const isSelected = selectedArticle?.id === article.id;
              return (
                <div key={article.id} onClick={() => setSelectedArticle(article)}
                  style={{ display: 'flex', alignItems: 'stretch', borderBottom: '1px solid rgba(255,255,255,0.04)', borderLeft: '2px solid ' + ruleColor, background: isSelected ? 'rgba(255,255,255,0.03)' : 'transparent', cursor: 'pointer' }}
                  onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)'; }}
                  onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                  <div style={{ flexShrink: 0, width: '72px', padding: '7px 8px 7px 10px', borderRight: '1px solid rgba(255,255,255,0.04)' }}>
                    <div style={{ fontSize: '6px', fontWeight: 900, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.12em', lineHeight: 1.3, wordBreak: 'break-word' }}>{article.source.name}</div>
                  </div>
                  <div style={{ flex: 1, padding: '7px 10px', minWidth: 0 }}>
                    <p style={{ fontSize: '11px', fontWeight: 800, color: isSelected ? '#fff' : 'rgba(255,255,255,0.75)', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '-0.01em', margin: 0 }}>{article.title}</p>
                  </div>
                  <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 10px 7px 6px' }}>
                    {isRecent(article.pubDate || '') && <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#cc0000', flexShrink: 0, display: 'inline-block' }} />}
                    <span style={{ fontSize: '7px', color: 'rgba(255,255,255,0.18)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>{timeAgo(article.pubDate || '')}</span>
                    <button onClick={e => { e.stopPropagation(); toggleSave(article.id); }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: savedArticles.has(article.id) ? '#cc0000' : 'rgba(255,255,255,0.1)', padding: 0, flexShrink: 0 }}>
                      <Target size={9} style={{ fill: savedArticles.has(article.id) ? 'currentColor' : 'none' }} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* POV ENGINE */}
        <div className="flex flex-col overflow-hidden" style={{ background: '#08080c' }}>
          <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 12px 5px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <span style={{ fontSize: '7px', fontWeight: 900, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.3em' }}>— POV ENGINE</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#dc2626', display: 'inline-block' }} />
                <span style={{ fontSize: '7px', fontWeight: 900, color: 'rgba(239,68,68,0.6)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>REX</span>
              </div>
              <span style={{ width: '1px', height: '10px', background: 'rgba(255,255,255,0.1)', display: 'inline-block' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#2563eb', display: 'inline-block' }} />
                <span style={{ fontSize: '7px', fontWeight: 900, color: 'rgba(96,165,250,0.6)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>VAL</span>
              </div>
            </div>
          </div>
          <PovEngine article={selectedArticle} />
        </div>

      </div>

      {/* SOURCE MANAGER OVERLAY */}
      <AnimatePresence>
        {showSourceManager && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(8px)' }}
              onClick={() => setShowSourceManager(false)} />
            <m.div initial={{ scale: 0.97, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.97, opacity: 0 }}
              className="relative z-10 flex flex-col"
              style={{ maxWidth: '900px', width: '100%', maxHeight: '80vh', background: '#0c0c12', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}
              onClick={e => e.stopPropagation()}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '13px', fontWeight: 900, color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: '0.15em', margin: 0 }}>SOURCE NODE CONFIGURATION</h3>
                  <p style={{ fontSize: '7px', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.25em', marginTop: '3px', marginBottom: 0 }}>MANAGING {allSources.length - disabledSources.size} / {allSources.length} NODES ACTIVE</p>
                </div>
                <button onClick={() => setShowSourceManager(false)}
                  style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', color: 'rgba(255,255,255,0.4)' }}>
                  <X size={14} />
                </button>
              </div>
              <div className="overflow-y-auto custom-scrollbar" style={{ padding: '16px 20px', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px' }}>
                {allSources.map(source => {
                  const isOff = disabledSources.has(source.id);
                  const biasInfo = BIAS_COLORS[source.bias as keyof typeof BIAS_COLORS] || { text: 'text-gray-400', label: source.bias };
                  return (
                    <div key={source.id}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', border: isOff ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(255,255,255,0.1)', background: isOff ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.03)', opacity: isOff ? 0.45 : 1, filter: isOff ? 'grayscale(1)' : 'none' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1, marginRight: '8px' }}>
                        <span style={{ fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: '0.05em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{source.name}</span>
                        <span className={biasInfo.text} style={{ fontSize: '7px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', marginTop: '2px' }}>{biasInfo.label}</span>
                      </div>
                      <button onClick={() => toggleSourceEnabled(source.id)}
                        style={{ padding: '4px 10px', fontSize: '7px', fontWeight: 900, textTransform: 'uppercase', border: isOff ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(6,182,212,0.4)', background: isOff ? 'rgba(0,0,0,0.5)' : 'rgba(6,182,212,0.12)', color: isOff ? 'rgba(255,255,255,0.2)' : '#22d3ee', cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 }}>
                        {isOff ? 'OFF' : 'LIVE'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </m.div>
          </div>
        )}
      </AnimatePresence>

    </PageLayout>
  );
}
