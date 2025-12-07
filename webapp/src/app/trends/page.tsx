'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';

// Curated AI trends and news (would be fetched from API in production)
const trends = [
    {
        id: '1',
        category: 'Model Release',
        title: 'Google Gemini 2.0 Flash Available',
        summary: 'Gemini 2.0 Flash now available with 1M token context, multimodal support, and free API tier.',
        source: 'Google AI',
        date: 'Dec 2024',
        hot: true,
        link: 'https://ai.google.dev',
        tags: ['Google', 'Multimodal', 'Free Tier']
    },
    {
        id: '2',
        category: 'Breakthrough',
        title: 'Claude 3.5 Sonnet Dominates Coding Benchmarks',
        summary: 'Anthropic\'s Claude 3.5 Sonnet now leads most coding benchmarks, beating GPT-4 Turbo on SWE-bench.',
        source: 'Anthropic',
        date: 'Nov 2024',
        hot: true,
        link: 'https://anthropic.com',
        tags: ['Claude', 'Coding', 'Benchmarks']
    },
    {
        id: '3',
        category: 'Open Source',
        title: 'Llama 3.1 405B Goes Open',
        summary: 'Meta releases Llama 3.1 405B, the largest open-source LLM, matching GPT-4 on many benchmarks.',
        source: 'Meta AI',
        date: 'Jul 2024',
        hot: false,
        link: 'https://llama.meta.com',
        tags: ['Llama', 'Open Source', '405B']
    },
    {
        id: '4',
        category: 'Tool',
        title: 'Cursor AI Editor Raises $60M',
        summary: 'The AI-first code editor Cursor raises Series A, claims 40% of YC companies are using it.',
        source: 'TechCrunch',
        date: 'Dec 2024',
        hot: true,
        link: 'https://cursor.sh',
        tags: ['IDE', 'Vibe Coding', 'Funding']
    },
    {
        id: '5',
        category: 'Research',
        title: 'Chain-of-Thought Prompting Gets Better',
        summary: 'New research shows structured CoT with examples dramatically improves reasoning tasks.',
        source: 'ArXiv',
        date: 'Nov 2024',
        hot: false,
        link: 'https://arxiv.org',
        tags: ['Prompting', 'Research', 'Reasoning']
    },
    {
        id: '6',
        category: 'Local AI',
        title: 'LM Studio Hits 10M Downloads',
        summary: 'The popular local LLM interface reaches 10 million downloads, launches team features.',
        source: 'LM Studio',
        date: 'Dec 2024',
        hot: true,
        link: 'https://lmstudio.ai',
        tags: ['Local AI', 'LM Studio', 'Privacy']
    },
    {
        id: '7',
        category: 'Enterprise',
        title: 'OpenAI Launches ChatGPT Pro at $200/month',
        summary: 'New pro tier includes unlimited access to o1 and o1 pro mode for complex reasoning tasks.',
        source: 'OpenAI',
        date: 'Dec 2024',
        hot: false,
        link: 'https://openai.com',
        tags: ['OpenAI', 'Enterprise', 'o1']
    },
    {
        id: '8',
        category: 'Regulation',
        title: 'EU AI Act Takes Effect 2026',
        summary: 'First comprehensive AI regulation requires transparency, safety testing, and human oversight.',
        source: 'EU Commission',
        date: 'Coming 2026',
        hot: false,
        link: 'https://ec.europa.eu',
        tags: ['Regulation', 'EU', 'Governance']
    },
];

const industryBuzz = [
    { term: 'Agentic AI', mentions: 4500, trend: 'up' },
    { term: 'Vibe Coding', mentions: 2800, trend: 'up' },
    { term: 'RAG', mentions: 2300, trend: 'stable' },
    { term: 'Fine-tuning', mentions: 1900, trend: 'down' },
    { term: 'MoE', mentions: 1600, trend: 'up' },
    { term: 'Multimodal', mentions: 3200, trend: 'up' },
];

const weeklyPicks = [
    {
        title: 'Best Free Model',
        pick: 'Gemini 2.0 Flash',
        reason: 'Free API, 1M context, multimodal',
        icon: '🏆'
    },
    {
        title: 'Best Local Model',
        pick: 'Qwen2.5-Coder 14B',
        reason: 'Runs on consumer GPUs, great at code',
        icon: '💻'
    },
    {
        title: 'Best for Agents',
        pick: 'Claude 3.5 Sonnet',
        reason: 'Tool use, reasoning, reliability',
        icon: '🤖'
    },
    {
        title: 'Rising Star',
        pick: 'DeepSeek V3',
        reason: 'Chinese lab making waves',
        icon: '⭐'
    },
];

const categoryColors: Record<string, string> = {
    'Model Release': 'bg-cyan-500/20 text-cyan-400',
    'Breakthrough': 'bg-green-500/20 text-green-400',
    'Open Source': 'bg-purple-500/20 text-purple-400',
    'Tool': 'bg-yellow-500/20 text-yellow-400',
    'Research': 'bg-blue-500/20 text-blue-400',
    'Local AI': 'bg-pink-500/20 text-pink-400',
    'Enterprise': 'bg-orange-500/20 text-orange-400',
    'Regulation': 'bg-red-500/20 text-red-400',
};

export default function TrendsPage() {
    const [filter, setFilter] = useState<string>('all');

    const categories = ['all', ...new Set(trends.map(t => t.category))];
    const filteredTrends = filter === 'all' ? trends : trends.filter(t => t.category === filter);

    return (
        <div className="min-h-screen pt-8">
            {/* Header */}
            <section className="section-padding pb-12">
                <div className="container-main">
                    <motion.div
                        className="text-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 mb-6">
                            <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></span>
                            <span className="text-cyan-400 text-sm font-medium">LIVE PULSE</span>
                        </div>

                        <h1 className="text-5xl md:text-6xl font-bold mb-4">
                            AI <span className="text-gradient">Trends</span>
                        </h1>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                            What's hot in AI right now. Model releases, research breakthroughs,
                            and industry buzz — curated for builders.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Industry Buzz */}
            <section className="container-main pb-12">
                <h2 className="text-xl font-bold mb-4">📊 Industry Buzz</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {industryBuzz.map((item) => (
                        <motion.div
                            key={item.term}
                            className="glass-card text-center py-4"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <div className="font-bold text-cyan-400">{item.term}</div>
                            <div className="text-sm text-gray-400">{item.mentions.toLocaleString()} mentions</div>
                            <div className={`text-xs mt-1 ${item.trend === 'up' ? 'text-green-400' :
                                    item.trend === 'down' ? 'text-red-400' : 'text-yellow-400'
                                }`}>
                                {item.trend === 'up' ? '↗ Trending' : item.trend === 'down' ? '↘ Cooling' : '→ Stable'}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Weekly Picks */}
            <section className="container-main pb-12">
                <h2 className="text-xl font-bold mb-4">🎯 This Week's Picks</h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {weeklyPicks.map((pick) => (
                        <motion.div
                            key={pick.title}
                            className="glass-card"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <div className="text-2xl mb-2">{pick.icon}</div>
                            <div className="text-sm text-gray-400 mb-1">{pick.title}</div>
                            <div className="font-bold text-lg text-cyan-400 mb-1">{pick.pick}</div>
                            <div className="text-xs text-gray-500">{pick.reason}</div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Filter */}
            <section className="container-main pb-8">
                <div className="flex gap-2 flex-wrap">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setFilter(cat)}
                            className={`px-4 py-2 rounded-lg text-sm transition-all ${filter === cat
                                    ? 'bg-cyan-500 text-black font-medium'
                                    : 'bg-white/10 text-white hover:bg-white/20'
                                }`}
                        >
                            {cat === 'all' ? 'All' : cat}
                        </button>
                    ))}
                </div>
            </section>

            {/* Trends Grid */}
            <section className="container-main pb-16">
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    initial="initial"
                    animate="animate"
                    variants={{ animate: { transition: { staggerChildren: 0.05 } } }}
                >
                    {filteredTrends.map((trend) => (
                        <motion.a
                            key={trend.id}
                            href={trend.link}
                            target="_blank"
                            className="glass-card group relative overflow-hidden"
                            variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }}
                            whileHover={{ y: -5 }}
                        >
                            {trend.hot && (
                                <div className="absolute top-4 right-4">
                                    <span className="px-2 py-1 bg-red-500/20 border border-red-500/30 rounded-full text-xs text-red-400 animate-pulse">
                                        🔥 HOT
                                    </span>
                                </div>
                            )}

                            <div className="flex items-start gap-4">
                                <div className="flex-1">
                                    <span className={`inline-block px-2 py-1 rounded text-xs mb-3 ${categoryColors[trend.category] || 'bg-white/10 text-white'}`}>
                                        {trend.category}
                                    </span>

                                    <h3 className="text-xl font-bold mb-2 group-hover:text-cyan-400 transition-colors pr-16">
                                        {trend.title}
                                    </h3>

                                    <p className="text-gray-400 mb-4">{trend.summary}</p>

                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {trend.tags.map((tag) => (
                                            <span key={tag} className="px-2 py-1 bg-white/5 rounded text-xs text-gray-400">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                        <span>{trend.source}</span>
                                        <span>•</span>
                                        <span>{trend.date}</span>
                                    </div>
                                </div>
                            </div>
                        </motion.a>
                    ))}
                </motion.div>
            </section>

            {/* Subscribe CTA */}
            <section className="section-padding bg-[#050508]">
                <div className="container-main">
                    <motion.div
                        className="glass-card text-center py-12"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
                        <p className="text-gray-400 mb-6">
                            Get weekly AI trends delivered to your inbox. No spam, just signal.
                        </p>
                        <div className="flex gap-4 justify-center max-w-md mx-auto">
                            <input
                                type="email"
                                placeholder="your@email.com"
                                className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-500"
                            />
                            <button className="btn-primary">Subscribe</button>
                        </div>
                    </motion.div>
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
