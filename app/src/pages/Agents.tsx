import { motion } from 'motion/react';
import { Bot, Settings, Music, TrendingUp, BarChart2, Zap, MessageSquare, Search, Radio, Mic } from 'lucide-react';
import PageLayout from '../components/PageLayout';
import { useNavigate } from 'react-router-dom';

const ROSTER = [
  {
    id: 'newsician',
    name: 'Newsician',
    role: 'POLITICAL MUSICIAN',
    status: 'ONLINE',
    statusDot: 'bg-emerald-500',
    icon: Mic,
    description: 'Edgy, intense, and politically charged. Specializes in industrial techno and protest anthems.',
    capabilities: ['Lyric Generation', 'Cover Art Design', 'Political Analysis'],
    classes: {
      border: 'border-red-500/20',
      iconBg: 'bg-red-500/10',
      iconBorder: 'border-red-500/30',
      textRole: 'text-red-400',
      textIcon: 'text-red-400',
      liveBg: 'bg-red-500/10 hover:bg-red-500/20',
      liveBorder: 'border-red-500/20',
      liveText: 'text-red-400'
    }
  },
  {
    id: 'qpl',
    name: 'QPL',
    role: 'MELLOW POLITICAL',
    status: 'ONLINE',
    statusDot: 'bg-emerald-500',
    icon: Music,
    description: 'Quiet Part Loud. Introspective, acoustic-focused political commentary with a mellow vibe.',
    capabilities: ['Acoustic Composition', 'Poetic Lyrics', 'Vibe Curation'],
    classes: {
      border: 'border-blue-500/20',
      iconBg: 'bg-blue-500/10',
      iconBorder: 'border-blue-500/30',
      textRole: 'text-blue-400',
      textIcon: 'text-blue-400',
      liveBg: 'bg-blue-500/10 hover:bg-blue-500/20',
      liveBorder: 'border-blue-500/20',
      liveText: 'text-blue-400'
    }
  },
  {
    id: 'mic',
    name: 'Mic',
    role: 'STUDIO MANAGER',
    status: 'ACTIVE',
    statusDot: 'bg-emerald-500',
    icon: Settings,
    description: 'Protects sustainable momentum. Manages distribution, visuals, and release cadence for DLX and QPL.',
    capabilities: ['Distribution Management', 'Visual Workflows', 'Release Strategy'],
    classes: {
      border: 'border-indigo-500/20',
      iconBg: 'bg-indigo-500/10',
      iconBorder: 'border-indigo-500/30',
      textRole: 'text-indigo-400',
      textIcon: 'text-indigo-400',
      liveBg: 'bg-indigo-500/10 hover:bg-indigo-500/20',
      liveBorder: 'border-indigo-500/20',
      liveText: 'text-indigo-400'
    }
  },
  {
    id: 'alto',
    name: 'Alto',
    role: 'IRA ADVISOR',
    status: 'ACTIVE',
    statusDot: 'bg-emerald-500',
    icon: TrendingUp,
    description: 'Dedicated financial parsing agent for Alto Crypto and Alternative Assets IRA accounts.',
    capabilities: ['Portfolio Parsing', 'Performance Analysis', 'Cross-Account View'],
    classes: {
      border: 'border-amber-500/20',
      iconBg: 'bg-amber-500/10',
      iconBorder: 'border-amber-500/30',
      textRole: 'text-amber-400',
      textIcon: 'text-amber-400',
      liveBg: 'bg-amber-500/10 hover:bg-amber-500/20',
      liveBorder: 'border-amber-500/20',
      liveText: 'text-amber-400'
    }
  },
  {
    id: 'schwab',
    name: 'Schwab Advisor',
    role: 'PORTFOLIO ADVISOR',
    status: 'ACTIVE',
    statusDot: 'bg-emerald-500',
    icon: BarChart2,
    description: 'Personal Schwab portfolio advisor and financial analyst. Monitors holdings, performance, and market context.',
    capabilities: ['Portfolio Analysis', 'Market Context', 'Statement Interpretation'],
    classes: {
      border: 'border-blue-500/20',
      iconBg: 'bg-blue-500/10',
      iconBorder: 'border-blue-500/30',
      textRole: 'text-blue-400',
      textIcon: 'text-blue-400',
      liveBg: 'bg-blue-500/10 hover:bg-blue-500/20',
      liveBorder: 'border-blue-500/20',
      liveText: 'text-blue-400'
    }
  },
  {
    id: 'lux',
    name: 'Lux',
    role: 'RIGHT-HAND AI',
    status: 'CORE',
    statusDot: 'bg-cyan-500',
    icon: Zap,
    description: "Chris's main thinking partner. Orchestrates the entire DLX operation across all sectors.",
    capabilities: ['Strategic Planning', 'Automation', 'Cross-Sector Integration'],
    classes: {
      border: 'border-cyan-500/20',
      iconBg: 'bg-cyan-500/10',
      iconBorder: 'border-cyan-500/30',
      textRole: 'text-cyan-400',
      textIcon: 'text-cyan-400',
      liveBg: 'bg-cyan-500/10 hover:bg-cyan-500/20',
      liveBorder: 'border-cyan-500/20',
      liveText: 'text-cyan-400'
    }
  }
];

export function Agents() {
  const navigate = useNavigate();

  return (
    <PageLayout color="cyan" noPadding>
      <div className="flex flex-col h-full overflow-y-auto custom-scrollbar">
        {/* Roster Header */}
        <div className="px-10 py-12 shrink-0">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Bot size={24} />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter">DLX <span className="text-cyan-400">Roster</span></h1>
          </div>
          <p className="text-sm font-medium text-gray-400">Meet your specialized AI agents and thinking partners.</p>
        </div>

        {/* Dynamic Grid */}
        <div className="px-10 pb-20">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full max-w-7xl mx-auto">
            {ROSTER.map((agent, i) => {
              const Icon = agent.icon;
              return (
                <motion.div 
                  key={agent.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`flex flex-col p-6 rounded-2xl border ${agent.classes.border} bg-[#0b0b10] hover:bg-white/[0.03] transition-colors relative z-10 shadow-2xl overflow-hidden`}
                >
                  {/* Faint Background Glow */}
                  <div className={`absolute -inset-24 opacity-[0.03] blur-3xl rounded-full ${agent.classes.iconBg} pointer-events-none -z-10`}></div>
                  
                  {/* Top Bar */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-4 items-center">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${agent.classes.iconBg} ${agent.classes.textIcon} border ${agent.classes.iconBorder} shadow-lg shrink-0`}>
                        <Icon size={24} />
                      </div>
                      <div>
                        <h2 className="text-2xl font-black text-white tracking-tight">{agent.name}</h2>
                        <p className={`text-[10px] font-black tracking-[0.2em] ${agent.classes.textRole} uppercase mt-0.5`}>{agent.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 shrink-0 shadow-inner">
                      <div className={`w-1.5 h-1.5 rounded-full ${agent.statusDot} shadow-[0_0_8px_currentColor]`}></div>
                      <span className="text-[9px] font-black text-white/50 tracking-widest uppercase">{agent.status}</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-400 leading-relaxed font-medium mb-6 min-h-[44px]">
                    {agent.description}
                  </p>

                  {/* Capabilities */}
                  <div className="mb-8">
                    <h3 className="text-[9px] text-white/30 font-black tracking-[0.3em] uppercase mb-4 pl-1">Capabilities</h3>
                    <div className="flex flex-wrap gap-2.5">
                      {agent.capabilities.map((cap, idx) => (
                        <span key={idx} className="px-3.5 py-1.5 text-[10px] font-bold text-gray-300 bg-white/[0.03] border border-white/10 rounded-lg shadow-sm">
                          {cap}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-auto flex flex-col gap-3">
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => navigate('/chat', { state: { agentId: agent.id } })}
                        className="flex items-center justify-center gap-2 py-3 bg-white hover:bg-gray-200 text-black shadow-lg shadow-white/10 rounded-xl font-black text-xs transition-colors"
                      >
                        <MessageSquare size={16} /> Chat
                      </button>
                      <button className="flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-bold text-xs shadow-inner transition-colors">
                        <Search size={16} /> Grounded
                      </button>
                    </div>
                    <div className="flex gap-3">
                      <button className={`flex-1 flex items-center justify-center gap-2 py-3 ${agent.classes.liveBg} border ${agent.classes.liveBorder} ${agent.classes.liveText} rounded-xl font-bold text-xs shadow-inner transition-colors`}>
                        <Radio size={16} /> Live Mode
                      </button>
                      <button className="px-4 flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 text-white/30 hover:text-white rounded-xl shadow-inner transition-colors">
                        <Settings size={18} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
