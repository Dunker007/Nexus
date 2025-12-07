'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';

const mediaItems = [
    { id: '1', type: 'image', name: 'Generated UI Mockup', src: '🖼️', date: 'Dec 4, 2024', size: '2.4 MB', tags: ['ui', 'generated'] },
    { id: '2', type: 'image', name: 'Logo Variations', src: '🎨', date: 'Dec 3, 2024', size: '1.8 MB', tags: ['branding', 'logo'] },
    { id: '3', type: 'video', name: 'Demo Recording', src: '🎬', date: 'Dec 2, 2024', size: '45.2 MB', tags: ['demo', 'screen'] },
    { id: '4', type: 'image', name: 'Dashboard Screenshot', src: '📸', date: 'Dec 1, 2024', size: '856 KB', tags: ['screenshot'] },
    { id: '5', type: 'image', name: 'AI Generated Art', src: '🎭', date: 'Nov 30, 2024', size: '3.1 MB', tags: ['ai', 'art'] },
    { id: '6', type: 'audio', name: 'TTS Sample', src: '🔊', date: 'Nov 28, 2024', size: '512 KB', tags: ['audio', 'tts'] },
    { id: '7', type: 'image', name: 'Chart Export', src: '📊', date: 'Nov 25, 2024', size: '234 KB', tags: ['chart', 'analytics'] },
    { id: '8', type: 'video', name: 'Trading Bot Demo', src: '🎥', date: 'Nov 22, 2024', size: '128 MB', tags: ['trading', 'demo'] },
    { id: '9', type: 'image', name: 'Color Palette', src: '🎨', date: 'Nov 20, 2024', size: '89 KB', tags: ['design', 'colors'] },
    { id: '10', type: 'image', name: 'Architecture Diagram', src: '🏗️', date: 'Nov 18, 2024', size: '456 KB', tags: ['diagram', 'tech'] },
    { id: '11', type: 'audio', name: 'Voice Command Test', src: '🎤', date: 'Nov 15, 2024', size: '1.2 MB', tags: ['voice', 'test'] },
    { id: '12', type: 'image', name: 'Mobile Mockup', src: '📱', date: 'Nov 10, 2024', size: '2.8 MB', tags: ['mobile', 'ui'] },
];

const filters = ['All', 'Images', 'Videos', 'Audio'];

export default function MediaPage() {
    const [filter, setFilter] = useState('All');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [selectedItem, setSelectedItem] = useState<typeof mediaItems[0] | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredItems = mediaItems.filter(item => {
        const matchesFilter = filter === 'All' ||
            (filter === 'Images' && item.type === 'image') ||
            (filter === 'Videos' && item.type === 'video') ||
            (filter === 'Audio' && item.type === 'audio');
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesFilter && matchesSearch;
    });

    const totalSize = mediaItems.reduce((sum, item) => {
        const size = parseFloat(item.size);
        const unit = item.size.includes('MB') ? 1 : item.size.includes('KB') ? 0.001 : 0;
        return sum + (size * unit);
    }, 0);

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
                                <span className="text-gradient">Media Gallery</span>
                            </h1>
                            <p className="text-gray-400">{filteredItems.length} items • {totalSize.toFixed(1)} MB total</p>
                        </div>
                        <button className="btn-primary">📤 Upload</button>
                    </motion.div>
                </div>
            </section>

            {/* Filters */}
            <section className="container-main pb-6">
                <div className="flex flex-col md:flex-row gap-4 justify-between">
                    <div className="flex gap-4">
                        <input
                            type="text"
                            placeholder="Search media..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 w-64"
                        />
                        <div className="flex gap-2">
                            {filters.map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-4 py-2 rounded-lg text-sm ${filter === f
                                            ? 'bg-cyan-500 text-black'
                                            : 'bg-white/10 hover:bg-white/20'
                                        }`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`px-3 py-2 rounded-lg ${viewMode === 'grid' ? 'bg-cyan-500 text-black' : 'bg-white/10'}`}
                        >
                            ▦ Grid
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`px-3 py-2 rounded-lg ${viewMode === 'list' ? 'bg-cyan-500 text-black' : 'bg-white/10'}`}
                        >
                            ☰ List
                        </button>
                    </div>
                </div>
            </section>

            {/* Media Grid/List */}
            <section className="container-main pb-16">
                {viewMode === 'grid' ? (
                    <motion.div
                        className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4"
                        initial="initial"
                        animate="animate"
                        variants={{ animate: { transition: { staggerChildren: 0.02 } } }}
                    >
                        {filteredItems.map((item) => (
                            <motion.div
                                key={item.id}
                                className="glass-card p-2 cursor-pointer hover:ring-2 hover:ring-cyan-500/50 transition-all group"
                                variants={{ initial: { opacity: 0, scale: 0.9 }, animate: { opacity: 1, scale: 1 } }}
                                onClick={() => setSelectedItem(item)}
                            >
                                {/* Thumbnail */}
                                <div className="aspect-square bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center text-5xl mb-2 group-hover:scale-105 transition-transform">
                                    {item.src}
                                </div>

                                {/* Info */}
                                <h3 className="font-medium text-sm truncate">{item.name}</h3>
                                <div className="flex items-center justify-between text-xs text-gray-500">
                                    <span>{item.type}</span>
                                    <span>{item.size}</span>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    <motion.div
                        className="space-y-2"
                        initial="initial"
                        animate="animate"
                        variants={{ animate: { transition: { staggerChildren: 0.02 } } }}
                    >
                        {filteredItems.map((item) => (
                            <motion.div
                                key={item.id}
                                className="glass-card flex items-center gap-4 cursor-pointer hover:ring-2 hover:ring-cyan-500/50"
                                variants={{ initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 } }}
                                onClick={() => setSelectedItem(item)}
                            >
                                <span className="text-4xl">{item.src}</span>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-medium truncate">{item.name}</h3>
                                    <div className="flex gap-2 mt-1">
                                        {item.tags.map(tag => (
                                            <span key={tag} className="text-xs px-2 py-0.5 bg-white/10 rounded">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="text-right text-sm">
                                    <div>{item.size}</div>
                                    <div className="text-gray-500">{item.date}</div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </section>

            {/* Preview Modal */}
            {selectedItem && (
                <div
                    className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
                    onClick={() => setSelectedItem(null)}
                >
                    <motion.div
                        className="glass-card max-w-2xl w-full"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Preview */}
                        <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center text-8xl mb-4">
                            {selectedItem.src}
                        </div>

                        {/* Details */}
                        <h2 className="text-2xl font-bold mb-2">{selectedItem.name}</h2>
                        <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                            <span>{selectedItem.type.toUpperCase()}</span>
                            <span>{selectedItem.size}</span>
                            <span>{selectedItem.date}</span>
                        </div>

                        <div className="flex gap-2 mb-4">
                            {selectedItem.tags.map(tag => (
                                <span key={tag} className="px-3 py-1 bg-white/10 rounded-full text-sm">
                                    {tag}
                                </span>
                            ))}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                            <button className="flex-1 py-2 bg-cyan-500 text-black rounded-lg font-medium">
                                ⬇️ Download
                            </button>
                            <button className="flex-1 py-2 bg-white/10 rounded-lg">
                                📋 Copy Link
                            </button>
                            <button className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg">
                                🗑️
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
