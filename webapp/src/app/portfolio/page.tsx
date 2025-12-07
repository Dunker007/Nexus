'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect } from 'react';

// Simulated portfolio data (would come from API)
const mockPortfolio = [
    { symbol: 'BTC', name: 'Bitcoin', amount: 0.5, avgCost: 42000, currentPrice: 97500, logo: '₿', type: 'crypto' },
    { symbol: 'ETH', name: 'Ethereum', amount: 3.2, avgCost: 2200, currentPrice: 3450, logo: 'Ξ', type: 'crypto' },
    { symbol: 'SOL', name: 'Solana', amount: 25, avgCost: 85, currentPrice: 225, logo: '◎', type: 'crypto' },
    { symbol: 'AAPL', name: 'Apple Inc.', amount: 15, avgCost: 165, currentPrice: 192, logo: '🍎', type: 'stock' },
    { symbol: 'NVDA', name: 'NVIDIA Corp.', amount: 8, avgCost: 450, currentPrice: 142, logo: '🎮', type: 'stock' },
    { symbol: 'MSFT', name: 'Microsoft', amount: 10, avgCost: 320, currentPrice: 378, logo: '🪟', type: 'stock' },
];

const watchlist = [
    { symbol: 'XRP', name: 'Ripple', price: 2.45, change: 8.2, logo: '💧' },
    { symbol: 'LINK', name: 'Chainlink', price: 24.80, change: 5.1, logo: '🔗' },
    { symbol: 'AVAX', name: 'Avalanche', price: 48.50, change: -2.3, logo: '🔺' },
    { symbol: 'TSLA', name: 'Tesla', price: 352.40, change: 3.8, logo: '🚗' },
    { symbol: 'AMD', name: 'AMD', price: 138.20, change: -1.2, logo: '💻' },
];

const news = [
    { title: 'Bitcoin Breaks $97K as Institutions Pile In', source: 'CoinDesk', time: '2h ago', sentiment: 'bullish' },
    { title: 'Fed Signals Potential Rate Cut in Q1 2025', source: 'Bloomberg', time: '4h ago', sentiment: 'bullish' },
    { title: 'Ethereum ETF Sees Record Inflows', source: 'The Block', time: '6h ago', sentiment: 'bullish' },
    { title: 'NVIDIA Reports Strong AI Chip Demand', source: 'Reuters', time: '8h ago', sentiment: 'bullish' },
];

export default function PortfolioPage() {
    const [filter, setFilter] = useState<'all' | 'crypto' | 'stock'>('all');
    const [timeframe, setTimeframe] = useState('24h');

    const filteredPortfolio = filter === 'all'
        ? mockPortfolio
        : mockPortfolio.filter(a => a.type === filter);

    // Calculate totals
    const totalValue = mockPortfolio.reduce((sum, a) => sum + (a.amount * a.currentPrice), 0);
    const totalCost = mockPortfolio.reduce((sum, a) => sum + (a.amount * a.avgCost), 0);
    const totalGain = totalValue - totalCost;
    const totalGainPercent = ((totalValue - totalCost) / totalCost) * 100;

    const cryptoValue = mockPortfolio.filter(a => a.type === 'crypto').reduce((sum, a) => sum + (a.amount * a.currentPrice), 0);
    const stockValue = mockPortfolio.filter(a => a.type === 'stock').reduce((sum, a) => sum + (a.amount * a.currentPrice), 0);

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
                            <span className="text-gradient">Portfolio</span>
                        </h1>
                        <p className="text-gray-400">Track your crypto & stock investments in one place</p>
                    </motion.div>
                </div>
            </section>

            {/* Total Value Card */}
            <section className="container-main pb-8">
                <motion.div
                    className="glass-card relative overflow-hidden"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl"></div>
                    <div className="relative z-10">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                            <div>
                                <p className="text-gray-400 mb-1">Total Portfolio Value</p>
                                <h2 className="text-5xl font-bold">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h2>
                                <div className={`flex items-center gap-2 mt-2 ${totalGain >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    <span className="text-xl">{totalGain >= 0 ? '↑' : '↓'}</span>
                                    <span className="text-xl font-bold">
                                        ${Math.abs(totalGain).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </span>
                                    <span className="px-2 py-0.5 bg-green-500/20 rounded text-sm">
                                        {totalGain >= 0 ? '+' : ''}{totalGainPercent.toFixed(2)}%
                                    </span>
                                </div>
                            </div>

                            <div className="flex gap-6">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-orange-400">${cryptoValue.toLocaleString()}</div>
                                    <div className="text-sm text-gray-500">Crypto</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-400">${stockValue.toLocaleString()}</div>
                                    <div className="text-sm text-gray-500">Stocks</div>
                                </div>
                            </div>
                        </div>

                        {/* Timeframe */}
                        <div className="flex gap-2 mt-6">
                            {['24h', '7d', '30d', '1y', 'All'].map((tf) => (
                                <button
                                    key={tf}
                                    onClick={() => setTimeframe(tf)}
                                    className={`px-3 py-1 rounded text-sm ${timeframe === tf
                                            ? 'bg-cyan-500 text-black'
                                            : 'bg-white/10 hover:bg-white/20'
                                        }`}
                                >
                                    {tf}
                                </button>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </section>

            <div className="container-main pb-16 grid lg:grid-cols-3 gap-6">
                {/* Holdings */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Filter */}
                    <div className="flex gap-2">
                        {(['all', 'crypto', 'stock'] as const).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 rounded-lg text-sm ${filter === f
                                        ? 'bg-cyan-500 text-black font-medium'
                                        : 'bg-white/10 hover:bg-white/20'
                                    }`}
                            >
                                {f === 'all' ? '📊 All' : f === 'crypto' ? '₿ Crypto' : '📈 Stocks'}
                            </button>
                        ))}
                    </div>

                    {/* Holdings List */}
                    <motion.div
                        className="space-y-3"
                        initial="initial"
                        animate="animate"
                        variants={{ animate: { transition: { staggerChildren: 0.05 } } }}
                    >
                        {filteredPortfolio.map((asset) => {
                            const value = asset.amount * asset.currentPrice;
                            const cost = asset.amount * asset.avgCost;
                            const gain = value - cost;
                            const gainPercent = ((value - cost) / cost) * 100;

                            return (
                                <motion.div
                                    key={asset.symbol}
                                    className="glass-card flex items-center justify-between"
                                    variants={{ initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 } }}
                                >
                                    <div className="flex items-center gap-4">
                                        <span className="text-3xl">{asset.logo}</span>
                                        <div>
                                            <h3 className="font-bold">{asset.symbol}</h3>
                                            <p className="text-sm text-gray-500">{asset.name}</p>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <div className="font-bold">${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                                        <div className="text-sm text-gray-500">{asset.amount} @ ${asset.currentPrice.toLocaleString()}</div>
                                    </div>

                                    <div className={`text-right ${gain >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        <div className="font-bold">{gain >= 0 ? '+' : ''}{gainPercent.toFixed(2)}%</div>
                                        <div className="text-sm">${gain >= 0 ? '+' : ''}{gain.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>

                    {/* Add Asset CTA */}
                    <button className="w-full py-4 border-2 border-dashed border-gray-700 rounded-xl text-gray-500 hover:border-cyan-500 hover:text-cyan-400 transition-colors">
                        + Add Asset
                    </button>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Watchlist */}
                    <motion.div
                        className="glass-card"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h3 className="font-bold mb-4">👁️ Watchlist</h3>
                        <div className="space-y-3">
                            {watchlist.map((item) => (
                                <div key={item.symbol} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span>{item.logo}</span>
                                        <div>
                                            <div className="font-medium text-sm">{item.symbol}</div>
                                            <div className="text-xs text-gray-500">{item.name}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm">${item.price}</div>
                                        <div className={`text-xs ${item.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            {item.change >= 0 ? '+' : ''}{item.change}%
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* News */}
                    <motion.div
                        className="glass-card"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <h3 className="font-bold mb-4">📰 Market News</h3>
                        <div className="space-y-4">
                            {news.map((item, i) => (
                                <div key={i} className="border-b border-gray-700 pb-3 last:border-0 last:pb-0">
                                    <h4 className="text-sm font-medium mb-1 hover:text-cyan-400 cursor-pointer">
                                        {item.title}
                                    </h4>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <span>{item.source}</span>
                                        <span>•</span>
                                        <span>{item.time}</span>
                                        <span className={`px-1.5 py-0.5 rounded ${item.sentiment === 'bullish' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                            }`}>
                                            {item.sentiment}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Quick Links */}
                    <motion.div
                        className="glass-card"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h3 className="font-bold mb-4">🔗 Resources</h3>
                        <div className="space-y-2">
                            <a href="https://kubera.com" target="_blank" className="block px-3 py-2 bg-white/5 rounded hover:bg-white/10">
                                Kubera - Net Worth Tracker
                            </a>
                            <a href="https://coinmarketcap.com" target="_blank" className="block px-3 py-2 bg-white/5 rounded hover:bg-white/10">
                                CoinMarketCap
                            </a>
                            <a href="https://tradingview.com" target="_blank" className="block px-3 py-2 bg-white/5 rounded hover:bg-white/10">
                                TradingView Charts
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
