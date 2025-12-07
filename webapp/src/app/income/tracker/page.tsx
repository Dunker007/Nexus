'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';

// Income tracking data
const incomeData = {
    thisMonth: {
        total: 675,
        breakdown: [
            { source: 'AI Content Creation', amount: 450, change: '+12%' },
            { source: 'Print on Demand', amount: 125, change: '+5%' },
            { source: 'Affiliate Links', amount: 85, change: '-3%' },
            { source: 'Honeygain', amount: 15, change: '0%' },
        ]
    },
    history: [
        { month: 'Dec 2024', amount: 675 },
        { month: 'Nov 2024', amount: 620 },
        { month: 'Oct 2024', amount: 485 },
        { month: 'Sep 2024', amount: 320 },
        { month: 'Aug 2024', amount: 180 },
        { month: 'Jul 2024', amount: 95 },
    ],
    goals: {
        monthly: 1000,
        yearly: 12000,
        currentMonthly: 675,
        currentYearly: 4100,
    },
    streams: [
        { id: '1', name: 'AI Content Creation', status: 'active', lastPayout: 'Dec 1', nextPayout: 'Jan 1', platform: 'Multiple' },
        { id: '2', name: 'Print on Demand', status: 'active', lastPayout: 'Nov 28', nextPayout: 'Dec 28', platform: 'Printful' },
        { id: '3', name: 'Affiliate Links', status: 'active', lastPayout: 'Nov 15', nextPayout: 'Dec 15', platform: 'Amazon' },
        { id: '4', name: 'Honeygain', status: 'pending', lastPayout: 'Oct 20', nextPayout: 'Threshold: $18.50/$20', platform: 'Honeygain' },
        { id: '5', name: 'API Service', status: 'building', lastPayout: '-', nextPayout: 'Launch: Jan 2025', platform: 'Self' },
    ]
};

export default function TrackerPage() {
    const [timeRange, setTimeRange] = useState<'month' | 'quarter' | 'year'>('month');

    const goalProgress = (incomeData.goals.currentMonthly / incomeData.goals.monthly) * 100;
    const maxAmount = Math.max(...incomeData.history.map(h => h.amount));

    return (
        <div className="min-h-screen pt-8">
            {/* Header */}
            <section className="section-padding pb-8">
                <div className="container-main">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Link href="/income" className="text-cyan-400 text-sm mb-2 inline-block">← Income Hub</Link>
                        <h1 className="text-4xl md:text-5xl font-bold mb-2">
                            <span className="text-gradient">📊 Income Tracker</span>
                        </h1>
                        <p className="text-gray-400">
                            Track all your passive income streams in one place
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Current Month */}
            <section className="container-main pb-8">
                <div className="grid md:grid-cols-3 gap-6">
                    {/* Total This Month */}
                    <motion.div
                        className="glass-card text-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="text-4xl font-bold text-green-400">${incomeData.thisMonth.total}</div>
                        <div className="text-gray-500 mt-1">This Month</div>
                        <div className="text-sm text-gray-400 mt-2">
                            Dec 1-4, 2024
                        </div>
                    </motion.div>

                    {/* Goal Progress */}
                    <motion.div
                        className="glass-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <div className="flex justify-between text-sm mb-2">
                            <span>Monthly Goal</span>
                            <span className="text-cyan-400">${incomeData.goals.currentMonthly} / ${incomeData.goals.monthly}</span>
                        </div>
                        <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-gradient-to-r from-cyan-500 to-green-500 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${goalProgress}%` }}
                                transition={{ duration: 1 }}
                            />
                        </div>
                        <div className="text-xs text-gray-500 mt-2">{goalProgress.toFixed(0)}% of goal</div>
                    </motion.div>

                    {/* YTD */}
                    <motion.div
                        className="glass-card text-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="text-3xl font-bold text-purple-400">${incomeData.goals.currentYearly}</div>
                        <div className="text-gray-500 mt-1">Year to Date</div>
                        <div className="text-sm text-gray-400 mt-2">
                            {((incomeData.goals.currentYearly / incomeData.goals.yearly) * 100).toFixed(0)}% of yearly goal
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Breakdown */}
            <section className="container-main pb-8">
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Sources */}
                    <motion.div
                        className="glass-card"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <h3 className="font-bold mb-4">💰 Income Sources</h3>
                        <div className="space-y-3">
                            {incomeData.thisMonth.breakdown.map((source) => (
                                <div key={source.source} className="flex items-center justify-between">
                                    <span>{source.source}</span>
                                    <div className="flex items-center gap-3">
                                        <span className={`text-xs ${source.change.startsWith('+') ? 'text-green-400' :
                                                source.change.startsWith('-') ? 'text-red-400' : 'text-gray-400'
                                            }`}>{source.change}</span>
                                        <span className="font-bold text-green-400">${source.amount}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Chart */}
                    <motion.div
                        className="glass-card"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                    >
                        <h3 className="font-bold mb-4">📈 Growth</h3>
                        <div className="flex items-end justify-between h-32 gap-2">
                            {incomeData.history.slice().reverse().map((month, i) => (
                                <div key={month.month} className="flex-1 flex flex-col items-center">
                                    <motion.div
                                        className="w-full bg-gradient-to-t from-cyan-500 to-purple-500 rounded-t"
                                        initial={{ height: 0 }}
                                        animate={{ height: `${(month.amount / maxAmount) * 100}%` }}
                                        transition={{ delay: i * 0.1 }}
                                    />
                                    <div className="text-xs text-gray-500 mt-2">{month.month.slice(0, 3)}</div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Active Streams */}
            <section className="container-main pb-16">
                <h3 className="font-bold mb-4">📋 All Streams</h3>
                <div className="space-y-3">
                    {incomeData.streams.map((stream) => (
                        <motion.div
                            key={stream.id}
                            className="glass-card flex items-center justify-between"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-3 h-3 rounded-full ${stream.status === 'active' ? 'bg-green-500' :
                                        stream.status === 'pending' ? 'bg-yellow-500' :
                                            'bg-blue-500'
                                    }`}></div>
                                <div>
                                    <h4 className="font-medium">{stream.name}</h4>
                                    <div className="text-xs text-gray-500">{stream.platform}</div>
                                </div>
                            </div>
                            <div className="text-right text-sm">
                                <div className="text-gray-400">Last: {stream.lastPayout}</div>
                                <div className="text-cyan-400">Next: {stream.nextPayout}</div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <button className="w-full mt-4 py-3 bg-white/10 rounded-lg hover:bg-white/20">
                    + Add Income Stream
                </button>
            </section>

            {/* Back link */}
            <div className="container-main pb-8">
                <Link href="/income" className="text-gray-400 hover:text-cyan-400 transition-colors">
                    ← Back to Income Hub
                </Link>
            </div>
        </div>
    );
}
