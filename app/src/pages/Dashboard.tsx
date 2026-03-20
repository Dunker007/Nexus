import { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react';
import { Responsive } from 'react-grid-layout';
const ResponsiveGridLayout = Responsive as any;

import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Settings, Move, LayoutDashboard, Clock, Calendar } from 'lucide-react';
import { ErrorBoundary } from '../components/ErrorBoundary';
import PageLayout, { PageHeader, StatPill } from '../components/PageLayout';

// Lazy load widgets
const QuickAIWidget = lazy(() => import('../components/dashboard/widgets/QuickAIWidget').then(m => ({ default: m.QuickAIWidget })));
const BasicAIWidget = lazy(() => import('../components/dashboard/widgets/BasicAIWidget').then(m => ({ default: m.BasicAIWidget })));
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

  const LAYOUT_VERSION = 'v4-phase2'; // update for layout reset

  const [layouts, setLayouts] = useState<{ lg: any[] }>({ lg: DEFAULT_LAYOUT });
  const [widgets, setWidgets] = useState<WidgetConfig[]>(DEFAULT_WIDGETS);
  const containerRef = useRef<HTMLDivElement>(null);
  const [gridWidth, setGridWidth] = useState(1200);

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
        case 'basic_ai': return <BasicAIWidget />;
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
          <div className="flex items-center justify-center h-full" role="status" aria-label="Loading widget">
            <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin shadow-[0_0_10px_rgba(6,182,212,0.4)]" />
          </div>
        }>
          {widgetComponent}
        </Suspense>
      </ErrorBoundary>
    );
  }

  return (
    <PageLayout color="cyan" noPadding>
      <div className="w-full max-w-[2000px] mx-auto px-4 md:px-8 py-10 pb-20 flex flex-col justify-start">
        <PageHeader
          title={`${greeting}, Dunker`}
          subtitle="COMMAND CENTER • NEURAL INTERFACE v4.0"
          icon={<LayoutDashboard size={24} className="text-cyan-400" />}
          actions={
            <div className="flex flex-wrap items-center gap-3">
              <StatPill
                icon={<Clock size={14} />}
                label={time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                color="cyan"
              />
              <StatPill
                icon={<Calendar size={14} />}
                label={time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                color="blue"
              />
              <div className="w-px h-6 bg-white/10 mx-2 hidden sm:block" />
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditMode(!editMode)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                    editMode
                      ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
                      : 'bg-white/5 text-white/40 border-white/10 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Settings size={14} className={editMode ? 'animate-spin-slow' : ''} />
                  {editMode ? 'Lock Matrix' : 'Modify UI'}
                </button>

                <AnimatePresence>
                  {editMode && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex gap-2"
                    >
                      <button
                        onClick={() => setShowWidgetPicker(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all text-[10px] font-black uppercase tracking-widest"
                      >
                        <Plus size={14} /> Add Module
                      </button>
                      <button
                        onClick={resetLayout}
                        className="px-4 py-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all text-[10px] font-black uppercase tracking-widest"
                      >
                        Reset
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          }
        />

        {/* Dynamic Grid Area */}
        <div ref={containerRef} className="mt-8 relative z-10">
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
            margin={[20, 20]}
            useCSSTransforms={true}
          >
            {widgets.map((widget, index) => (
              <div key={widget.i}>
                <div
                  className={`h-full flex flex-col group transition-all duration-500 glass-card border-white/5 ${
                    editMode
                      ? 'ring-2 ring-cyan-500/40 ring-offset-4 ring-offset-[#0a0a0f] cursor-move scale-[0.98]'
                      : 'hover:border-white/20 hover:shadow-[0_0_30px_rgba(6,182,212,0.1)]'
                  }`}
                  style={{
                    animation: `fadeInUp 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) ${index * 0.05}s backwards`
                  }}
                >
                  {/* Widget Header */}
                  <div className={`flex items-center justify-between px-5 py-3 shrink-0 border-b border-white/5 transition-colors ${editMode ? 'drag-handle bg-cyan-500/10' : 'bg-white/[0.01]'}`}>
                    <h3 className="font-black text-[9px] uppercase tracking-[0.2em] flex items-center gap-3 text-white/40 group-hover:text-cyan-400 transition-colors">
                      {editMode && <Move size={12} className="text-cyan-400 animate-pulse" />}
                      <span className="text-sm scale-110 grayscale group-hover:grayscale-0 transition-all filter drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">{widget.icon}</span> {widget.title}
                    </h3>
                    {editMode && (
                      <button onClick={() => removeWidget(widget.i)} className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all hover:scale-110" aria-label={`Remove ${widget.title} widget`}>
                        <X size={14} aria-hidden="true" />
                      </button>
                    )}
                  </div>

                  {/* Content Area */}
                  <div className="flex-1 overflow-hidden p-5 relative bg-gradient-to-br from-white/[0.01] to-transparent">
                    {renderWidgetContent(widget)}
                  </div>

                  {/* Resize Handle Indicator (Edit Mode) */}
                  {editMode && (
                      <div className="absolute bottom-1 right-1 w-2 h-2 border-r-2 border-b-2 border-cyan-500/40 rounded-br-sm" />
                  )}
                </div>
              </div>
            ))}
          </ResponsiveGridLayout>
        </div>
      </div>

      {/* Widget Picker Modal */}
      <AnimatePresence>
        {showWidgetPicker && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Add widget">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
              onClick={() => setShowWidgetPicker(false)}
              aria-hidden="true"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              className="glass-card max-w-2xl w-full border-white/10 shadow-2xl p-8 relative overflow-hidden bg-[#0d0d14]/90"
              onClick={e => e.stopPropagation()}
            >
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px]" />

              <div className="flex items-center justify-between mb-10 relative z-10">
                <div>
                  <h2 className="text-2xl font-black flex items-center gap-3 tracking-tighter text-white">
                    <Plus className="text-cyan-400 w-6 h-6" aria-hidden="true" />
                    INTERFACE <span className="text-cyan-400">MODULES</span>
                  </h2>
                  <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.2em] mt-1">Select capability to hot-swap into local OS</p>
                </div>
                <button onClick={() => setShowWidgetPicker(false)} className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/30 hover:text-white transition-all transform hover:rotate-90" aria-label="Close widget picker">
                  <X size={20} aria-hidden="true" />
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
                    aria-label={`Add ${config.title} widget`}
                    className="p-5 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-cyan-500/10 hover:border-cyan-500/40 text-left transition-all group flex flex-col items-center justify-center text-center gap-4 relative overflow-hidden"
                  >
                    <div className="text-4xl bg-black/40 p-4 rounded-2xl group-hover:scale-110 group-hover:bg-cyan-500/20 transition-all duration-300 shadow-xl group-hover:shadow-cyan-500/10">
                      {config.icon}
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-[0.1em] text-white/50 group-hover:text-cyan-400 transition-colors uppercase">
                      {config.title.split(' ').pop()}
                    </div>
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-cyan-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PageLayout>
  );
}
