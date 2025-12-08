'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';

const LUXRIG_BRIDGE_URL = process.env.NEXT_PUBLIC_BRIDGE_URL || 'http://localhost:3456';

export default function VoiceControl() {
    const [processing, setProcessing] = useState(false);
    const [response, setResponse] = useState<string | null>(null);

    // Command processing logic
    const processCommand = useCallback(async (command: string) => {
        if (!command) return;

        setProcessing(true);
        try {
            // Local Command Router
            const lowerCmd = command.toLowerCase().trim();
            let handled = false;
            let localResponse = '';

            // Navigation map
            const navRoutes: Record<string, string> = {
                'go to home': '/', 'go home': '/',
                'go to dashboard': '/',
                'open chat': '/chat', 'go to chat': '/chat',
                'open labs': '/labs', 'go to labs': '/labs',
                'open agents': '/agents', 'go to agents': '/agents',
                'open meeting': '/meeting', 'start meeting': '/meeting',
                'open income': '/income', 'go to income': '/income',
                'open music': '/music', 'go to music': '/music',
                'open settings': '/settings', 'go to settings': '/settings',
            };

            // Check local commands
            for (const [phrase, route] of Object.entries(navRoutes)) {
                if (lowerCmd.includes(phrase)) {
                    window.location.href = route;
                    handled = true;
                    localResponse = `Navigating to ${route}`;
                    break;
                }
            }

            if (!handled) {
                if (lowerCmd.includes('command palette')) {
                    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
                    handled = true;
                    localResponse = 'Opening command palette';
                } else if (lowerCmd.includes('dark mode') || lowerCmd.includes('light mode')) {
                    window.dispatchEvent(new CustomEvent('toggle-theme'));
                    handled = true;
                    localResponse = 'Toggling theme';
                }
            }

            if (handled) {
                setResponse(localResponse);
                setProcessing(false);
                setTimeout(() => setResponse(null), 3000);
                return;
            }

            // Bridge API Fallback
            const res = await fetch(`${LUXRIG_BRIDGE_URL}/agents/execute`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    agentType: 'intent',
                    task: { command }
                })
            });

            const data = await res.json();
            if (data.result) {
                setResponse(data.result.message || 'Command executed.');
                if (data.result.action === 'navigate') {
                    window.location.href = data.result.target;
                }
            }
        } catch (error) {
            console.error('Voice command failed:', error);
            setResponse('Voice command noted. Bridge offline.');
        } finally {
            setProcessing(false);
            setTimeout(() => setResponse(null), 5000);
        }
    }, []);

    // Use the custom hook
    const { isListening, transcript, toggleListening, hasSupport } = useSpeechRecognition({
        onEnd: () => {
            // We need access to the latest transcript here. 
            // Since the hook manages transcript state, we might rely on the 'transcript' variable from the hook return.
            // However, closure staleness might be an issue.
            // Better pattern: Pass a mostly-stable callback to onEnd, but getting the final transcript 
            // usually requires the hook to return it or pass it to onEnd/onResult.
            // Let's rely on onResult to capture it or just delay processing slightly?
            // Actually, the simplest way is to trigger processCommand when isListening goes false *if* we have a transcript.
            // But isListening updates *after* onEnd.

            // Check hook implementation: onEnd is called when recognition ends. 
            // Let's modify hook to pass final transcript? Or just use a useEffect in component.
        }
    });

    // Effect to trigger processing when listening stops
    useEffect(() => {
        if (!isListening && transcript) {
            processCommand(transcript);
        }
    }, [isListening, transcript, processCommand]);

    if (!hasSupport) return null;

    return (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-4">
            <AnimatePresence>
                {(transcript || response) && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.9 }}
                        className="glass px-6 py-3 rounded-full flex items-center gap-3 min-w-[300px] justify-center"
                    >
                        {processing ? (
                            <span className="animate-spin text-cyan-400">⚡</span>
                        ) : (
                            <span className="text-xl">
                                {response ? '🤖' : '🗣️'}
                            </span>
                        )}
                        <span className={`font-mono text-sm ${response ? 'text-cyan-400' : 'text-white'}`}>
                            {response || transcript || 'Listening...'}
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                onClick={toggleListening}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl shadow-lg transition-all ${isListening
                    ? 'bg-red-500 shadow-[0_0_30px_rgba(255,0,0,0.5)] animate-pulse'
                    : 'bg-cyan-500 text-black shadow-[0_0_20px_rgba(0,245,212,0.3)]'
                    }`}
            >
                {isListening ? '🛑' : '🎙️'}
            </motion.button>
        </div>
    );
}
