'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, X } from 'lucide-react';

export default function ConsentBanner() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('dlx-ai-consent');
        if (!consent) {
            setIsVisible(true);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('dlx-ai-consent', 'accepted');
        setIsVisible(false);
    };

    const handleDecline = () => {
        localStorage.setItem('dlx-ai-consent', 'declined');
        setIsVisible(false);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-0 left-0 right-0 z-50 p-4 flex justify-center pointer-events-none"
                >
                    <div className="glass-card pointer-events-auto max-w-2xl w-full flex flex-col md:flex-row items-center gap-4 bg-[#0a0a0f]/95 border-t border-cyan-500/30 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
                        <div className="p-3 bg-cyan-500/10 rounded-full">
                            <ShieldCheck className="text-cyan-400" size={24} />
                        </div>

                        <div className="flex-1 text-center md:text-left">
                            <h3 className="font-bold text-white mb-1">AI Data Usage & Ethics</h3>
                            <p className="text-sm text-gray-400">
                                This platform uses autonomous AI agents (local LLMs) to process data.
                                Inputs may be sent to your local LuxRig. No data leaves your network unless configured.
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={handleDecline}
                                className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                            >
                                Opt Out
                            </button>
                            <button
                                onClick={handleAccept}
                                className="px-6 py-2 rounded-lg text-sm font-bold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-900/20"
                            >
                                Accept & Continue
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
