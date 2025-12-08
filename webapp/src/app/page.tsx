'use client';

import { motion } from 'framer-motion';
import SystemStatus from '@/components/SystemStatus';
import LLMModels from '@/components/LLMModels';
import Link from 'next/link';
import HeroBackground from '@/components/HeroBackground';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.1 } }
};

const tools = [
  { icon: '👨‍💻', name: 'Dev Studio', desc: 'GitHub repos, deployments, and local dev environment.', color: 'cyan', href: '/studios/dev' },
  { icon: '🎵', name: 'Music Studio', desc: 'AI songwriting with Suno integration.', color: 'pink', href: '/music' },
  { icon: '💰', name: 'Revenue Hub', desc: 'Track income from all streams in one place.', color: 'green', href: '/income' },
  { icon: '🚀', name: 'Content Pipeline', desc: 'Automated content generation and publishing.', color: 'purple', href: '/pipeline' },
  { icon: '📰', name: 'News Hub', desc: 'AI-curated news with bias analysis.', color: 'blue', href: '/news' },
  { icon: '🎨', name: 'Creative Studios', desc: 'Art, video, podcast generation.', color: 'orange', href: '/studios' },
];

const stats = [
  { value: '10+', label: 'Local LLMs', icon: '🤖' },
  { value: '76', label: 'Pages Built', icon: '📄' },
  { value: '8', label: 'AI Studios', icon: '🎯' },
  { value: '$0', label: 'API Costs', icon: '💰' },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section - Redesigned */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <HeroBackground />

        <div className="relative z-10 container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            {/* Badge */}
            <motion.div
              className="flex justify-center mb-6"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                <span className="text-sm text-gray-300">Running on LuxRig • RTX 3060 • 32GB RAM</span>
              </div>
            </motion.div>

            {/* Main headline */}
            <motion.h1
              className="text-5xl md:text-7xl lg:text-8xl font-black text-center mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <span className="text-gradient">Your Personal</span>
              <br />
              <span className="text-white">AI Operating System</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              className="text-xl md:text-2xl text-gray-400 text-center max-w-3xl mx-auto mb-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Local LLMs. Real-time GPU monitoring. Multi-agent orchestration.
              <span className="text-cyan-400"> Zero API costs.</span>
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              className="flex gap-4 justify-center flex-wrap mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Link href="/dashboard" className="btn-primary group text-lg px-8 py-4">
                <span className="relative z-10">🚀 Launch Dashboard</span>
              </Link>
              <Link href="/music" className="btn-outline text-lg px-8 py-4">
                🎵 Try Music Studio
              </Link>
            </motion.div>

            {/* Stats row */}
            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  className="text-center p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm"
                  whileHover={{ scale: 1.05, borderColor: 'rgba(6, 182, 212, 0.5)' }}
                >
                  <div className="text-2xl mb-1">{stat.icon}</div>
                  <div className="text-3xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <span className="text-sm text-gray-500">Scroll to explore</span>
          <motion.div
            className="w-6 h-10 border-2 border-cyan-500/50 rounded-full flex justify-center p-2"
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <motion.div
              className="w-1.5 h-1.5 bg-cyan-400 rounded-full"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            />
          </motion.div>
        </motion.div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#030305] to-transparent"></div>
      </section>

      {/* Tools Grid - Moved up for immediate value */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-gradient">Everything</span> You Need
            </h2>
            <p className="text-gray-400 text-lg">
              AI-powered tools for building, creating, and automating
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {tools.map((tool) => (
              <Link key={tool.name} href={tool.href}>
                <motion.div
                  className="glass-card group cursor-pointer h-full"
                  variants={fadeInUp}
                  whileHover={{ scale: 1.02, y: -5 }}
                >
                  <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform">
                    {tool.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-cyan-400 transition-colors">
                    {tool.name}
                  </h3>
                  <p className="text-gray-400 text-sm">{tool.desc}</p>
                </motion.div>
              </Link>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Live Status */}
      <section className="py-20 px-4 bg-[#050508]">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 mb-6">
              <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></span>
              <span className="text-cyan-400 text-sm font-medium">LIVE DATA</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              System <span className="text-glow-cyan">Status</span>
            </h2>
          </motion.div>
          <SystemStatus />
        </div>
      </section>

      {/* LLM Arsenal */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 mb-6">
              <span className="text-purple-400 text-sm font-medium">LOCAL MODELS</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              LLM <span className="text-glow-magenta">Arsenal</span>
            </h2>
            <p className="text-gray-400 text-lg">
              Zero API costs • Full privacy • Your hardware
            </p>
          </motion.div>
          <LLMModels />
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-[#050508]">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            className="glass-card text-center py-16 relative overflow-hidden"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Ready to <span className="text-gradient">Start Building</span>?
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
                Jump into the dashboard or explore what's possible.
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <Link href="/dashboard" className="btn-primary text-lg px-8 py-4">
                  Open Dashboard
                </Link>
                <Link href="/studios" className="btn-outline text-lg px-8 py-4">
                  Explore Studios
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-800">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-sm font-bold">D</div>
              <span className="font-bold">DLX STUDIO</span>
            </div>
            <div className="flex gap-6 text-sm text-gray-400">
              <Link href="/docs" className="hover:text-cyan-400">Docs</Link>
              <Link href="/changelog" className="hover:text-cyan-400">Changelog</Link>
              <Link href="/settings" className="hover:text-cyan-400">Settings</Link>
              <a href="https://github.com/Dunker007" className="hover:text-cyan-400">GitHub</a>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Powered by LuxRig
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
