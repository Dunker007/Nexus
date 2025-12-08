'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Music,
    Plus,
    TrendingUp,
    DollarSign,
    Play,
    ExternalLink,
    Trash2,
    RefreshCw,
    Youtube,
    Check,
    Clock,
    XCircle,
    Target,
    Disc3
} from 'lucide-react';

interface Song {
    id: number;
    title: string;
    artist: string;
    genre?: string;
    distributedAt: string;
    status: 'pending' | 'live' | 'rejected';
    platforms: string[];
    streams: Record<string, number>;
    revenue: number;
    url?: string;
}

interface RevenueSummary {
    totalRevenue: number;
    totalStreams: number;
    totalSongs: number;
    liveSongs: number;
    pendingSongs: number;
    projectedMonthlyRevenue: number;
}

interface YouTubeStatus {
    subscribers: number;
    subscriberGoal: number;
    subscriberProgress: number;
    watchHours: number;
    watchHoursGoal: number;
    watchHoursProgress: number;
    monetizationEligible: boolean;
    estimatedTimeToEligibility: string;
}

const BRIDGE_URL = 'http://localhost:3456';

export default function MusicRevenuePage() {
    const [songs, setSongs] = useState<Song[]>([]);
    const [summary, setSummary] = useState<RevenueSummary | null>(null);
    const [youtube, setYoutube] = useState<YouTubeStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newSong, setNewSong] = useState({ title: '', artist: 'DLX Studios', genre: '' });

    const fetchData = useCallback(async () => {
        try {
            const [songsRes, summaryRes, ytRes] = await Promise.all([
                fetch(`${BRIDGE_URL}/distribution/songs`),
                fetch(`${BRIDGE_URL}/distribution/summary`),
                fetch(`${BRIDGE_URL}/distribution/youtube`)
            ]);

            const songsData = await songsRes.json();
            const summaryData = await summaryRes.json();
            const ytData = await ytRes.json();

            if (songsData.success) setSongs(songsData.songs);
            if (summaryData.success) setSummary(summaryData.summary);
            if (ytData.success) setYoutube(ytData.youtube);
        } catch (err) {
            console.error('Failed to fetch data:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const addSong = async () => {
        if (!newSong.title) return;

        try {
            const res = await fetch(`${BRIDGE_URL}/distribution/songs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newSong)
            });
            const data = await res.json();
            if (data.success) {
                setSongs([...songs, data.song]);
                setNewSong({ title: '', artist: 'DLX Studios', genre: '' });
                setShowAddModal(false);
                fetchData();
            }
        } catch (err) {
            console.error('Failed to add song:', err);
        }
    };

    const updateStatus = async (id: number, status: string) => {
        try {
            await fetch(`${BRIDGE_URL}/distribution/songs/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            fetchData();
        } catch (err) {
            console.error('Failed to update status:', err);
        }
    };

    const deleteSong = async (id: number) => {
        try {
            await fetch(`${BRIDGE_URL}/distribution/songs/${id}`, { method: 'DELETE' });
            setSongs(songs.filter(s => s.id !== id));
            fetchData();
        } catch (err) {
            console.error('Failed to delete song:', err);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'live': return 'text-emerald-400 bg-emerald-500/20';
            case 'pending': return 'text-amber-400 bg-amber-500/20';
            case 'rejected': return 'text-red-400 bg-red-500/20';
            default: return 'text-gray-400 bg-gray-500/20';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'live': return <Check className="w-4 h-4" />;
            case 'pending': return <Clock className="w-4 h-4" />;
            case 'rejected': return <XCircle className="w-4 h-4" />;
            default: return <Disc3 className="w-4 h-4" />;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 flex items-center justify-center">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                    <RefreshCw className="w-8 h-8 text-purple-400" />
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <Music className="w-8 h-8 text-pink-400" />
                            Music Revenue
                        </h1>
                        <p className="text-gray-400 mt-1">Phase 13 • Distribution Tracking</p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 rounded-lg text-white font-medium shadow-lg shadow-pink-500/25 transition-all"
                    >
                        <Plus className="w-5 h-5" />
                        Add Song
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    {/* Total Revenue */}
                    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-emerald-500/20">
                                <DollarSign className="w-5 h-5 text-emerald-400" />
                            </div>
                            <span className="text-gray-400 text-sm">Total Revenue</span>
                        </div>
                        <p className="text-2xl font-bold text-white">${summary?.totalRevenue.toFixed(2) || '0.00'}</p>
                        <p className="text-xs text-gray-500 mt-1">Projected: ${summary?.projectedMonthlyRevenue.toFixed(2)}/mo</p>
                    </div>

                    {/* Total Streams */}
                    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-blue-500/20">
                                <TrendingUp className="w-5 h-5 text-blue-400" />
                            </div>
                            <span className="text-gray-400 text-sm">Total Streams</span>
                        </div>
                        <p className="text-2xl font-bold text-white">{summary?.totalStreams.toLocaleString() || 0}</p>
                    </div>

                    {/* Songs Live */}
                    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-pink-500/20">
                                <Disc3 className="w-5 h-5 text-pink-400" />
                            </div>
                            <span className="text-gray-400 text-sm">Songs Live</span>
                        </div>
                        <p className="text-2xl font-bold text-white">{summary?.liveSongs || 0}</p>
                        <p className="text-xs text-gray-500 mt-1">{summary?.pendingSongs || 0} pending</p>
                    </div>

                    {/* YouTube Status */}
                    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-red-500/20">
                                <Youtube className="w-5 h-5 text-red-400" />
                            </div>
                            <span className="text-gray-400 text-sm">YouTube</span>
                        </div>
                        <p className={`text-lg font-bold ${youtube?.monetizationEligible ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {youtube?.monetizationEligible ? 'Monetized' : 'Building'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{youtube?.estimatedTimeToEligibility}</p>
                    </div>
                </div>

                {/* YouTube Progress */}
                {youtube && !youtube.monetizationEligible && (
                    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 mb-8">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Target className="w-5 h-5 text-red-400" />
                            YouTube Monetization Progress
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Subscribers */}
                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-gray-400">Subscribers</span>
                                    <span className="text-white">{youtube.subscribers} / {youtube.subscriberGoal}</span>
                                </div>
                                <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${youtube.subscriberProgress}%` }}
                                        className="h-full bg-gradient-to-r from-red-500 to-pink-500"
                                    />
                                </div>
                            </div>
                            {/* Watch Hours */}
                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-gray-400">Watch Hours</span>
                                    <span className="text-white">{youtube.watchHours} / {youtube.watchHoursGoal}</span>
                                </div>
                                <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${youtube.watchHoursProgress}%` }}
                                        className="h-full bg-gradient-to-r from-amber-500 to-orange-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Songs List */}
                <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Music className="w-5 h-5 text-pink-400" />
                        Distributed Songs
                        <span className="ml-auto text-sm text-gray-400">{songs.length} total</span>
                    </h3>

                    {songs.length === 0 ? (
                        <div className="text-center py-12">
                            <Disc3 className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-400">No songs tracked yet</p>
                            <p className="text-sm text-gray-500 mt-1">Add songs from Music Studio after Suno generation</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {songs.map((song) => (
                                <motion.div
                                    key={song.id}
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-4 bg-gray-900/50 border border-gray-700 rounded-lg flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
                                            <Music className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-white font-medium">{song.title}</p>
                                            <p className="text-sm text-gray-400">{song.artist} {song.genre && `• ${song.genre}`}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        {/* Streams */}
                                        <div className="text-right hidden md:block">
                                            <p className="text-white font-medium">{Object.values(song.streams).reduce((a, b) => a + b, 0).toLocaleString()}</p>
                                            <p className="text-xs text-gray-500">streams</p>
                                        </div>

                                        {/* Revenue */}
                                        <div className="text-right hidden md:block">
                                            <p className="text-emerald-400 font-medium">${song.revenue.toFixed(2)}</p>
                                            <p className="text-xs text-gray-500">earned</p>
                                        </div>

                                        {/* Status */}
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(song.status)}`}>
                                            {getStatusIcon(song.status)}
                                            {song.status}
                                        </span>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2">
                                            {song.status === 'pending' && (
                                                <button
                                                    onClick={() => updateStatus(song.id, 'live')}
                                                    className="p-2 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30"
                                                    title="Mark as Live"
                                                >
                                                    <Check className="w-4 h-4" />
                                                </button>
                                            )}
                                            {song.url && (
                                                <a
                                                    href={song.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600/30"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                </a>
                                            )}
                                            <button
                                                onClick={() => deleteSong(song.id)}
                                                className="p-2 rounded-lg bg-gray-700 text-gray-400 hover:bg-red-600/20 hover:text-red-400"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Add Song Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
                        onClick={() => setShowAddModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-md"
                            onClick={e => e.stopPropagation()}
                        >
                            <h3 className="text-xl font-bold text-white mb-4">Add Song to Tracking</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Song Title *</label>
                                    <input
                                        type="text"
                                        value={newSong.title}
                                        onChange={e => setNewSong({ ...newSong, title: e.target.value })}
                                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-pink-500 outline-none"
                                        placeholder="Enter song title"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Artist Name</label>
                                    <input
                                        type="text"
                                        value={newSong.artist}
                                        onChange={e => setNewSong({ ...newSong, artist: e.target.value })}
                                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-pink-500 outline-none"
                                        placeholder="DLX Studios"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Genre</label>
                                    <input
                                        type="text"
                                        value={newSong.genre}
                                        onChange={e => setNewSong({ ...newSong, genre: e.target.value })}
                                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-pink-500 outline-none"
                                        placeholder="Lofi, Pop, etc."
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 py-3 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={addSong}
                                    disabled={!newSong.title}
                                    className="flex-1 py-3 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 text-white font-medium disabled:opacity-50"
                                >
                                    Add Song
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
