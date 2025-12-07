'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';

// Current AI deals and free tiers (easily updatable)
const deals = [
    {
        id: 'anthropic-claude',
        name: 'Claude (Anthropic)',
        logo: '🧠',
        type: 'Free Tier',
        deal: 'Free access via claude.ai with daily limits',
        expires: 'Ongoing',
        tier: 'free',
        link: 'https://claude.ai',
        features: ['Claude 3.5 Sonnet', 'Web interface', 'Code generation', 'Document analysis'],
        limits: '~30 messages/day on free tier',
        hot: true
    },
    {
        id: 'google-gemini',
        name: 'Google Gemini',
        logo: '✨',
        type: 'Free Tier + API',
        deal: 'Gemini 2.0 Flash free with 15 RPM',
        expires: 'Ongoing',
        tier: 'free',
        link: 'https://ai.google.dev',
        features: ['Gemini 2.0 Flash', '15 requests/min', '1M tokens/day', 'Multimodal'],
        limits: 'Rate limited, perfect for dev/testing',
        hot: true
    },
    {
        id: 'openai-gpt',
        name: 'ChatGPT',
        logo: '🤖',
        type: 'Free Tier',
        deal: 'GPT-4o mini free, GPT-4o with limits',
        expires: 'Ongoing',
        tier: 'free',
        link: 'https://chat.openai.com',
        features: ['GPT-4o mini (free)', 'GPT-4o (limited)', 'Image generation', 'Code interpreter'],
        limits: 'Usage limits on advanced features',
        hot: false
    },
    {
        id: 'mistral',
        name: 'Mistral AI',
        logo: '🌀',
        type: 'Free API',
        deal: 'Free API tier for Mistral models',
        expires: 'Ongoing',
        tier: 'free',
        link: 'https://console.mistral.ai',
        features: ['Mistral 7B', 'Mixtral 8x7B', 'API access', 'Fine-tuning'],
        limits: 'Generous free tier for developers',
        hot: false
    },
    {
        id: 'groq',
        name: 'Groq',
        logo: '⚡',
        type: 'Free Tier',
        deal: 'BLAZING fast inference, free tier available',
        expires: 'Ongoing',
        tier: 'free',
        link: 'https://console.groq.com',
        features: ['Llama 3.1 70B', 'Mixtral', 'Ultra-fast inference', 'API access'],
        limits: '14,400 tokens/min free',
        hot: true
    },
    {
        id: 'together-ai',
        name: 'Together AI',
        logo: '🔗',
        type: 'Free Credits',
        deal: '$25 free credits on signup',
        expires: 'Ongoing',
        tier: 'trial',
        link: 'https://together.ai',
        features: ['Llama models', 'Code Llama', 'Image generation', 'Fine-tuning'],
        limits: '$25 credit lasts ~weeks for light use',
        hot: false
    },
    {
        id: 'perplexity',
        name: 'Perplexity AI',
        logo: '🔍',
        type: 'Free Tier',
        deal: 'Free AI search with sources',
        expires: 'Ongoing',
        tier: 'free',
        link: 'https://perplexity.ai',
        features: ['AI search', 'Source citations', 'Follow-up questions', 'Pro search (limited)'],
        limits: '~5 Pro searches/day free',
        hot: false
    },
    {
        id: 'cohere',
        name: 'Cohere',
        logo: '🌐',
        type: 'Free Trial',
        deal: 'Free trial API access',
        expires: 'Ongoing',
        tier: 'trial',
        link: 'https://cohere.com',
        features: ['Command models', 'Embeddings', 'Rerank', 'RAG toolkit'],
        limits: 'Rate limited trial tier',
        hot: false
    },
    {
        id: 'huggingface',
        name: 'Hugging Face',
        logo: '🤗',
        type: 'Free Inference',
        deal: 'Free inference API for thousands of models',
        expires: 'Ongoing',
        tier: 'free',
        link: 'https://huggingface.co/inference-api',
        features: ['1000s of models', 'Text/Image/Audio', 'Spaces (free compute)', 'Datasets'],
        limits: 'Rate limited, queue for heavy models',
        hot: true
    },
    {
        id: 'replicate',
        name: 'Replicate',
        logo: '🔄',
        type: 'Free Credits',
        deal: 'Free credits for new users',
        expires: 'Limited',
        tier: 'trial',
        link: 'https://replicate.com',
        features: ['Stable Diffusion', 'Llama models', 'Audio models', 'One-click deploy'],
        limits: 'Pay-per-use after credits',
        hot: false
    },
    {
        id: 'poe',
        name: 'POE',
        logo: '💬',
        type: 'Free Access',
        deal: 'Access to multiple AI models in one place',
        expires: 'Ongoing',
        tier: 'free',
        link: 'https://poe.com',
        features: ['Claude', 'GPT-4', 'Gemini', 'Custom bots', 'Bot creation'],
        limits: 'Daily compute points, resets daily',
        hot: true
    },
    {
        id: 'github-copilot',
        name: 'GitHub Copilot',
        logo: '🐙',
        type: 'Free for Students/OSS',
        deal: 'Free for students, teachers, and OSS maintainers',
        expires: 'Ongoing',
        tier: 'free',
        link: 'https://github.com/features/copilot',
        features: ['Code completion', 'Chat', 'VS Code/JetBrains', 'CLI'],
        limits: 'Verify student/OSS status',
        hot: true
    },
];

const freeLocalModels = [
    { name: 'LM Studio', desc: 'Run any GGUF model locally with beautiful UI', link: 'https://lmstudio.ai', icon: '🖥️' },
    { name: 'Ollama', desc: 'Simple CLI to run Llama, Mistral, and more', link: 'https://ollama.ai', icon: '🦙' },
    { name: 'GPT4All', desc: 'Privacy-focused local LLM runner', link: 'https://gpt4all.io', icon: '🔒' },
    { name: 'Jan', desc: 'Offline AI assistant with clean UI', link: 'https://jan.ai', icon: '📱' },
    { name: 'Llamafile', desc: 'Single-file executables for LLMs', link: 'https://github.com/Mozilla-Ocho/llamafile', icon: '📦' },
    { name: 'Text Generation WebUI', desc: 'Feature-rich Gradio interface for LLMs', link: 'https://github.com/oobabooga/text-generation-webui', icon: '🌐' },
];

const freeCloudCompute = [
    { name: 'Google Colab', desc: 'Free GPU (T4) notebooks, perfect for ML', link: 'https://colab.research.google.com', gpu: 'T4 GPU', icon: '📓' },
    { name: 'Kaggle Notebooks', desc: 'Free GPU/TPU, 30h/week GPU time', link: 'https://kaggle.com', gpu: 'P100/T4 GPU', icon: '📊' },
    { name: 'Lightning.ai', desc: 'Free GPU credits for Studios', link: 'https://lightning.ai', gpu: 'A10G GPU', icon: '⚡' },
    { name: 'Paperspace Gradient', desc: 'Free tier with GPU notebooks', link: 'https://paperspace.com', gpu: 'Free GPU tier', icon: '📝' },
    { name: 'Hugging Face Spaces', desc: 'Free CPU (GPU for $$$), deploy anything', link: 'https://huggingface.co/spaces', gpu: 'Free CPU', icon: '🤗' },
    { name: 'Replit', desc: 'Free compute for small projects', link: 'https://replit.com', gpu: 'CPU only', icon: '💻' },
];

const tierColors = {
    free: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' },
    trial: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' },
    promo: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30' },
};

export default function DealsPage() {
    const [filter, setFilter] = useState<'all' | 'free' | 'trial'>('all');

    const filteredDeals = filter === 'all'
        ? deals
        : deals.filter(d => d.tier === filter);

    const freeCount = deals.filter(d => d.tier === 'free').length;
    const trialCount = deals.filter(d => d.tier === 'trial').length;

    return (
        <div className="min-h-screen pt-8">
            {/* Header */}
            <section className="section-padding pb-12">
                <div className="container-main">
                    <motion.div
                        className="text-center max-w-4xl mx-auto"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/30 mb-6">
                            <span className="text-green-400 text-sm font-medium">💰 UPDATED DEC 2024</span>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-bold mb-6">
                            Free <span className="text-gradient">AI</span> Resources
                        </h1>

                        <p className="text-xl text-gray-400 mb-8">
                            Why pay when you can vibe for free? Every AI deal, free tier,
                            and trial we can find — all in one place.
                        </p>

                        <div className="flex justify-center gap-4 flex-wrap">
                            <button
                                className={`px-6 py-3 rounded-lg font-medium transition-all ${filter === 'all' ? 'bg-cyan-500 text-black' : 'bg-white/10 text-white hover:bg-white/20'}`}
                                onClick={() => setFilter('all')}
                            >
                                All ({deals.length})
                            </button>
                            <button
                                className={`px-6 py-3 rounded-lg font-medium transition-all ${filter === 'free' ? 'bg-green-500 text-black' : 'bg-white/10 text-white hover:bg-white/20'}`}
                                onClick={() => setFilter('free')}
                            >
                                Forever Free ({freeCount})
                            </button>
                            <button
                                className={`px-6 py-3 rounded-lg font-medium transition-all ${filter === 'trial' ? 'bg-yellow-500 text-black' : 'bg-white/10 text-white hover:bg-white/20'}`}
                                onClick={() => setFilter('trial')}
                            >
                                Free Trials ({trialCount})
                            </button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Deals Grid */}
            <section className="pb-16">
                <div className="container-main">
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        initial="initial"
                        animate="animate"
                        variants={{ animate: { transition: { staggerChildren: 0.05 } } }}
                    >
                        {filteredDeals.map((deal) => {
                            const tier = tierColors[deal.tier as keyof typeof tierColors];
                            return (
                                <motion.a
                                    key={deal.id}
                                    href={deal.link}
                                    target="_blank"
                                    className="glass-card relative overflow-hidden group cursor-pointer"
                                    variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }}
                                    whileHover={{ y: -5 }}
                                >
                                    {/* Hot badge */}
                                    {deal.hot && (
                                        <div className="absolute top-4 right-4 z-10">
                                            <span className="px-2 py-1 bg-red-500/20 border border-red-500/30 rounded-full text-xs text-red-400 font-medium animate-pulse">
                                                🔥 HOT
                                            </span>
                                        </div>
                                    )}

                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="text-4xl">{deal.logo}</div>
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold group-hover:text-cyan-400 transition-colors">
                                                {deal.name}
                                            </h3>
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${tier.bg} ${tier.text} ${tier.border} border`}>
                                                {deal.type}
                                            </span>
                                        </div>
                                    </div>

                                    <p className="text-cyan-400 font-medium mb-3">{deal.deal}</p>

                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {deal.features.slice(0, 4).map((f) => (
                                            <span key={f} className="px-2 py-1 bg-white/5 rounded text-xs text-gray-400">
                                                {f}
                                            </span>
                                        ))}
                                    </div>

                                    <p className="text-sm text-gray-500">{deal.limits}</p>

                                    {/* Hover arrow */}
                                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-cyan-400">
                                        →
                                    </div>
                                </motion.a>
                            );
                        })}
                    </motion.div>
                </div>
            </section>

            {/* Free Local AI */}
            <section className="section-padding bg-[#050508]">
                <div className="container-main">
                    <motion.div
                        className="text-center mb-12"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-4xl font-bold mb-4">
                            Run AI <span className="text-glow-cyan">Locally</span>
                        </h2>
                        <p className="text-gray-400 text-lg">
                            100% free, 100% private. No API keys, no rate limits, no costs.
                        </p>
                    </motion.div>

                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        initial="initial"
                        whileInView="animate"
                        viewport={{ once: true }}
                        variants={{ animate: { transition: { staggerChildren: 0.1 } } }}
                    >
                        {freeLocalModels.map((tool) => (
                            <motion.a
                                key={tool.name}
                                href={tool.link}
                                target="_blank"
                                className="glass-card flex items-center gap-4 group"
                                variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }}
                                whileHover={{ scale: 1.02 }}
                            >
                                <div className="text-4xl">{tool.icon}</div>
                                <div>
                                    <h3 className="font-bold group-hover:text-cyan-400 transition-colors">{tool.name}</h3>
                                    <p className="text-sm text-gray-400">{tool.desc}</p>
                                </div>
                            </motion.a>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Free Cloud GPU */}
            <section className="section-padding">
                <div className="container-main">
                    <motion.div
                        className="text-center mb-12"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-4xl font-bold mb-4">
                            Free <span className="text-glow-magenta">Cloud GPUs</span>
                        </h2>
                        <p className="text-gray-400 text-lg">
                            Run your models in the cloud without paying a dime.
                        </p>
                    </motion.div>

                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        initial="initial"
                        whileInView="animate"
                        viewport={{ once: true }}
                        variants={{ animate: { transition: { staggerChildren: 0.1 } } }}
                    >
                        {freeCloudCompute.map((service) => (
                            <motion.a
                                key={service.name}
                                href={service.link}
                                target="_blank"
                                className="glass-card group"
                                variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }}
                                whileHover={{ scale: 1.02 }}
                            >
                                <div className="flex items-center gap-4 mb-3">
                                    <div className="text-3xl">{service.icon}</div>
                                    <div>
                                        <h3 className="font-bold group-hover:text-cyan-400 transition-colors">{service.name}</h3>
                                        <span className="text-xs text-purple-400">{service.gpu}</span>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-400">{service.desc}</p>
                            </motion.a>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Pro Tips */}
            <section className="section-padding bg-[#050508]">
                <div className="container-main">
                    <motion.div
                        className="glass-card"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-2xl font-bold mb-6">💡 Pro Tips for Maximizing Free AI</h2>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="p-4 bg-cyan-500/10 rounded-xl">
                                    <h3 className="font-bold text-cyan-400 mb-2">🔄 Rotate Between Services</h3>
                                    <p className="text-sm text-gray-400">
                                        Hit the limit on Claude? Switch to Gemini. Rate limited on Groq? Try POE.
                                        Keep multiple tabs open for unlimited AI access.
                                    </p>
                                </div>

                                <div className="p-4 bg-purple-500/10 rounded-xl">
                                    <h3 className="font-bold text-purple-400 mb-2">🏠 Go Local for Heavy Lifting</h3>
                                    <p className="text-sm text-gray-400">
                                        Use cloud AI for quick questions. When you need to process hundreds of files,
                                        run LM Studio or Ollama locally — zero rate limits.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="p-4 bg-green-500/10 rounded-xl">
                                    <h3 className="font-bold text-green-400 mb-2">📚 Student Perks</h3>
                                    <p className="text-sm text-gray-400">
                                        Have a .edu email? GitHub Copilot is free. Many AI services offer generous
                                        student tiers. Always check!
                                    </p>
                                </div>

                                <div className="p-4 bg-yellow-500/10 rounded-xl">
                                    <h3 className="font-bold text-yellow-400 mb-2">⏰ Timing is Everything</h3>
                                    <p className="text-sm text-gray-400">
                                        Rate limits often reset daily at midnight UTC.
                                        Free GPU quotas on Colab reset weekly. Plan your heavy work accordingly.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* CTA */}
            <section className="section-padding">
                <div className="container-main">
                    <motion.div
                        className="text-center"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                    >
                        <p className="text-gray-400 mb-4">Know of a deal we missed?</p>
                        <a
                            href="https://github.com/Dunker007/Fresh-Start/issues"
                            target="_blank"
                            className="btn-outline"
                        >
                            Submit a Deal →
                        </a>
                    </motion.div>
                </div>
            </section>

            {/* Back link */}
            <div className="container-main pb-8">
                <Link href="/" className="text-gray-400 hover:text-cyan-400 transition-colors">
                    ← Back to Dashboard
                </Link>
            </div>
        </div>
    );
}
