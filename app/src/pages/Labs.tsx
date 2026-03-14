import { motion } from 'motion/react';
import { Plus, Beaker, Zap, Shield, Rocket, ExternalLink, Activity } from 'lucide-react';
import PageLayout, { PageHeader, StatPill } from '../components/PageLayout';

const MOCK_LABS = [
  { 
    id: 1, name: 'SmartFolio v3', status: 'Active', category: 'Capital Intelligence', 
    progress: 80, owner: 'Architect', color: 'cyan', icon: Zap,
    tags: ['Portfolio AI', 'Gemini 2.0', 'Risk Guard'],
    href: '/labs/smartfolio'
  },
  { 
    id: 2, name: 'Nexus Core', status: 'Active', category: 'Operations Control', 
    progress: 95, owner: 'Lux', color: 'purple', icon: Shield,
    tags: ['Backend', 'SQLite', 'Tailscale'],
    href: '#'
  },
  { 
    id: 3, name: 'News Radar', status: 'Preview', category: 'Intelligence Engine', 
    progress: 50, owner: 'Bytebot', color: 'amber', icon: Rocket,
    tags: ['News API', 'NLP', 'Fact-Check'],
    href: '/news'
  },
];

const COLOR_MAP: Record<string, { glow: string; accent: string; border: string; bg: string; pill: string }> = {
  cyan:   { glow: 'shadow-cyan-900/20', accent: 'text-cyan-400', border: 'border-cyan-500/30', bg: 'bg-cyan-500/5', pill: 'cyan' },
  purple: { glow: 'shadow-purple-900/20', accent: 'text-purple-400', border: 'border-purple-500/30', bg: 'bg-purple-500/5', pill: 'purple' },
  amber:  { glow: 'shadow-amber-900/20', accent: 'text-amber-400', border: 'border-amber-500/30', bg: 'bg-amber-500/5', pill: 'amber' },
};

export function Labs() {
  return (
    <PageLayout color="cyan">
      <div className="pb-16">
        <PageHeader
          title="Labs Hub"
          subtitle="EXPERIMENTAL ENGINE • AGENT ASSIGNMENTS"
          icon={<Beaker size={24} className="text-cyan-400" />}
          actions={
            <div className="flex items-center gap-4">
              <StatPill label={`${MOCK_LABS.filter(l => l.status === 'Active').length} Active`} color="cyan" pulse />
              <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-700 rounded-xl text-white text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all active:scale-95 shadow-xl shadow-cyan-900/20">
                <Plus size={14} /> Deploy Idea
              </button>
            </div>
          }
        />

        {/* System Telemetry Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
           {[
             { label: 'Total Nodes', val: MOCK_LABS.length, accent: 'text-white/60' },
             { label: 'Active NOW', val: MOCK_LABS.filter(l => l.status === 'Active').length, accent: 'text-emerald-400' },
             { label: 'In Preview', val: MOCK_LABS.filter(l => l.status === 'Preview').length, accent: 'text-amber-400' },
             { label: 'Avg Load', val: `${Math.round(MOCK_LABS.reduce((a, l) => a + l.progress, 0) / MOCK_LABS.length)}%`, accent: 'text-cyan-400' },
           ].map((item, i) => (
             <motion.div
               key={i}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.08 }}
               className="glass-card p-5 border-white/5 bg-white/[0.01] flex flex-col text-center gap-2"
             >
               <span className="text-[8px] font-black uppercase tracking-[0.4em] text-white/10">{item.label}</span>
               <span className={`text-2xl font-black ${item.accent} tracking-tighter`}>{item.val}</span>
             </motion.div>
           ))}
        </div>

        {/* Lab Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {MOCK_LABS.map((lab, index) => {
            const Icon = lab.icon;
            const colors = COLOR_MAP[lab.color] || COLOR_MAP.cyan;
            return (
              <motion.div
                key={lab.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, type: 'spring', stiffness: 100 }}
                className="group relative"
              >
                <div className={`h-full glass-card border-white/5 ${colors.bg} p-8 flex flex-col group-hover:${colors.border} transition-all duration-500 shadow-2xl ${colors.glow} group-hover:shadow-2xl group-hover:-translate-y-1`}>
                  
                  {/* Ambient Glow */}
                  <div className={`absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-all duration-700 ${colors.bg}`} />
                  
                  {/* Header Row */}
                  <div className="flex items-start justify-between mb-8 relative z-10">
                    <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center shadow-2xl ${colors.border} ${colors.bg}`}>
                       <Icon size={24} className={colors.accent} />
                    </div>
                    <div className="flex items-center gap-2">
                       <StatPill 
                         label={lab.status.toUpperCase()} 
                         color={lab.status === 'Active' ? 'green' : 'amber'} 
                         pulse={lab.status === 'Active'}
                       />
                    </div>
                  </div>

                  {/* Body */}
                  <div className="flex-1 relative z-10">
                    <div className={`text-[8px] font-black uppercase tracking-[0.4em] mb-2 ${colors.accent}`}>{lab.category}</div>
                    <h3 className="text-2xl font-black text-white mb-6 tracking-tighter uppercase leading-none group-hover:scale-[1.01] transition-transform">
                      {lab.name}
                    </h3>

                    {/* Progress Bar */}
                    <div className="mb-6">
                       <div className="flex justify-between text-[9px] font-black uppercase tracking-widest mb-3">
                         <span className="text-white/10 flex items-center gap-2"><Activity size={10} /> Kernel Load</span>
                         <span className={colors.accent}>{lab.progress}%</span>
                       </div>
                       <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                         <motion.div 
                           initial={{ width: 0 }}
                           animate={{ width: `${lab.progress}%` }}
                           transition={{ duration: 1.5, delay: 0.3 + index * 0.1, ease: 'easeOut' }}
                           className={`h-full rounded-full ${lab.color === 'purple' ? 'bg-gradient-to-r from-purple-500 to-indigo-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]' : lab.color === 'amber' ? 'bg-gradient-to-r from-amber-500 to-orange-500 shadow-[0_0_10px_rgba(245,158,11,0.4)]' : 'bg-gradient-to-r from-cyan-500 to-blue-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]'}`} 
                         />
                       </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                       {lab.tags.map(tag => (
                         <span key={tag} className="text-[8px] font-black uppercase tracking-widest text-white/10 bg-white/5 px-3 py-1 rounded-full border border-white/5">{tag}</span>
                       ))}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between relative z-10">
                     <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl ${colors.bg} border ${colors.border} flex items-center justify-center text-xs font-black ${colors.accent} shadow-lg`}>
                           {lab.owner[0]}
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/20">{lab.owner}</span>
                     </div>
                     <a href={lab.href} className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${colors.accent} opacity-40 hover:opacity-100 transition-all`}>
                        <ExternalLink size={12} /> Open Console
                     </a>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </PageLayout>
  );
}
