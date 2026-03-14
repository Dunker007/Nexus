import { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react';
import { Responsive } from 'react-grid-layout';
const ResponsiveGridLayout = Responsive as any;

import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Settings, Move } from 'lucide-react';
import { ErrorBoundary } from '../components/ErrorBoundary';

// Lazy load widgets for code splitting and faster initial load
const QuickAIWidget = lazy(() => import('../components/dashboard/widgets/QuickAIWidget').then(m => ({ default: m.QuickAIWidget })));
const CalendarWidget = lazy(() => import('../components/dashboard/widgets/CalendarWidget').then(m => ({ default: m.CalendarWidget })));
const NewsWidget = lazy(() => import('../components/dashboard/widgets/NewsWidget').then(m => ({ default: m.NewsWidget })));
const TasksWidget = lazy(() => import('../components/dashboard/widgets/TasksWidget').then(m => ({ default: m.TasksWidget })));
const QuoteWidget = lazy(() => import('../components/dashboard/widgets/QuoteWidget').then(m => ({ default: m.QuoteWidget })));
const SystemStatsWidget = lazy(() => import('../components/dashboard/widgets/SystemStatsWidget').then(m => ({ default: m.SystemStatsWidget })));
const QuickLinksWidget = lazy(() => import('../components/dashboard/widgets/QuickLinksWidget').then(m => ({ default: m.QuickLinksWidget })));
const ScratchpadWidget = lazy(() => import('../components/dashboard/widgets/ScratchpadWidget').then(m => ({ default: m.ScratchpadWidget })));
const MusicWidget = lazy(() => import('../components/dashboard/widgets/MusicWidget').then(m => ({ default: m.MusicWidget })));
const RecentWidget = lazy(() => import('../components/dashboard/widgets/RecentWidget').then(m => ({ default: m.RecentWidget })));
const PortfolioSummaryWidget = lazy(() => import('../components/dashboard/widgets/PortfolioSummaryWidget').then(m => ({ default: m.PortfolioSummaryWidget })));
const LLMPlaygroundWidget = lazy(() => import('../components/dashboard/widgets/LLMPlaygroundWidget').then(m => ({ default: m.LLMPlaygroundWidget })));
const VoiceControlWidget = lazy(() => import('../components/dashboard/widgets/VoiceControlWidget').then(m => ({ default: m.VoiceControlWidget })));
const FearGreedWidget = lazy(() => import('../components/dashboard/widgets/FearGreedWidget').then(m => ({ default: m.FearGreedWidget })));

import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

import type { WidgetType, WidgetConfig } from '../types/dashboard';

import {
    WIDGET_CATALOG,
    DEFAULT_LAYOUT,
    DEFAULT_WIDGETS
} from '../config/dashboardConfig';

export function Dashboard() {
    const [time, setTime] = useState(new Date());
    const [greeting, setGreeting] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [showWidgetPicker, setShowWidgetPicker] = useState(false);

    const LAYOUT_VERSION = 'v3-phase2'; // bump this to clear cached layouts

    const [layouts, setLayouts] = useState<{ lg: any[] }>({ lg: DEFAULT_LAYOUT });
    const [widgets, setWidgets] = useState<WidgetConfig[]>(DEFAULT_WIDGETS);
    const containerRef = useRef<HTMLDivElement>(null);
    const [gridWidth, setGridWidth] = useState(1200);

    // Track container width via ResizeObserver so grid always fills real estate
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const ro = new ResizeObserver(([entry]) => {
            setGridWidth(entry.contentRect.width);
        });
        ro.observe(el);
        setGridWidth(el.getBoundingClientRect().width);
        return () => ro.disconnect();
    }, []);

    useEffect(() => {
        const storedVersion = localStorage.getItem('dashboard-version');

        // If version mismatch, clear stale cache and use new defaults
        if (storedVersion !== LAYOUT_VERSION) {
            localStorage.removeItem('dashboard-layout');
            localStorage.removeItem('dashboard-widgets');
            localStorage.setItem('dashboard-version', LAYOUT_VERSION);
            return;
        }

        const saved = localStorage.getItem('dashboard-layout');
        const savedWidgets = localStorage.getItem('dashboard-widgets');
        
        if (saved) {
            try { setLayouts(JSON.parse(saved)); } catch { }
        }
        if (savedWidgets) {
            try { setWidgets(JSON.parse(savedWidgets)); } catch { }
        }
    }, []);

    const onLayoutChange = useCallback((_: any, allLayouts: any) => {
        setLayouts(allLayouts as { lg: any[] });
        localStorage.setItem('dashboard-layout', JSON.stringify(allLayouts));
    }, []);

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Good morning');
        else if (hour < 17) setGreeting('Good afternoon');
        else setGreeting('Good evening');

        const timer = setInterval(() => setTime(new Date()), 1000);

        return () => clearInterval(timer);
    }, []);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if user is typing in an input field
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }

            // E - Toggle edit mode
            if (e.key === 'e' || e.key === 'E') {
                e.preventDefault();
                setEditMode(prev => !prev);
            }

            // + or = - Open widget picker (only in edit mode)
            if ((e.key === '+' || e.key === '=') && editMode) {
                e.preventDefault();
                setShowWidgetPicker(true);
            }

            // Escape - Close widget picker or exit edit mode
            if (e.key === 'Escape') {
                if (showWidgetPicker) {
                    setShowWidgetPicker(false);
                } else if (editMode) {
                    setEditMode(false);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [editMode, showWidgetPicker]);



    function addWidget(type: WidgetType) {
        const id = `${type}-${Date.now()}`;
        const config = WIDGET_CATALOG[type];
        const newWidget: WidgetConfig = { i: id, type, title: config.title, icon: config.icon };
        const newLayout = { 
            i: id, 
            x: 0, 
            y: Infinity, 
            w: config.defaultW, 
            h: config.defaultH, 
            minW: config.minW, 
            minH: config.minH 
        } as any;

        setWidgets(prev => {
            const updated = [...prev, newWidget];
            localStorage.setItem('dashboard-widgets', JSON.stringify(updated));
            return updated;
        });
        setLayouts(prev => {
            const updated = { ...prev, lg: [...(prev.lg || []), newLayout] };
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
            const updated = { ...prev, lg: (prev.lg || []).filter((l: any) => l.i !== id) };
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

    function renderWidgetContent(widget: WidgetConfig) {
        const widgetComponent = (() => {
            switch (widget.type) {
                case 'quick_ai': return <QuickAIWidget />;
                case 'calendar': return <CalendarWidget />;
                case 'news': return <NewsWidget />;
                case 'tasks': return <TasksWidget />;
                case 'quote': return <QuoteWidget />;
                case 'system': return <SystemStatsWidget />;
                case 'quicklinks': return <QuickLinksWidget />;
                case 'scratchpad': return <ScratchpadWidget />;
                case 'music': return <MusicWidget />;
                case 'recent': return <RecentWidget />;
                case 'portfolio': return <PortfolioSummaryWidget />;
                case 'llm_playground': return <LLMPlaygroundWidget />;
                case 'voice_control': return <VoiceControlWidget />;
                case 'fear_greed': return <FearGreedWidget />;
                default: return <div className="text-gray-500 flex items-center justify-center h-full text-xs font-mono uppercase tracking-widest">Unknown widget</div>;
            }
        })();

        return (
            <ErrorBoundary>
                <Suspense fallback={
                    <div className="flex items-center justify-center h-full">
                        <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                    </div>
                }>
                    {widgetComponent}
                </Suspense>
            </ErrorBoundary>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto w-full custom-scrollbar bg-[#0a0a0f] bg-mesh-cyan relative text-gray-200 pb-12">
            
            {/* Ambient Background Glows */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px] mix-blend-screen" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[120px] mix-blend-screen" />
            </div>

            <div className="max-w-[1600px] mx-auto px-6 py-10 z-10 relative">
                {/* Header */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-12">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black mb-2 flex items-center gap-3 tracking-tight">
                            {greeting}, <span className="text-gradient-cyan">Dunker</span> <span className="animate-bounce-slow">👋</span>
                        </h1>
                        <div className="flex items-center gap-3 text-white/30 text-[10px] font-black uppercase tracking-[0.2em]">
                            <span className="flex items-center gap-1.5"><Settings size={12}/> {time.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
                            <span className="w-1 h-1 bg-white/20 rounded-full" />
                            <span className="font-mono text-cyan-400 tracking-normal">{time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setEditMode(!editMode)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all border shadow-lg ${editMode 
                                ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30 shadow-cyan-500/10' 
                                : 'bg-white/5 text-white/50 border-white/5 hover:text-white hover:bg-white/10 hover:border-white/20'}`}
                        >
                            <Settings size={14} />
                            {editMode ? 'Lock Layout' : 'Personalize OS'}
                        </button>

                        {editMode && (
                            <AnimatePresence>
                                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex gap-2">
                                    <button onClick={() => setShowWidgetPicker(true)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition-all text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/10 active:scale-95">
                                        <Plus size={14} /> New Module
                                    </button>
                                    <button onClick={resetLayout} className="px-5 py-2.5 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-all text-[10px] font-black uppercase tracking-widest active:scale-95">
                                        Factory Reset
                                    </button>
                                </motion.div>
                            </AnimatePresence>
                        )}
                    </div>
                </div>

                {/* Grid Area */}
                <div ref={containerRef} className="dashboard-grid-container min-h-[600px] relative">
                    <ResponsiveGridLayout
                        className="layout"
                        layouts={layouts}
                        width={gridWidth}
                        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                        cols={{ lg: 4, md: 3, sm: 2, xs: 1, xxs: 1 }}
                        rowHeight={100}
                        isDraggable={editMode}
                        isResizable={editMode}
                        onLayoutChange={onLayoutChange}
                        draggableHandle=".drag-handle"
                        margin={[24, 24]}
                        useCSSTransforms={true}
                    >
                        {widgets.map((widget, index) => (
                            <div key={widget.i}>
                                <div
                                    className={`h-full flex flex-col group transition-all duration-500 glass-card border-white/5 ${editMode ? 'ring-2 ring-cyan-500/40 ring-offset-4 ring-offset-[#0a0a0f] cursor-move scale-[0.98]' : 'hover:border-white/20 hover:shadow-2xl hover:shadow-cyan-500/5'}`}
                                    style={{
                                        animation: `fadeInUp 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) ${index * 0.05}s backwards`
                                    }}
                                >
                                    {/* Widget Header */}
                                    <div className={`flex items-center justify-between px-5 py-3.5 shrink-0 border-b border-white/5 transition-colors ${editMode ? 'drag-handle bg-cyan-500/10' : 'bg-white/[0.01]'}`}>
                                        <h3 className="font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-3 text-white/60 group-hover:text-white transition-colors">
                                            {editMode && <Move size={12} className="text-cyan-400 animate-pulse" />}
                                            <span className="text-sm scale-110 grayscale group-hover:grayscale-0 transition-all filter">{widget.icon}</span> {widget.title}
                                        </h3>
                                        {editMode && (
                                            <button onClick={() => removeWidget(widget.i)} className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all hover:scale-110 active:scale-90">
                                                <X size={14} />
                                            </button>
                                        )}
                                    </div>

                                    {/* Widget Content Area */}
                                    <div className="flex-1 overflow-hidden p-5 relative bg-gradient-to-br from-white/[0.01] to-transparent">
                                        {renderWidgetContent(widget)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </ResponsiveGridLayout>
                </div>
            </div>

            {/* Widget Picker Modal */}
            <AnimatePresence>
                {showWidgetPicker && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-xl z-50 flex items-center justify-center p-4"
                        onClick={() => setShowWidgetPicker(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 30 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 30 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="glass-card max-w-2xl w-full border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] p-8 relative overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Accent Glow */}
                            <div className="absolute -top-24 -right-24 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px]" />
                            
                            <div className="flex items-center justify-between mb-10 relative z-10">
                                <div>
                                    <h2 className="text-2xl font-black flex items-center gap-3 tracking-tight">
                                        <Plus className="text-cyan-400 w-6 h-6" />
                                        Nexus <span className="text-gradient-cyan uppercase tracking-widest text-lg">Modules</span>
                                    </h2>
                                    <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.2em] mt-1">Select capability to hot-swap into local OS</p>
                                </div>
                                <button onClick={() => setShowWidgetPicker(false)} className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/30 hover:text-white transition-all transform hover:rotate-90">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative z-10 max-h-[60vh] overflow-y-auto custom-scrollbar pr-4">
                                {Object.entries(WIDGET_CATALOG).map(([type, config], idx) => (
                                    <motion.button
                                        key={type}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.03 }}
                                        onClick={() => addWidget(type as WidgetType)}
                                        className="p-5 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-cyan-500/10 hover:border-cyan-500/40 text-left transition-all group flex flex-col items-center justify-center text-center gap-4 relative overflow-hidden"
                                    >
                                        <div className="text-4xl bg-black/40 p-4 rounded-2xl group-hover:scale-110 group-hover:bg-cyan-500/20 transition-all duration-300 shadow-xl group-hover:shadow-cyan-500/10">
                                            {config.icon}
                                        </div>
                                        <div className="text-[10px] font-black uppercase tracking-[0.1em] text-white/50 group-hover:text-cyan-400 transition-colors">
                                            {config.title.split(' ').pop()}
                                        </div>
                                        
                                        {/* Hover Indicator */}
                                        <div className="absolute inset-x-0 bottom-0 h-1 bg-cyan-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
