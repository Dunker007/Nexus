'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';

const usageStats = {
    today: {
        chats: 47,
        tokens: 125000,
        models: ['gemma-3n-E4B-it-QAT', 'llama3.1:8b'],
        savedVsCloud: 12.50
    },
    week: {
        chats: 312,
        tokens: 890000,
        avgTokensPerDay: 127142,
        topModel: 'gemma-3n-E4B-it-QAT'
    },
    month: {
        chats: 1247,
        tokens: 3450000,
        agentRuns: 89,
        savedVsCloud: 345.00
    },
    allTime: {
        totalChats: 5847,
        totalTokens: 15200000,
        totalAgentRuns: 423,
        savedVsCloud: 1520.00,
        sinceDate: 'Oct 15, 2024'
    }
};

const dailyUsage = [
    { day: 'Mon', tokens: 145000, chats: 52 },
    { day: 'Tue', tokens: 132000, chats: 48 },
    { day: 'Wed', tokens: 178000, chats: 67 },
    { day: 'Thu', tokens: 95000, chats: 34 },
    { day: 'Fri', tokens: 156000, chats: 58 },
    { day: 'Sat', tokens: 89000, chats: 28 },
    { day: 'Sun', tokens: 125000, chats: 47 },
];

const modelUsage = [
    { model: 'gemma-3n-E4B-it-QAT', tokens: 450000, percent: 35 },
    { model: 'llama3.1:8b', tokens: 320000, percent: 25 },
    { model: 'qwen2.5-coder-14b', tokens: 280000, percent: 22 },
    { model: 'mistral:7b', tokens: 230000, percent: 18 },
];

const recentSessions = [
    { time: '10:15 AM', model: 'gemma', tokens: 2450, type: 'Chat' },
    { time: '9:42 AM', model: 'llama3.1', tokens: 5600, type: 'Agent' },
    { time: '9:15 AM', model: 'qwen', tokens: 1200, type: 'Code' },
    { time: '8:30 AM', model: 'gemma', tokens: 890, type: 'Chat' },
    { time: 'Yesterday', model: 'mistral', tokens: 3400, type: 'Research' },
];

export default function AnalyticsPage() {
    const [timeframe, setTimeframe] = useState<'today' | 'week' | 'month' | 'allTime'>('week');

    const maxTokens = Math.max(...dailyUsage.map(d => d.tokens));

    return (
        <div className="min-h-screen pt-8">
            {/* Header */}
            <section className="section-padding pb-8">
                <div className="container-main">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h1 className="text-4xl md:text-5xl font-bold mb-2">
                            <span className="text-gradient">Analytics</span>
                        </h1>
                        <p className="text-gray-400">Track your AI usage, tokens, and savings</p>
                    </motion.div>
                </div>
            </section>

            {/* Timeframe Selector */}
            <section className="container-main pb-6">
                <div className="flex gap-2">
                    {(['today', 'week', 'month', 'allTime'] as const).map((tf) => (
                        <button
                            key={tf}
                            onClick={() => setTimeframe(tf)}
                            className={`px-4 py-2 rounded-lg text-sm ${timeframe === tf
                                    ? 'bg-cyan-500 text-black font-medium'
                                    : 'bg-white/10 hover:bg-white/20'
                                }`}
                        >
                            {tf === 'allTime' ? 'All Time' : tf.charAt(0).toUpperCase() + tf.slice(1)}
                        </button>
                    ))}
                </div>
            </section>

            {/* Quick Stats */}
            <section className="container-main pb-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <motion.div
                        className="glass-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <p className="text-gray-500 text-sm mb-1">Chats</p>
                        <p className="text-3xl font-bold text-cyan-400">
                            {timeframe === 'today' ? usageStats.today.chats :
                                timeframe === 'week' ? usageStats.week.chats :
                                    timeframe === 'month' ? usageStats.month.chats :
                                        usageStats.allTime.totalChats}
                        </p>
                    </motion.div>
                    <motion.div
                        className="glass-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <p className="text-gray-500 text-sm mb-1">Tokens Used</p>
                        <p className="text-3xl font-bold text-purple-400">
                            {((timeframe === 'today' ? usageStats.today.tokens :
                                timeframe === 'week' ? usageStats.week.tokens :
                                    timeframe === 'month' ? usageStats.month.tokens :
                                        usageStats.allTime.totalTokens) / 1000000).toFixed(1)}M
                        </p>
                    </motion.div>
                    <motion.div
                        className="glass-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <p className="text-gray-500 text-sm mb-1">Agent Runs</p>
                        <p className="text-3xl font-bold text-yellow-400">
                            {timeframe === 'month' ? usageStats.month.agentRuns : usageStats.allTime.totalAgentRuns}
                        </p>
                    </motion.div>
                    <motion.div
                        className="glass-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <p className="text-gray-500 text-sm mb-1">Saved vs Cloud</p>
                        <p className="text-3xl font-bold text-green-400">
                            ${timeframe === 'today' ? usageStats.today.savedVsCloud :
                                timeframe === 'month' ? usageStats.month.savedVsCloud :
                                    usageStats.allTime.savedVsCloud}
                        </p>
                    </motion.div>
                </div>
            </section>

            <div className="container-main pb-16 grid lg:grid-cols-3 gap-6">
                {/* Charts */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Daily Usage Chart */}
                    <motion.div
                        className="glass-card"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <h3 className="font-bold mb-4">📊 Daily Usage (This Week)</h3>
                        <div className="flex items-end gap-2 h-48">
                            {dailyUsage.map((day) => (
                                <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
                                    <div
                                        className="w-full bg-gradient-to-t from-cyan-500 to-purple-500 rounded-t transition-all hover:opacity-80"
                                        style={{ height: `${(day.tokens / maxTokens) * 100}%` }}
                                    ></div>
                                    <span className="text-xs text-gray-500">{day.day}</span>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between mt-4 text-sm text-gray-500">
                            <span>Tokens/day</span>
                            <span>Peak: {(maxTokens / 1000).toFixed(0)}K tokens</span>
                        </div>
                    </motion.div>

                    {/* Model Usage */}
                    <motion.div
                        className="glass-card"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                    >
                        <h3 className="font-bold mb-4">🤖 Model Usage</h3>
                        <div className="space-y-4">
                            {modelUsage.map((model) => (
                                <div key={model.model}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span>{model.model}</span>
                                        <span className="text-gray-500">{(model.tokens / 1000).toFixed(0)}K tokens</span>
                                    </div>
                                    <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full"
                                            style={{ width: `${model.percent}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Recent Sessions */}
                    <motion.div
                        className="glass-card"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h3 className="font-bold mb-4">🕐 Recent Sessions</h3>
                        <div className="space-y-3">
                            {recentSessions.map((session, i) => (
                                <div key={i} className="flex items-center justify-between text-sm">
                                    <div>
                                        <div className="font-medium">{session.type}</div>
                                        <div className="text-xs text-gray-500">{session.model} • {session.time}</div>
                                    </div>
                                    <span className="text-cyan-400">{session.tokens.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Cost Comparison */}
                    <motion.div
                        className="glass-card"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <h3 className="font-bold mb-4">💰 Cost Comparison</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-400">If using GPT-4</span>
                                <span className="text-red-400">$1,520.00</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">If using Claude</span>
                                <span className="text-red-400">$912.00</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Local (electricity)</span>
                                <span className="text-yellow-400">~$45.00</span>
                            </div>
                            <div className="border-t border-gray-700 pt-3 flex justify-between">
                                <span className="font-bold">Total Saved</span>
                                <span className="text-green-400 font-bold">$1,475.00</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Export */}
                    <motion.div
                        className="glass-card"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h3 className="font-bold mb-4">📤 Export Data</h3>
                        <div className="space-y-2">
                            <button className="w-full py-2 bg-white/10 rounded-lg text-sm hover:bg-white/20">
                                Export as CSV
                            </button>
                            <button className="w-full py-2 bg-white/10 rounded-lg text-sm hover:bg-white/20">
                                Export as JSON
                            </button>
                            <button className="w-full py-2 bg-white/10 rounded-lg text-sm hover:bg-white/20">
                                Generate Report
                            </button>
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
