'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';

interface Workflow {
    id: string;
    name: string;
    description: string;
    trigger: string;
    steps: number;
    lastRun: string;
    status: 'active' | 'paused' | 'draft';
    runs: number;
}

const workflows: Workflow[] = [
    {
        id: '1',
        name: 'Daily Market Analysis',
        description: 'Analyze crypto markets, generate report, send to Discord',
        trigger: 'Every day at 8:00 AM',
        steps: 4,
        lastRun: '8:00 AM today',
        status: 'active',
        runs: 45
    },
    {
        id: '2',
        name: 'New GitHub Commit',
        description: 'On push, run tests, lint code, notify on Slack',
        trigger: 'GitHub webhook',
        steps: 3,
        lastRun: '2 hours ago',
        status: 'active',
        runs: 234
    },
    {
        id: '3',
        name: 'Trading Bot Alert',
        description: 'When bot executes trade, log to DB, send notification',
        trigger: 'API webhook',
        steps: 3,
        lastRun: '15 min ago',
        status: 'active',
        runs: 567
    },
    {
        id: '4',
        name: 'Weekly Backup',
        description: 'Backup databases, configs, and models to cloud',
        trigger: 'Every Sunday at 2:00 AM',
        steps: 5,
        lastRun: 'Dec 1, 2024',
        status: 'active',
        runs: 12
    },
    {
        id: '5',
        name: 'AI Research Digest',
        description: 'Scrape AI news, summarize with LLM, email digest',
        trigger: 'Every Friday at 5:00 PM',
        steps: 4,
        lastRun: 'Nov 29, 2024',
        status: 'paused',
        runs: 8
    },
    {
        id: '6',
        name: 'Smart Home Morning',
        description: 'Sunrise automation for lights, coffee, and briefing',
        trigger: 'At sunrise',
        steps: 6,
        lastRun: '6:45 AM today',
        status: 'active',
        runs: 89
    },
];

const templates = [
    { name: 'Discord Notification', icon: '💬', desc: 'Send messages to Discord channels' },
    { name: 'Email Digest', icon: '📧', desc: 'Compile and send email summaries' },
    { name: 'AI Processing', icon: '🤖', desc: 'Process data through local LLMs' },
    { name: 'Data Backup', icon: '💾', desc: 'Scheduled backup to cloud storage' },
    { name: 'Webhook Handler', icon: '🔗', desc: 'Respond to incoming webhooks' },
    { name: 'Scheduled Task', icon: '⏰', desc: 'Run tasks on schedule' },
];

const statusColors = {
    active: 'bg-green-500/20 text-green-400',
    paused: 'bg-yellow-500/20 text-yellow-400',
    draft: 'bg-gray-500/20 text-gray-400',
};

export default function WorkflowsPage() {
    const [filter, setFilter] = useState<'all' | 'active' | 'paused' | 'draft'>('all');

    const filteredWorkflows = filter === 'all'
        ? workflows
        : workflows.filter(w => w.status === filter);

    const activeCount = workflows.filter(w => w.status === 'active').length;
    const totalRuns = workflows.reduce((sum, w) => sum + w.runs, 0);

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
                                <span className="text-gradient">Workflows</span>
                            </h1>
                            <p className="text-gray-400">Automate everything with visual workflows</p>
                        </div>
                        <button className="btn-primary">+ Create Workflow</button>
                    </motion.div>
                </div>
            </section>

            {/* Stats */}
            <section className="container-main pb-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <motion.div
                        className="glass-card text-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="text-3xl font-bold text-cyan-400">{workflows.length}</div>
                        <div className="text-sm text-gray-500">Total Workflows</div>
                    </motion.div>
                    <motion.div
                        className="glass-card text-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <div className="text-3xl font-bold text-green-400">{activeCount}</div>
                        <div className="text-sm text-gray-500">Active</div>
                    </motion.div>
                    <motion.div
                        className="glass-card text-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="text-3xl font-bold text-purple-400">{totalRuns}</div>
                        <div className="text-sm text-gray-500">Total Runs</div>
                    </motion.div>
                    <motion.div
                        className="glass-card text-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className="text-3xl font-bold text-yellow-400">0</div>
                        <div className="text-sm text-gray-500">Errors Today</div>
                    </motion.div>
                </div>
            </section>

            {/* Filters */}
            <section className="container-main pb-6">
                <div className="flex gap-2">
                    {(['all', 'active', 'paused', 'draft'] as const).map((f) => (
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

            <div className="container-main pb-16 grid lg:grid-cols-3 gap-6">
                {/* Workflows List */}
                <div className="lg:col-span-2 space-y-4">
                    <motion.div
                        initial="initial"
                        animate="animate"
                        variants={{ animate: { transition: { staggerChildren: 0.03 } } }}
                        className="space-y-4"
                    >
                        {filteredWorkflows.map((workflow) => (
                            <motion.div
                                key={workflow.id}
                                className="glass-card"
                                variants={{ initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 } }}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold">{workflow.name}</h3>
                                            <span className={`px-2 py-0.5 rounded-full text-xs ${statusColors[workflow.status]}`}>
                                                {workflow.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-400">{workflow.description}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-4 gap-4 text-sm my-4">
                                    <div>
                                        <div className="text-gray-500">Trigger</div>
                                        <div>{workflow.trigger}</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-500">Steps</div>
                                        <div>{workflow.steps}</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-500">Last Run</div>
                                        <div>{workflow.lastRun}</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-500">Total Runs</div>
                                        <div>{workflow.runs}</div>
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-3 border-t border-gray-700">
                                    <button className="flex-1 py-2 bg-white/10 rounded-lg text-sm hover:bg-white/20">
                                        ✏️ Edit
                                    </button>
                                    <button className="flex-1 py-2 bg-white/10 rounded-lg text-sm hover:bg-white/20">
                                        ▶️ Run Now
                                    </button>
                                    <button className="flex-1 py-2 bg-white/10 rounded-lg text-sm hover:bg-white/20">
                                        📊 Logs
                                    </button>
                                    {workflow.status === 'active' ? (
                                        <button className="flex-1 py-2 bg-yellow-500/20 text-yellow-400 rounded-lg text-sm">
                                            ⏸️ Pause
                                        </button>
                                    ) : (
                                        <button className="flex-1 py-2 bg-green-500/20 text-green-400 rounded-lg text-sm">
                                            ▶️ Activate
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Templates */}
                    <motion.div
                        className="glass-card"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h3 className="font-bold mb-4">📋 Templates</h3>
                        <div className="space-y-2">
                            {templates.map((template) => (
                                <button
                                    key={template.name}
                                    className="w-full p-3 bg-white/5 rounded-lg text-left hover:bg-white/10"
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <span>{template.icon}</span>
                                        <span className="font-medium text-sm">{template.name}</span>
                                    </div>
                                    <p className="text-xs text-gray-500">{template.desc}</p>
                                </button>
                            ))}
                        </div>
                    </motion.div>

                    {/* Recent Activity */}
                    <motion.div
                        className="glass-card"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <h3 className="font-bold mb-4">🕐 Recent Activity</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                <span className="text-gray-400">Trading Bot Alert ran</span>
                                <span className="text-xs text-gray-500 ml-auto">15m ago</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                <span className="text-gray-400">Smart Home Morning ran</span>
                                <span className="text-xs text-gray-500 ml-auto">2h ago</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                <span className="text-gray-400">GitHub Commit ran</span>
                                <span className="text-xs text-gray-500 ml-auto">3h ago</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                <span className="text-gray-400">Daily Market Analysis ran</span>
                                <span className="text-xs text-gray-500 ml-auto">10h ago</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Back link */}
            <div className="container-main pb-8">
                <Link href="/" className="text-gray-400 hover:text-cyan-400 transition-colors">
                    ← Back to Dashboard
                </Link>
            </div>
        </div>
    );
}
