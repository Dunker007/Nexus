'use client';

import { motion } from 'framer-motion';

interface Persona {
    name: string;
    role: string;
    color: string;
}

interface AvatarCircleProps {
    topic: string | null;
    personas: Record<string, Persona>;
    currentSpeaker: string | null;
}

export function AvatarCircle({ topic, personas, currentSpeaker }: AvatarCircleProps) {
    return (
        <div className="glass p-8 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-grid opacity-20" />

            {/* Table */}
            <div className="w-64 h-64 rounded-full border-4 border-white/5 relative flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-white/5 blur-xl absolute" />

                {/* Topic Center */}
                <div className="text-center z-10 max-w-[150px]">
                    <div className="text-xs text-gray-500 uppercase mb-1">Current Topic</div>
                    <div className="font-bold text-cyan-400 line-clamp-3">
                        {topic || 'Waiting for topic...'}
                    </div>
                </div>

                {/* Agents */}
                {Object.entries(personas).map(([id, persona], i) => {
                    const isSpeaking = currentSpeaker === id;
                    const count = Object.keys(personas).length;
                    // Safe guard division by zero if count is 0
                    const angle = count > 0 ? (i * (360 / count)) - 90 : 0;
                    const radius = 160; // Distance from center
                    const x = Math.cos((angle * Math.PI) / 180) * radius;
                    const y = Math.sin((angle * Math.PI) / 180) * radius;

                    return (
                        <motion.div
                            key={id} // Use ID as key for stability
                            className="absolute flex flex-col items-center gap-2"
                            style={{ x, y }}
                            animate={{ scale: isSpeaking ? 1.2 : 1 }}
                        >
                            <div
                                className={`w-16 h-16 rounded-full border-2 flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(0,0,0,0.5)] transition-all duration-300 ${isSpeaking ? 'border-white shadow-[0_0_30px_currentColor]' : 'border-white/20 grayscale'}`}
                                style={{
                                    backgroundColor: `${persona.color}20`,
                                    borderColor: isSpeaking ? persona.color : undefined,
                                    color: persona.color
                                }}
                            >
                                {/* Simple emoji assignment based on index - can be improved to use persona.icon if available */}
                                {i === 0 ? '🏗️' : i === 1 ? '🛡️' : '🧪'}
                            </div>
                            <div className="text-center">
                                <div className="font-bold text-sm">{persona.name}</div>
                                <div className="text-[10px] text-gray-400 uppercase">{persona.role}</div>
                            </div>
                            {isSpeaking && (
                                <motion.div
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="absolute -top-8 bg-white text-black text-[10px] px-2 py-1 rounded-full whitespace-nowrap font-bold"
                                >
                                    Speaking...
                                </motion.div>
                            )}
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
