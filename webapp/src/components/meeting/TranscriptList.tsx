'use client';

import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TranscriptEntry {
    id: number;
    speaker: string;
    speakerId: string;
    text: string;
    timestamp: string;
}

interface Persona {
    name: string;
    role: string;
    color: string;
}

interface TranscriptListProps {
    transcript: TranscriptEntry[];
    currentSpeaker: string | null;
    personas: Record<string, Persona>;
}

export function TranscriptList({ transcript, currentSpeaker, personas }: TranscriptListProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll on new transcript entries
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [transcript, currentSpeaker]); // Also scroll when speaker changes (loading dots)

    return (
        <div className="glass flex flex-col lg:col-span-2 min-h-0">
            <div className="p-4 border-b border-white/10 font-bold text-sm uppercase tracking-wider text-gray-400">
                Meeting Transcript
            </div>
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-4"
            >
                <AnimatePresence>
                    {transcript.map((entry) => (
                        <motion.div
                            key={entry.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`flex gap-4 ${entry.speakerId === 'moderator' ? 'opacity-50' : ''}`}
                        >
                            <div className="min-w-[80px] text-right">
                                <div
                                    className="text-xs font-bold uppercase"
                                    style={{
                                        color: personas[entry.speakerId]?.color || '#888'
                                    }}
                                >
                                    {entry.speaker}
                                </div>
                                <div className="text-[10px] text-gray-600">
                                    {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                </div>
                            </div>
                            <div className={`text-sm leading-relaxed ${entry.speakerId === 'moderator' ? 'italic' : ''}`}>
                                {entry.text}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {currentSpeaker && (
                    <div className="flex gap-4 opacity-50">
                        <div className="min-w-[80px] text-right">
                            <div className="text-xs font-bold uppercase text-gray-500">...</div>
                        </div>
                        <div className="flex gap-1 items-center h-5">
                            <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                            <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                            <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
