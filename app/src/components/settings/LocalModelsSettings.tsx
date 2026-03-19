import { useToast } from '../../contexts/ToastContext';
import { Zap } from 'lucide-react';
import { useState, useEffect } from 'react';

export function LocalModelsSettings() {
  const { toast } = useToast();
  const [status, setStatus] = useState<{ollama: boolean, lmStudio: boolean, activeModel: string | null}>({ ollama: false, lmStudio: false, activeModel: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || ''}/api/llm/status`)
      .then(res => res.json())
      .then(data => {
        setStatus(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="glass-card border-white/5 bg-white/[0.01] overflow-hidden min-h-[600px] flex flex-col">
      <div className="p-10 flex-1">
        <div className="flex items-center gap-4 mb-12 pb-6 border-b border-white/5">
           <div className="w-1.5 h-6 bg-purple-500 rounded-full" />
           <h2 className="text-xl font-bold text-white tracking-wide">Local Models</h2>
        </div>
        
        <div className="space-y-12 max-w-3xl">
          <div className="group">
            <div className="space-y-1 mb-6">
              <div className="text-sm font-bold text-white tracking-wide">Inference Engines</div>
              <p className="text-xs text-white/40 leading-relaxed">Status of local LLM providers configured in the neural hub.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {/* Ollama Engine */}
               <div className="p-6 bg-black/40 border border-white/5 rounded-2xl space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-white/5">
                    <span className="text-white/30 font-bold uppercase tracking-wider text-[10px]">Ollama Runtime</span>
                    {loading ? (
                       <span className="text-white/20 text-xs font-bold animate-pulse">Checking...</span>
                    ) : status.ollama ? (
                       <span className="text-emerald-400 text-xs font-bold">Online</span>
                    ) : (
                       <span className="text-red-400 text-xs font-bold">Offline</span>
                    )}
                  </div>
                  <div className="flex justify-between items-center text-white/60">
                    <span className="text-xs font-medium">Default Model</span>
                    <span className="text-xs font-bold px-2 py-1 rounded bg-white/5 text-white/80">{status.activeModel || 'qwen2.5:latest'}</span>
                  </div>
                  <div className="flex justify-between items-center text-white/60">
                    <span className="text-xs font-medium">Endpoint URI</span>
                    <span className="text-xs font-bold px-2 py-1 rounded bg-white/5 text-white/80">http://localhost:11434</span>
                  </div>
               </div>

               {/* LM Studio Engine */}
               <div className="p-6 bg-black/40 border border-white/5 rounded-2xl space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-white/5">
                    <span className="text-white/30 font-bold uppercase tracking-wider text-[10px]">LM Studio Host</span>
                    {loading ? (
                       <span className="text-white/20 text-xs font-bold animate-pulse">Checking...</span>
                    ) : status.lmStudio ? (
                       <span className="text-emerald-400 text-xs font-bold">Online</span>
                    ) : (
                       <span className="text-red-400 text-xs font-bold">Offline</span>
                    )}
                  </div>
                  <div className="flex justify-between items-center text-white/60">
                    <span className="text-xs font-medium">API Server</span>
                    <span className="text-xs font-bold">Port 1234</span>
                  </div>
                  <div className="flex justify-between items-center text-white/60">
                    <span className="text-xs font-medium">OpenAI Compatible</span>
                    <span className="text-xs font-bold px-2 py-1 rounded bg-white/5 text-emerald-400">Yes</span>
                  </div>
               </div>
            </div>
          </div>

          <div className="pt-10 border-t border-white/5">
             <div className="flex items-center justify-between mb-8">
                <div className="space-y-1">
                  <div className="text-sm font-bold text-white tracking-wide">Gemini Brain Link</div>
                  <p className="text-xs text-white/40">Remote inference for Debate framework and DLX Roster agents.</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                   <Zap size={20} />
                </div>
             </div>
             <div className="p-6 bg-[#0d0d14] border border-white/5 rounded-2xl">
                <label className="text-xs font-bold text-white/60 uppercase tracking-widest block mb-4">Gemini Free Key Configuration</label>
                <div className="flex gap-4">
                   <input type="password" value="***************************************" readOnly className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-sm text-white/80 font-mono focus:outline-none" />
                   <button className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white text-sm font-bold rounded-xl transition-all border border-white/10 shrink-0">
                      Update Key
                   </button>
                </div>
                <p className="text-[10px] text-white/30 mt-3 font-medium">This key is currently stored securely in your .env file as GEMINI_FREE_KEY.</p>
             </div>
          </div>

        </div>
      </div>

      <div className="p-8 border-t border-white/5 bg-white/[0.01] flex justify-end items-center mt-auto">
        <button
          onClick={() => {
             setLoading(true);
             fetch(`${import.meta.env.VITE_API_URL || ''}/api/llm/status`)
                .then(res => res.json())
                .then(data => {
                  setStatus(data);
                  setLoading(false);
                  toast.success('Hardware telemetry refreshed');
                }).catch(() => setLoading(false));
          }}
          className="px-8 py-3 bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-purple-500/20"
        >
          Refresh Telemetry
        </button>
      </div>
    </div>
  );
}
