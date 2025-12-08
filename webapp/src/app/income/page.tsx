'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, List, DollarSign } from 'lucide-react';
import UnifiedIncomeOverview from './UnifiedIncomeOverview';
import IncomeDashboard from './IncomeDashboard';

type ViewMode = 'unified' | 'detailed';

export default function IncomePage() {
    const [viewMode, setViewMode] = useState<ViewMode>('unified');

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 p-6 pt-24">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <DollarSign className="w-8 h-8 text-emerald-400" />
                            Revenue Hub
                        </h1>
                        <p className="text-gray-400 mt-1">Growth Phase • All Income Streams</p>
                    </div>

                    {/* View Toggle */}
                    <div className="flex bg-gray-800 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('unified')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'unified'
                                    ? 'bg-purple-600 text-white'
                                    : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            <LayoutDashboard className="w-4 h-4" />
                            Overview
                        </button>
                        <button
                            onClick={() => setViewMode('detailed')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'detailed'
                                    ? 'bg-purple-600 text-white'
                                    : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            <List className="w-4 h-4" />
                            Streams
                        </button>
                    </div>
                </div>

                {/* Content */}
                <motion.div
                    key={viewMode}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    {viewMode === 'unified' ? (
                        <UnifiedIncomeOverview />
                    ) : (
                        <IncomeDashboard dbStreams={[]} />
                    )}
                </motion.div>
            </div>
        </div>
    );
}
