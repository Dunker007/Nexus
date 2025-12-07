'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { LUXRIG_BRIDGE_URL } from '@/lib/utils';
import { Terminal, Cpu, GitBranch, Github, ExternalLink, RefreshCw, Folder } from 'lucide-react';
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
    const [status, setStatus] = useState<any>(null);

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
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to load repositories');
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

                {/* Repositories */}
                <section className="lg:col-span-2">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <GitBranch className="text-purple-400" />
                        Active Repositories
                    </h2>

                    {loading ? (
                        <div className="flex items-center justify-center h-64 glass-card">
                            <div className="animate-spin text-4xl text-cyan-400">⚙️</div>
                        </div>
                    ) : error ? (
                        <div className="glass-card p-8 text-center">
                            <p className="text-red-400 mb-4">{error}</p>
                            <button
                                onClick={fetchRepos}
                                className="btn-primary"
                            >
                                Retry Connection
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {repos.map((repo, i) => (
                                <motion.a
                                    key={repo.id}
                                    href={repo.html_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="glass-card p-4 hover:border-cyan-500/50 transition-colors group"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <Folder size={18} className="text-cyan-400" />
                                            <span className="font-bold group-hover:text-cyan-400 transition-colors">
                                                {repo.name}
                                            </span>
                                        </div>
                                        {repo.visibility === 'public' ? (
                                            <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 text-xs">
                                                Public
                                            </span>
                                        ) : (
                                            <span className="px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 text-xs">
                                                Private
                                            </span>
                                        )}
                                    </div>

                                    <p className="text-sm text-gray-400 line-clamp-2 h-10 mb-4">
                                        {repo.description || "No description provided."}
                                    </p>

                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                        <div className="flex items-center gap-3">
                                            {repo.language && (
                                                <span className="flex items-center gap-1">
                                                    <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                                                    {repo.language}
                                                </span>
                                            )}
                                            <span>⭐ {repo.stargazers_count}</span>
                                        </div>
                                        <span>{formatRelativeTime(repo.updated_at)}</span>
                                    </div>
                                </motion.a>
                            ))}

                            {repos.length === 0 && !error && (
                                <div className="col-span-2 text-center py-12 text-gray-400 glass-card">
                                    No repositories found.
                                </div>
                            )}
                        </div>
                    )}
                </section>

                {/* System Status & Tools */}
                <aside className="space-y-6">
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
                                <div className="text-xs text-gray-500 mb-1">Node Version</div>
                                <div className="font-mono text-sm">{status?.nodeVersion || 'v18.x'}</div>
                            </div>
                            <div className="text-center p-2 bg-white/5 rounded-lg">
                                <div className="text-xs text-gray-500 mb-1">Platform</div>
                                <div className="font-mono text-sm capitalize">{status?.platform || 'windows'}</div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        className="glass-card p-6"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Terminal className="text-yellow-400" />
                            Quick Actions
                        </h3>

                        <div className="space-y-2">
                            <button className="w-full text-left px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-3">
                                <span className="p-1.5 bg-blue-500/20 text-blue-400 rounded">
                                    <Github size={16} />
                                </span>
                                <div>
                                    <div className="font-medium text-sm">Clone Repository</div>
                                    <div className="text-xs text-gray-500">Clone from GitHub URL</div>
                                </div>
                            </button>

                            <button className="w-full text-left px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-3">
                                <span className="p-1.5 bg-purple-500/20 text-purple-400 rounded">
                                    <Terminal size={16} />
                                </span>
                                <div>
                                    <div className="font-medium text-sm">New Terminal</div>
                                    <div className="text-xs text-gray-500">Open system terminal</div>
                                </div>
                            </button>
                        </div>
                    </motion.div>
                </aside>
            </div>
        </div>
    );
}
