'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Zap, ArrowLeft, Layers, Settings, Image, Clock } from 'lucide-react';
import PageBackground from '@/components/PageBackground';

export default function LaserStudioPage() {
    return (
        <div className="min-h-screen pt-20 pb-12 relative">
            <PageBackground color="indigo" />

            <div className="container-main relative z-10">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 mb-8 text-sm text-indigo-400">
                    <Link href="/studios" className="hover:underline flex items-center gap-1">
                        <ArrowLeft size={14} />
                        Studios
                    </Link>
                    <span>/</span>
                    <span>Laser</span>
                </div>

                {/* Hero */}
                <motion.div
                    className="glass-card p-12 text-center max-w-2xl mx-auto"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-indigo-500/30">
                        <Zap className="w-12 h-12 text-indigo-400" />
                    </div>

                    <span className="px-4 py-1.5 bg-purple-500/20 text-purple-400 rounded-full text-sm font-bold uppercase tracking-wider border border-purple-500/30 inline-block mb-4">
                        Coming Soon
                    </span>

                    <h1 className="text-4xl font-bold mb-4">
                        DLX <span className="text-gradient">Laser</span> Studio
                    </h1>

                    <p className="text-gray-400 mb-8 max-w-md mx-auto">
                        Precision laser engraving command center with AI vector generation
                        and intelligent material settings optimization.
                    </p>

                    {/* Planned Features */}
                    <div className="grid grid-cols-2 gap-4 text-left mb-8">
                        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                            <Image className="w-5 h-5 text-indigo-400 mb-2" />
                            <h3 className="font-semibold text-sm mb-1">AI Vector Generation</h3>
                            <p className="text-xs text-gray-500">Convert images to laser-ready vectors</p>
                        </div>
                        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                            <Layers className="w-5 h-5 text-indigo-400 mb-2" />
                            <h3 className="font-semibold text-sm mb-1">Material Profiles</h3>
                            <p className="text-xs text-gray-500">Auto-settings for wood, acrylic, leather</p>
                        </div>
                        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                            <Settings className="w-5 h-5 text-indigo-400 mb-2" />
                            <h3 className="font-semibold text-sm mb-1">Power Optimization</h3>
                            <p className="text-xs text-gray-500">AI tunes speed/power for best results</p>
                        </div>
                        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                            <Clock className="w-5 h-5 text-indigo-400 mb-2" />
                            <h3 className="font-semibold text-sm mb-1">Job Queue</h3>
                            <p className="text-xs text-gray-500">Batch process multiple engravings</p>
                        </div>
                    </div>

                    <div className="flex gap-4 justify-center">
                        <Link
                            href="/studios"
                            className="px-6 py-3 rounded-lg bg-white/10 hover:bg-white/20 font-medium transition-colors"
                        >
                            ← Back to Studios
                        </Link>
                        <button
                            disabled
                            className="px-6 py-3 rounded-lg bg-indigo-600/50 text-indigo-200 font-medium cursor-not-allowed flex items-center gap-2"
                        >
                            <Zap size={16} />
                            Notify When Ready
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
