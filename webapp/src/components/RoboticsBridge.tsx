'use client';

import { motion } from 'framer-motion';
import { Settings, Battery, Wifi, Activity } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function RoboticsBridge() {
    const [status, setStatus] = useState<'connected' | 'disconnected' | 'calibrating'>('disconnected');
    const [battery, setBattery] = useState(0);

    // Simulated connection simulation
    useEffect(() => {
        const timer = setTimeout(() => {
            setStatus('connected');
            setBattery(100);
        }, 2000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="glass-card p-4">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Settings className="text-cyan-400" />
                    <h3 className="font-bold">Robotics Bridge</h3>
                </div>
                <div className={`text-xs px-2 py-1 rounded-full ${status === 'connected' ? 'bg-green-500/20 text-green-400' :
                        'bg-red-500/20 text-red-400'
                    }`}>
                    {status.toUpperCase()}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-3 rounded-lg flex items-center gap-3">
                    <Battery className={battery > 20 ? "text-green-400" : "text-red-400"} />
                    <div>
                        <div className="text-xs text-gray-500">Battery</div>
                        <div className="font-mono">{battery}%</div>
                    </div>
                </div>
                <div className="bg-white/5 p-3 rounded-lg flex items-center gap-3">
                    <Wifi className="text-blue-400" />
                    <div>
                        <div className="text-xs text-gray-500">Signal</div>
                        <div className="font-mono">-42dBm</div>
                    </div>
                </div>
            </div>

            {status === 'connected' && (
                <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="flex items-center gap-2 text-xs text-cyan-400 mb-2">
                        <Activity size={14} className="animate-pulse" />
                        <span>Receiving Telemetry...</span>
                    </div>
                    <div className="h-16 bg-black/40 rounded overflow-hidden relative">
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/20 to-cyan-500/0"
                            animate={{ x: ['-100%', '100%'] }}
                            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                        />
                        {/* Mock waveform */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-full h-[1px] bg-cyan-500/30"></div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
