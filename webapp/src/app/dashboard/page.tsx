'use client';

import { useState, useEffect, useCallback } from 'react';
import { Responsive, WidthProvider, Layout } from 'react-grid-layout';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Settings, Move, Send, Loader2 } from 'lucide-react';
import { LUXRIG_BRIDGE_URL } from '@/lib/utils';
import { parseRSSFeed, NEWS_SOURCES } from '@/lib/news-service';
import PageBackground from '@/components/PageBackground';

import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

// Widget Types
type WidgetType = 'quick_ai' | 'calendar' | 'news' | 'tasks' | 'quote' | 'system' | 'quicklinks';

interface WidgetConfig {
    i: string;
    type: WidgetType;
    title: string;
    icon: string;
    minW?: number;
    minH?: number;
}

// Available Widgets
const WIDGET_CATALOG: Record<WidgetType, { title: string; icon: string; defaultW: number; defaultH: number; minW: number; minH: number }> = {
    quick_ai: { title: '⚡ Quick AI', icon: '⚡', defaultW: 2, defaultH: 3, minW: 2, minH: 2 },
    calendar: { title: '📅 Calendar', icon: '📅', defaultW: 1, defaultH: 3, minW: 1, minH: 2 },
    news: { title: '📰 News', icon: '📰', defaultW: 2, defaultH: 3, minW: 1, minH: 2 },
    tasks: { title: '✅ Tasks', icon: '✅', defaultW: 1, defaultH: 3, minW: 1, minH: 2 },
    quote: { title: '✨ Quote', icon: '✨', defaultW: 1, defaultH: 2, minW: 1, minH: 1 },
    system: { title: '🖥️ System', icon: '🖥️', defaultW: 2, defaultH: 2, minW: 1, minH: 2 },
    quicklinks: { title: '🔗 Quick Links', icon: '🔗', defaultW: 1, defaultH: 2, minW: 1, minH: 1 },
};

// Default Layout
const DEFAULT_LAYOUT: Layout[] = [
    { i: 'quick_ai-1', x: 0, y: 0, w: 2, h: 3 },
    { i: 'system-1', x: 2, y: 0, w: 1, h: 2 },
    { i: 'news-1', x: 0, y: 3, w: 2, h: 3 },
    { i: 'calendar-1', x: 2, y: 3, w: 1, h: 3 },
    { i: 'tasks-1', x: 0, y: 6, w: 1, h: 3 },
    { i: 'quote-1', x: 1, y: 6, w: 1, h: 2 },
    { i: 'quicklinks-1', x: 2, y: 6, w: 1, h: 2 },
];

const DEFAULT_WIDGETS: WidgetConfig[] = [
    { i: 'quick_ai-1', type: 'quick_ai', title: '⚡ Quick AI', icon: '⚡' },
    { i: 'system-1', type: 'system', title: '🖥️ System', icon: '🖥️' },
    { i: 'news-1', type: 'news', title: '📰 News', icon: '📰' },
    { i: 'calendar-1', type: 'calendar', title: '📅 Calendar', icon: '📅' },
    { i: 'tasks-1', type: 'tasks', title: '✅ Tasks', icon: '✅' },
    { i: 'quote-1', type: 'quote', title: '✨ Quote', icon: '✨' },
    { i: 'quicklinks-1', type: 'quicklinks', title: '🔗 Quick Links', icon: '🔗' },
];

// Sample Data
const SAMPLE_NEWS = [
    { title: 'Minneapolis City Council Passes New Public Safety Measure', source: 'Alpha News', time: '2h ago', link: '#' },
    { title: 'Governor Walz Signs Executive Order on Energy Policy', source: 'Bring Me The News', time: '4h ago', link: '#' },
    { title: 'Glenn Beck: The Media Won\'t Tell You This', source: 'The Blaze', time: '5h ago', link: '#' },
];

const STATIC_CALENDAR_EVENTS = [
    { title: 'Team standup', time: '10:00 AM', type: 'meeting' },
    { title: 'Music pipeline review', time: '2:00 PM', type: 'work' },
    { title: 'AI research session', time: '4:30 PM', type: 'personal' },
];

const PROJECT_TASKS = [
    { title: 'Finish News Hub UI polish', status: 'done', priority: 'high' },
    { title: 'Set up YouTube channel', status: 'in-progress', priority: 'high' },
    { title: 'Create first Suno song', status: 'todo', priority: 'medium' },
    { title: 'Connect Neural Frames API', status: 'todo', priority: 'low' },
];

const DAILY_QUOTES = [
    { content: '"The best way to predict the future is to create it."', author: 'Peter Drucker' },
    { content: '"Move fast and break things."', author: 'Mark Zuckerberg' },
    { content: '"The only way to do great work is to love what you do."', author: 'Steve Jobs' },
];

const DEFAULT_QUICK_LINKS = [
    { title: 'YouTube Studio', url: 'https://studio.youtube.com', icon: '📺' },
    { title: 'GitHub', url: 'https://github.com', icon: '🐙' },
    { title: 'Gmail', url: 'https://mail.google.com', icon: '📧' },
    { title: 'Suno AI', url: 'https://suno.ai', icon: '🎵' },
];

export default function DashboardPage() {
    const [time, setTime] = useState(new Date());
    const [greeting, setGreeting] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [showWidgetPicker, setShowWidgetPicker] = useState(false);

    // Layout & Widgets
    const [layouts, setLayouts] = useState<{ lg: Layout[] }>({ lg: DEFAULT_LAYOUT });
    const [widgets, setWidgets] = useState<WidgetConfig[]>(DEFAULT_WIDGETS);

    // Data States
    // Interfaces
    interface SystemStats {
        services?: {
            lmstudio?: { online: boolean };
            ollama?: { online: boolean };
        };
        system?: {
            gpu?: {
                temperature?: number; // or string if it comes as string
                utilization?: number;
            };
        };
    }

    interface NewsItem {
        title: string;
        source: string;
        time: string;
        link: string;
        pubDate?: string;
    }

    interface CalendarEvent {
        title: string;
        time: string;
        type: 'meeting' | 'work' | 'personal';
    }

    const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
    const [news, setNews] = useState<NewsItem[]>(SAMPLE_NEWS);
    const [loadingNews, setLoadingNews] = useState(true);
    const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(STATIC_CALENDAR_EVENTS as CalendarEvent[]);
    const [googleConnected, setGoogleConnected] = useState(false);
    const [quote] = useState(DAILY_QUOTES[Math.floor(Math.random() * DAILY_QUOTES.length)]);
    const [quickLinks, setQuickLinks] = useState(DEFAULT_QUICK_LINKS);

    // Quick AI State
    const [quickAiInput, setQuickAiInput] = useState('');
    const [quickAiResponse, setQuickAiResponse] = useState('');
    const [isAiThinking, setIsAiThinking] = useState(false);

    // Load saved layout
    useEffect(() => {
        const saved = localStorage.getItem('dashboard-layout');
        const savedWidgets = localStorage.getItem('dashboard-widgets');
        const savedQuickLinks = localStorage.getItem('dashboard-quicklinks');
        if (saved) {
            try { setLayouts(JSON.parse(saved)); } catch { }
        }
        if (savedWidgets) {
            try { setWidgets(JSON.parse(savedWidgets)); } catch { }
        }
        if (savedQuickLinks) {
            try { setQuickLinks(JSON.parse(savedQuickLinks)); } catch { }
        }
    }, []);

    // Save layout changes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onLayoutChange = useCallback((currentLayout: Layout[], allLayouts: any) => {
        setLayouts(allLayouts);
        localStorage.setItem('dashboard-layout', JSON.stringify(allLayouts));
    }, []);

    // Initialize
    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Good morning');
        else if (hour < 17) setGreeting('Good afternoon');
        else setGreeting('Good evening');

        const timer = setInterval(() => setTime(new Date()), 1000);
        fetchSystemStats();
        fetchDashboardNews();
        fetchGoogleCalendar();
        const statsTimer = setInterval(fetchSystemStats, 5000);

        return () => {
            clearInterval(timer);
            clearInterval(statsTimer);
        };
    }, []);

    async function fetchSystemStats() {
        try {
            // Using /status for detailed breakdown, or /health for simple checks
            const res = await fetch(`${LUXRIG_BRIDGE_URL}/status`);
            if (res.ok) setSystemStats(await res.json());
        } catch { }
    }

    async function fetchDashboardNews() {
        try {
            const alphaNews = await parseRSSFeed(NEWS_SOURCES.local.find(s => s.id === 'alpha-news')?.rss || '');
            const blaze = await parseRSSFeed(NEWS_SOURCES.national.find(s => s.id === 'the-blaze')?.rss || '');
            const combined = [
                ...alphaNews.map(i => ({ ...i, source: 'Alpha News' })),
                ...blaze.map(i => ({ ...i, source: 'The Blaze' }))
            ].sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
                .slice(0, 5)
                .map(item => ({
                    title: item.title,
                    source: item.source,
                    time: getTimeAgo(item.pubDate),
                    link: item.link
                }));
            if (combined.length > 0) setNews(combined);
        } catch { } finally { setLoadingNews(false); }
    }

    async function fetchGoogleCalendar() {
        try {
            const accessToken = localStorage.getItem('google_access_token');
            if (!accessToken) { setGoogleConnected(false); return; }
            setGoogleConnected(true);
            const response = await fetch(`${LUXRIG_BRIDGE_URL}/google/calendar/events?maxResults=5`, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            if (response.ok) {
                const events = await response.json();
                if (Array.isArray(events) && events.length > 0) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const formatted: CalendarEvent[] = events.map((event: any) => ({
                        title: event.summary || 'No title',
                        time: event.start?.dateTime
                            ? new Date(event.start.dateTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
                            : 'All day',
                        type: (event.summary?.toLowerCase().includes('meeting') ? 'meeting' : 'work') as CalendarEvent['type']
                    }));
                    setCalendarEvents(formatted);
                }
            }
        } catch { }
    }

    async function handleQuickAiSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!quickAiInput.trim()) return;

        setIsAiThinking(true);
        setQuickAiResponse(''); // Clear previous response

        try {
            const res = await fetch(`${LUXRIG_BRIDGE_URL}/llm/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [{ role: 'user', content: quickAiInput }],
                    provider: 'lmstudio' // Default to LM Studio as requested
                })
            });

            if (res.ok) {
                const data = await res.json();
                // Assuming data structure matches OpenAI chat completion
                setQuickAiResponse(data.choices?.[0]?.message?.content || data.content || 'No response text received.');
            } else {
                setQuickAiResponse('Error: Failed to get response from AI.');
            }
        } catch (error) {
            setQuickAiResponse('Error: Could not connect to Bridge.');
        } finally {
            setIsAiThinking(false);
        }
    }

    function getTimeAgo(dateStr: string) {
        const diff = Date.now() - new Date(dateStr).getTime();
        const hrs = Math.floor(diff / (1000 * 60 * 60));
        if (hrs < 1) return 'Just now';
        if (hrs > 24) return `${Math.floor(hrs / 24)}d ago`;
        return `${hrs}h ago`;
    }

    function addWidget(type: WidgetType) {
        const id = `${type}-${Date.now()}`;
        const config = WIDGET_CATALOG[type];
        const newWidget: WidgetConfig = { i: id, type, title: config.title, icon: config.icon };
        const newLayout: Layout = { i: id, x: 0, y: Infinity, w: config.defaultW, h: config.defaultH, minW: config.minW, minH: config.minH };

        setWidgets(prev => {
            const updated = [...prev, newWidget];
            localStorage.setItem('dashboard-widgets', JSON.stringify(updated));
            return updated;
        });
        setLayouts(prev => {
            const updated = { ...prev, lg: [...prev.lg, newLayout] };
            localStorage.setItem('dashboard-layout', JSON.stringify(updated));
            return updated;
        });
        setShowWidgetPicker(false);
    }

    function removeWidget(id: string) {
        setWidgets(prev => {
            const updated = prev.filter(w => w.i !== id);
            localStorage.setItem('dashboard-widgets', JSON.stringify(updated));
            return updated;
        });
        setLayouts(prev => {
            const updated = { ...prev, lg: prev.lg.filter(l => l.i !== id) };
            localStorage.setItem('dashboard-layout', JSON.stringify(updated));
            return updated;
        });
    }

    function resetLayout() {
        setLayouts({ lg: DEFAULT_LAYOUT });
        setWidgets(DEFAULT_WIDGETS);
        localStorage.removeItem('dashboard-layout');
        localStorage.removeItem('dashboard-widgets');
    }

    const getTaskStatusStyle = (status: string) => {
        switch (status) {
            case 'done': return 'bg-green-500/20 text-green-400';
            case 'in-progress': return 'bg-yellow-500/20 text-yellow-400';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };

    // Render Widget Content
    function renderWidgetContent(widget: WidgetConfig) {
        switch (widget.type) {
            case 'quick_ai':
                return (
                    <div className="flex flex-col h-full">
                        <div className="flex-1 overflow-auto custom-scrollbar mb-4 bg-black/20 rounded p-3 min-h-[100px]">
                            {quickAiResponse ? (
                                <div className="prose prose-invert prose-sm">
                                    <p className="whitespace-pre-wrap">{quickAiResponse}</p>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                                    {isAiThinking ? (
                                        <div className="flex items-center gap-2">
                                            <Loader2 className="animate-spin" size={16} /> Thinking...
                                        </div>
                                    ) : (
                                        'Ask me anything...'
                                    )}
                                </div>
                            )}
                        </div>
                        <form onSubmit={handleQuickAiSubmit} className="relative">
                            <input
                                type="text"
                                value={quickAiInput}
                                onChange={(e) => setQuickAiInput(e.target.value)}
                                placeholder="Send a message..."
                                className="w-full bg-white/5 border border-white/10 rounded-lg pl-4 pr-10 py-3 text-sm focus:outline-none focus:border-cyan-500/50 transition-colors"
                            />
                            <button
                                type="submit"
                                disabled={!quickAiInput.trim() || isAiThinking}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isAiThinking ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                            </button>
                        </form>
                    </div>
                );

            case 'calendar':
                return (
                    <div className="space-y-2">
                        {googleConnected && <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">Google</span>}
                        {calendarEvents.map((event, i) => (
                            <div key={i} className="flex items-center gap-2 p-2 rounded bg-white/5 hover:bg-white/10">
                                <div className="text-cyan-400 font-mono text-xs w-16">{event.time}</div>
                                <div className="flex-1 text-sm truncate">{event.title}</div>
                                <div className={`w-2 h-2 rounded-full ${event.type === 'meeting' ? 'bg-blue-400' : 'bg-green-400'}`}></div>
                            </div>
                        ))}
                        {!googleConnected && <Link href="/settings" className="text-xs text-cyan-400 hover:underline">Connect Google →</Link>}
                    </div>
                );

            case 'news':
                return (
                    <div className="space-y-3">
                        {loadingNews ? <div className="text-gray-500">Loading...</div> : news.map((item, i) => (
                            <div key={i} className="border-b border-white/5 last:border-0 pb-2 last:pb-0">
                                <a href={item.link} target="_blank" rel="noopener noreferrer" className="group">
                                    <p className="text-sm font-medium group-hover:text-cyan-400 line-clamp-2">{item.title}</p>
                                    <p className="text-xs text-gray-500 mt-1 flex justify-between">
                                        <span>{item.source}</span><span>{item.time}</span>
                                    </p>
                                </a>
                            </div>
                        ))}
                        <Link href="/news" className="text-xs text-cyan-400 hover:underline">View all →</Link>
                    </div>
                );

            case 'tasks':
                return (
                    <div className="space-y-2">
                        {PROJECT_TASKS.map((task, i) => (
                            <div key={i} className="flex items-center gap-2 p-2 rounded bg-white/5">
                                <span className={`px-2 py-0.5 text-xs rounded ${getTaskStatusStyle(task.status)}`}>
                                    {task.status === 'done' ? '✓' : task.status === 'in-progress' ? '◉' : '○'}
                                </span>
                                <span className="text-sm flex-1 truncate">{task.title}</span>
                            </div>
                        ))}
                    </div>
                );

            case 'quote':
                return (
                    <div className="flex flex-col justify-center h-full">
                        <p className="text-sm italic text-gray-300">{quote.content}</p>
                        <p className="text-xs text-gray-500 mt-2">— {quote.author}</p>
                    </div>
                );

            case 'system':
                // /status provides: { services: { lmstudio: { online: bool }, ollama: { online: bool } }, system: { ... } }
                const lmStudioOnline = systemStats?.services?.lmstudio?.online ?? false;
                const ollamaOnline = systemStats?.services?.ollama?.online ?? false;
                const gpuTemp = systemStats?.system?.gpu?.temperature ?? '--';
                const gpuUtil = systemStats?.system?.gpu?.utilization ?? 0;

                return (
                    <div className="grid grid-cols-2 gap-3 h-full">
                        <div className="p-3 rounded-lg bg-white/5 flex flex-col justify-center">
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`w-2 h-2 rounded-full ${lmStudioOnline ? 'bg-green-400' : 'bg-red-400'}`}></span>
                                <span className="text-xs font-medium truncate">LM Studio</span>
                            </div>
                            <p className="text-xs text-gray-500">{lmStudioOnline ? 'Online' : 'Offline'}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-white/5 flex flex-col justify-center">
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`w-2 h-2 rounded-full ${ollamaOnline ? 'bg-green-400' : 'bg-red-400'}`}></span>
                                <span className="text-xs font-medium truncate">Ollama</span>
                            </div>
                            <p className="text-xs text-gray-500">{ollamaOnline ? 'Online' : 'Offline'}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-white/5 col-span-2 flex flex-col justify-center">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-medium">GPU Load</span>
                                <span className="text-xs text-cyan-400">{gpuTemp}°C</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                                <div className="bg-gradient-to-r from-cyan-500 to-purple-500 h-2 rounded-full transition-all duration-300" style={{ width: `${gpuUtil}%` }}></div>
                            </div>
                        </div>
                    </div>
                );

            case 'quicklinks':
                return (
                    <div className="grid grid-cols-2 gap-2">
                        {quickLinks.map((link: { title: string; url: string; icon: string }, i: number) => (
                            <a key={i} href={link.url} target="_blank" className="p-2 rounded bg-white/5 hover:bg-white/10 text-center group">
                                <div className="text-xl group-hover:scale-110 transition-transform">{link.icon}</div>
                                <div className="text-xs text-gray-400 mt-1 truncate">{link.title}</div>
                            </a>
                        ))}
                    </div>
                );

            default:
                return <div className="text-gray-500">Unknown widget</div>;
        }
    }

    return (
        <div className="min-h-screen pt-20 pb-24 relative">
            <PageBackground color="cyan" />

            {/* Header */}
            <section className="container-main py-6">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold mb-1">
                            {greeting}, <span className="text-gradient">Dunker</span> 👋
                        </h1>
                        <p className="text-gray-400 text-sm">
                            {time.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                            <span className="mx-2">•</span>
                            <span className="font-mono text-cyan-400">{time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setEditMode(!editMode)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all ${editMode ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-white/5 text-gray-400 hover:text-white'}`}
                        >
                            <Settings size={16} />
                            {editMode ? 'Done Editing' : 'Edit Dashboard'}
                        </button>

                        {editMode && (
                            <>
                                <button onClick={() => setShowWidgetPicker(true)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-green-500/20 text-green-400 hover:bg-green-500/30">
                                    <Plus size={16} /> Add Widget
                                </button>
                                <button onClick={resetLayout} className="px-3 py-1.5 rounded-lg text-sm bg-red-500/20 text-red-400 hover:bg-red-500/30">
                                    Reset
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </section>

            {/* Grid */}
            <section className="container-main">
                <ResponsiveGridLayout
                    className="layout"
                    layouts={layouts}
                    breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                    cols={{ lg: 3, md: 3, sm: 2, xs: 1, xxs: 1 }}
                    rowHeight={100}
                    isDraggable={editMode}
                    isResizable={editMode}
                    onLayoutChange={onLayoutChange}
                    draggableHandle=".drag-handle"
                >
                    {widgets.map(widget => (
                        <div key={widget.i} className={`glass-card overflow-hidden group relative flex flex-col ${editMode ? 'ring-2 ring-cyan-500/30' : ''}`}>
                            {/* Hover Glow Effect */}
                            <div className={`absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}></div>

                            <div className={`flex items-center justify-between mb-3 relative z-10 flex-shrink-0 ${editMode ? 'drag-handle cursor-move' : ''}`}>
                                <h3 className="font-bold text-sm flex items-center gap-2">
                                    {editMode && <Move size={14} className="text-cyan-400" />}
                                    {widget.title}
                                </h3>
                                {editMode && (
                                    <button onClick={() => removeWidget(widget.i)} className="p-1 rounded hover:bg-red-500/20 text-gray-500 hover:text-red-400">
                                        <X size={14} />
                                    </button>
                                )}
                            </div>
                            <div className="flex-1 overflow-auto custom-scrollbar relative z-10 min-h-0">
                                {renderWidgetContent(widget)}
                            </div>
                        </div>
                    ))}
                </ResponsiveGridLayout>
            </section>

            {/* Widget Picker Modal */}
            <AnimatePresence>
                {showWidgetPicker && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowWidgetPicker(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="glass-card max-w-md w-full"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-bold">Add Widget</h2>
                                <button onClick={() => setShowWidgetPicker(false)} className="p-1 rounded hover:bg-white/10">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {Object.entries(WIDGET_CATALOG).map(([type, config]) => (
                                    <button
                                        key={type}
                                        onClick={() => addWidget(type as WidgetType)}
                                        className="p-4 rounded-lg bg-white/5 hover:bg-white/10 text-left transition-all hover:scale-105"
                                    >
                                        <div className="text-2xl mb-2">{config.icon}</div>
                                        <div className="text-sm font-medium">{config.title.replace(/^.+\s/, '')}</div>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
