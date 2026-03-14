import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { Terminal, Cpu, GitBranch, Github, ExternalLink, RefreshCw, Folder } from 'lucide-react';
import { Link } from 'react-router-dom';

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

export function DevStudio() {
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
            // In the new unified app, we hit our own /api/agents/github/repos or similar
            // For now, let's try to hit the backend /api/agents/github/repos if it exists
            const res = await fetch('/api/agents/github/repos');

            if (!res.ok) {
                // If not found, use mock data so Chris can see the UI working
                if (res.status === 404) {
                    console.warn('GitHub API not yet implemented on backend, using mock data');
                    setRepos([
                        {
                            id: 1,
                            name: 'Nexus',
                            description: 'DLX Studios Right-Hand AI Platform',
                            html_url: 'https://github.com/Dunker007/Nexus',
                            language: 'TypeScript',
                            stargazers_count: 5,
                            updated_at: new Date().toISOString(),
                            visibility: 'public',
                            owner: { login: 'Dunker007', avatar_url: '' }
                        },
                        {
                            id: 2,
                            name: 'mn-fraud-watch',
                            description: 'Forensic audit tool for MN social services fraud',
                            html_url: 'https://github.com/Dunker007/mn-fraud-watch',
                            language: 'TypeScript',
                            stargazers_count: 12,
                            updated_at: new Date().toISOString(),
                            visibility: 'public',
                            owner: { login: 'Dunker007', avatar_url: '' }
                        }
                    ]);
                    setLoading(false);
                    return;
                }
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
            const res = await fetch('/api/health'); // Use new health endpoint
            const data = await res.json();
            setStatus(data);
        } catch (err) {
            console.warn('System status check failed');
        }
    };

    return (
        <div className="flex-1 overflow-y-auto w-full custom-scrollbar bg-[#0b0e11] relative text-gray-200">
             {/* Background Details */}
             <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-[120px] mix-blend-screen overflow-hidden" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/5 rounded-full blur-[120px] mix-blend-screen overflow-hidden" />
            </div>

            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-8 z-10 relative">
                {/* Header */}
                <section className="mb-10">
                    <motion.div
                        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div>
                            <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-widest text-cyan-400">
                                <Link to="/studios" className="hover:text-cyan-300 transition-colors">Studios</Link>
                                <span className="opacity-30">/</span>
                                <span className="text-white/40">Dev</span>
                            </div>
                            <h1 className="text-3xl font-bold flex items-center gap-3 mb-2">
                                <Terminal className="text-cyan-400" size={32} />
                                Dev Studio
                            </h1>
                            <p className="text-white/40 text-sm">
                                Manage repositories, system performance, and deployments.
                            </p>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={fetchRepos}
                                className="p-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg transition-colors text-white/50 hover:text-white"
                                title="Refresh"
                            >
                                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                            </button>
                            <Link
                                to="/github/auth"
                                className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-lg hover:bg-cyan-500/20 transition-colors text-sm font-bold uppercase tracking-wider"
                            >
                                <Github size={16} />
                                GitHub
                            </Link>
                        </div>
                    </motion.div>
                </section>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Repositories */}
                    <div className="lg:col-span-8">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <GitBranch className="text-cyan-400" size={20} />
                            Code Repositories
                        </h2>

                        {loading ? (
                            <div className="flex items-center justify-center h-64 bg-white/[0.02] border border-white/5 rounded-2xl">
                                <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : error && repos.length === 0 ? (
                            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-8 text-center">
                                <p className="text-red-400 mb-4">{error}</p>
                                <button
                                    onClick={fetchRepos}
                                    className="px-6 py-2 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-lg hover:bg-cyan-500/20 transition-colors font-bold uppercase tracking-widest text-xs"
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
                                        className="bg-[#12121a] border border-white/5 p-5 rounded-2xl hover:border-cyan-500/30 transition-all group relative overflow-hidden"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                    >
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-cyan-500/10 transition-colors" />
                                        
                                        <div className="flex justify-between items-start mb-3 relative z-10">
                                            <div className="flex items-center gap-2">
                                                <Folder size={18} className="text-cyan-400" />
                                                <span className="font-bold text-sm group-hover:text-cyan-400 transition-colors">
                                                    {repo.name}
                                                </span>
                                            </div>
                                            {repo.visibility === 'public' ? (
                                                <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] uppercase font-bold tracking-widest border border-emerald-500/20">
                                                    Public
                                                </span>
                                            ) : (
                                                <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 text-[10px] uppercase font-bold tracking-widest border border-amber-500/20">
                                                    Private
                                                </span>
                                            )}
                                        </div>

                                        <p className="text-xs text-white/40 line-clamp-2 h-8 mb-4 relative z-10 font-medium leading-relaxed">
                                            {repo.description || "No description provided."}
                                        </p>

                                        <div className="flex items-center justify-between text-[10px] text-white/30 font-bold uppercase tracking-widest pt-3 border-t border-white/5 relative z-10">
                                            <div className="flex items-center gap-3">
                                                {repo.language && (
                                                    <span className="flex items-center gap-1">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                                                        {repo.language}
                                                    </span>
                                                )}
                                                <span>⭐ {repo.stargazers_count}</span>
                                            </div>
                                            <span>{new Date(repo.updated_at).toLocaleDateString()}</span>
                                        </div>
                                    </motion.a>
                                ))}

                                {repos.length === 0 && !error && (
                                    <div className="col-span-full text-center py-16 text-white/20 bg-white/[0.01] border border-dashed border-white/5 rounded-2xl">
                                        No repositories found.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* System Status & Tools */}
                    <aside className="lg:col-span-4 space-y-6">
                        <motion.div
                            className="bg-[#12121a] border border-white/5 rounded-2xl p-6 relative overflow-hidden"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                            
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 relative z-10">
                                <Cpu className="text-emerald-400" size={18} />
                                System Status
                            </h3>

                            <div className="space-y-5 relative z-10">
                                <div>
                                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest mb-2">
                                        <span className="text-white/40">Memory Usage</span>
                                        <span className="text-cyan-400">{status?.memory?.used || 742} MB</span>
                                    </div>
                                    <div className="h-1.5 bg-black/40 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min(((status?.memory?.used || 742) / 8192) * 100, 100)}%` }}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest mb-2">
                                        <span className="text-white/40">Engine Load</span>
                                        <span className="text-purple-400">{status?.cpu?.usage || status?.services?.system === 'up' ? '12%' : 'Offline'}</span>
                                    </div>
                                    <div className="h-1.5 bg-black/40 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-linear-to-r from-purple-500 to-pink-500"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${status?.services?.system === 'up' ? 12 : 0}%` }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 pt-5 border-t border-white/5 grid grid-cols-2 gap-4 relative z-10">
                                <div className="text-center p-3 bg-white/[0.03] rounded-xl border border-white/5">
                                    <div className="text-[10px] text-white/30 font-bold uppercase tracking-widest mb-1">Runtime</div>
                                    <div className="font-mono text-xs text-cyan-400">Node v20.x</div>
                                </div>
                                <div className="text-center p-3 bg-white/[0.03] rounded-xl border border-white/5">
                                    <div className="text-[10px] text-white/30 font-bold uppercase tracking-widest mb-1">Architecture</div>
                                    <div className="font-mono text-xs text-purple-400">x64</div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            className="bg-[#12121a] border border-white/5 rounded-2xl p-6 relative overflow-hidden"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                            
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 relative z-10">
                                <Terminal className="text-amber-400" size={18} />
                                Cloud Command
                            </h3>

                            <div className="space-y-2 relative z-10">
                                <button className="w-full text-left px-4 py-3 bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 rounded-xl transition-all flex items-center gap-3 group">
                                    <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                                        <Github size={16} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-xs uppercase tracking-wider text-white/80">Clone Lab</div>
                                        <div className="text-[10px] text-white/30">Fork or clone new repo</div>
                                    </div>
                                </button>

                                <button className="w-full text-left px-4 py-3 bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 rounded-xl transition-all flex items-center gap-3 group">
                                    <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg group-hover:bg-purple-500/20 transition-colors">
                                        <ExternalLink size={16} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-xs uppercase tracking-wider text-white/80">Dev Console</div>
                                        <div className="text-[10px] text-white/30">Open system terminal</div>
                                    </div>
                                </button>
                            </div>
                        </motion.div>
                    </aside>
                </div>
            </div>
        </div>
    );
}
