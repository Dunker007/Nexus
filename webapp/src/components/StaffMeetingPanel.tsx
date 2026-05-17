'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, Bot, Shield, Zap, Brain, Sparkles, AlertTriangle, Check, X, ChevronRight, ChevronLeft, Download, Loader2, WifiOff, Play, Square } from 'lucide-react';
import { bridgeFetch } from '@/lib/utils';

// Agent Definitions (visual config — canonical personas live on the backend)
const AGENTS: Record<string, { name: string; role: string; color: string; icon: JSX.Element }> = {
    architect: { name: 'Architect', role: 'System Design', color: 'purple', icon: <Brain size={16} /> },
    security: { name: 'SecOps Lead', role: 'Security', color: 'red', icon: <Shield size={16} /> },
    qa: { name: 'QA Director', role: 'Quality', color: 'yellow', icon: <Zap size={16} /> },
    moderator: { name: 'Moderator', role: 'Meeting Chair', color: 'cyan', icon: <Sparkles size={16} /> },
};

// Map backend persona IDs to display keys
function resolveAgent(speakerId: string) {
    // Backend uses names like "The Architect", "SecOps Lead", etc.
    const lowerSpeaker = (speakerId || '').toLowerCase();
    if (lowerSpeaker.includes('architect') || lowerSpeaker === 'architect') return AGENTS['architect'];
    if (lowerSpeaker.includes('secops') || lowerSpeaker.includes('security') || lowerSpeaker === 'security') return AGENTS['security'];
    if (lowerSpeaker.includes('qa') || lowerSpeaker === 'qa') return AGENTS['qa'];
    if (lowerSpeaker.includes('moderator') || lowerSpeaker === 'moderator') return AGENTS['moderator'];
    return { name: speakerId, role: '', color: 'gray', icon: <Bot size={16} /> };
}

interface TranscriptEntry {
    id: number;
    speaker: string;
    speakerId: string;
    text: string;
    timestamp: string;
}

interface MeetingStatus {
    isActive: boolean;
    topic: string | null;
    round: number;
    transcript: TranscriptEntry[];
    currentSpeaker: string | null;
    consensus: string | null;
    mode: string | null;
}

interface StaffMeetingPanelProps {
    labsData: any[];
    onUpdateLab: (id: string, updates: any) => void;
    selectedLabId: string | null;
}

const POLL_INTERVAL_MS = 2000;

export default function StaffMeetingPanel({ labsData, onUpdateLab, selectedLabId }: StaffMeetingPanelProps) {
    const [isOpen, setIsOpen] = useState(true);
    const [meetingStatus, setMeetingStatus] = useState<MeetingStatus | null>(null);
    const [topicInput, setTopicInput] = useState('');
    const [isStarting, setIsStarting] = useState(false);
    const [isStopping, setIsStopping] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [bridgeOnline, setBridgeOnline] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const prevTranscriptLen = useRef(0);

    // ─── Polling ───────────────────────────────────────────
    const fetchStatus = useCallback(async () => {
        try {
            const res = await bridgeFetch('/agents/meeting/status', {}, 4000);
            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body?.error?.message || `HTTP ${res.status}`);
            }
            const data: MeetingStatus = await res.json();
            setBridgeOnline(true);
            setError(null);
            setMeetingStatus(data);

            // Auto-scroll when new transcript entries arrive
            if (data.transcript.length > prevTranscriptLen.current) {
                prevTranscriptLen.current = data.transcript.length;
                setTimeout(() => {
                    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
                }, 100);
            }
        } catch (err: any) {
            if (err.name === 'AbortError') {
                setBridgeOnline(false);
                setError('Bridge unreachable — is the server running?');
            } else {
                setError(err.message || 'Failed to fetch meeting status');
            }
        }
    }, []);

    // Start polling on mount, stop on unmount
    useEffect(() => {
        fetchStatus(); // initial fetch
        pollRef.current = setInterval(fetchStatus, POLL_INTERVAL_MS);
        return () => {
            if (pollRef.current) clearInterval(pollRef.current);
        };
    }, [fetchStatus]);

    // ─── Actions ───────────────────────────────────────────
    const startMeeting = async () => {
        const topic = topicInput.trim();
        if (!topic) return;

        setIsStarting(true);
        setError(null);
        try {
            const res = await bridgeFetch('/agents/meeting/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic }),
            }, 10000);

            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body?.error?.message || `HTTP ${res.status}`);
            }

            setTopicInput('');
            prevTranscriptLen.current = 0;
            // Immediately fetch updated status
            await fetchStatus();
        } catch (err: any) {
            setError(err.message || 'Failed to start meeting');
        } finally {
            setIsStarting(false);
        }
    };

    const stopMeeting = async () => {
        setIsStopping(true);
        setError(null);
        try {
            const res = await bridgeFetch('/agents/meeting/stop', {
                method: 'POST',
            }, 5000);

            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body?.error?.message || `HTTP ${res.status}`);
            }

            await fetchStatus();
        } catch (err: any) {
            setError(err.message || 'Failed to stop meeting');
        } finally {
            setIsStopping(false);
        }
    };

    // Auto-suggest topic from selected lab
    useEffect(() => {
        if (selectedLabId && !meetingStatus?.isActive) {
            const lab = labsData.find(l => l.id === selectedLabId);
            if (lab) {
                setTopicInput(`Architecture review: ${lab.name}`);
            }
        }
    }, [selectedLabId, labsData, meetingStatus?.isActive]);

    // ─── Export ─────────────────────────────────────────────
    const exportTranscript = () => {
        const transcript = meetingStatus?.transcript;
        if (!transcript || transcript.length === 0) return;

        const text = transcript.map(entry => {
            const time = new Date(entry.timestamp).toLocaleTimeString();
            return `[${time}] ${entry.speaker}: ${entry.text}`;
        }).join('\n');

        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `staff-meeting-transcript-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // ─── Collapsed state ───────────────────────────────────
    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-8 right-8 w-14 h-14 bg-indigo-600 hover:bg-indigo-500 rounded-full flex items-center justify-center shadow-xl z-50 transition-transform hover:scale-110"
            >
                <MessageSquare className="text-white" />
            </button>
        );
    }

    const isActive = meetingStatus?.isActive ?? false;
    const transcript = meetingStatus?.transcript ?? [];
    const currentSpeaker = meetingStatus?.currentSpeaker;
    const mode = meetingStatus?.mode;

    return (
        <div className="flex flex-col h-full bg-[#0a0a0e] border-l border-white/5 relative">
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/20">
                <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                        {Object.entries(AGENTS).map(([id, agent]) => (
                            <div
                                key={id}
                                className={`w-8 h-8 rounded-full border-2 border-[#0a0a0e] flex items-center justify-center bg-${agent.color}-900/50 text-${agent.color}-400`}
                                title={agent.name}
                            >
                                {agent.icon}
                            </div>
                        ))}
                    </div>
                    <div>
                        <h3 className="font-bold text-sm text-white">Staff Meeting</h3>
                        <div className="flex items-center gap-1.5">
                            {!bridgeOnline ? (
                                <>
                                    <WifiOff size={12} className="text-red-400" />
                                    <span className="text-xs text-red-400">Offline</span>
                                </>
                            ) : isActive ? (
                                <>
                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                    <span className="text-xs text-green-400">
                                        Live{mode ? ` (${mode.toUpperCase()})` : ''}
                                    </span>
                                </>
                            ) : transcript.length > 0 ? (
                                <span className="text-xs text-gray-500">Meeting ended</span>
                            ) : (
                                <span className="text-xs text-gray-500">Ready</span>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {transcript.length > 0 && (
                        <button onClick={exportTranscript} className="text-gray-400 hover:text-white transition-colors" title="Export Transcript">
                            <Download size={18} />
                        </button>
                    )}
                    {isActive && (
                        <button
                            onClick={stopMeeting}
                            disabled={isStopping}
                            className="text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
                            title="Stop Meeting"
                        >
                            {isStopping ? <Loader2 size={18} className="animate-spin" /> : <Square size={18} />}
                        </button>
                    )}
                    <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white">
                        <ChevronRight />
                    </button>
                </div>
            </div>

            {/* Error Banner */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-4 py-2 bg-red-900/30 border-b border-red-500/20 text-red-300 text-xs flex items-center gap-2"
                    >
                        <AlertTriangle size={14} />
                        <span className="flex-1">{error}</span>
                        <button onClick={() => setError(null)} className="text-red-400 hover:text-white">
                            <X size={14} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                {transcript.length === 0 && !isActive && (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 text-sm gap-3">
                        <MessageSquare size={32} className="opacity-30" />
                        <p>No active meeting. Start one below.</p>
                    </div>
                )}

                {transcript.map((entry) => {
                    const agent = resolveAgent(entry.speakerId);
                    const isModerator = entry.speakerId === 'moderator';

                    return (
                        <motion.div
                            key={entry.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex gap-3"
                        >
                            <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mt-1 bg-${agent.color}-900/20 text-${agent.color}-400 border border-${agent.color}-500/30`}>
                                {agent.icon}
                            </div>

                            <div className="space-y-1 max-w-[85%]">
                                <div className={`p-3 rounded-2xl text-sm rounded-tl-none ${
                                    isModerator
                                        ? 'bg-cyan-900/10 border border-cyan-500/20 text-cyan-200'
                                        : 'bg-white/5 border border-white/10 text-gray-200'
                                }`}>
                                    <div className={`text-xs font-bold mb-1 text-${agent.color}-400`}>
                                        {agent.name}
                                        {agent.role && <span className="font-normal text-gray-500 ml-1">· {agent.role}</span>}
                                    </div>
                                    <div className="whitespace-pre-wrap">{entry.text}</div>
                                </div>
                                <div className="text-[10px] text-gray-600 pl-1">
                                    {new Date(entry.timestamp).toLocaleTimeString()}
                                </div>
                            </div>
                        </motion.div>
                    );
                })}

                {/* Typing indicator */}
                {currentSpeaker && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/5 animate-pulse flex items-center justify-center">
                            {resolveAgent(currentSpeaker).icon}
                        </div>
                        <div className="p-3 rounded-2xl bg-white/5 text-xs text-gray-500 flex items-center gap-2">
                            <Loader2 size={12} className="animate-spin" />
                            {resolveAgent(currentSpeaker).name} is speaking...
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Input Area: Topic starter (only when no meeting active) */}
            <div className="p-4 border-t border-white/10 bg-black/20">
                {!isActive ? (
                    <div className="space-y-2">
                        <div className="relative">
                            <input
                                type="text"
                                value={topicInput}
                                onChange={(e) => setTopicInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && startMeeting()}
                                placeholder="Enter meeting topic..."
                                className="w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-12 py-3 text-sm focus:border-indigo-500 outline-none transition-colors"
                                disabled={isStarting}
                            />
                            <button
                                onClick={startMeeting}
                                disabled={!topicInput.trim() || isStarting}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                title="Start Meeting"
                            >
                                {isStarting ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
                            </button>
                        </div>
                        <p className="text-[11px] text-gray-600 text-center">
                            Agents will debate the topic in a structured 3-round meeting
                        </p>
                    </div>
                ) : (
                    <div className="text-center text-xs text-gray-500 py-1">
                        Meeting in progress — Round {meetingStatus?.round || '?'} of 3
                    </div>
                )}
            </div>
        </div>
    );
}
