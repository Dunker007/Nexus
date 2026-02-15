"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { usePortfolio } from '@/context/labs/smartfolio/PortfolioContext';
import AssetTable from '@/components/labs/smartfolio/AssetTable';
import PortfolioHealth from '@/components/labs/smartfolio/PortfolioHealth';
import AllocationChart from '@/components/labs/smartfolio/AllocationChart';
import DetailedMetrics from '@/components/labs/smartfolio/DetailedMetrics';
import PriceAlerts from '@/components/labs/smartfolio/PriceAlerts';
import PendingOrders from '@/components/labs/smartfolio/PendingOrders';
import TradeJournal from '@/components/labs/smartfolio/TradeJournal';
import AIAnalyst from '@/components/labs/smartfolio/AIAnalyst';
import FearGreedIndex from '@/components/labs/smartfolio/FearGreedIndex';
import EquityCurve from '@/components/labs/smartfolio/EquityCurve';
import PriceTicker from '@/components/labs/smartfolio/PriceTicker';
import PageBackground from '@/components/PageBackground';
import { Activity, Wifi } from 'lucide-react';

export default function SmartFolioPage() {
    const { activeAccount, switchAccount: setActiveAccount, refreshPrices, isRefreshing, lastSync: lastUpdated, totalValue } = usePortfolio();

    const containerVariants: any = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants: any = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 50 } }
    };

    return (
        <div className="relative flex-1 overflow-y-auto h-full w-full custom-scrollbar bg-[#0b0e11] selection:bg-emerald-500/30">
            {/* 🌌 Atmospheric Background */}
            <PageBackground color="cyan" />

            <div className="max-w-[1600px] mx-auto px-6 py-8 space-y-8 text-gray-200 font-sans relative z-10">

                {/* ─── 1. Enhanced Header & Controls ─── */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row items-center justify-between gap-6 p-1"
                >
                    <div className="flex-1 w-full md:w-auto flex items-center gap-4">
                        <div className="h-10 w-1 bg-gradient-to-b from-blue-500 to-cyan-400 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.6)]"></div>
                        <div className="flex flex-col">
                            <h1 className="text-2xl font-black uppercase tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-200 filter drop-shadow-lg">
                                SmartFolio <span className="text-[10px] align-top text-blue-400">v2.5</span>
                            </h1>
                            <div className="flex items-center gap-2 text-[10px] font-mono text-cyan-400/80">
                                <Wifi size={10} className="animate-pulse" />
                                <span>BRIDGE ONLINE</span>
                                <span className="text-gray-600">|</span>
                                <Activity size={10} />
                                <span>GEMINI 2.5 PRO ACTIVE</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 bg-white/[0.03] backdrop-blur-xl p-1.5 rounded-xl border border-white/10 shadow-2xl shadow-black/20 ring-1 ring-white/5">
                        {(['sui', 'alts'] as const).map(acc => (
                            <button
                                key={acc}
                                onClick={() => setActiveAccount(acc)}
                                className={`relative overflow-hidden px-6 py-2 rounded-lg text-xs font-black uppercase tracking-[0.2em] transition-all duration-300 group ${activeAccount === acc
                                    ? 'bg-blue-600 text-white shadow-[0_0_25px_rgba(37,99,235,0.5)] ring-1 ring-white/20'
                                    : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                                    }`}
                            >
                                <span className="relative z-10">{acc === 'sui' ? 'Anchor' : 'Tactician'}</span>
                                {activeAccount === acc && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] animate-[shimmer_2s_infinite]"></div>
                                )}
                            </button>
                        ))}
                        <div className="w-px h-6 bg-white/10 mx-1"></div>
                        <button
                            onClick={refreshPrices}
                            disabled={isRefreshing}
                            className={`w-9 h-9 flex items-center justify-center rounded-lg border transition-all ${isRefreshing
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                                : 'bg-transparent border-transparent text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <span className={`text-lg leading-none ${isRefreshing ? 'animate-spin' : ''}`}>↻</span>
                        </button>
                    </div>
                </motion.div>

                <PriceTicker />

                {/* ─── 2. Main Content Grid ─── */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-8"
                >
                    {/* Key Metrics */}
                    <motion.div variants={itemVariants}>
                        <DetailedMetrics />
                    </motion.div>

                    {/* Strategy & Analysis Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                        {/* Left: Visualization (Allocation & Curve) */}
                        <div className="lg:col-span-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
                                {/* Allocation */}
                                <motion.div variants={itemVariants} className="bg-[#0b0e11]/40 backdrop-blur-2xl rounded-3xl border border-white/5 p-6 shadow-2xl relative overflow-hidden group hover:border-blue-500/20 transition-all duration-500">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:bg-blue-500/10 transition-all duration-1000"></div>
                                    <AllocationChart />
                                </motion.div>

                                {/* Equity Curve */}
                                <motion.div variants={itemVariants} className="bg-[#0b0e11]/40 backdrop-blur-2xl rounded-3xl border border-white/5 p-1 shadow-2xl relative overflow-hidden group hover:border-emerald-500/20 transition-all duration-500 flex flex-col">
                                    <div className="absolute bottom-0 left-0 w-full h-32 bg-emerald-500/5 blur-[80px] pointer-events-none group-hover:bg-emerald-500/10 transition-all duration-1000"></div>
                                    <EquityCurve accountId={activeAccount} currentValue={totalValue} />
                                </motion.div>
                            </div>
                        </div>

                        {/* Right: AI & Market Intel */}
                        <div className="lg:col-span-4 space-y-6 flex flex-col h-full">
                            <motion.div variants={itemVariants} className="bg-[#0b0e11]/40 backdrop-blur-2xl rounded-3xl border border-white/5 p-0 shadow-2xl relative overflow-hidden hover:border-purple-500/20 transition-colors duration-500">
                                <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent pointer-events-none"></div>
                                <div className="p-6 relative z-10">
                                    <AIAnalyst />
                                </div>
                            </motion.div>
                            <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
                                <PortfolioHealth />
                                <FearGreedIndex />
                            </motion.div>
                        </div>
                    </div>

                    {/* Main Asset Table */}
                    <motion.div variants={itemVariants} className="relative">
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-emerald-500/20 rounded-[2rem] blur-xl opacity-20 pointer-events-none"></div>
                        <AssetTable />
                    </motion.div>

                    {/* Operations: Orders, Journal, Alerts */}
                    <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-1 space-y-6">
                            <PendingOrders />
                            <PriceAlerts />
                        </div>
                        <div className="lg:col-span-2">
                            <TradeJournal />
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}
