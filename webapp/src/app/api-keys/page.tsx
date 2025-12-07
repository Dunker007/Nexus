'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';

const apiKeys = [
    {
        id: '1',
        name: 'Main Production Key',
        key: 'dlx_live_***********************8f3a',
        created: 'Oct 15, 2024',
        lastUsed: '5 minutes ago',
        permissions: ['read', 'write', 'admin'],
        status: 'active'
    },
    {
        id: '2',
        name: 'Trading Bot Integration',
        key: 'dlx_bot_************************j7k2',
        created: 'Nov 1, 2024',
        lastUsed: '2 hours ago',
        permissions: ['read', 'write'],
        status: 'active'
    },
    {
        id: '3',
        name: 'Mobile App',
        key: 'dlx_mob_***********************n4p8',
        created: 'Nov 20, 2024',
        lastUsed: '1 day ago',
        permissions: ['read'],
        status: 'active'
    },
    {
        id: '4',
        name: 'Old Development Key',
        key: 'dlx_dev_***********************x9y1',
        created: 'Oct 10, 2024',
        lastUsed: '30 days ago',
        permissions: ['read', 'write'],
        status: 'revoked'
    },
];

const externalKeys = [
    { name: 'OpenAI API', status: 'configured', icon: '🤖' },
    { name: 'Anthropic API', status: 'configured', icon: '🧠' },
    { name: 'Google Gemini', status: 'not set', icon: '✨' },
    { name: 'Discord Bot Token', status: 'configured', icon: '💬' },
    { name: 'GitHub Token', status: 'configured', icon: '🐙' },
    { name: '3Commas API', status: 'configured', icon: '📈' },
    { name: 'Govee API', status: 'configured', icon: '💡' },
    { name: 'Reolink API', status: 'not set', icon: '📷' },
];

export default function APIKeysPage() {
    const [showNewKey, setShowNewKey] = useState(false);
    const [newKeyName, setNewKeyName] = useState('');
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>(['read']);

    return (
        <div className="min-h-screen pt-8">
            {/* Header */}
            <section className="section-padding pb-8">
                <div className="container-main">
                    <motion.div
                        className="flex items-center justify-between"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold mb-2">
                                <span className="text-gradient">API Keys</span>
                            </h1>
                            <p className="text-gray-400">Manage your API keys and external integrations</p>
                        </div>
                        <button
                            onClick={() => setShowNewKey(true)}
                            className="btn-primary"
                        >
                            + New API Key
                        </button>
                    </motion.div>
                </div>
            </section>

            <div className="container-main pb-16 grid lg:grid-cols-3 gap-6">
                {/* Your API Keys */}
                <div className="lg:col-span-2">
                    <motion.div
                        className="glass-card"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <h2 className="text-xl font-bold mb-4">🔑 Your API Keys</h2>
                        <div className="space-y-4">
                            {apiKeys.map((key) => (
                                <div
                                    key={key.id}
                                    className={`p-4 rounded-lg ${key.status === 'active' ? 'bg-white/5' : 'bg-red-500/10 opacity-60'
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            <h3 className="font-medium">{key.name}</h3>
                                            <span className={`text-xs px-2 py-0.5 rounded ${key.status === 'active'
                                                    ? 'bg-green-500/20 text-green-400'
                                                    : 'bg-red-500/20 text-red-400'
                                                }`}>
                                                {key.status}
                                            </span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button className="px-2 py-1 bg-white/10 rounded text-xs hover:bg-white/20">
                                                Copy
                                            </button>
                                            {key.status === 'active' ? (
                                                <button className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs hover:bg-red-500/30">
                                                    Revoke
                                                </button>
                                            ) : (
                                                <button className="px-2 py-1 bg-white/10 rounded text-xs hover:bg-white/20">
                                                    Delete
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="font-mono text-sm text-gray-400 mb-2">{key.key}</div>

                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                        <div className="flex gap-2">
                                            {key.permissions.map((perm) => (
                                                <span key={perm} className="px-2 py-0.5 bg-white/10 rounded">
                                                    {perm}
                                                </span>
                                            ))}
                                        </div>
                                        <div>
                                            Created {key.created} • Last used {key.lastUsed}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* External APIs */}
                    <motion.div
                        className="glass-card"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h3 className="font-bold mb-4">🔌 External API Keys</h3>
                        <div className="space-y-3">
                            {externalKeys.map((key) => (
                                <div key={key.name} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span>{key.icon}</span>
                                        <span className="text-sm">{key.name}</span>
                                    </div>
                                    <span className={`text-xs px-2 py-0.5 rounded ${key.status === 'configured'
                                            ? 'bg-green-500/20 text-green-400'
                                            : 'bg-gray-500/20 text-gray-400'
                                        }`}>
                                        {key.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <Link href="/integrations" className="block mt-4">
                            <button className="w-full py-2 bg-white/10 rounded-lg text-sm hover:bg-white/20">
                                Manage Integrations →
                            </button>
                        </Link>
                    </motion.div>

                    {/* Security Tips */}
                    <motion.div
                        className="glass-card bg-gradient-to-br from-yellow-500/10 to-orange-500/10"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <h3 className="font-bold mb-4">🔒 Security Tips</h3>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li>• Never share your API keys publicly</li>
                            <li>• Use read-only keys when possible</li>
                            <li>• Rotate keys regularly</li>
                            <li>• Revoke unused keys immediately</li>
                            <li>• Use environment variables in code</li>
                        </ul>
                    </motion.div>

                    {/* Usage */}
                    <motion.div
                        className="glass-card"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h3 className="font-bold mb-4">📊 This Month's Usage</h3>
                        <div className="space-y-3">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span>API Calls</span>
                                    <span className="text-cyan-400">12,847</span>
                                </div>
                                <div className="w-full h-2 bg-gray-700 rounded-full">
                                    <div className="h-full w-[64%] bg-cyan-500 rounded-full"></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span>Rate Limit</span>
                                    <span>1000/min</span>
                                </div>
                            </div>
                            <div className="text-xs text-gray-500">
                                Peak: 847 calls/min on Dec 3
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* New Key Modal */}
            {showNewKey && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                    <motion.div
                        className="glass-card max-w-md w-full"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <h2 className="text-xl font-bold mb-4">🔑 Create New API Key</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-gray-400 mb-2 block">Key Name</label>
                                <input
                                    type="text"
                                    value={newKeyName}
                                    onChange={(e) => setNewKeyName(e.target.value)}
                                    placeholder="e.g., My App Integration"
                                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2"
                                />
                            </div>

                            <div>
                                <label className="text-sm text-gray-400 mb-2 block">Permissions</label>
                                <div className="flex gap-2">
                                    {['read', 'write', 'admin'].map((perm) => (
                                        <button
                                            key={perm}
                                            onClick={() => {
                                                if (selectedPermissions.includes(perm)) {
                                                    setSelectedPermissions(selectedPermissions.filter(p => p !== perm));
                                                } else {
                                                    setSelectedPermissions([...selectedPermissions, perm]);
                                                }
                                            }}
                                            className={`px-3 py-1 rounded text-sm ${selectedPermissions.includes(perm)
                                                    ? 'bg-cyan-500 text-black'
                                                    : 'bg-white/10'
                                                }`}
                                        >
                                            {perm}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowNewKey(false)}
                                className="flex-1 py-2 bg-white/10 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button className="flex-1 py-2 bg-cyan-500 text-black rounded-lg font-medium">
                                Create Key
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
