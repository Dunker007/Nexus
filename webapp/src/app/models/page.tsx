'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';

const models = [
    {
        id: 'gpt-4o',
        name: 'GPT-4o',
        provider: 'OpenAI',
        icon: '🤖',
        type: 'cloud',
        size: 'Unknown',
        context: '128K',
        speed: '~100 tok/s',
        strengths: ['Most capable', 'Fast', 'Multimodal'],
        best_for: 'General purpose, creative tasks',
        cost: '$5/1M input',
        rating: 4.8,
        category: 'Flagship'
    },
    {
        id: 'claude-3.5-sonnet',
        name: 'Claude 3.5 Sonnet',
        provider: 'Anthropic',
        icon: '🧠',
        type: 'cloud',
        size: 'Unknown',
        context: '200K',
        speed: '~80 tok/s',
        strengths: ['Best at coding', 'Long context', 'Artifacts'],
        best_for: 'Coding, analysis, long documents',
        cost: '$3/1M input',
        rating: 4.9,
        category: 'Flagship'
    },
    {
        id: 'gemini-2.0-flash',
        name: 'Gemini 2.0 Flash',
        provider: 'Google',
        icon: '✨',
        type: 'cloud',
        size: 'Unknown',
        context: '1M (!!)',
        speed: '~150 tok/s',
        strengths: ['1M context', 'Fast', 'Free tier'],
        best_for: 'Long documents, budget-conscious',
        cost: 'Free tier',
        rating: 4.5,
        category: 'Flagship'
    },
    {
        id: 'llama-3.1-70b',
        name: 'Llama 3.1 70B',
        provider: 'Meta',
        icon: '🦙',
        type: 'local',
        size: '40GB',
        context: '128K',
        speed: '~15 tok/s',
        strengths: ['Open source', 'Self-hosted', 'No API costs'],
        best_for: 'Privacy, self-hosting',
        cost: 'Free',
        rating: 4.6,
        category: 'Open Source'
    },
    {
        id: 'llama-3.1-8b',
        name: 'Llama 3.1 8B',
        provider: 'Meta',
        icon: '🦙',
        type: 'local',
        size: '4.7GB',
        context: '128K',
        speed: '~50 tok/s',
        strengths: ['Fast', 'Low VRAM', 'Good quality'],
        best_for: 'Consumer GPUs, quick tasks',
        cost: 'Free',
        rating: 4.3,
        category: 'Open Source'
    },
    {
        id: 'qwen2.5-coder-14b',
        name: 'Qwen2.5-Coder 14B',
        provider: 'Alibaba',
        icon: '💻',
        type: 'local',
        size: '8GB',
        context: '32K',
        speed: '~30 tok/s',
        strengths: ['Great at code', 'Efficient', 'Instruction-tuned'],
        best_for: 'Coding, local development',
        cost: 'Free',
        rating: 4.4,
        category: 'Specialized'
    },
    {
        id: 'deepseek-v3',
        name: 'DeepSeek V3',
        provider: 'DeepSeek',
        icon: '🔍',
        type: 'cloud',
        size: 'Unknown',
        context: '64K',
        speed: '~100 tok/s',
        strengths: ['Very cheap', 'Good quality', 'MoE'],
        best_for: 'Budget-conscious, high volume',
        cost: '$0.14/1M',
        rating: 4.4,
        category: 'Budget'
    },
    {
        id: 'mixtral-8x7b',
        name: 'Mixtral 8x7B',
        provider: 'Mistral',
        icon: '🌀',
        type: 'local',
        size: '26GB',
        context: '32K',
        speed: '~25 tok/s',
        strengths: ['MoE efficiency', 'Multilingual', 'Open'],
        best_for: 'Balanced performance',
        cost: 'Free',
        rating: 4.2,
        category: 'Open Source'
    },
    {
        id: 'gemma-2-9b',
        name: 'Gemma 2 9B',
        provider: 'Google',
        icon: '💎',
        type: 'local',
        size: '5.4GB',
        context: '8K',
        speed: '~45 tok/s',
        strengths: ['Small', 'Fast', 'Quality'],
        best_for: 'Consumer hardware, quick inference',
        cost: 'Free',
        rating: 4.1,
        category: 'Lightweight'
    },
    {
        id: 'phi-3-medium',
        name: 'Phi-3 Medium',
        provider: 'Microsoft',
        icon: '🔬',
        type: 'local',
        size: '7.8GB',
        context: '128K',
        speed: '~40 tok/s',
        strengths: ['Long context', 'Efficient', 'Reasoning'],
        best_for: 'Document analysis, research',
        cost: 'Free',
        rating: 4.0,
        category: 'Lightweight'
    },
    {
        id: 'command-r',
        name: 'Command R+',
        provider: 'Cohere',
        icon: '⚡',
        type: 'cloud',
        size: 'Unknown',
        context: '128K',
        speed: '~80 tok/s',
        strengths: ['RAG optimized', 'Tool use', 'Enterprise'],
        best_for: 'Enterprise RAG, search',
        cost: '$2.50/1M',
        rating: 4.3,
        category: 'Specialized'
    },
    {
        id: 'wizardlm-2-8x22b',
        name: 'WizardLM-2 8x22B',
        provider: 'Microsoft',
        icon: '🧙',
        type: 'local',
        size: '80GB',
        context: '64K',
        speed: '~10 tok/s',
        strengths: ['Huge capacity', 'Reasoning', 'Code'],
        best_for: 'Complex reasoning, multi-GPU',
        cost: 'Free',
        rating: 4.5,
        category: 'Heavy'
    },
];

const categories = ['All', 'Flagship', 'Open Source', 'Lightweight', 'Specialized', 'Budget', 'Heavy'];

export default function ModelsPage() {
    const [filter, setFilter] = useState('All');
    const [typeFilter, setTypeFilter] = useState<'all' | 'local' | 'cloud'>('all');
    const [sortBy, setSortBy] = useState<'rating' | 'size' | 'speed'>('rating');
    const [searchQuery, setSearchQuery] = useState('');

    let filteredModels = models.filter(m => {
        const matchesCategory = filter === 'All' || m.category === filter;
        const matchesType = typeFilter === 'all' || m.type === typeFilter;
        const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.provider.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesType && matchesSearch;
    });

    // Simple sort
    filteredModels = [...filteredModels].sort((a, b) => {
        if (sortBy === 'rating') return b.rating - a.rating;
        return 0;
    });

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
                        <h1 className="text-5xl md:text-6xl font-bold mb-4">
                            Model <span className="text-gradient">Explorer</span>
                        </h1>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                            Compare {models.length} AI models. Find the perfect one for your use case.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Filters */}
            <section className="container-main pb-8">
                <div className="glass-card">
                    <div className="flex flex-wrap gap-4">
                        {/* Search */}
                        <input
                            type="text"
                            placeholder="Search models..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1 min-w-[200px] bg-white/10 border border-white/20 rounded-lg px-4 py-2"
                        />

                        {/* Type */}
                        <div className="flex gap-2">
                            {(['all', 'local', 'cloud'] as const).map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setTypeFilter(type)}
                                    className={`px-4 py-2 rounded-lg text-sm ${typeFilter === type
                                            ? 'bg-cyan-500 text-black'
                                            : 'bg-white/10 hover:bg-white/20'
                                        }`}
                                >
                                    {type === 'all' ? 'All' : type === 'local' ? '🖥️ Local' : '☁️ Cloud'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Categories */}
                    <div className="flex flex-wrap gap-2 mt-4">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setFilter(cat)}
                                className={`px-3 py-1 rounded-full text-sm ${filter === cat
                                        ? 'bg-purple-500 text-white'
                                        : 'bg-white/10 hover:bg-white/20'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Models Grid */}
            <section className="container-main pb-16">
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    initial="initial"
                    animate="animate"
                    variants={{ animate: { transition: { staggerChildren: 0.03 } } }}
                >
                    {filteredModels.map((model) => (
                        <motion.div
                            key={model.id}
                            className="glass-card group"
                            variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }}
                            whileHover={{ y: -5 }}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl">{model.icon}</span>
                                    <div>
                                        <h3 className="font-bold group-hover:text-cyan-400 transition-colors">
                                            {model.name}
                                        </h3>
                                        <p className="text-xs text-gray-500">{model.provider}</p>
                                    </div>
                                </div>
                                <span className={`px-2 py-1 rounded text-xs ${model.type === 'local'
                                        ? 'bg-green-500/20 text-green-400'
                                        : 'bg-blue-500/20 text-blue-400'
                                    }`}>
                                    {model.type === 'local' ? '🖥️ Local' : '☁️ Cloud'}
                                </span>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-2 mb-4 text-sm">
                                <div className="text-center p-2 bg-white/5 rounded">
                                    <div className="text-cyan-400 font-medium">{model.context}</div>
                                    <div className="text-xs text-gray-500">Context</div>
                                </div>
                                <div className="text-center p-2 bg-white/5 rounded">
                                    <div className="text-purple-400 font-medium">{model.speed}</div>
                                    <div className="text-xs text-gray-500">Speed</div>
                                </div>
                                <div className="text-center p-2 bg-white/5 rounded">
                                    <div className="text-yellow-400 font-medium">★ {model.rating}</div>
                                    <div className="text-xs text-gray-500">Rating</div>
                                </div>
                            </div>

                            {/* Strengths */}
                            <div className="flex flex-wrap gap-1 mb-3">
                                {model.strengths.map((s) => (
                                    <span key={s} className="px-2 py-0.5 bg-white/5 rounded text-xs text-gray-400">
                                        {s}
                                    </span>
                                ))}
                            </div>

                            <p className="text-sm text-gray-400 mb-3">
                                <span className="text-gray-500">Best for:</span> {model.best_for}
                            </p>

                            <div className="flex items-center justify-between pt-3 border-t border-gray-700">
                                <span className={`text-sm ${model.cost === 'Free' ? 'text-green-400' : 'text-gray-400'}`}>
                                    {model.cost}
                                </span>
                                {model.type === 'local' && (
                                    <span className="text-xs text-gray-500">{model.size}</span>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </section>

            {/* Download CTA */}
            <section className="section-padding bg-[#050508]">
                <div className="container-main">
                    <motion.div
                        className="glass-card text-center py-12"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl font-bold mb-4">Run Models Locally</h2>
                        <p className="text-gray-400 mb-6">
                            Download LM Studio or Ollama to run any of these open source models on your own hardware.
                        </p>
                        <div className="flex gap-4 justify-center">
                            <a href="https://lmstudio.ai" target="_blank" className="btn-primary">
                                🖥️ LM Studio
                            </a>
                            <a href="https://ollama.ai" target="_blank" className="btn-outline">
                                🦙 Ollama
                            </a>
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
