import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, Cpu, Zap, AlertTriangle, Focus, ChevronDown } from 'lucide-react';
import { useVibe } from '../contexts/VibeContext';

const VIBE_MODES = [
    {
        id: 'normal' as const,
        label: 'Normal',
        icon: Activity,
        color: 'text-cyan-400',
        border: 'border-cyan-500/30',
        bg: 'bg-cyan-500/10',
        dot: 'bg-cyan-400',
        desc: 'Full effects enabled',
    },
    {
        id: 'high-load' as const,
        label: 'High Load',
        icon: Cpu,
        color: 'text-amber-400',
        border: 'border-amber-500/30',
        bg: 'bg-amber-500/10',
        dot: 'bg-amber-400',
        desc: 'Reduced blur & glows',
    },
    {
        id: 'crisis' as const,
        label: 'Crisis',
        icon: AlertTriangle,
        color: 'text-red-400',
        border: 'border-red-500/30',
        bg: 'bg-red-500/10',
        dot: 'bg-red-500',
        desc: 'Red alert mode',
    },
    {
        id: 'focus' as const,
        label: 'Focus',
        icon: Focus,
        color: 'text-blue-400',
        border: 'border-blue-500/30',
        bg: 'bg-blue-500/10',
        dot: 'bg-blue-400',
        desc: 'Minimal distractions',
    },
] as const;

export default function VibeController() {
    const { mode, setMode, metrics } = useVibe();
    const [expanded, setExpanded] = useState(false);

    const current = VIBE_MODES.find(v => v.id === mode) ?? VIBE_MODES[0];
    const Icon = current.icon;

    return (
        <motion.div
            className="fixed bottom-6 right-6 z-50 select-none"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.4 }}
        >
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        key="panel"
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.18 }}
                        className="mb-3 glass-card border-white/10 backdrop-blur-2xl shadow-2xl w-[220px] overflow-hidden"
                        role="menu"
                        aria-label="Vibe mode selector"
                    >
                        {/* Header */}
                        <div className="px-4 py-3 border-b border-white/5">
                            <div className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20 mb-3">System Vibe</div>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[9px] font-bold uppercase tracking-widest">
                                <span className="text-white/20">GPU</span>
                                <span className={current.color}>{metrics?.gpuUsage ?? 0}%</span>
                                <span className="text-white/20">CPU</span>
                                <span className={current.color}>{metrics?.cpuUsage ?? 0}%</span>
                                <span className="text-white/20">Errors</span>
                                <span className={metrics?.errorRate ? 'text-red-400' : 'text-white/40'}>{metrics?.errorRate ?? 0}/m</span>
                            </div>
                        </div>

                        {/* Mode Buttons */}
                        <div className="p-2 space-y-1">
                            {VIBE_MODES.map((v) => {
                                const VIcon = v.icon;
                                const isActive = mode === v.id;
                                return (
                                    <button
                                        key={v.id}
                                        onClick={() => { setMode(v.id); setExpanded(false); }}
                                        role="menuitemradio"
                                        aria-checked={isActive}
                                        className={`w-full px-3 py-2.5 rounded-xl flex items-center gap-3 text-left transition-all ${
                                            isActive
                                                ? `${v.bg} border ${v.border} ${v.color}`
                                                : 'bg-white/[0.02] border border-transparent text-white/30 hover:bg-white/5 hover:text-white/60'
                                        }`}
                                    >
                                        <VIcon size={13} aria-hidden="true" />
                                        <div>
                                            <div className="text-[9px] font-black uppercase tracking-widest">{v.label}</div>
                                            <div className="text-[8px] opacity-50 normal-case tracking-normal font-normal">{v.desc}</div>
                                        </div>
                                        {isActive && (
                                            <div className={`ml-auto w-1.5 h-1.5 rounded-full ${v.dot} animate-pulse`} />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Trigger Pill */}
            <button
                onClick={() => setExpanded(prev => !prev)}
                aria-label={`Vibe mode: ${current.label}. Click to ${expanded ? 'close' : 'open'} selector`}
                aria-expanded={expanded}
                aria-haspopup="true"
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl glass-card border backdrop-blur-2xl shadow-2xl transition-all ${current.border} hover:scale-[1.03] active:scale-[0.98]`}
            >
                <div className={`w-2 h-2 rounded-full ${current.dot} ${mode !== 'focus' ? 'animate-pulse' : ''}`} aria-hidden="true" />
                <Icon size={13} className={current.color} aria-hidden="true" />
                <span className={`text-[9px] font-black uppercase tracking-widest ${current.color}`}>{current.label}</span>
                <Zap size={10} className="text-white/20" aria-hidden="true" />
                <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown size={12} className="text-white/30" />
                </motion.div>
            </button>
        </motion.div>
    );
}
