
import { useToast } from '../../contexts/ToastContext';

export function ConnectionsSettings() {
  const { toast } = useToast();

  return (
    <div className="glass-card border-white/5 bg-white/[0.01] overflow-hidden min-h-[600px] flex flex-col">
      <div className="p-10 flex-1">
        <div className="flex items-center gap-4 mb-12 pb-6 border-b border-white/5">
           <div className="w-1.5 h-6 bg-purple-500 rounded-full" />
           <h2 className="text-xl font-bold text-white tracking-wide">API Connections</h2>
        </div>
        
        <div className="space-y-12 max-w-3xl">
          <div className="group">
             <div className="space-y-1 mb-6">
                <div className="text-sm font-bold text-white tracking-wide">External Services Hookup</div>
                <p className="text-xs text-white/40 leading-relaxed">Secure storage for third-party API keys securely wrapped by the Nexus backend.</p>
             </div>

             <div className="p-6 bg-[#0d0d14] border border-white/5 rounded-2xl mb-4">
                <label className="text-xs font-bold text-white/60 uppercase tracking-widest block mb-4">Suno API (Music Gen)</label>
                <div className="flex gap-4">
                   <input type="password" placeholder="Enter API Key" className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-sm text-white/80 font-mono focus:outline-none focus:border-purple-500/50" />
                   <button 
                      onClick={() => toast.success('Key saved securely')}
                      className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white text-sm font-bold rounded-xl transition-all border border-white/10 shrink-0">
                      Save Key
                   </button>
                </div>
             </div>

             <div className="p-6 bg-[#0d0d14] border border-white/5 rounded-2xl">
                <label className="text-xs font-bold text-white/60 uppercase tracking-widest block mb-4">VidIQ Edge API</label>
                <div className="flex gap-4">
                   <input type="password" placeholder="Enter API Key" className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-sm text-white/80 font-mono focus:outline-none focus:border-purple-500/50" />
                   <button 
                      onClick={() => toast.success('Key saved securely')}
                      className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white text-sm font-bold rounded-xl transition-all border border-white/10 shrink-0">
                      Save Key
                   </button>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
