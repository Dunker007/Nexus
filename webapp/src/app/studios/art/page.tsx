'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Image as ImageIcon, Download, Share2, Wand2, Settings, Layers, Maximize } from 'lucide-react';
import Link from 'next/link';

// Mock styles
const styles = [
    { id: 'photoreal', name: 'Photorealistic', image: '/styles/photo.jpg' },
    { id: 'cyberpunk', name: 'Cyberpunk', image: '/styles/cyber.jpg' },
    { id: 'anime', name: 'Anime', image: '/styles/anime.jpg' },
    { id: 'oil', name: 'Oil Painting', image: '/styles/oil.jpg' },
    { id: '3d', name: '3D Render', image: '/styles/3d.jpg' },
];

// Mock projects
const projects = [
    { id: 'p1', name: 'Neon City Game' },
    { id: 'p2', name: 'Lo-Fi Music Channel' },
    { id: 'p3', name: 'Personal Brand' },
    { id: 'new', name: '+ New Project' }
];

export default function ArtStudioPage() {
    const [prompt, setPrompt] = useState('');
    const [selectedStyle, setSelectedStyle] = useState('photoreal');
    const [selectedProject, setSelectedProject] = useState('p1');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedImages, setGeneratedImages] = useState<any[]>([]);
    const [refineImage, setRefineImage] = useState<any | null>(null);

    const handleGenerate = () => {
        if (!prompt) return;
        setIsGenerating(true);

        // Simulate generation
        setTimeout(() => {
            const newImage = {
                id: Date.now(),
                url: `https://picsum.photos/seed/${Date.now()}/1024/1024`,
                prompt: prompt,
                style: selectedStyle,
                project: projects.find(p => p.id === selectedProject)?.name
            };
            setGeneratedImages([newImage, ...generatedImages]);
            setIsGenerating(false);
        }, 3000);
    };

    return (
        <div className="min-h-screen pt-20 pb-12 bg-[#050508] text-white">
            {/* Background Gradients */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-pink-900/10 rounded-full blur-[120px]"></div>
            </div>

            <div className="container-main relative z-10">
                {/* Header */}
                <div className="flex items-center gap-2 mb-8 text-sm text-purple-400">
                    <Link href="/studios" className="hover:underline">Studios</Link>
                    <span>/</span>
                    <span>Art</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Controls Sidebar */}
                    <div className="lg:col-span-4 space-y-6">
                        <motion.div
                            className="glass-card p-6"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                                <ImageIcon className="text-purple-500" />
                                Art Studio
                            </h1>
                            <p className="text-gray-400 text-sm mb-6">
                                Create stunning visuals with AI.
                            </p>

                            <div className="space-y-6">
                                {/* Project Selector */}
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-gray-300">Target Project</label>
                                    <div className="relative">
                                        <select
                                            value={selectedProject}
                                            onChange={(e) => setSelectedProject(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm appearance-none focus:border-purple-500 outline-none"
                                        >
                                            {projects.map(p => (
                                                <option key={p.id} value={p.id} className="bg-gray-900">{p.name}</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-3 top-3 pointer-events-none text-gray-400">▼</div>
                                    </div>
                                </div>

                                {/* Prompt Input */}
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-gray-300">Prompt</label>
                                    <textarea
                                        value={prompt}
                                        onChange={(e) => setPrompt(e.target.value)}
                                        placeholder="A futuristic city with flying cars, neon lights, rainy atmosphere..."
                                        className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-purple-500/50 transition-colors resize-none"
                                    />
                                </div>

                                {/* Style Selector */}
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

                                {/* Settings */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-gray-300">Aspect Ratio</label>
                                        <select className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm outline-none">
                                            <option>1:1 (Square)</option>
                                            <option>16:9 (Landscape)</option>
                                            <option>9:16 (Portrait)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-gray-300">Quality</label>
                                        <select className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm outline-none">
                                            <option>Standard</option>
                                            <option>HD</option>
                                            <option>Ultra</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Generate Button */}
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
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <Wand2 size={20} />
                                            Generate Art
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </div>

                    {/* Canvas / Gallery */}
                    <div className="lg:col-span-8">
                        {generatedImages.length === 0 && !isGenerating ? (
                            <motion.div
                                className="h-full min-h-[600px] glass-card flex flex-col items-center justify-center text-gray-500"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-4">
                                    <Layers size={40} className="opacity-50" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">Canvas Empty</h3>
                                <p className="text-sm max-w-md text-center">
                                    Select a project, enter a prompt, and choose a style to begin creating.
                                </p>
                            </motion.div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {isGenerating && (
                                    <div className="aspect-square glass-card flex flex-col items-center justify-center animate-pulse border border-purple-500/30">
                                        <div className="w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mb-4"></div>
                                        <p className="text-purple-400 font-medium">Dreaming...</p>
                                    </div>
                                )}
                                {generatedImages.map((img) => (
                                    <motion.div
                                        key={img.id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="group relative aspect-square rounded-xl overflow-hidden glass-card p-0"
                                    >
                                        <img
                                            src={img.url}
                                            alt={img.prompt}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute top-4 left-4">
                                            <span className="bg-black/50 backdrop-blur-md px-2 py-1 rounded text-xs border border-white/10">
                                                {img.project}
                                            </span>
                                        </div>
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                                            <p className="text-sm text-white line-clamp-2 mb-4">{img.prompt}</p>
                                            <div className="flex gap-2">
                                                <button className="flex-1 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium backdrop-blur-md flex items-center justify-center gap-2 transition-colors">
                                                    <Download size={16} />
                                                    Save
                                                </button>
                                                <button
                                                    onClick={() => setRefineImage(img)}
                                                    className="p-2 bg-purple-500/20 hover:bg-purple-500/40 text-purple-300 rounded-lg backdrop-blur-md transition-colors"
                                                    title="Refine Image"
                                                >
                                                    <Settings size={16} />
                                                </button>
                                                <button className="p-2 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-md transition-colors">
                                                    <Maximize size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Refine Modal */}
            {refineImage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-card max-w-4xl w-full p-6 grid grid-cols-1 md:grid-cols-2 gap-8"
                    >
                        <div className="aspect-square rounded-lg overflow-hidden relative">
                            <img src={refineImage.url} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex flex-col">
                            <h2 className="text-2xl font-bold mb-4">Refine Image</h2>
                            <div className="space-y-4 flex-1">
                                <div>
                                    <label className="text-sm text-gray-400">Prompt Adjustment</label>
                                    <textarea
                                        defaultValue={refineImage.prompt}
                                        className="w-full h-32 bg-white/5 border border-white/10 rounded-lg p-3 text-sm mt-1"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-gray-400">Refinement Strength (0.5)</label>
                                    <input type="range" className="w-full mt-2 accent-purple-500" />
                                </div>
                            </div>
                            <div className="flex gap-4 mt-6">
                                <button
                                    onClick={() => setRefineImage(null)}
                                    className="px-6 py-3 rounded-lg text-gray-400 hover:bg-white/5"
                                >
                                    Cancel
                                </button>
                                <button className="flex-1 px-6 py-3 rounded-lg bg-purple-600 hover:bg-purple-500 font-bold">
                                    Generate Variation
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
