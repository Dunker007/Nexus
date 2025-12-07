'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';

// Vetted, real opportunities
const opportunities = [
    {
        id: '1',
        name: 'Honeygain',
        category: 'Idle Computing',
        type: 'Bandwidth Sharing',
        monthlyEarning: '$15-30',
        effort: 'None',
        startup: '$0',
        payout: '$20 min',
        rating: 4.2,
        verified: true,
        pros: ['Truly passive', 'Works on multiple devices', 'JumpTask option'],
        cons: ['Low earnings', 'Uses bandwidth', 'Slow payout'],
        url: 'honeygain.com',
    },
    {
        id: '2',
        name: 'Pawns.app',
        category: 'Idle Computing',
        type: 'Bandwidth + Surveys',
        monthlyEarning: '$10-25',
        effort: 'Minimal',
        startup: '$0',
        payout: '$5 min',
        rating: 4.0,
        verified: true,
        pros: ['Low payout threshold', 'Multiple earning methods', 'Fast payments'],
        cons: ['Lower rates', 'Surveys optional', 'VPN blocks'],
        url: 'pawns.app',
    },
    {
        id: '3',
        name: 'Printful',
        category: 'Print on Demand',
        type: 'POD Platform',
        monthlyEarning: '$50-500+',
        effort: 'Low',
        startup: '$0',
        payout: 'Per sale',
        rating: 4.5,
        verified: true,
        pros: ['Zero inventory', 'Quality products', 'Etsy integration'],
        cons: ['Lower margins', 'Need design skills', 'Customer service'],
        url: 'printful.com',
    },
    {
        id: '4',
        name: 'Beehiiv',
        category: 'Content',
        type: 'Newsletter Platform',
        monthlyEarning: '$0-1000+',
        effort: 'Medium',
        startup: '$0',
        payout: 'Stripe',
        rating: 4.7,
        verified: true,
        pros: ['Free tier generous', 'Great analytics', 'Monetization built-in'],
        cons: ['Need audience', 'Consistent content', 'Competition'],
        url: 'beehiiv.com',
    },
    {
        id: '5',
        name: 'Gumroad',
        category: 'Digital Products',
        type: 'Selling Platform',
        monthlyEarning: '$50-2000+',
        effort: 'Low',
        startup: '$0',
        payout: 'Weekly',
        rating: 4.4,
        verified: true,
        pros: ['No upfront cost', 'Easy setup', 'Good for templates'],
        cons: ['10% fee', 'Marketing needed', 'Saturated markets'],
        url: 'gumroad.com',
    },
    {
        id: '6',
        name: 'Substack',
        category: 'Content',
        type: 'Newsletter Platform',
        monthlyEarning: '$0-5000+',
        effort: 'Medium',
        startup: '$0',
        payout: 'Stripe',
        rating: 4.6,
        verified: true,
        pros: ['Built-in audience', 'Simple setup', 'Community features'],
        cons: ['10% fee', 'Less customization', 'Need audience'],
        url: 'substack.com',
    },
];

// Time wasters to avoid
const timeWasters = [
    { name: 'Survey Sites', reason: 'Pays $1-3/hour at best. Not worth your time.' },
    { name: 'Get Paid to Watch Ads', reason: 'Pennies per hour. Pure time waste.' },
    { name: 'Click Farms', reason: 'Against ToS, accounts get banned. Risky.' },
    { name: 'MLM/Network Marketing', reason: 'You are the product. 99% lose money.' },
    { name: 'Paid Reviews', reason: 'Often against platform ToS. Account risk.' },
    { name: 'Data Entry on Fiverr', reason: 'Race to the bottom. $2/hour if lucky.' },
];

export default function OpportunitiesPage() {
    const [filter, setFilter] = useState('All');
    const categories = ['All', ...new Set(opportunities.map(o => o.category))];

    const filtered = filter === 'All' ? opportunities : opportunities.filter(o => o.category === filter);

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
                            <span className="text-gradient">🎯 Opportunities</span>
                        </h1>
                        <p className="text-gray-400">
                            Vetted platforms and services • No scams • Real potential
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Filters */}
            <section className="container-main pb-6">
                <div className="flex gap-2 flex-wrap">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setFilter(cat)}
                            className={`px-4 py-2 rounded-lg text-sm ${filter === cat ? 'bg-cyan-500 text-black' : 'bg-white/10'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </section>

            {/* Opportunities Grid */}
            <section className="container-main pb-12">
                <motion.div
                    className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                    initial="initial"
                    animate="animate"
                    variants={{ animate: { transition: { staggerChildren: 0.05 } } }}
                >
                    {filtered.map((opp) => (
                        <motion.div
                            key={opp.id}
                            className="glass-card"
                            variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }}
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-lg">{opp.name}</h3>
                                        {opp.verified && <span className="text-green-400 text-sm">✓</span>}
                                    </div>
                                    <div className="flex gap-2 mt-1">
                                        <span className="text-xs px-2 py-0.5 bg-white/10 rounded">{opp.category}</span>
                                        <span className="text-xs px-2 py-0.5 bg-white/10 rounded">{opp.type}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-yellow-400">{'⭐'.repeat(Math.floor(opp.rating))}</div>
                                    <div className="text-xs text-gray-500">{opp.rating}/5</div>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                                <div className="bg-white/5 rounded p-2">
                                    <div className="text-green-400 font-bold">{opp.monthlyEarning}</div>
                                    <div className="text-xs text-gray-500">Monthly</div>
                                </div>
                                <div className="bg-white/5 rounded p-2">
                                    <div className="font-bold">{opp.effort}</div>
                                    <div className="text-xs text-gray-500">Effort</div>
                                </div>
                            </div>

                            {/* Pros */}
                            <div className="mb-3">
                                <div className="text-xs text-green-400 mb-1">Pros:</div>
                                <div className="space-y-1">
                                    {opp.pros.map((pro, i) => (
                                        <div key={i} className="text-xs flex items-center gap-1">
                                            <span className="text-green-400">+</span> {pro}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Cons */}
                            <div className="mb-4">
                                <div className="text-xs text-red-400 mb-1">Cons:</div>
                                <div className="space-y-1">
                                    {opp.cons.map((con, i) => (
                                        <div key={i} className="text-xs flex items-center gap-1">
                                            <span className="text-red-400">-</span> {con}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Action */}
                            <div className="flex gap-2">
                                <a
                                    href={`https://${opp.url}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 py-2 bg-cyan-500 text-black rounded-lg font-medium text-sm text-center"
                                >
                                    Visit Site →
                                </a>
                                <button className="px-4 py-2 bg-white/10 rounded-lg text-sm">
                                    📋
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </section>

            {/* Time Wasters */}
            <section className="section-padding bg-[#050508]">
                <div className="container-main">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-2xl font-bold mb-4 text-red-400">🚫 Time Wasters to Avoid</h2>
                        <p className="text-gray-400 mb-6">We've filtered these out so you don't have to</p>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {timeWasters.map((tw, i) => (
                                <div key={i} className="glass-card bg-red-500/5 border border-red-500/20">
                                    <h3 className="font-bold text-red-400">{tw.name}</h3>
                                    <p className="text-sm text-gray-400 mt-1">{tw.reason}</p>
                                </div>
                            ))}
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
