'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
    Newspaper,
    RefreshCw,
    Send,
    Copy,
    Check,
    AlertTriangle,
    Music,
    Mic2
} from 'lucide-react';
import { useSettings } from '@/components/SettingsContext';

interface NewsItem {
    id: number;
    title: string;
    sourceId: string;
    pubDate: string;
    link: string;
    category: string;
}

interface SentinelResult {
    title: string;
    structure: {
        intro: string;
        verse1: string;
        chorus: string;
        verse2: string;
        bridge: string;
        outro: string;
    };
    sunoPrompt: {
        copyToSuno: string;
    };
    disclaimer: string;
}

export default function BriefingPage() {
    const { settings } = useSettings();
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedNews, setSelectedNews] = useState<number[]>([]);
    const [briefing, setBriefing] = useState<SentinelResult | null>(null);
    const [copied, setCopied] = useState(false);

    const fetchNews = useCallback(async () => {
        try {
            const res = await fetch(`${settings.bridgeUrl}/news?limit=20`);
            const data = await res.json();
            setNews(data);
        } catch (error) {
            console.error('Failed to fetch news:', error);
        }
    }, [settings.bridgeUrl]);

    // Fetch news on load
    useEffect(() => {
        fetchNews();
    }, [fetchNews]);

    const refreshHeadlines = async () => {
        setRefreshing(true);
        try {
            await fetch(`${settings.bridgeUrl}/news/refresh`, { method: 'POST' });
            await fetchNews();
        } catch (error) {
            console.error('Failed to refresh news:', error);
        } finally {
            setRefreshing(false);
        }
    };

    const toggleSelect = (id: number) => {
        if (selectedNews.includes(id)) {
            setSelectedNews(selectedNews.filter(n => n !== id));
        } else {
            setSelectedNews([...selectedNews, id]);
        }
    };

    const generateBriefing = async () => {
        setLoading(true);
        setBriefing(null);

        try {
            const selectedHeadlines = news.filter(n => selectedNews.includes(n.id));

            const res = await fetch(`${settings.bridgeUrl}/music/sentinel`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    headlines: selectedHeadlines,
                    focusArea: 'national' // Default to national/general for now
                })
            });

            const data = await res.json();
            setBriefing(data);
        } catch (error) {
            console.error('Failed to generate briefing:', error);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const formatForSocial = () => {
        if (!briefing) return '';
        return `${briefing.title}\n\n${briefing.structure.verse1}\n\n${briefing.structure.chorus}\n\nVia @CrossCheckFraud #FraudWatch #Accountability`;
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 p-8 font-sans">
            <header className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3 text-white">
                        <Newspaper className="text-blue-400" />
                        Daily Briefing
                    </h1>
                    <p className="text-gray-400 mt-2">
                        @CrossCheckFraud Operating Center
                    </p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={refreshHeadlines}
                        disabled={refreshing}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors border border-gray-700"
                    >
                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                        {refreshing ? 'Scanning...' : 'Scan Wires'}
                    </button>
                    <button
                        onClick={generateBriefing}
                        disabled={loading || selectedNews.length === 0}
                        className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold transition-all transform hover:scale-105 ${loading || selectedNews.length === 0
                            ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20'
                            }`}
                    >
                        {loading ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                            <Mic2 className="w-4 h-4" />
                        )}
                        {loading ? 'Generating...' : 'Generate Briefing'}
                    </button>
                </div>
            </header>

            <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left: News Wire */}
                <section className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6 h-[80vh] overflow-hidden flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-yellow-500" />
                            Incoming Wires ({news.length})
                        </h2>
                        <span className="text-xs text-gray-500">
                            {selectedNews.length} selected
                        </span>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
                        {news.map((item) => (
                            <motion.div
                                key={item.id}
                                layoutId={`news-${item.id}`}
                                onClick={() => toggleSelect(item.id)}
                                className={`p-4 rounded-lg border cursor-pointer transition-all ${selectedNews.includes(item.id)
                                    ? 'bg-blue-900/30 border-blue-500/50'
                                    : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs font-mono text-blue-400 uppercase tracking-wider">
                                        {item.sourceId.replace(/-/g, ' ')}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        {new Date(item.pubDate).toLocaleDateString()}
                                    </span>
                                </div>
                                <h3 className="text-sm font-medium leading-relaxed">
                                    {item.title}
                                </h3>
                            </motion.div>
                        ))}
                        {news.length === 0 && !refreshing && (
                            <div className="text-center py-20 text-gray-500">
                                No active wires. Click &quot;Scan Wires&quot; to update.
                            </div>
                        )}
                    </div>
                </section>

                {/* Right: Output */}
                <section className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6 h-[80vh] overflow-hidden flex flex-col">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Send className="w-5 h-5 text-green-500" />
                        Transmission Preview
                    </h2>

                    {briefing ? (
                        <div className="flex-1 overflow-y-auto space-y-6 pr-2 scrollbar-thin scrollbar-thumb-gray-600">
                            {/* Social Card */}
                            <div className="bg-black/40 rounded-xl p-6 border border-gray-700">
                                <div className="flex justify-between items-center mb-4 border-b border-gray-800 pb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-white">{briefing.title}</h3>
                                        <p className="text-xs text-gray-500">Midwest Sentinel • @CrossCheckFraud</p>
                                    </div>
                                    <button
                                        onClick={() => copyToClipboard(formatForSocial())}
                                        className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors"
                                        title="Copy for X"
                                    >
                                        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                </div>
                                <div className="font-mono text-sm space-y-4 text-gray-300 whitespace-pre-wrap">
                                    <div className="pl-4 border-l-2 border-blue-500/30">
                                        {briefing.structure.verse1}
                                    </div>
                                    <div className="pl-4 border-l-2 border-green-500/30 font-bold text-gray-200">
                                        {briefing.structure.chorus}
                                    </div>
                                </div>
                            </div>

                            {/* Suno Prompt Card */}
                            <div className="bg-purple-900/10 rounded-xl p-6 border border-purple-500/20">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="text-sm font-bold text-purple-400 flex items-center gap-2">
                                        <Music className="w-4 h-4" />
                                        Suno Prompt
                                    </h3>
                                    <button
                                        onClick={() => copyToClipboard(briefing.sunoPrompt.copyToSuno)}
                                        className="text-xs bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 px-2 py-1 rounded"
                                    >
                                        Copy Prompt
                                    </button>
                                </div>
                                <p className="text-xs text-purple-200/70 font-mono bg-black/20 p-3 rounded">
                                    {briefing.sunoPrompt.copyToSuno}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-500 space-y-4">
                            <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center">
                                <Mic2 className="w-8 h-8 text-gray-600" />
                            </div>
                            <p>Select wires and click Generate to draft transmission.</p>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}
