import { useToast } from '../../contexts/ToastContext';
import { Trash2 } from 'lucide-react';

export function PrivacySettings() {
  const { toast } = useToast();

  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to clear all local chat history and agent memory? This cannot be undone.")) {
       localStorage.removeItem('nexus-chat-messages');
       toast.success("All local memory flushed.");
    }
  };

  return (
    <div className="glass-card border-white/5 bg-white/[0.01] overflow-hidden min-h-[600px] flex flex-col">
      <div className="p-10 flex-1">
        <div className="flex items-center gap-4 mb-12 pb-6 border-b border-white/5">
           <div className="w-1.5 h-6 bg-purple-500 rounded-full" />
           <h2 className="text-xl font-bold text-white tracking-wide">Privacy & Data Control</h2>
        </div>
        
        <div className="space-y-12 max-w-3xl">
          <div className="group">
             <div className="space-y-1 mb-6">
                <div className="text-sm font-bold text-white tracking-wide">Data Purge</div>
                <p className="text-xs text-white/40 leading-relaxed">Clear all local context and conversation histories across the Nexus.</p>
             </div>

             <div className="p-6 bg-black/40 border border-red-500/20 rounded-2xl flex justify-between items-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-transparent pointer-events-none" />
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
                      <Trash2 size={20} />
                   </div>
                   <div>
                      <h4 className="text-sm font-bold text-white">Nuclear Option</h4>
                      <p className="text-xs text-white/50">Wipe all cached conversation history immediately.</p>
                   </div>
                </div>
                <button 
                  onClick={handleClearHistory}
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-red-500/20 text-xs shrink-0 relative z-10"
                >
                   Clear Memory
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
