'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

const visions = [
    {
        category: 'Reliability & Safety',
        icon: '🛡️',
        color: 'green',
        items: [
            {
                title: 'Predictable AI Output',
                desc: 'Multi-model consensus - route to best LLM for each task, cross-validate outputs',
                status: 'building'
            },
            {
                title: 'Built-in Testing',
                desc: 'Guardian agent auto-generates unit tests and health checks for every piece of code',
                status: 'planned'
            },
            {
                title: 'AI Governance',
                desc: 'Full audit trails, model provenance tracking, human-in-the-loop approvals',
                status: 'planned'
            },
        ]
    },
    {
        category: 'Advanced Agency',
        icon: '🤖',
        color: 'cyan',
        items: [
            {
                title: 'Context Engineering',
                desc: 'Auto-gather context from GitHub, Jira, docs - agents understand your full project',
                status: 'building'
            },
            {
                title: 'Multi-Agent Workflows',
                desc: 'Lux, Guardian, ByteBot work in parallel - planning, coding, testing, deployment',
                status: 'live'
            },
            {
                title: 'Multimodal Prompts',
                desc: 'Generate code from screenshots, design mockups, and images - not just text',
                status: 'planned'
            },
        ]
    },
    {
        category: 'Developer Experience',
        icon: '⚡',
        color: 'purple',
        items: [
            {
                title: 'Smarter Debugging',
                desc: 'AI explains its reasoning with traceable rationale - no more black-box logic',
                status: 'building'
            },
            {
                title: 'Admin Control Panel',
                desc: 'Auto-generated dashboard for viewing data, running scripts, fixing issues',
                status: 'planned'
            },
            {
                title: 'Seamless Integration',
                desc: 'One-click integration with email, auth, payments - AI handles the hard points',
                status: 'planned'
            },
        ]
    },
    {
        category: 'Life-like AI',
        icon: '✨',
        color: 'pink',
        items: [
            {
                title: 'Personality & Memory',
                desc: 'Lux remembers your preferences, Guardian knows your system patterns',
                status: 'building'
            },
            {
                title: 'Emotional Intelligence',
                desc: 'AI adapts tone and approach based on context - calm debugging, excited ideation',
                status: 'planned'
            },
            {
                title: 'Natural Interaction',
                desc: 'Beyond chat - voice commands, gestures, ambient awareness',
                status: 'planned'
            },
        ]
    },
];

const statusConfig = {
    live: { label: 'LIVE', bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' },
    building: { label: 'BUILDING', bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500/30' },
    planned: { label: '2026', bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30' },
};

const staggerContainer = {
    animate: { transition: { staggerChildren: 0.1 } }
};

const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 }
};

export default function VisionPage() {
    return (
        <div className="min-h-screen pt-8">
            {/* Header */}
            <section className="section-padding pb-12">
                <div className="container-main">
                    <motion.div
                        className="text-center max-w-4xl mx-auto"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 mb-6">
                            <span className="text-purple-400 text-sm font-medium">THE FUTURE OF VIBE CODING</span>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-bold mb-6">
                            <span className="text-gradient">2026</span> Vision
                        </h1>

                        <p className="text-xl text-gray-400 mb-8">
                            The industry is asking for reliable AI, multi-agent workflows, context awareness,
                            and life-like companions. We're building it now.
                        </p>

                        <div className="flex justify-center gap-6 text-sm">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-green-400"></span>
                                <span className="text-gray-400">Live Now</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-cyan-400"></span>
                                <span className="text-gray-400">Building</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-purple-400"></span>
                                <span className="text-gray-400">2026 Target</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Vision Categories */}
            <section className="pb-20">
                <div className="container-main">
                    <motion.div
                        className="space-y-16"
                        variants={staggerContainer}
                        initial="initial"
                        animate="animate"
                    >
                        {visions.map((category, catIndex) => (
                            <motion.div key={category.category} variants={fadeInUp}>
                                {/* Category Header */}
                                <div className="flex items-center gap-3 mb-8">
                                    <span className="text-4xl">{category.icon}</span>
                                    <h2 className="text-3xl font-bold">{category.category}</h2>
                                </div>

                                {/* Items Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {category.items.map((item, itemIndex) => {
                                        const status = statusConfig[item.status as keyof typeof statusConfig];
                                        return (
                                            <motion.div
                                                key={item.title}
                                                className="glass-card relative overflow-hidden group"
                                                variants={fadeInUp}
                                                whileHover={{ y: -5 }}
                                            >
                                                {/* Status Badge */}
                                                <div className="absolute top-4 right-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text} border ${status.border}`}>
                                                        {item.status === 'live' && (
                                                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                                                        )}
                                                        {status.label}
                                                    </span>
                                                </div>

                                                <h3 className="text-xl font-bold mb-3 pr-20">{item.title}</h3>
                                                <p className="text-gray-400">{item.desc}</p>

                                                {/* Hover effect */}
                                                <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Quote Section */}
            <section className="section-padding bg-[#050508]">
                <div className="container-main">
                    <motion.div
                        className="text-center max-w-3xl mx-auto"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                    >
                        <div className="text-6xl mb-6">"</div>
                        <blockquote className="text-2xl md:text-3xl font-light text-gray-300 mb-6 leading-relaxed">
                            The industry learned from the <span className="text-cyan-400">vibe coding hangover</span> of 2025.
                            Now we're building AI that's reliable, accountable, and truly helpful —
                            not just impressive demos.
                        </blockquote>
                        <p className="text-gray-500">— The 2026 Vision</p>
                    </motion.div>
                </div>
            </section>

            {/* How We're Different */}
            <section className="section-padding">
                <div className="container-main">
                    <motion.div
                        className="text-center mb-12"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-4xl font-bold mb-4">
                            Why <span className="text-gradient">DLX Studio</span>?
                        </h2>
                        <p className="text-gray-400 text-lg">
                            We're not just following trends — we're building the foundation
                        </p>
                    </motion.div>

                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                        variants={staggerContainer}
                        initial="initial"
                        whileInView="animate"
                        viewport={{ once: true }}
                    >
                        {[
                            { icon: '🏠', title: 'Local-First', desc: 'Your data never leaves your machine. Full privacy, zero API costs at scale.' },
                            { icon: '🔄', title: 'Hybrid AI', desc: 'Cloud AI for intelligence, local AI for privacy and cost. Best of both worlds.' },
                            { icon: '🤝', title: 'Multi-Agent', desc: 'Specialized agents working together, not a single AI trying to do everything.' },
                            { icon: '🎯', title: 'Production Focus', desc: 'Built for real work, not demos. Tested, reliable, and battle-hardened.' },
                        ].map((item) => (
                            <motion.div
                                key={item.title}
                                className="glass-card text-center"
                                variants={fadeInUp}
                            >
                                <div className="text-4xl mb-4">{item.icon}</div>
                                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                                <p className="text-gray-400 text-sm">{item.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* CTA */}
            <section className="section-padding">
                <div className="container-main">
                    <motion.div
                        className="glass-card text-center py-16 relative overflow-hidden"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                    >
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>

                        <div className="relative z-10">
                            <h2 className="text-4xl font-bold mb-6">
                                Join the <span className="text-gradient">2026 Movement</span>
                            </h2>
                            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
                                Be part of building the future of AI-powered development.
                                Download DLX Studio and start vibing with confidence.
                            </p>
                            <div className="flex gap-4 justify-center flex-wrap">
                                <Link href="/download" className="btn-primary text-lg px-8 py-4">
                                    Download Now
                                </Link>
                                <Link href="/agents" className="btn-outline text-lg px-8 py-4">
                                    Meet the Agents
                                </Link>
                            </div>
                        </div>
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
