'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Printer, ArrowLeft, Bell, Cog, Box, AlertTriangle, CheckCircle } from 'lucide-react';
import PageBackground from '@/components/PageBackground';

export default function Print3DStudioPage() {
    return (
        <div className="min-h-screen pt-20 pb-12 relative">
            <PageBackground color="orange" />

            <div className="container-main relative z-10">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 mb-8 text-sm text-orange-400">
                    <Link href="/studios" className="hover:underline flex items-center gap-1">
                        <ArrowLeft size={14} />
                        Studios
                    </Link>
                    <span>/</span>
                    <span>3D Print</span>
                </div>

                {/* Hero */}
                <motion.div
                    className="glass-card p-12 text-center max-w-2xl mx-auto"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 flex items-center justify-center border border-orange-500/30">
                        <Printer className="w-12 h-12 text-orange-400" />
                    </div>

                    <span className="px-4 py-1.5 bg-purple-500/20 text-purple-400 rounded-full text-sm font-bold uppercase tracking-wider border border-purple-500/30 inline-block mb-4">
                        Coming Soon
                    </span>

                    <h1 className="text-4xl font-bold mb-4">
                        DLX <span className="text-gradient">3D Print</span> Studio
                    </h1>

                    <p className="text-gray-400 mb-8 max-w-md mx-auto">
                        Autonomous print farm management with AI-powered model analysis,
                        slicing optimization, and real-time failure detection.
                    </p>

                    {/* Planned Features */}
                    <div className="grid grid-cols-2 gap-4 text-left mb-8">
                        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                            <Box className="w-5 h-5 text-orange-400 mb-2" />
                            <h3 className="font-semibold text-sm mb-1">Print Farm Control</h3>
                            <p className="text-xs text-gray-500">Manage multiple printers from one dashboard</p>
                        </div>
                        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                            <Cog className="w-5 h-5 text-orange-400 mb-2" />
                            <h3 className="font-semibold text-sm mb-1">AI Slice Optimization</h3>
                            <p className="text-xs text-gray-500">Automatic settings based on model analysis</p>
                        </div>
                        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                            <AlertTriangle className="w-5 h-5 text-orange-400 mb-2" />
                            <h3 className="font-semibold text-sm mb-1">Failure Detection</h3>
                            <p className="text-xs text-gray-500">AI monitors prints and alerts on issues</p>
                        </div>
                        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                            <Bell className="w-5 h-5 text-orange-400 mb-2" />
                            <h3 className="font-semibold text-sm mb-1">Remote Monitoring</h3>
                            <p className="text-xs text-gray-500">Watch prints from anywhere via webcam</p>
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
                            className="px-6 py-3 rounded-lg bg-orange-600/50 text-orange-200 font-medium cursor-not-allowed flex items-center gap-2"
                        >
                            <CheckCircle size={16} />
                            Notify When Ready
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
