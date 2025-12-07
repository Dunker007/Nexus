'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import PageBackground from '@/components/PageBackground';

// Type declarations for Web Speech API
interface SpeechRecognitionEvent extends Event {
    resultIndex: number;
    results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
    error: string;
}

interface SpeechRecognitionResult {
    isFinal: boolean;
    [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
    transcript: string;
    confidence: number;
}

interface SpeechRecognitionResultList {
    length: number;
    [index: number]: SpeechRecognitionResult;
}

interface ISpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onstart: (() => void) | null;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
    onend: (() => void) | null;
    start: () => void;
    stop: () => void;
}

// Type casting helper for browser compatibility
// eslint-disable-next-line
const getSpeechRecognition = (): (new () => ISpeechRecognition) | undefined => {
    // eslint-disable-next-line
    return (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
};

// Voice command intents
const COMMAND_INTENTS = {
    // Navigation
    go_to: /^(go to|navigate to|open|show)\s+(.+)$/i,
    back: /^(go back|back|previous)$/i,

    // Agent commands
    execute_agent: /^(ask|run|execute|start)\s+(research|code|architect|security|qa|devops)\s*(.*)$/i,
    meeting: /^(start|begin|hold)\s+(a\s+)?meeting\s*(about|on)?\s*(.*)$/i,

    // System commands
    status: /^(show|get|what('?s|\s+is))\s+(the\s+)?(status|health)$/i,
    help: /^(help|what can you do|commands)$/i,

    // Chat
    chat: /^(chat|talk|ask)\s+(.+)$/i,
};

interface VoiceCommand {
    intent: string;
    params: Record<string, string>;
    raw: string;
    confidence: number;
    timestamp: Date;
}

export default function VoiceControlPage() {
    const [isListening, setIsListening] = useState(false);
    const [isSupported, setIsSupported] = useState(true);
    const [transcript, setTranscript] = useState('');
    const [interimTranscript, setInterimTranscript] = useState('');
    const [commands, setCommands] = useState<VoiceCommand[]>([]);
    const [status, setStatus] = useState<'idle' | 'listening' | 'processing' | 'error'>('idle');
    const [lastResult, setLastResult] = useState<string | null>(null);
    const [voiceVisualization, setVoiceVisualization] = useState<number>(0);

    const recognitionRef = useRef<ISpeechRecognition | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const animationRef = useRef<number | null>(null);

    // Check for Web Speech API support
    useEffect(() => {
        const SpeechRecognition = getSpeechRecognition();
        if (!SpeechRecognition) {
            setIsSupported(false);
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            setStatus('listening');
        };

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            let interim = '';
            let final = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                if (result.isFinal) {
                    final += result[0].transcript;
                } else {
                    interim += result[0].transcript;
                }
            }

            setInterimTranscript(interim);

            if (final) {
                setTranscript(prev => prev + ' ' + final);
                processCommand(final.trim(), event.results[event.resultIndex][0].confidence);
            }
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            console.error('Speech recognition error:', event.error);
            setStatus('error');
            if (event.error === 'not-allowed') {
                setIsSupported(false);
            }
        };

        recognition.onend = () => {
            if (isListening) {
                // Restart if still listening
                recognition.start();
            } else {
                setStatus('idle');
            }
        };

        recognitionRef.current = recognition;

        return () => {
            recognition.stop();
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [isListening]);

    // Voice visualization using Web Audio API
    const startVisualization = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const audioContext = new AudioContext();
            const analyser = audioContext.createAnalyser();
            const source = audioContext.createMediaStreamSource(stream);

            analyser.fftSize = 256;
            source.connect(analyser);

            audioContextRef.current = audioContext;
            analyserRef.current = analyser;

            const visualize = () => {
                if (!analyserRef.current) return;

                const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
                analyserRef.current.getByteFrequencyData(dataArray);

                const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
                setVoiceVisualization(average);

                animationRef.current = requestAnimationFrame(visualize);
            };

            visualize();
        } catch (error) {
            console.error('Error accessing microphone for visualization:', error);
        }
    };

    const stopVisualization = () => {
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
        }
        setVoiceVisualization(0);
    };

    // Parse command intent
    const parseIntent = (text: string): { intent: string; params: Record<string, string> } | null => {
        for (const [intent, pattern] of Object.entries(COMMAND_INTENTS)) {
            const match = text.match(pattern);
            if (match) {
                const params: Record<string, string> = {};

                switch (intent) {
                    case 'go_to':
                        params.destination = match[2];
                        break;
                    case 'execute_agent':
                        params.agentType = match[2].toLowerCase();
                        params.task = match[3] || '';
                        break;
                    case 'meeting':
                        params.topic = match[4] || '';
                        break;
                    case 'chat':
                        params.message = match[2];
                        break;
                }

                return { intent, params };
            }
        }
        return null;
    };

    // Process recognized command
    const processCommand = async (text: string, confidence: number) => {
        setStatus('processing');

        const parsed = parseIntent(text);

        const command: VoiceCommand = {
            intent: parsed?.intent || 'unknown',
            params: parsed?.params || {},
            raw: text,
            confidence,
            timestamp: new Date()
        };

        setCommands(prev => [command, ...prev].slice(0, 10));

        // Execute command
        try {
            let result = '';

            if (parsed) {
                switch (parsed.intent) {
                    case 'go_to':
                        result = `Navigating to ${parsed.params.destination}...`;
                        // In real implementation: router.push(`/${parsed.params.destination}`);
                        break;

                    case 'execute_agent':
                        result = `Running ${parsed.params.agentType} agent...`;
                        // Call agent API
                        break;

                    case 'meeting':
                        result = `Starting staff meeting about "${parsed.params.topic}"...`;
                        break;

                    case 'status':
                        result = 'Fetching system status...';
                        break;

                    case 'help':
                        result = 'Available commands: Go to [page], Ask [agent] [task], Start meeting about [topic], Show status';
                        break;

                    case 'chat':
                        result = `Processing: "${parsed.params.message}"`;
                        break;

                    default:
                        result = `Command not recognized: "${text}"`;
                }
            } else {
                result = `I heard: "${text}" - Try saying "help" for available commands`;
            }

            setLastResult(result);

            // Speak response
            speakResponse(result);

        } catch (error) {
            console.error('Command execution error:', error);
            setLastResult('Error executing command');
        }

        setStatus('listening');
    };

    // Text-to-speech response
    const speakResponse = (text: string) => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 1;
            utterance.pitch = 1;
            utterance.volume = 0.8;
            window.speechSynthesis.speak(utterance);
        }
    };

    // Toggle listening
    const toggleListening = useCallback(() => {
        if (isListening) {
            recognitionRef.current?.stop();
            stopVisualization();
            setIsListening(false);
        } else {
            recognitionRef.current?.start();
            startVisualization();
            setIsListening(true);
            setTranscript('');
        }
    }, [isListening]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space' && e.ctrlKey) {
                e.preventDefault();
                toggleListening();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [toggleListening]);

    if (!isSupported) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#0f0f1a] to-[#1a1a2e] text-gray-200 text-center p-8">
                <h1 className="text-red-500 text-2xl font-bold mb-4">🎤 Voice Control Unavailable</h1>
                <p className="text-gray-500 max-w-md">
                    Your browser doesn't support the Web Speech API, or microphone access was denied.
                    Please try Chrome, Edge, or Safari and ensure microphone permissions are granted.
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative overflow-hidden text-white">
            <PageBackground color="red" />

            {/* Decorative elements */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                {/* Central glow behind mic */}
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-64 h-64 bg-red-500/15 rounded-full blur-2xl" />

                {/* Connection lines */}
                <svg className="absolute inset-0 w-full h-full opacity-10">
                    <defs>
                        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#ef4444" stopOpacity="0" />
                            <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.5" />
                            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    <line x1="50%" y1="30%" x2="25%" y2="70%" stroke="url(#lineGradient)" strokeWidth="1" />
                    <line x1="50%" y1="30%" x2="75%" y2="70%" stroke="url(#lineGradient)" strokeWidth="1" />
                </svg>
            </div>

            <div className="container-main py-8 relative z-10">

                <header style={{ textAlign: 'center', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    {/* Title with glow */}
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                        <div style={{ position: 'relative' }}>
                            <div style={{ position: 'absolute', inset: 0, background: '#ef4444', borderRadius: '12px', filter: 'blur(12px)', opacity: 0.3 }} />
                            <div style={{ position: 'relative', padding: '12px', background: 'linear-gradient(135deg, rgba(239,68,68,0.3), rgba(168,85,247,0.3))', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <span style={{ fontSize: '28px' }}>🎙️</span>
                            </div>
                        </div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                            God<span style={{ background: 'linear-gradient(90deg, #ef4444, #f97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Mode</span>
                        </h1>
                    </div>
                    <p style={{ fontSize: '0.9rem', color: '#888', margin: '0 0 1rem 0' }}>Voice-controlled platform command</p>

                    {/* Live Stats */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '8px', background: status === 'listening' ? 'rgba(34,197,94,0.1)' : 'rgba(107,114,128,0.1)', border: status === 'listening' ? '1px solid rgba(34,197,94,0.2)' : '1px solid rgba(107,114,128,0.2)' }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: status === 'listening' ? '#22c55e' : '#6b7280' }} />
                            <span style={{ fontSize: '0.75rem', fontWeight: 500, color: status === 'listening' ? '#22c55e' : '#6b7280' }}>
                                {status === 'idle' && 'Ready'}
                                {status === 'listening' && 'Listening'}
                                {status === 'processing' && 'Processing'}
                                {status === 'error' && 'Error'}
                            </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '8px', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#8b5cf6' }}>{commands.length} Commands</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <span style={{ fontSize: '0.75rem', color: '#888', fontFamily: 'monospace' }}>Ctrl + Space</span>
                        </div>
                    </div>
                </header>

                {/* Mic Section - Central Focus */}
                <motion.div
                    className="flex flex-col items-center mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    {/* Mic Button with Dynamic Glow */}
                    <motion.button
                        onClick={toggleListening}
                        className={`relative w-32 h-32 rounded-full border-none cursor-pointer transition-all duration-300 ${isListening
                            ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                            : 'bg-gradient-to-br from-purple-600 to-pink-600'
                            }`}
                        style={{
                            boxShadow: isListening
                                ? `0 0 ${30 + voiceVisualization}px rgba(34, 197, 94, ${0.5 + voiceVisualization / 150})`
                                : '0 0 30px rgba(168, 85, 247, 0.3)'
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <span className="text-5xl">{isListening ? '🎙️' : '🎤'}</span>
                    </motion.button>

                    {/* Status Badge */}
                    <div className={`mt-4 px-4 py-2 rounded-full text-sm uppercase tracking-wider font-medium ${status === 'idle' ? 'bg-gray-500/30 text-gray-400' :
                        status === 'listening' ? 'bg-green-500/30 text-green-400' :
                            status === 'processing' ? 'bg-blue-500/30 text-blue-400' :
                                'bg-red-500/30 text-red-400'
                        }`}>
                        {status === 'idle' && 'Ready'}
                        {status === 'listening' && '● Listening...'}
                        {status === 'processing' && '⏳ Processing...'}
                        {status === 'error' && '⚠️ Error'}
                    </div>

                    {/* Audio Visualizer */}
                    {isListening && (
                        <motion.div
                            className="flex gap-1 h-16 items-center mt-6"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            {[...Array(24)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="w-1.5 bg-gradient-to-t from-purple-500 to-cyan-400 rounded-full"
                                    animate={{
                                        height: Math.max(8, Math.random() * voiceVisualization * 1.5)
                                    }}
                                    transition={{ duration: 0.1 }}
                                />
                            ))}
                        </motion.div>
                    )}
                </motion.div>

                {/* Transcript Section */}
                <motion.div
                    className="max-w-2xl mx-auto mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="glass-card p-6 text-center">
                        {transcript && <p className="text-lg">{transcript}</p>}
                        {interimTranscript && <p className="text-gray-500 italic">{interimTranscript}</p>}
                        {!transcript && !interimTranscript && (
                            <p className="text-gray-600">Start speaking to see your words here...</p>
                        )}
                    </div>

                    {lastResult && (
                        <motion.div
                            className="mt-4 p-4 rounded-lg bg-green-500/10 border border-green-500/30"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                        >
                            <strong className="text-green-400">🤖 Response:</strong> {lastResult}
                        </motion.div>
                    )}
                </motion.div>

                {/* Two-Column Layout: Commands + Help */}
                <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    {/* Recent Commands */}
                    <motion.div
                        className="glass-card p-6"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                📜 Recent Commands
                                <span className="text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-400">{commands.length}</span>
                            </h3>
                            {commands.length > 0 && (
                                <button
                                    onClick={() => setCommands([])}
                                    className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                        <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                            {commands.length === 0 ? (
                                <p className="text-gray-600 text-sm text-center py-4">No commands yet</p>
                            ) : (
                                commands.map((cmd, i) => (
                                    <motion.div
                                        key={i}
                                        className="flex justify-between items-center p-3 rounded-lg bg-white/5 border border-white/5"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm truncate">&quot;{cmd.raw}&quot;</div>
                                            <div className="text-xs text-gray-500 flex gap-2">
                                                <span className="text-cyan-400">{cmd.intent}</span>
                                                {Object.keys(cmd.params).length > 0 && (
                                                    <span className="truncate">{JSON.stringify(cmd.params)}</span>
                                                )}
                                            </div>
                                        </div>
                                        <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-400 ml-2">
                                            {(cmd.confidence * 100).toFixed(0)}%
                                        </span>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </motion.div>

                    {/* Example Commands */}
                    <motion.div
                        className="glass-card p-6"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <h3 className="text-lg font-bold mb-4">💡 Example Commands</h3>
                        <div className="grid gap-2">
                            {[
                                { icon: '🗺️', text: '"Go to dashboard"' },
                                { icon: '🔍', text: '"Ask research about AI trends"' },
                                { icon: '💻', text: '"Run code create React component"' },
                                { icon: '👥', text: '"Start meeting about security"' },
                                { icon: '📊', text: '"Show status"' },
                                { icon: '❓', text: '"Help"' }
                            ].map((item, i) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-3 p-2 rounded-lg bg-black/20 hover:bg-black/30 transition-colors cursor-pointer group"
                                    onClick={() => {
                                        // Could auto-fill as a template
                                    }}
                                >
                                    <span className="text-lg group-hover:scale-110 transition-transform">{item.icon}</span>
                                    <span className="text-sm text-gray-300">{item.text}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
