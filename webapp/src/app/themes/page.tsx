'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';

const themes = [
    {
        id: 'cyberpunk',
        name: 'Cyberpunk',
        description: 'The default. Dark, neon, futuristic.',
        active: true,
        colors: {
            bg: '#0a0e1a',
            primary: '#00d4ff',
            secondary: '#ff00ff',
            accent: '#00ff88'
        },
        preview: ['#0a0e1a', '#00d4ff', '#ff00ff', '#00ff88', '#1a1f35']
    },
    {
        id: 'midnight',
        name: 'Midnight Blue',
        description: 'Deep blues, calm and focused.',
        active: false,
        colors: {
            bg: '#0f172a',
            primary: '#3b82f6',
            secondary: '#8b5cf6',
            accent: '#06b6d4'
        },
        preview: ['#0f172a', '#3b82f6', '#8b5cf6', '#06b6d4', '#1e293b']
    },
    {
        id: 'forest',
        name: 'Forest',
        description: 'Natural greens, earthy tones.',
        active: false,
        colors: {
            bg: '#0f1a14',
            primary: '#22c55e',
            secondary: '#84cc16',
            accent: '#14b8a6'
        },
        preview: ['#0f1a14', '#22c55e', '#84cc16', '#14b8a6', '#1a2e22']
    },
    {
        id: 'sunset',
        name: 'Sunset',
        description: 'Warm oranges and reds.',
        active: false,
        colors: {
            bg: '#1a0f0f',
            primary: '#f97316',
            secondary: '#ef4444',
            accent: '#fbbf24'
        },
        preview: ['#1a0f0f', '#f97316', '#ef4444', '#fbbf24', '#2d1a1a']
    },
    {
        id: 'monochrome',
        name: 'Monochrome',
        description: 'Pure black and white. Minimal.',
        active: false,
        colors: {
            bg: '#000000',
            primary: '#ffffff',
            secondary: '#888888',
            accent: '#cccccc'
        },
        preview: ['#000000', '#ffffff', '#888888', '#cccccc', '#1a1a1a']
    },
    {
        id: 'synthwave',
        name: 'Synthwave',
        description: 'Retro 80s vibes. Pink and purple.',
        active: false,
        colors: {
            bg: '#1a0a2e',
            primary: '#ff00ff',
            secondary: '#00ffff',
            accent: '#ff6600'
        },
        preview: ['#1a0a2e', '#ff00ff', '#00ffff', '#ff6600', '#2d1a4a']
    },
    {
        id: 'light',
        name: 'Light Mode',
        description: 'For the brave. Light background.',
        active: false,
        colors: {
            bg: '#f8fafc',
            primary: '#0ea5e9',
            secondary: '#8b5cf6',
            accent: '#10b981'
        },
        preview: ['#f8fafc', '#0ea5e9', '#8b5cf6', '#10b981', '#e2e8f0']
    },
    {
        id: 'nord',
        name: 'Nord',
        description: 'Arctic, bluish colors inspired by the North.',
        active: false,
        colors: {
            bg: '#2e3440',
            primary: '#88c0d0',
            secondary: '#81a1c1',
            accent: '#a3be8c'
        },
        preview: ['#2e3440', '#88c0d0', '#81a1c1', '#a3be8c', '#3b4252']
    },
];

const fonts = [
    { name: 'Inter', style: 'font-sans', sample: 'The quick brown fox' },
    { name: 'JetBrains Mono', style: 'font-mono', sample: 'console.log("Hello")' },
    { name: 'Space Grotesk', style: 'font-sans', sample: 'Modern & Bold' },
    { name: 'Outfit', style: 'font-sans', sample: 'Clean & Minimal' },
];

export default function ThemesPage() {
    const [selected, setSelected] = useState('cyberpunk');

    return (
        <div className="min-h-screen pt-8">
            {/* Header */}
            <section className="section-padding pb-12">
                <div className="container-main">
                    <motion.div
                        className="text-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h1 className="text-5xl md:text-6xl font-bold mb-4">
                            <span className="text-gradient">Themes</span>
                        </h1>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                            Make it yours. Choose your vibe.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Current Theme Preview */}
            <section className="container-main pb-12">
                <motion.div
                    className="glass-card relative overflow-hidden"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <div className="absolute inset-0 flex">
                        {themes.find(t => t.id === selected)?.preview.map((color, i) => (
                            <div
                                key={i}
                                className="flex-1"
                                style={{ backgroundColor: color }}
                            />
                        ))}
                    </div>
                    <div className="relative z-10 text-center py-16 bg-black/50 backdrop-blur-sm">
                        <h2 className="text-3xl font-bold mb-2">
                            {themes.find(t => t.id === selected)?.name}
                        </h2>
                        <p className="text-gray-300">
                            {themes.find(t => t.id === selected)?.description}
                        </p>
                    </div>
                </motion.div>
            </section>

            {/* Theme Grid */}
            <section className="container-main pb-16">
                <h2 className="text-xl font-bold mb-6">🎨 Choose a Theme</h2>
                <motion.div
                    className="grid grid-cols-2 md:grid-cols-4 gap-4"
                    initial="initial"
                    animate="animate"
                    variants={{ animate: { transition: { staggerChildren: 0.05 } } }}
                >
                    {themes.map((theme) => (
                        <motion.div
                            key={theme.id}
                            className={`glass-card cursor-pointer transition-all ${selected === theme.id ? 'ring-2 ring-cyan-500' : ''
                                }`}
                            variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }}
                            whileHover={{ y: -5 }}
                            onClick={() => setSelected(theme.id)}
                        >
                            {/* Color preview */}
                            <div className="flex h-12 rounded-lg overflow-hidden mb-4">
                                {theme.preview.map((color, i) => (
                                    <div
                                        key={i}
                                        className="flex-1"
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>

                            <h3 className="font-bold mb-1">{theme.name}</h3>
                            <p className="text-xs text-gray-500">{theme.description}</p>

                            {theme.active && (
                                <span className="inline-block mt-2 px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs">
                                    Active
                                </span>
                            )}
                        </motion.div>
                    ))}
                </motion.div>
            </section>

            {/* Fonts */}
            <section className="section-padding bg-[#050508]">
                <div className="container-main">
                    <h2 className="text-xl font-bold mb-6">🔤 Fonts</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {fonts.map((font) => (
                            <div key={font.name} className="glass-card text-center">
                                <div className={`text-2xl mb-2 ${font.style}`}>{font.sample}</div>
                                <div className="text-sm text-gray-500">{font.name}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Customization */}
            <section className="section-padding">
                <div className="container-main">
                    <h2 className="text-xl font-bold mb-6">⚙️ Customization Options</h2>
                    <div className="glass-card">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="font-bold mb-3">Interface</h3>
                                <div className="space-y-3">
                                    <label className="flex items-center justify-between">
                                        <span className="text-gray-400">Glass blur effect</span>
                                        <input type="checkbox" defaultChecked className="w-5 h-5" />
                                    </label>
                                    <label className="flex items-center justify-between">
                                        <span className="text-gray-400">Animations</span>
                                        <input type="checkbox" defaultChecked className="w-5 h-5" />
                                    </label>
                                    <label className="flex items-center justify-between">
                                        <span className="text-gray-400">Grid background</span>
                                        <input type="checkbox" defaultChecked className="w-5 h-5" />
                                    </label>
                                    <label className="flex items-center justify-between">
                                        <span className="text-gray-400">Glow effects</span>
                                        <input type="checkbox" defaultChecked className="w-5 h-5" />
                                    </label>
                                </div>
                            </div>
                            <div>
                                <h3 className="font-bold mb-3">Layout</h3>
                                <div className="space-y-3">
                                    <label className="flex items-center justify-between">
                                        <span className="text-gray-400">Compact mode</span>
                                        <input type="checkbox" className="w-5 h-5" />
                                    </label>
                                    <label className="flex items-center justify-between">
                                        <span className="text-gray-400">Show sidebar</span>
                                        <input type="checkbox" defaultChecked className="w-5 h-5" />
                                    </label>
                                    <label className="flex items-center justify-between">
                                        <span className="text-gray-400">Sticky navigation</span>
                                        <input type="checkbox" defaultChecked className="w-5 h-5" />
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-gray-700 flex gap-4">
                            <button className="btn-primary">Apply Theme</button>
                            <button className="btn-outline">Reset to Default</button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Back link */}
            <div className="container-main py-8">
                <Link href="/" className="text-gray-400 hover:text-cyan-400 transition-colors">
                    ← Back to Dashboard
                </Link>
            </div>
        </div>
    );
}
