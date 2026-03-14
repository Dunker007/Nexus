import { Users, Play } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'motion/react';
import PageLayout, { PageHeader, StatPill } from '../components/PageLayout';

const AGENTS = [
  { id: 'architect', name: 'The Architect', emoji: '🏗️', role: 'System Design', color: 'indigo', active: true },
  { id: 'security', name: 'Security', emoji: '🔒', role: 'Risk Analysis', color: 'red', active: true },
  { id: 'qa', name: 'QA Lead', emoji: '🔍', role: 'Validation Engine', color: 'emerald', active: true },
  { id: 'devops', name: 'DevOps', emoji: '⚙️', role: 'Infrastructure', color: 'amber', active: false },
];

export function Meeting() {
  const [topic, setTopic] = useState('');
  const [rounds, setRounds] = useState(2);
  const [selected, setSelected] = useState<string[]>(['architect', 'security', 'qa']);

  const toggleAgent = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);
  };

  return (
    <PageLayout color="purple" noPadding>
      <div className="max-w-4xl mx-auto px-6 py-10 pb-32">
        <PageHeader
          title="AI Staff Meeting"
          subtitle="MULTI-AGENT DELIBERATION CHAMBER"
          icon={<Users size={24} className="text-purple-400" />}
          actions={
            <div className="flex items-center gap-3">
              <StatPill label={`${selected.length} Agents Selected`} color="purple" />
              <StatPill label={`${rounds} Rounds`} />
            </div>
          }
        />

        {/* Briefing Room */}
        <div className="space-y-8">

          {/* Agent Selection Grid */}
          <div>
            <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mb-5">Deliberation Panel</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {AGENTS.map((agent) => {
                const isSelected = selected.includes(agent.id);
                return (
                  <motion.button
                    key={agent.id}
                    whileHover={{ scale: agent.active ? 1.03 : 1 }}
                    whileTap={{ scale: agent.active ? 0.97 : 1 }}
                    onClick={() => agent.active && toggleAgent(agent.id)}
                    disabled={!agent.active}
                    className={`relative glass-card p-6 flex flex-col items-center gap-4 border transition-all ${
                      !agent.active 
                        ? 'opacity-20 cursor-not-allowed grayscale border-white/5 bg-white/[0.01]' 
                        : isSelected
                        ? 'border-purple-500/50 bg-purple-500/10 shadow-xl shadow-purple-950/20'
                        : 'border-white/5 bg-white/[0.01] hover:border-white/20 hover:bg-white/[0.03]'
                    }`}
                  >
                    {isSelected && (
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-3 right-3 w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                      >
                        <div className="w-2 h-2 rounded-full bg-white" />
                      </motion.div>
                    )}
                    <span className="text-3xl filter drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">{agent.emoji}</span>
                    <div className="text-center">
                      <div className={`text-[10px] font-black uppercase tracking-widest ${isSelected ? 'text-white' : 'text-white/40'}`}>{agent.name}</div>
                      <div className="text-[8px] font-black uppercase tracking-widest text-white/10 mt-1">{agent.role}</div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Briefing Input Panel */}
          <div className="glass-card border-white/5 bg-white/[0.01] p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            
            <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mb-8 relative z-10">Mission Brief</h3>
            
            <div className="relative z-10 space-y-8">
              <div>
                <label className="text-[9px] font-black text-white/10 uppercase tracking-[0.3em] mb-4 block">Deliberation Objective</label>
                <textarea
                  placeholder="What should the panel deliberate on? (e.g., Design a secure authentication system)"
                  className="w-full glass-input min-h-[120px] text-sm font-medium border-white/10 focus:border-purple-500/50 resize-none"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </div>

              {/* Parameters Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[9px] font-black text-white/10 uppercase tracking-[0.3em] mb-4 block">Debate Rounds</label>
                  <div className="flex items-center gap-4 glass-card p-4 border-white/5 bg-black/40">
                    <button 
                      onClick={() => setRounds(r => Math.max(1, r - 1))}
                      className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-all font-black text-lg"
                    >−</button>
                    <span className="flex-1 text-center text-xl font-black text-purple-400 tracking-tighter">{rounds}</span>
                    <button 
                      onClick={() => setRounds(r => Math.min(8, r + 1))}
                      className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-all font-black text-lg"
                    >+</button>
                  </div>
                </div>
                <div>
                  <label className="text-[9px] font-black text-white/10 uppercase tracking-[0.3em] mb-4 block">Session Mode</label>
                  <div className="glass-card p-4 border-white/5 bg-black/40 flex gap-2">
                    {['Debate', 'Consensus', 'Critique'].map(m => (
                      <button key={m} className="flex-1 py-2 text-[8px] font-black uppercase rounded-lg bg-white/5 border border-white/5 text-white/20 hover:text-white hover:bg-white/10 transition-all tracking-widest">{m}</button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Launch */}
              <div className="flex items-center justify-between pt-6 border-t border-white/5">
                <div className="flex items-center gap-3 text-white/10 text-[9px] font-black uppercase tracking-widest">
                  <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                  Nexus AI Council Ready
                </div>
                <button 
                  disabled={!topic.trim() || selected.length === 0}
                  className="px-10 py-4 bg-gradient-to-r from-indigo-600 to-purple-700 hover:brightness-110 active:scale-95 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl transition-all shadow-2xl shadow-purple-950/40 disabled:opacity-20 disabled:grayscale flex items-center gap-3"
                >
                  <Play size={14} /> Initiate Session
                </button>
              </div>
            </div>
          </div>

          {/* Agent Quote */}
          <div className="text-center py-8">
            <p className="text-[10px] font-black text-white/10 uppercase tracking-[0.4em]">"None of us is as smart as all of us."</p>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
