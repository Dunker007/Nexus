import { motion } from 'motion/react';
import { Settings2, Monitor, Database, Shield, Link2, Bell, Clock, Cpu, HardDrive } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import PageLayout, { PageHeader, StatPill } from '../components/PageLayout';
import { useState } from 'react';

export function Settings() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('general');

  const TABS = [
    { id: 'general', label: 'General', icon: Monitor },
    { id: 'ai', label: 'Local Models', icon: Database },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'connections', label: 'Connections', icon: Link2 },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <PageLayout color="purple" noPadding>
      <div className="max-w-[1600px] mx-auto px-6 py-10 pb-32">
        <PageHeader
          title="Kernel Settings"
          subtitle="CONFIGURATION ENGINE • DLX STUDIOS LOCAL v4.2"
          icon={<Settings2 size={24} className="text-purple-400" />}
          actions={
            <div className="flex items-center gap-3">
              <StatPill label="SYSTEM_AUTH_OK" color="green" />
              <StatPill label="KERN_v4.28" />
            </div>
          }
        />

        <div className="grid lg:grid-cols-12 gap-10 items-start mt-4">
          
          {/* Sidebar Navigation */}
          <div className="lg:col-span-3 space-y-6">
            <div className="glass-card p-4 border-white/5 bg-white/[0.01]">
              <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mb-6 ml-4">Sub-Systems</h3>
              <div className="space-y-1">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center justify-between px-5 py-4 rounded-xl transition-all border ${
                      activeTab === tab.id 
                        ? 'bg-purple-500/10 border-purple-500/30 text-white shadow-xl shadow-purple-950/20' 
                        : 'text-white/30 border-transparent hover:bg-white/[0.02] hover:text-white/60'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <tab.icon size={16} className={activeTab === tab.id ? 'text-purple-400' : 'text-white/10'} />
                      <span className="text-[11px] font-black uppercase tracking-widest">{tab.label}</span>
                    </div>
                    {activeTab === tab.id && <div className="w-1 h-3 bg-purple-500 rounded-full" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="glass-card p-6 border-white/5 bg-gradient-to-br from-purple-500/[0.02] to-transparent">
               <h4 className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-4">Hardware Telemetry</h4>
               <div className="space-y-4">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3 text-white/40">
                        <Cpu size={12} />
                        <span className="text-[10px] font-black uppercase tracking-tight">Processor</span>
                     </div>
                     <span className="text-[10px] font-black text-purple-400">READY</span>
                  </div>
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3 text-white/40">
                        <HardDrive size={12} />
                        <span className="text-[10px] font-black uppercase tracking-tight">Storage</span>
                     </div>
                     <span className="text-[10px] font-black text-cyan-400">OK</span>
                  </div>
               </div>
            </div>
          </div>

          {/* Main Configuration Workspace */}
          <div className="lg:col-span-9">
            <div className="glass-card border-white/5 bg-white/[0.01] overflow-hidden min-h-[600px] flex flex-col">
              <div className="p-10 flex-1">
                <div className="flex items-center gap-4 mb-12 pb-6 border-b border-white/5">
                   <div className="w-1 h-6 bg-purple-500 rounded-full" />
                   <h2 className="text-xl font-black text-white uppercase tracking-tighter">System Parameters</h2>
                </div>
                
                <div className="space-y-12 max-w-3xl">
                  {/* Theme Section */}
                  <div className="group">
                    <div className="flex items-center justify-between mb-2">
                      <div className="space-y-1">
                        <div className="text-xs font-black text-white uppercase tracking-widest group-hover:text-purple-400 transition-colors">Interface Matrix Optimization</div>
                        <p className="text-[10px] text-white/20 font-black uppercase tracking-widest leading-relaxed">Nexus OS defaults to native OLED/Dark glass mode for maximum neural focus</p>
                      </div>
                      <div className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black text-white/20 tracking-widest uppercase">
                        KERNEL_LOCKED
                      </div>
                    </div>
                  </div>

                  {/* Mesh Section */}
                  <div className="pt-10 border-t border-white/5">
                    <div className="flex items-center justify-between mb-8">
                       <div className="space-y-1">
                         <div className="text-xs font-black text-white uppercase tracking-widest">Neural Mesh (Tailscale)</div>
                         <p className="text-[10px] text-white/20 font-black uppercase tracking-widest">Secure peer-to-peer encrypted workstation uplink</p>
                       </div>
                       <motion.div 
                          whileHover={{ scale: 1.05 }}
                          className="w-14 h-7 bg-purple-500/20 border border-purple-500/40 rounded-full relative cursor-pointer"
                       >
                          <div className="absolute right-1 top-1 w-5 h-5 bg-purple-400 rounded-full shadow-[0_0_15px_rgba(168,85,247,0.6)]" />
                       </motion.div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-6 bg-black/40 border border-white/5 rounded-2xl space-y-4 font-mono">
                           <div className="flex justify-between items-center pb-3 border-b border-white/5">
                             <span className="text-white/10 font-black uppercase tracking-widest text-[8px]">Network Node</span>
                             <span className="text-emerald-400 text-[10px] font-black uppercase">Active_Link</span>
                           </div>
                           <div className="flex justify-between items-center text-white/60">
                             <span className="text-[10px] uppercase font-black tracking-widest">Host Vector</span>
                             <span className="text-[11px] font-black px-2 py-1 rounded bg-white/5 text-white/80">3001</span>
                           </div>
                        </div>

                        <div className="p-6 bg-black/40 border border-white/5 rounded-2xl space-y-4 font-mono">
                           <div className="flex justify-between items-center pb-3 border-b border-white/5">
                             <span className="text-white/10 font-black uppercase tracking-widest text-[8px]">Mesh Access</span>
                             <span className="text-cyan-400 text-[10px] font-black uppercase">Synchronized</span>
                           </div>
                           <div className="flex justify-between items-center text-white/60">
                             <span className="text-[10px] uppercase font-black tracking-widest">Global IP</span>
                             <span className="text-[11px] font-black px-2 py-1 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">100.X.X.X</span>
                           </div>
                        </div>
                    </div>
                  </div>

                  {/* Cloud Access */}
                  <div className="pt-10 border-t border-white/5">
                    <h3 className="text-xs font-black text-white/40 uppercase tracking-widest mb-6">Cloud Synapse Integration</h3>
                    <div className="relative group overflow-hidden bg-[#0d0d14] rounded-2xl border border-white/5">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/[0.03] to-cyan-500/[0.03] opacity-0 group-hover:opacity-100 transition-all duration-700" />
                        <div className="p-8 relative z-10">
                          <div className="flex items-center gap-4 mb-4">
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" />
                            <span className="text-[10px] font-black text-white/60 uppercase tracking-[0.3em]">Synapse Bridge: OK</span>
                          </div>
                          <p className="text-[11px] text-white/30 font-black uppercase leading-loose tracking-widest max-w-xl">
                            Local environment is securely mapped to <span className="text-purple-400">LuxRig_Brain</span>. 
                            FileSystem and Drive sectors are synchronized under DLX Studios protocol.
                          </p>
                        </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 border-t border-white/5 bg-white/[0.01] flex justify-between items-center mt-auto">
                <div className="flex items-center gap-2 text-[8px] font-black text-white/5 uppercase tracking-[0.6em]">
                  <Clock size={10} /> Last Commit: {new Date().toLocaleTimeString()}
                </div>
                <button
                  onClick={() => toast.success('Kernel profiles updated successfully')}
                  className="px-10 py-4 bg-gradient-to-r from-purple-600 to-indigo-800 hover:brightness-110 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl transition-all shadow-2xl shadow-purple-950/40"
                >
                  Confirm Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
