'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';

const articles = [
    {
        id: 1,
        title: 'How to Run Llama 3.1 70B on Your Local Machine',
        excerpt: 'A complete guide to running large language models locally with quantization techniques and optimal settings.',
        category: 'Tutorial',
        readTime: '8 min',
        date: 'Dec 4, 2024',
        image: '🦙',
        featured: true,
        author: 'Dunker007'
    },
    {
        id: 2,
        title: 'DeepSeek V3 vs Claude 3.5: The Ultimate Coding Comparison',
        excerpt: 'We tested both models on 50 real coding tasks. The results might surprise you.',
        category: 'Comparison',
        readTime: '12 min',
        date: 'Dec 3, 2024',
        image: '⚔️',
        featured: true,
        author: 'AI Research Team'
    },
    {
        id: 3,
        title: 'Building Trading Bots with Local LLMs',
        excerpt: 'How we integrated AI-powered analysis into our crypto trading automation.',
        category: 'Project',
        readTime: '15 min',
        date: 'Dec 2, 2024',
        image: '🤖',
        featured: false,
        author: 'Dunker007'
    },
    {
        id: 4,
        title: 'Gemini 2.0 Flash: First Impressions',
        excerpt: 'Google\'s new model promises 1M context. Does it deliver?',
        category: 'Review',
        readTime: '6 min',
        date: 'Dec 1, 2024',
        image: '✨',
        featured: false,
        author: 'Lux (AI)'
    },
    {
        id: 5,
        title: 'The Complete RAG Pipeline Guide',
        excerpt: 'From embeddings to retrieval, build production-ready RAG systems.',
        category: 'Tutorial',
        readTime: '20 min',
        date: 'Nov 30, 2024',
        image: '📚',
        featured: false,
        author: 'Guardian (AI)'
    },
    {
        id: 6,
        title: 'Why Local AI is the Future',
        excerpt: 'Privacy, cost savings, and no rate limits. The case for self-hosted AI.',
        category: 'Opinion',
        readTime: '5 min',
        date: 'Nov 28, 2024',
        image: '🏠',
        featured: false,
        author: 'Dunker007'
    },
    {
        id: 7,
        title: 'Setting Up Govee Lights with AI Voice Control',
        excerpt: 'Build a local voice assistant that controls your smart home.',
        category: 'Project',
        readTime: '10 min',
        date: 'Nov 25, 2024',
        image: '💡',
        featured: false,
        author: 'Dunker007'
    },
    {
        id: 8,
        title: 'Quantization Explained: GGUF, AWQ, and GPTQ',
        excerpt: 'Understanding model compression for faster local inference.',
        category: 'Technical',
        readTime: '14 min',
        date: 'Nov 22, 2024',
        image: '🔬',
        featured: false,
        author: 'AI Research Team'
    },
];

const categories = ['All', 'Tutorial', 'Comparison', 'Project', 'Review', 'Opinion', 'Technical'];

export default function BlogPage() {
    const [filter, setFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredArticles = articles.filter(a => {
        const matchesCategory = filter === 'All' || a.category === filter;
        const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const featuredArticles = articles.filter(a => a.featured);

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
                            <span className="text-gradient">Blog</span>
                        </h1>
                        <p className="text-gray-400">Tutorials, insights, and updates from the DLX Studio team</p>
                    </motion.div>
                </div>
            </section>

            {/* Featured */}
            <section className="container-main pb-8">
                <h2 className="text-xl font-bold mb-4">⭐ Featured</h2>
                <div className="grid md:grid-cols-2 gap-6">
                    {featuredArticles.map((article, i) => (
                        <motion.div
                            key={article.id}
                            className="glass-card group cursor-pointer relative overflow-hidden"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            whileHover={{ y: -5 }}
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 text-8xl opacity-10">
                                {article.image}
                            </div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded text-xs">
                                        {article.category}
                                    </span>
                                    <span className="text-gray-500 text-xs">{article.readTime}</span>
                                </div>
                                <h3 className="text-xl font-bold mb-2 group-hover:text-cyan-400 transition-colors">
                                    {article.title}
                                </h3>
                                <p className="text-gray-400 text-sm mb-4">{article.excerpt}</p>
                                <div className="flex items-center justify-between text-xs text-gray-500">
                                    <span>By {article.author}</span>
                                    <span>{article.date}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Filters */}
            <section className="container-main pb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <input
                        type="text"
                        placeholder="Search articles..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2"
                    />
                    <div className="flex gap-2 flex-wrap">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setFilter(cat)}
                                className={`px-4 py-2 rounded-lg text-sm ${filter === cat
                                    ? 'bg-cyan-500 text-black'
                                    : 'bg-white/10 hover:bg-white/20'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* All Articles */}
            <section className="container-main pb-16">
                <h2 className="text-xl font-bold mb-4">📰 All Articles</h2>
                <motion.div
                    className="space-y-4"
                    initial="initial"
                    animate="animate"
                    variants={{ animate: { transition: { staggerChildren: 0.03 } } }}
                >
                    {filteredArticles.map((article) => (
                        <motion.div
                            key={article.id}
                            className="glass-card flex items-center gap-4 cursor-pointer hover:ring-2 hover:ring-cyan-500/50 transition-all"
                            variants={{ initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 } }}
                        >
                            <span className="text-4xl">{article.image}</span>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="px-2 py-0.5 bg-white/10 rounded text-xs text-gray-400">
                                        {article.category}
                                    </span>
                                    <span className="text-gray-500 text-xs">{article.readTime}</span>
                                </div>
                                <h3 className="font-bold hover:text-cyan-400 transition-colors">
                                    {article.title}
                                </h3>
                                <p className="text-gray-500 text-sm hidden md:block">{article.excerpt}</p>
                            </div>
                            <div className="text-right text-xs text-gray-500 hidden md:block">
                                <div>{article.author}</div>
                                <div>{article.date}</div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </section>

            {/* Newsletter */}
            <section className="section-padding bg-[#050508]">
                <div className="container-main">
                    <motion.div
                        className="glass-card text-center py-8"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-2xl font-bold mb-2">📬 Stay Updated</h2>
                        <p className="text-gray-400 mb-4">Get the latest AI news and tutorials in your inbox</p>
                        <div className="flex gap-2 max-w-md mx-auto">
                            <input
                                type="email"
                                placeholder="your@email.com"
                                className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2"
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
