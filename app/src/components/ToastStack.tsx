import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useToast, type Toast } from '../contexts/ToastContext';

const ICONS: Record<Toast['type'], string> = {
  success: '✅',
  error:   '❌',
  info:    'ℹ️',
  warning: '⚠️',
};

const STYLES: Record<Toast['type'], { bar: string; glow: string }> = {
  success: { bar: 'bg-emerald-500',  glow: 'shadow-emerald-500/20' },
  error:   { bar: 'bg-red-500',     glow: 'shadow-red-500/20' },
  info:    { bar: 'bg-cyan-500',    glow: 'shadow-cyan-500/20' },
  warning: { bar: 'bg-amber-500',   glow: 'shadow-amber-500/20' },
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const { bar, glow } = STYLES[toast.type];
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = progressRef.current;
    if (!el) return;
    el.style.transition = `width ${toast.duration ?? 4000}ms linear`;
    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => { el.style.width = '0%'; });
    });
    return () => cancelAnimationFrame(frame);
  }, [toast.duration]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={`relative flex items-start gap-3 w-80 bg-[#0d0d14]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl ${glow} overflow-hidden`}
    >
      {/* Accent bar left */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${bar} rounded-l-2xl`} />

      <span className="text-lg shrink-0 mt-0.5">{ICONS[toast.type]}</span>

      <p className="flex-1 text-sm text-white/85 leading-snug">{toast.message}</p>

      <button
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 text-white/30 hover:text-white/70 transition-colors text-xs mt-0.5"
        aria-label="Dismiss"
      >
        ✕
      </button>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-1 right-0 h-[2px] bg-white/5 rounded-full">
        <div
          ref={progressRef}
          className={`h-full ${bar} rounded-full`}
          style={{ width: '100%' }}
        />
      </div>
    </motion.div>
  );
}

export function ToastStack() {
  const { toasts, dismiss } = useToast();

  return (
    <div
      className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 items-end pointer-events-none"
      aria-live="polite"
      aria-label="Notifications"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map(t => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} onDismiss={dismiss} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
