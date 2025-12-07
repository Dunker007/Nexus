'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';

// Simulated git status (would come from Bridge API)
const repoStatus = {
    branch: 'main',
    ahead: 0,
    behind: 0,
    staged: 3,
    modified: 2,
    untracked: 1,
    lastCommit: {
        message: '🚀 DLX Studio WebOS v1.0 - 38 pages, AI Chat, Finance',
        author: 'Dunker007',
        time: '2 minutes ago',
        hash: 'a3b4c5d'
    }
};

const recentCommits = [
    { hash: 'a3b4c5d', message: '🚀 DLX Studio WebOS v1.0', time: '2 min ago', author: 'Dunker007' },
    { hash: 'f8e9d0c', message: '✨ Added Smart Home controls', time: '1 day ago', author: 'Dunker007' },
    { hash: 'b1a2c3d', message: '💰 Finance suite complete', time: '2 days ago', author: 'Dunker007' },
    { hash: 'e4f5g6h', message: '🤖 AI Chat integration', time: '3 days ago', author: 'Dunker007' },
    { hash: 'i7j8k9l', message: '🎨 Initial UI setup', time: '1 week ago', author: 'Dunker007' },
];

const changedFiles = [
    { file: 'src/app/portfolio/page.tsx', status: 'modified', lines: '+45 -12' },
    { file: 'src/app/trading/page.tsx', status: 'modified', lines: '+23 -5' },
    { file: 'src/app/github/page.tsx', status: 'new', lines: '+280' },
    { file: 'src/components/GitPanel.tsx', status: 'staged', lines: '+120' },
    { file: 'src/lib/git-utils.ts', status: 'staged', lines: '+45' },
    { file: 'package.json', status: 'staged', lines: '+2 -1' },
];

const quickActions = [
    {
        id: 'save',
        name: 'Save All Changes',
        icon: '💾',
        desc: 'Stage all files and commit',
        command: 'git add . && git commit',
        danger: false
    },
    {
        id: 'push',
        name: 'Push to GitHub',
        icon: '⬆️',
        desc: 'Upload your commits',
        command: 'git push origin main',
        danger: false
    },
    {
        id: 'pull',
        name: 'Get Latest',
        icon: '⬇️',
        desc: 'Download new changes',
        command: 'git pull origin main',
        danger: false
    },
    {
        id: 'sync',
        name: 'Sync Everything',
        icon: '🔄',
        desc: 'Pull then push',
        command: 'git pull && git push',
        danger: false
    },
    {
        id: 'undo',
        name: 'Undo Last Commit',
        icon: '↩️',
        desc: 'Revert the last change',
        command: 'git reset --soft HEAD~1',
        danger: true
    },
    {
        id: 'discard',
        name: 'Discard All Changes',
        icon: '🗑️',
        desc: 'Reset to last commit',
        command: 'git checkout .',
        danger: true
    },
];

const branches = [
    { name: 'main', current: true, commits: 156 },
    { name: 'develop', current: false, commits: 12 },
    { name: 'feature/trading-bots', current: false, commits: 5 },
];

export default function GitHubPage() {
    const [commitMessage, setCommitMessage] = useState('');
    const [showConfirm, setShowConfirm] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    function handleQuickAction(action: typeof quickActions[0]) {
        if (action.danger) {
            setShowConfirm(action.id);
        } else {
            executeAction(action);
        }
    }

    function executeAction(action: typeof quickActions[0]) {
        setIsProcessing(true);
        // Simulate action
        setTimeout(() => {
            setIsProcessing(false);
            setShowConfirm(null);
        }, 2000);
    }

    function handleSaveAll() {
        if (!commitMessage.trim()) {
            alert('Please enter a commit message');
            return;
        }
        setIsProcessing(true);
        setTimeout(() => setIsProcessing(false), 2000);
    }

    return (
        <div className="min-h-screen pt-8">
            {/* Header */}
            <section className="section-padding pb-8">
                <div className="container-main">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-4xl md:text-5xl font-bold">
                                <span className="text-gradient">GitHub</span>
                            </h1>
                            <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                                ✓ Connected
                            </span>
                        </div>
                        <p className="text-gray-400">Simple git management for vibe coders. No terminal needed!</p>
                    </motion.div>
                </div>
            </section>

            {/* Status Bar */}
            <section className="container-main pb-6">
                <motion.div
                    className="glass-card flex flex-wrap items-center gap-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="flex items-center gap-2">
                        <span className="text-purple-400">🌿</span>
                        <span className="font-bold">{repoStatus.branch}</span>
                    </div>
                    <div className="flex gap-4 text-sm">
                        {repoStatus.staged > 0 && (
                            <span className="text-green-400">✓ {repoStatus.staged} staged</span>
                        )}
                        {repoStatus.modified > 0 && (
                            <span className="text-yellow-400">✎ {repoStatus.modified} modified</span>
                        )}
                        {repoStatus.untracked > 0 && (
                            <span className="text-gray-400">+ {repoStatus.untracked} new</span>
                        )}
                    </div>
                    <div className="ml-auto text-sm text-gray-500">
                        Last: "{repoStatus.lastCommit.message.slice(0, 40)}..." • {repoStatus.lastCommit.time}
                    </div>
                </motion.div>
            </section>

            <div className="container-main pb-16 grid lg:grid-cols-3 gap-6">
                {/* Main Area */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Quick Commit */}
                    <motion.div
                        className="glass-card"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <h2 className="text-xl font-bold mb-4">💾 Save Your Work</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-gray-400 mb-2 block">What did you change?</label>
                                <input
                                    type="text"
                                    value={commitMessage}
                                    onChange={(e) => setCommitMessage(e.target.value)}
                                    placeholder="e.g., Added new trading bot feature"
                                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3"
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleSaveAll}
                                    disabled={isProcessing}
                                    className="flex-1 py-3 bg-green-500 text-black font-bold rounded-lg hover:bg-green-400 disabled:opacity-50"
                                >
                                    {isProcessing ? '⏳ Saving...' : '💾 Save All & Push to GitHub'}
                                </button>
                            </div>
                            <p className="text-xs text-gray-500">
                                This will stage all changes, create a commit, and push to GitHub in one click!
                            </p>
                        </div>
                    </motion.div>

                    {/* Changed Files */}
                    <motion.div
                        className="glass-card"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                    >
                        <h2 className="text-xl font-bold mb-4">📝 Changed Files</h2>
                        <div className="space-y-2">
                            {changedFiles.map((file) => (
                                <div
                                    key={file.file}
                                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className={`w-2 h-2 rounded-full ${file.status === 'staged' ? 'bg-green-500' :
                                                file.status === 'modified' ? 'bg-yellow-500' : 'bg-gray-500'
                                            }`}></span>
                                        <span className="font-mono text-sm">{file.file}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs text-gray-500">{file.lines}</span>
                                        <span className={`text-xs px-2 py-0.5 rounded ${file.status === 'staged' ? 'bg-green-500/20 text-green-400' :
                                                file.status === 'modified' ? 'bg-yellow-500/20 text-yellow-400' :
                                                    'bg-gray-500/20 text-gray-400'
                                            }`}>
                                            {file.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Recent Commits */}
                    <motion.div
                        className="glass-card"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h2 className="text-xl font-bold mb-4">📜 Recent History</h2>
                        <div className="space-y-3">
                            {recentCommits.map((commit, i) => (
                                <div
                                    key={commit.hash}
                                    className="flex items-center gap-4 p-3 bg-white/5 rounded-lg"
                                >
                                    <div className="relative">
                                        <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
                                        {i < recentCommits.length - 1 && (
                                            <div className="absolute top-3 left-1.5 w-0.5 h-8 bg-gray-700 -translate-x-1/2"></div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-medium">{commit.message}</div>
                                        <div className="text-xs text-gray-500">
                                            <span className="font-mono">{commit.hash}</span> • {commit.author} • {commit.time}
                                        </div>
                                    </div>
                                    <button className="text-sm text-cyan-400 hover:underline">View</button>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Quick Actions */}
                    <motion.div
                        className="glass-card"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h3 className="font-bold mb-4">⚡ Quick Actions</h3>
                        <div className="space-y-2">
                            {quickActions.map((action) => (
                                <button
                                    key={action.id}
                                    onClick={() => handleQuickAction(action)}
                                    className={`w-full p-3 rounded-lg text-left transition-colors ${action.danger
                                            ? 'bg-red-500/10 hover:bg-red-500/20 border border-red-500/30'
                                            : 'bg-white/5 hover:bg-white/10'
                                        }`}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <span>{action.icon}</span>
                                        <span className="font-medium">{action.name}</span>
                                    </div>
                                    <p className="text-xs text-gray-500">{action.desc}</p>
                                </button>
                            ))}
                        </div>
                    </motion.div>

                    {/* Branches */}
                    <motion.div
                        className="glass-card"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <h3 className="font-bold mb-4">🌿 Branches</h3>
                        <div className="space-y-2">
                            {branches.map((branch) => (
                                <div
                                    key={branch.name}
                                    className={`flex items-center justify-between p-3 rounded-lg ${branch.current ? 'bg-cyan-500/20' : 'bg-white/5'
                                        }`}
                                >
                                    <div className="flex items-center gap-2">
                                        {branch.current && <span className="text-cyan-400">✓</span>}
                                        <span className={branch.current ? 'font-bold' : ''}>{branch.name}</span>
                                    </div>
                                    <span className="text-xs text-gray-500">{branch.commits} commits</span>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-4 py-2 bg-white/10 rounded-lg text-sm">
                            + New Branch
                        </button>
                    </motion.div>

                    {/* Learn Git */}
                    <motion.div
                        className="glass-card bg-gradient-to-br from-purple-500/10 to-cyan-500/10"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h3 className="font-bold mb-2">🎓 New to Git?</h3>
                        <p className="text-sm text-gray-400 mb-4">
                            Check out our Learn section for beginner-friendly guides!
                        </p>
                        <Link href="/learn#git" className="btn-primary text-sm w-full text-center block">
                            Learn Git Basics →
                        </Link>
                    </motion.div>
                </div>
            </div>

            {/* Confirmation Modal */}
            {showConfirm && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                    <motion.div
                        className="glass-card max-w-md w-full"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <h2 className="text-xl font-bold mb-4">⚠️ Are you sure?</h2>
                        <p className="text-gray-400 mb-6">
                            {showConfirm === 'undo' && 'This will undo your last commit but keep the changes.'}
                            {showConfirm === 'discard' && 'This will permanently discard all uncommitted changes!'}
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowConfirm(null)}
                                className="flex-1 py-2 bg-white/10 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => executeAction(quickActions.find(a => a.id === showConfirm)!)}
                                className="flex-1 py-2 bg-red-500 text-white rounded-lg"
                            >
                                {isProcessing ? 'Processing...' : 'Yes, do it'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Back link */}
            <div className="container-main pb-8">
                <Link href="/" className="text-gray-400 hover:text-cyan-400 transition-colors">
                    ← Back to Dashboard
                </Link>
            </div>
        </div>
    );
}
