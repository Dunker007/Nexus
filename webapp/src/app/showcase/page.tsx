'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';

const projects = [
    {
        id: 'dlx-studio',
        title: 'DLX Studio',
        creator: 'DLX Studio',
        description: 'AI-powered desktop productivity hub with tasks, notes, calendar, and local LLM chat.',
        image: '🖥️',
        tags: ['Electron', 'Local AI', 'Productivity'],
        stars: 245,
        featured: true,
        link: '/download'
    },
    {
        id: 'poe-canvas',
        title: 'POE Canvas',
        creator: 'DLX Studio',
        description: 'Interactive mind mapping and brainstorming tool with WebGL visualization.',
        image: '🎨',
        tags: ['WebGL', 'Mind Map', 'Creativity'],
        stars: 189,
        featured: true,
        link: 'https://github.com/Dunker007/Fresh-Start'
    },
    {
        id: 'hybrid-orchestrator',
        title: 'Hybrid AI Orchestrator',
        creator: 'DLX Studio',
        description: 'Multi-model orchestration system that routes tasks to optimal LLMs.',
        image: '🔀',
        tags: ['PowerShell', 'Orchestration', 'Multi-Model'],
        stars: 156,
        featured: false,
        link: 'https://github.com/Dunker007/Fresh-Start'
    },
    {
        id: 'content-pipeline',
        title: 'Content Generation Pipeline',
        creator: 'DLX Studio',
        description: 'Automated content creation and publishing with SEO optimization.',
        image: '📝',
        tags: ['Automation', 'Content', 'SEO'],
        stars: 134,
        featured: false,
        link: '#'
    },
    {
        id: 'agent-forge',
        title: 'Agent Forge Template',
        creator: 'Community',
        description: 'Starter template for building autonomous AI agents with tool use.',
        image: '🤖',
        tags: ['Agents', 'Template', 'Tools'],
        stars: 312,
        featured: true,
        link: '#'
    },
    {
        id: 'local-rag',
        title: 'Local RAG System',
        creator: 'Community',
        description: 'Privacy-first retrieval-augmented generation with local embeddings.',
        image: '🔍',
        tags: ['RAG', 'Privacy', 'Embeddings'],
        stars: 278,
        featured: false,
        link: '#'
    },
    {
        id: 'code-reviewer',
        title: 'AI Code Reviewer',
        creator: 'Community',
        description: 'Automated PR reviews using local LLMs with GitHub integration.',
        image: '👁️',
        tags: ['GitHub', 'Code Review', 'Automation'],
        stars: 198,
        featured: false,
        link: '#'
    },
    {
        id: 'voice-assistant',
        title: 'Voice-First Assistant',
        creator: 'Community',
        description: 'Hands-free AI assistant with Whisper STT and local TTS.',
        image: '🎙️',
        tags: ['Voice', 'Whisper', 'Accessibility'],
        stars: 167,
        featured: false,
        link: '#'
    },
];

const templates = [
    { name: 'Next.js + LM Studio', desc: 'Full-stack AI app template', icon: '⚡' },
    { name: 'Electron + Ollama', desc: 'Desktop app with local AI', icon: '💻' },
    { name: 'Python Agent', desc: 'LangChain agent starter', icon: '🐍' },
    { name: 'RAG Pipeline', desc: 'Document Q&A system', icon: '📚' },
];

export default function ShowcasePage() {
    const [filter, setFilter] = useState<'all' | 'featured' | 'community'>('all');

    const filteredProjects = projects.filter(p => {
        if (filter === 'all') return true;
        if (filter === 'featured') return p.featured;
        if (filter === 'community') return p.creator === 'Community';
        return true;
    });

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
                            <span className="text-gradient">Showcase</span>
                        </h1>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
                            Projects built with DLX Studio and local AI. Get inspired, remix, create.
                        </p>

                        <div className="flex justify-center gap-4">
                            {(['all', 'featured', 'community'] as const).map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-6 py-2 rounded-lg transition-all ${filter === f
                                        ? 'bg-cyan-500 text-black font-medium'
                                        : 'bg-white/10 hover:bg-white/20'
                                        }`}
                                >
                                    {f.charAt(0).toUpperCase() + f.slice(1)}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Featured Banner */}
            <section className="container-main pb-12">
                <motion.div
                    className="glass-card relative overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl"></div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                        <div className="text-8xl">🚀</div>
                        <div className="flex-1">
                            <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-sm">Featured Project</span>
                            <h2 className="text-3xl font-bold mt-2 mb-2">Nexus Workspace</h2>
                            <p className="text-gray-400 mb-4">
                                The flagship desktop app. Tasks, notes, calendar, file manager, and AI chat —
                                all powered by your local LLMs. 100% private, zero API costs.
                            </p>
                            <div className="flex gap-4">
                                <Link href="/download" className="btn-primary">Download Now</Link>
                                <a href="https://github.com/Dunker007/Fresh-Start" target="_blank" className="btn-outline">
                                    View Source
                                </a>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* Projects Grid */}
            <section className="container-main pb-16">
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    initial="initial"
                    animate="animate"
                    variants={{ animate: { transition: { staggerChildren: 0.05 } } }}
                >
                    {filteredProjects.map((project) => (
                        <motion.a
                            key={project.id}
                            href={project.link}
                            target={project.link.startsWith('http') ? '_blank' : undefined}
                            className="glass-card group"
                            variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }}
                            whileHover={{ y: -5 }}
                        >
                            {project.featured && (
                                <span className="absolute top-4 right-4 px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs">
                                    ⭐ Featured
                                </span>
                            )}

                            <div className="text-5xl mb-4">{project.image}</div>
                            <h3 className="text-xl font-bold group-hover:text-cyan-400 transition-colors">
                                {project.title}
                            </h3>
                            <p className="text-sm text-gray-500 mb-2">by {project.creator}</p>
                            <p className="text-gray-400 text-sm mb-4">{project.description}</p>

                            <div className="flex items-center justify-between">
                                <div className="flex flex-wrap gap-2">
                                    {project.tags.slice(0, 2).map((tag) => (
                                        <span key={tag} className="px-2 py-1 bg-white/5 rounded text-xs text-gray-400">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                                <span className="text-sm text-gray-500">⭐ {project.stars}</span>
                            </div>
                        </motion.a>
                    ))}
                </motion.div>
            </section>

            {/* Templates */}
            <section className="section-padding bg-[#050508]">
                <div className="container-main">
                    <h2 className="text-3xl font-bold mb-8 text-center">🧰 Starter Templates</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {templates.map((template) => (
                            <motion.div
                                key={template.name}
                                className="glass-card text-center cursor-pointer group"
                                whileHover={{ scale: 1.05 }}
                            >
                                <div className="text-4xl mb-3">{template.icon}</div>
                                <h3 className="font-bold group-hover:text-cyan-400 transition-colors">{template.name}</h3>
                                <p className="text-sm text-gray-500">{template.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Submit CTA */}
            <section className="section-padding">
                <div className="container-main">
                    <motion.div
                        className="glass-card text-center py-12"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl font-bold mb-4">Built something cool?</h2>
                        <p className="text-gray-400 mb-6">
                            Share your project with the community and get featured!
                        </p>
                        <a
                            href="https://github.com/Dunker007/Fresh-Start/issues"
                            target="_blank"
                            className="btn-primary"
                        >
                            Submit Your Project
                        </a>
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
