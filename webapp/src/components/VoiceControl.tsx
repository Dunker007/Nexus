'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Web Speech API types
interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start: () => void;
    stop: () => void;
    onresult: (event: any) => void;
    onend: () => void;
    onerror: (event: any) => void;
}

declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

const LUXRIG_BRIDGE_URL = process.env.NEXT_PUBLIC_BRIDGE_URL || 'http://localhost:3456';

export default function VoiceControl() {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [processing, setProcessing] = useState(false);
    const [response, setResponse] = useState<string | null>(null);
    const recognitionRef = useRef<SpeechRecognition | null>(null);

    useEffect(() => {
        // Initialize Speech Recognition
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            recognition.onresult = (event: any) => {
                const current = event.resultIndex;
                const transcriptText = event.results[current][0].transcript;
                setTranscript(transcriptText);
            };

            recognition.onend = () => {
                setIsListening(false);
                if (transcript) {
                    processCommand(transcript);
                }
            };

            recognitionRef.current = recognition;
        }
    }, [transcript]);

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
        } else {
            setTranscript('');
            setResponse(null);
            recognitionRef.current?.start();
            setIsListening(true);
        }
    };

    // Local command router - handles commands even when Bridge is offline
    const handleLocalCommand = (command: string): { handled: boolean; response?: string } => {
        const lowerCmd = command.toLowerCase().trim();

        // Navigation commands
        const navRoutes: Record<string, string> = {
            'go to home': '/',
            'go home': '/',
            'go to dashboard': '/',
            'go to chat': '/chat',
            'open chat': '/chat',
            'go to labs': '/labs',
            'open labs': '/labs',
            'go to agents': '/agents',
            'open agents': '/agents',
            'go to meeting': '/meeting',
            'open meeting': '/meeting',
            'start meeting': '/meeting',
            'go to income': '/income',
            'open income': '/income',
            'go to music': '/music',
            'open music': '/music',
            'go to voice': '/voice',
            'open voice': '/voice',
            'go to studios': '/studios',
            'open studios': '/studios',
            'go to settings': '/settings',
            'open settings': '/settings',
            'go to news': '/news',
            'open news': '/news',
        };

        for (const [phrase, route] of Object.entries(navRoutes)) {
            if (lowerCmd.includes(phrase)) {
                window.location.href = route;
                return { handled: true, response: `Navigating to ${route}` };
            }
        }

        // Command palette
        if (lowerCmd.includes('open command') || lowerCmd.includes('command palette') || lowerCmd.includes('open menu')) {
            // Dispatch event to open command palette
            window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
            return { handled: true, response: 'Opening command palette' };
        }

        // Theme toggle
        if (lowerCmd.includes('dark mode') || lowerCmd.includes('light mode') || lowerCmd.includes('toggle theme')) {
            window.dispatchEvent(new CustomEvent('toggle-theme'));
            return { handled: true, response: 'Toggling theme' };
        }

        // Search
        if (lowerCmd.startsWith('search for ') || lowerCmd.startsWith('find ')) {
            const query = lowerCmd.replace('search for ', '').replace('find ', '');
            window.location.href = `/search?q=${encodeURIComponent(query)}`;
            return { handled: true, response: `Searching for "${query}"` };
        }

        return { handled: false };
    };

    const processCommand = async (command: string) => {
        setProcessing(true);
        try {
            // Try local command handling first
            const localResult = handleLocalCommand(command);
            if (localResult.handled) {
                setResponse(localResult.response || 'Command executed.');
                setProcessing(false);
                setTimeout(() => {
                    setTranscript('');
                    setResponse(null);
                }, 3000);
                return;
            }

            // Fall back to Bridge API for complex commands
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

                // Execute client-side actions if needed
                if (data.result.action === 'navigate') {
                    window.location.href = data.result.target;
                }
            }
        } catch (error) {
            console.error('Voice command failed:', error);
            setResponse('Voice command noted. Bridge offline.');
        } finally {
            setProcessing(false);
            // Clear after delay
            setTimeout(() => {
                setTranscript('');
                setResponse(null);
            }, 5000);
        }
    };

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
