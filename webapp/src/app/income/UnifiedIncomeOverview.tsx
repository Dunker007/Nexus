'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    DollarSign,
    TrendingUp,
    Target,
    Music,
    Palette,
    FileText,
    PlusCircle,
    RefreshCw,
    Award,
    ArrowRight,
    CheckCircle,
    Circle,
    Youtube,
    Disc3,
    ShoppingCart
} from 'lucide-react';

interface Stream {
    name: string;
    revenue: number;
    color: string;
    items?: number;
    streams?: number;
    sales?: number;
    entries?: number;
}

interface Platform {
    name: string;
    revenue: number;
    status?: string;
    progress?: number;
    streams?: number;
    sales?: number;
}

interface Milestone {
    name: string;
    achieved: boolean;
    target: number;
}

interface IncomeSummary {
    totalRevenue: number;
    projectedMonthly: number;
    streams: Record<string, Stream>;
    platforms: Record<string, Platform>;
    goals: {
        monthly: number;
        yearly: number;
        monthlyProgress: number;
        yearlyProgress: number;
    };
    milestones: Milestone[];
}

import { LUXRIG_BRIDGE_URL } from '@/lib/utils';

export default function UnifiedIncomeOverview() {
    const [summary, setSummary] = useState<IncomeSummary | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        try {
            const res = await fetch(`${LUXRIG_BRIDGE_URL}/income/summary`);
            const data = await res.json();
            if (data.success) {
                setSummary(data.summary);
            }
        } catch (err) {
            console.error('Failed to fetch income summary:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000); // Refresh every 30s
        return () => clearInterval(interval);
    }, [fetchData]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                    <RefreshCw className="w-6 h-6 text-purple-400" />
                </motion.div>
            </div>
        );
    }

    if (!summary) {
        return (
            <div className="text-center py-12 text-gray-400">
                <p>Unable to load income data</p>
                <button onClick={fetchData} className="mt-2 text-purple-400 hover:text-purple-300">
                    Retry
                </button>
            </div>
        );
    }

    const streamIcons: Record<string, React.ReactNode> = {
        music: <Music className="w-5 h-5" />,
        art: <Palette className="w-5 h-5" />,
        content: <FileText className="w-5 h-5" />,
        manual: <PlusCircle className="w-5 h-5" />
    };

    const streamLinks: Record<string, string> = {
        music: '/income/music',
        art: '/income/art',
        content: '/pipeline',
        manual: '/income'
    };

    return (
        <div className="space-y-6">
            {/* Hero Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Total Revenue */}
                <div className="bg-gradient-to-br from-emerald-600/20 to-emerald-900/20 border border-emerald-500/30 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-emerald-500/20">
                            <DollarSign className="w-6 h-6 text-emerald-400" />
                        </div>
                        <span className="text-gray-300">Total Revenue</span>
                    </div>
                    <p className="text-4xl font-bold text-white">${summary.totalRevenue.toFixed(2)}</p>
                    <p className="text-sm text-emerald-400 mt-2 flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        Projected: ${summary.projectedMonthly.toFixed(2)}/mo
                    </p>
                </div>

                {/* Monthly Goal */}
                <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-purple-500/20">
                            <Target className="w-6 h-6 text-purple-400" />
                        </div>
                        <span className="text-gray-300">Monthly Goal</span>
                    </div>
                    <p className="text-2xl font-bold text-white">${summary.goals.monthly}/mo</p>
                    <div className="mt-3">
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span>Progress</span>
                            <span>{Math.min(100, summary.goals.monthlyProgress).toFixed(1)}%</span>
                        </div>
                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(100, summary.goals.monthlyProgress)}%` }}
                                className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Milestones */}
                <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-amber-500/20">
                            <Award className="w-6 h-6 text-amber-400" />
                        </div>
                        <span className="text-gray-300">Milestones</span>
                    </div>
                    <div className="space-y-2">
                        {summary.milestones.slice(0, 3).map((m, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm">
                                {m.achieved ? (
                                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                                ) : (
                                    <Circle className="w-4 h-4 text-gray-500" />
                                )}
                                <span className={m.achieved ? 'text-emerald-400' : 'text-gray-400'}>
                                    {m.name}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Revenue Streams */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Revenue Streams</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Object.entries(summary.streams).map(([key, stream]) => (
                        <Link
                            key={key}
                            href={streamLinks[key] || '/income'}
                            className="block p-4 bg-gray-900/50 border border-gray-700 rounded-lg hover:border-gray-600 transition-colors group"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2" style={{ color: stream.color }}>
                                    {streamIcons[key]}
                                    <span className="font-medium">{stream.name}</span>
                                </div>
                                <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-gray-300 transition-colors" />
                            </div>
                            <p className="text-2xl font-bold text-white">${stream.revenue.toFixed(2)}</p>
                            <p className="text-xs text-gray-500 mt-1">
                                {stream.items !== undefined && `${stream.items} items`}
                                {stream.streams !== undefined && ` • ${stream.streams.toLocaleString()} streams`}
                                {stream.sales !== undefined && ` • ${stream.sales} sales`}
                                {stream.entries !== undefined && `${stream.entries} entries`}
                            </p>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Platform Breakdown */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Platform Performance</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* YouTube */}
                    <div className="p-4 bg-gray-900/50 border border-gray-700 rounded-lg">
                        <div className="flex items-center gap-2 mb-3">
                            <Youtube className="w-5 h-5 text-red-500" />
                            <span className="font-medium text-white">YouTube</span>
                            <span className={`ml-auto text-xs px-2 py-0.5 rounded ${summary.platforms.youtube.status === 'monetized'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-amber-500/20 text-amber-400'
                                }`}>
                                {summary.platforms.youtube.status}
                            </span>
                        </div>
                        <p className="text-xl font-bold text-white">${summary.platforms.youtube.revenue.toFixed(2)}</p>
                        {summary.platforms.youtube.progress !== undefined && summary.platforms.youtube.progress < 100 && (
                            <div className="mt-2">
                                <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-red-500"
                                        style={{ width: `${summary.platforms.youtube.progress}%` }}
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">{summary.platforms.youtube.progress.toFixed(0)}% to monetization</p>
                            </div>
                        )}
                    </div>

                    {/* Spotify */}
                    <div className="p-4 bg-gray-900/50 border border-gray-700 rounded-lg">
                        <div className="flex items-center gap-2 mb-3">
                            <Disc3 className="w-5 h-5 text-green-500" />
                            <span className="font-medium text-white">Spotify</span>
                        </div>
                        <p className="text-xl font-bold text-white">${summary.platforms.spotify.revenue.toFixed(2)}</p>
                        <p className="text-xs text-gray-500 mt-1">{summary.platforms.spotify.streams?.toLocaleString() || 0} streams</p>
                    </div>

                    {/* Etsy */}
                    <div className="p-4 bg-gray-900/50 border border-gray-700 rounded-lg">
                        <div className="flex items-center gap-2 mb-3">
                            <ShoppingCart className="w-5 h-5 text-orange-500" />
                            <span className="font-medium text-white">Etsy</span>
                        </div>
                        <p className="text-xl font-bold text-white">${summary.platforms.etsy.revenue.toFixed(2)}</p>
                        <p className="text-xs text-gray-500 mt-1">{summary.platforms.etsy.sales || 0} sales</p>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link
                    href="/income/music"
                    className="p-4 bg-pink-600/20 border border-pink-500/30 rounded-xl hover:bg-pink-600/30 transition-colors text-center"
                >
                    <Music className="w-6 h-6 text-pink-400 mx-auto mb-2" />
                    <span className="text-sm text-pink-300">Music Revenue</span>
                </Link>
                <Link
                    href="/income/art"
                    className="p-4 bg-orange-600/20 border border-orange-500/30 rounded-xl hover:bg-orange-600/30 transition-colors text-center"
                >
                    <Palette className="w-6 h-6 text-orange-400 mx-auto mb-2" />
                    <span className="text-sm text-orange-300">Art Revenue</span>
                </Link>
                <Link
                    href="/pipeline"
                    className="p-4 bg-purple-600/20 border border-purple-500/30 rounded-xl hover:bg-purple-600/30 transition-colors text-center"
                >
                    <FileText className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                    <span className="text-sm text-purple-300">Content Pipeline</span>
                </Link>
                <Link
                    href="/studios"
                    className="p-4 bg-cyan-600/20 border border-cyan-500/30 rounded-xl hover:bg-cyan-600/30 transition-colors text-center"
                >
                    <Palette className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                    <span className="text-sm text-cyan-300">Create Content</span>
                </Link>
            </div>
        </div>
    );
}
