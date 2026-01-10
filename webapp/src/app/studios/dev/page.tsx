'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { LUXRIG_BRIDGE_URL } from '@/lib/utils';
import { Terminal, Cpu, GitBranch, Github, RefreshCw, Folder } from 'lucide-react';
import Link from 'next/link';
import { formatRelativeTime } from '@/lib/utils';

interface Repo {
    id: number;
    name: string;
    description: string;
    html_url: string;
    language: string;
    stargazers_count: number;
    updated_at: string;
    visibility: string;
    owner: {
        login: string;
        avatar_url: string;
    };
}

export default function DevStudioPage() {
    const [repos, setRepos] = useState<Repo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState<{
        memory?: { used: number };
        gpu?: { load: number };
        nodeVersion?: string;
        platform?: string;
    } | null>(null);

    useEffect(() => {
        fetchRepos();
        fetchSystemStatus();
    }, []);

    const fetchRepos = async () => {
        setLoading(true);
        setError(null);
        try {
            // Use local storage token if available
            const token = localStorage.getItem('github_access_token');
            const headers: HeadersInit = {};
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const res = await fetch(`${LUXRIG_BRIDGE_URL}/github/repos`, { headers });

            if (!res.ok) {
                throw new Error('Failed to fetch repositories');
            }

            const data = await res.json();
            if (Array.isArray(data)) {
                setRepos(data);
            } else if (data.error) {
                throw new Error(data.error);
            }
        } catch (err) {
            const errMessage = err instanceof Error ? err.message : 'Failed to load repositories';
            console.error(err);
            setError(errMessage);
            setRepos([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchSystemStatus = async () => {
        try {
            const res = await fetch(`${LUXRIG_BRIDGE_URL}/system`);
            const data = await res.json();
            setStatus(data);
        } catch (err) {
            console.warn('System status check failed');
        }
    };


    // --- Code Agent Widget Component ---
    const CodeAgentWidget = () => {
        const [prompt, setPrompt] = useState('');
        const [action, setAction] = useState('generate');
        const [isProcessing, setIsProcessing] = useState(false);
        const [result, setResult] = useState<{ result?: { timestamp?: string; code?: string }; error?: string } | null>(null);
        const [models, setModels] = useState<{ id: string; provider: string }[]>([]);
        const [selectedModel, setSelectedModel] = useState('');

        // Fetch available models on mount
        useEffect(() => {
            const fetchModels = async () => {
                try {
                    const res = await fetch(`${LUXRIG_BRIDGE_URL}/llm/models`);
                    const data = await res.json();

                    const allModels = [
                        ...(data.lmstudio || []),
                        ...(data.ollama || [])
                    ];

                    if (allModels.length > 0) {
                        setModels(allModels);
                        setSelectedModel(allModels[0].id);
                    }
                } catch (err) {
                    console.warn('Failed to fetch models:', err);
                }
            };
            fetchModels();
        }, []);

        const handleExecute = async () => {
            if (!prompt.trim()) return;
            setIsProcessing(true);
            setResult(null);

            try {
                const res = await fetch(`${LUXRIG_BRIDGE_URL}/agents/execute`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        agentType: 'code',
                        task: {
                            action: action,
                            prompt: prompt,
                            code: prompt, // For 'review' action, the prompt is treated as code
                            language: 'typescript'
                        },
                        context: {
                            model: selectedModel
                        }
                    })
                });
                const data = await res.json();
                setResult(data);
            } catch (err) {
                console.error(err);
                setResult({ error: 'Failed to execute code agent task.' });
            } finally {
                setIsProcessing(false);
            }
        };

        return (
            <div className="glass-card p-6 h-full flex flex-col">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Cpu className="text-cyan-400" />
                    Code Agent
                </h3>

                <div className="flex-1 flex flex-col gap-4">
                    {/* Action buttons + Model selector row */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex gap-2 p-1 bg-white/5 rounded-lg w-fit">
                            {['generate', 'review', 'security-scan'].map(type => (
                                <button
                                    key={type}
                                    onClick={() => setAction(type)}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${action === type
                                        ? 'bg-cyan-500/20 text-cyan-400 shadow-sm'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    {type.charAt(0).toUpperCase() + type.slice(1)}
                                </button>
                            ))}
                        </div>

                        {/* Model Selector */}
                        {models.length > 0 && (
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">Model:</span>
                                <select
                                    value={selectedModel}
                                    onChange={(e) => setSelectedModel(e.target.value)}
                                    className="px-3 py-1.5 text-xs bg-black/40 border border-white/10 rounded-lg text-gray-300 focus:outline-none focus:border-cyan-500/50 cursor-pointer"
                                >
                                    {models.map((model) => (
                                        <option key={model.id} value={model.id} className="bg-gray-900">
                                            {model.id}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder={action === 'generate' ? "Describe the code you want to generate..." : "Paste code here to review/scan..."}
                        className="flex-1 min-h-[150px] bg-black/40 border border-white/10 rounded-xl p-4 text-sm font-mono text-gray-300 focus:outline-none focus:border-cyan-500/50 resize-none placeholder-gray-600"
                    />

                    {result && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="bg-black/60 rounded-xl border border-white/10 overflow-hidden"
                        >
                            <div className="px-4 py-2 bg-white/5 border-b border-white/5 flex justify-between items-center">
                                <span className="text-xs font-bold text-gray-500 uppercase">Output Log</span>
                                <div className="flex items-center gap-3">
                                    {result.result?.timestamp && (
                                        <span className="text-xs font-mono text-gray-600">
                                            {new Date(result.result.timestamp).toLocaleTimeString()}
                                        </span>
                                    )}
                                    <button
                                        onClick={() => setResult(null)}
                                        className="text-xs text-gray-500 hover:text-red-400 transition-colors flex items-center gap-1"
                                        title="Clear Output"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                        </svg>
                                        Clear
                                    </button>
                                </div>
                            </div>
                            <pre className="p-4 text-xs font-mono text-cyan-100 overflow-x-auto whitespace-pre-wrap max-h-[300px]">
                                {result.result?.code || JSON.stringify(result.result || result, null, 2)}
                            </pre>
                        </motion.div>
                    )}

                    <div className="flex justify-end">
                        <button
                            onClick={handleExecute}
                            disabled={!prompt.trim() || isProcessing}
                            className="btn-primary-cyan flex items-center gap-2 px-6"
                        >
                            {isProcessing ? (
                                <>
                                    <RefreshCw className="animate-spin" size={16} /> Processing...
                                </>
                            ) : (
                                <>
                                    <Terminal size={16} /> Execute
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen pt-20 pb-12">
            {/* Header */}
            <section className="container-main mb-12">
                <motion.div
                    className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div>
                        <div className="flex items-center gap-2 mb-2 text-sm text-cyan-400">
                            <Link href="/studios" className="hover:underline">Studios</Link>
                            <span>/</span>
                            <span>Dev</span>
                        </div>
                        <h1 className="text-4xl font-bold flex items-center gap-3 mb-2">
                            <Terminal className="text-cyan-400" size={40} />
                            Dev Studio
                        </h1>
                        <p className="text-gray-400">
                            Manage your code, infrastructure, and deployments.
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={fetchRepos}
                            className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                            title="Refresh"
                        >
                            <RefreshCw size={20} />
                        </button>
                        <Link
                            href="/integrations"
                            className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 text-cyan-400 rounded-lg hover:bg-cyan-500/20 transition-colors"
                        >
                            <Github size={18} />
                            Manage Connection
                        </Link>
                    </div>
                </motion.div>
            </section>

            {/* Dashboard Grid */}
            <div className="container-main grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Code Agent (Takes priority) */}
                <section className="lg:col-span-2 min-h-[500px]">
                    <CodeAgentWidget />
                </section>

                {/* Right Column: System & Status */}
                <aside className="space-y-6">
                    {/* System Resources */}
                    <motion.div
                        className="glass-card p-6"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Cpu className="text-green-400" />
                            System Resources
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-400">Memory Usage</span>
                                    <span className="text-cyan-400">{status?.memory?.used || 0} MB</span>
                                </div>
                                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-cyan-500"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(((status?.memory?.used || 0) / 16384) * 100, 100)}%` }}
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-400">GPU Load</span>
                                    <span className="text-purple-400">{status?.gpu?.load || 0}%</span>
                                </div>
                                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-purple-500"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(status?.gpu?.load || 0, 100)}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-white/10 grid grid-cols-2 gap-4">
                            <div className="text-center p-2 bg-white/5 rounded-lg">
                                <div className="text-xs text-gray-500 mb-1">Node</div>
                                <div className="font-mono text-sm">{status?.nodeVersion || 'v18.x'}</div>
                            </div>
                            <div className="text-center p-2 bg-white/5 rounded-lg">
                                <div className="text-xs text-gray-500 mb-1">Platform</div>
                                <div className="font-mono text-sm capitalize">{status?.platform || 'windows'}</div>
                            </div>
                        </div>
                    </motion.div>
                </aside>

                {/* Bottom Full Width: Repositories */}
                <section className="lg:col-span-3">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <GitBranch className="text-purple-400" />
                        Active Repositories
                    </h2>

                    {loading ? (
                        <div className="flex items-center justify-center h-48 glass-card">
                            <div className="animate-spin text-4xl text-cyan-400">⚙️</div>
                        </div>
                    ) : error ? (
                        <div className="glass-card p-12 text-center flex flex-col items-center">
                            <Github size={48} className="text-gray-600 mb-4" />
                            <h3 className="text-xl font-bold text-white mb-2">GitHub Not Connected</h3>
                            <p className="text-gray-400 mb-6 max-w-md">
                                Connect your GitHub account to manage repositories and track deployments directly from Nexus.
                            </p>
                            <Link
                                href="/integrations"
                                className="px-6 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center gap-2"
                            >
                                <Github size={18} /> Connect Account
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {repos.map((repo, i) => (
                                <motion.a
                                    key={repo.id}
                                    href={repo.html_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="glass-card p-4 hover:border-cyan-500/50 transition-colors group flex flex-col"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <Folder size={18} className="text-cyan-400 flex-shrink-0" />
                                            <span className="font-bold group-hover:text-cyan-400 transition-colors truncate">
                                                {repo.name}
                                            </span>
                                        </div>
                                        {repo.visibility === 'public' ? (
                                            <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 text-[10px] uppercase">
                                                Public
                                            </span>
                                        ) : (
                                            <span className="px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 text-[10px] uppercase">
                                                Private
                                            </span>
                                        )}
                                    </div>

                                    <p className="text-sm text-gray-400 line-clamp-2 mb-4 flex-1">
                                        {repo.description || "No description provided."}
                                    </p>

                                    <div className="flex items-center justify-between text-xs text-gray-500 border-t border-white/5 pt-3">
                                        <div className="flex items-center gap-3">
                                            {repo.language && (
                                                <span className="flex items-center gap-1.5">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                                                    {repo.language}
                                                </span>
                                            )}
                                            <span className="flex items-center gap-1">
                                                ★ {repo.stargazers_count}
                                            </span>
                                        </div>
                                        <span>{formatRelativeTime(repo.updated_at)}</span>
                                    </div>
                                </motion.a>
                            ))}

                            {repos.length === 0 && !error && (
                                <div className="col-span-full py-12 text-center text-gray-500 glass-card">
                                    No repositories found.
                                </div>
                            )}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
