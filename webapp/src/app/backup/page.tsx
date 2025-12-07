'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    HardDrive, Cloud, RefreshCw, Trash2, FolderSync,
    Check, AlertCircle, Clock, Plus, X, Settings
} from 'lucide-react';
import PageBackground from '@/components/PageBackground';
import { housekeeper } from '@/lib/agents/housekeeper-agent';

export default function BackupPage() {
    const [syncConfig, setSyncConfig] = useState(housekeeper.getSyncConfig());
    const [diskStatus, setDiskStatus] = useState<any>(null);
    const [backupStatus, setBackupStatus] = useState<any>(null);
    const [cleanupSuggestions, setCleanupSuggestions] = useState<string[]>([]);
    const [loading, setLoading] = useState<string | null>(null);
    const [newFolder, setNewFolder] = useState('');
    const [showAddFolder, setShowAddFolder] = useState(false);

    useEffect(() => {
        // Subscribe to housekeeper updates
        const unsubscribe = housekeeper.subscribe((status) => {
            setSyncConfig(status.syncConfig);
        });

        // Load initial data
        loadData();

        return unsubscribe;
    }, []);

    const loadData = async () => {
        const [disk, backup, cleanup] = await Promise.all([
            housekeeper.getDiskStatus(),
            housekeeper.getBackupStatus(),
            housekeeper.getCleanupSuggestions()
        ]);
        setDiskStatus(disk);
        setBackupStatus(backup);
        setCleanupSuggestions(cleanup);
    };

    const handleSync = async () => {
        setLoading('sync');
        const result = await housekeeper.triggerSync();
        setLoading(null);
        // Could show toast here
        console.log('Sync result:', result);
    };

    const handleBackup = async () => {
        setLoading('backup');
        const result = await housekeeper.triggerBackup();
        await loadData(); // Refresh backup status
        setLoading(null);
        console.log('Backup result:', result);
    };

    const handleAddFolder = () => {
        if (newFolder.trim()) {
            housekeeper.addFolder(newFolder.trim());
            setNewFolder('');
            setShowAddFolder(false);
        }
    };

    const handleRemoveFolder = (folder: string) => {
        housekeeper.removeFolder(folder);
    };

    const toggleSync = () => {
        housekeeper.updateSyncConfig({ enabled: !syncConfig.enabled });
    };

    return (
        <div className="min-h-screen bg-[#050508] relative">
            <PageBackground color="green" />

            <div className="relative z-10 p-6 md:p-12 pt-24">
                {/* Header */}
                <div className="max-w-6xl mx-auto mb-12">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-4 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl border border-green-500/20">
                            <span className="text-4xl">🧹</span>
                        </div>
                        <div>
                            <h1 className="text-4xl font-black">
                                <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                                    Housekeeper
                                </span>
                            </h1>
                            <p className="text-gray-400">Backup, sync, and cleanup your workspace</p>
                        </div>
                    </div>
                </div>

                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Git Backup Status */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <HardDrive className="text-blue-400" size={20} />
                                Git Backup
                            </h2>
                            <button
                                onClick={handleBackup}
                                disabled={loading === 'backup'}
                                className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
                            >
                                {loading === 'backup' ? (
                                    <RefreshCw className="animate-spin" size={16} />
                                ) : (
                                    <Check size={16} />
                                )}
                                Backup Now
                            </button>
                        </div>

                        {backupStatus && (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                                    <span className="text-gray-400">Last Commit</span>
                                    <span className="text-white flex items-center gap-2">
                                        <Clock size={14} />
                                        {backupStatus.lastCommit ? new Date(backupStatus.lastCommit).toLocaleString() : 'Never'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                                    <span className="text-gray-400">Last Push</span>
                                    <span className="text-white">
                                        {backupStatus.lastPush ? new Date(backupStatus.lastPush).toLocaleString() : 'Never'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                                    <span className="text-gray-400">Uncommitted Changes</span>
                                    <span className={backupStatus.uncommittedChanges > 0 ? 'text-yellow-400' : 'text-green-400'}>
                                        {backupStatus.uncommittedChanges} files
                                    </span>
                                </div>
                                {backupStatus.needsBackup && (
                                    <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-400 text-sm">
                                        <AlertCircle size={16} />
                                        You have uncommitted changes. Consider backing up.
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>

                    {/* Google Drive Sync */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="glass-card"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Cloud className="text-green-400" size={20} />
                                Google Drive Sync
                            </h2>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={toggleSync}
                                    className={`relative w-12 h-6 rounded-full transition-colors ${syncConfig.enabled ? 'bg-green-500' : 'bg-gray-600'
                                        }`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${syncConfig.enabled ? 'translate-x-7' : 'translate-x-1'
                                        }`} />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {/* Sync Status */}
                            <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                                <span className="text-gray-400">Status</span>
                                <span className={`flex items-center gap-2 ${syncConfig.syncStatus === 'success' ? 'text-green-400' :
                                        syncConfig.syncStatus === 'syncing' ? 'text-blue-400' :
                                            syncConfig.syncStatus === 'error' ? 'text-red-400' :
                                                'text-gray-400'
                                    }`}>
                                    {syncConfig.syncStatus === 'syncing' && <RefreshCw className="animate-spin" size={14} />}
                                    {syncConfig.syncStatus === 'success' && <Check size={14} />}
                                    {syncConfig.syncStatus === 'error' && <AlertCircle size={14} />}
                                    {syncConfig.syncStatus.charAt(0).toUpperCase() + syncConfig.syncStatus.slice(1)}
                                </span>
                            </div>

                            <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                                <span className="text-gray-400">Last Sync</span>
                                <span className="text-white">
                                    {syncConfig.lastSync ? new Date(syncConfig.lastSync).toLocaleString() : 'Never'}
                                </span>
                            </div>

                            {/* Synced Folders */}
                            <div className="border-t border-white/10 pt-4">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm text-gray-400">Synced Folders</span>
                                    <button
                                        onClick={() => setShowAddFolder(true)}
                                        className="text-green-400 hover:text-green-300 text-xs flex items-center gap-1"
                                    >
                                        <Plus size={12} /> Add
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    {syncConfig.folders.map(folder => (
                                        <div key={folder} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                                            <span className="flex items-center gap-2 text-sm">
                                                <FolderSync size={14} className="text-green-400" />
                                                {folder}
                                            </span>
                                            <button
                                                onClick={() => handleRemoveFolder(folder)}
                                                className="text-gray-500 hover:text-red-400 transition-colors"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}

                                    {showAddFolder && (
                                        <div className="flex items-center gap-2 p-2 bg-green-500/10 rounded-lg border border-green-500/20">
                                            <input
                                                type="text"
                                                value={newFolder}
                                                onChange={(e) => setNewFolder(e.target.value)}
                                                placeholder="Folder name..."
                                                className="flex-1 bg-transparent text-sm outline-none"
                                                autoFocus
                                                onKeyDown={(e) => e.key === 'Enter' && handleAddFolder()}
                                            />
                                            <button onClick={handleAddFolder} className="text-green-400">
                                                <Check size={14} />
                                            </button>
                                            <button onClick={() => setShowAddFolder(false)} className="text-gray-500">
                                                <X size={14} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {syncConfig.enabled && (
                                <button
                                    onClick={handleSync}
                                    disabled={loading === 'sync' || syncConfig.syncStatus === 'syncing'}
                                    className="w-full py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                                >
                                    {loading === 'sync' || syncConfig.syncStatus === 'syncing' ? (
                                        <RefreshCw className="animate-spin" size={16} />
                                    ) : (
                                        <Cloud size={16} />
                                    )}
                                    Sync Now
                                </button>
                            )}
                        </div>
                    </motion.div>

                    {/* Disk Status */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="glass-card"
                    >
                        <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
                            <HardDrive className="text-purple-400" size={20} />
                            Disk Status
                        </h2>

                        {diskStatus && (
                            <div className="space-y-4">
                                <div className="relative h-4 bg-white/10 rounded-full overflow-hidden">
                                    <div
                                        className={`absolute inset-y-0 left-0 rounded-full transition-all ${diskStatus.percentUsed > 80 ? 'bg-red-500' :
                                                diskStatus.percentUsed > 60 ? 'bg-yellow-500' :
                                                    'bg-green-500'
                                            }`}
                                        style={{ width: `${diskStatus.percentUsed}%` }}
                                    />
                                </div>

                                <div className="grid grid-cols-3 gap-4 text-center">
                                    <div className="p-3 bg-white/5 rounded-lg">
                                        <div className="text-2xl font-bold text-white">{diskStatus.usedGB}</div>
                                        <div className="text-xs text-gray-400">Used GB</div>
                                    </div>
                                    <div className="p-3 bg-white/5 rounded-lg">
                                        <div className="text-2xl font-bold text-green-400">{diskStatus.freeGB}</div>
                                        <div className="text-xs text-gray-400">Free GB</div>
                                    </div>
                                    <div className="p-3 bg-white/5 rounded-lg">
                                        <div className="text-2xl font-bold text-gray-400">{diskStatus.totalGB}</div>
                                        <div className="text-xs text-gray-400">Total GB</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>

                    {/* Cleanup Suggestions */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="glass-card"
                    >
                        <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
                            <Trash2 className="text-red-400" size={20} />
                            Cleanup Suggestions
                        </h2>

                        <div className="space-y-3">
                            {cleanupSuggestions.map((suggestion, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                    <span className="text-sm text-gray-300">{suggestion}</span>
                                    <button className="text-xs text-red-400 hover:text-red-300 px-2 py-1 bg-red-500/10 rounded transition-colors">
                                        Clean
                                    </button>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                </div>
            </div>
        </div>
    );
}
