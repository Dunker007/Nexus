'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AvatarCircle } from './meeting/AvatarCircle';
import { TranscriptList } from './meeting/TranscriptList';
import { ControlPanel } from './meeting/ControlPanel';

const LUXRIG_BRIDGE_URL = process.env.NEXT_PUBLIC_BRIDGE_URL || 'http://localhost:3456';

interface TranscriptEntry {
    id: number;
    speaker: string;
    speakerId: string;
    text: string;
    timestamp: string;
}

interface MeetingState {
    isActive: boolean;
    topic: string | null;
    round: number;
    transcript: TranscriptEntry[];
    currentSpeaker: string | null;
    consensus: string | null;
    personas: Record<string, { name: string; role: string; color: string }>;
}

export default function MeetingRoom() {
    const [state, setState] = useState<MeetingState | null>(null);
    const [topic, setTopic] = useState('');
    const [loading, setLoading] = useState(false);

    // Poll for status
    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await fetch(`${LUXRIG_BRIDGE_URL}/agents/execute`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        agentType: 'staff-meeting',
                        task: { action: 'get-status' }
                    })
                });
                const data = await res.json();
                if (data.result) {
                    setState(data.result);
                }
            } catch (error) {
                console.error('Failed to fetch meeting status:', error);
            }
        };

        fetchStatus();
        const interval = setInterval(fetchStatus, 1000); // Poll every second for live feel
        return () => clearInterval(interval);
    }, []);

    const startMeeting = async () => {
        if (!topic) return;
        setLoading(true);
        try {
            await fetch(`${LUXRIG_BRIDGE_URL}/agents/execute`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    agentType: 'staff-meeting',
                    task: { action: 'start-meeting', topic }
                })
            });
        } catch (error) {
            console.error('Failed to start meeting:', error);
        } finally {
            setLoading(false);
        }
    };

    const stopMeeting = async () => {
        try {
            await fetch(`${LUXRIG_BRIDGE_URL}/agents/execute`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    agentType: 'staff-meeting',
                    task: { action: 'stop-meeting' }
                })
            });
        } catch (error) {
            console.error('Failed to stop meeting:', error);
        }
    };

    if (!state) return <div className="p-8 text-center">Connecting to Staff Meeting...</div>;

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col gap-4">
            <ControlPanel
                isActive={state.isActive}
                hasConsensus={!!state.consensus}
                topic={topic}
                loading={loading}
                onTopicChange={setTopic}
                onStart={startMeeting}
                onStop={stopMeeting}
            />

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0">
                <AvatarCircle
                    topic={state.topic}
                    personas={state.personas}
                    currentSpeaker={state.currentSpeaker}
                />

                <TranscriptList
                    transcript={state.transcript}
                    currentSpeaker={state.currentSpeaker}
                    personas={state.personas}
                />
            </div>

            {/* Consensus Report (if done) */}
            {state.consensus && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass p-6 border-l-4 border-green-500"
                >
                    <h3 className="text-xl font-bold mb-4 text-green-400">✅ Final Consensus</h3>
                    <div className="prose prose-invert prose-sm max-w-none">
                        <pre className="whitespace-pre-wrap font-sans">{state.consensus}</pre>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
