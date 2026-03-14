import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Plus, Search, LayoutList, LayoutGrid, ExternalLink } from 'lucide-react';
import PageLayout from '../components/PageLayout';

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
  // bar start/end as month index 0-11
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

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const CATEGORIES: Array<'All' | Category> = ['All','Operations','Intelligence','Creation','Capital','Experimental'];

const STATUS_COLORS: Record<Status, { bar: string; dot: string; label: string }> = {
  active:  { bar: 'bg-cyan-500',   dot: 'bg-emerald-400', label: 'text-emerald-400' },
  preview: { bar: 'bg-amber-500',  dot: 'bg-amber-400',   label: 'text-amber-400' },
  concept: { bar: 'bg-white/20',   dot: 'bg-white/30',    label: 'text-white/30' },
};

const currentMonth = new Date().getMonth(); // 0-indexed

export function Labs() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<'All' | Category>('All');
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'gantt' | 'grid'>('gantt');

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
      <div className="flex flex-col h-full overflow-hidden">

        {/* ── HEADER ─────────────────────────────────────────────────────── */}
        <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div>
            <h1 className="text-xl font-black text-white tracking-tight">
              🧪 Labs <span className="text-cyan-400">Hub</span>
            </h1>
            <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.25em', marginTop: '2px' }}>
              Experimental feature roadmap &amp; agent assignments
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Static data / sync pills */}
            <div style={{ display: 'flex', gap: '6px' }}>
              <span style={{ fontSize: '7px', fontWeight: 900, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.2em', border: '1px solid rgba(255,255,255,0.1)', padding: '3px 8px' }}>Static Data</span>
              <span style={{ fontSize: '7px', fontWeight: 900, color: 'rgba(6,182,212,0.7)', textTransform: 'uppercase', letterSpacing: '0.2em', border: '1px solid rgba(6,182,212,0.2)', padding: '3px 8px', background: 'rgba(6,182,212,0.05)' }}>Sync to DB</span>
            </div>
            {/* View toggles */}
            <div className="flex border border-white/10">
              {[{ v: 'gantt' as const, Icon: LayoutList }, { v: 'grid' as const, Icon: LayoutGrid }].map(({ v, Icon }) => (
                <button key={v} onClick={() => setView(v)}
                  style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: view === v ? 'rgba(255,255,255,0.07)' : 'transparent', color: view === v ? '#fff' : 'rgba(255,255,255,0.25)', cursor: 'pointer', border: 'none' }}>
                  <Icon size={13} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── FILTER BAR ──────────────────────────────────────────────────── */}
        <div className="shrink-0 flex items-center justify-between px-6 py-2 border-b border-white/5" style={{ background: '#08080c' }}>
          <div className="flex items-center gap-1">
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                style={{ padding: '4px 12px', fontSize: '8px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', cursor: 'pointer', fontFamily: 'inherit', border: activeCategory === cat ? '1px solid rgba(6,182,212,0.4)' : '1px solid transparent', background: activeCategory === cat ? 'rgba(6,182,212,0.1)' : 'transparent', color: activeCategory === cat ? '#22d3ee' : 'rgba(255,255,255,0.3)', borderRadius: '4px' }}>
                {cat}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid rgba(255,255,255,0.08)', padding: '4px 10px', background: 'rgba(255,255,255,0.02)' }}>
              <Search size={10} style={{ color: 'rgba(255,255,255,0.2)' }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search labs..."
                style={{ background: 'none', border: 'none', outline: 'none', fontSize: '9px', color: 'rgba(255,255,255,0.6)', fontFamily: 'inherit', width: '120px' }} />
            </div>
            <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 14px', background: 'rgba(6,182,212,0.15)', border: '1px solid rgba(6,182,212,0.3)', color: '#22d3ee', fontSize: '8px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', cursor: 'pointer', fontFamily: 'inherit' }}>
              <Plus size={11} /> New Idea
            </button>
          </div>
        </div>

        {/* ── CONTENT ─────────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-auto custom-scrollbar">

          {view === 'gantt' ? (
            <div style={{ minWidth: '900px' }}>
              {/* Gantt header */}
              <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', position: 'sticky', top: 0, background: '#08080c', borderBottom: '1px solid rgba(255,255,255,0.06)', zIndex: 10 }}>
                <div style={{ padding: '6px 16px', fontSize: '7px', fontWeight: 900, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.3em', borderRight: '1px solid rgba(255,255,255,0.06)' }}>PROJECT</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12,1fr)' }}>
                  {MONTHS.map((m, i) => (
                    <div key={m} style={{ padding: '6px 4px', fontSize: '7px', fontWeight: 900, color: i === currentMonth ? 'rgba(6,182,212,0.7)' : 'rgba(255,255,255,0.15)', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'center', borderRight: '1px solid rgba(255,255,255,0.03)', background: i === currentMonth ? 'rgba(6,182,212,0.04)' : 'transparent' }}>
                      {m}
                    </div>
                  ))}
                </div>
              </div>

              {/* Rows */}
              {filtered.map((lab, idx) => {
                const sc = STATUS_COLORS[lab.status];
                const barCols = lab.barEnd - lab.barStart + 1;
                return (
                  <motion.div key={lab.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    onClick={() => navigate(lab.route)}
                    style={{ display: 'grid', gridTemplateColumns: '260px 1fr', borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer', background: 'transparent' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                    {/* Label */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 16px', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
                      <span style={{ fontSize: '16px', flexShrink: 0 }}>{lab.icon}</span>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                          <h3 style={{ fontSize: '11px', fontWeight: 800, color: 'rgba(255,255,255,0.85)', letterSpacing: '-0.01em', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lab.name}</h3>
                          <ExternalLink size={8} style={{ color: 'rgba(255,255,255,0.15)', flexShrink: 0 }} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '6px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em' }} className={sc.label}>{lab.status}</span>
                          <span style={{ width: '3px', height: '3px', borderRadius: '50%', display: 'inline-block', background: 'rgba(255,255,255,0.1)' }} />
                          <span style={{ fontSize: '6px', fontWeight: 900, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{lab.owner}</span>
                        </div>
                      </div>
                    </div>
                    {/* Gantt bar */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12,1fr)', position: 'relative' }}>
                      {MONTHS.map((_, i) => (
                        <div key={i} style={{ borderRight: '1px solid rgba(255,255,255,0.03)', background: i === currentMonth ? 'rgba(6,182,212,0.02)' : 'transparent' }} />
                      ))}
                      {/* Bar overlay */}
                      <div style={{
                        position: 'absolute', top: '50%', transform: 'translateY(-50%)',
                        left: `${(lab.barStart / 12) * 100}%`,
                        width: `${(barCols / 12) * 100}%`,
                        padding: '0 4px',
                        height: '20px',
                        display: 'flex', alignItems: 'center',
                      }}>
                        <div style={{ width: '100%', height: '100%', position: 'relative', borderRadius: '2px', overflow: 'hidden', background: 'rgba(255,255,255,0.05)' }}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${lab.progress}%` }}
                            transition={{ duration: 1.2, delay: idx * 0.04, ease: 'easeOut' }}
                            className={sc.bar}
                            style={{ height: '100%', opacity: 0.75 }}
                          />
                          {lab.progress > 10 && (
                            <span style={{ position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)', fontSize: '7px', fontWeight: 900, color: 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap' }}>
                              {lab.progress}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {/* Legend */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px', borderTop: '1px solid rgba(255,255,255,0.06)', background: '#08080c' }}>
                <div style={{ display: 'flex', gap: '16px' }}>
                  {(['active','preview','concept'] as Status[]).map(s => (
                    <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', display: 'inline-block' }} className={STATUS_COLORS[s].dot} />
                      <span style={{ fontSize: '7px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em' }} className={STATUS_COLORS[s].label}>{s}</span>
                    </div>
                  ))}
                </div>
                <span style={{ fontSize: '7px', color: 'rgba(255,255,255,0.2)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                  {filtered.length} projects • Click to open
                </span>
              </div>
            </div>

          ) : (
            /* GRID VIEW */
            <div style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '12px' }}>
              {filtered.map((lab, idx) => {
                const sc = STATUS_COLORS[lab.status];
                return (
                  <motion.div key={lab.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    onClick={() => navigate(lab.route)}
                    style={{ padding: '16px', border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)', cursor: 'pointer', transition: 'border-color 0.15s' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.14)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)'}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span style={{ fontSize: '24px' }}>{lab.icon}</span>
                      <span style={{ fontSize: '6px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em' }} className={sc.label}>{lab.status}</span>
                    </div>
                    <div style={{ fontSize: '7px', fontWeight: 900, color: 'rgba(6,182,212,0.5)', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '4px' }}>{lab.category}</div>
                    <h3 style={{ fontSize: '14px', fontWeight: 900, color: '#fff', letterSpacing: '-0.01em', margin: '0 0 6px' }}>{lab.name}</h3>
                    <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', lineHeight: 1.5, margin: '0 0 12px' }}>{lab.description}</p>
                    <div style={{ height: '2px', background: 'rgba(255,255,255,0.05)', marginBottom: '6px' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${lab.progress}%` }}
                        transition={{ duration: 1, delay: idx * 0.04 }}
                        className={sc.bar}
                        style={{ height: '100%' }}
                      />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '7px', color: 'rgba(255,255,255,0.2)', fontWeight: 900, textTransform: 'uppercase' }}>{lab.progress}%</span>
                      <span style={{ fontSize: '7px', color: 'rgba(255,255,255,0.2)', fontWeight: 900, textTransform: 'uppercase' }}>{lab.owner}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── STATS FOOTER ────────────────────────────────────────────────── */}
        <div className="shrink-0 flex items-center gap-6 px-6 py-2 border-t border-white/5" style={{ background: '#08080c' }}>
          <span style={{ fontSize: '7px', fontWeight: 900, color: 'rgba(52,211,153,0.7)', textTransform: 'uppercase', letterSpacing: '0.2em' }}>● {active} Active</span>
          <span style={{ fontSize: '7px', fontWeight: 900, color: 'rgba(245,158,11,0.7)', textTransform: 'uppercase', letterSpacing: '0.2em' }}>● {preview} Preview</span>
          <span style={{ fontSize: '7px', fontWeight: 900, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.2em' }}>● {concept} Concept</span>
          <span style={{ fontSize: '7px', color: 'rgba(255,255,255,0.15)', textTransform: 'uppercase', letterSpacing: '0.15em', marginLeft: 'auto' }}>{LABS.length} total projects</span>
        </div>

      </div>
    </PageLayout>
  );
}
