"use client";
import React from 'react';
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

export default function SmartFolioPage() {
    const { activeAccount, switchAccount: setActiveAccount, refreshPrices, isRefreshing, lastSync: lastUpdated, accounts, totalValue } = usePortfolio();

    return (
        <div className="flex-1 overflow-y-auto h-full w-full custom-scrollbar bg-[#0b0e11]">
            <div className="max-w-[1600px] mx-auto px-6 py-8 space-y-8 text-gray-200 font-sans selection:bg-emerald-500/30">

                {/* ─── 1. Header & Controls ─── */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-1">
                    <div className="flex-1 w-full md:w-auto">
                        <PriceTicker />
                    </div>

                    <div className="flex items-center gap-3 bg-white/[0.03] backdrop-blur-sm p-1.5 rounded-xl border border-white/5 shadow-xl">
                        {(['sui', 'alts'] as const).map(acc => (
                            <button
                                key={acc}
                                onClick={() => setActiveAccount(acc)}
                                className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-[0.2em] transition-all duration-300 ${activeAccount === acc
                                    ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] ring-1 ring-white/20'
                                    : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                                    }`}
                            >
                                {acc}
                            </button>
                        ))}
                        <div className="w-px h-6 bg-white/10 mx-1"></div>
                        <button
                            onClick={refreshPrices}
                            disabled={isRefreshing}
                            className={`w-9 h-9 flex items-center justify-center rounded-lg border transition-all ${isRefreshing
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                : 'bg-transparent border-transparent text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <span className={`text-lg leading-none ${isRefreshing ? 'animate-spin' : ''}`}>↻</span>
                        </button>
                    </div>
                </div>

                {/* ─── 2. Key Metrics ─── */}
                <DetailedMetrics />

                {/* ─── 3. Strategy & Analysis Grid ─── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                    {/* Left: Visualization (Allocation & Curve) */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
                            {/* Allocation */}
                            <div className="bg-[#0b0e11]/60 backdrop-blur-xl rounded-2xl border border-white/5 p-6 shadow-2xl shadow-black/50 relative overflow-hidden group hover:border-white/10 transition-colors">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                                <AllocationChart />
                            </div>

                            {/* Equity Curve (or Health if no curve data yet) */}
                            <div className="bg-[#0b0e11]/60 backdrop-blur-xl rounded-2xl border border-white/5 p-1 shadow-2xl shadow-black/50 relative overflow-hidden group hover:border-white/10 transition-colors flex flex-col">
                                <EquityCurve accountId={activeAccount} currentValue={totalValue} />
                            </div>
                        </div>
                    </div>

                    {/* Right: AI & Market Intel */}
                    <div className="lg:col-span-4 space-y-6 flex flex-col h-full">
                        <div className="bg-[#0b0e11]/60 backdrop-blur-xl rounded-2xl border border-white/5 p-6 shadow-2xl relative overflow-hidden">
                            <AIAnalyst />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <PortfolioHealth />
                            <FearGreedIndex />
                        </div>
                    </div>
                </div>

                {/* ─── 4. Main Asset Table (Full Width) ─── */}
                <div className="relative">
                    <AssetTable />
                </div>

                {/* ─── 5. Operations: Orders, Journal, Alerts ─── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1 space-y-6">
                        <PendingOrders />
                        <PriceAlerts />
                    </div>
                    <div className="lg:col-span-2">
                        <TradeJournal />
                    </div>
                </div>
            </div>
        </div>
    );
}
