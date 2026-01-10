'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Image as ImageIcon, Wand2, Layers, ShoppingBag, Tag } from 'lucide-react';
import Link from 'next/link';
import { useSettings } from '@/components/SettingsContext';

// Product templates for mockups
const MOCKUP_TEMPLATES = [
    { id: 'frame', name: 'Wall Frame', image: '/mockups/frame.png', style: { top: '25%', left: '25%', width: '50%', height: '50%' } },
    { id: 'tshirt', name: 'T-Shirt', image: '/mockups/tshirt.png', style: { top: '30%', left: '35%', width: '30%', height: '30%' } },
    { id: 'mug', name: 'Coffee Mug', image: '/mockups/mug.png', style: { top: '35%', left: '40%', width: '20%', height: '20%' } },
];

const styles = [
    { id: 'photoreal', name: 'Photorealistic' },
    { id: 'cyberpunk', name: 'Cyberpunk' },
    { id: 'anime', name: 'Anime' },
    { id: 'oil', name: 'Oil Painting' },
    { id: '3d', name: '3D Render' },
];

export default function ArtStudioPage() {
    const { settings } = useSettings();
    const [prompt, setPrompt] = useState('');
    const [selectedStyle, setSelectedStyle] = useState('photoreal');
    const [isGenerating, setIsGenerating] = useState(false);
    const [assets, setAssets] = useState<{ id: string; localPath?: string; imageUrl?: string; prompt?: string; style?: string }[]>([]);
    const [stats, setStats] = useState<{ totalProducts: number; totalRevenue: number } | null>(null);
    const [mockupMode, setMockupMode] = useState<{ localPath?: string; imageUrl?: string } | null>(null); // Asset being mocked
    const [selectedTemplate, setSelectedTemplate] = useState(MOCKUP_TEMPLATES[0]);

    // Fetch Vault
    useEffect(() => {
        fetchAssets();
        fetchStats();
    }, [settings.bridgeUrl]);

    const fetchAssets = async () => {
        try {
            const res = await fetch(`${settings.bridgeUrl}/art/products`);
            const data = await res.json();
            if (data.success) {
                setAssets(data.products);
            }
        } catch (error) {
            console.error('Failed to fetch art assets:', error);
        }
    };

    const fetchStats = async () => {
        try {
            const res = await fetch(`${settings.bridgeUrl}/art/summary`);
            const data = await res.json();
            if (data.success) {
                setStats(data.summary);
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    const handleGenerate = async () => {
        if (!prompt) return;
        setIsGenerating(true);

        // Simulate Generation Delay (placeholder)
        // In future: Call actual image gen API here
        setTimeout(async () => {
            const mockUrl = `https://picsum.photos/seed/${Date.now()}/1024/1024`;

            try {
                // Save to Vault
                const res = await fetch(`${settings.bridgeUrl}/art/products`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title: prompt.slice(0, 30) + '...',
                        prompt: prompt,
                        style: selectedStyle,
                        category: 'Digital Print',
                        platforms: ['etsy'],
                        tags: [selectedStyle, 'art', 'digital'],
                        imageUrl: mockUrl,
                        status: 'draft'
                    })
                });

                if (res.ok) {
                    await fetchAssets();
                    await fetchStats();
                    setPrompt('');
                }
            } catch (error) {
                console.error('Failed to save asset:', error);
            } finally {
                setIsGenerating(false);
            }
        }, 2000);
    };

    const generateKeywords = async (id: string) => {
        try {
            const res = await fetch(`${settings.bridgeUrl}/art/products/${id}/keywords`, { method: 'POST' });
            const data = await res.json();
            if (data.success) {
                alert(`Generated Keywords:\n${data.keywords.join(', ')}`);
            }
        } catch (error) {
            console.error('Keyword gen failed:', error);
        }
    };

    return (
        <div className="min-h-screen pt-20 pb-12 bg-[#050508] text-white">
            <div className="container-main relative z-10">
                {/* Header */}
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-2 text-sm text-purple-400">
                            <Link href="/studios" className="hover:underline">Studios</Link>
                            <span>/</span>
                            <span>Art</span>
                        </div>
                        <h1 className="text-3xl font-bold flex items-center gap-3">
                            <ImageIcon className="text-purple-500" />
                            Art Asset Factory
                        </h1>
                        <p className="text-gray-400 text-sm mt-1">
                            Stockpile digital assets for the vault.
                        </p>
                    </div>
                    {stats && (
                        <div className="flex gap-6 text-sm">
                            <div className="text-center">
                                <span className="block text-2xl font-bold text-white">{stats.totalProducts}</span>
                                <span className="text-gray-500">In Vault</span>
                            </div>
                            <div className="text-center">
                                <span className="block text-2xl font-bold text-green-400">${stats.totalRevenue}</span>
                                <span className="text-gray-500">Revenue</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Controls Sidebar */}
                    <div className="lg:col-span-4 space-y-6">
                        <motion.div
                            className="glass-card p-6"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <Wand2 className="w-5 h-5 text-pink-500" />
                                Generator
                            </h2>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-gray-300">Prompt</label>
                                    <textarea
                                        value={prompt}
                                        onChange={(e) => setPrompt(e.target.value)}
                                        placeholder="Describe your masterpiece..."
                                        className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-purple-500/50 transition-colors resize-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2 text-gray-300">Style</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {styles.map(style => (
                                            <button
                                                key={style.id}
                                                onClick={() => setSelectedStyle(style.id)}
                                                className={`p-3 rounded-lg text-sm text-left transition-all ${selectedStyle === style.id
                                                    ? 'bg-purple-500/20 border border-purple-500 text-white'
                                                    : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'
                                                    }`}
                                            >
                                                {style.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    onClick={handleGenerate}
                                    disabled={!prompt || isGenerating}
                                    className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${!prompt || isGenerating
                                        ? 'bg-white/5 text-gray-500 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:scale-[1.02] shadow-lg shadow-purple-900/20'
                                        }`}
                                >
                                    {isGenerating ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            Mining Asset...
                                        </>
                                    ) : (
                                        <>
                                            <Wand2 size={20} />
                                            Generate & Vault
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </div>

                    {/* Vault Gallery */}
                    <div className="lg:col-span-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {isGenerating && (
                                <div className="aspect-square glass-card flex flex-col items-center justify-center animate-pulse border border-purple-500/30">
                                    <div className="w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mb-4"></div>
                                    <p className="text-purple-400 font-medium">Synthesizing...</p>
                                </div>
                            )}
                            {assets.map((img) => (
                                <motion.div
                                    key={img.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="group relative aspect-square rounded-xl overflow-hidden glass-card p-0 border border-white/5"
                                >
                                    <img
                                        src={img.localPath || img.imageUrl} // Fallback to localPath if set
                                        alt={img.prompt}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />

                                    {/* Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                                        <p className="text-xs text-purple-300 mb-1 uppercase tracking-wider font-bold">{img.style}</p>
                                        <p className="text-sm text-white line-clamp-2 mb-4 leading-relaxed">{img.prompt}</p>

                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                onClick={() => setMockupMode(img)}
                                                className="py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-medium backdrop-blur-md flex items-center justify-center gap-1 transition-colors"
                                            >
                                                <ShoppingBag size={14} /> Mockup
                                            </button>
                                            <button
                                                onClick={() => generateKeywords(img.id)}
                                                className="py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg text-xs font-medium backdrop-blur-md flex items-center justify-center gap-1 transition-colors"
                                            >
                                                <Tag size={14} /> SEO Tags
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                            {assets.length === 0 && !isGenerating && (
                                <div className="col-span-full h-64 flex flex-col items-center justify-center text-gray-500 bg-white/5 rounded-xl border border-dashed border-white/10">
                                    <Layers className="w-12 h-12 mb-4 opacity-50" />
                                    <p>Vault is empty.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Mockup Modal */}
            {mockupMode && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-card max-w-5xl w-full h-[80vh] flex overflow-hidden rounded-2xl border border-white/10"
                    >
                        {/* Sidebar */}
                        <div className="w-64 bg-black/40 border-r border-white/10 p-6 flex flex-col">
                            <h3 className="text-lg font-bold mb-6">Mockup Lab</h3>
                            <div className="space-y-2">
                                {MOCKUP_TEMPLATES.map(t => (
                                    <button
                                        key={t.id}
                                        onClick={() => setSelectedTemplate(t)}
                                        className={`w-full p-3 rounded-lg text-left text-sm transition-all ${selectedTemplate.id === t.id
                                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                            : 'hover:bg-white/5 text-gray-400'
                                            }`}
                                    >
                                        {t.name}
                                    </button>
                                ))}
                            </div>
                            <div className="mt-auto">
                                <button
                                    onClick={() => setMockupMode(null)}
                                    className="w-full py-3 rounded-lg bg-white/10 hover:bg-white/20 text-sm font-medium"
                                >
                                    Close Lab
                                </button>
                            </div>
                        </div>

                        {/* Preview Area */}
                        <div className="flex-1 bg-[#1a1a1a] flex items-center justify-center p-10 relative">
                            <div className="relative aspect-[4/3] bg-white rounded shadow-2xl overflow-hidden max-h-full max-w-full">
                                {/* Placeholder for actual template image - using gray background for now if image missing */}
                                <div className="absolute inset-0 bg-gray-200 flex items-center justify-center text-gray-300 font-bold text-4xl uppercase tracking-widest">
                                    {selectedTemplate.name}
                                </div>
                                <img
                                    src={selectedTemplate.image}
                                    className="absolute inset-0 w-full h-full object-cover mix-blend-multiply opacity-50 pointer-events-none z-20"
                                    onError={(e) => {
                                        // Hide image on error so generic background shows
                                        e.currentTarget.style.display = 'none';
                                    }}
                                />

                                {/* The Art Layer */}
                                <div
                                    className="absolute z-10 bg-white"
                                    style={{
                                        ...selectedTemplate.style
                                    }}
                                >
                                    <img
                                        src={mockupMode.localPath || mockupMode.imageUrl}
                                        className="w-full h-full object-cover mix-blend-multiply"
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
