'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import PageBackground from '@/components/PageBackground';
import ResearchPanel from '@/components/ResearchPanel';
import {
    NEWS_SOURCES,
    BIAS_COLORS,
    type NewsArticle,
    MN_KEYWORDS
} from '@/lib/news-service';

// Breaking news ticker headlines
const BREAKING_NEWS = [
    "🔴 BREAKING: House passes major spending bill in late-night vote",
    "🔴 UPDATE: Minneapolis police respond to downtown incident",
    "🔴 DEVELOPING: New poll shows shifting voter sentiment in swing states",
    "🔴 ALERT: Winter storm warning issued for Twin Cities metro area",
];

// Mock articles for demo (RSS will be fetched server-side in production)
const DEMO_ARTICLES: NewsArticle[] = [
    {
        id: '1',
        title: 'Minneapolis City Council Passes New Public Safety Measure',
        description: 'The Minneapolis City Council voted 8-5 to approve a new public safety initiative that opponents say undermines police authority while supporters claim it improves community relations.',
        link: 'https://alphanewsmn.com/example',
        pubDate: new Date().toISOString(),
        source: { id: 'alpha-news', name: 'Alpha News MN', logo: '🐺', bias: 'right' },
        category: 'local',
        region: 'minneapolis',
        factCheck: { status: 'unverified' }
    },
    {
        id: '2',
        title: 'Governor Walz Signs Executive Order on Energy Policy',
        description: 'Minnesota Governor Tim Walz signed a new executive order today mandating stricter emissions standards for state facilities, drawing criticism from business groups.',
        link: 'https://bringmethenews.com/example',
        pubDate: new Date(Date.now() - 3600000).toISOString(),
        source: { id: 'bring-me-the-news', name: 'Bring Me The News', logo: '📰', bias: 'center' },
        category: 'local',
        region: 'minnesota',
        factCheck: { status: 'verified' }
    },
    {
        id: '3',
        title: 'Border Crisis Reaches New Heights as Administration Struggles',
        description: 'New data released today shows illegal border crossings have reached record levels, prompting renewed calls for policy changes from both sides of the aisle.',
        link: 'https://dailywire.com/example',
        pubDate: new Date(Date.now() - 7200000).toISOString(),
        source: { id: 'daily-wire', name: 'The Daily Wire', logo: '📰', bias: 'right' },
        category: 'national',
        factCheck: { status: 'mixed' }
    },
    {
        id: '4',
        title: 'Glenn Beck: The Media Won\'t Tell You This About the Economy',
        description: 'On today\'s show, Glenn Beck breaks down the real economic indicators that mainstream outlets are ignoring and what it means for your family.',
        link: 'https://theblaze.com/example',
        pubDate: new Date(Date.now() - 9000000).toISOString(),
        source: { id: 'the-blaze', name: 'The Blaze (Glenn Beck)', logo: '🔥', bias: 'right' },
        category: 'national',
        factCheck: { status: 'unverified' }
    },
    {
        id: '5',
        title: 'Joe Rogan Experience #2250: Elon Musk Returns',
        description: 'Elon Musk joins Joe for a wide-ranging conversation about AI, free speech, Mars colonization, and the future of humanity.',
        link: 'https://open.spotify.com/jre',
        pubDate: new Date(Date.now() - 10800000).toISOString(),
        source: { id: 'joe-rogan', name: 'Joe Rogan Experience', logo: '🎙️', bias: 'right-libertarian' },
        category: 'national',
        factCheck: { status: 'verified' }
    },
    {
        id: '6',
        title: 'Twin Cities Crime Statistics Released for November',
        description: 'New crime statistics for Minneapolis and St. Paul show divergent trends in violent crime rates, with carjackings up 23% year-over-year.',
        link: 'https://alphanewsmn.com/example2',
        pubDate: new Date(Date.now() - 14400000).toISOString(),
        source: { id: 'alpha-news', name: 'Alpha News MN', logo: '🐺', bias: 'right' },
        category: 'local',
        region: 'twin-cities',
        factCheck: { status: 'verified' }
    },
    {
        id: '7',
        title: 'Walter Hudson: Why Minnesota Conservatives Must Unite in 2025',
        description: 'Commentary: The path forward for the Minnesota GOP requires coalition building and a return to first principles. Here\'s how we do it.',
        link: 'https://walterhudson.substack.com/example',
        pubDate: new Date(Date.now() - 18000000).toISOString(),
        source: { id: 'walter-hudson', name: 'Walter Hudson', logo: '✍️', bias: 'right' },
        category: 'local',
        region: 'minnesota',
        factCheck: { status: 'verified' }
    },
    {
        id: '8',
        title: 'Fed Signals Potential Rate Cuts in 2025 Amid Economic Uncertainty',
        description: 'Federal Reserve officials indicated they may begin cutting interest rates next year as inflation shows signs of cooling.',
        link: 'https://foxnews.com/economy',
        pubDate: new Date(Date.now() - 21600000).toISOString(),
        source: { id: 'fox-news', name: 'Fox News', logo: '🦊', bias: 'right' },
        category: 'national',
        factCheck: { status: 'verified' }
    }
];

type FilterTab = 'all' | 'local' | 'national' | 'saved';
type FactCheckStatus = 'verified' | 'disputed' | 'unverified' | 'mixed';

const FACT_CHECK_STYLES: Record<FactCheckStatus, { bg: string; text: string; icon: string; label: string }> = {
    verified: { bg: 'bg-green-500/20', text: 'text-green-400', icon: '✓', label: 'Verified' },
    disputed: { bg: 'bg-red-500/20', text: 'text-red-400', icon: '✗', label: 'Disputed' },
    mixed: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', icon: '⚠', label: 'Mixed' },
    unverified: { bg: 'bg-gray-500/20', text: 'text-gray-400', icon: '?', label: 'Unverified' }
};

export default function NewsPage() {
    const [articles, setArticles] = useState<NewsArticle[]>(DEMO_ARTICLES);
    const [activeTab, setActiveTab] = useState<FilterTab>('all');
    const [savedArticles, setSavedArticles] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedBias, setSelectedBias] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showFactChecker, setShowFactChecker] = useState(false);
    const [factCheckQuery, setFactCheckQuery] = useState('');
    const [factCheckResult, setFactCheckResult] = useState<any>(null);

    // Research Panel
    const [showResearchPanel, setShowResearchPanel] = useState(false);
    const [articleToResearch, setArticleToResearch] = useState<{ id: string; title: string; url: string; source: string } | null>(null);

    // Source Management
    const [showSourceManager, setShowSourceManager] = useState(false);
    const [customSources, setCustomSources] = useState<any[]>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('customNewsSources');
            return saved ? JSON.parse(saved) : [];
        }
        return [];
    });
    const [disabledSources, setDisabledSources] = useState<Set<string>>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('disabledNewsSources');
            return saved ? new Set(JSON.parse(saved)) : new Set();
        }
        return new Set();
    });
    const [newSource, setNewSource] = useState({ name: '', rss: '', bias: 'center', category: 'national' });

    // Save to localStorage when sources change
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('customNewsSources', JSON.stringify(customSources));
            localStorage.setItem('disabledNewsSources', JSON.stringify([...disabledSources]));
        }
    }, [customSources, disabledSources]);

    const addCustomSource = () => {
        if (!newSource.name || !newSource.rss) return;
        const source = {
            id: `custom-${Date.now()}`,
            name: newSource.name,
            rss: newSource.rss,
            logo: '📌',
            bias: newSource.bias,
            category: newSource.category,
            custom: true
        };
        setCustomSources([...customSources, source]);
        setNewSource({ name: '', rss: '', bias: 'center', category: 'national' });
    };

    const removeCustomSource = (id: string) => {
        setCustomSources(customSources.filter(s => s.id !== id));
    };

    const toggleSourceEnabled = (id: string) => {
        setDisabledSources(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const allSources = [
        ...NEWS_SOURCES.national,
        ...NEWS_SOURCES.local,
        ...NEWS_SOURCES.alternative,
        ...customSources
    ];

    // Filter articles
    const filteredArticles = articles.filter(article => {
        // Tab filter
        if (activeTab === 'local' && article.category !== 'local') return false;
        if (activeTab === 'national' && article.category !== 'national') return false;
        if (activeTab === 'saved' && !savedArticles.has(article.id)) return false;

        // Bias filter
        if (selectedBias && article.source.bias !== selectedBias) return false;

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return article.title.toLowerCase().includes(query) ||
                article.description.toLowerCase().includes(query) ||
                article.source.name.toLowerCase().includes(query);
        }

        return true;
    });

    const toggleSave = (id: string) => {
        setSavedArticles(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const runFactCheck = async () => {
        if (!factCheckQuery.trim()) return;
        setIsLoading(true);

        // Simulate fact-check (would call actual API)
        setTimeout(() => {
            setFactCheckResult({
                query: factCheckQuery,
                status: 'analyzed',
                findings: [
                    { source: 'PolitiFact', rating: 'Needs Context', url: '#' },
                    { source: 'Snopes', rating: 'Mixed', url: '#' },
                ],
                aiAnalysis: 'This claim contains factual elements but lacks important context. The statistic cited is accurate but the timeframe and comparison are misleading.'
            });
            setIsLoading(false);
        }, 1500);
    };

    const biasOptions = Object.entries(BIAS_COLORS);

    // Breaking news ticker state
    const [tickerIndex, setTickerIndex] = useState(0);
    useEffect(() => {
        const interval = setInterval(() => {
            setTickerIndex((i) => (i + 1) % BREAKING_NEWS.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="pb-20 relative overflow-hidden">
            <PageBackground color="red" />

            {/* Breaking News Ticker */}
            <div className="bg-gradient-to-r from-red-900/80 via-red-800/80 to-red-900/80 border-b border-red-500/30 pt-2">
                <div className="container-main py-2">
                    <motion.div
                        key={tickerIndex}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="flex items-center justify-center gap-3"
                    >
                        <span className="animate-pulse">🔴</span>
                        <span className="text-sm font-medium text-red-100">
                            {BREAKING_NEWS[tickerIndex]}
                        </span>
                        <span className="text-xs text-red-300">
                            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </motion.div>
                </div>
            </div>

            {/* Epic Broadcast Header */}
            <section className="section-padding pb-8 relative overflow-hidden">
                {/* Scanline Overlay Effect */}
                <div className="absolute inset-0 pointer-events-none opacity-5">
                    <div className="w-full h-full" style={{
                        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)'
                    }} />
                </div>

                <div className="container-main relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        {/* Main Header Block */}
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-6">
                            {/* Left: Title & Stats */}
                            <div className="flex-1">
                                {/* Live Badge + Title */}
                                <div className="flex items-center gap-4 mb-4">
                                    {/* Animated Live Indicator */}
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-red-500 rounded-full blur-md animate-pulse opacity-50" />
                                        <div className="relative flex items-center gap-2 px-4 py-2 bg-red-600/20 border border-red-500/50 rounded-full backdrop-blur-sm">
                                            <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
                                            <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Live Feed</span>
                                        </div>
                                    </div>

                                    {/* Article Count Badge */}
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full">
                                        <span className="text-xs text-gray-400">{articles.length} articles</span>
                                    </div>
                                </div>

                                {/* Epic Title */}
                                <div className="flex items-center gap-4 mb-3">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-orange-500 to-red-500 rounded-xl blur-lg opacity-40 animate-pulse" />
                                        <div className="relative p-3 bg-gradient-to-br from-red-600/20 to-orange-600/20 rounded-xl border border-white/10 backdrop-blur-sm">
                                            <span className="text-3xl">📡</span>
                                        </div>
                                    </div>
                                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight">
                                        <span className="bg-gradient-to-r from-white via-red-100 to-white bg-clip-text text-transparent">
                                            DLX
                                        </span>
                                        <span className="bg-gradient-to-r from-red-400 via-orange-400 to-amber-400 bg-clip-text text-transparent animate-gradient bg-300% ml-2">
                                            News
                                        </span>
                                    </h1>
                                </div>

                                {/* Subtitle */}
                                <p className="text-gray-400 text-lg mb-5 max-w-xl">
                                    Real-time news aggregator with AI fact-checking.
                                    <span className="text-red-400 ml-1">Stay informed. Stay sharp.</span>
                                </p>

                                {/* Quick Stats Row */}
                                <div className="flex flex-wrap gap-3">
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                                        <span className="text-lg">🏠</span>
                                        <span className="text-xs font-medium text-blue-400">{articles.filter(a => a.category === 'local').length} Local</span>
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                                        <span className="text-lg">🇺🇸</span>
                                        <span className="text-xs font-medium text-purple-400">{articles.filter(a => a.category === 'national').length} National</span>
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                                        <span className="text-lg">⭐</span>
                                        <span className="text-xs font-medium text-yellow-400">{savedArticles.size} Saved</span>
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-lg">
                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                        <span className="text-xs font-medium text-green-400">{articles.filter(a => a.factCheck?.status === 'verified').length} Verified</span>
                                    </div>
                                </div>
                            </div>

                            {/* Right: Action Buttons */}
                            <div className="flex flex-col gap-3">
                                <Link href="/" className="text-gray-400 hover:text-cyan-400 transition-colors text-sm mb-2">
                                    ← Back to Dashboard
                                </Link>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={() => setShowSourceManager(!showSourceManager)}
                                        className={`px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all text-sm font-medium ${showSourceManager
                                            ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/30 shadow-lg shadow-cyan-500/10'
                                            : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10'
                                            }`}
                                    >
                                        ⚙️ Sources
                                    </button>
                                    <button
                                        onClick={() => setShowFactChecker(!showFactChecker)}
                                        className={`px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all text-sm font-medium ${showFactChecker
                                            ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400 border border-purple-500/30 shadow-lg shadow-purple-500/10'
                                            : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10'
                                            }`}
                                    >
                                        🔍 Fact Check
                                    </button>
                                    <button
                                        onClick={() => setShowResearchPanel(true)}
                                        className="px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all text-sm font-medium bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 border border-amber-500/30 hover:shadow-lg hover:shadow-amber-500/10"
                                    >
                                        📚 Research
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Source Manager Panel */}
            <AnimatePresence>
                {showSourceManager && (
                    <motion.section
                        className="container-main pb-8"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        <div className="glass-card border-2 border-cyan-500/30">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    ⚙️ Source Manager
                                </h3>
                                <span className="text-sm text-gray-400">
                                    {allSources.length - disabledSources.size} active / {allSources.length} total
                                </span>
                            </div>

                            {/* Add Custom Source */}
                            <div className="bg-black/20 rounded-lg p-4 mb-6">
                                <h4 className="font-medium mb-3 text-cyan-400">➕ Add Custom Source</h4>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                    <input
                                        type="text"
                                        placeholder="Source name"
                                        value={newSource.name}
                                        onChange={(e) => setNewSource({ ...newSource, name: e.target.value })}
                                        className="bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm"
                                    />
                                    <input
                                        type="text"
                                        placeholder="RSS feed URL"
                                        value={newSource.rss}
                                        onChange={(e) => setNewSource({ ...newSource, rss: e.target.value })}
                                        className="bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm"
                                    />
                                    <select
                                        value={newSource.bias}
                                        onChange={(e) => setNewSource({ ...newSource, bias: e.target.value })}
                                        className="bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm"
                                    >
                                        <option value="right">Right</option>
                                        <option value="right-center">Right-Center</option>
                                        <option value="center">Center</option>
                                        <option value="right-libertarian">Libertarian</option>
                                    </select>
                                    <button
                                        onClick={addCustomSource}
                                        className="btn-primary text-sm"
                                    >
                                        Add Source
                                    </button>
                                </div>
                            </div>

                            {/* Discover Similar Sources */}
                            <div className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-lg p-4 mb-6 border border-purple-500/20">
                                <h4 className="font-medium mb-3 text-purple-400">🔮 Discover Similar Sources</h4>
                                <p className="text-sm text-gray-400 mb-4">Based on your active sources, you might like:</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {[
                                        { name: 'Townhall', rss: 'https://townhall.com/rss/featuredcolumnists/', bias: 'right', desc: 'Conservative commentary' },
                                        { name: 'RedState', rss: 'https://redstate.com/feed', bias: 'right', desc: 'Right-leaning news' },
                                        { name: 'PJ Media', rss: 'https://pjmedia.com/feed', bias: 'right', desc: 'Conservative analysis' },
                                        { name: 'Newsmax', rss: 'https://www.newsmax.com/rss/Newsmax-RSS/', bias: 'right', desc: 'Conservative TV news' },
                                        { name: 'American Thinker', rss: 'https://www.americanthinker.com/blog/m/feed.xml', bias: 'right', desc: 'Conservative essays' },
                                        { name: 'Just The News', rss: 'https://justthenews.com/rss.xml', bias: 'right-center', desc: 'Straight news reporting' },
                                    ].filter(s => !customSources.find(c => c.name === s.name)).map((suggestion) => (
                                        <div key={suggestion.name} className="flex items-center justify-between bg-black/20 rounded-lg p-3">
                                            <div>
                                                <span className="font-medium text-sm">{suggestion.name}</span>
                                                <p className="text-xs text-gray-500">{suggestion.desc}</p>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setCustomSources([...customSources, {
                                                        id: `custom-${Date.now()}`,
                                                        name: suggestion.name,
                                                        rss: suggestion.rss,
                                                        logo: '📌',
                                                        bias: suggestion.bias,
                                                        category: 'national',
                                                        custom: true
                                                    }]);
                                                }}
                                                className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded text-xs hover:bg-purple-500/30 transition-colors"
                                            >
                                                + Add
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Current Sources List */}
                            <div>
                                <h4 className="font-medium mb-3">📋 All Sources</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                                    {allSources.map((source: any) => {
                                        const isDisabled = disabledSources.has(source.id);
                                        const biasStyle = BIAS_COLORS[source.bias as keyof typeof BIAS_COLORS];
                                        return (
                                            <div
                                                key={source.id}
                                                className={`flex items-center justify-between p-2 rounded-lg border transition-colors ${isDisabled
                                                    ? 'bg-black/20 border-white/5 opacity-50'
                                                    : 'bg-white/5 border-white/10'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                                    <span>{source.logo}</span>
                                                    <span className="text-sm truncate">{source.name}</span>
                                                    {biasStyle && (
                                                        <span className={`text-xs px-1 rounded ${biasStyle.bg} ${biasStyle.text}`}>
                                                            {biasStyle.label}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => toggleSourceEnabled(source.id)}
                                                        className={`p-1 rounded text-xs ${isDisabled
                                                            ? 'text-gray-500 hover:text-green-400'
                                                            : 'text-green-400 hover:text-gray-500'
                                                            }`}
                                                        title={isDisabled ? 'Enable' : 'Disable'}
                                                    >
                                                        {isDisabled ? '○' : '●'}
                                                    </button>
                                                    {source.custom && (
                                                        <button
                                                            onClick={() => removeCustomSource(source.id)}
                                                            className="p-1 text-red-400 hover:text-red-300 text-xs"
                                                            title="Remove"
                                                        >
                                                            ✕
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </motion.section>
                )}
            </AnimatePresence>

            {/* Fact Checker Panel */}
            <AnimatePresence>
                {showFactChecker && (
                    <motion.section
                        className="container-main pb-8"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        <div className="glass-card border-2 border-purple-500/30">
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                🔍 AI Fact Checker
                            </h3>
                            <div className="flex gap-4 mb-4">
                                <input
                                    type="text"
                                    placeholder="Enter a claim to fact-check..."
                                    value={factCheckQuery}
                                    onChange={(e) => setFactCheckQuery(e.target.value)}
                                    className="flex-1 bg-black/30 border border-white/10 rounded-lg px-4 py-3"
                                    onKeyDown={(e) => e.key === 'Enter' && runFactCheck()}
                                />
                                <button
                                    onClick={runFactCheck}
                                    disabled={isLoading}
                                    className="btn-primary px-6"
                                >
                                    {isLoading ? 'Checking...' : 'Check'}
                                </button>
                            </div>

                            {factCheckResult && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="bg-black/20 rounded-lg p-4"
                                >
                                    <p className="text-sm text-gray-400 mb-3">
                                        Results for: <span className="text-white">"{factCheckResult.query}"</span>
                                    </p>

                                    {factCheckResult.findings?.length > 0 && (
                                        <div className="mb-4">
                                            <p className="text-sm font-medium mb-2">External Fact-Checks:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {factCheckResult.findings.map((f: any, i: number) => (
                                                    <span key={i} className="px-3 py-1 bg-white/5 rounded text-sm">
                                                        {f.source}: <span className="text-yellow-400">{f.rating}</span>
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {factCheckResult.aiAnalysis && (
                                        <div className="border-t border-white/10 pt-4">
                                            <p className="text-sm font-medium mb-2 text-purple-400">🤖 AI Analysis:</p>
                                            <p className="text-gray-300 text-sm">{factCheckResult.aiAnalysis}</p>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </div>
                    </motion.section>
                )}
            </AnimatePresence>

            {/* Filters */}
            <section className="container-main pb-6">
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Tabs */}
                    <div className="flex gap-2">
                        {(['all', 'local', 'national', 'saved'] as FilterTab[]).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab
                                    ? 'bg-cyan-500 text-black'
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                    }`}
                            >
                                {tab === 'local' && '🏠 '}
                                {tab === 'national' && '🇺🇸 '}
                                {tab === 'saved' && '⭐ '}
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                {tab === 'local' && ' (MN)'}
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="Search articles..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2"
                        />
                    </div>

                    {/* Bias Filter */}
                    <select
                        value={selectedBias || ''}
                        onChange={(e) => setSelectedBias(e.target.value || null)}
                        className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm"
                    >
                        <option value="">All Perspectives</option>
                        {biasOptions.map(([key, value]) => (
                            <option key={key} value={key}>{value.label}</option>
                        ))}
                    </select>
                </div>
            </section>

            {/* Priority Sources */}
            <section className="container-main pb-6">
                <div className="flex items-center gap-4 overflow-x-auto pb-2">
                    <span className="text-sm text-gray-500 whitespace-nowrap">🔥 Priority:</span>
                    {[...NEWS_SOURCES.local, ...NEWS_SOURCES.national].filter((s: any) => s.priority).map((source) => (
                        <button
                            key={source.id}
                            className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full text-sm whitespace-nowrap hover:bg-white/10 transition-colors border border-white/10"
                        >
                            <span>{source.logo}</span>
                            <span>{source.name}</span>
                        </button>
                    ))}
                </div>
            </section>

            {/* Articles Grid */}
            <section className="container-main pb-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredArticles.map((article, i) => {
                        const biasStyle = BIAS_COLORS[article.source.bias as keyof typeof BIAS_COLORS];
                        const factStyle = FACT_CHECK_STYLES[article.factCheck?.status || 'unverified'];
                        const isSaved = savedArticles.has(article.id);

                        return (
                            <motion.article
                                key={article.id}
                                className="news-card glass-card relative overflow-hidden group"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                            >
                                {/* Hover Glow Effect */}
                                <div className={`absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}></div>
                                {/* Top bar */}
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl">{article.source.logo}</span>
                                        <span className="text-sm text-gray-400">{article.source.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {biasStyle && (
                                            <span className={`bias-tag ${biasStyle.bg} ${biasStyle.text}`}>
                                                {biasStyle.label}
                                            </span>
                                        )}
                                        <button
                                            onClick={() => {
                                                setArticleToResearch({
                                                    id: article.id,
                                                    title: article.title,
                                                    url: article.link,
                                                    source: article.source.name
                                                });
                                                setShowResearchPanel(true);
                                            }}
                                            className="text-lg transition-transform hover:scale-110 text-amber-500 hover:text-amber-400"
                                            title="Add to Research"
                                        >
                                            📚
                                        </button>
                                        <button
                                            onClick={() => toggleSave(article.id)}
                                            className={`text-lg transition-transform hover:scale-110 ${isSaved ? 'text-yellow-400' : 'text-gray-600'
                                                }`}
                                        >
                                            {isSaved ? '★' : '☆'}
                                        </button>
                                    </div>
                                </div>

                                {/* Content */}
                                <a href={article.link} target="_blank" rel="noopener noreferrer">
                                    <h3 className="font-bold text-lg mb-2 hover:text-cyan-400 transition-colors line-clamp-2">
                                        {article.title}
                                    </h3>
                                </a>
                                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                                    {article.description}
                                </p>

                                {/* Footer */}
                                <div className="flex items-center justify-between text-xs text-gray-500">
                                    <div className="flex items-center gap-2">
                                        {article.region && (
                                            <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded">
                                                📍 {article.region}
                                            </span>
                                        )}
                                        <span>
                                            {new Date(article.pubDate).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded ${factStyle.bg} ${factStyle.text}`}>
                                        {factStyle.icon} {factStyle.label}
                                    </span>
                                </div>
                            </motion.article>
                        );
                    })}
                </div>

                {filteredArticles.length === 0 && (
                    <div className="text-center py-16 text-gray-500">
                        <p className="text-4xl mb-4">📭</p>
                        <p>No articles found matching your filters.</p>
                    </div>
                )}
            </section>

            {/* Sources Legend */}
            <section className="container-main pb-16">
                <div className="glass-card">
                    <h3 className="font-bold mb-4">📊 Source Legend</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {Object.entries(BIAS_COLORS).map(([key, style]) => (
                            <div key={key} className="flex items-center gap-2">
                                <span className={`w-3 h-3 rounded ${style.bg}`}></span>
                                <span className="text-sm text-gray-400">{style.label}</span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/10">
                        <p className="text-xs text-gray-500">
                            💡 Bias ratings are based on AllSides and Media Bias/Fact Check.
                            Always read multiple sources and verify claims independently.
                        </p>
                    </div>
                </div>
            </section>

            <ResearchPanel
                isOpen={showResearchPanel}
                onClose={() => setShowResearchPanel(false)}
                articleToAdd={articleToResearch}
                onArticleAdded={() => setArticleToResearch(null)}
            />
        </div>
    );
}
