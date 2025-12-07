'use client';

import { useVibe } from './VibeContext';
import { motion } from 'framer-motion';

export default function VibeController() {
    const { mode, setMode, metrics } = useVibe();

    return (
        <motion.div
            className="fixed bottom-4 right-4 z-50 glass p-4 flex flex-col gap-3 min-w-[200px]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm uppercase tracking-wider text-gray-400">System Vibe</h3>
                <div className={`w-2 h-2 rounded-full ${mode === 'normal' ? 'bg-green-500' :
                        mode === 'high-load' ? 'bg-yellow-500' :
                            mode === 'crisis' ? 'bg-red-500' : 'bg-blue-500'
                    } animate-pulse`} />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-2">
                <div>GPU: {metrics.gpuUsage}%</div>
                <div>CPU: {metrics.cpuUsage}%</div>
                <div>Errors: {metrics.errorRate}/m</div>
            </div>

            <div className="grid grid-cols-2 gap-2">
                {(['normal', 'high-load', 'crisis', 'focus'] as const).map((m) => (
                    <button
                        key={m}
                        onClick={() => setMode(m)}
                        className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${mode === m
                                ? 'bg-cyan-500 text-black shadow-[0_0_10px_rgba(0,245,212,0.5)]'
                                : 'bg-white/5 hover:bg-white/10 text-gray-400'
                            }`}
                    >
                        {m.replace('-', ' ')}
                    </button>
                ))}
            </div>
        </motion.div>
    );
}
