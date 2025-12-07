'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';

// Idle PC income opportunities
const idleApps = [
    {
        id: '1',
        name: 'Honeygain',
        category: 'Bandwidth',
        status: 'installed',
        monthlyEarning: '$15-30',
        currentBalance: '$18.50',
        payoutThreshold: '$20',
        description: 'Share unused bandwidth. Runs in background.',
        requirements: ['25GB/day bandwidth cap', 'Multiple devices supported'],
        tips: ['Enable Content Delivery for bonus', 'Use JumpTask for crypto payout', 'Run on multiple devices'],
        link: 'honeygain.com',
        rating: 4.2,
    },
    {
        id: '2',
        name: 'Pawns.app',
        category: 'Bandwidth',
        status: 'installed',
        monthlyEarning: '$10-25',
        currentBalance: '$4.20',
        payoutThreshold: '$5',
        description: 'Similar to Honeygain. Lower threshold.',
        requirements: ['Residential IP', 'Good bandwidth'],
        tips: ['Stack with Honeygain', 'Use on all devices', 'Check in for bonus'],
        link: 'pawns.app',
        rating: 4.0,
    },
    {
        id: '3',
        name: 'Repocket',
        category: 'Bandwidth',
        status: 'not installed',
        monthlyEarning: '$5-15',
        currentBalance: '-',
        payoutThreshold: '$20',
        description: 'Newer bandwidth sharing app.',
        requirements: ['Residential IP', 'Stable connection'],
        tips: ['Good for stacking', 'Lower earnings but legit'],
        link: 'repocket.co',
        rating: 3.8,
    },
    {
        id: '4',
        name: 'Grass',
        category: 'AI Training',
        status: 'installed',
        monthlyEarning: 'Points → $TBD',
        currentBalance: '45,000 points',
        payoutThreshold: 'Airdrop',
        description: 'AI training data network. Potential token airdrop.',
        requirements: ['Browser extension', 'Keep browser open'],
        tips: ['Higher potential upside', 'Early adopter advantage', 'Low resource usage'],
        link: 'getgrass.io',
        rating: 4.5,
    },
    {
        id: '5',
        name: 'Salad',
        category: 'GPU Computing',
        status: 'not installed',
        monthlyEarning: '$20-50',
        currentBalance: '-',
        payoutThreshold: '$5',
        description: 'Rent out GPU for distributed computing.',
        requirements: ['Gaming GPU (GTX 1060+)', 'PC running when idle'],
        tips: ['Best for gaming PCs', 'Run overnight', 'Higher earnings than bandwidth'],
        link: 'salad.com',
        rating: 4.3,
    },
    {
        id: '6',
        name: 'EarnApp',
        category: 'Bandwidth',
        status: 'installed',
        monthlyEarning: '$5-15',
        currentBalance: '$3.80',
        payoutThreshold: '$2.50',
        description: 'By BrightData. Lowest payout threshold.',
        requirements: ['Residential IP', 'Bandwidth'],
        tips: ['Great for quick first payout', 'Stack with others'],
        link: 'earnapp.com',
        rating: 4.1,
    },
];

const stats = {
    totalMonthly: '$45-100',
    appsInstalled: 4,
    totalBalance: '$71.50',
    nextPayout: 'Honeygain: $1.50 to go',
};

export default function IdlePage() {
    const [showInstalled, setShowInstalled] = useState(false);

    const filteredApps = showInstalled
        ? idleApps.filter(app => app.status === 'installed')
        : idleApps;

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
                            <span className="text-gradient">💻 Idle PC Income</span>
                        </h1>
                        <p className="text-gray-400">
                            Monetize your unused PC resources • Zero effort • True passive
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Stats */}
            <section className="container-main pb-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <motion.div className="glass-card text-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="text-2xl font-bold text-green-400">{stats.totalMonthly}</div>
                        <div className="text-xs text-gray-500">Est. Monthly</div>
                    </motion.div>
                    <motion.div className="glass-card text-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                        <div className="text-2xl font-bold text-cyan-400">{stats.appsInstalled}</div>
                        <div className="text-xs text-gray-500">Apps Running</div>
                    </motion.div>
                    <motion.div className="glass-card text-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <div className="text-2xl font-bold text-purple-400">{stats.totalBalance}</div>
                        <div className="text-xs text-gray-500">Pending Balance</div>
                    </motion.div>
                    <motion.div className="glass-card text-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                        <div className="text-sm font-bold text-yellow-400">{stats.nextPayout}</div>
                        <div className="text-xs text-gray-500">Next Payout</div>
                    </motion.div>
                </div>
            </section>

            {/* Filter */}
            <section className="container-main pb-6">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={showInstalled}
                        onChange={(e) => setShowInstalled(e.target.checked)}
                        className="w-4 h-4 rounded"
                    />
                    <span className="text-sm">Show installed only</span>
                </label>
            </section>

            {/* Apps */}
            <section className="container-main pb-16">
                <motion.div
                    className="grid md:grid-cols-2 gap-6"
                    initial="initial"
                    animate="animate"
                    variants={{ animate: { transition: { staggerChildren: 0.05 } } }}
                >
                    {filteredApps.map((app) => (
                        <motion.div
                            key={app.id}
                            className={`glass-card ${app.status === 'installed' ? 'ring-2 ring-green-500/30' : ''}`}
                            variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }}
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-lg">{app.name}</h3>
                                        <span className={`text-xs px-2 py-0.5 rounded ${app.status === 'installed' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                                            }`}>{app.status}</span>
                                    </div>
                                    <span className="text-xs text-gray-500">{app.category}</span>
                                </div>
                                <div className="text-right">
                                    <div className="text-yellow-400">{'⭐'.repeat(Math.floor(app.rating))}</div>
                                </div>
                            </div>

                            <p className="text-sm text-gray-400 mb-4">{app.description}</p>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-2 mb-4 text-sm">
                                <div className="bg-white/5 rounded p-2 text-center">
                                    <div className="text-green-400 font-bold">{app.monthlyEarning}</div>
                                    <div className="text-xs text-gray-500">Monthly</div>
                                </div>
                                <div className="bg-white/5 rounded p-2 text-center">
                                    <div className="font-bold">{app.currentBalance}</div>
                                    <div className="text-xs text-gray-500">Balance</div>
                                </div>
                                <div className="bg-white/5 rounded p-2 text-center">
                                    <div className="font-bold">{app.payoutThreshold}</div>
                                    <div className="text-xs text-gray-500">Payout</div>
                                </div>
                            </div>

                            {/* Tips */}
                            <div className="mb-4">
                                <div className="text-xs text-cyan-400 mb-1">💡 Tips:</div>
                                <div className="space-y-1">
                                    {app.tips.map((tip, i) => (
                                        <div key={i} className="text-xs text-gray-400">• {tip}</div>
                                    ))}
                                </div>
                            </div>

                            {/* Action */}
                            <div className="flex gap-2">
                                {app.status === 'installed' ? (
                                    <button className="flex-1 py-2 bg-green-500/20 text-green-400 rounded-lg text-sm">
                                        ✓ Running
                                    </button>
                                ) : (
                                    <a
                                        href={`https://${app.link}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 py-2 bg-cyan-500 text-black rounded-lg font-medium text-sm text-center"
                                    >
                                        Install →
                                    </a>
                                )}
                                <button className="px-4 py-2 bg-white/10 rounded-lg text-sm">
                                    ⚙️
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </section>

            {/* Tips Section */}
            <section className="section-padding bg-[#050508]">
                <div className="container-main">
                    <motion.div
                        className="glass-card"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-xl font-bold mb-4">🎯 Maximize Idle Income</h2>
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                            <div className="flex gap-2">
                                <span className="text-cyan-400">•</span>
                                <span>Stack multiple apps - they don't conflict</span>
                            </div>
                            <div className="flex gap-2">
                                <span className="text-cyan-400">•</span>
                                <span>Run 24/7 for maximum earnings</span>
                            </div>
                            <div className="flex gap-2">
                                <span className="text-cyan-400">•</span>
                                <span>Use on all devices (PC, laptop, phone)</span>
                            </div>
                            <div className="flex gap-2">
                                <span className="text-cyan-400">•</span>
                                <span>Residential IPs earn more than VPN</span>
                            </div>
                            <div className="flex gap-2">
                                <span className="text-cyan-400">•</span>
                                <span>GPU apps (Salad) earn more but use power</span>
                            </div>
                            <div className="flex gap-2">
                                <span className="text-cyan-400">•</span>
                                <span>Check for referral bonuses</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Back link */}
            <div className="container-main py-8">
                <Link href="/income" className="text-gray-400 hover:text-cyan-400 transition-colors">
                    ← Back to Income Hub
                </Link>
            </div>
        </div>
    );
}
