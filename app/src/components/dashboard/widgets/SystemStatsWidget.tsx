import { useState, useEffect } from 'react';
import type { SystemStats } from '../../../types/dashboard';

const LUXRIG_BRIDGE_URL = '/api';

export function SystemStatsWidget() {
    const [systemStats, setSystemStats] = useState<SystemStats | null>(null);

    useEffect(() => {
        fetchSystemStats();
        const statsTimer = setInterval(fetchSystemStats, 5000);
        return () => clearInterval(statsTimer);
    }, []);

    async function fetchSystemStats() {
        try {
            const res = await fetch(`${LUXRIG_BRIDGE_URL}/status`);
            if (res.ok) setSystemStats(await res.json());
        } catch { }
    }

    const lmStudioOnline = systemStats?.services?.lmstudio?.online ?? false;
    const ollamaOnline = systemStats?.services?.ollama?.online ?? false;
    const gpuTemp = systemStats?.system?.gpu?.temperature ?? '--';
    const gpuUtil = systemStats?.system?.gpu?.utilization ?? 0;

    return (
        <div className="grid grid-cols-2 gap-3 h-full">
            <div className="p-3 rounded-xl bg-[#12121a] border border-white/5 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-1">
                    <span className={`w-2 h-2 rounded-full ${lmStudioOnline ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]' : 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.5)]'}`}></span>
                    <span className="text-xs font-bold tracking-wider text-white/70 truncate uppercase">LM Studio</span>
                </div>
                <p className="text-[10px] font-mono text-gray-500 pl-4">{lmStudioOnline ? 'ACTIVE' : 'OFFLINE'}</p>
            </div>
            <div className="p-3 rounded-xl bg-[#12121a] border border-white/5 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-1">
                    <span className={`w-2 h-2 rounded-full ${ollamaOnline ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]' : 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.5)]'}`}></span>
                    <span className="text-xs font-bold tracking-wider text-white/70 truncate uppercase">Ollama</span>
                </div>
                <p className="text-[10px] font-mono text-gray-500 pl-4">{ollamaOnline ? 'ACTIVE' : 'OFFLINE'}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-[#12121a] border border-white/5 col-span-2 flex flex-col justify-center">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-bold tracking-widest text-white/40 uppercase">GPU Load</span>
                    <span className="text-xs font-mono text-cyan-400">{gpuTemp}°C</span>
                </div>
                <div className="w-full bg-black/40 rounded-full h-1.5 border border-white/5 overflow-hidden">
                    <div className="bg-gradient-to-r from-cyan-400 to-purple-500 h-full rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(6,182,212,0.5)]" style={{ width: `${Math.max(2, gpuUtil)}%` }}></div>
                </div>
            </div>
        </div>
    );
}
