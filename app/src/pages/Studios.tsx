import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { LayoutGrid, Grid3X3, List, Sparkles } from 'lucide-react';
import PageLayout, { PageHeader, StatPill } from '../components/PageLayout';

interface Studio {
  id: string;
  name: string;
  description: string;
  icon: string;
  href: string;
  color: string;
  status: 'live' | 'beta' | 'coming-soon';
  features: string[];
}

const studios: Studio[] = [
  {
    id: 'smartfolio',
    name: 'DLX SmartFolio',
    description: 'AI-powered crypto portfolio management. Real-time analysis, strategy execution, and risk monitoring with Gemini 2.0.',
    icon: '⚡',
    href: '/labs/smartfolio',
    color: 'emerald',
    status: 'live',
    features: ['Portfolio AI', 'Gemini 2.0', 'SUI Anchor', 'Risk Guard']
  },
  {
    id: 'music',
    name: 'DLX Music Studio',
    description: 'AI-powered songwriting with collaborative agents. Create lyrics, compose melodies, and generate Suno-ready prompts.',
    icon: '🎵',
    href: '/music',
    color: 'pink',
    status: 'live',
    features: ['Songwriter Agents', 'Newsician Rap Guo', 'Midwest Sentinel', 'Suno Integration']
  },
  {
    id: 'dev',
    name: 'DLX Dev Studio',
    description: 'Manage GitHub repositories, track system performance, and execute quick dev actions.',
    icon: '💻',
    href: '/studios/dev',
    color: 'cyan',
    status: 'live',
    features: ['GitHub Integration', 'System Monitor', 'Repo Management', 'Terminal Actions']
  },
  {
    id: 'video',
    name: 'DLX Video Studio',
    description: 'AI video creation with Neural Frames integration. Turn music into stunning visualizers and music videos.',
    icon: '🎬',
    href: '/studios/video',
    color: 'amber',
    status: 'beta',
    features: ['Neural Frames', 'Music Visualizers', 'AI Video Gen', 'YouTube Ready']
  },
  {
    id: 'blog',
    name: 'DLX Blog Studio',
    description: 'AI content creation for blogs and articles. SEO-optimized writing with your brand voice.',
    icon: '✍️',
    href: '/studios/blog',
    color: 'emerald',
    status: 'beta',
    features: ['AI Copywriting', 'SEO Optimization', 'Brand Voice', 'Auto Publishing']
  },
  {
    id: 'art',
    name: 'DLX Art Studio',
    description: 'AI image generation and editing. Create album covers, thumbnails, and visual assets.',
    icon: '🎨',
    href: '/studios/art',
    color: 'purple',
    status: 'beta',
    features: ['Image Generation', 'Style Selector', 'Prompting', 'Gallery']
  },
  {
    id: 'podcast',
    name: 'DLX Podcast Studio',
    description: 'AI-powered podcast creation. Script writing, voice synthesis, and audio production.',
    icon: '🎙️',
    href: '/studios/podcast',
    color: 'red',
    status: 'coming-soon',
    features: ['Script Writing', 'Voice Clone', 'Audio Editing', 'Distribution']
  },
  {
    id: '3dprint',
    name: 'DLX 3D Print Studio',
    description: 'Autonomous print farm management. AI model analysis, slicing optimization, and failure detection.',
    icon: '🖨️',
    href: '/studios/3dprint',
    color: 'orange',
    status: 'coming-soon',
    features: ['Print Farms', 'Model Analysis', 'Slice Optimization', 'Remote Monitor']
  },
  {
    id: 'laser',
    name: 'DLX Laser Studio',
    description: 'Precision laser engraving command center. AI vector generation and material settings optimization.',
    icon: '⚡',
    href: '/studios/laser',
    color: 'indigo',
    status: 'coming-soon',
    features: ['Vector Generation', 'Material Settings', 'Engrave Optimization', 'Job Queue']
  }
];

export function Studios() {
  const [viewMode, setViewMode] = useState<'grid' | 'compact' | 'list'>('grid');

  return (
    <PageLayout color="cyan" noPadding>
      <div className="max-w-7xl mx-auto px-6 py-10 pb-32">
        <PageHeader
          title="AI Studios"
          subtitle="CREATIVE COMMAND CENTER • NEURAL WORKSPACES"
          icon={<Sparkles size={24} className="text-cyan-400" />}
          actions={
            <div className="flex items-center gap-4">
               <div className="flex bg-white/5 border border-white/5 p-1 rounded-xl backdrop-blur-md">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-white/20 hover:text-white/40'}`}
                >
                  <LayoutGrid size={16} />
                </button>
                <button 
                  onClick={() => setViewMode('compact')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'compact' ? 'bg-white/10 text-white' : 'text-white/20 hover:text-white/40'}`}
                >
                  <Grid3X3 size={16} />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-white/20 hover:text-white/40'}`}
                >
                  <List size={16} />
                </button>
              </div>
              <StatPill label={`${studios.length} Nodes`} color="cyan" />
            </div>
          }
        />

        {/* Tactical HUD Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
           {[
             { label: 'Operational', val: studios.filter(s => s.status === 'live').length, color: 'text-emerald-400', bg: 'bg-emerald-500/5' },
             { label: 'Evaluation', val: studios.filter(s => s.status === 'beta').length, color: 'text-cyan-400', bg: 'bg-cyan-500/5' },
             { label: 'Researching', val: studios.filter(s => s.status === 'coming-soon').length, color: 'text-purple-400', bg: 'bg-purple-500/5' },
             { label: 'Uplink', val: 'ACTIVE', color: 'text-white/40', bg: 'bg-white/5' },
           ].map((stat, i) => (
             <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`px-6 py-4 rounded-2xl border border-white/5 ${stat.bg} flex flex-col items-center justify-center text-center`}
             >
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/10 mb-1">{stat.label}</span>
                <span className={`text-xl font-black ${stat.color} tracking-tighter`}>{stat.val}</span>
             </motion.div>
           ))}
        </div>

        <AnimatePresence mode="wait">
          {viewMode === 'grid' && (
            <motion.div
              key="grid"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6"
            >
              {studios.map((studio, idx) => {
                const isLocked = studio.status === 'coming-soon';
                return (
                  <motion.div
                    key={studio.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.03 }}
                  >
                    <Link
                      to={isLocked ? '#' : studio.href}
                      className={`block group h-full relative ${isLocked ? 'cursor-not-allowed opacity-40' : ''}`}
                    >
                      <div className="h-full glass-card border-white/5 bg-black/40 p-6 flex flex-col group-hover:border-cyan-500/40 transition-all group-hover:bg-cyan-500/[0.02] shadow-xl group-hover:shadow-cyan-900/10">
                        <div className="flex items-start justify-between mb-6">
                           <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                             {studio.icon}
                           </div>
                           <StatPill 
                             label={studio.status.replace('-', ' ').toUpperCase()} 
                             color={studio.status === 'live' ? 'green' : studio.status === 'beta' ? 'cyan' : 'purple'} 
                           />
                        </div>
                        <h3 className="text-sm font-black text-white uppercase tracking-tight mb-2 group-hover:text-cyan-400 transition-colors">{studio.name}</h3>
                        <p className="text-[10px] text-white/20 font-black leading-relaxed uppercase tracking-widest mb-6 flex-1">{studio.description}</p>
                        <div className="flex flex-wrap gap-2 pt-4 border-t border-white/5">
                           {studio.features.slice(0, 2).map(f => (
                             <span key={f} className="text-[8px] font-black uppercase tracking-widest text-white/10 bg-white/5 px-2 py-1 rounded-md">{f}</span>
                           ))}
                           {studio.features.length > 2 && (
                             <span className="text-[8px] font-black uppercase tracking-widest text-white/5 px-2 py-1">+{studio.features.length - 2}</span>
                           )}
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {viewMode === 'compact' && (
            <motion.div
              key="compact"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3"
            >
              {studios.map((studio) => (
                <Link
                  key={studio.id}
                  to={studio.status === 'coming-soon' ? '#' : studio.href}
                  className={`group relative ${studio.status === 'coming-soon' ? 'cursor-not-allowed opacity-30 shadow-none' : ''}`}
                >
                  <div className="glass-card p-4 border-white/5 bg-black/40 text-center flex flex-col items-center gap-3 hover:border-cyan-500/30 transition-all hover:bg-cyan-500/[0.05] hover:scale-105">
                     <span className="text-3xl filter drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">{studio.icon}</span>
                     <div className="min-w-0 w-full">
                        <div className="text-[9px] font-black text-white uppercase tracking-tighter truncate">{studio.name.replace('DLX ', '')}</div>
                        <div className={`text-[7px] font-black uppercase tracking-widest mt-1 ${studio.status === 'live' ? 'text-green-500' : studio.status === 'beta' ? 'text-cyan-500' : 'text-purple-500'}`}>
                           {studio.status.replace('-', ' ')}
                        </div>
                     </div>
                  </div>
                </Link>
              ))}
            </motion.div>
          )}

          {viewMode === 'list' && (
            <motion.div
              key="list"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-3"
            >
              {studios.map((studio) => (
                <Link
                  key={studio.id}
                  to={studio.status === 'coming-soon' ? '#' : studio.href}
                  className={`group block ${studio.status === 'coming-soon' ? 'cursor-not-allowed opacity-30' : ''}`}
                >
                  <div className="glass-card px-8 py-5 border-white/5 bg-black/40 hover:border-cyan-500/30 transition-all hover:bg-cyan-500/[0.02] flex items-center gap-8">
                     <span className="text-2xl w-10 flex-shrink-0 group-hover:scale-110 transition-transform">{studio.icon}</span>
                     <div className="w-48 flex-shrink-0">
                        <h3 className="text-sm font-black text-white uppercase tracking-tight group-hover:text-cyan-400 transition-colors uppercase">{studio.name}</h3>
                     </div>
                     <p className="flex-1 text-[10px] text-white/20 font-black uppercase tracking-widest truncate">{studio.description}</p>
                     <div className="hidden lg:flex items-center gap-3">
                        {studio.features.slice(0, 3).map(f => (
                          <span key={f} className="text-[8px] font-black uppercase tracking-widest text-white/10 px-3 py-1 bg-white/5 rounded-full">{f}</span>
                        ))}
                     </div>
                     <div className="w-24 flex justify-end">
                        <StatPill 
                          label={studio.status.toUpperCase()} 
                          color={studio.status === 'live' ? 'green' : studio.status === 'beta' ? 'cyan' : 'purple'} 
                        />
                     </div>
                  </div>
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Global Capability Matrix Footer */}
        <section className="mt-20">
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.5 }}
             className="glass-card p-10 border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent relative overflow-hidden"
           >
              <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10 grid md:grid-cols-4 gap-12 text-center">
                 <div>
                    <div className="text-4xl font-black text-white mb-2 tracking-tighter">6</div>
                    <div className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em]">Integrated Studios</div>
                 </div>
                 <div>
                    <div className="text-4xl font-black text-cyan-400 mb-2 tracking-tighter">12+</div>
                    <div className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em]">Active Agents</div>
                 </div>
                 <div>
                    <div className="text-4xl font-black text-purple-400 mb-2 tracking-tighter">2</div>
                    <div className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em]">Local Clusters</div>
                 </div>
                 <div>
                    <div className="text-4xl font-black text-emerald-400 mb-2 tracking-tighter">∞</div>
                    <div className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em]">Synthetic Nodes</div>
                 </div>
              </div>
           </motion.div>
        </section>
      </div>
    </PageLayout>
  );
}
