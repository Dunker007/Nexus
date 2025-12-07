'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

const changelogData = [
    {
        version: '0.3.0',
        date: 'December 4, 2024',
        tag: 'latest',
        changes: [
            { type: 'feature', text: 'New website with 15+ pages' },
            { type: 'feature', text: 'Live AI Chat connected to LuxRig' },
            { type: 'feature', text: 'Free AI Deals page with 24 resources' },
            { type: 'feature', text: 'AI Trends and industry buzz tracking' },
            { type: 'feature', text: 'Prompt Library with 12 templates' },
            { type: 'feature', text: 'Project Showcase gallery' },
            { type: 'feature', text: 'AI Compare and cost calculator' },
            { type: 'feature', text: '3D Neural Network hero with Three.js' },
            { type: 'feature', text: '2026 Vision roadmap page' },
            { type: 'improvement', text: 'Cyberpunk design system with glassmorphism' },
            { type: 'improvement', text: 'Responsive navigation with active states' },
            { type: 'improvement', text: 'Framer Motion animations throughout' },
        ]
    },
    {
        version: '0.2.4',
        date: 'December 1, 2024',
        tag: 'stable',
        changes: [
            { type: 'feature', text: 'LuxRig Bridge API service' },
            { type: 'feature', text: 'Real-time system metrics (GPU, CPU, RAM)' },
            { type: 'feature', text: 'LM Studio and Ollama integration' },
            { type: 'feature', text: 'WebSocket server for live updates' },
            { type: 'fix', text: 'UI parity and layout fixes' },
            { type: 'fix', text: 'Restored Quick Access modal' },
        ]
    },
    {
        version: '0.2.3',
        date: 'November 28, 2024',
        tag: '',
        changes: [
            { type: 'feature', text: 'AI context menu system' },
            { type: 'feature', text: 'Task breakdown with AI assistance' },
            { type: 'feature', text: 'Note enhancement features' },
            { type: 'feature', text: 'Google Calendar integration' },
            { type: 'improvement', text: 'Settings modal improvements' },
        ]
    },
    {
        version: '0.2.0',
        date: 'November 20, 2024',
        tag: '',
        changes: [
            { type: 'feature', text: 'DLX Studio desktop app' },
            { type: 'feature', text: 'Task management system' },
            { type: 'feature', text: 'Note-taking with markdown' },
            { type: 'feature', text: 'Calendar view for scheduling' },
            { type: 'feature', text: 'File manager integration' },
            { type: 'feature', text: 'AI chat with local LLMs' },
        ]
    },
    {
        version: '0.1.0',
        date: 'November 15, 2024',
        tag: '',
        changes: [
            { type: 'feature', text: 'Initial project setup' },
            { type: 'feature', text: 'POE Canvas mind mapping tool' },
            { type: 'feature', text: 'Hybrid AI Orchestrator concept' },
            { type: 'feature', text: 'Content generation pipeline' },
        ]
    },
];

const typeIcon = {
    feature: { icon: '✨', color: 'text-green-400' },
    improvement: { icon: '⚡', color: 'text-cyan-400' },
    fix: { icon: '🐛', color: 'text-yellow-400' },
    breaking: { icon: '⚠️', color: 'text-red-400' },
};

export default function ChangelogPage() {
    return (
        <div className="min-h-screen pt-8">
            {/* Header */}
            <section className="section-padding pb-12">
                <div className="container-main">
                    <motion.div
                        className="text-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h1 className="text-5xl md:text-6xl font-bold mb-4">
                            <span className="text-gradient">Changelog</span>
                        </h1>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                            What's new, what's fixed, and what's coming. Track the evolution of DLX Studio.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Timeline */}
            <section className="container-main pb-16">
                <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-cyan-500 via-purple-500 to-transparent"></div>

                    <motion.div
                        className="space-y-12"
                        initial="initial"
                        animate="animate"
                        variants={{ animate: { transition: { staggerChildren: 0.1 } } }}
                    >
                        {changelogData.map((release, i) => (
                            <motion.div
                                key={release.version}
                                className="relative pl-20"
                                variants={{ initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 } }}
                            >
                                {/* Dot */}
                                <div className={`absolute left-6 w-5 h-5 rounded-full border-4 ${i === 0 ? 'bg-cyan-500 border-cyan-500/50' : 'bg-gray-700 border-gray-600'
                                    }`}></div>

                                {/* Content */}
                                <div className="glass-card">
                                    <div className="flex flex-wrap items-center gap-4 mb-4">
                                        <h2 className="text-2xl font-bold">v{release.version}</h2>
                                        {release.tag && (
                                            <span className={`px-3 py-1 rounded-full text-sm ${release.tag === 'latest'
                                                ? 'bg-green-500/20 text-green-400'
                                                : 'bg-cyan-500/20 text-cyan-400'
                                                }`}>
                                                {release.tag}
                                            </span>
                                        )}
                                        <span className="text-gray-500">{release.date}</span>
                                    </div>

                                    <ul className="space-y-2">
                                        {release.changes.map((change, j) => {
                                            const { icon, color } = typeIcon[change.type as keyof typeof typeIcon];
                                            return (
                                                <li key={j} className="flex items-start gap-3">
                                                    <span className={color}>{icon}</span>
                                                    <span className="text-gray-300">{change.text}</span>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Subscribe */}
            <section className="section-padding bg-[#050508]">
                <div className="container-main">
                    <motion.div
                        className="glass-card text-center py-12"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl font-bold mb-4">Get Release Updates</h2>
                        <p className="text-gray-400 mb-6">
                            Be the first to know when we ship new features.
                        </p>
                        <div className="flex gap-4 justify-center max-w-md mx-auto">
                            <input
                                type="email"
                                placeholder="your@email.com"
                                className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-500"
                            />
                            <button className="btn-primary">Subscribe</button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Back link */}
            <div className="container-main py-8">
                <Link href="/" className="text-gray-400 hover:text-cyan-400 transition-colors">
                    ← Back to Dashboard
                </Link>
            </div>
        </div>
    );
}
