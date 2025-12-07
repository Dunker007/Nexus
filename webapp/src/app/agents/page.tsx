'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Play, Pause, Settings, Zap, MessageCircle, ChevronRight, LayoutGrid, List, Grid3X3 } from 'lucide-react';
import PageBackground from '@/components/PageBackground';
import { LUXRIG_BRIDGE_URL } from '@/lib/utils';

interface Agent {
    id: string;
    emoji: string;
    name: string;
    role: string;
    desc: string;
    gradient: string;
    status: 'active' | 'idle' | 'queued' | 'thinking';
    capabilities: string[];
    stats: {
        tasksCompleted: number;
        uptime: string;
        lastActive: string;
    };
}

const agents: Agent[] = [
    {
        id: 'lux',
        emoji: '🎨',
        name: 'Lux',
        role: 'Creative Director',
        desc: 'The original DLX agent. Generates ideas, explores possibilities, and helps you think outside the box.',
        gradient: 'from-cyan-500 to-blue-600',
        status: 'active',
        capabilities: ['Content ideation', 'Brainstorming', 'Creative writing', 'Mind mapping'],
        stats: { tasksCompleted: 247, uptime: '12h 45m', lastActive: 'Now' }
    },
    {
        id: 'guardian',
        emoji: '🛡️',
        name: 'Guardian',
        role: 'Security & Monitoring',
        desc: 'Watches over your systems, alerts issues, and keeps everything running smoothly.',
        gradient: 'from-green-500 to-emerald-600',
        status: 'active',
        capabilities: ['System monitoring', 'Alert management', 'Health checks', 'Security scanning'],
        stats: { tasksCompleted: 1842, uptime: '48h 12m', lastActive: 'Now' }
    },
    {
        id: 'architect',
        emoji: '🏗️',
        name: 'Architect',
        role: 'System Design',
        desc: 'Designs system architecture, database schemas, and API structures for your projects.',
        gradient: 'from-purple-500 to-violet-600',
        status: 'idle',
        capabilities: ['System design', 'Database modeling', 'API design', 'Code review'],
        stats: { tasksCompleted: 89, uptime: '0m', lastActive: '2h ago' }
    },
    {
        id: 'bytebot',
        emoji: '⚡',
        name: 'ByteBot',
        role: 'Task Automation',
        desc: 'Executes repetitive tasks, manages workflows, and boosts your productivity.',
        gradient: 'from-yellow-500 to-orange-500',
        status: 'queued',
        capabilities: ['Workflow automation', 'Batch processing', 'Scheduled tasks', 'API integrations'],
        stats: { tasksCompleted: 523, uptime: '0m', lastActive: '10m ago' }
    },
    {
        id: 'synthia',
        emoji: '🎵',
        name: 'Synthia',
        role: 'Audio & Music',
        desc: 'Handles audio transcription, Suno prompt crafting, and music generation.',
        gradient: 'from-pink-500 to-rose-600',
        status: 'idle',
        capabilities: ['Suno prompts', 'Audio transcription', 'Music analysis', 'Sound design'],
        stats: { tasksCompleted: 156, uptime: '0m', lastActive: '1d ago' }
    },
    {
        id: 'oracle',
        emoji: '🔮',
        name: 'Oracle',
        role: 'Data Intelligence',
        desc: 'Analyzes data patterns, generates insights, and forecasts trends.',
        gradient: 'from-indigo-500 to-purple-600',
        status: 'idle',
        capabilities: ['Data analysis', 'Pattern recognition', 'Trend forecasting', 'Report generation'],
        stats: { tasksCompleted: 78, uptime: '0m', lastActive: '6h ago' }
    },
];

// Animated avatar ring based on status
function AgentAvatar({ agent, size = 'lg' }: { agent: Agent; size?: 'sm' | 'md' | 'lg' }) {
    const sizeClasses = {
        sm: 'w-16 h-16 text-3xl',
        md: 'w-20 h-20 text-4xl',
        lg: 'w-24 h-24 text-5xl'
    }[size];

    return (
        <div className="relative">
            {/* Pulse ring for active agents */}
            {agent.status === 'active' && (
                <motion.div
                    className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${agent.gradient}`}
                    animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                />
            )}

            {/* Thinking animation */}
            {agent.status === 'thinking' && (
                <motion.div
                    className={`absolute inset-0 rounded-2xl border-2 border-cyan-400`}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    style={{ borderStyle: 'dashed' }}
                />
            )}

            {/* Main avatar */}
            <motion.div
                className={`${sizeClasses} rounded-2xl bg-gradient-to-br ${agent.gradient} flex items-center justify-center shadow-lg relative z-10`}
                whileHover={{ scale: 1.1, rotate: 5 }}
                animate={agent.status === 'thinking' ? { scale: [1, 1.05, 1] } : {}}
                transition={{ duration: 0.5, repeat: agent.status === 'thinking' ? Infinity : 0 }}
            >
                {agent.emoji}
            </motion.div>

            {/* Status dot */}
            <span className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-[#0a0a0f] z-20 ${agent.status === 'active' ? 'bg-green-400 shadow-lg shadow-green-500/50' :
                agent.status === 'thinking' ? 'bg-cyan-400 animate-pulse shadow-lg shadow-cyan-500/50' :
                    agent.status === 'queued' ? 'bg-yellow-400' :
                        'bg-gray-500'
                }`} />
        </div>
    );
}

export default function AgentsPage() {
    const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
    const [deployingAgent, setDeployingAgent] = useState<string | null>(null);
    const [agentsList, setAgentsList] = useState(agents);
    const [showDeployModal, setShowDeployModal] = useState(false);
    const [deployTask, setDeployTask] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'compact' | 'list'>('grid');

    const activeCount = agentsList.filter(a => a.status === 'active').length;
    const thinkingCount = agentsList.filter(a => a.status === 'thinking').length;

    async function deployAgent(agentId: string, task: string) {
        // Update agent to thinking state
        setAgentsList(prev => prev.map(a =>
            a.id === agentId ? { ...a, status: 'thinking' as const } : a
        ));
        setDeployingAgent(agentId);
        setShowDeployModal(false);

        // Simulate deployment (in real app, would call LuxRig)
        setTimeout(() => {
            setAgentsList(prev => prev.map(a =>
                a.id === agentId ? {
                    ...a,
                    status: 'active' as const,
                    stats: { ...a.stats, tasksCompleted: a.stats.tasksCompleted + 1, lastActive: 'Now' }
                } : a
            ));
            setDeployingAgent(null);
        }, 3000);
    }

    return (
        <div className="min-h-screen pb-20 relative overflow-hidden">
            <PageBackground color="green" />

            {/* Compact Header */}
            <section className="py-6 border-b border-white/5">
                <div className="w-full max-w-[1800px] mx-auto px-4 md:px-6">
                    <motion.div
                        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        {/* Left: Title */}
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-500/10 rounded-lg border border-green-500/20">
                                <span className="text-xl">🤖</span>
                            </div>
                            <div>
                                <h1 className="text-xl font-bold flex items-center gap-2">
                                    Agent <span className="text-green-400">HQ</span>
                                </h1>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                                    {activeCount} online
                                    {thinkingCount > 0 && <span className="text-cyan-400">• {thinkingCount} processing</span>}
                                </div>
                            </div>
                        </div>

                        {/* Center: View Toggle */}
                        <div className="flex items-center gap-2">
                            <div className="flex items-center bg-white/5 rounded-lg p-0.5 border border-white/10">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`px-3 py-1.5 rounded text-xs font-medium transition-all flex items-center gap-1.5 ${viewMode === 'grid' ? 'bg-green-500/20 text-green-400' : 'text-gray-500 hover:text-white'}`}
                                >
                                    <LayoutGrid size={12} /> Grid
                                </button>
                                <button
                                    onClick={() => setViewMode('compact')}
                                    className={`px-3 py-1.5 rounded text-xs font-medium transition-all flex items-center gap-1.5 ${viewMode === 'compact' ? 'bg-green-500/20 text-green-400' : 'text-gray-500 hover:text-white'}`}
                                >
                                    <Grid3X3 size={12} /> Compact
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`px-3 py-1.5 rounded text-xs font-medium transition-all flex items-center gap-1.5 ${viewMode === 'list' ? 'bg-green-500/20 text-green-400' : 'text-gray-500 hover:text-white'}`}
                                >
                                    <List size={12} /> List
                                </button>
                            </div>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowDeployModal(true)}
                                className="px-3 py-1.5 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                            >
                                <Play size={12} /> Deploy
                            </button>
                            <Link
                                href="/meeting"
                                className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs font-medium flex items-center gap-1.5 text-gray-400 hover:text-white"
                            >
                                <MessageCircle size={12} /> Meeting
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Main Layout Grid */}
            <div className="w-full max-w-[1800px] mx-auto px-4 md:px-6 mt-8">
                <div className="grid grid-cols-1 xl:grid-cols-[280px_1fr_280px] gap-6 items-start">

                    {/* Left Sidebar: Chat Options */}
                    <div className="hidden xl:flex flex-col gap-4 sticky top-24">
                        {/* Group Chat */}
                        <Link href="/meeting">
                            <motion.div
                                className="glass-card relative overflow-hidden p-4 cursor-pointer group border border-indigo-500/30 hover:border-indigo-500/50"
                                initial={{ opacity: 0, x: -50 }}
                                animate={{ opacity: 1, x: 0 }}
                                whileHover={{ scale: 1.02 }}
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                                        👥
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold group-hover:text-indigo-400 transition-colors">Group Chat</h3>
                                        <p className="text-[9px] text-gray-500 uppercase tracking-wider">Multi-agent debate</p>
                                    </div>
                                </div>
                                {/* Mini Chat Preview */}
                                <div className="bg-black/30 rounded-lg p-2 space-y-1.5">
                                    <div className="flex gap-2">
                                        <span className="text-xs">🏗️</span>
                                        <p className="text-[10px] text-gray-400 bg-white/5 rounded px-2 py-1">Let's consider microservices...</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="text-xs">🛡️</span>
                                        <p className="text-[10px] text-gray-400 bg-white/5 rounded px-2 py-1">Security implications?</p>
                                    </div>
                                    <div className="flex items-center gap-1 text-[9px] text-indigo-400">
                                        <span className="w-1 h-1 bg-indigo-400 rounded-full animate-pulse" />
                                        3 agents ready to discuss
                                    </div>
                                </div>
                            </motion.div>
                        </Link>

                        {/* Single Agent Chat */}
                        <Link href="/chat">
                            <motion.div
                                className="glass-card relative overflow-hidden p-4 cursor-pointer group border border-cyan-500/30 hover:border-cyan-500/50"
                                initial={{ opacity: 0, x: -50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 }}
                                whileHover={{ scale: 1.02 }}
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                                        💬
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold group-hover:text-cyan-400 transition-colors">1:1 Chat</h3>
                                        <p className="text-[9px] text-gray-500 uppercase tracking-wider">Direct conversation</p>
                                    </div>
                                </div>
                                {/* Mini Chat Preview */}
                                <div className="bg-black/30 rounded-lg p-2 space-y-1.5">
                                    <div className="flex gap-2 justify-end">
                                        <p className="text-[10px] text-white bg-cyan-500/30 rounded px-2 py-1">Help me design an API</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="text-xs">🎨</span>
                                        <p className="text-[10px] text-gray-400 bg-white/5 rounded px-2 py-1">I'd suggest RESTful with...</p>
                                    </div>
                                    <div className="flex items-center gap-1 text-[9px] text-cyan-400">
                                        <span className="w-1 h-1 bg-cyan-400 rounded-full animate-pulse" />
                                        Lux ready to help
                                    </div>
                                </div>
                            </motion.div>
                        </Link>
                    </div>

                    {/* Center Column: Deploy & Agents */}
                    <div className="space-y-6 min-w-0">
                        {/* Quick Deploy Bar */}
                        <motion.div
                            className="glass-card flex items-center gap-4 p-4"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <div className="flex -space-x-3 shrink-0">
                                {agentsList.filter(a => a.status === 'active').slice(0, 4).map(agent => (
                                    <div key={agent.id} className={`w-10 h-10 rounded-full bg-gradient-to-br ${agent.gradient} flex items-center justify-center text-lg border-2 border-[#0a0a0f]`}>
                                        {agent.emoji}
                                    </div>
                                ))}
                            </div>
                            <div className="flex-1">
                                <input
                                    type="text"
                                    placeholder="Describe a task to deploy agents..."
                                    value={deployTask}
                                    onChange={(e) => setDeployTask(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:border-cyan-500/50 focus:outline-none"
                                />
                            </div>
                            <button
                                onClick={() => setShowDeployModal(true)}
                                disabled={!deployTask.trim()}
                                className="btn-primary flex items-center gap-2 disabled:opacity-50 text-sm px-4 py-2"
                            >
                                <Zap size={16} />
                                Deploy
                            </button>
                        </motion.div>

                        {/* Agents - View Mode Aware */}
                        {viewMode === 'grid' && (
                            <motion.div
                                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
                                initial="hidden"
                                animate="visible"
                                variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
                            >
                                {agentsList.map((agent) => (
                                    <motion.div
                                        key={agent.id}
                                        className="glass-card relative overflow-hidden group cursor-pointer p-4"
                                        variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                                        whileHover={{ y: -2 }}
                                        onClick={() => setSelectedAgent(agent)}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${agent.gradient} flex items-center justify-center text-xl flex-shrink-0 relative`}>
                                                {agent.emoji}
                                                <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#0a0a0f] ${agent.status === 'active' ? 'bg-green-400' : agent.status === 'thinking' ? 'bg-cyan-400 animate-pulse' : 'bg-gray-500'}`} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-sm">{agent.name}</h3>
                                                <p className="text-[10px] text-cyan-400 uppercase tracking-wider">{agent.role}</p>
                                                <p className="text-xs text-gray-500 mt-1 line-clamp-1">{agent.desc}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/5">
                                            <span className="text-[10px] text-gray-500">{agent.stats.tasksCompleted} tasks</span>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setSelectedAgent(agent); setShowDeployModal(true); }}
                                                className="px-2 py-1 bg-green-500/20 hover:bg-green-500/30 rounded text-green-400 text-[10px] font-bold flex items-center gap-1"
                                            >
                                                <Play size={10} /> Deploy
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}

                        {viewMode === 'compact' && (
                            <motion.div
                                className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-2"
                                initial="hidden"
                                animate="visible"
                                variants={{ visible: { transition: { staggerChildren: 0.02 } } }}
                            >
                                {agentsList.map((agent) => (
                                    <motion.div
                                        key={agent.id}
                                        className="glass-card relative overflow-hidden group cursor-pointer p-2 text-center"
                                        variants={{ hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1 } }}
                                        whileHover={{ scale: 1.03 }}
                                        onClick={() => setSelectedAgent(agent)}
                                    >
                                        <div className="flex justify-center mb-1.5">
                                            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${agent.gradient} flex items-center justify-center text-sm relative`}>
                                                {agent.emoji}
                                                <span className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-[#0a0a0f] ${agent.status === 'active' ? 'bg-green-400' : agent.status === 'thinking' ? 'bg-cyan-400 animate-pulse' : 'bg-gray-500'}`} />
                                            </div>
                                        </div>
                                        <h3 className="font-semibold text-[10px] truncate">{agent.name}</h3>
                                        <p className="text-[8px] text-gray-500 truncate">{agent.role}</p>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}

                        {viewMode === 'list' && (
                            <motion.div
                                className="space-y-1"
                                initial="hidden"
                                animate="visible"
                                variants={{ visible: { transition: { staggerChildren: 0.02 } } }}
                            >
                                {agentsList.map((agent) => (
                                    <motion.div
                                        key={agent.id}
                                        className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/[0.02] hover:bg-white/5 border border-transparent hover:border-white/10 cursor-pointer transition-all group"
                                        variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }}
                                        onClick={() => setSelectedAgent(agent)}
                                    >
                                        <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${agent.gradient} flex items-center justify-center text-xs flex-shrink-0`}>
                                            {agent.emoji}
                                        </div>
                                        <div className="w-20 flex-shrink-0">
                                            <h3 className="font-semibold text-xs truncate">{agent.name}</h3>
                                        </div>
                                        <div className="w-28 hidden md:block flex-shrink-0">
                                            <p className="text-[10px] text-gray-500 truncate">{agent.role}</p>
                                        </div>
                                        <div className="flex items-center gap-1.5 flex-shrink-0">
                                            <span className={`w-1.5 h-1.5 rounded-full ${agent.status === 'active' ? 'bg-green-400' : agent.status === 'thinking' ? 'bg-cyan-400 animate-pulse' : 'bg-gray-500'}`} />
                                            <span className="text-[10px] text-gray-500 capitalize w-14">{agent.status}</span>
                                        </div>
                                        <div className="flex-1" />
                                        <span className="text-[10px] text-gray-500 hidden lg:block">{agent.stats.tasksCompleted} tasks</span>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setSelectedAgent(agent); setShowDeployModal(true); }}
                                            className="px-2 py-1 bg-green-500/20 hover:bg-green-500/30 rounded text-green-400 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
                                        >
                                            <Play size={10} /> Deploy
                                        </button>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}

                        {/* Mobile Special Ops (Only on < XL) */}
                        <div className="xl:hidden grid grid-cols-1 md:grid-cols-2 gap-6 pt-8">
                            <Link href="/meeting">
                                <motion.div className="glass-card relative overflow-hidden p-6 hover:border-indigo-500/50 group h-full">
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="w-12 h-12 rounded-lg bg-indigo-500/20 flex items-center justify-center text-2xl">👥</div>
                                        <div>
                                            <h3 className="text-lg font-bold">Group Chat</h3>
                                            <p className="text-xs text-gray-500 uppercase">Choose your agents</p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-400">Convene a meeting with Architect, Security, and QA agents.</p>
                                </motion.div>
                            </Link>
                            <Link href="/voice">
                                <motion.div className="glass-card relative overflow-hidden p-6 hover:border-red-500/50 group h-full">
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="w-12 h-12 rounded-lg bg-red-500/20 flex items-center justify-center text-2xl">🎙️</div>
                                        <div>
                                            <h3 className="text-lg font-bold">Voice Control</h3>
                                            <p className="text-xs text-gray-500 uppercase">God Mode</p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-400">Execute system commands using voice control.</p>
                                </motion.div>
                            </Link>
                        </div>
                    </div>

                    {/* Right Sidebar: Voice + Templates */}
                    <div className="hidden xl:flex flex-col gap-4 sticky top-24">
                        {/* Voice Control */}
                        <Link href="/voice">
                            <motion.div
                                className="glass-card relative overflow-hidden p-4 cursor-pointer group border border-red-500/30 hover:border-red-500/50"
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                whileHover={{ scale: 1.02 }}
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                                        🎙️
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold group-hover:text-red-400 transition-colors">Voice Control</h3>
                                        <p className="text-[9px] text-gray-500 uppercase tracking-wider">God Mode</p>
                                    </div>
                                </div>
                                {/* Voice Visualization */}
                                <div className="bg-black/30 rounded-lg p-2">
                                    <div className="flex items-center justify-center gap-0.5 h-8">
                                        {[...Array(12)].map((_, i) => (
                                            <div
                                                key={i}
                                                className="w-1 bg-red-500/50 rounded-full animate-pulse"
                                                style={{
                                                    height: `${Math.random() * 20 + 8}px`,
                                                    animationDelay: `${i * 0.1}s`
                                                }}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-[9px] text-center text-red-400 mt-1">"Deploy guardian to monitor..."</p>
                                </div>
                            </motion.div>
                        </Link>

                        {/* Agent Templates - Surprise Feature */}
                        <motion.div
                            className="glass-card relative overflow-hidden p-4 cursor-pointer group border border-amber-500/30 hover:border-amber-500/50"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            whileHover={{ scale: 1.02 }}
                            onClick={() => setShowDeployModal(true)}
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                                    ⚡
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold group-hover:text-amber-400 transition-colors">Quick Deploy</h3>
                                    <p className="text-[9px] text-gray-500 uppercase tracking-wider">1-Click Tasks</p>
                                </div>
                            </div>
                            {/* Quick Actions */}
                            <div className="space-y-1.5">
                                <button className="w-full text-left px-2 py-1.5 rounded bg-white/5 hover:bg-amber-500/20 text-[10px] text-gray-300 hover:text-amber-300 transition-all flex items-center gap-2">
                                    <span>📝</span> Review my code for bugs
                                </button>
                                <button className="w-full text-left px-2 py-1.5 rounded bg-white/5 hover:bg-amber-500/20 text-[10px] text-gray-300 hover:text-amber-300 transition-all flex items-center gap-2">
                                    <span>🔒</span> Security audit my project
                                </button>
                                <button className="w-full text-left px-2 py-1.5 rounded bg-white/5 hover:bg-amber-500/20 text-[10px] text-gray-300 hover:text-amber-300 transition-all flex items-center gap-2">
                                    <span>📊</span> Analyze my data files
                                </button>
                                <button className="w-full text-left px-2 py-1.5 rounded bg-white/5 hover:bg-amber-500/20 text-[10px] text-gray-300 hover:text-amber-300 transition-all flex items-center gap-2">
                                    <span>✨</span> Generate creative ideas
                                </button>
                            </div>
                        </motion.div>
                    </div>

                </div>
            </div>

            {/* Agent Detail Modal */}
            <AnimatePresence>
                {selectedAgent && !showDeployModal && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedAgent(null)}
                    >
                        <motion.div
                            className="glass-card max-w-lg w-full"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-start gap-4 mb-6">
                                <AgentAvatar agent={selectedAgent} size="sm" />
                                <div className="flex-1">
                                    <h3 className="text-2xl font-bold">{selectedAgent.name}</h3>
                                    <p className="text-cyan-400">{selectedAgent.role}</p>
                                </div>
                                <button
                                    className="text-gray-400 hover:text-white p-1"
                                    onClick={() => setSelectedAgent(null)}
                                >
                                    ✕
                                </button>
                            </div>

                            <p className="text-gray-300 mb-6">{selectedAgent.desc}</p>

                            <h4 className="font-semibold mb-3">Capabilities</h4>
                            <div className="flex flex-wrap gap-2 mb-6">
                                {selectedAgent.capabilities.map((cap) => (
                                    <span key={cap} className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-sm text-cyan-400">
                                        {cap}
                                    </span>
                                ))}
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setShowDeployModal(true)}
                                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                                >
                                    <Play size={18} />
                                    Deploy Agent
                                </button>
                                <Link href="/chat" className="btn-outline flex-1 flex items-center justify-center gap-2">
                                    <MessageCircle size={18} />
                                    Chat
                                </Link>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Deploy Modal */}
            <AnimatePresence>
                {showDeployModal && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowDeployModal(false)}
                    >
                        <motion.div
                            className="glass-card max-w-md w-full"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <Zap className="text-cyan-400" size={24} />
                                Deploy Agent
                            </h3>

                            {selectedAgent ? (
                                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg mb-4">
                                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${selectedAgent.gradient} flex items-center justify-center text-xl`}>
                                        {selectedAgent.emoji}
                                    </div>
                                    <div>
                                        <div className="font-medium">{selectedAgent.name}</div>
                                        <div className="text-sm text-gray-400">{selectedAgent.role}</div>
                                    </div>
                                </div>
                            ) : (
                                <div className="mb-4">
                                    <label className="block text-sm text-gray-400 mb-2">Select Agent</label>
                                    <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                                        {agentsList.map(agent => (
                                            <button
                                                key={agent.id}
                                                onClick={() => setSelectedAgent(agent)}
                                                className={`flex items-center gap-2 p-2 rounded-lg text-left transition-colors bg-white/5 hover:bg-white/10`}
                                            >
                                                <div className="text-xl">{agent.emoji}</div>
                                                <div className="min-w-0">
                                                    <div className="font-medium text-xs truncate">{agent.name}</div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <label className="block text-sm text-gray-400 mb-2">Task Description</label>
                            <textarea
                                value={deployTask}
                                onChange={(e) => setDeployTask(e.target.value)}
                                placeholder="Describe what you want the agent to do..."
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 h-24 resize-none focus:border-cyan-500/50 focus:outline-none mb-4"
                            />

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowDeployModal(false)}
                                    className="btn-outline flex-1"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => selectedAgent && deployAgent(selectedAgent.id, deployTask)}
                                    disabled={!deployTask.trim() || !selectedAgent}
                                    className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    <Zap size={18} />
                                    Deploy
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Back link */}
            <div className="container-main pt-8">
                <Link href="/" className="text-gray-400 hover:text-cyan-400 transition-colors inline-flex items-center gap-1">
                    ← Back to Home
                </Link>
            </div>
        </div>
    );
}
