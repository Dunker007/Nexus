'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';

// Auto-generated lessons based on what's used in DLX Studio
const lessons = [
    // Git & GitHub
    {
        id: 'git-basics',
        title: 'Git & GitHub for Vibe Coders',
        category: 'Git',
        difficulty: 'beginner',
        duration: '15 min',
        icon: '🐙',
        description: 'Learn git without the command line terror. Visual explanations of commits, branches, and syncing.',
        topics: ['What is Git?', 'Saving your work (commits)', 'Branches explained', 'Push & Pull', 'Fixing mistakes'],
        completed: false,
        inProject: true
    },
    {
        id: 'git-workflow',
        title: 'Daily Git Workflow',
        category: 'Git',
        difficulty: 'beginner',
        duration: '10 min',
        icon: '🔄',
        description: 'A simple daily routine for saving and sharing your code.',
        topics: ['Morning sync', 'Saving changes often', 'End of day push', 'Working with others'],
        completed: false,
        inProject: true
    },
    // Next.js & React
    {
        id: 'nextjs-intro',
        title: 'Next.js 14 Fundamentals',
        category: 'Next.js',
        difficulty: 'intermediate',
        duration: '30 min',
        icon: '▲',
        description: 'The framework powering DLX Studio. Learn pages, routing, and server components.',
        topics: ['File-based routing', 'Server vs Client components', 'Layouts', 'Data fetching', 'API routes'],
        completed: true,
        inProject: true
    },
    {
        id: 'react-hooks',
        title: 'React Hooks Deep Dive',
        category: 'React',
        difficulty: 'intermediate',
        duration: '25 min',
        icon: '⚛️',
        description: 'useState, useEffect, and friends. Everything you need for interactive UIs.',
        topics: ['useState for data', 'useEffect for side effects', 'Custom hooks', 'useCallback & useMemo'],
        completed: false,
        inProject: true
    },
    // TypeScript
    {
        id: 'typescript-basics',
        title: 'TypeScript Essentials',
        category: 'TypeScript',
        difficulty: 'intermediate',
        duration: '20 min',
        icon: '💙',
        description: 'Type safety made simple. Catch bugs before they happen.',
        topics: ['Basic types', 'Interfaces', 'Type inference', 'Generics simplified', 'Type vs Interface'],
        completed: false,
        inProject: true
    },
    // Tailwind CSS
    {
        id: 'tailwind-mastery',
        title: 'Tailwind CSS Mastery',
        category: 'Styling',
        difficulty: 'beginner',
        duration: '20 min',
        icon: '🎨',
        description: 'Utility-first CSS. Build beautiful UIs without writing CSS files.',
        topics: ['Utility classes', 'Responsive design', 'Dark mode', 'Custom colors', 'Animations'],
        completed: true,
        inProject: true
    },
    // Framer Motion
    {
        id: 'framer-motion',
        title: 'Framer Motion Animations',
        category: 'Animation',
        difficulty: 'intermediate',
        duration: '25 min',
        icon: '🎬',
        description: 'Bring your UI to life with smooth animations and gestures.',
        topics: ['motion components', 'Initial/animate props', 'Variants', 'Gestures', 'AnimatePresence'],
        completed: false,
        inProject: true
    },
    // API & Backend
    {
        id: 'rest-api',
        title: 'REST APIs Explained',
        category: 'API',
        difficulty: 'intermediate',
        duration: '20 min',
        icon: '🔌',
        description: 'How the LuxRig Bridge communicates with your frontend.',
        topics: ['HTTP methods', 'JSON data', 'fetch() in JavaScript', 'Error handling', 'CORS'],
        completed: false,
        inProject: true
    },
    {
        id: 'websockets',
        title: 'Real-time with WebSockets',
        category: 'API',
        difficulty: 'advanced',
        duration: '25 min',
        icon: '🔴',
        description: 'How the live chat streaming works under the hood.',
        topics: ['WebSocket vs HTTP', 'Connection lifecycle', 'Streaming data', 'Reconnection handling'],
        completed: false,
        inProject: true
    },
    // AI/LLM
    {
        id: 'llm-basics',
        title: 'LLMs for Developers',
        category: 'AI',
        difficulty: 'beginner',
        duration: '20 min',
        icon: '🤖',
        description: 'Understanding how ChatGPT-like models work.',
        topics: ['What are LLMs?', 'Tokens explained', 'Context windows', 'Temperature & Top-P', 'Prompting basics'],
        completed: true,
        inProject: true
    },
    {
        id: 'local-llm',
        title: 'Running LLMs Locally',
        category: 'AI',
        difficulty: 'intermediate',
        duration: '30 min',
        icon: '🏠',
        description: 'LM Studio, Ollama, and self-hosted AI.',
        topics: ['Why local?', 'LM Studio setup', 'Ollama setup', 'Model formats (GGUF)', 'API endpoints'],
        completed: false,
        inProject: true
    },
    {
        id: 'prompt-engineering',
        title: 'Prompt Engineering 101',
        category: 'AI',
        difficulty: 'beginner',
        duration: '25 min',
        icon: '📝',
        description: 'Write prompts that get better results from AI.',
        topics: ['System prompts', 'Few-shot examples', 'Chain of thought', 'Role playing', 'Output formatting'],
        completed: false,
        inProject: true
    },
    // Smart Home
    {
        id: 'smart-home-apis',
        title: 'Smart Home Integration',
        category: 'IoT',
        difficulty: 'advanced',
        duration: '30 min',
        icon: '🏠',
        description: 'Connecting Govee, Reolink, and Google Home.',
        topics: ['API authentication', 'Device discovery', 'State management', 'Automations', 'Voice control'],
        completed: false,
        inProject: true
    },
    // Finance/Trading
    {
        id: 'trading-bots',
        title: 'Crypto Trading Bot Basics',
        category: 'Trading',
        difficulty: 'advanced',
        duration: '35 min',
        icon: '🤖',
        description: 'How automated trading works (3Commas style).',
        topics: ['Exchange APIs', 'Order types', 'Grid strategy', 'DCA strategy', 'Risk management'],
        completed: false,
        inProject: true
    },
    // Architecture Concepts
    {
        id: 'component-architecture',
        title: 'Component Architecture',
        category: 'Architecture',
        difficulty: 'intermediate',
        duration: '20 min',
        icon: '🏗️',
        description: 'Building reusable UI components the right way.',
        topics: ['Single responsibility', 'Props vs State', 'Composition', 'Container/Presentational', 'File structure'],
        completed: false,
        inProject: true
    },
    {
        id: 'state-management',
        title: 'State Management Patterns',
        category: 'Architecture',
        difficulty: 'advanced',
        duration: '25 min',
        icon: '🔄',
        description: 'Managing complex application state.',
        topics: ['Local vs Global state', 'Context API', 'When to use Redux', 'Server state', 'Optimistic updates'],
        completed: false,
        inProject: true
    },
];

const categories = ['All', 'Git', 'Next.js', 'React', 'TypeScript', 'Styling', 'Animation', 'API', 'AI', 'IoT', 'Trading', 'Architecture'];
const difficulties = ['all', 'beginner', 'intermediate', 'advanced'];

export default function LearnPage() {
    const [filter, setFilter] = useState('All');
    const [difficultyFilter, setDifficultyFilter] = useState('all');
    const [showInProjectOnly, setShowInProjectOnly] = useState(false);

    const filteredLessons = lessons.filter(lesson => {
        const matchesCategory = filter === 'All' || lesson.category === filter;
        const matchesDifficulty = difficultyFilter === 'all' || lesson.difficulty === difficultyFilter;
        const matchesInProject = !showInProjectOnly || lesson.inProject;
        return matchesCategory && matchesDifficulty && matchesInProject;
    });

    const completedCount = lessons.filter(l => l.completed).length;
    const totalDuration = lessons.reduce((sum, l) => sum + parseInt(l.duration), 0);

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
                            <span className="text-gradient">Learn</span>
                        </h1>
                        <p className="text-gray-400">
                            Auto-generated lessons based on technologies used in DLX Studio
                        </p>
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
                        <div className="text-3xl font-bold text-cyan-400">{lessons.length}</div>
                        <div className="text-sm text-gray-500">Lessons</div>
                    </motion.div>
                    <motion.div
                        className="glass-card text-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <div className="text-3xl font-bold text-green-400">{completedCount}</div>
                        <div className="text-sm text-gray-500">Completed</div>
                    </motion.div>
                    <motion.div
                        className="glass-card text-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="text-3xl font-bold text-purple-400">{totalDuration}</div>
                        <div className="text-sm text-gray-500">Total Minutes</div>
                    </motion.div>
                    <motion.div
                        className="glass-card text-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className="text-3xl font-bold text-yellow-400">{categories.length - 1}</div>
                        <div className="text-sm text-gray-500">Categories</div>
                    </motion.div>
                </div>
            </section>

            {/* Filters */}
            <section className="container-main pb-6">
                <div className="flex flex-col gap-4">
                    {/* Categories */}
                    <div className="flex gap-2 flex-wrap">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setFilter(cat)}
                                className={`px-3 py-1 rounded-full text-sm ${filter === cat
                                        ? 'bg-cyan-500 text-black'
                                        : 'bg-white/10 hover:bg-white/20'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Difficulty & Toggle */}
                    <div className="flex items-center gap-4">
                        <div className="flex gap-2">
                            {difficulties.map((d) => (
                                <button
                                    key={d}
                                    onClick={() => setDifficultyFilter(d)}
                                    className={`px-3 py-1 rounded text-sm ${difficultyFilter === d
                                            ? 'bg-purple-500 text-white'
                                            : 'bg-white/10 hover:bg-white/20'
                                        }`}
                                >
                                    {d === 'all' ? 'All Levels' : d.charAt(0).toUpperCase() + d.slice(1)}
                                </button>
                            ))}
                        </div>
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                            <input
                                type="checkbox"
                                checked={showInProjectOnly}
                                onChange={(e) => setShowInProjectOnly(e.target.checked)}
                                className="w-4 h-4 rounded"
                            />
                            Used in this project only
                        </label>
                    </div>
                </div>
            </section>

            {/* Lessons Grid */}
            <section className="container-main pb-16">
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    initial="initial"
                    animate="animate"
                    variants={{ animate: { transition: { staggerChildren: 0.03 } } }}
                >
                    {filteredLessons.map((lesson) => (
                        <motion.div
                            key={lesson.id}
                            className={`glass-card relative overflow-hidden ${lesson.completed ? 'ring-2 ring-green-500/50' : ''
                                }`}
                            variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }}
                        >
                            {/* Completed Badge */}
                            {lesson.completed && (
                                <div className="absolute top-4 right-4">
                                    <span className="text-green-400">✓</span>
                                </div>
                            )}

                            {/* Header */}
                            <div className="flex items-start gap-3 mb-4">
                                <span className="text-3xl">{lesson.icon}</span>
                                <div>
                                    <h3 className="font-bold">{lesson.title}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`text-xs px-2 py-0.5 rounded ${lesson.difficulty === 'beginner' ? 'bg-green-500/20 text-green-400' :
                                                lesson.difficulty === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                                                    'bg-red-500/20 text-red-400'
                                            }`}>
                                            {lesson.difficulty}
                                        </span>
                                        <span className="text-xs text-gray-500">{lesson.duration}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <p className="text-sm text-gray-400 mb-4">{lesson.description}</p>

                            {/* Topics */}
                            <div className="space-y-1 mb-4">
                                {lesson.topics.slice(0, 3).map((topic, i) => (
                                    <div key={i} className="flex items-center gap-2 text-sm">
                                        <span className="text-gray-500">•</span>
                                        <span className="text-gray-300">{topic}</span>
                                    </div>
                                ))}
                                {lesson.topics.length > 3 && (
                                    <div className="text-xs text-gray-500">
                                        +{lesson.topics.length - 3} more topics
                                    </div>
                                )}
                            </div>

                            {/* In Project Badge */}
                            {lesson.inProject && (
                                <div className="text-xs text-cyan-400 mb-4">
                                    ✨ Used in DLX Studio
                                </div>
                            )}

                            {/* Action */}
                            <button className={`w-full py-2 rounded-lg text-sm ${lesson.completed
                                    ? 'bg-green-500/20 text-green-400'
                                    : 'bg-cyan-500 text-black font-medium hover:bg-cyan-400'
                                }`}>
                                {lesson.completed ? '✓ Completed - Review' : 'Start Lesson'}
                            </button>
                        </motion.div>
                    ))}
                </motion.div>
            </section>

            {/* Getting Started */}
            <section className="section-padding bg-[#050508]">
                <div className="container-main">
                    <motion.div
                        className="glass-card py-8 text-center"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-2xl font-bold mb-2">🎯 Recommended Learning Path</h2>
                        <p className="text-gray-400 mb-6">Start here if you're new to the stack</p>
                        <div className="flex flex-wrap justify-center gap-3">
                            <span className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg">1. Git Basics</span>
                            <span className="text-gray-500">→</span>
                            <span className="px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg">2. Next.js Intro</span>
                            <span className="text-gray-500">→</span>
                            <span className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg">3. React Hooks</span>
                            <span className="text-gray-500">→</span>
                            <span className="px-4 py-2 bg-yellow-500/20 text-yellow-400 rounded-lg">4. LLMs for Devs</span>
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
