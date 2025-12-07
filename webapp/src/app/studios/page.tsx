'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { LayoutGrid, Grid3X3, List } from 'lucide-react';
import PageBackground from '@/components/PageBackground';

interface Studio {
  id: string;
  name: string;
  description: string;
  icon: string;
  href: string;
  color: string; // Tailwind color class partial
  status: 'live' | 'beta' | 'coming-soon';
  features: string[];
}

const studios: Studio[] = [
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

const getStatusBadge = (status: Studio['status']) => {
  switch (status) {
    case 'live':
      return <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-bold uppercase tracking-wider border border-green-500/30">● Live</span>;
    case 'beta':
      return <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-xs font-bold uppercase tracking-wider border border-cyan-500/30">◐ Beta</span>;
    case 'coming-soon':
      return <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs font-bold uppercase tracking-wider border border-purple-500/30">◌ Coming Soon</span>;
  }
};

export default function StudiosPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'compact' | 'list'>('grid');

  return (
    <div className="min-h-screen pt-20 pb-20 relative">
      <PageBackground color="cyan" />

      {/* Compact Command Header */}
      <section className="py-6 border-b border-white/5 relative z-10">
        <div className="container-main">
          <motion.div
            className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Left: Title + Icon */}
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-xl border border-white/10">
                <span className="text-2xl">🎨</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  AI <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Studios</span>
                </h1>
                <p className="text-xs text-gray-500">Your creative command center</p>
              </div>
            </div>

            {/* Center: View Toggle + Stats */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* View Toggle */}
              <div className="flex items-center bg-white/5 rounded-lg p-0.5 border border-white/10">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-all flex items-center gap-1.5 ${viewMode === 'grid' ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-500 hover:text-white'}`}
                >
                  <LayoutGrid size={12} /> Grid
                </button>
                <button
                  onClick={() => setViewMode('compact')}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-all flex items-center gap-1.5 ${viewMode === 'compact' ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-500 hover:text-white'}`}
                >
                  <Grid3X3 size={12} /> Compact
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-all flex items-center gap-1.5 ${viewMode === 'list' ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-500 hover:text-white'}`}
                >
                  <List size={12} /> List
                </button>
              </div>

              {/* Live Stats */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                <span className="text-xs font-medium text-green-400">{studios.filter(s => s.status === 'live').length} Live</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                <span className="text-xs font-medium text-cyan-400">{studios.filter(s => s.status === 'beta').length} Beta</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <span className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                <span className="text-xs font-medium text-purple-400">{studios.filter(s => s.status === 'coming-soon').length} Coming</span>
              </div>
            </div>

            {/* Right: Quick Actions */}
            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-400">
                <span>⌘K</span> Quick launch
              </div>
              <Link
                href="/income"
                className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                💰 Income Dashboard
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Studios - View Mode Aware */}
      <section className="container-main mt-8">
        {/* Grid View */}
        {viewMode === 'grid' && (
          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
          >
            {studios.map((studio) => {
              const isDisabled = studio.status === 'coming-soon';
              return (
                <motion.div
                  key={studio.id}
                  variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                >
                  <Link
                    href={isDisabled ? '#' : studio.href}
                    className={`block h-full group ${isDisabled ? 'cursor-not-allowed opacity-60' : ''}`}
                  >
                    <div className="glass-card h-full p-4 transition-all group-hover:-translate-y-1">
                      <div className="flex items-start gap-3 mb-3">
                        <span className="text-2xl">{studio.icon}</span>
                        {getStatusBadge(studio.status)}
                      </div>
                      <h2 className="text-lg font-bold mb-1 group-hover:text-cyan-400 transition-colors">{studio.name}</h2>
                      <p className="text-gray-500 text-xs line-clamp-2 mb-3">{studio.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {studio.features.slice(0, 2).map(f => (
                          <span key={f} className="px-2 py-0.5 text-[10px] bg-white/5 rounded text-gray-500">{f}</span>
                        ))}
                        {studio.features.length > 2 && (
                          <span className="px-2 py-0.5 text-[10px] bg-white/5 rounded text-gray-500">+{studio.features.length - 2}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Compact View */}
        {viewMode === 'compact' && (
          <motion.div
            className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.02 } } }}
          >
            {studios.map((studio) => {
              const isDisabled = studio.status === 'coming-soon';
              return (
                <motion.div
                  key={studio.id}
                  variants={{ hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1 } }}
                >
                  <Link
                    href={isDisabled ? '#' : studio.href}
                    className={`block group ${isDisabled ? 'cursor-not-allowed opacity-60' : ''}`}
                  >
                    <div className="glass-card p-3 text-center transition-all group-hover:scale-105">
                      <span className="text-2xl block mb-1">{studio.icon}</span>
                      <h3 className="text-[10px] font-semibold truncate">{studio.name.replace('DLX ', '')}</h3>
                      <span className={`text-[8px] ${studio.status === 'live' ? 'text-green-400' : studio.status === 'beta' ? 'text-cyan-400' : 'text-purple-400'}`}>
                        {studio.status === 'live' ? '● Live' : studio.status === 'beta' ? '◐ Beta' : '◌ Soon'}
                      </span>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* List View */}
        {viewMode === 'list' && (
          <motion.div
            className="space-y-2"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.02 } } }}
          >
            {studios.map((studio) => {
              const isDisabled = studio.status === 'coming-soon';
              return (
                <motion.div
                  key={studio.id}
                  variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }}
                >
                  <Link
                    href={isDisabled ? '#' : studio.href}
                    className={`block group ${isDisabled ? 'cursor-not-allowed opacity-60' : ''}`}
                  >
                    <div className="flex items-center gap-4 px-4 py-3 rounded-lg bg-white/[0.02] hover:bg-white/5 border border-transparent hover:border-white/10 transition-all">
                      <span className="text-xl">{studio.icon}</span>
                      <div className="w-40 flex-shrink-0">
                        <h3 className="font-semibold text-sm">{studio.name}</h3>
                      </div>
                      <p className="flex-1 text-xs text-gray-500 truncate hidden md:block">{studio.description}</p>
                      <div className="hidden lg:flex gap-1">
                        {studio.features.slice(0, 3).map(f => (
                          <span key={f} className="px-2 py-0.5 text-[10px] bg-white/5 rounded text-gray-500">{f}</span>
                        ))}
                      </div>
                      {getStatusBadge(studio.status)}
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </section>

      {/* Quick Stats */}
      <section className="container-main mt-32 pb-20">
        <motion.div
          className="glass-card p-10 bg-gradient-to-br from-gray-900/50 to-black/50"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-gradient mb-2">6</div>
              <div className="text-sm text-gray-500 uppercase tracking-widest">AI Studios</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-gradient mb-2">2</div>
              <div className="text-sm text-gray-500 uppercase tracking-widest">Active Now</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-gradient mb-2">12+</div>
              <div className="text-sm text-gray-500 uppercase tracking-widest">AI Agents</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-gradient mb-2">∞</div>
              <div className="text-sm text-gray-500 uppercase tracking-widest">Possibilities</div>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
