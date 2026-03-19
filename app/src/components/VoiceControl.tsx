"use client";

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, Loader2, Sparkles } from 'lucide-react';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useNavigate } from 'react-router-dom';

export default function VoiceControl() {
    const navigate = useNavigate();
    const [processing, setProcessing] = useState(false);
    const [response, setResponse] = useState<string | null>(null);

    // Command processing logic
    const processCommand = useCallback(async (command: string) => {
        if (!command) return;

        setProcessing(true);
        try {
            const lowerCmd = command.toLowerCase().trim();
            let handled = false;
            let feedback = '';

            // 1. NAVIGATION COMMANDS
            const navRoutes: Record<string, string> = {
                'go to home': '/dashboard',
                'go home': '/dashboard',
                'go to dashboard': '/dashboard',
                'open chat': '/chat',
                'go to chat': '/chat',
                'open labs': '/labs',
                'go to labs': '/labs',
                'open portfolio': '/labs/smartfolio',
                'go to portfolio': '/labs/smartfolio',
                'open smartfolio': '/labs/smartfolio',
                'open agents': '/agents',
                'go to agents': '/agents',
                'open meeting': '/meeting',
                'start meeting': '/meeting',
                'open pipeline': '/pipeline',
                'open music': '/music',
                'open studios': '/studios',
                'open settings': '/settings',
                'go to settings': '/settings',
                'open drive': '/drive',
                'open intel': '/news',
                'open news': '/news',
            };

            for (const [phrase, route] of Object.entries(navRoutes)) {
                if (lowerCmd.includes(phrase)) {
                    navigate(route);
                    handled = true;
                    feedback = `Navigating to ${phrase.replace('go to ', '').replace('open ', '')}`;
                    break;
                }
            }

            // 2. SMARTFOLIO SPECIFIC COMMANDS (The "10%" Polish)
            if (!handled) {
                if (lowerCmd.includes('how is the portfolio') || lowerCmd.includes('portfolio health')) {
                    navigate('/labs/smartfolio');
                    feedback = 'Opening portfolio health check...';
                    handled = true;
                } else if (lowerCmd.includes('show me sui') || lowerCmd.includes('check sui')) {
                    navigate('/labs/smartfolio');
                    feedback = 'Analyzing SUI position...';
                    handled = true;
                } else if (lowerCmd.includes('status') || lowerCmd.includes('system report')) {
                    feedback = 'Nexus systems nominal. All agents active.';
                    handled = true;
                }
            }

            if (handled) {
                setResponse(feedback);
                setTimeout(() => setResponse(null), 3000);
                return;
            }

            // 3. BRIDGE API FALLBACK
            // Attempt to hit the Nexus Bridge intent agent
            const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/brain-link`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: command,
                    systemPrompt: 'You are the Nexus Voice Intent parser. If the user wants to navigate, respond with "ACTION: NAVIGATE [route]". Routes: /dashboard, /chat, /news, /labs, /labs/smartfolio, /meeting, /pipeline, /music, /agents, /settings. If they ask a question, give a 1-sentence answer.'
                })
            });

            if (res.ok) {
                const data = await res.json();
                const aiText = data.text || '';
                
                if (aiText.includes('ACTION: NAVIGATE')) {
                    const route = aiText.split('NAVIGATE ')[1]?.trim();
                    if (route) {
                        navigate(route);
                        setResponse(`Navigating...`);
                    }
                } else {
                    setResponse(aiText);
                }
            } else {
                setResponse('Command noted, but the bridge is unreachable.');
            }

        } catch (error) {
            console.error('Voice command failed:', error);
            setResponse('Voice processing error.');
        } finally {
            setProcessing(false);
            setTimeout(() => setResponse(null), 5000);
        }
    }, [navigate]);

    const { isListening, transcript, toggleListening, hasSupport } = useSpeechRecognition();

    // Effect to trigger processing when listening stops
    useEffect(() => {
        if (!isListening && transcript) {
            processCommand(transcript);
        }
    }, [isListening, transcript, processCommand]);

    if (!hasSupport) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 pointer-events-none">
            <AnimatePresence>
                {(transcript || response || processing) && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, x: 20 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.9, x: 10 }}
                        className="pointer-events-auto bg-[#0d0d14]/90 backdrop-blur-xl border border-white/10 rounded-2xl px-5 py-3 shadow-2xl flex items-center gap-4 min-w-[280px] max-w-[400px]"
                    >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                            processing ? 'bg-cyan-500/10 text-cyan-400' : 
                            response ? 'bg-amber-500/10 text-amber-400' : 'bg-blue-500/10 text-blue-400'
                        }`}>
                            {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : 
                             response ? <Sparkles className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                        </div>
                        
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-0.5">
                                {processing ? 'Processing' : response ? 'Lux' : 'Listening'}
                            </span>
                            <span className="text-xs font-medium text-white/90 leading-tight">
                                {response || transcript || 'Speak a command...'}
                            </span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                onClick={toggleListening}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`pointer-events-auto w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-xl group ${
                    isListening 
                    ? 'bg-rose-500 text-white shadow-rose-500/20' 
                    : 'bg-[#1a1a24] text-white/60 hover:text-white border border-white/5 hover:border-cyan-500/50 shadow-black'
                }`}
            >
                {isListening ? (
                    <div className="relative">
                        <MicOff className="w-5 h-5" />
                        <span className="absolute -inset-4 bg-rose-500/20 rounded-full animate-ping"></span>
                    </div>
                ) : (
                    <div className="flex flex-col items-center">
                        <Mic className="w-5 h-5 group-hover:text-cyan-400 transition-colors" />
                    </div>
                )}
            </motion.button>
        </div>
    );
}
