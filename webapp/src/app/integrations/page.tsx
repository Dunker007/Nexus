'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { LUXRIG_BRIDGE_URL } from '@/lib/utils';

const integrations = [
    {
        id: 'lmstudio',
        name: 'LM Studio',
        icon: '🖥️',
        status: 'connected',
        description: 'Local LLM inference with beautiful UI',
        category: 'AI Runtime',
        url: 'http://localhost:1234',
        docs: 'https://lmstudio.ai/docs',
        features: ['Model management', 'Chat API', 'Completions API', 'Embeddings']
    },
    {
        id: 'ollama',
        name: 'Ollama',
        icon: '🦙',
        status: 'connected',
        description: 'Simple CLI for running LLMs locally',
        category: 'AI Runtime',
        url: 'http://localhost:11434',
        docs: 'https://ollama.ai',
        features: ['One-line install', 'Model library', 'REST API', 'GPU acceleration']
    },
    {
        id: 'huggingface',
        name: 'Hugging Face',
        icon: '🤗',
        status: 'available',
        description: 'The AI community hub for models and datasets',
        category: 'AI Platform',
        url: 'https://huggingface.co',
        docs: 'https://huggingface.co/docs',
        features: ['50K+ models', 'Datasets', 'Spaces', 'Inference API']
    },
    {
        id: 'openai',
        name: 'OpenAI',
        icon: '🤖',
        status: 'available',
        description: 'GPT-4, DALL-E, Whisper, and more',
        category: 'AI Platform',
        url: 'https://api.openai.com',
        docs: 'https://platform.openai.com/docs',
        features: ['GPT-4o', 'DALL-E 3', 'Whisper', 'Embeddings']
    },
    {
        id: 'anthropic',
        name: 'Anthropic Claude',
        icon: '🧠',
        status: 'available',
        description: 'Claude 3.5 Sonnet - best for coding',
        category: 'AI Platform',
        url: 'https://api.anthropic.com',
        docs: 'https://docs.anthropic.com',
        features: ['200K context', 'Artifacts', 'Vision', 'Tool use']
    },
    {
        id: 'google',
        name: 'Google Gemini',
        icon: '✨',
        status: 'available',
        description: 'Gemini 2.0 with 1M context',
        category: 'AI Platform',
        url: 'https://generativelanguage.googleapis.com',
        docs: 'https://ai.google.dev',
        features: ['1M context', 'Multimodal', 'Free tier', 'Fast']
    },
    {
        id: 'github',
        name: 'GitHub',
        icon: '🐙',
        status: 'available',
        description: 'Code hosting and version control',
        category: 'Development',
        url: 'https://github.com',
        docs: 'https://docs.github.com',
        features: ['Repos', 'Actions', 'Copilot', 'Issues']
    },
    {
        id: 'vscode',
        name: 'VS Code',
        icon: '💻',
        status: 'connected',
        description: 'The most popular code editor',
        category: 'Development',
        url: 'vscode://settings',
        docs: 'https://code.visualstudio.com/docs',
        features: ['Extensions', 'Debugging', 'Git integration', 'Terminal']
    },
    {
        id: 'docker',
        name: 'Docker',
        icon: '🐳',
        status: 'available',
        description: 'Container platform for dev environments',
        category: 'Development',
        url: 'unix:///var/run/docker.sock',
        docs: 'https://docs.docker.com',
        features: ['Containers', 'Images', 'Compose', 'Volumes']
    },
    {
        id: 'davinci',
        name: 'DaVinci Resolve',
        icon: '🎬',
        status: 'detected',
        description: 'Professional video editing & color grading',
        category: 'Creative',
        url: 'local',
        docs: 'https://www.blackmagicdesign.com',
        features: ['Editing', 'Color', 'Fairlight', 'Fusion']
    },
    {
        id: 'obs',
        name: 'OBS Studio',
        icon: '📹',
        status: 'available',
        description: 'Open source streaming and recording',
        category: 'Creative',
        url: 'local',
        docs: 'https://obsproject.com',
        features: ['Streaming', 'Recording', 'Virtual camera', 'Plugins']
    },
    {
        id: 'discord',
        name: 'Discord',
        icon: '🎮',
        status: 'available',
        description: 'Bot integration for automation',
        category: 'Communication',
        url: 'https://discord.com/api',
        docs: 'https://discord.com/developers/docs',
        features: ['Bots', 'Webhooks', 'OAuth', 'Rich presence']
    },
];

const statusConfig = {
    connected: { color: 'text-green-400', bg: 'bg-green-500/20', label: 'Connected' },
    detected: { color: 'text-cyan-400', bg: 'bg-cyan-500/20', label: 'Detected' },
    available: { color: 'text-gray-400', bg: 'bg-gray-500/20', label: 'Available' },
    error: { color: 'text-red-400', bg: 'bg-red-500/20', label: 'Error' },
};

export default function IntegrationsPage() {
    const [filter, setFilter] = useState('all');
    const [statuses, setStatuses] = useState<Record<string, string>>({});

    useEffect(() => {
        const checkStatus = async () => {
            const newStatuses: Record<string, string> = { ...statuses };

            // Check client-side tokens
            if (typeof window !== 'undefined') {
                if (localStorage.getItem('github_access_token')) newStatuses.github = 'connected';
                if (localStorage.getItem('google_access_token')) newStatuses.google = 'connected';
            }

            // Check server-side system tokens
            try {
                const res = await fetch(`${LUXRIG_BRIDGE_URL}/auth/github/status`);
                const data = await res.json();
                if (data.connected) newStatuses.github = 'connected';
            } catch (error) {
                // Ignore errors if backend is down
                console.warn('Failed to check backend GitHub status');
            }

            setStatuses(newStatuses);
        };

        checkStatus();
    }, []);

    const handleConnect = async (id: string) => {
        try {
            if (id === 'github') {
                const res = await fetch(`${LUXRIG_BRIDGE_URL}/auth/github`);
                const data = await res.json();
                if (data.authUrl) window.location.href = data.authUrl;
            } else if (id === 'google') {
                const res = await fetch(`${LUXRIG_BRIDGE_URL}/auth/google`);
                const data = await res.json();
                if (data.authUrl) window.location.href = data.authUrl;
            }
        } catch (error) {
            console.error('Connection error:', error);
        }
    };

    const handleDisconnect = (id: string) => {
        if (id === 'github') localStorage.removeItem('github_access_token');
        if (id === 'google') localStorage.removeItem('google_access_token');
        setStatuses(prev => ({ ...prev, [id]: 'available' }));
    };

    const categories = ['all', ...new Set(integrations.map(i => i.category))];
    const filteredIntegrations = filter === 'all'
        ? integrations
        : integrations.filter(i => i.category === filter);

    const connectedCount = integrations.filter(i =>
        (statuses[i.id] || i.status) === 'connected'
    ).length;

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
                            <span className="text-gradient">Integrations</span>
                        </h1>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                            Connect everything. Local AI, cloud APIs, dev tools, creative software.
                        </p>
                        <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-full">
                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                            <span className="text-green-400">{connectedCount} services connected</span>
                        </div>
                    </motion.div>
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
                                : 'bg-white/10 hover:bg-white/20'
                                }`}
                        >
                            {cat === 'all' ? 'All' : cat}
                        </button>
                    ))}
                </div>
            </section>

            {/* Integrations Grid */}
            <section className="container-main pb-16">
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    initial="initial"
                    animate="animate"
                    variants={{ animate: { transition: { staggerChildren: 0.05 } } }}
                >
                    {filteredIntegrations.map((integration) => {
                        const currentStatus = statuses[integration.id] || integration.status;
                        const status = statusConfig[currentStatus as keyof typeof statusConfig] || statusConfig.available;

                        return (
                            <motion.div
                                key={integration.id}
                                className="glass-card group"
                                variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }}
                                whileHover={{ y: -5 }}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <span className="text-4xl">{integration.icon}</span>
                                    <span className={`px-2 py-1 rounded-full text-xs ${status.bg} ${status.color}`}>
                                        {status.label}
                                    </span>
                                </div>

                                <h3 className="text-xl font-bold mb-1 group-hover:text-cyan-400 transition-colors">
                                    {integration.name}
                                </h3>
                                <p className="text-sm text-gray-500 mb-2">{integration.category}</p>
                                <p className="text-gray-400 text-sm mb-4">{integration.description}</p>

                                <div className="flex flex-wrap gap-2 mb-4">
                                    {integration.features.slice(0, 3).map((feature) => (
                                        <span key={feature} className="px-2 py-1 bg-white/5 rounded text-xs text-gray-400">
                                            {feature}
                                        </span>
                                    ))}
                                </div>

                                <div className="flex gap-2">
                                    {(currentStatus === 'connected') ? (
                                        <button
                                            onClick={() => handleDisconnect(integration.id)}
                                            className="flex-1 py-2 bg-green-500/20 text-green-400 rounded-lg text-sm hover:bg-red-500/20 hover:text-red-400 transition-colors group-connect"
                                        >
                                            <span className="group-connect-hover:hidden">✓ Active</span>
                                            <span className="hidden group-connect-hover:inline">Disconnect</span>
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleConnect(integration.id)}
                                            className="flex-1 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg text-sm hover:bg-cyan-500/30"
                                        >
                                            Connect
                                        </button>
                                    )}
                                    <a
                                        href={integration.docs}
                                        target="_blank"
                                        className="px-4 py-2 bg-white/10 rounded-lg text-sm hover:bg-white/20"
                                    >
                                        Docs
                                    </a>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </section>

            {/* Add Custom */}
            <section className="section-padding bg-[#050508]">
                <div className="container-main">
                    <motion.div
                        className="glass-card text-center py-12"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl font-bold mb-4">Need a custom integration?</h2>
                        <p className="text-gray-400 mb-6">
                            The LuxRig Bridge is extensible. Add your own endpoints and integrations.
                        </p>
                        <div className="flex gap-4 justify-center">
                            <Link href="/docs" className="btn-primary">View API Docs</Link>
                            <a
                                href="https://github.com/Dunker007/Fresh-Start"
                                target="_blank"
                                className="btn-outline"
                            >
                                Contribute on GitHub
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
