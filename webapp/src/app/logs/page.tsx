'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect } from 'react';

const logEntries = [
    { time: '18:57:32', level: 'info', source: 'LuxRig', message: 'Model gemma-3n-E4B-it-QAT loaded successfully' },
    { time: '18:57:28', level: 'info', source: 'Chat', message: 'New conversation started' },
    { time: '18:55:12', level: 'success', source: 'GitHub', message: 'Pushed 2 commits to main' },
    { time: '18:52:44', level: 'info', source: 'Bridge', message: 'LM Studio connection verified' },
    { time: '18:50:03', level: 'warn', source: 'Trading', message: 'Rate limit approaching for Binance API' },
    { time: '18:45:17', level: 'info', source: 'Agent', message: 'Code Review agent completed task' },
    { time: '18:42:55', level: 'info', source: 'Workflow', message: 'Daily Market Analysis executed' },
    { time: '18:40:22', level: 'error', source: 'Home', message: 'Failed to connect to Reolink camera - timeout' },
    { time: '18:35:18', level: 'info', source: 'Backup', message: 'Incremental backup completed (245MB)' },
    { time: '18:30:01', level: 'info', source: 'System', message: 'Health check passed - all services operational' },
    { time: '18:25:44', level: 'warn', source: 'LuxRig', message: 'GPU temperature at 72°C' },
    { time: '18:20:33', level: 'info', source: 'Chat', message: 'Conversation archived: Debug React component' },
    { time: '18:15:22', level: 'success', source: 'Trading', message: 'DCA Bot executed buy order: 0.001 BTC' },
    { time: '18:10:11', level: 'info', source: 'Govee', message: 'Scene "Evening" activated' },
    { time: '18:05:00', level: 'info', source: 'Calendar', message: 'Reminder: Team Sync in 1 hour' },
];

const sources = ['All', 'LuxRig', 'Chat', 'GitHub', 'Bridge', 'Trading', 'Agent', 'Workflow', 'Home', 'System', 'Govee'];
const levels = ['all', 'info', 'success', 'warn', 'error'];

const levelColors = {
    info: 'text-blue-400 bg-blue-500/20',
    success: 'text-green-400 bg-green-500/20',
    warn: 'text-yellow-400 bg-yellow-500/20',
    error: 'text-red-400 bg-red-500/20',
};

export default function LogsPage() {
    const [sourceFilter, setSourceFilter] = useState('All');
    const [levelFilter, setLevelFilter] = useState('all');
    const [isLive, setIsLive] = useState(true);
    const [logs, setLogs] = useState(logEntries);

    // Simulate live log updates
    useEffect(() => {
        if (!isLive) return;

        const newLogMessages = [
            { level: 'info', source: 'System', message: 'Heartbeat check - all systems nominal' },
            { level: 'info', source: 'Bridge', message: 'API request processed (45ms)' },
            { level: 'info', source: 'Chat', message: 'Token generation: 125 tokens/sec' },
        ];

        const interval = setInterval(() => {
            const randomLog = newLogMessages[Math.floor(Math.random() * newLogMessages.length)];
            const now = new Date();
            const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

            setLogs(prev => [{ time, ...randomLog }, ...prev.slice(0, 49)]);
        }, 5000);

        return () => clearInterval(interval);
    }, [isLive]);

    const filteredLogs = logs.filter(log => {
        const matchesSource = sourceFilter === 'All' || log.source === sourceFilter;
        const matchesLevel = levelFilter === 'all' || log.level === levelFilter;
        return matchesSource && matchesLevel;
    });

    const errorCount = logs.filter(l => l.level === 'error').length;
    const warnCount = logs.filter(l => l.level === 'warn').length;

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
                                <span className="text-gradient">Activity Logs</span>
                            </h1>
                            <p className="text-gray-400">Real-time system activity and events</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setIsLive(!isLive)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${isLive ? 'bg-green-500/20 text-green-400' : 'bg-white/10'
                                    }`}
                            >
                                <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></span>
                                {isLive ? 'Live' : 'Paused'}
                            </button>
                            <button className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20">
                                📥 Export
                            </button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Quick Stats */}
            <section className="container-main pb-6">
                <div className="flex gap-4 flex-wrap">
                    <div className="glass-card px-4 py-2">
                        <span className="text-gray-400 text-sm">Total: </span>
                        <span className="font-bold">{logs.length}</span>
                    </div>
                    {errorCount > 0 && (
                        <div className="glass-card px-4 py-2 bg-red-500/10">
                            <span className="text-red-400 text-sm">Errors: </span>
                            <span className="font-bold text-red-400">{errorCount}</span>
                        </div>
                    )}
                    {warnCount > 0 && (
                        <div className="glass-card px-4 py-2 bg-yellow-500/10">
                            <span className="text-yellow-400 text-sm">Warnings: </span>
                            <span className="font-bold text-yellow-400">{warnCount}</span>
                        </div>
                    )}
                </div>
            </section>

            {/* Filters */}
            <section className="container-main pb-6">
                <div className="flex flex-wrap gap-4">
                    <div className="flex gap-2">
                        <span className="text-sm text-gray-400 py-1">Source:</span>
                        {sources.slice(0, 6).map((source) => (
                            <button
                                key={source}
                                onClick={() => setSourceFilter(source)}
                                className={`px-3 py-1 rounded text-sm ${sourceFilter === source
                                        ? 'bg-cyan-500 text-black'
                                        : 'bg-white/10 hover:bg-white/20'
                                    }`}
                            >
                                {source}
                            </button>
                        ))}
                        <select
                            value={sourceFilter}
                            onChange={(e) => setSourceFilter(e.target.value)}
                            className="bg-white/10 rounded px-2 py-1 text-sm"
                        >
                            {sources.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div className="flex gap-2">
                        <span className="text-sm text-gray-400 py-1">Level:</span>
                        {levels.map((level) => (
                            <button
                                key={level}
                                onClick={() => setLevelFilter(level)}
                                className={`px-3 py-1 rounded text-sm ${levelFilter === level
                                        ? 'bg-purple-500 text-white'
                                        : 'bg-white/10 hover:bg-white/20'
                                    }`}
                            >
                                {level === 'all' ? 'All' : level.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Log Entries */}
            <section className="container-main pb-16">
                <motion.div
                    className="glass-card font-mono text-sm overflow-hidden"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <div className="max-h-[600px] overflow-y-auto">
                        <table className="w-full">
                            <thead className="sticky top-0 bg-[#0a0a0f]">
                                <tr className="border-b border-gray-700">
                                    <th className="text-left py-3 px-4 text-gray-500 font-normal">Time</th>
                                    <th className="text-left py-3 px-4 text-gray-500 font-normal">Level</th>
                                    <th className="text-left py-3 px-4 text-gray-500 font-normal">Source</th>
                                    <th className="text-left py-3 px-4 text-gray-500 font-normal">Message</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLogs.map((log, i) => (
                                    <motion.tr
                                        key={i}
                                        className="border-b border-gray-800 hover:bg-white/5"
                                        initial={i === 0 && isLive ? { opacity: 0, x: -20 } : false}
                                        animate={{ opacity: 1, x: 0 }}
                                    >
                                        <td className="py-2 px-4 text-gray-500">{log.time}</td>
                                        <td className="py-2 px-4">
                                            <span className={`px-2 py-0.5 rounded text-xs ${levelColors[log.level as keyof typeof levelColors]}`}>
                                                {log.level.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="py-2 px-4 text-cyan-400">{log.source}</td>
                                        <td className="py-2 px-4">{log.message}</td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
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
