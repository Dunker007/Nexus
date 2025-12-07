'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';

const user = {
    name: 'Dunker007',
    email: 'dunker@dlxstudio.ai',
    avatar: '🧑‍💻',
    role: 'Creator',
    joined: 'October 2024',
    plan: 'Pro (Self-Hosted)',
    stats: {
        chats: 5847,
        agents: 423,
        tokens: '15.2M',
        saved: '$1,520'
    }
};

const achievements = [
    { id: 1, name: 'First Chat', icon: '💬', desc: 'Started your AI journey', earned: true, date: 'Oct 15, 2024' },
    { id: 2, name: 'Local Pioneer', icon: '🏠', desc: 'Connected local LLM', earned: true, date: 'Oct 17, 2024' },
    { id: 3, name: 'Agent Master', icon: '🤖', desc: 'Ran 100 agent tasks', earned: true, date: 'Nov 1, 2024' },
    { id: 4, name: 'Token Millionaire', icon: '🎰', desc: 'Used 1M tokens', earned: true, date: 'Nov 15, 2024' },
    { id: 5, name: 'Cost Saver', icon: '💰', desc: 'Saved $500 vs cloud', earned: true, date: 'Nov 20, 2024' },
    { id: 6, name: 'Speed Demon', icon: '⚡', desc: '1000 chats in a week', earned: false },
    { id: 7, name: 'Night Owl', icon: '🦉', desc: 'Chat at 3am', earned: true, date: 'Nov 25, 2024' },
    { id: 8, name: 'Multi-Model', icon: '🔄', desc: 'Use 5 different models', earned: true, date: 'Dec 1, 2024' },
];

const connectedServices = [
    { name: 'LM Studio', status: 'connected', icon: '🖥️' },
    { name: 'Ollama', status: 'connected', icon: '🦙' },
    { name: 'GitHub', status: 'connected', icon: '🐙' },
    { name: 'Google Calendar', status: 'disconnected', icon: '📅' },
    { name: 'Discord', status: 'connected', icon: '💬' },
    { name: 'Govee', status: 'connected', icon: '💡' },
];

const recentActivity = [
    { action: 'Chat with gemma-3n', time: '5 min ago' },
    { action: 'Ran Code Review Agent', time: '2 hours ago' },
    { action: 'Updated trading bot settings', time: '4 hours ago' },
    { action: 'Pushed to GitHub', time: '6 hours ago' },
    { action: 'Created new workflow', time: '1 day ago' },
];

export default function ProfilePage() {
    const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'connections' | 'activity'>('overview');

    return (
        <div className="min-h-screen pt-8">
            {/* Header */}
            <section className="section-padding pb-8">
                <div className="container-main">
                    <motion.div
                        className="flex items-center gap-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        {/* Avatar */}
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-5xl">
                            {user.avatar}
                        </div>

                        {/* Info */}
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold mb-1">
                                <span className="text-gradient">{user.name}</span>
                            </h1>
                            <p className="text-gray-400">{user.email}</p>
                            <div className="flex items-center gap-3 mt-2">
                                <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-sm">
                                    {user.role}
                                </span>
                                <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm">
                                    {user.plan}
                                </span>
                            </div>
                        </div>

                        {/* Edit Button */}
                        <button className="ml-auto px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20">
                            ✏️ Edit Profile
                        </button>
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
                        <div className="text-3xl font-bold text-cyan-400">{user.stats.chats}</div>
                        <div className="text-sm text-gray-500">Total Chats</div>
                    </motion.div>
                    <motion.div
                        className="glass-card text-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <div className="text-3xl font-bold text-purple-400">{user.stats.agents}</div>
                        <div className="text-sm text-gray-500">Agent Runs</div>
                    </motion.div>
                    <motion.div
                        className="glass-card text-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="text-3xl font-bold text-yellow-400">{user.stats.tokens}</div>
                        <div className="text-sm text-gray-500">Tokens Used</div>
                    </motion.div>
                    <motion.div
                        className="glass-card text-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className="text-3xl font-bold text-green-400">{user.stats.saved}</div>
                        <div className="text-sm text-gray-500">Saved vs Cloud</div>
                    </motion.div>
                </div>
            </section>

            {/* Tabs */}
            <section className="container-main pb-6">
                <div className="flex gap-2 border-b border-gray-700 pb-2">
                    {(['overview', 'achievements', 'connections', 'activity'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-t-lg text-sm ${activeTab === tab
                                    ? 'bg-white/10 text-white font-medium'
                                    : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>
            </section>

            {/* Tab Content */}
            <section className="container-main pb-16">
                {activeTab === 'overview' && (
                    <motion.div
                        className="grid md:grid-cols-2 gap-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        {/* Profile Info */}
                        <div className="glass-card">
                            <h3 className="font-bold mb-4">📋 Profile Info</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Display Name</span>
                                    <span>{user.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Email</span>
                                    <span>{user.email}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Member Since</span>
                                    <span>{user.joined}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Plan</span>
                                    <span className="text-cyan-400">{user.plan}</span>
                                </div>
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div className="glass-card">
                            <h3 className="font-bold mb-4">🔗 Quick Links</h3>
                            <div className="grid grid-cols-2 gap-2">
                                <Link href="/settings" className="p-3 bg-white/5 rounded-lg hover:bg-white/10 text-center">
                                    ⚙️ Settings
                                </Link>
                                <Link href="/analytics" className="p-3 bg-white/5 rounded-lg hover:bg-white/10 text-center">
                                    📊 Analytics
                                </Link>
                                <Link href="/notifications" className="p-3 bg-white/5 rounded-lg hover:bg-white/10 text-center">
                                    🔔 Notifications
                                </Link>
                                <Link href="/shortcuts" className="p-3 bg-white/5 rounded-lg hover:bg-white/10 text-center">
                                    ⌨️ Shortcuts
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'achievements' && (
                    <motion.div
                        className="grid grid-cols-2 md:grid-cols-4 gap-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        {achievements.map((achievement) => (
                            <div
                                key={achievement.id}
                                className={`glass-card text-center ${achievement.earned
                                        ? 'ring-2 ring-yellow-500/50'
                                        : 'opacity-50'
                                    }`}
                            >
                                <span className="text-4xl">{achievement.icon}</span>
                                <h3 className="font-bold mt-2">{achievement.name}</h3>
                                <p className="text-xs text-gray-500 mt-1">{achievement.desc}</p>
                                {achievement.earned && (
                                    <p className="text-xs text-yellow-400 mt-2">✓ {achievement.date}</p>
                                )}
                                {!achievement.earned && (
                                    <p className="text-xs text-gray-600 mt-2">🔒 Locked</p>
                                )}
                            </div>
                        ))}
                    </motion.div>
                )}

                {activeTab === 'connections' && (
                    <motion.div
                        className="grid md:grid-cols-2 gap-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        {connectedServices.map((service) => (
                            <div
                                key={service.name}
                                className="glass-card flex items-center justify-between"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{service.icon}</span>
                                    <span className="font-medium">{service.name}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`w-2 h-2 rounded-full ${service.status === 'connected' ? 'bg-green-500' : 'bg-gray-500'
                                        }`}></span>
                                    <button className={`px-3 py-1 rounded text-sm ${service.status === 'connected'
                                            ? 'bg-red-500/20 text-red-400'
                                            : 'bg-green-500/20 text-green-400'
                                        }`}>
                                        {service.status === 'connected' ? 'Disconnect' : 'Connect'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                )}

                {activeTab === 'activity' && (
                    <motion.div
                        className="glass-card"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <h3 className="font-bold mb-4">🕐 Recent Activity</h3>
                        <div className="space-y-4">
                            {recentActivity.map((activity, i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                                    <div className="flex-1">
                                        <span>{activity.action}</span>
                                    </div>
                                    <span className="text-sm text-gray-500">{activity.time}</span>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-4 py-2 bg-white/10 rounded-lg text-sm">
                            View Full Activity Log
                        </button>
                    </motion.div>
                )}
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
