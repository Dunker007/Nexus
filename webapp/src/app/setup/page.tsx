'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect } from 'react';

import { LUXRIG_BRIDGE_URL } from '@/lib/utils';

const BRIDGE_URL = LUXRIG_BRIDGE_URL;

interface Tool {
    name: string;
    icon: string;
    category: string;
    checkCommand?: string;
    installUrl: string;
    installCmd?: string;
    description: string;
    required: boolean;
    status: 'checking' | 'installed' | 'missing' | 'outdated' | 'error';
    version?: string;
    latestVersion?: string;
}

const tools: Tool[] = [
    // Core Dev Tools
    { name: 'Node.js', icon: '🟢', category: 'Core', checkCommand: 'node --version', installUrl: 'https://nodejs.org', installCmd: 'winget install OpenJS.NodeJS.LTS', description: 'JavaScript runtime for web development', required: true, status: 'checking' },
    { name: 'Python', icon: '🐍', category: 'Core', checkCommand: 'python --version', installUrl: 'https://python.org', installCmd: 'winget install Python.Python.3.12', description: 'Essential for ML/AI and scripting', required: true, status: 'checking' },
    { name: 'Git', icon: '📦', category: 'Core', checkCommand: 'git --version', installUrl: 'https://git-scm.com', installCmd: 'winget install Git.Git', description: 'Version control system', required: true, status: 'checking' },
    { name: 'Docker', icon: '🐳', category: 'Core', checkCommand: 'docker --version', installUrl: 'https://docker.com', installCmd: 'winget install Docker.DockerDesktop', description: 'Container platform for dev environments', required: false, status: 'checking' },

    // AI Tools
    { name: 'LM Studio', icon: '🖥️', category: 'AI', checkCommand: 'lms --version', installUrl: 'https://lmstudio.ai', description: 'Local LLM runner with beautiful UI', required: true, status: 'checking' },
    { name: 'Ollama', icon: '🦙', category: 'AI', checkCommand: 'ollama --version', installUrl: 'https://ollama.ai', installCmd: 'winget install Ollama.Ollama', description: 'Simple CLI for running LLMs locally', required: false, status: 'checking' },
    { name: 'Hugging Face CLI', icon: '🤗', category: 'AI', checkCommand: 'huggingface-cli --version', installUrl: 'https://huggingface.co/docs/huggingface_hub/guides/cli', installCmd: 'pip install huggingface_hub', description: 'Download models from HF Hub', required: false, status: 'checking' },

    // Package Managers
    { name: 'Chocolatey', icon: '🍫', category: 'Package Managers', checkCommand: 'choco --version', installUrl: 'https://chocolatey.org/install', description: 'Windows package manager', required: false, status: 'checking' },
    { name: 'Winget', icon: '📥', category: 'Package Managers', checkCommand: 'winget --version', installUrl: 'https://learn.microsoft.com/en-us/windows/package-manager/winget/', description: 'Built-in Windows package manager', required: false, status: 'checking' },
    { name: 'pnpm', icon: '📦', category: 'Package Managers', checkCommand: 'pnpm --version', installUrl: 'https://pnpm.io', installCmd: 'npm install -g pnpm', description: 'Fast, disk space efficient package manager', required: false, status: 'checking' },

    // Creative Apps
    { name: 'DaVinci Resolve', icon: '🎬', category: 'Creative', installUrl: 'https://www.blackmagicdesign.com/products/davinciresolve', description: 'Professional video editing & color grading', required: false, status: 'checking' },
    { name: 'OBS Studio', icon: '📹', category: 'Creative', checkCommand: 'obs --version', installUrl: 'https://obsproject.com', installCmd: 'winget install OBSProject.OBSStudio', description: 'Open source streaming/recording', required: false, status: 'checking' },
    { name: 'Blender', icon: '🎨', category: 'Creative', checkCommand: 'blender --version', installUrl: 'https://blender.org', installCmd: 'winget install BlenderFoundation.Blender', description: '3D modeling, animation, rendering', required: false, status: 'checking' },
    { name: 'Figma', icon: '🎨', category: 'Creative', installUrl: 'https://figma.com', description: 'Collaborative design tool', required: false, status: 'checking' },

    // IDEs & Editors
    { name: 'VS Code', icon: '💻', category: 'Editors', checkCommand: 'code --version', installUrl: 'https://code.visualstudio.com', installCmd: 'winget install Microsoft.VisualStudioCode', description: 'Popular code editor', required: true, status: 'checking' },
    { name: 'Cursor', icon: '✨', category: 'Editors', installUrl: 'https://cursor.sh', description: 'AI-first code editor', required: false, status: 'checking' },

    // Database
    { name: 'PostgreSQL', icon: '🐘', category: 'Database', checkCommand: 'psql --version', installUrl: 'https://postgresql.org', installCmd: 'winget install PostgreSQL.PostgreSQL', description: 'Powerful open-source database', required: false, status: 'checking' },
    { name: 'Redis', icon: '🔴', category: 'Database', checkCommand: 'redis-cli --version', installUrl: 'https://redis.io', description: 'In-memory data store', required: false, status: 'checking' },
];

const statusConfig = {
    checking: { color: 'text-gray-400', bg: 'bg-gray-500/20', label: 'Checking...' },
    installed: { color: 'text-green-400', bg: 'bg-green-500/20', label: 'Installed' },
    missing: { color: 'text-red-400', bg: 'bg-red-500/20', label: 'Not Found' },
    outdated: { color: 'text-yellow-400', bg: 'bg-yellow-500/20', label: 'Update Available' },
    error: { color: 'text-red-400', bg: 'bg-red-500/20', label: 'Error' },
};

export default function SetupPage() {
    const [toolsState, setToolsState] = useState<Tool[]>(tools);
    const [checking, setChecking] = useState(false);
    const [systemInfo, setSystemInfo] = useState<any>(null);

    useEffect(() => {
        checkAllTools();
        fetchSystemInfo();
    }, []);

    async function fetchSystemInfo() {
        try {
            const res = await fetch(`${BRIDGE_URL}/system`);
            if (res.ok) {
                const data = await res.json();
                setSystemInfo(data);
            }
        } catch (e) {
            console.error('Failed to fetch system info');
        }
    }

    async function checkAllTools() {
        setChecking(true);

        // In a real implementation, we'd call the Bridge API to check each tool
        // For now, we'll simulate with random results after a delay

        for (let i = 0; i < toolsState.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 100));

            setToolsState(prev => prev.map((tool, idx) => {
                if (idx === i) {
                    // Simulate random status for demo
                    // In production, call /system/check-tool endpoint
                    const statuses: Tool['status'][] = ['installed', 'installed', 'installed', 'missing', 'outdated'];
                    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
                    return {
                        ...tool,
                        status: tool.name === 'Node.js' || tool.name === 'Git' || tool.name === 'VS Code'
                            ? 'installed'
                            : randomStatus,
                        version: randomStatus === 'installed' ? '1.0.0' : undefined
                    };
                }
                return tool;
            }));
        }

        setChecking(false);
    }

    const groupedTools = toolsState.reduce((acc, tool) => {
        if (!acc[tool.category]) acc[tool.category] = [];
        acc[tool.category].push(tool);
        return acc;
    }, {} as Record<string, Tool[]>);

    const installedCount = toolsState.filter(t => t.status === 'installed').length;
    const missingCount = toolsState.filter(t => t.status === 'missing').length;
    const requiredMissing = toolsState.filter(t => t.required && t.status === 'missing');

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
                            Dev <span className="text-gradient">Setup</span>
                        </h1>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                            Check your development environment. Find what's installed, what's missing,
                            and get one-click install links.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Summary Cards */}
            <section className="container-main pb-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <motion.div
                        className="glass-card text-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="text-3xl font-bold text-green-400">{installedCount}</div>
                        <div className="text-sm text-gray-500">Installed</div>
                    </motion.div>
                    <motion.div
                        className="glass-card text-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <div className="text-3xl font-bold text-red-400">{missingCount}</div>
                        <div className="text-sm text-gray-500">Missing</div>
                    </motion.div>
                    <motion.div
                        className="glass-card text-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="text-3xl font-bold text-cyan-400">{toolsState.length}</div>
                        <div className="text-sm text-gray-500">Total Tracked</div>
                    </motion.div>
                    <motion.div
                        className="glass-card text-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <button
                            onClick={checkAllTools}
                            disabled={checking}
                            className="btn-primary text-sm w-full"
                        >
                            {checking ? 'Checking...' : '🔄 Re-scan'}
                        </button>
                    </motion.div>
                </div>
            </section>

            {/* Warning if required tools missing */}
            {requiredMissing.length > 0 && (
                <section className="container-main pb-8">
                    <motion.div
                        className="glass-card border-2 border-red-500/30"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <div className="flex items-start gap-4">
                            <span className="text-3xl">⚠️</span>
                            <div>
                                <h3 className="font-bold text-red-400">Required Tools Missing</h3>
                                <p className="text-gray-400 text-sm mb-2">
                                    The following required tools are not installed:
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {requiredMissing.map(tool => (
                                        <a
                                            key={tool.name}
                                            href={tool.installUrl}
                                            target="_blank"
                                            className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm hover:bg-red-500/30"
                                        >
                                            {tool.icon} {tool.name}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </section>
            )}

            {/* Hardware Info */}
            {systemInfo && (
                <section className="container-main pb-8">
                    <h2 className="text-xl font-bold mb-4">🖥️ System Hardware</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="glass-card">
                            <div className="text-sm text-gray-500 mb-1">GPU</div>
                            <div className="font-bold text-cyan-400">{systemInfo.gpu?.name || 'Unknown'}</div>
                            <div className="text-xs text-gray-500">{systemInfo.gpu?.vram || 'N/A'} VRAM</div>
                        </div>
                        <div className="glass-card">
                            <div className="text-sm text-gray-500 mb-1">RAM</div>
                            <div className="font-bold text-purple-400">
                                {systemInfo.memory?.total ? `${(systemInfo.memory.total / 1024).toFixed(0)}GB` : 'N/A'}
                            </div>
                            <div className="text-xs text-gray-500">
                                {systemInfo.memory?.used ? `${(systemInfo.memory.used / 1024).toFixed(1)}GB used` : ''}
                            </div>
                        </div>
                        <div className="glass-card">
                            <div className="text-sm text-gray-500 mb-1">GPU Temp</div>
                            <div className="font-bold text-yellow-400">{systemInfo.gpu?.temp || 'N/A'}°C</div>
                        </div>
                        <div className="glass-card">
                            <div className="text-sm text-gray-500 mb-1">GPU Power</div>
                            <div className="font-bold text-green-400">{systemInfo.gpu?.power || 'N/A'}W</div>
                        </div>
                    </div>
                </section>
            )}

            {/* Tools by Category */}
            <section className="container-main pb-16">
                <motion.div
                    className="space-y-8"
                    initial="initial"
                    animate="animate"
                    variants={{ animate: { transition: { staggerChildren: 0.1 } } }}
                >
                    {Object.entries(groupedTools).map(([category, categoryTools]) => (
                        <motion.div
                            key={category}
                            variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }}
                        >
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                {category}
                                <span className="text-sm text-gray-500 font-normal">
                                    ({categoryTools.filter(t => t.status === 'installed').length}/{categoryTools.length})
                                </span>
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {categoryTools.map((tool) => {
                                    const config = statusConfig[tool.status];
                                    return (
                                        <div
                                            key={tool.name}
                                            className={`glass-card flex items-center justify-between ${tool.status === 'missing' && tool.required ? 'border border-red-500/30' : ''
                                                }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <span className="text-2xl">{tool.icon}</span>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium">{tool.name}</span>
                                                        {tool.required && (
                                                            <span className="px-1.5 py-0.5 bg-cyan-500/20 text-cyan-400 rounded text-xs">
                                                                Required
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-gray-500">{tool.description}</p>
                                                    {tool.version && (
                                                        <p className="text-xs text-gray-400">v{tool.version}</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <span className={`px-3 py-1 rounded-full text-xs ${config.bg} ${config.color}`}>
                                                    {config.label}
                                                </span>

                                                {tool.status === 'missing' && (
                                                    <a
                                                        href={tool.installUrl}
                                                        target="_blank"
                                                        className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded text-sm hover:bg-cyan-500/30"
                                                    >
                                                        Install →
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </section>

            {/* Install All Script */}
            <section className="section-padding bg-[#050508]">
                <div className="container-main">
                    <h2 className="text-2xl font-bold mb-6">⚡ Quick Install Scripts</h2>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="glass-card">
                            <h3 className="font-bold mb-3">🍫 Chocolatey (Run as Admin)</h3>
                            <pre className="bg-[#0a0e1a] p-4 rounded-lg text-sm overflow-x-auto">
                                <code className="text-green-400">
                                    {`choco install nodejs python git docker-desktop vscode ollama obs-studio blender -y`}
                                </code>
                            </pre>
                        </div>

                        <div className="glass-card">
                            <h3 className="font-bold mb-3">📥 Winget</h3>
                            <pre className="bg-[#0a0e1a] p-4 rounded-lg text-sm overflow-x-auto">
                                <code className="text-cyan-400">
                                    {`winget install OpenJS.NodeJS.LTS Python.Python.3.12 Git.Git Docker.DockerDesktop Microsoft.VisualStudioCode Ollama.Ollama`}
                                </code>
                            </pre>
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
