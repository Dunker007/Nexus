'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

const apps = [
    {
        name: 'Portfolio',
        icon: '📈',
        href: '/portfolio',
        desc: 'Track crypto & stocks',
        color: 'from-green-500 to-emerald-600',
        stats: '$67,847'
    },
    {
        name: 'Trading Bots',
        icon: '🤖',
        href: '/trading',
        desc: 'AI-powered automation',
        color: 'from-purple-500 to-violet-600',
        stats: '4 active'
    },
    {
        name: 'Budget',
        icon: '💰',
        href: '/budget',
        desc: 'Track spending & save',
        color: 'from-cyan-500 to-blue-600',
        stats: '$4,250 left'
    },
    {
        name: 'Passive Income',
        icon: '💸',
        href: '/income',
        desc: 'AI-powered income ideas',
        color: 'from-yellow-500 to-orange-600',
        stats: '$675/mo'
    },
    {
        name: 'Idle PC',
        icon: '💻',
        href: '/idle',
        desc: 'Monetize unused resources',
        color: 'from-blue-500 to-indigo-600',
        stats: '4 apps'
    },
    {
        name: 'Crypto Lab',
        icon: '💎',
        href: '/crypto',
        desc: 'Seeker + DeFi',
        color: 'from-teal-500 to-cyan-600',
        stats: '$2,847'
    },
];

const quickStats = [
    { label: 'Net Worth', value: '$127,450', change: '+12.4%', positive: true },
    { label: 'Monthly Income', value: '$8,500', change: '+5.2%', positive: true },
    { label: 'Monthly Expenses', value: '$4,250', change: '-8.1%', positive: true },
    { label: 'Savings Rate', value: '50%', change: '+3.5%', positive: true },
];

const recentActivity = [
    { type: 'trade', desc: 'BTC Grid Bot executed buy', amount: '+0.005 BTC', time: '5 min ago' },
    { type: 'expense', desc: 'Netflix subscription', amount: '-$15.99', time: '2 hours ago' },
    { type: 'dividend', desc: 'AAPL dividend received', amount: '+$24.00', time: '1 day ago' },
    { type: 'transfer', desc: 'Savings contribution', amount: '+$500.00', time: '2 days ago' },
];

export default function FinancePage() {
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
                            <span className="text-gradient">Finance</span> Hub
                        </h1>
                        <p className="text-gray-400">Your complete financial command center</p>
                    </motion.div>
                </div>
            </section>

            {/* Quick Stats */}
            <section className="container-main pb-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {quickStats.map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            className="glass-card"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <p className="text-gray-500 text-sm mb-1">{stat.label}</p>
                            <p className="text-2xl font-bold">{stat.value}</p>
                            <p className={`text-sm ${stat.positive ? 'text-green-400' : 'text-red-400'}`}>
                                {stat.change}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Apps Grid */}
            <section className="container-main pb-8">
                <h2 className="text-xl font-bold mb-4">💼 Finance Apps</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {apps.map((app, i) => (
                        <motion.div
                            key={app.name}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <Link href={app.href}>
                                <div className="glass-card group relative overflow-hidden cursor-pointer hover:ring-2 hover:ring-cyan-500/50 transition-all">
                                    <div className={`absolute inset-0 bg-gradient-to-br ${app.color} opacity-10 group-hover:opacity-20 transition-opacity`}></div>
                                    <div className="relative z-10">
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-4xl">{app.icon}</span>
                                            <span className="text-lg font-bold text-cyan-400">{app.stats}</span>
                                        </div>
                                        <h3 className="text-xl font-bold mb-1 group-hover:text-cyan-400 transition-colors">
                                            {app.name}
                                        </h3>
                                        <p className="text-gray-400 text-sm">{app.desc}</p>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Recent Activity */}
            <section className="container-main pb-16">
                <h2 className="text-xl font-bold mb-4">📋 Recent Activity</h2>
                <div className="glass-card p-0 overflow-hidden">
                    {recentActivity.map((item, i) => (
                        <div
                            key={i}
                            className="flex items-center justify-between p-4 border-b border-gray-700/50 last:border-0"
                        >
                            <div>
                                <p className="font-medium">{item.desc}</p>
                                <p className="text-xs text-gray-500">{item.time}</p>
                            </div>
                            <span className={`font-bold ${item.amount.startsWith('+') ? 'text-green-400' : 'text-red-400'
                                }`}>
                                {item.amount}
                            </span>
                        </div>
                    ))}
                </div>
            </section>

            {/* External Resources */}
            <section className="section-padding bg-[#050508]">
                <div className="container-main">
                    <h2 className="text-xl font-bold mb-4">🔗 External Tools</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <a href="https://kubera.com" target="_blank" className="glass-card text-center hover:ring-2 hover:ring-cyan-500/50">
                            <div className="text-2xl mb-2">💎</div>
                            <div className="font-medium">Kubera</div>
                            <div className="text-xs text-gray-500">Net worth tracker</div>
                        </a>
                        <a href="https://monarchmoney.com" target="_blank" className="glass-card text-center hover:ring-2 hover:ring-cyan-500/50">
                            <div className="text-2xl mb-2">👑</div>
                            <div className="font-medium">Monarch</div>
                            <div className="text-xs text-gray-500">Budgeting</div>
                        </a>
                        <a href="https://3commas.io" target="_blank" className="glass-card text-center hover:ring-2 hover:ring-cyan-500/50">
                            <div className="text-2xl mb-2">🤖</div>
                            <div className="font-medium">3Commas</div>
                            <div className="text-xs text-gray-500">Trading bots</div>
                        </a>
                        <a href="https://tradingview.com" target="_blank" className="glass-card text-center hover:ring-2 hover:ring-cyan-500/50">
                            <div className="text-2xl mb-2">📊</div>
                            <div className="font-medium">TradingView</div>
                            <div className="text-xs text-gray-500">Charts</div>
                        </a>
                    </div>
                </div>
            </section>

            {/* Back link */}
            <div className="container-main py-8">
                <Link href="/" className="text-gray-400 hover:text-cyan-400 transition-colors">
                    ← Back to Dashboard
                </Link>
            </div>
        </div>
    );
}
