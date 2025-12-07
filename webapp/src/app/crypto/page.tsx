'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';

// Solana Seeker specific opportunities
const seekerOpportunities = [
    {
        id: '1',
        name: 'DePIN Apps',
        category: 'Passive',
        earnings: '$5-50/mo',
        effort: 'Zero',
        description: 'Run DePIN (Decentralized Physical Infrastructure) apps that reward you for sharing data, location, and resources.',
        apps: ['Grass Mobile', 'Natix Network', 'Nodle', 'GEODNET'],
        tip: 'Stack multiple DePIN apps for maximum passive earnings.',
        seekerBonus: true,
    },
    {
        id: '2',
        name: 'Solana Mobile Airdrops',
        category: 'Rewards',
        earnings: 'Variable',
        effort: 'Low',
        description: 'Seeker owners get exclusive airdrops from Solana ecosystem projects. BONK airdrop to Saga was worth $1000+.',
        apps: ['Chapter 2 Claims', 'Ecosystem Airdrops'],
        tip: 'Keep wallet active and hold tokens for snapshot eligibility.',
        seekerBonus: true,
    },
    {
        id: '3',
        name: 'Mobile Gaming Rewards',
        category: 'Gaming',
        earnings: '$10-100/mo',
        effort: 'Medium',
        description: 'Play-to-earn games optimized for Solana. Many have Seeker-exclusive rewards.',
        apps: ['Star Atlas', 'Aurory', 'Genopets'],
        tip: 'Focus on games with Seeker-specific tournaments.',
        seekerBonus: true,
    },
    {
        id: '4',
        name: 'Solana Pay Cashback',
        category: 'Shopping',
        earnings: '1-5% back',
        effort: 'None',
        description: 'Use Solana Pay at participating merchants for USDC/SOL cashback.',
        apps: ['Solana Pay', 'Phantom'],
        tip: 'Check for Seeker-exclusive merchant deals.',
        seekerBonus: false,
    },
    {
        id: '5',
        name: 'Node Running (Mobile)',
        category: 'Infrastructure',
        earnings: '$20-100/mo',
        effort: 'Low',
        description: 'Run lightweight nodes for various protocols directly from Seeker.',
        apps: ['Helium Mobile', 'Grass', 'Nosana'],
        tip: 'Keep phone connected to WiFi and charging for 24/7 operation.',
        seekerBonus: true,
    },
    {
        id: '6',
        name: 'NFT Minting',
        category: 'Trading',
        earnings: 'Variable',
        effort: 'Medium',
        description: 'Get early access to Solana NFT mints with Seeker-exclusive allowlists.',
        apps: ['Magic Eden', 'Tensor'],
        tip: 'Join Seeker Discord for exclusive mint announcements.',
        seekerBonus: true,
    },
];

// General crypto portfolio tracking
const portfolio = {
    totalValue: '$2,847.50',
    change24h: '+5.2%',
    holdings: [
        { coin: 'SOL', amount: '12.5', value: '$2,125', change: '+4.8%' },
        { coin: 'BONK', amount: '15,000,000', value: '$420', change: '+12.3%' },
        { coin: 'JTO', amount: '50', value: '$175', change: '-2.1%' },
        { coin: 'PYTH', amount: '200', value: '$82', change: '+8.5%' },
        { coin: 'WIF', amount: '15', value: '$45.50', change: '+15.2%' },
    ],
};

// Quick actions for Seeker
const seekerQuickActions = [
    { name: 'Check Airdrops', icon: '🎁', desc: 'See pending claims' },
    { name: 'DePIN Dashboard', icon: '📡', desc: 'Monitor earnings' },
    { name: 'Wallet Backup', icon: '🔐', desc: 'Secure your seed' },
    { name: 'App Store', icon: '📱', desc: 'Seeker dApps' },
];

export default function CryptoPage() {
    const [activeTab, setActiveTab] = useState<'seeker' | 'portfolio' | 'defi'>('seeker');

    return (
        <div className="min-h-screen pt-8">
            {/* Header */}
            <section className="section-padding pb-8">
                <div className="container-main">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-4xl md:text-5xl font-bold">
                                <span className="text-gradient">💎 Crypto Lab</span>
                            </h1>
                        </div>
                        <p className="text-gray-400">
                            Solana Seeker optimization • DeFi strategies • Portfolio tracking
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Tabs */}
            <section className="container-main pb-6">
                <div className="flex gap-2">
                    {(['seeker', 'portfolio', 'defi'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-lg text-sm ${activeTab === tab ? 'bg-cyan-500 text-black font-medium' : 'bg-white/10'
                                }`}
                        >
                            {tab === 'seeker' ? '📱 Seeker Phone' :
                                tab === 'portfolio' ? '📊 Portfolio' : '🏦 DeFi'}
                        </button>
                    ))}
                </div>
            </section>

            {/* Seeker Tab */}
            {activeTab === 'seeker' && (
                <>
                    {/* Seeker Hero */}
                    <section className="container-main pb-8">
                        <motion.div
                            className="glass-card bg-gradient-to-r from-purple-500/10 to-cyan-500/10"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <div className="flex items-center gap-6">
                                <div className="text-6xl">📱</div>
                                <div>
                                    <h2 className="text-2xl font-bold">Solana Seeker (2025)</h2>
                                    <p className="text-gray-400">Your Web3 advantage in your pocket</p>
                                    <div className="flex gap-2 mt-2">
                                        <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded">Connected</span>
                                        <span className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded">Chapter 2</span>
                                        <span className="text-xs px-2 py-0.5 bg-cyan-500/20 text-cyan-400 rounded">Saga Seed Vault</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </section>

                    {/* Quick Actions */}
                    <section className="container-main pb-8">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {seekerQuickActions.map((action, i) => (
                                <motion.div
                                    key={action.name}
                                    className="glass-card text-center cursor-pointer hover:ring-2 hover:ring-cyan-500/50"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                >
                                    <div className="text-3xl mb-2">{action.icon}</div>
                                    <h3 className="font-bold text-sm">{action.name}</h3>
                                    <p className="text-xs text-gray-500">{action.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </section>

                    {/* Seeker Opportunities */}
                    <section className="container-main pb-16">
                        <h2 className="text-xl font-bold mb-4">💰 Seeker Income Opportunities</h2>
                        <motion.div
                            className="grid md:grid-cols-2 gap-6"
                            initial="initial"
                            animate="animate"
                            variants={{ animate: { transition: { staggerChildren: 0.05 } } }}
                        >
                            {seekerOpportunities.map((opp) => (
                                <motion.div
                                    key={opp.id}
                                    className={`glass-card ${opp.seekerBonus ? 'ring-2 ring-purple-500/30' : ''}`}
                                    variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold">{opp.name}</h3>
                                                {opp.seekerBonus && (
                                                    <span className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded">
                                                        Seeker Bonus
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-xs text-gray-500">{opp.category}</span>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-green-400 font-bold">{opp.earnings}</div>
                                            <div className="text-xs text-gray-500">{opp.effort} effort</div>
                                        </div>
                                    </div>

                                    <p className="text-sm text-gray-400 mb-3">{opp.description}</p>

                                    <div className="flex flex-wrap gap-1 mb-3">
                                        {opp.apps.map((app) => (
                                            <span key={app} className="text-xs px-2 py-0.5 bg-white/10 rounded">
                                                {app}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="text-xs text-cyan-400 bg-cyan-500/10 rounded p-2">
                                        💡 {opp.tip}
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </section>
                </>
            )}

            {/* Portfolio Tab */}
            {activeTab === 'portfolio' && (
                <section className="container-main pb-16">
                    <motion.div
                        className="glass-card mb-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <div className="text-3xl font-bold">{portfolio.totalValue}</div>
                                <div className="text-sm text-gray-500">Total Portfolio Value</div>
                            </div>
                            <div className="text-right">
                                <div className={`text-xl font-bold ${portfolio.change24h.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                                    {portfolio.change24h}
                                </div>
                                <div className="text-sm text-gray-500">24h Change</div>
                            </div>
                        </div>
                    </motion.div>

                    <h2 className="text-xl font-bold mb-4">Holdings</h2>
                    <div className="space-y-3">
                        {portfolio.holdings.map((holding) => (
                            <motion.div
                                key={holding.coin}
                                className="glass-card flex items-center justify-between"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-full flex items-center justify-center font-bold text-sm">
                                        {holding.coin.slice(0, 2)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold">{holding.coin}</h3>
                                        <div className="text-sm text-gray-500">{holding.amount}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold">{holding.value}</div>
                                    <div className={`text-sm ${holding.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                                        {holding.change}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>
            )}

            {/* DeFi Tab */}
            {activeTab === 'defi' && (
                <section className="container-main pb-16">
                    <motion.div
                        className="text-center py-16"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <span className="text-6xl">🏗️</span>
                        <h2 className="text-2xl font-bold mt-4">DeFi Strategies Coming Soon</h2>
                        <p className="text-gray-400 mt-2">Yield farming, staking, and liquidity provision strategies</p>
                    </motion.div>
                </section>
            )}

            {/* Back link */}
            <div className="container-main pb-8">
                <Link href="/labs" className="text-gray-400 hover:text-cyan-400 transition-colors">
                    ← Back to Labs
                </Link>
            </div>
        </div>
    );
}
