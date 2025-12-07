'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';

const notifications = [
    { id: 1, type: 'success', title: 'Model loaded successfully', message: 'gemma-3n-E4B-it-QAT is ready', time: '2 min ago', read: false },
    { id: 2, type: 'info', title: 'New version available', message: 'DLX Studio v1.1.0 is available', time: '1 hour ago', read: false },
    { id: 3, type: 'warning', title: 'GPU memory high', message: 'VRAM usage at 85%', time: '3 hours ago', read: false },
    { id: 4, type: 'success', title: 'Trading bot profit', message: 'Grid Bot made $127.50 today', time: '5 hours ago', read: true },
    { id: 5, type: 'info', title: 'Backup completed', message: 'Daily backup saved successfully', time: '6 hours ago', read: true },
    { id: 6, type: 'error', title: 'Camera offline', message: 'Garage camera disconnected', time: '8 hours ago', read: true },
    { id: 7, type: 'success', title: 'Agent completed', message: 'Research Agent finished task', time: '12 hours ago', read: true },
    { id: 8, type: 'info', title: 'Weekly report ready', message: 'Your AI usage report is available', time: '1 day ago', read: true },
];

const typeConfig = {
    success: { icon: '✅', bg: 'bg-green-500/10', border: 'border-green-500/30' },
    info: { icon: '💡', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
    warning: { icon: '⚠️', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
    error: { icon: '❌', bg: 'bg-red-500/10', border: 'border-red-500/30' },
};

export default function NotificationsPage() {
    const [filter, setFilter] = useState<'all' | 'unread'>('all');
    const [notifs, setNotifs] = useState(notifications);

    const filteredNotifs = filter === 'unread'
        ? notifs.filter(n => !n.read)
        : notifs;

    const unreadCount = notifs.filter(n => !n.read).length;

    function markAllRead() {
        setNotifs(notifs.map(n => ({ ...n, read: true })));
    }

    function clearAll() {
        setNotifs([]);
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
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-4xl md:text-5xl font-bold">
                                    <span className="text-gradient">Notifications</span>
                                </h1>
                                {unreadCount > 0 && (
                                    <span className="px-3 py-1 bg-cyan-500 text-black rounded-full text-sm font-bold">
                                        {unreadCount}
                                    </span>
                                )}
                            </div>
                            <p className="text-gray-400">Stay updated on your AI operations</p>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={markAllRead}
                                className="px-4 py-2 bg-white/10 rounded-lg text-sm hover:bg-white/20"
                            >
                                Mark all read
                            </button>
                            <button
                                onClick={clearAll}
                                className="px-4 py-2 bg-white/10 rounded-lg text-sm hover:bg-white/20"
                            >
                                Clear all
                            </button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Filters */}
            <section className="container-main pb-6">
                <div className="flex gap-2">
                    {(['all', 'unread'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg text-sm ${filter === f
                                    ? 'bg-cyan-500 text-black font-medium'
                                    : 'bg-white/10 hover:bg-white/20'
                                }`}
                        >
                            {f === 'all' ? 'All' : `Unread (${unreadCount})`}
                        </button>
                    ))}
                </div>
            </section>

            {/* Notifications */}
            <section className="container-main pb-16">
                {filteredNotifs.length === 0 ? (
                    <motion.div
                        className="glass-card text-center py-16"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <span className="text-6xl">🔔</span>
                        <h2 className="text-xl font-bold mt-4">No notifications</h2>
                        <p className="text-gray-400">You're all caught up!</p>
                    </motion.div>
                ) : (
                    <motion.div
                        className="space-y-3"
                        initial="initial"
                        animate="animate"
                        variants={{ animate: { transition: { staggerChildren: 0.03 } } }}
                    >
                        {filteredNotifs.map((notif) => {
                            const config = typeConfig[notif.type as keyof typeof typeConfig];
                            return (
                                <motion.div
                                    key={notif.id}
                                    className={`glass-card flex items-start gap-4 ${config.bg} border ${config.border} ${!notif.read ? 'ring-1 ring-cyan-500/50' : ''
                                        }`}
                                    variants={{ initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 } }}
                                >
                                    <span className="text-2xl">{config.icon}</span>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold">{notif.title}</h3>
                                            {!notif.read && (
                                                <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>
                                            )}
                                        </div>
                                        <p className="text-gray-400 text-sm">{notif.message}</p>
                                        <p className="text-gray-500 text-xs mt-1">{notif.time}</p>
                                    </div>
                                    <button className="text-gray-500 hover:text-white">×</button>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                )}
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
