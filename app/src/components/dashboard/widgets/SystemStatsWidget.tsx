import { useState, useEffect } from 'react';

interface LLMStatus {
  ollama: boolean;
  lmStudio: boolean;
  activeModel: string | null;
}

export function SystemStatsWidget() {
  const [status, setStatus] = useState<LLMStatus | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/llm/status');
      if (res.ok) {
        setStatus(await res.json());
        setLastChecked(new Date());
      }
    } catch {}
  };

  useEffect(() => {
    fetchStatus();
    const timer = setInterval(fetchStatus, 30_000);
    return () => clearInterval(timer);
  }, []);

  const anyOnline = status ? (status.ollama || status.lmStudio) : false;

  const ServiceRow = ({ label, online }: { label: string; online: boolean }) => (
    <div className="p-3 rounded-xl bg-[#12121a] border border-white/5 flex flex-col justify-center gap-1">
      <div className="flex items-center gap-2">
        <span className="relative flex w-2 h-2">
          {online && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
          )}
          <span className={`relative w-2 h-2 rounded-full ${online
            ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]'
            : 'bg-red-500/70'}`}
          />
        </span>
        <span className="text-xs font-bold tracking-wider text-white/70 truncate uppercase">{label}</span>
      </div>
      <p className={`text-[10px] font-mono pl-4 ${online ? 'text-emerald-400' : 'text-white/30'}`}>
        {online ? 'ACTIVE' : 'OFFLINE'}
      </p>
    </div>
  );

  return (
    <div className="flex flex-col gap-3 h-full">
      <div className="grid grid-cols-2 gap-3">
        <ServiceRow label="LM Studio" online={status?.lmStudio ?? false} />
        <ServiceRow label="Ollama"    online={status?.ollama ?? false} />
      </div>

      <div className="p-3 rounded-xl bg-[#12121a] border border-white/5 flex-1 flex flex-col justify-center gap-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-widest text-white/40 uppercase">Active Model</span>
          <span className={`w-1.5 h-1.5 rounded-full ${anyOnline ? 'bg-cyan-400' : 'bg-white/10'}`} />
        </div>
        <p className="text-xs font-mono text-cyan-300 truncate">
          {status?.activeModel ?? (status ? 'None' : 'Checking…')}
        </p>
        {lastChecked && (
          <p className="text-[10px] text-white/20 font-mono">
            Checked {lastChecked.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>
    </div>
  );
}

