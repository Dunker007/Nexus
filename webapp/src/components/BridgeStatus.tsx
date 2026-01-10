'use client';

import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Zap, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettings } from '@/components/SettingsContext';

export function BridgeStatus() {
    const { settings } = useSettings();
    const [status, setStatus] = useState<'online' | 'offline' | 'checking'>('checking');

    const checkStatus = useCallback(async () => {
        setStatus('checking');
        try {
            // Short timeout to feel responsive
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);

            // Use dynamic bridge URL from settings
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
        } catch (error) {
            console.error('Bridge check failed:', error);
            setStatus('offline');
        }
    }, [settings.bridgeUrl]);

    // Check on mount and when URL changes
    useEffect(() => {
        setTimeout(() => checkStatus(), 0);

        // Auto-check periodically
        const interval = setInterval(checkStatus, 30000);
        return () => clearInterval(interval);
    }, [checkStatus]);

    return (
        <div className="flex items-center gap-2">
            <AnimatePresence mode="wait">
                {status === 'online' ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium"
                    >
                        <Zap size={12} className="fill-current" />
                        <span>Connected</span>
                    </motion.div>
                ) : status === 'offline' ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium"
                    >
                        <AlertCircle size={12} />
                        <span>Disconnected</span>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-medium"
                    >
                        <RefreshCw size={12} className="animate-spin" />
                        <span>Connecting...</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <button
                onClick={checkStatus}
                disabled={status === 'checking'}
                className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                title={`Sync Bridge Status (Target: ${settings.bridgeUrl})`}
            >
                <RefreshCw size={16} className={status === 'checking' ? 'animate-spin' : ''} />
            </button>
        </div>
    );
}
