import { useState, useEffect, useCallback, useRef } from 'react';
import { Responsive } from 'react-grid-layout';
const ResponsiveGridLayout = Responsive as any;

import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Settings, Move } from 'lucide-react';

import { QuickAIWidget } from '../components/dashboard/widgets/QuickAIWidget';
import { CalendarWidget } from '../components/dashboard/widgets/CalendarWidget';
import { NewsWidget } from '../components/dashboard/widgets/NewsWidget';
import { TasksWidget } from '../components/dashboard/widgets/TasksWidget';
import { QuoteWidget } from '../components/dashboard/widgets/QuoteWidget';
import { SystemStatsWidget } from '../components/dashboard/widgets/SystemStatsWidget';
import { QuickLinksWidget } from '../components/dashboard/widgets/QuickLinksWidget';
import { ScratchpadWidget } from '../components/dashboard/widgets/ScratchpadWidget';
import { MusicWidget } from '../components/dashboard/widgets/MusicWidget';
import { RecentWidget } from '../components/dashboard/widgets/RecentWidget';
import { PortfolioSummaryWidget } from '../components/dashboard/widgets/PortfolioSummaryWidget';
import { LLMPlaygroundWidget } from '../components/dashboard/widgets/LLMPlaygroundWidget';
import { VoiceControlWidget } from '../components/dashboard/widgets/VoiceControlWidget';
import { FearGreedWidget } from '../components/dashboard/widgets/FearGreedWidget';

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
    }

    return (
        <div className="flex-1 overflow-y-auto w-full custom-scrollbar bg-[#0b0e11] relative text-gray-200 pb-12">
            
            {/* Background Details */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-[120px] mix-blend-screen overflow-hidden" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/5 rounded-full blur-[120px] mix-blend-screen overflow-hidden" />
            </div>

            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 z-10 relative">
                {/* Header */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold mb-1 flex items-center gap-2 tracking-tight">
                            {greeting}, <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Dunker</span> 👋
                        </h1>
                        <p className="text-white/40 text-xs font-bold uppercase tracking-widest">
                            {time.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                            <span className="mx-2 text-white/20">|</span>
                            <span className="font-mono text-cyan-400">{time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setEditMode(!editMode)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border ${editMode ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' : 'bg-[#12121a] text-white/50 border-white/5 hover:text-white hover:border-white/10'}`}
                        >
                            <Settings size={14} />
                            {editMode ? 'Done Editing' : 'Edit OS'}
                        </button>

                        {editMode && (
                            <AnimatePresence>
                                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex gap-2 text-xs font-bold uppercase tracking-wider">
                                    <button onClick={() => setShowWidgetPicker(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 transition-colors">
                                        <Plus size={14} /> Widget
                                    </button>
                                    <button onClick={resetLayout} className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors">
                                        Reset
                                    </button>
                                </motion.div>
                            </AnimatePresence>
                        )}
                    </div>
                </div>

                {/* Grid Area */}
                <div ref={containerRef} className="dashboard-grid-container min-h-[600px] border border-transparent rounded-2xl p-1 bg-white/[0.01]">
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
                        margin={[16, 16]}
                        useCSSTransforms={true}
                    >
                        {widgets.map((widget, index) => (
                            <div
                                key={widget.i}
                                className={`rounded-2xl border border-white/10 bg-[#0d0d14] backdrop-blur-md flex flex-col group transition-colors shadow-lg ${editMode ? 'ring-2 ring-cyan-500/30 ring-offset-2 ring-offset-[#0b0e11] cursor-move' : 'hover:border-cyan-500/20'}`}
                                style={{
                                    animation: `fadeInUp 0.3s ease-out ${index * 0.05}s backwards`
                                }}
                            >
                                {/* Widget Header */}
                                <div className={`flex items-center justify-between p-3 shrink-0 border-b border-white/5 bg-white/[0.02] rounded-t-2xl ${editMode ? 'drag-handle bg-cyan-500/10' : ''}`}>
                                    <h3 className="font-bold text-xs uppercase tracking-wider flex items-center gap-2 text-white/80">
                                        {editMode && <Move size={12} className="text-cyan-400" />}
                                        <span className="opacity-80 group-hover:opacity-100">{widget.icon}</span> {widget.title}
                                    </h3>
                                    {editMode && (
                                        <button onClick={() => removeWidget(widget.i)} className="p-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors">
                                            <X size={12} />
                                        </button>
                                    )}
                                </div>

                                {/* Widget Content Area */}
                                <div className="flex-1 overflow-hidden p-3 relative bg-gradient-to-br from-white/[0.01] to-transparent rounded-b-2xl">
                                    {renderWidgetContent(widget)}
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
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowWidgetPicker(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-[#12121a] border border-white/10 rounded-2xl max-w-2xl w-full shadow-2xl p-6 relative overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 pointer-events-none" />
                            
                            <div className="flex items-center justify-between mb-6 relative z-10">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <Plus className="text-cyan-400" />
                                    Add Module
                                </h2>
                                <button onClick={() => setShowWidgetPicker(false)} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 relative z-10 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
                                {Object.entries(WIDGET_CATALOG).map(([type, config]) => (
                                    <button
                                        key={type}
                                        onClick={() => addWidget(type as WidgetType)}
                                        className="p-4 rounded-xl border border-white/5 bg-black/40 hover:bg-cyan-500/10 hover:border-cyan-500/30 text-left transition-all group flex flex-col items-center justify-center text-center gap-3"
                                    >
                                        <div className="text-3xl bg-white/5 p-3 rounded-lg group-hover:scale-110 transition-transform">{config.icon}</div>
                                        <div className="text-xs font-bold uppercase tracking-wider text-white/70 group-hover:text-cyan-400">{config.title.replace(/^.+\s/, '')}</div>
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
