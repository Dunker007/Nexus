'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect } from 'react';

// AI service comparisons
const services = [
    {
        name: 'Local (LM Studio)',
        icon: '🖥️',
        type: 'local',
        pricing: 'FREE',
        costPer1M: '$0',
        pros: ['100% private', 'No rate limits', 'No API costs', 'Works offline'],
        cons: ['Requires GPU', 'Setup needed', 'Slower on weak hardware'],
        models: 'Any GGUF model',
        speed: '10-50 tok/s',
        context: 'Up to 128K',
        bestFor: 'Privacy, bulk processing, development'
    },
    {
        name: 'OpenAI GPT-4o',
        icon: '🤖',
        type: 'cloud',
        pricing: '$20/mo (ChatGPT Plus)',
        costPer1M: '$5 input / $15 output',
        pros: ['Most capable', 'Fast', 'Great at everything', 'Image input'],
        cons: ['Expensive at scale', 'Data sent to cloud', 'Rate limits'],
        models: 'GPT-4o, GPT-4o mini',
        speed: '~100 tok/s',
        context: '128K',
        bestFor: 'Complex tasks, coding, creative work'
    },
    {
        name: 'Claude 3.5 Sonnet',
        icon: '🧠',
        type: 'cloud',
        pricing: '$20/mo (Claude Pro)',
        costPer1M: '$3 input / $15 output',
        pros: ['Best at coding', 'Long context', 'Less hallucination', 'Artifacts'],
        cons: ['Slower than GPT-4o', 'Strict content policy', 'API waitlist'],
        models: 'Claude 3.5 Sonnet, Haiku',
        speed: '~80 tok/s',
        context: '200K',
        bestFor: 'Coding, analysis, long documents'
    },
    {
        name: 'Google Gemini',
        icon: '✨',
        type: 'cloud',
        pricing: 'FREE tier available',
        costPer1M: '$0.075 (Flash)',
        pros: ['Cheap', 'Fast', 'Multimodal', 'Free tier'],
        cons: ['Quality below GPT-4', 'Google data policies', 'Newer'],
        models: 'Gemini 2.0, 1.5 Pro/Flash',
        speed: '~150 tok/s',
        context: '1M (!!)',
        bestFor: 'Budget-conscious, long context, multimodal'
    },
    {
        name: 'Groq',
        icon: '⚡',
        type: 'cloud',
        pricing: 'FREE tier available',
        costPer1M: '$0.05 - $0.27',
        pros: ['INSANELY fast', 'Free tier', 'Open models', 'Great for agents'],
        cons: ['Limited model selection', 'Newer company', 'Rate limits'],
        models: 'Llama 3.1, Mixtral',
        speed: '~500 tok/s (!!)',
        context: '128K',
        bestFor: 'Speed-critical apps, real-time, agents'
    },
    {
        name: 'Together AI',
        icon: '🔗',
        type: 'cloud',
        pricing: '$25 free credits',
        costPer1M: '$0.18 - $0.88',
        pros: ['Many open models', 'Fine-tuning', 'Competitive pricing', 'Good docs'],
        cons: ['Less polished UI', 'Smaller community', 'Variable quality'],
        models: 'Llama, Mistral, Qwen, etc.',
        speed: '~100 tok/s',
        context: '32K - 128K',
        bestFor: 'Open source models, fine-tuning'
    },
];

// Cost calculator state
const useCases = [
    { name: 'Casual use (10K tokens/day)', dailyTokens: 10000 },
    { name: 'Power user (100K tokens/day)', dailyTokens: 100000 },
    { name: 'Developer (500K tokens/day)', dailyTokens: 500000 },
    { name: 'Production (1M tokens/day)', dailyTokens: 1000000 },
    { name: 'Enterprise (10M tokens/day)', dailyTokens: 10000000 },
];

export default function ComparePage() {
    const [selectedUseCase, setSelectedUseCase] = useState(1);
    const [showLocal, setShowLocal] = useState(true);

    const dailyTokens = useCases[selectedUseCase].dailyTokens;
    const monthlyTokens = dailyTokens * 30;

    const calculateMonthlyCost = (costPer1M: string): number => {
        if (costPer1M === '$0') return 0;
        // Parse the cost string (simplified)
        const match = costPer1M.match(/\$([\d.]+)/);
        if (!match) return 0;
        const costPerMillion = parseFloat(match[1]);
        return (monthlyTokens / 1000000) * costPerMillion;
    };

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
                            AI <span className="text-gradient">Compare</span>
                        </h1>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                            Side-by-side comparison of AI services. Find the right tool for your needs and budget.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Cost Calculator */}
            <section className="container-main pb-12">
                <motion.div
                    className="glass-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h2 className="text-2xl font-bold mb-6">💰 Cost Calculator</h2>

                    <div className="mb-6">
                        <label className="block text-sm text-gray-400 mb-2">Select your usage level:</label>
                        <div className="flex flex-wrap gap-2">
                            {useCases.map((uc, i) => (
                                <button
                                    key={uc.name}
                                    onClick={() => setSelectedUseCase(i)}
                                    className={`px-4 py-2 rounded-lg text-sm transition-all ${selectedUseCase === i
                                            ? 'bg-cyan-500 text-black font-medium'
                                            : 'bg-white/10 hover:bg-white/20'
                                        }`}
                                >
                                    {uc.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {services.map((service) => {
                            const monthlyCost = calculateMonthlyCost(service.costPer1M);
                            return (
                                <div
                                    key={service.name}
                                    className={`p-4 rounded-xl text-center ${monthlyCost === 0 ? 'bg-green-500/10 border border-green-500/30' : 'bg-white/5'
                                        }`}
                                >
                                    <div className="text-2xl mb-2">{service.icon}</div>
                                    <div className="font-medium text-sm mb-1">{service.name.split(' ')[0]}</div>
                                    <div className={`text-xl font-bold ${monthlyCost === 0 ? 'text-green-400' : 'text-cyan-400'}`}>
                                        {monthlyCost === 0 ? 'FREE' : `$${monthlyCost.toFixed(0)}/mo`}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <p className="text-xs text-gray-500 mt-4">
                        * Estimates based on {(monthlyTokens / 1000000).toFixed(1)}M tokens/month. Actual costs may vary.
                    </p>
                </motion.div>
            </section>

            {/* Comparison Table */}
            <section className="container-main pb-16">
                <h2 className="text-2xl font-bold mb-6">📊 Feature Comparison</h2>

                <div className="overflow-x-auto">
                    <motion.div
                        className="grid gap-4 min-w-[800px]"
                        initial="initial"
                        animate="animate"
                        variants={{ animate: { transition: { staggerChildren: 0.05 } } }}
                    >
                        {services.map((service) => (
                            <motion.div
                                key={service.name}
                                className={`glass-card flex flex-col md:flex-row gap-6 ${service.type === 'local' ? 'border-green-500/30' : ''
                                    }`}
                                variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }}
                            >
                                {/* Name & Pricing */}
                                <div className="md:w-48 flex-shrink-0">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-3xl">{service.icon}</span>
                                        <div>
                                            <h3 className="font-bold">{service.name}</h3>
                                            <span className={`text-sm ${service.type === 'local' ? 'text-green-400' : 'text-cyan-400'}`}>
                                                {service.pricing}
                                            </span>
                                        </div>
                                    </div>
                                    {service.type === 'local' && (
                                        <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                                            🔒 100% Private
                                        </span>
                                    )}
                                </div>

                                {/* Stats */}
                                <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                        <div className="text-xs text-gray-500 mb-1">Cost/1M tokens</div>
                                        <div className="font-medium">{service.costPer1M}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500 mb-1">Speed</div>
                                        <div className="font-medium">{service.speed}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500 mb-1">Context</div>
                                        <div className="font-medium">{service.context}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500 mb-1">Best For</div>
                                        <div className="font-medium text-sm">{service.bestFor}</div>
                                    </div>
                                </div>

                                {/* Pros/Cons */}
                                <div className="md:w-64 flex-shrink-0">
                                    <div className="flex gap-4 text-sm">
                                        <div>
                                            <div className="text-green-400 mb-1">✓ Pros</div>
                                            <ul className="text-gray-400 space-y-1">
                                                {service.pros.slice(0, 2).map((p) => (
                                                    <li key={p} className="text-xs">{p}</li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div>
                                            <div className="text-red-400 mb-1">✗ Cons</div>
                                            <ul className="text-gray-400 space-y-1">
                                                {service.cons.slice(0, 2).map((c) => (
                                                    <li key={c} className="text-xs">{c}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Recommendation */}
            <section className="section-padding bg-[#050508]">
                <div className="container-main">
                    <motion.div
                        className="glass-card text-center py-12"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl font-bold mb-4">Our Recommendation</h2>
                        <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
                            <span className="text-green-400 font-bold">Go local first.</span> Use LM Studio or Ollama for development,
                            testing, and privacy-sensitive work. Then use cloud APIs (Gemini, Groq) for production
                            where you need speed and scale. This hybrid approach gives you the best of both worlds.
                        </p>
                        <div className="flex gap-4 justify-center">
                            <Link href="/deals" className="btn-primary">Browse Free AI Options</Link>
                            <Link href="/learn" className="btn-outline">Learn to Go Local</Link>
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
