'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';

// AI-generated ideas based on our stack
const ideas = [
    {
        id: '1',
        title: 'Local LLM API Service',
        category: 'Micro SaaS',
        difficulty: 'medium',
        startup: '$0',
        monthlyPotential: '$200-800',
        weeklyEffort: '1-2h',
        description: 'Offer your LuxRig as an API endpoint for small devs who need affordable LLM access. Cheaper than OpenAI, more private.',
        requirements: ['LuxRig running 24/7', 'Domain + SSL', 'Basic auth system'],
        fitScore: 95,
        stack: ['Node.js', 'LM Studio API', 'Stripe'],
        status: 'ready',
    },
    {
        id: '2',
        title: 'AI-Powered Blog Network',
        category: 'Content',
        difficulty: 'low',
        startup: '$0-20',
        monthlyPotential: '$100-500',
        weeklyEffort: '30min',
        description: 'Use your local LLMs to generate SEO content. Monetize with ads + affiliates. 100% automated after setup.',
        requirements: ['WordPress or Next.js', 'AI content pipeline', 'AdSense account'],
        fitScore: 92,
        stack: ['Next.js', 'Local LLM', 'Vercel'],
        status: 'ready',
    },
    {
        id: '3',
        title: 'Custom GPT Marketplace',
        category: 'Digital Products',
        difficulty: 'easy',
        startup: '$0',
        monthlyPotential: '$50-300',
        weeklyEffort: '1h',
        description: 'Create and sell custom GPTs on ChatGPT marketplace. Use your prompt engineering skills.',
        requirements: ['ChatGPT Plus', 'Prompt engineering', 'Marketing'],
        fitScore: 88,
        stack: ['OpenAI GPTs', 'Marketing'],
        status: 'ready',
    },
    {
        id: '4',
        title: 'AI Social Media Manager',
        category: 'Automation Services',
        difficulty: 'medium',
        startup: '$0-30',
        monthlyPotential: '$300-1000',
        weeklyEffort: '2h',
        description: 'Offer AI-powered social media management. Generate content, schedule, analyze with your LLMs.',
        requirements: ['Social APIs', 'Content generation', 'Client outreach'],
        fitScore: 85,
        stack: ['n8n', 'Local LLM', 'Buffer/Hootsuite'],
        status: 'ready',
    },
    {
        id: '5',
        title: 'POD Design Generator',
        category: 'Print on Demand',
        difficulty: 'easy',
        startup: '$0',
        monthlyPotential: '$50-200',
        weeklyEffort: '30min',
        description: 'Use AI to generate unique designs for Printful/Redbubble. Zero inventory, passive once listed.',
        requirements: ['Image generation', 'Printful account', 'Etsy/Redbubble store'],
        fitScore: 82,
        stack: ['DALL-E/Midjourney', 'Printful', 'Etsy'],
        status: 'ready',
    },
    {
        id: '6',
        title: 'Prompt Template Store',
        category: 'Digital Products',
        difficulty: 'easy',
        startup: '$0',
        monthlyPotential: '$30-200',
        weeklyEffort: '1h',
        description: 'Sell prompt templates on Gumroad/Etsy. Package your best prompts with examples.',
        requirements: ['Prompt expertise', 'PDF design', 'Gumroad account'],
        fitScore: 80,
        stack: ['Gumroad', 'Canva', 'Local LLM'],
        status: 'ready',
    },
    {
        id: '7',
        title: 'AI Newsletter (Paid)',
        category: 'Content',
        difficulty: 'medium',
        startup: '$0-20',
        monthlyPotential: '$100-1000',
        weeklyEffort: '2h',
        description: 'Weekly AI-curated newsletter with insights. Free tier + paid for premium content.',
        requirements: ['Beehiiv/Substack', 'Content curation', 'Audience building'],
        fitScore: 78,
        stack: ['Beehiiv', 'Local LLM', 'Twitter'],
        status: 'ready',
    },
    {
        id: '8',
        title: 'Notion Template Store',
        category: 'Digital Products',
        difficulty: 'easy',
        startup: '$0',
        monthlyPotential: '$50-300',
        weeklyEffort: '1h',
        description: 'Create and sell Notion templates. Use AI to enhance templates with automations.',
        requirements: ['Notion expertise', 'Gumroad account', 'Marketing'],
        fitScore: 75,
        stack: ['Notion', 'Gumroad', 'Twitter'],
        status: 'ready',
    },
];

const filters = {
    category: ['All', 'Micro SaaS', 'Content', 'Digital Products', 'Print on Demand', 'Automation Services'],
    difficulty: ['all', 'easy', 'medium', 'hard'],
    effort: ['all', 'minimal', 'low', 'medium'],
};

export default function IdeasPage() {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedDifficulty, setSelectedDifficulty] = useState('all');
    const [sortBy, setSortBy] = useState<'fitScore' | 'potential'>('fitScore');

    const filteredIdeas = ideas
        .filter(idea => selectedCategory === 'All' || idea.category === selectedCategory)
        .filter(idea => selectedDifficulty === 'all' || idea.difficulty === selectedDifficulty)
        .sort((a, b) => sortBy === 'fitScore' ? b.fitScore - a.fitScore : 0);

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
                            <span className="text-gradient">💡 Idea Generator</span>
                        </h1>
                        <p className="text-gray-400">
                            AI-curated opportunities that match your stack and budget
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Filters */}
            <section className="container-main pb-6">
                <div className="flex flex-wrap gap-4">
                    <div>
                        <span className="text-xs text-gray-500 block mb-1">Category</span>
                        <div className="flex gap-1 flex-wrap">
                            {filters.category.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-3 py-1 rounded text-xs ${selectedCategory === cat ? 'bg-cyan-500 text-black' : 'bg-white/10'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <span className="text-xs text-gray-500 block mb-1">Difficulty</span>
                        <div className="flex gap-1">
                            {filters.difficulty.map((d) => (
                                <button
                                    key={d}
                                    onClick={() => setSelectedDifficulty(d)}
                                    className={`px-3 py-1 rounded text-xs ${selectedDifficulty === d ? 'bg-purple-500 text-white' : 'bg-white/10'
                                        }`}
                                >
                                    {d === 'all' ? 'All' : d}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="ml-auto">
                        <span className="text-xs text-gray-500 block mb-1">Sort by</span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as 'fitScore' | 'potential')}
                            className="bg-white/10 rounded px-2 py-1 text-sm"
                        >
                            <option value="fitScore">Best Fit</option>
                            <option value="potential">Highest Potential</option>
                        </select>
                    </div>
                </div>
            </section>

            {/* Ideas Grid */}
            <section className="container-main pb-16">
                <motion.div
                    className="grid md:grid-cols-2 gap-6"
                    initial="initial"
                    animate="animate"
                    variants={{ animate: { transition: { staggerChildren: 0.05 } } }}
                >
                    {filteredIdeas.map((idea) => (
                        <motion.div
                            key={idea.id}
                            className="glass-card overflow-hidden"
                            variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }}
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-bold">{idea.title}</h3>
                                    <div className="flex gap-2 mt-1">
                                        <span className="text-xs px-2 py-0.5 bg-white/10 rounded">{idea.category}</span>
                                        <span className={`text-xs px-2 py-0.5 rounded ${idea.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
                                                idea.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                                    'bg-red-500/20 text-red-400'
                                            }`}>{idea.difficulty}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-cyan-400">{idea.fitScore}%</div>
                                    <div className="text-xs text-gray-500">Fit Score</div>
                                </div>
                            </div>

                            {/* Description */}
                            <p className="text-sm text-gray-400 mb-4">{idea.description}</p>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                                <div className="bg-white/5 rounded-lg p-2">
                                    <div className="text-green-400 font-bold">{idea.monthlyPotential}</div>
                                    <div className="text-xs text-gray-500">Monthly</div>
                                </div>
                                <div className="bg-white/5 rounded-lg p-2">
                                    <div className="font-bold">{idea.startup}</div>
                                    <div className="text-xs text-gray-500">Startup</div>
                                </div>
                                <div className="bg-white/5 rounded-lg p-2">
                                    <div className="font-bold">{idea.weeklyEffort}</div>
                                    <div className="text-xs text-gray-500">Weekly</div>
                                </div>
                            </div>

                            {/* Requirements */}
                            <div className="mb-4">
                                <div className="text-xs text-gray-500 mb-1">Requirements:</div>
                                <div className="flex flex-wrap gap-1">
                                    {idea.requirements.map((req, i) => (
                                        <span key={i} className="text-xs px-2 py-0.5 bg-green-500/10 text-green-400 rounded">
                                            ✓ {req}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Stack */}
                            <div className="mb-4">
                                <div className="text-xs text-gray-500 mb-1">Tech Stack:</div>
                                <div className="flex flex-wrap gap-1">
                                    {idea.stack.map((tech, i) => (
                                        <span key={i} className="text-xs px-2 py-0.5 bg-purple-500/10 text-purple-400 rounded">
                                            {tech}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                                <button className="flex-1 py-2 bg-cyan-500 text-black rounded-lg font-medium text-sm">
                                    📋 View Full Plan
                                </button>
                                <button className="px-4 py-2 bg-white/10 rounded-lg text-sm">
                                    ⭐
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </section>

            {/* Generate More */}
            <section className="section-padding bg-[#050508]">
                <div className="container-main text-center">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-2xl font-bold mb-4">🤖 Want More Ideas?</h2>
                        <p className="text-gray-400 mb-6">Tell the AI what you're looking for</p>
                        <div className="max-w-md mx-auto">
                            <textarea
                                placeholder="e.g., I have 2 hours/week, $0 budget, and I'm good at writing..."
                                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 h-24 resize-none mb-4"
                            />
                            <button className="btn-primary w-full">
                                Generate Custom Ideas ✨
                            </button>
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
