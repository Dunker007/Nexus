'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';
import { LUXRIG_BRIDGE_URL } from '@/lib/utils';

const endpoints = [
    {
        method: 'GET',
        path: '/health',
        description: 'Health check endpoint',
        response: `{ "status": "ok", "timestamp": "2024-12-04T..." }`,
        category: 'System'
    },
    {
        method: 'GET',
        path: '/system',
        description: 'Get system metrics (GPU, CPU, RAM)',
        response: `{
  "gpu": {
    "name": "NVIDIA GeForce RTX 4090",
    "utilization": 45,
    "temp": 52,
    "vram": "24GB",
    "vramUsed": "8.2GB",
    "power": 180
  },
  "cpu": { "usage": 12 },
  "memory": { "total": 32768, "used": 16384 }
}`,
        category: 'System'
    },
    {
        method: 'GET',
        path: '/llm/models',
        description: 'List all available models from LM Studio and Ollama',
        response: `{
  "lmstudio": [
    { "id": "gemma-3n-E4B-it-QAT", "type": "gguf" }
  ],
  "ollama": [
    { "id": "llama3.1:8b", "size": "4.7GB" }
  ]
}`,
        category: 'LLM'
    },
    {
        method: 'GET',
        path: '/llm/lmstudio/models',
        description: 'List LM Studio models only',
        response: `[{ "id": "gemma-3n-E4B-it-QAT", "type": "gguf" }]`,
        category: 'LLM'
    },
    {
        method: 'GET',
        path: '/llm/ollama/models',
        description: 'List Ollama models only',
        response: `[{ "id": "llama3.1:8b", "size": "4.7GB" }]`,
        category: 'LLM'
    },
    {
        method: 'POST',
        path: '/llm/chat',
        description: 'Send chat completion request',
        body: `{
  "provider": "lmstudio" | "ollama",
  "model": "model-name",
  "messages": [
    { "role": "system", "content": "You are helpful" },
    { "role": "user", "content": "Hello!" }
  ],
  "temperature": 0.7,
  "max_tokens": 1000
}`,
        response: `{
  "content": "Hello! How can I help you today?",
  "model": "gemma-3n-E4B-it-QAT",
  "usage": { "prompt_tokens": 12, "completion_tokens": 8 }
}`,
        category: 'LLM'
    },
    {
        method: 'POST',
        path: '/llm/complete',
        description: 'Text completion (non-chat)',
        body: `{
  "provider": "lmstudio" | "ollama",
  "model": "model-name",
  "prompt": "Once upon a time",
  "max_tokens": 100
}`,
        response: `{ "content": "...", "model": "..." }`,
        category: 'LLM'
    },
    {
        method: 'GET',
        path: '/llm/status',
        description: 'Check LLM service availability',
        response: `{
  "lmstudio": { "available": true, "url": "http://localhost:1234" },
  "ollama": { "available": true, "url": "http://localhost:11434" }
}`,
        category: 'LLM'
    },
    // Growth Phase: Pipeline
    {
        method: 'GET',
        path: '/pipeline/status',
        description: 'Get content pipeline status',
        response: `{ "success": true, "status": { "running": false, "lastRun": null } }`,
        category: 'Pipeline'
    },
    {
        method: 'POST',
        path: '/pipeline/generate',
        description: 'Trigger content generation',
        body: `{ "topic": "AI productivity tips", "count": 3 }`,
        response: `{ "success": true, "message": "Generation started", "jobId": "..." }`,
        category: 'Pipeline'
    },
    {
        method: 'GET',
        path: '/pipeline/queue',
        description: 'List pending content items',
        response: `{ "success": true, "queue": [{ "id": 1, "title": "...", "status": "draft" }] }`,
        category: 'Pipeline'
    },
    // Growth Phase: Distribution
    {
        method: 'GET',
        path: '/distribution/songs',
        description: 'List distributed songs',
        response: `{ "success": true, "songs": [{ "id": 1, "title": "...", "platforms": [...] }] }`,
        category: 'Distribution'
    },
    {
        method: 'GET',
        path: '/distribution/summary',
        description: 'Get music revenue summary',
        response: `{ "success": true, "summary": { "totalRevenue": 0, "totalStreams": 0 } }`,
        category: 'Distribution'
    },
    // Growth Phase: Art Products
    {
        method: 'GET',
        path: '/art/products',
        description: 'List art products',
        response: `{ "success": true, "products": [{ "id": 1, "title": "...", "status": "listed" }] }`,
        category: 'Art'
    },
    {
        method: 'POST',
        path: '/art/products/:id/keywords',
        description: 'Generate SEO keywords for a product',
        response: `{ "success": true, "keywords": ["..."] }`,
        category: 'Art'
    },
    // Growth Phase: Unified Income
    {
        method: 'GET',
        path: '/income/summary',
        description: 'Get unified income summary across all streams',
        response: `{ "success": true, "summary": { "totalRevenue": 0, "streams": {...}, "goals": {...} } }`,
        category: 'Income'
    },
    {
        method: 'GET',
        path: '/income/goals',
        description: 'Get income goals',
        response: `{ "success": true, "goals": { "monthly": 100, "yearly": 1200 } }`,
        category: 'Income'
    },
];

const sdks = [
    {
        lang: 'JavaScript',
        icon: '🟨',
        code: `// Using fetch
const BRIDGE_URL = '${LUXRIG_BRIDGE_URL}';
const response = await fetch(\`\${BRIDGE_URL}/llm/chat\`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    provider: 'lmstudio',
    model: 'gemma-3n-E4B-it-QAT',
    messages: [{ role: 'user', content: 'Hello!' }]
  })
});
const data = await response.json();
console.log(data.content);`
    },
    {
        lang: 'Python',
        icon: '🐍',
        code: `import requests

BRIDGE_URL = '${LUXRIG_BRIDGE_URL}'
response = requests.post(f'{BRIDGE_URL}/llm/chat', json={
    'provider': 'lmstudio',
    'model': 'gemma-3n-E4B-it-QAT',
    'messages': [{'role': 'user', 'content': 'Hello!'}]
})
print(response.json()['content'])`
    },
    {
        lang: 'cURL',
        icon: '🔧',
        code: `curl -X POST ${LUXRIG_BRIDGE_URL}/llm/chat \\
  -H "Content-Type: application/json" \\
  -d '{"provider":"lmstudio","model":"gemma-3n-E4B-it-QAT","messages":[{"role":"user","content":"Hello!"}]}'`
    },
    {
        lang: 'PowerShell',
        icon: '💠',
        code: `$bridgeUrl = "${LUXRIG_BRIDGE_URL}"
$body = @{
    provider = "lmstudio"
    model = "gemma-3n-E4B-it-QAT"
    messages = @(@{ role = "user"; content = "Hello!" })
} | ConvertTo-Json

Invoke-RestMethod -Uri "$bridgeUrl/llm/chat" -Method Post -Body $body -ContentType "application/json"`
    },
];

const methodColors: Record<string, string> = {
    GET: 'bg-green-500/20 text-green-400',
    POST: 'bg-blue-500/20 text-blue-400',
    PUT: 'bg-yellow-500/20 text-yellow-400',
    DELETE: 'bg-red-500/20 text-red-400',
};

export default function DocsPage() {
    const [selectedSdk, setSelectedSdk] = useState(0);
    const [expandedEndpoint, setExpandedEndpoint] = useState<string | null>(null);

    const categories = [...new Set(endpoints.map(e => e.category))];

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
                            API <span className="text-gradient">Documentation</span>
                        </h1>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                            The LuxRig Bridge API. Connect your apps to local LLMs.
                        </p>
                        <div className="mt-6 flex justify-center gap-4">
                            <code className="px-4 py-2 bg-white/10 rounded-lg font-mono">
                                Base URL: <span className="text-cyan-400">http://localhost:3456</span>
                            </code>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Quick Start */}
            <section className="container-main pb-12">
                <h2 className="text-2xl font-bold mb-6">🚀 Quick Start</h2>

                {/* SDK Tabs */}
                <div className="flex gap-2 mb-4">
                    {sdks.map((sdk, i) => (
                        <button
                            key={sdk.lang}
                            onClick={() => setSelectedSdk(i)}
                            className={`px-4 py-2 rounded-lg transition-all ${selectedSdk === i
                                ? 'bg-cyan-500 text-black font-medium'
                                : 'bg-white/10 hover:bg-white/20'
                                }`}
                        >
                            {sdk.icon} {sdk.lang}
                        </button>
                    ))}
                </div>

                <motion.div
                    className="glass-card p-0 overflow-hidden"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <pre className="p-6 overflow-x-auto">
                        <code className="text-sm text-cyan-400 font-mono whitespace-pre">
                            {sdks[selectedSdk].code}
                        </code>
                    </pre>
                </motion.div>
            </section>

            {/* Endpoints */}
            <section className="container-main pb-16">
                <h2 className="text-2xl font-bold mb-6">📡 Endpoints</h2>

                {categories.map(category => (
                    <div key={category} className="mb-8">
                        <h3 className="text-xl font-bold mb-4 text-gray-400">{category}</h3>
                        <div className="space-y-4">
                            {endpoints.filter(e => e.category === category).map((endpoint) => (
                                <motion.div
                                    key={endpoint.path}
                                    className="glass-card cursor-pointer"
                                    onClick={() => setExpandedEndpoint(
                                        expandedEndpoint === endpoint.path ? null : endpoint.path
                                    )}
                                    layout
                                >
                                    <div className="flex items-center gap-4">
                                        <span className={`px-3 py-1 rounded text-xs font-mono font-bold ${methodColors[endpoint.method]}`}>
                                            {endpoint.method}
                                        </span>
                                        <code className="font-mono text-cyan-400">{endpoint.path}</code>
                                        <span className="text-gray-400 text-sm flex-1">{endpoint.description}</span>
                                        <span className="text-gray-500">
                                            {expandedEndpoint === endpoint.path ? '▲' : '▼'}
                                        </span>
                                    </div>

                                    {expandedEndpoint === endpoint.path && (
                                        <motion.div
                                            className="mt-4 pt-4 border-t border-gray-700"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                        >
                                            {endpoint.body && (
                                                <div className="mb-4">
                                                    <h4 className="text-sm font-bold text-gray-400 mb-2">Request Body</h4>
                                                    <pre className="p-4 bg-[#0a0e1a] rounded-lg overflow-x-auto">
                                                        <code className="text-sm text-yellow-400 font-mono">{endpoint.body}</code>
                                                    </pre>
                                                </div>
                                            )}
                                            <div>
                                                <h4 className="text-sm font-bold text-gray-400 mb-2">Response</h4>
                                                <pre className="p-4 bg-[#0a0e1a] rounded-lg overflow-x-auto">
                                                    <code className="text-sm text-green-400 font-mono">{endpoint.response}</code>
                                                </pre>
                                            </div>
                                        </motion.div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </div>
                ))}
            </section>

            {/* WebSocket */}
            <section className="section-padding bg-[#050508]">
                <div className="container-main">
                    <h2 className="text-2xl font-bold mb-6">🔌 WebSocket (Real-time)</h2>
                    <div className="glass-card">
                        <p className="text-gray-400 mb-4">
                            Connect to <code className="text-cyan-400">{LUXRIG_BRIDGE_URL.replace('http', 'ws')}</code> for real-time updates.
                        </p>
                        <pre className="p-4 bg-[#0a0e1a] rounded-lg overflow-x-auto">
                            <code className="text-sm text-cyan-400 font-mono">{`const ws = new WebSocket('${LUXRIG_BRIDGE_URL.replace('http', 'ws')}');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // data.type: 'system_metrics' | 'model_status' | 'chat_update'
  console.log(data);
};`}</code>
                        </pre>
                    </div>
                </div>
            </section>

            {/* Rate Limits */}
            <section className="section-padding">
                <div className="container-main">
                    <h2 className="text-2xl font-bold mb-6">⚡ Rate Limits</h2>
                    <div className="glass-card">
                        <p className="text-gray-400 mb-4">
                            Since this runs locally, there are <span className="text-green-400 font-bold">no rate limits</span>!
                            Go as fast as your hardware allows.
                        </p>
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div className="p-4 bg-green-500/10 rounded-xl">
                                <div className="text-2xl font-bold text-green-400">∞</div>
                                <div className="text-sm text-gray-500">Requests/min</div>
                            </div>
                            <div className="p-4 bg-green-500/10 rounded-xl">
                                <div className="text-2xl font-bold text-green-400">∞</div>
                                <div className="text-sm text-gray-500">Tokens/day</div>
                            </div>
                            <div className="p-4 bg-green-500/10 rounded-xl">
                                <div className="text-2xl font-bold text-green-400">$0</div>
                                <div className="text-sm text-gray-500">Cost</div>
                            </div>
                        </div>
                    </div>
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
