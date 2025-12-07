'use client';

interface ControlPanelProps {
    isActive: boolean;
    hasConsensus: boolean;
    topic: string;
    loading: boolean;
    onTopicChange: (topic: string) => void;
    onStart: () => void;
    onStop: () => void;
}

export function ControlPanel({
    isActive,
    hasConsensus,
    topic,
    loading,
    onTopicChange,
    onStart,
    onStop
}: ControlPanelProps) {
    return (
        <div className="glass p-4 flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-bold text-gradient">AI Staff Meeting</h1>
                <p className="text-xs text-gray-400">Collaborative Architecture & Debate</p>
            </div>

            {!isActive && !hasConsensus ? (
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={topic}
                        onChange={(e) => onTopicChange(e.target.value)}
                        placeholder="Enter discussion topic..."
                        className="bg-white/5 border border-white/10 rounded px-3 py-2 w-64 focus:outline-none focus:border-cyan-500"
                        aria-label="Discussion topic"
                    />
                    <button
                        onClick={onStart}
                        disabled={loading || !topic}
                        className="btn-primary"
                        aria-busy={loading}
                    >
                        {loading ? 'Starting...' : 'Start Meeting'}
                    </button>
                </div>
            ) : (
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="animate-pulse text-red-500">●</span>
                        <span className="text-sm font-mono uppercase">Live Session</span>
                    </div>
                    <button onClick={onStop} className="btn-outline text-xs py-2 px-4 border-red-500 text-red-500 hover:bg-red-500 hover:text-white">
                        End Session
                    </button>
                </div>
            )}
        </div>
    );
}
