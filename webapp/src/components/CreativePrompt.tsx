'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Wand2, Image as ImageIcon, Music, Video, Send } from 'lucide-react';

export default function CreativePrompt() {
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [mode, setMode] = useState<'image' | 'music' | 'video'>('image');

    const handleGenerate = () => {
        if (!prompt) return;
        setIsGenerating(true);
        // Simulate generation
        setTimeout(() => {
            setIsGenerating(false);
            setPrompt('');
        }, 3000);
    };

    return (
        <div className="glass-card p-6 w-full max-w-2xl mx-auto">
            <div className="flex items-center gap-2 mb-6">
                <Wand2 className="text-magenta-400" />
                <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-magenta-400 to-purple-400">
                    Creative Studio
                </h2>
            </div>

            {/* Mode Select */}
            <div className="flex gap-2 mb-4">
                {[
                    { id: 'image', icon: ImageIcon, label: 'Image' },
                    { id: 'music', icon: Music, label: 'Music' },
                    { id: 'video', icon: Video, label: 'Video' },
                ].map((m) => (
                    <button
                        key={m.id}
                        onClick={() => setMode(m.id as any)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${mode === m.id
                                ? 'bg-white/10 text-white border border-white/20'
                                : 'text-gray-500 hover:text-gray-300'
                            }`}
                    >
                        <m.icon size={16} />
                        <span className="text-sm font-medium">{m.label}</span>
                    </button>
                ))}
            </div>

            {/* Input Area */}
            <div className="relative">
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={`Describe the ${mode} you want to create...`}
                    className="w-full bg-black/20 border border-white/10 rounded-xl p-4 pr-12 h-32 resize-none focus:outline-none focus:border-purple-500/50 transition-colors text-white placeholder-gray-600"
                />

                <div className="absolute bottom-3 right-3">
                    <button
                        onClick={handleGenerate}
                        disabled={!prompt || isGenerating}
                        className={`p-2 rounded-lg transition-all ${prompt && !isGenerating
                                ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/50'
                                : 'bg-white/5 text-gray-600 cursor-not-allowed'
                            }`}
                    >
                        {isGenerating ? (
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1 }}
                            >
                                <Wand2 size={20} />
                            </motion.div>
                        ) : (
                            <Send size={20} />
                        )}
                    </button>
                </div>
            </div>

            {/* Helper Chips */}
            <div className="flex flex-wrap gap-2 mt-4">
                {['Cyberpunk city', 'Lo-fi beats', 'Abstract waves', 'Neon portrait'].map((chip) => (
                    <button
                        key={chip}
                        onClick={() => setPrompt(chip)}
                        className="text-xs px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors border border-white/5"
                    >
                        {chip}
                    </button>
                ))}
            </div>
        </div>
    );
}
