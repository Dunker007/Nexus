import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Plus, Search, LayoutList, LayoutGrid, ExternalLink, Beaker } from 'lucide-react';
import PageLayout, { PageHeader, StatPill } from '../components/PageLayout';

type Status = 'active' | 'preview' | 'concept';
type Category = 'Operations' | 'Intelligence' | 'Creation' | 'Capital' | 'Experimental';

interface Lab {
  id: string;
  name: string;
  icon: string;
  status: Status;
  category: Category;
  owner: string;
  progress: number;
  barStart: number;
  barEnd: number;
  route: string;
  description: string;
}

const LABS: Lab[] = [
  { id: 'nexus-plan',      name: 'Nexus Implementation Plan', icon: '📜', status: 'active',   category: 'Operations',     owner: 'A', progress: 40, barStart: 9,  barEnd: 11, route: '/dashboard',          description: 'Master implementation roadmap for the Nexus platform.' },
  { id: 'ai-staff',        name: 'AI Staff Meeting',          icon: '👥', status: 'active',   category: 'Operations',     owner: 'A', progress: 80, barStart: 0,  barEnd: 5,  route: '/meeting',            description: 'Autonomous AI agent staff meetings and briefings.' },
  { id: 'voice-command',   name: 'Voice Command',             icon: '🎙️', status: 'active',   category: 'Operations',     owner: 'G', progress: 90, barStart: 0,  barEnd: 6,  route: '/labs/voice-command', description: 'Natural language voice control for the entire Nexus OS.' },
  { id: 'automation',      name: 'Automation Lab',            icon: '⚡', status: 'active',   category: 'Operations',     owner: 'B', progress: 60, barStart: 0,  barEnd: 4,  route: '/labs/automation',    description: 'Workflow automation, triggers, and scheduled agent tasks.' },
  { id: 'smart-home',      name: 'Smart Home Control',        icon: '🏠', status: 'active',   category: 'Operations',     owner: 'B', progress: 45, barStart: 0,  barEnd: 9,  route: '/labs/smart-home',    description: 'AI-driven home automation and device orchestration.' },
  { id: 'analytics',       name: 'Analytics Hub',             icon: '📊', status: 'active',   category: 'Intelligence',   owner: 'O', progress: 40, barStart: 2,  barEnd: 6,  route: '/labs/analytics',     description: 'Real-time analytics dashboards and data visualization.' },
  { id: 'knowledge-base',  name: 'Knowledge Base',            icon: '📚', status: 'preview',  category: 'Intelligence',   owner: 'O', progress: 20, barStart: 2,  barEnd: 7,  route: '/labs/knowledge-base','description': 'Persistent AI memory and searchable knowledge graph.' },
  { id: 'data-weave',      name: 'Data Weave',                icon: '🌐', status: 'active',   category: 'Intelligence',   owner: 'B', progress: 10, barStart: 3,  barEnd: 5,  route: '/labs/data-weave',    description: 'Cross-source data aggregation and transformation pipeline.' },
  { id: 'music-studio',    name: 'Music Studio',              icon: '🎵', status: 'active',   category: 'Creation',       owner: 'P', progress: 75, barStart: 8,  barEnd: 11, route: '/music',              description: 'AI-assisted music production, Suno integration, and pipeline.' },
  { id: 'agent-forge',     name: 'Agent Forge',               icon: '🔨', status: 'preview',  category: 'Operations',     owner: 'L', progress: 50, barStart: 1,  barEnd: 6,  route: '/agentflow',          description: 'Visual agent builder and multi-agent workflow designer.' },
  { id: 'code-generator',  name: 'Code Generator',            icon: '💻', status: 'active',   category: 'Creation',       owner: 'B', progress: 75, barStart: 0,  barEnd: 4,  route: '/labs/code-generator','description': 'AI code generation, review, and deployment assistant.' },
  { id: 'vision-lab',      name: 'Vision Lab',                icon: '👁️', status: 'concept',  category: 'Intelligence',   owner: 'L', progress: 5,  barStart: 3,  barEnd: 8,  route: '/labs/vision',        description: 'Computer vision, image analysis, and visual AI tools.' },
  { id: 'smartfolio',      name: 'SmartFolio',                icon: '💰', status: 'active',   category: 'Capital',        owner: 'O', progress: 85, barStart: 0,  barEnd: 11, route: '/labs/smartfolio',    description: 'AI portfolio management, risk analysis, and market intelligence.' },
  { id: 'passive-income',  name: 'Passive Income',            icon: '💸', status: 'active',   category: 'Capital',        owner: 'O', progress: 60, barStart: 0,  barEnd: 11, route: '/labs/passive-income','description': 'Passive revenue streams, automation, and income tracking.' },
  { id: 'crypto-lab',      name: 'Crypto Lab',                icon: '💎', status: 'active',   category: 'Capital',        owner: 'O', progress: 30, barStart: 1,  barEnd: 6,  route: '/labs/crypto',        description: 'Crypto trading signals, DeFi monitoring, and on-chain analytics.' },
  { id: 'aura',            name: 'AURA Interface',            icon: '✨', status: 'concept',  category: 'Experimental',   owner: 'L', progress: 0,  barStart: 8,  barEnd: 11, route: '/labs/aura',          description: 'Next-gen ambient AI interface with spatial awareness.' },
  { id: 'pc-optimizer',    name: 'PC Optimizer',              icon: '⚡', status: 'concept',  category: 'Experimental',   owner: 'B', progress: 0,  barStart: 2,  barEnd: 6,  route: '/labs/pc-optimizer',  description: 'AI-driven system optimization, monitoring, and maintenance.' },
  { id: 'llm-lab',         name: 'LLM Lab',                   icon: '🧠', status: 'concept',  category: 'Experimental',   owner: 'A', progress: 0,  barStart: 2,  barEnd: 6,  route: '/labs/llm',           description: 'Local LLM benchmarking, fine-tuning, and model management.' },
];

const CATEGORIES: Array<'All' | Category> = ['All','Operations','Intelligence','Creation','Capital','Experimental'];

const STATUS_COLORS: Record<Status, { bar: string; dot: string; label: string; bg: string }> = {
  active:  { bar: 'bg-emerald-500',   dot: 'bg-emerald-400', label: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  preview: { bar: 'bg-amber-500',  dot: 'bg-amber-400',   label: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  concept: { bar: 'bg-white/20',   dot: 'bg-white/30',    label: 'text-white/40', bg: 'bg-white/5 border-white/10' },
};

export function Labs() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<'All' | Category>('All');
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'list' | 'grid'>('grid');

  const filtered = LABS.filter(l => {
    if (activeCategory !== 'All' && l.category !== activeCategory) return false;
    if (search && !l.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const active  = LABS.filter(l => l.status === 'active').length;
  const preview = LABS.filter(l => l.status === 'preview').length;
  const concept = LABS.filter(l => l.status === 'concept').length;

  return (
    <PageLayout color="cyan" noPadding>
      <div className="w-full max-w-[2000px] mx-auto px-6 md:px-10 py-10 pb-32 flex flex-col min-h-screen">
        
        <PageHeader
          title="Labs Hub"
          subtitle="Experimental feature roadmap & agent assignments"
          icon={<Beaker size={24} className="text-cyan-400" />}
          actions={
            <div className="flex items-center gap-4">
              <StatPill label="Static Data" />
              <div className="flex bg-white/5 border border-white/5 p-1 rounded-xl">
                <button 
                  onClick={() => setView('grid')}
                  className={`p-2 rounded-lg transition-all ${view === 'grid' ? 'bg-white/10 text-white' : 'text-white/20 hover:text-white/40'}`}
                >
                  <LayoutGrid size={16} />
                </button>
                <button 
                  onClick={() => setView('list')}
                  className={`p-2 rounded-lg transition-all ${view === 'list' ? 'bg-white/10 text-white' : 'text-white/20 hover:text-white/40'}`}
                >
                  <LayoutList size={16} />
                </button>
              </div>
            </div>
          }
        />

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
           <div className="flex flex-wrap items-center gap-2 p-1.5 bg-white/5 rounded-xl border border-white/5">
               {CATEGORIES.map(cat => (
                 <button 
                   key={cat} 
                   onClick={() => setActiveCategory(cat)}
                   className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${activeCategory === cat ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-lg shadow-cyan-500/10' : 'text-white/40 hover:text-white hover:bg-white/5 border border-transparent'}`}
                  >
                   {cat}
                 </button>
               ))}
           </div>

           <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl">
                 <Search size={16} className="text-white/20" />
                 <input 
                    type="text" 
                    placeholder="Search labs..." 
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="bg-transparent border-none outline-none text-sm text-white font-medium placeholder:text-white/20 w-48"
                 />
              </div>
              <button className="flex items-center gap-2 px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black text-sm font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(34,211,238,0.3)]">
                 <Plus size={16} /> New Idea
              </button>
           </div>
        </div>

        {/* Content Area */}
        <div className="flex-1">
           {view === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                 {filtered.map((lab, idx) => {
                    const sc = STATUS_COLORS[lab.status];
                    return (
                       <motion.div 
                          key={lab.id}
                          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                          onClick={() => navigate(lab.route)}
                          className="glass-card p-6 border-white/5 cursor-pointer hover:border-cyan-500/30 transition-all hover:bg-cyan-500/[0.02] flex flex-col shadow-xl group"
                       >
                          <div className="flex justify-between items-start mb-6">
                             <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform group-hover:bg-cyan-500/10 group-hover:border-cyan-500/20">
                                {lab.icon}
                             </div>
                             <div className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg border flex items-center gap-1.5 ${sc.bg} ${sc.label}`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${sc.dot} animate-pulse`} />
                                {lab.status}
                             </div>
                          </div>

                          <div className="text-[10px] font-bold text-cyan-400/60 uppercase tracking-widest mb-1.5">{lab.category}</div>
                          <h3 className="text-lg font-bold text-white mb-2 leading-tight group-hover:text-cyan-400 transition-colors uppercase">{lab.name}</h3>
                          <p className="text-sm text-white/40 leading-relaxed max-w-sm mb-6 flex-1 line-clamp-2">{lab.description}</p>

                          <div className="mt-auto">
                             <div className="flex justify-between items-center text-xs font-bold text-white/50 mb-2 uppercase tracking-wide">
                                <span>Progress</span>
                                <span className={lab.progress === 100 ? 'text-emerald-400' : ''}>{lab.progress}%</span>
                             </div>
                             <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden border border-white/5">
                                <motion.div 
                                   initial={{ width: 0 }} animate={{ width: `${lab.progress}%` }} transition={{ duration: 1 }}
                                   className={`h-full rounded-full ${sc.bar}`}
                                />
                             </div>
                          </div>
                          
                          <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all text-white/20 hover:text-cyan-400">
                             <ExternalLink size={16} />
                          </div>
                       </motion.div>
                    );
                 })}
              </div>
           ) : (
              <div className="glass-card border-white/5 overflow-hidden">
                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                       <thead>
                          <tr className="border-b border-white/5 bg-white/[0.02]">
                             <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-white/40">Project</th>
                             <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-white/40">Category</th>
                             <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-white/40">Status</th>
                             <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-white/40">Progress</th>
                             <th className="px-6 py-4 text-right"></th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-white/5">
                          {filtered.map(lab => {
                             const sc = STATUS_COLORS[lab.status];
                             return (
                                <tr key={lab.id} onClick={() => navigate(lab.route)} className="group hover:bg-white/[0.02] cursor-pointer transition-colors">
                                   <td className="px-6 py-4">
                                      <div className="flex items-center gap-4">
                                         <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-lg">{lab.icon}</div>
                                         <div>
                                            <div className="font-bold text-white group-hover:text-cyan-400 transition-colors">{lab.name}</div>
                                            <div className="text-xs text-white/40">{lab.description}</div>
                                         </div>
                                      </div>
                                   </td>
                                   <td className="px-6 py-4">
                                      <span className="text-xs font-medium text-white/50">{lab.category}</span>
                                   </td>
                                   <td className="px-6 py-4">
                                      <div className={`inline-flex items-center gap-2 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg border flex items-center gap-1.5 ${sc.bg} ${sc.label}`}>
                                         <div className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                                         {lab.status}
                                      </div>
                                   </td>
                                   <td className="px-6 py-4 min-w-[200px]">
                                      <div className="flex items-center gap-3">
                                         <div className="flex-1 h-1.5 bg-black/60 rounded-full border border-white/5 overflow-hidden">
                                            <div className={`h-full rounded-full ${sc.bar}`} style={{ width: `${lab.progress}%` }} />
                                         </div>
                                         <span className="text-xs font-bold text-white/50 w-8">{lab.progress}%</span>
                                      </div>
                                   </td>
                                   <td className="px-6 py-4 text-right">
                                      <button className="p-2 text-white/20 hover:text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                         <ExternalLink size={16} />
                                      </button>
                                   </td>
                                </tr>
                             );
                          })}
                       </tbody>
                    </table>
                 </div>
              </div>
           )}

           {filtered.length === 0 && (
              <div className="py-40 flex flex-col items-center justify-center text-center">
                 <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-6">
                    <Search size={24} className="text-white/20" />
                 </div>
                 <h3 className="text-xl font-bold text-white mb-2">No projects found</h3>
                 <p className="text-white/40">Try adjusting your category or search filters.</p>
              </div>
           )}
        </div>

        {/* Footer Summary */}
        <div className="mt-8 pt-6 border-t border-white/5 flex flex-wrap gap-6 items-center">
           <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <div className="w-2 h-2 rounded-full bg-emerald-400" /> {active} Active
           </div>
           <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <div className="w-2 h-2 rounded-full bg-amber-400" /> {preview} Preview
           </div>
           <div className="flex items-center gap-2 text-white/30 text-xs font-bold uppercase tracking-wider">
              <div className="w-2 h-2 rounded-full bg-white/20" /> {concept} Concept
           </div>
           <div className="ml-auto text-xs font-medium text-white/40">
              Showing {filtered.length} of {LABS.length} projects
           </div>
        </div>

      </div>
    </PageLayout>
  );
}
