import { motion } from 'motion/react';
import { Clock } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { useState, useEffect } from 'react';

export function GeneralSettings() {
  const { toast } = useToast();
  const [driveStatus, setDriveStatus] = useState<{ synced: boolean, checking: boolean, error?: string }>({ 
    synced: false, 
    checking: true 
  });

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || ''}/api/drive-anchor`)
      .then(res => {
         if (!res.ok) throw new Error('Auth failed');
         return res.json();
      })
      .then(data => {
         // Should return an array of folders if successful
         if (Array.isArray(data) && data.length > 0) {
           setDriveStatus({ synced: true, checking: false });
         } else {
           setDriveStatus({ synced: false, checking: false, error: 'Brain folder not found.' });
         }
      })
      .catch((e) => {
         setDriveStatus({ synced: false, checking: false, error: e.message });
      });
  }, []);

  return (
    <div className="glass-card border-white/5 bg-white/[0.01] overflow-hidden min-h-[600px] flex flex-col">
      <div className="p-10 flex-1">
        <div className="flex items-center gap-4 mb-12 pb-6 border-b border-white/5">
           <div className="w-1.5 h-6 bg-purple-500 rounded-full" aria-hidden="true" />
           <h2 className="text-xl font-bold text-white tracking-wide">General Settings</h2>
        </div>
        
        <div className="space-y-12 max-w-3xl">
          {/* Theme Section */}
          <div className="group">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
              <div className="space-y-1">
                <div className="text-sm font-bold text-white tracking-wide">Interface Theme</div>
                <p className="text-xs text-white/40 leading-relaxed">Dark mode is currently enabled by default across all applications.</p>
              </div>
              <div className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white/40 tracking-wider uppercase shrink-0">
                System Default
              </div>
            </div>
          </div>

          {/* Mesh Section */}
          <div className="pt-10 border-t border-white/5">
            <div className="flex items-center justify-between mb-8">
               <div className="space-y-1">
                 <div className="text-sm font-bold text-white tracking-wide">Remote Access (Tailscale)</div>
                 <p className="text-xs text-white/40">Manage your secure remote connection to the local server.</p>
               </div>
               <motion.div
                  whileHover={{ scale: 1.05 }}
                  role="switch"
                  aria-checked="true"
                  aria-label="Toggle remote access"
                  tabIndex={0}
                  className="w-14 h-7 bg-purple-500/20 border border-purple-500/40 rounded-full relative cursor-pointer"
               >
                  <div className="absolute right-1 top-1 w-5 h-5 bg-purple-400 rounded-full shadow-[0_0_15px_rgba(168,85,247,0.6)]" />
               </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-6 bg-black/40 border border-white/5 rounded-2xl space-y-4 font-mono">
                   <div className="flex justify-between items-center pb-3 border-b border-white/5">
                     <span className="text-white/30 font-bold uppercase tracking-wider text-[10px]">Local Server</span>
                     <span className="text-emerald-400 text-xs font-bold">Connected</span>
                   </div>
                   <div className="flex justify-between items-center text-white/60">
                     <span className="text-xs font-medium">Local Port</span>
                     <span className="text-xs font-bold px-2 py-1 rounded bg-white/5 text-white/80">3001</span>
                   </div>
                </div>

                <div className="p-6 bg-black/40 border border-white/5 rounded-2xl space-y-4 font-mono">
                   <div className="flex justify-between items-center pb-3 border-b border-white/5">
                     <span className="text-white/30 font-bold uppercase tracking-wider text-[10px]">Tailscale Network</span>
                     <span className="text-cyan-400 text-xs font-bold">Active</span>
                   </div>
                   <div className="flex justify-between items-center text-white/60">
                     <span className="text-xs font-medium">Tailscale IP</span>
                     <span className="text-xs font-bold px-2 py-1 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">100.X.X.X</span>
                   </div>
                </div>
            </div>
          </div>

          {/* Cloud Access */}
          <div className="pt-10 border-t border-white/5">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold text-white tracking-wide">Drive Integration</h3>
              <button 
                onClick={() => {
                   setDriveStatus({ synced: false, checking: true });
                   fetch(`${import.meta.env.VITE_API_URL || ''}/api/drive-anchor`)
                      .then(res => { if (!res.ok) throw new Error(); return res.json(); })
                      .then(data => {
                         if (Array.isArray(data) && data.length > 0) {
                            setDriveStatus({ synced: true, checking: false });
                            toast.success("Drive connection verified");
                         } else {
                            throw new Error('Not found');
                         }
                      })
                      .catch(() => setDriveStatus({ synced: false, checking: false, error: 'Connection failed' }));
                }}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/60 text-xs font-bold rounded-lg transition-all border border-white/10"
              >
                Test Connection
              </button>
            </div>
            <div className="relative group overflow-hidden bg-[#0d0d14] rounded-2xl border border-white/5">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/[0.03] to-cyan-500/[0.03] opacity-0 group-hover:opacity-100 transition-all duration-700" />
                <div className="p-8 relative z-10">
                  <div role="status" aria-label="Drive connection status" className="flex items-center gap-4 mb-4">
                    {driveStatus.checking ? (
                       <>
                         <div className="w-2.5 h-2.5 rounded-full bg-white/20 animate-pulse" />
                         <span className="text-xs font-bold text-white/50 tracking-wide">Authenticating...</span>
                       </>
                    ) : driveStatus.synced ? (
                       <>
                         <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" />
                         <span className="text-xs font-bold text-emerald-400 tracking-wide">Google Drive: Synced</span>
                       </>
                    ) : (
                       <>
                         <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)] animate-pulse" />
                         <span className="text-xs font-bold text-red-400 tracking-wide">Drive Auth Error: {driveStatus.error}</span>
                       </>
                    )}
                  </div>
                  <p className="text-sm text-white/40 leading-relaxed max-w-xl">
                    {driveStatus.synced 
                      ? <>Your local environment is successfully connected to the <span className="text-purple-400 font-medium">LuxRig_Brain</span> shared drive. Files and media assets are syncing properly.</>
                      : <>The backend is currently failing to authenticate against your Google Service Account or locate the target Drive folder.</>}
                  </p>
                </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 border-t border-white/5 bg-white/[0.01] flex justify-between items-center mt-auto">
        <div className="flex items-center gap-2 text-xs font-medium text-white/30">
          <Clock size={14} aria-hidden="true" /> Last saved: {new Date().toLocaleTimeString()}
        </div>
        <button
          onClick={() => toast.success('Settings saved successfully')}
          className="px-8 py-3 bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-purple-500/20"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
