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
        <div className="flex-1 overflow-y-auto h-full w-full custom-scrollbar">
            <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 text-gray-200 font-sans selection:bg-emerald-500/30">
                {/* ─── Dashboard Header ─── */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[#0b0e11]/50 backdrop-blur-md px-4 py-1 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-4 flex-1 min-w-0">

                        <div className="hidden md:block w-full max-w-[600px] rounded-xl overflow-hidden border border-white/5 relative">
                            <PriceTicker />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex bg-white/5 p-0.5 rounded-lg border border-white/5">
                            {/* <span className="text-[10px] text-gray-500 font-mono flex items-center px-2">ACCOUNT:</span> */}
                            {(['sui', 'alts'] as const).map(acc => (
                                <button
                                    key={acc}
                                    onClick={() => setActiveAccount(acc)}
                                    className={`px-4 py-0.5 rounded-md text-xs font-black uppercase tracking-widest transition-all ${activeAccount === acc
                                        ? 'bg-white/10 text-white shadow-sm border border-white/10'
                                        : 'text-gray-500 hover:text-gray-300'
                                        }`}
                                >
                                    {acc}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={refreshPrices}
                            disabled={isRefreshing}
                            className={`p-0.5 rounded-lg border transition-all ${isRefreshing
                                ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400 animate-pulse'
                                : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
                                }`}
                        >
                            <span className={`block ${isRefreshing ? 'animate-spin' : ''}`}>↻</span>
                        </button>
                    </div>
                </div>

                {/* ─── Main Content ─── */}

                {/* ─── Metrics Row ─── */}
                <DetailedMetrics />

                {/* ─── Main Content ─── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Col: Key Metrics & Allocation */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* Allocation Chart */}
                        <div className="min-h-[350px] bg-[#0F1216] rounded-2xl border border-white/5 p-6 relative overflow-hidden group">
                            <AllocationChart />
                        </div>

                        {/* Equity Curve */}
                        <EquityCurve accountId={activeAccount} currentValue={totalValue} />

                        <AssetTable />
                    </div>

                    {/* Right Col: AI, Health, Utilities */}
                    <div className="lg:col-span-4 space-y-6">
                        <PortfolioHealth />
                        <FearGreedIndex />
                        <AIAnalyst />
                        <PendingOrders />
                        <PriceAlerts />
                        <div className="h-[400px]">
                            <TradeJournal />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
