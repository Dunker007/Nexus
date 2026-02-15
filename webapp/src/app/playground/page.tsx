'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect } from 'react';

import { LUXRIG_BRIDGE_URL, fetchWithTimeout } from '@/lib/utils';

const BRIDGE_URL = LUXRIG_BRIDGE_URL;

interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

interface Model {
    id: string;
    name: string;
    provider: 'lmstudio' | 'ollama';
}

const samplePrompts = [
    { label: 'Explain code', prompt: 'Explain this Python code:\n```python\ndef fib(n):\n    return n if n < 2 else fib(n-1) + fib(n-2)\n```' },
    { label: 'Write regex', prompt: 'Write a regex to validate email addresses' },
    { label: 'SQL query', prompt: 'Write a SQL query to get the top 10 customers by order value' },
    { label: 'Debug error', prompt: 'Help me debug this error: "TypeError: Cannot read property x of undefined"' },
    { label: 'Compare models', prompt: 'Compare GPT-4 vs Claude 3.5 Sonnet for coding tasks' },
    { label: 'Refactor code', prompt: 'Refactor this to use async/await:\nfetch(url).then(r => r.json()).then(data => console.log(data))' },
];

const systemPrompts = [
    { name: 'Default', prompt: 'You are a helpful AI assistant.' },
    { name: 'Coder', prompt: 'You are an expert programmer. Write clean, efficient code with comments. Explain your reasoning.' },
    { name: 'Teacher', prompt: 'You are a patient teacher. Explain concepts simply, use analogies, and check for understanding.' },
    { name: 'Creative', prompt: 'You are a creative writer. Be imaginative, use vivid language, and think outside the box.' },
    { name: 'Critic', prompt: 'You are a critical reviewer. Analyze thoroughly, point out issues, and suggest improvements.' },
];

export default function PlaygroundPage() {
    const [models, setModels] = useState<Model[]>([]);
    const [selectedModel, setSelectedModel] = useState('');
    const [selectedProvider, setSelectedProvider] = useState<'lmstudio' | 'ollama'>('lmstudio');
    const [systemPrompt, setSystemPrompt] = useState(systemPrompts[0].prompt);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const [temperature, setTemperature] = useState(0.7);
    const [maxTokens, setMaxTokens] = useState(1000);
    const [response, setResponse] = useState('');
    const [stats, setStats] = useState<{ tokens?: number; time?: number }>({});

    useEffect(() => {
        async function fetchModels() {
            try {
                const [lmRes, ollamaRes] = await Promise.all([
                    fetch(`${BRIDGE_URL}/llm/lmstudio/models`).catch(() => ({ ok: false })),
                    fetch(`${BRIDGE_URL}/llm/ollama/models`).catch(() => ({ ok: false })),
                ]);

                const allModels: Model[] = [];

                if (lmRes.ok) {
                    const lmData = await (lmRes as Response).json();
                    allModels.push(...lmData.map((m: any) => ({ ...m, provider: 'lmstudio' as const, name: m.id })));
                }

                if (ollamaRes.ok) {
                    const ollamaData = await (ollamaRes as Response).json();
                    allModels.push(...ollamaData.map((m: any) => ({ ...m, provider: 'ollama' as const, name: m.id })));
                }

                setModels(allModels);
                if (allModels.length > 0) {
                    setSelectedModel(allModels[0].id);
                    setSelectedProvider(allModels[0].provider);
                }
            } catch (e) {
                console.error('Failed to fetch models');
            }
        }

        fetchModels();
    }, []);

    async function sendMessage() {
        if (!input.trim() || !selectedModel) return;

        const startTime = Date.now();
        setLoading(true);
        setResponse('');

        const newMessages: Message[] = [
            ...messages,
            { role: 'user', content: input }
        ];
        setMessages(newMessages);
        setInput('');

        try {
            const res = await fetchWithTimeout(`${BRIDGE_URL}/llm/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    provider: selectedProvider,
                    model: selectedModel,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        ...newMessages
                    ],
                    temperature,
                    max_tokens: maxTokens
                })
            }, 30000);

            if (res.ok) {
                const data = await res.json();
                const endTime = Date.now();
                setResponse(data.content);
                setMessages([...newMessages, { role: 'assistant', content: data.content }]);
                setStats({
                    tokens: data.usage?.completion_tokens || Math.floor(data.content.length / 4),
                    time: (endTime - startTime) / 1000
                });
            } else {
                setResponse('Error: Failed to get response');
            }
        } catch (e) {
            setResponse('Error: Connection failed. Is LuxRig Bridge running?');
        }

        setLoading(false);
    }

    function clearAll() {
        setMessages([]);
        setResponse('');
        setInput('');
        setStats({});
    }

    return (
        <div className="min-h-screen pt-8">
            {/* Header */}
            <section className="section-padding pb-8">
                <div className="container-main">
                    <motion.div
                        className="text-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h1 className="text-5xl md:text-6xl font-bold mb-4">
                            <span className="text-gradient">Playground</span>
                        </h1>
                        <p className="text-xl text-gray-400">
                            Test prompts, tweak parameters, compare outputs.
                        </p>
                    </motion.div>
                </div>
            </section>

            <section className="container-main pb-16">
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Settings Panel */}
                    <div className="lg:col-span-1 space-y-4">
                        {/* Model Selection */}
                        <motion.div
                            className="glass-card"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <h3 className="font-bold mb-3">🤖 Model</h3>
                            <select
                                value={`${selectedProvider}:${selectedModel}`}
                                onChange={(e) => {
                                    const [provider, model] = e.target.value.split(':');
                                    setSelectedProvider(provider as 'lmstudio' | 'ollama');
                                    setSelectedModel(model);
                                }}
                                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2"
                            >
                                {models.length === 0 && (
                                    <option>No models available</option>
                                )}
                                {models.map((m) => (
                                    <option key={`${m.provider}:${m.id}`} value={`${m.provider}:${m.id}`}>
                                        {m.provider === 'lmstudio' ? '🖥️' : '🦙'} {m.name}
                                    </option>
                                ))}
                            </select>
                        </motion.div>

                        {/* System Prompt */}
                        <motion.div
                            className="glass-card"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <h3 className="font-bold mb-3">🎭 System Prompt</h3>
                            <div className="flex flex-wrap gap-2 mb-3">
                                {systemPrompts.map((sp) => (
                                    <button
                                        key={sp.name}
                                        onClick={() => setSystemPrompt(sp.prompt)}
                                        className={`px-2 py-1 rounded text-xs ${systemPrompt === sp.prompt
                                            ? 'bg-cyan-500 text-black'
                                            : 'bg-white/10 hover:bg-white/20'
                                            }`}
                                    >
                                        {sp.name}
                                    </button>
                                ))}
                            </div>
                            <textarea
                                value={systemPrompt}
                                onChange={(e) => setSystemPrompt(e.target.value)}
                                rows={3}
                                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm"
                            />
                        </motion.div>

                        {/* Parameters */}
                        <motion.div
                            className="glass-card"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <h3 className="font-bold mb-3">⚙️ Parameters</h3>

                            <div className="mb-4">
                                <label className="flex justify-between text-sm mb-1">
                                    <span>Temperature</span>
                                    <span className="text-cyan-400">{temperature}</span>
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="2"
                                    step="0.1"
                                    value={temperature}
                                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                                    className="w-full"
                                />
                            </div>

                            <div>
                                <label className="flex justify-between text-sm mb-1">
                                    <span>Max Tokens</span>
                                    <span className="text-cyan-400">{maxTokens}</span>
                                </label>
                                <input
                                    type="range"
                                    min="100"
                                    max="4000"
                                    step="100"
                                    value={maxTokens}
                                    onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                                    className="w-full"
                                />
                            </div>
                        </motion.div>

                        {/* Stats */}
                        {stats.tokens && (
                            <motion.div
                                className="glass-card"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                            >
                                <h3 className="font-bold mb-3">📊 Stats</h3>
                                <div className="grid grid-cols-2 gap-4 text-center">
                                    <div>
                                        <div className="text-2xl font-bold text-cyan-400">{stats.tokens}</div>
                                        <div className="text-xs text-gray-500">Tokens</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-purple-400">{stats.time?.toFixed(2)}s</div>
                                        <div className="text-xs text-gray-500">Time</div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Chat Area */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Quick Prompts */}
                        <motion.div
                            className="flex flex-wrap gap-2"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            {samplePrompts.map((p) => (
                                <button
                                    key={p.label}
                                    onClick={() => setInput(p.prompt)}
                                    className="px-3 py-1 bg-white/10 rounded-full text-sm hover:bg-white/20 transition-colors"
                                >
                                    {p.label}
                                </button>
                            ))}
                        </motion.div>

                        {/* Messages */}
                        <motion.div
                            className="glass-card min-h-[400px] max-h-[500px] overflow-y-auto"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            {messages.length === 0 ? (
                                <div className="h-full flex items-center justify-center text-gray-500">
                                    <div className="text-center">
                                        <div className="text-4xl mb-2">🧪</div>
                                        <p>Start experimenting! Enter a prompt below.</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {messages.map((msg, i) => (
                                        <div
                                            key={i}
                                            className={`p-4 rounded-lg ${msg.role === 'user'
                                                ? 'bg-cyan-500/10 border border-cyan-500/30'
                                                : 'bg-white/5'
                                                }`}
                                        >
                                            <div className="text-xs text-gray-500 mb-1">
                                                {msg.role === 'user' ? '👤 You' : '🤖 Assistant'}
                                            </div>
                                            <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                                        </div>
                                    ))}
                                    {loading && (
                                        <div className="p-4 bg-white/5 rounded-lg animate-pulse">
                                            <div className="text-xs text-gray-500 mb-1">🤖 Assistant</div>
                                            <div className="text-gray-400">Thinking...</div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </motion.div>

                        {/* Input */}
                        <motion.div
                            className="glass-card p-0 overflow-hidden"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Enter your prompt..."
                                rows={3}
                                className="w-full bg-transparent p-4 focus:outline-none resize-none"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && e.ctrlKey) {
                                        sendMessage();
                                    }
                                }}
                            />
                            <div className="flex items-center justify-between p-4 border-t border-gray-700">
                                <span className="text-xs text-gray-500">Ctrl + Enter to send</span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={clearAll}
                                        className="px-4 py-2 bg-white/10 rounded-lg text-sm hover:bg-white/20"
                                    >
                                        Clear
                                    </button>
                                    <button
                                        onClick={sendMessage}
                                        disabled={loading || !selectedModel}
                                        className="btn-primary text-sm"
                                    >
                                        {loading ? 'Generating...' : 'Send'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
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
