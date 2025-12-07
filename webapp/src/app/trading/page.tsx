'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';

const bots = [
    {
        id: 'grid-bot',
        name: 'Grid Trading Bot',
        icon: '📊',
        status: 'running',
        pair: 'BTC/USDT',
        profit: 2847.50,
        profitPercent: 12.4,
        trades: 156,
        uptime: '14d 6h',
        strategy: 'Grid',
        risk: 'medium'
    },
    {
        id: 'dca-bot',
        name: 'DCA Accumulator',
        icon: '💰',
        status: 'running',
        pair: 'ETH/USDT',
        profit: 1234.80,
        profitPercent: 8.2,
        trades: 45,
        uptime: '30d 2h',
        strategy: 'DCA',
        risk: 'low'
    },
    {
        id: 'momentum-bot',
        name: 'Momentum Rider',
        icon: '🚀',
        status: 'paused',
        pair: 'SOL/USDT',
        profit: -156.20,
        profitPercent: -2.1,
        trades: 89,
        uptime: '7d 12h',
        strategy: 'Momentum',
        risk: 'high'
    },
    {
        id: 'ai-bot',
        name: 'AI Signal Bot',
        icon: '🤖',
        status: 'running',
        pair: 'Multiple',
        profit: 5621.30,
        profitPercent: 18.7,
        trades: 234,
        uptime: '21d 8h',
        strategy: 'AI/ML',
        risk: 'medium'
    },
];

const strategies = [
    {
        name: 'Grid Trading',
        icon: '📊',
        desc: 'Buy low, sell high within a price range',
        bestFor: 'Sideways markets',
        risk: 'Medium'
    },
    {
        name: 'DCA (Dollar Cost Average)',
        icon: '💰',
        desc: 'Regular purchases regardless of price',
        bestFor: 'Long-term accumulation',
        risk: 'Low'
    },
    {
        name: 'Momentum',
        icon: '🚀',
        desc: 'Follow the trend, ride the wave',
        bestFor: 'Trending markets',
        risk: 'High'
    },
    {
        name: 'AI Signal',
        icon: '🤖',
        desc: 'LLM-powered market analysis',
        bestFor: 'All conditions',
        risk: 'Medium'
    },
    {
        name: 'Arbitrage',
        icon: '⚡',
        desc: 'Exploit price differences across exchanges',
        bestFor: 'Low volatility',
        risk: 'Low'
    },
    {
        name: 'Mean Reversion',
        icon: '📈',
        desc: 'Bet on price returning to average',
        bestFor: 'Overbought/oversold',
        risk: 'Medium'
    },
];

const exchanges = [
    { name: 'Binance', status: 'connected', balance: '$12,450', icon: '🟡' },
    { name: 'Coinbase', status: 'connected', balance: '$8,230', icon: '🔵' },
    { name: 'Kraken', status: 'disconnected', balance: '-', icon: '🟣' },
    { name: 'KuCoin', status: 'disconnected', balance: '-', icon: '🟢' },
];

const statusColors = {
    running: 'bg-green-500/20 text-green-400',
    paused: 'bg-yellow-500/20 text-yellow-400',
    stopped: 'bg-red-500/20 text-red-400',
};

export default function TradingPage() {
    const [selectedBot, setSelectedBot] = useState<string | null>(null);

    const totalProfit = bots.reduce((sum, b) => sum + b.profit, 0);
    const totalTrades = bots.reduce((sum, b) => sum + b.trades, 0);
    const runningBots = bots.filter(b => b.status === 'running').length;

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
                                Trading <span className="text-gradient">Bots</span>
                            </h1>
                            <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm">
                                AI-Powered
                            </span>
                        </div>
                        <p className="text-gray-400">Automated trading with AI-powered strategies. Like 3Commas, but local.</p>
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
                        <div className={`text-3xl font-bold ${totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            ${totalProfit.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">Total Profit</div>
                    </motion.div>
                    <motion.div
                        className="glass-card text-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <div className="text-3xl font-bold text-cyan-400">{runningBots}</div>
                        <div className="text-sm text-gray-500">Active Bots</div>
                    </motion.div>
                    <motion.div
                        className="glass-card text-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="text-3xl font-bold text-purple-400">{totalTrades}</div>
                        <div className="text-sm text-gray-500">Total Trades</div>
                    </motion.div>
                    <motion.div
                        className="glass-card text-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className="text-3xl font-bold text-yellow-400">24/7</div>
                        <div className="text-sm text-gray-500">Uptime</div>
                    </motion.div>
                </div>
            </section>

            <div className="container-main pb-16 grid lg:grid-cols-3 gap-6">
                {/* Bots */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold">🤖 Your Bots</h2>
                        <button className="btn-primary text-sm">+ Create Bot</button>
                    </div>

                    <motion.div
                        className="space-y-4"
                        initial="initial"
                        animate="animate"
                        variants={{ animate: { transition: { staggerChildren: 0.05 } } }}
                    >
                        {bots.map((bot) => (
                            <motion.div
                                key={bot.id}
                                className="glass-card"
                                variants={{ initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 } }}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <span className="text-3xl">{bot.icon}</span>
                                        <div>
                                            <h3 className="font-bold">{bot.name}</h3>
                                            <p className="text-sm text-gray-500">{bot.pair} • {bot.strategy}</p>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-sm ${statusColors[bot.status as keyof typeof statusColors]}`}>
                                        {bot.status}
                                    </span>
                                </div>

                                <div className="grid grid-cols-4 gap-4 text-center">
                                    <div>
                                        <div className={`font-bold ${bot.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            ${bot.profit.toLocaleString()}
                                        </div>
                                        <div className="text-xs text-gray-500">Profit</div>
                                    </div>
                                    <div>
                                        <div className={`font-bold ${bot.profitPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            {bot.profitPercent >= 0 ? '+' : ''}{bot.profitPercent}%
                                        </div>
                                        <div className="text-xs text-gray-500">ROI</div>
                                    </div>
                                    <div>
                                        <div className="font-bold text-cyan-400">{bot.trades}</div>
                                        <div className="text-xs text-gray-500">Trades</div>
                                    </div>
                                    <div>
                                        <div className="font-bold text-purple-400">{bot.uptime}</div>
                                        <div className="text-xs text-gray-500">Uptime</div>
                                    </div>
                                </div>

                                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-700">
                                    {bot.status === 'running' ? (
                                        <button className="flex-1 py-2 bg-yellow-500/20 text-yellow-400 rounded-lg text-sm">
                                            ⏸️ Pause
                                        </button>
                                    ) : (
                                        <button className="flex-1 py-2 bg-green-500/20 text-green-400 rounded-lg text-sm">
                                            ▶️ Start
                                        </button>
                                    )}
                                    <button className="flex-1 py-2 bg-white/10 rounded-lg text-sm">
                                        ⚙️ Configure
                                    </button>
                                    <button className="flex-1 py-2 bg-white/10 rounded-lg text-sm">
                                        📊 Stats
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Exchanges */}
                    <motion.div
                        className="glass-card"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h3 className="font-bold mb-4">🏦 Connected Exchanges</h3>
                        <div className="space-y-3">
                            {exchanges.map((ex) => (
                                <div key={ex.name} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span>{ex.icon}</span>
                                        <span>{ex.name}</span>
                                    </div>
                                    <div className="text-right">
                                        {ex.status === 'connected' ? (
                                            <>
                                                <div className="text-sm text-green-400">{ex.balance}</div>
                                                <div className="text-xs text-gray-500">Connected</div>
                                            </>
                                        ) : (
                                            <button className="text-sm text-cyan-400">Connect</button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Strategies */}
                    <motion.div
                        className="glass-card"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <h3 className="font-bold mb-4">📚 Strategy Library</h3>
                        <div className="space-y-3">
                            {strategies.slice(0, 4).map((strat) => (
                                <div
                                    key={strat.name}
                                    className="p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10"
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <span>{strat.icon}</span>
                                        <span className="font-medium text-sm">{strat.name}</span>
                                    </div>
                                    <p className="text-xs text-gray-500">{strat.desc}</p>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-4 py-2 bg-white/10 rounded-lg text-sm">
                            View All Strategies
                        </button>
                    </motion.div>

                    {/* Resources */}
                    <motion.div
                        className="glass-card"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h3 className="font-bold mb-4">🔗 Trading Resources</h3>
                        <div className="space-y-2">
                            <a href="https://3commas.io" target="_blank" className="block px-3 py-2 bg-white/5 rounded hover:bg-white/10">
                                3Commas - Inspiration
                            </a>
                            <a href="https://tradingview.com" target="_blank" className="block px-3 py-2 bg-white/5 rounded hover:bg-white/10">
                                TradingView Charts
                            </a>
                            <a href="https://coinglass.com" target="_blank" className="block px-3 py-2 bg-white/5 rounded hover:bg-white/10">
                                Coinglass - Derivatives
                            </a>
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
