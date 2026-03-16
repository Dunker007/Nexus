import { Bell, BadgeCheck } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { useState } from 'react';

export function NotificationsSettings() {
  const { toast } = useToast();
  const [browserAlerts, setBrowserAlerts] = useState(true);
  const [pipelineAlerts, setPipelineAlerts] = useState(true);

  return (
    <div className="glass-card border-white/5 bg-white/[0.01] overflow-hidden min-h-[600px] flex flex-col">
      <div className="p-10 flex-1">
        <div className="flex items-center gap-4 mb-12 pb-6 border-b border-white/5">
           <div className="w-1.5 h-6 bg-purple-500 rounded-full" />
           <h2 className="text-xl font-bold text-white tracking-wide">Notifications</h2>
        </div>
        
        <div className="space-y-12 max-w-3xl">
          <div className="group">
             <div className="space-y-1 mb-6">
                <div className="text-sm font-bold text-white tracking-wide">System Alerts</div>
                <p className="text-xs text-white/40 leading-relaxed">Control how the Nexus notifies you of events.</p>
             </div>

             <div className="space-y-4">
                <div className="p-6 bg-[#0d0d14] border border-white/5 rounded-2xl flex justify-between items-center">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                         <Bell size={20} />
                      </div>
                      <div>
                         <h4 className="text-sm font-bold text-white">Browser Toasts</h4>
                         <p className="text-[10px] text-white/40">In-app popups for completions and errors.</p>
                      </div>
                   </div>
                   <button 
                      onClick={() => {
                         setBrowserAlerts(!browserAlerts);
                         toast.success(browserAlerts ? 'Toasts Disabled' : 'Toasts Enabled');
                      }}
                      className={`w-14 h-7 rounded-full relative transition-all ${browserAlerts ? 'bg-purple-500/20 border-purple-500/40' : 'bg-white/5 border-white/10'}`}>
                      <div className={`absolute top-1 w-5 h-5 rounded-full shadow-lg transition-all border ${browserAlerts ? 'right-1 bg-purple-400 border-purple-300' : 'left-1 bg-white/20 border-white/30'}`} />
                   </button>
                </div>

                <div className="p-6 bg-[#0d0d14] border border-white/5 rounded-2xl flex justify-between items-center">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                         <BadgeCheck size={20} />
                      </div>
                      <div>
                         <h4 className="text-sm font-bold text-white">Pipeline Updates</h4>
                         <p className="text-[10px] text-white/40">Updates when background agents complete a task.</p>
                      </div>
                   </div>
                   <button 
                      onClick={() => {
                         setPipelineAlerts(!pipelineAlerts);
                         toast.success(pipelineAlerts ? 'Pipeline Alerts Disabled' : 'Pipeline Alerts Enabled');
                      }}
                      className={`w-14 h-7 rounded-full relative transition-all ${pipelineAlerts ? 'bg-cyan-500/20 border-cyan-500/40' : 'bg-white/5 border-white/10'}`}>
                      <div className={`absolute top-1 w-5 h-5 rounded-full shadow-lg transition-all border ${pipelineAlerts ? 'right-1 bg-cyan-400 border-cyan-300' : 'left-1 bg-white/20 border-white/30'}`} />
                   </button>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
