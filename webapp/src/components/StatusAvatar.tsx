'use client';

import { useState, useEffect, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettings } from '@/components/SettingsContext';

// This replaces the generic avatar with a status-aware interactive indicator
export function StatusAvatar() {
    const { settings } = useSettings();
    const [status, setStatus] = useState<'online' | 'offline' | 'checking'>('checking');

    const checkStatus = useCallback(async () => {
        setStatus('checking');
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            const res = await fetch(`${settings.bridgeUrl}/health`, {
                signal: controller.signal,
                headers: { 'Cache-Control': 'no-cache' }
            });
            clearTimeout(timeoutId);

            if (res.ok) {
                setStatus('online');
            } else {
                setStatus('offline');
            }
        } catch (error: unknown) {
            // Ignore AbortError (timeout) and TypeError (network fail/offline)
            if (error instanceof Error && error.name !== 'AbortError' && error.message !== 'Failed to fetch') {
                console.error('Bridge check failed:', error);
            }
            setStatus('offline');
        }
    }, [settings.bridgeUrl]);

    // Check on mount and when settings URL changes
    useEffect(() => {
        setTimeout(() => checkStatus(), 0);
        const interval = setInterval(checkStatus, 60000); // Check every minute
        return () => clearInterval(interval);
    }, [checkStatus]);

    // Status colors
    const getStatusColor = () => {
        switch (status) {
            case 'online': return 'from-cyan-500 to-blue-500 border-cyan-400/50 shadow-cyan-500/50';
            case 'offline': return 'from-red-500 to-orange-500 border-red-400/50 shadow-red-500/50';
            case 'checking': return 'from-yellow-500 to-amber-500 border-yellow-400/50 shadow-yellow-500/50';
        }
    };

    return (
        <motion.button
            onClick={checkStatus}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative group focus:outline-none"
            title={`System Status: ${status.toUpperCase()} (Click to Sync)`}
            aria-label="System Status Avatar"
        >
            {/* Main Avatar Circle */}
            <div className={`
                w-9 h-9 rounded-full 
                bg-gradient-to-br ${getStatusColor()}
                border-2 transition-all duration-500
                flex items-center justify-center
                shadow-lg
            `}>
                <span className="text-white font-bold text-sm">D</span>
            </div>

            {/* Status Indicator Dot (Corner) */}
            <div className={`
                absolute -bottom-0.5 -right-0.5 
                w-3 h-3 rounded-full border-2 border-black
                ${status === 'online' ? 'bg-green-500' :
                    status === 'offline' ? 'bg-red-500' : 'bg-yellow-500'}
                z-10 transition-colors duration-300
            `}>
                {status === 'checking' && (
                    <div className="absolute inset-0 rounded-full animate-ping bg-yellow-400 opacity-75"></div>
                )}
            </div>

            {/* Sync Spinner Overlay (only when checking) */}
            <AnimatePresence>
                {status === 'checking' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-[1px]"
                    >
                        <RefreshCw size={14} className="text-white animate-spin" />
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.button>
    );
}
