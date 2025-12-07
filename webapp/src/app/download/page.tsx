'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

const features = [
    { icon: '🧠', title: 'AI-Powered Tasks', desc: 'Break down complex tasks with AI assistance' },
    { icon: '📝', title: 'Smart Notes', desc: 'Enhance and organize notes with AI' },
    { icon: '📅', title: 'Calendar View', desc: 'Visual task scheduling and planning' },
    { icon: '💬', title: 'AI Chat', desc: 'Local LLM integration via LM Studio' },
    { icon: '📁', title: 'File Manager', desc: 'Real filesystem access and organization' },
    { icon: '🔗', title: 'Google Sync', desc: 'Drive, Calendar, and Gmail integration' },
    { icon: '⌨️', title: 'Keyboard-First', desc: 'Cmd+K command palette for power users' },
    { icon: '🎨', title: 'Layout Planner', desc: 'Drag and drop workspace customization' },
];

const requirements = [
    { item: 'Windows 10/11', optional: false },
    { item: '8GB RAM (16GB recommended)', optional: false },
    { item: 'LM Studio (for local AI)', optional: true },
    { item: 'Ollama (alternative local AI)', optional: true },
];

export default function DownloadPage() {
    return (
        <div className="min-h-screen pt-8">
            {/* Hero */}
            <section className="section-padding pb-12">
                <div className="container-main">
                    <motion.div
                        className="text-center max-w-4xl mx-auto"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 mb-6">
                            <span className="text-cyan-400 text-sm font-medium">v0.2.4 • LATEST</span>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-bold mb-6">
                            <span className="text-gradient">DLX</span> Studio
                        </h1>

                        <p className="text-xl text-gray-400 mb-8">
                            Your AI-powered desktop productivity hub. Tasks, notes, calendar,
                            file manager, and AI chat — all in one keyboard-driven interface.
                        </p>

                        <div className="flex gap-4 justify-center flex-wrap mb-8">
                            <a
                                href="/DLX Studio Setup 1.0.0.exe"
                                download
                                className="btn-primary text-lg px-8 py-4 flex items-center gap-3"
                            >
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801" />
                                </svg>
                                Download for Windows
                            </a>
                            <motion.a
                                href="https://github.com/Dunker007/Fresh-Start"
                                target="_blank"
                                className="btn-outline text-lg px-8 py-4"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                View Source
                            </motion.a>
                        </div>

                        <p className="text-gray-500 text-sm">
                            Free and open source • No account required • Your data stays local
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Screenshot Preview */}
            <section className="pb-16">
                <div className="container-main">
                    <motion.div
                        className="glass-card p-2 overflow-hidden"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="bg-gradient-to-br from-[#0a0e1a] to-[#050508] rounded-lg aspect-video flex items-center justify-center">
                            <div className="text-center text-gray-500">
                                <div className="text-6xl mb-4">🚀</div>
                                <p>App preview coming soon</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="section-padding bg-[#050508]">
                <div className="container-main">
                    <motion.h2
                        className="text-3xl font-bold text-center mb-12"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                    >
                        Everything You Need
                    </motion.h2>

                    <motion.div
                        className="grid grid-cols-2 md:grid-cols-4 gap-4"
                        initial="initial"
                        whileInView="animate"
                        viewport={{ once: true }}
                        variants={{
                            animate: { transition: { staggerChildren: 0.05 } }
                        }}
                    >
                        {features.map((feature) => (
                            <motion.div
                                key={feature.title}
                                className="glass-card text-center p-6"
                                variants={{
                                    initial: { opacity: 0, y: 20 },
                                    animate: { opacity: 1, y: 0 }
                                }}
                                whileHover={{ scale: 1.05 }}
                            >
                                <div className="text-4xl mb-3">{feature.icon}</div>
                                <h3 className="font-semibold mb-1">{feature.title}</h3>
                                <p className="text-sm text-gray-400">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Requirements */}
            <section className="section-padding">
                <div className="container-main">
                    <div className="grid md:grid-cols-2 gap-12">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-3xl font-bold mb-6">System Requirements</h2>
                            <ul className="space-y-4">
                                {requirements.map((req) => (
                                    <li key={req.item} className="flex items-center gap-3">
                                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${req.optional ? 'bg-gray-700 text-gray-400' : 'bg-cyan-500/20 text-cyan-400'
                                            }`}>
                                            {req.optional ? '○' : '✓'}
                                        </span>
                                        <span className={req.optional ? 'text-gray-400' : 'text-white'}>
                                            {req.item}
                                            {req.optional && <span className="text-gray-500 ml-2">(optional)</span>}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-3xl font-bold mb-6">Changelog</h2>
                            <div className="space-y-4">
                                <div className="glass-card">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-semibold">v0.2.4</span>
                                        <span className="text-cyan-400 text-sm">Latest</span>
                                    </div>
                                    <ul className="text-sm text-gray-400 space-y-1">
                                        <li>• UI parity and layout fixes</li>
                                        <li>• Restored Quick Access modal</li>
                                        <li>• Settings modal improvements</li>
                                    </ul>
                                </div>
                                <div className="glass-card opacity-60">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-semibold">v0.2.3</span>
                                        <span className="text-gray-500 text-sm">Previous</span>
                                    </div>
                                    <ul className="text-sm text-gray-400 space-y-1">
                                        <li>• AI context menu system</li>
                                        <li>• Task breakdown with AI</li>
                                        <li>• Note enhancement</li>
                                    </ul>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="section-padding">
                <div className="container-main">
                    <motion.div
                        className="glass-card text-center py-12"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
                        <p className="text-gray-400 mb-6">Download now and take control of your productivity.</p>
                        <a href="/DLX Studio Setup 1.0.0.exe" download className="btn-primary inline-block px-8 py-3">Download for Windows</a>
                    </motion.div>
                </div>
            </section>

            {/* Back link */}
            <div className="container-main pb-8">
                <Link href="/" className="text-gray-400 hover:text-cyan-400 transition-colors">
                    ← Back to Dashboard
                </Link>
            </div>
        </div>
    );
}
