'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';

const backups = [
    {
        id: '1',
        name: 'Full System Backup',
        date: 'Dec 4, 2024 02:00 AM',
        size: '2.4 GB',
        type: 'automatic',
        status: 'completed',
        includes: ['configs', 'models', 'databases', 'workflows']
    },
    {
        id: '2',
        name: 'Weekly Backup',
        date: 'Dec 1, 2024 02:00 AM',
        size: '2.3 GB',
        type: 'automatic',
        status: 'completed',
        includes: ['configs', 'models', 'databases', 'workflows']
    },
    {
        id: '3',
        name: 'Pre-Update Snapshot',
        date: 'Nov 28, 2024 10:15 AM',
        size: '1.8 GB',
        type: 'manual',
        status: 'completed',
        includes: ['configs', 'databases']
    },
    {
        id: '4',
        name: 'Weekly Backup',
        date: 'Nov 24, 2024 02:00 AM',
        size: '2.1 GB',
        type: 'automatic',
        status: 'completed',
        includes: ['configs', 'models', 'databases', 'workflows']
    },
    {
        id: '5',
        name: 'Monthly Archive',
        date: 'Nov 1, 2024 03:00 AM',
        size: '4.5 GB',
        type: 'automatic',
        status: 'completed',
        includes: ['configs', 'models', 'databases', 'workflows', 'logs']
    },
];

const backupSettings = {
    autoBackup: true,
    frequency: 'weekly',
    retention: '30 days',
    destination: 'Local + Cloud',
    nextBackup: 'Dec 8, 2024 02:00 AM',
    totalStorage: '15.2 GB',
    usedStorage: '12.1 GB'
};

export default function BackupPage() {
    const [isBackingUp, setIsBackingUp] = useState(false);
    const [selectedBackup, setSelectedBackup] = useState<string | null>(null);

    function handleBackupNow() {
        setIsBackingUp(true);
        setTimeout(() => setIsBackingUp(false), 3000);
    }

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
                                <span className="text-gradient">Backups</span>
                            </h1>
                            <p className="text-gray-400">Protect your data with automated backups</p>
                        </div>
                        <button
                            onClick={handleBackupNow}
                            disabled={isBackingUp}
                            className="btn-primary disabled:opacity-50"
                        >
                            {isBackingUp ? '⏳ Backing up...' : '💾 Backup Now'}
                        </button>
                    </motion.div>
                </div>
            </section>

            {/* Status Cards */}
            <section className="container-main pb-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <motion.div
                        className="glass-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <span className={`w-3 h-3 rounded-full ${backupSettings.autoBackup ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                            <span className="text-sm text-gray-400">Auto-Backup</span>
                        </div>
                        <div className="text-xl font-bold text-green-400">
                            {backupSettings.autoBackup ? 'Enabled' : 'Disabled'}
                        </div>
                    </motion.div>
                    <motion.div
                        className="glass-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <div className="text-sm text-gray-400 mb-2">Next Backup</div>
                        <div className="text-xl font-bold">{backupSettings.nextBackup}</div>
                    </motion.div>
                    <motion.div
                        className="glass-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="text-sm text-gray-400 mb-2">Storage Used</div>
                        <div className="text-xl font-bold text-cyan-400">{backupSettings.usedStorage}</div>
                        <div className="text-xs text-gray-500">of {backupSettings.totalStorage}</div>
                    </motion.div>
                    <motion.div
                        className="glass-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className="text-sm text-gray-400 mb-2">Total Backups</div>
                        <div className="text-xl font-bold text-purple-400">{backups.length}</div>
                    </motion.div>
                </div>
            </section>

            <div className="container-main pb-16 grid lg:grid-cols-3 gap-6">
                {/* Backup List */}
                <div className="lg:col-span-2">
                    <motion.div
                        className="glass-card"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <h2 className="text-xl font-bold mb-4">📦 Backup History</h2>
                        <div className="space-y-3">
                            {backups.map((backup) => (
                                <div
                                    key={backup.id}
                                    onClick={() => setSelectedBackup(backup.id)}
                                    className={`p-4 bg-white/5 rounded-lg cursor-pointer transition-all ${selectedBackup === backup.id ? 'ring-2 ring-cyan-500' : 'hover:bg-white/10'
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            <span className="text-green-400">✓</span>
                                            <h3 className="font-medium">{backup.name}</h3>
                                            <span className={`text-xs px-2 py-0.5 rounded ${backup.type === 'automatic'
                                                    ? 'bg-blue-500/20 text-blue-400'
                                                    : 'bg-purple-500/20 text-purple-400'
                                                }`}>
                                                {backup.type}
                                            </span>
                                        </div>
                                        <span className="text-sm text-gray-500">{backup.size}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-500">{backup.date}</span>
                                        <div className="flex gap-1">
                                            {backup.includes.map((item) => (
                                                <span key={item} className="px-2 py-0.5 bg-white/10 rounded text-xs">
                                                    {item}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Settings & Actions */}
                <div className="space-y-6">
                    {/* Quick Actions */}
                    <motion.div
                        className="glass-card"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h3 className="font-bold mb-4">⚡ Actions</h3>
                        <div className="space-y-2">
                            <button className="w-full py-3 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30">
                                📥 Download Latest Backup
                            </button>
                            <button
                                className="w-full py-3 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30"
                                disabled={!selectedBackup}
                            >
                                ↩️ Restore Selected Backup
                            </button>
                            <button className="w-full py-3 bg-white/10 rounded-lg hover:bg-white/20">
                                📤 Upload Backup
                            </button>
                            <button
                                className="w-full py-3 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30"
                                disabled={!selectedBackup}
                            >
                                🗑️ Delete Selected
                            </button>
                        </div>
                    </motion.div>

                    {/* Settings */}
                    <motion.div
                        className="glass-card"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <h3 className="font-bold mb-4">⚙️ Backup Settings</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span>Auto-Backup</span>
                                <button className="w-12 h-6 bg-green-500 rounded-full relative">
                                    <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></span>
                                </button>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>Frequency</span>
                                <select className="bg-white/10 rounded px-2 py-1 text-sm">
                                    <option>Daily</option>
                                    <option selected>Weekly</option>
                                    <option>Monthly</option>
                                </select>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>Retention</span>
                                <select className="bg-white/10 rounded px-2 py-1 text-sm">
                                    <option>7 days</option>
                                    <option selected>30 days</option>
                                    <option>90 days</option>
                                    <option>Forever</option>
                                </select>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>Destination</span>
                                <span className="text-sm text-cyan-400">{backupSettings.destination}</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* What's Backed Up */}
                    <motion.div
                        className="glass-card"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h3 className="font-bold mb-4">📋 What's Backed Up</h3>
                        <div className="space-y-2 text-sm">
                            <label className="flex items-center gap-2">
                                <input type="checkbox" checked className="w-4 h-4 rounded" readOnly />
                                <span>Configuration files</span>
                            </label>
                            <label className="flex items-center gap-2">
                                <input type="checkbox" checked className="w-4 h-4 rounded" readOnly />
                                <span>AI Models (GGUF)</span>
                            </label>
                            <label className="flex items-center gap-2">
                                <input type="checkbox" checked className="w-4 h-4 rounded" readOnly />
                                <span>Chat history</span>
                            </label>
                            <label className="flex items-center gap-2">
                                <input type="checkbox" checked className="w-4 h-4 rounded" readOnly />
                                <span>Workflows & automations</span>
                            </label>
                            <label className="flex items-center gap-2">
                                <input type="checkbox" className="w-4 h-4 rounded" readOnly />
                                <span>System logs</span>
                            </label>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Back link */}
            <div className="container-main pb-8">
                <Link href="/" className="text-gray-400 hover:text-cyan-400 transition-colors">
                    ← Back to Dashboard
                </Link>
            </div>
        </div>
    );
}
