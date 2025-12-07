'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';

const projects = [
    {
        id: '1',
        name: 'DLX Studio',
        description: 'AI-powered personal operating system',
        status: 'active',
        lastUpdated: '5 min ago',
        stats: { files: 46, commits: 158, branches: 3 },
        color: 'from-cyan-500 to-purple-500',
        icon: '🚀'
    },
    {
        id: '2',
        name: 'Trading Bots',
        description: 'Automated crypto trading strategies',
        status: 'active',
        lastUpdated: '2 hours ago',
        stats: { files: 23, commits: 89, branches: 2 },
        color: 'from-green-500 to-cyan-500',
        icon: '📈'
    },
    {
        id: '3',
        name: 'LuxRig Bridge',
        description: 'Local LLM integration service',
        status: 'active',
        lastUpdated: '1 day ago',
        stats: { files: 8, commits: 34, branches: 1 },
        color: 'from-purple-500 to-pink-500',
        icon: '🔌'
    },
    {
        id: '4',
        name: 'Smart Home Hub',
        description: 'Home automation control center',
        status: 'paused',
        lastUpdated: '1 week ago',
        stats: { files: 15, commits: 42, branches: 2 },
        color: 'from-yellow-500 to-orange-500',
        icon: '🏠'
    },
    {
        id: '5',
        name: 'POE Canvas Experiments',
        description: 'AI art and canvas experiments',
        status: 'archived',
        lastUpdated: '2 weeks ago',
        stats: { files: 12, commits: 28, branches: 1 },
        color: 'from-gray-500 to-gray-600',
        icon: '🎨'
    },
];

const templates = [
    { name: 'Next.js + Tailwind', icon: '▲' },
    { name: 'Python API', icon: '🐍' },
    { name: 'Node.js Service', icon: '💚' },
    { name: 'Empty Project', icon: '📁' },
];

export default function ProjectsPage() {
    const [filter, setFilter] = useState<'all' | 'active' | 'paused' | 'archived'>('all');
    const [showNewProject, setShowNewProject] = useState(false);

    const filteredProjects = filter === 'all'
        ? projects
        : projects.filter(p => p.status === filter);

    return (
        <div className="min-h-screen pt-8">
            {/* Header */}
            <section className="section-padding pb-8">
                <div className="container-main">
                    <motion.div
                        className="flex items-center justify-between"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold mb-2">
                                <span className="text-gradient">Projects</span>
                            </h1>
                            <p className="text-gray-400">Manage your development projects</p>
                        </div>
                        <button
                            onClick={() => setShowNewProject(true)}
                            className="btn-primary"
                        >
                            + New Project
                        </button>
                    </motion.div>
                </div>
            </section>

            {/* Stats */}
            <section className="container-main pb-6">
                <div className="grid grid-cols-4 gap-4">
                    <motion.div
                        className="glass-card text-center py-3"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="text-2xl font-bold text-cyan-400">{projects.length}</div>
                        <div className="text-xs text-gray-500">Total</div>
                    </motion.div>
                    <motion.div
                        className="glass-card text-center py-3"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <div className="text-2xl font-bold text-green-400">
                            {projects.filter(p => p.status === 'active').length}
                        </div>
                        <div className="text-xs text-gray-500">Active</div>
                    </motion.div>
                    <motion.div
                        className="glass-card text-center py-3"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="text-2xl font-bold text-yellow-400">
                            {projects.filter(p => p.status === 'paused').length}
                        </div>
                        <div className="text-xs text-gray-500">Paused</div>
                    </motion.div>
                    <motion.div
                        className="glass-card text-center py-3"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className="text-2xl font-bold text-gray-400">
                            {projects.filter(p => p.status === 'archived').length}
                        </div>
                        <div className="text-xs text-gray-500">Archived</div>
                    </motion.div>
                </div>
            </section>

            {/* Filters */}
            <section className="container-main pb-6">
                <div className="flex gap-2">
                    {(['all', 'active', 'paused', 'archived'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg text-sm ${filter === f
                                    ? 'bg-cyan-500 text-black font-medium'
                                    : 'bg-white/10 hover:bg-white/20'
                                }`}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>
            </section>

            {/* Project Grid */}
            <section className="container-main pb-16">
                <motion.div
                    className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                    initial="initial"
                    animate="animate"
                    variants={{ animate: { transition: { staggerChildren: 0.05 } } }}
                >
                    {filteredProjects.map((project) => (
                        <motion.div
                            key={project.id}
                            className="glass-card overflow-hidden group cursor-pointer hover:ring-2 hover:ring-cyan-500/50 transition-all"
                            variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }}
                        >
                            {/* Header Gradient */}
                            <div className={`h-2 bg-gradient-to-r ${project.color}`}></div>

                            <div className="pt-4">
                                {/* Project Info */}
                                <div className="flex items-start gap-3 mb-4">
                                    <span className="text-3xl">{project.icon}</span>
                                    <div>
                                        <h3 className="font-bold group-hover:text-cyan-400 transition-colors">
                                            {project.name}
                                        </h3>
                                        <p className="text-sm text-gray-400">{project.description}</p>
                                    </div>
                                </div>

                                {/* Status */}
                                <div className="flex items-center justify-between mb-4">
                                    <span className={`text-xs px-2 py-0.5 rounded ${project.status === 'active' ? 'bg-green-500/20 text-green-400' :
                                            project.status === 'paused' ? 'bg-yellow-500/20 text-yellow-400' :
                                                'bg-gray-500/20 text-gray-400'
                                        }`}>
                                        {project.status}
                                    </span>
                                    <span className="text-xs text-gray-500">{project.lastUpdated}</span>
                                </div>

                                {/* Stats */}
                                <div className="flex gap-4 text-xs text-gray-500 pt-4 border-t border-gray-700">
                                    <span>📄 {project.stats.files} files</span>
                                    <span>📝 {project.stats.commits} commits</span>
                                    <span>🌿 {project.stats.branches} branches</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    {/* Add Project Card */}
                    <motion.div
                        className="glass-card border-2 border-dashed border-gray-700 flex items-center justify-center min-h-[200px] cursor-pointer hover:border-cyan-500 transition-colors"
                        onClick={() => setShowNewProject(true)}
                        variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }}
                    >
                        <div className="text-center text-gray-500">
                            <div className="text-4xl mb-2">+</div>
                            <div>New Project</div>
                        </div>
                    </motion.div>
                </motion.div>
            </section>

            {/* New Project Modal */}
            {showNewProject && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                    <motion.div
                        className="glass-card max-w-md w-full"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <h2 className="text-xl font-bold mb-4">🚀 New Project</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-gray-400 mb-2 block">Project Name</label>
                                <input
                                    type="text"
                                    placeholder="My Awesome Project"
                                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2"
                                />
                            </div>

                            <div>
                                <label className="text-sm text-gray-400 mb-2 block">Description</label>
                                <textarea
                                    placeholder="What's this project about?"
                                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 h-20 resize-none"
                                />
                            </div>

                            <div>
                                <label className="text-sm text-gray-400 mb-2 block">Template</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {templates.map((template) => (
                                        <button
                                            key={template.name}
                                            className="p-3 bg-white/5 rounded-lg text-left hover:bg-white/10"
                                        >
                                            <span className="mr-2">{template.icon}</span>
                                            {template.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowNewProject(false)}
                                className="flex-1 py-2 bg-white/10 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button className="flex-1 py-2 bg-cyan-500 text-black rounded-lg font-medium">
                                Create Project
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Back link */}
            <div className="container-main pb-8">
                <Link href="/" className="text-gray-400 hover:text-cyan-400 transition-colors">
                    ← Back to Dashboard
                </Link>
            </div>
        </div>
    );
}
