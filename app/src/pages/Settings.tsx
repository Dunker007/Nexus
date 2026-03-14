import { motion } from 'motion/react';
import { Settings2, Monitor, Database, Shield, Link2, Bell } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

export function Settings() {
  const { toast } = useToast();
  return (
    <div className="relative min-h-full bg-[#07070a] text-gray-100 overflow-hidden bg-mesh-purple">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-1/4 -right-20 w-[500px] h-[500px] bg-purple-500/5 blur-[120px] rounded-full" />
          <div className="absolute -bottom-20 -left-20 w-[500px] h-[500px] bg-cyan-500/5 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 p-8 md:p-12 max-w-6xl mx-auto h-full">
        {/* Header */}
        <div className="mb-12">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl font-black flex items-center gap-4 text-white mb-3 tracking-tight"
          >
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shadow-lg shadow-purple-500/5">
                <Settings2 className="text-purple-400 w-6 h-6" />
            </div>
            <span>KERNEL <span className="text-gradient-purple">SETTINGS</span></span>
          </motion.h1>
          <motion.p 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 0.1 }}
             className="text-white/30 text-xs font-black uppercase tracking-[0.3em] ml-16"
          >
             Configuration Engine • DLX Studios Local v4.2
          </motion.p>
        </div>

        <div className="flex flex-col lg:flex-row gap-10 items-start">
          {/* Side Nav */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full lg:w-72 shrink-0 glass-card p-4 space-y-2 border-white/5"
          >
            {[
              { id: 'general', label: 'General', icon: Monitor, active: true },
              { id: 'ai', label: 'Local Models', icon: Database },
              { id: 'privacy', label: 'Privacy', icon: Shield },
              { id: 'connections', label: 'Connections', icon: Link2 },
              { id: 'notifications', label: 'Notifications', icon: Bell },
            ].map((tab) => (
              <motion.button 
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                key={tab.id} 
                className={`w-full flex items-center justify-between px-5 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                tab.active ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-lg' : 'text-white/30 border border-transparent hover:bg-white/[0.02] hover:text-white/60'
              }`}
            >
                <div className="flex items-center gap-4">
                    <tab.icon className={`w-4 h-4 ${tab.active ? 'text-purple-400' : 'text-white/20'}`} />
                    {tab.label}
                </div>
                {tab.active && <div className="w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.6)]" />}
              </motion.button>
            ))}
          </motion.div>

          {/* Main Content */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex-1 w-full"
          >
            <div className="glass-card border-white/5 shadow-2xl overflow-hidden relative">
              <div className="p-8 md:p-10">
                <div className="flex items-center gap-3 mb-10 pb-6 border-b border-white/5">
                    <div className="w-1.5 h-6 bg-purple-500 rounded-full" />
                    <h2 className="text-xl font-black text-white uppercase tracking-wider">General Preferences</h2>
                </div>
                
                <div className="space-y-12">
                  <div className="group">
                    <label className="flex items-center justify-between cursor-pointer">
                      <div className="space-y-1">
                        <div className="text-sm font-black text-white/80 uppercase tracking-widest group-hover:text-white transition-colors">Interface Theme Matrix</div>
                        <div className="text-[10px] text-white/20 font-black uppercase tracking-widest">Nexus OS defaults to native OLED/Dark optimization</div>
                      </div>
                      <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black text-white/30 tracking-widest uppercase">
                        Locked to Kernel
                      </div>
                    </label>
                  </div>

                  <div className="pt-8 border-t border-white/5">
                    <label className="flex items-center justify-between cursor-pointer mb-8">
                      <div className="space-y-1">
                        <div className="text-sm font-black text-white/80 uppercase tracking-widest">Tailscale Neural Mesh</div>
                        <div className="text-[10px] text-white/20 font-black uppercase tracking-widest">Secure peer-to-peer remote workstation uplink</div>
                      </div>
                      <div className="w-14 h-7 bg-purple-600/20 border border-purple-500/30 rounded-full relative shadow-inner">
                        <div className="absolute right-1.5 top-1.5 w-4 h-4 bg-purple-400 rounded-full shadow-[0_0_12px_rgba(168,85,247,0.8)]" />
                      </div>
                    </label>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-5 bg-black/40 border border-white/5 rounded-2xl space-y-4 font-mono text-xs">
                           <div className="flex justify-between items-center pb-3 border-b border-white/5">
                             <span className="text-white/20 font-black uppercase tracking-widest text-[9px]">Local Host</span>
                             <span className="text-emerald-400 font-bold">3001 Secure</span>
                           </div>
                           <div className="flex justify-between items-center text-white/80 font-bold">
                             <span>Native IP:</span>
                             <span className="bg-white/5 px-2 py-1 rounded">127.0.0.1</span>
                           </div>
                        </div>

                        <div className="p-5 bg-black/40 border border-white/5 rounded-2xl space-y-4 font-mono text-xs">
                           <div className="flex justify-between items-center pb-3 border-b border-white/5">
                             <span className="text-white/20 font-black uppercase tracking-widest text-[9px]">Mesh Access</span>
                             <span className="text-cyan-400 font-bold">Active</span>
                           </div>
                           <div className="flex justify-between items-center text-white/80 font-bold">
                             <span>Tail IP:</span>
                             <span className="bg-cyan-500/10 text-cyan-400 px-2 py-1 rounded border border-cyan-500/20">100.x.x.x</span>
                           </div>
                        </div>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-white/5">
                    <h3 className="text-sm font-black text-white/80 uppercase tracking-widest mb-6">Cloud Synapse Integration</h3>
                    <div className="relative group overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="p-6 bg-blue-500/5 border border-blue-500/10 rounded-2xl relative z-10">
                          <div className="flex items-center gap-4 mb-3">
                            <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" />
                            <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Neural Bridge Authenticated</span>
                          </div>
                          <p className="text-[11px] text-white/40 font-medium leading-relaxed max-w-lg uppercase tracking-tight">
                            Nexus is securely mapped to <span className="text-blue-300">LuxRig_Brain</span> via service account. Shared memory and daily ops are synchronized.
                          </p>
                        </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-12 pt-8 border-t border-white/5 flex justify-between items-center">
                  <div className="text-[9px] font-black text-white/10 tracking-[0.5em] uppercase">
                    System Auth v4.28.0
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => toast.success('Kernel profiles updated successfully')}
                    className="px-8 py-3 bg-gradient-to-br from-purple-500 to-purple-700 hover:from-purple-400 hover:to-purple-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-purple-500/20"
                  >
                    Commit Changes
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
