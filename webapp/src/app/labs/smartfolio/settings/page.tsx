"use client";
import React, { useState, useEffect } from 'react';
// import { getGeminiKey, setGeminiKey, validateKey, hasGeminiKey } from '@/lib/labs/smartfolio/geminiService'; // Removed: Bridge handles auth
import { usePortfolio } from '@/context/labs/smartfolio/PortfolioContext';

type KeyStatus = 'idle' | 'testing' | 'valid' | 'invalid';

export default function SettingsPage() {
    const { exportData, importData, resetToDefaults, activeAccount } = usePortfolio();
    const [mounted, setMounted] = useState(false);
    // Key management removed - handled by Bridge
    const [keyStatus, setKeyStatus] = useState<KeyStatus>('valid'); // Assume valid for now (Bridge managed)
    const [importJson, setImportJson] = useState('');
    const [importResult, setImportResult] = useState<'success' | 'error' | null>(null);
    const [exportCopied, setExportCopied] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleExport = () => {
        const json = exportData();
        navigator.clipboard.writeText(json);
        setExportCopied(true);
        setTimeout(() => setExportCopied(false), 2000);
    };

    const handleImport = () => {
        if (!importJson.trim()) return;
        const ok = importData(importJson.trim());
        setImportResult(ok ? 'success' : 'error');
        if (ok) setImportJson('');
        setTimeout(() => setImportResult(null), 3000);
    };

    if (!mounted) return null;

    return (
        <>
            <div className="fixed inset-0 pointer-events-none opacity-20 z-0">
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-900/40 blur-[150px] rounded-full animate-pulse"></div>
                <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-900/30 blur-[150px] rounded-full animate-pulse delay-1000"></div>
            </div>

            <header className="h-14 border-b border-white/5 bg-black/40 backdrop-blur-xl flex items-center justify-between px-6 z-30 sticky top-0">
                <div className="flex items-center gap-3">
                    <span className="text-lg">⚙️</span>
                    <h1 className="text-sm font-black text-white uppercase tracking-widest">Settings</h1>
                    <span className="text-[9px] text-gray-500 font-mono bg-white/5 px-2 py-0.5 rounded border border-white/10">
                        API Keys • Data • Config
                    </span>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-20 relative z-10 custom-scrollbar">
                {/* ═══ GEMINI API KEY ═══ */}
                <section className="glass-card p-6 space-y-4 animate-fade-in-up border-l-4 border-l-blue-500/50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-xl">
                                🧠
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-white uppercase tracking-widest">Gemini AI</h3>
                                <span className="text-[9px] text-gray-500 font-mono">Google Gemini 2.0 Flash • Powers AI Analyst</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1.5 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                BRIDGE CONNECTED
                            </span>
                        </div>
                    </div>

                    <div className="bg-black/40 rounded-xl p-4 border border-white/5 flex flex-col gap-3">
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Connection Status</label>
                            <div className="text-xs text-gray-300">
                                Managed securely by Nexus Bridge. No client-side key needed.
                            </div>
                        </div>
                    </div>
                </section>

                {/* ═══ DATA MANAGEMENT ═══ */}
                <section className="glass-card p-6 space-y-4 animate-fade-in-up delay-100 border-l-4 border-l-purple-500/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-xl">
                            💾
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-white uppercase tracking-widest">Data Management</h3>
                            <span className="text-[9px] text-gray-500 font-mono">Export/Import JSON • Reset Portfolio</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Export */}
                        <div className="bg-black/40 rounded-xl p-4 border border-white/5 space-y-3 hover:border-purple-500/30 transition-colors">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Export Current State</label>
                                {exportCopied && <span className="text-[10px] text-emerald-400 font-mono animate-pulse">COPIED!</span>}
                            </div>
                            <button
                                onClick={handleExport}
                                className="w-full h-10 bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/10 rounded-lg flex items-center justify-center gap-2 text-xs font-bold text-gray-300 transition-all font-mono group"
                            >
                                <span className="group-hover:scale-110 transition-transform">📋</span>
                                Copy JSON to Clipboard
                            </button>
                            <p className="text-[10px] text-gray-600 leading-relaxed">
                                Saves your positions, pending orders, and settings to a JSON string.
                            </p>
                        </div>

                        {/* Reset */}
                        <div className="bg-black/40 rounded-xl p-4 border border-white/5 space-y-3 hover:border-red-500/30 transition-colors">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Reset Portfolio</label>
                            </div>
                            <button
                                onClick={() => {
                                    if (confirm('Are you sure? This will wipe all current data and restore defaults.')) {
                                        resetToDefaults();
                                    }
                                }}
                                className="w-full h-10 bg-red-500/10 hover:bg-red-500/20 active:bg-red-500/30 border border-red-500/20 rounded-lg flex items-center justify-center gap-2 text-xs font-bold text-red-400 transition-all font-mono group"
                            >
                                <span className="group-hover:rotate-180 transition-transform duration-500">🔄</span>
                                Factory Reset
                            </button>
                            <p className="text-[10px] text-gray-600 leading-relaxed">
                                Restores the default 50k portfolio and clears all custom entries.
                            </p>
                        </div>
                    </div>
                </section>

                {/* ═══ IMPORT DATA ═══ */}
                <section className="glass-card p-6 space-y-4 animate-fade-in-up delay-200 border-l-4 border-l-emerald-500/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-xl">
                            📥
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-white uppercase tracking-widest">Import Data</h3>
                            <span className="text-[9px] text-gray-500 font-mono">Restore from JSON Backup</span>
                        </div>
                    </div>

                    <div className="bg-black/40 rounded-xl p-4 border border-white/5 space-y-3">
                        <textarea
                            value={importJson}
                            onChange={(e) => setImportJson(e.target.value)}
                            placeholder='Paste JSON here...'
                            className="w-full h-24 bg-black/60 border border-white/10 rounded-lg p-3 text-xs font-mono text-gray-300 focus:outline-none focus:border-emerald-500/50 resize-none"
                        />
                        <div className="flex items-center justify-end gap-3">
                            {importResult === 'success' && <span className="text-[10px] text-emerald-400 font-bold font-mono">SUCCESS! RELOADING...</span>}
                            {importResult === 'error' && <span className="text-[10px] text-red-400 font-bold font-mono">INVALID JSON</span>}

                            <button
                                onClick={handleImport}
                                disabled={!importJson.trim()}
                                className="px-6 h-9 bg-emerald-500/20 hover:bg-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed border border-emerald-500/30 rounded-lg text-xs font-bold text-emerald-400 transition-all font-mono"
                            >
                                Import
                            </button>
                        </div>
                    </div>
                </section>

                {/* ═══ SYSTEM INFO ═══ */}
                <section className="glass-card p-6 space-y-4 animate-fade-in-up delay-300">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xl">
                            📊
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-white uppercase tracking-widest">System</h3>
                            <span className="text-[9px] text-gray-500 font-mono">SmartFolio v2.0 • Phase 2</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        {[
                            { label: 'Storage', value: 'localStorage', status: 'active' },
                            { label: 'Gemini AI', value: 'Bridge Connected', status: 'active' },
                            { label: 'Price Feed', value: 'Coinbase (Public)', status: 'active' },
                            { label: 'Logos', value: 'CoinGecko', status: 'active' },
                        ].map(s => (
                            <div key={s.label} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                                <div>
                                    <span className="text-[8px] text-gray-600 uppercase tracking-wider block">{s.label}</span>
                                    <span className="text-[10px] font-bold text-white">{s.value}</span>
                                </div>
                                <span className={`w-2 h-2 rounded-full ${s.status === 'active' ? 'bg-emerald-500' : 'bg-gray-600'}`}></span>
                            </div>
                        ))}
                    </div>

                    <div className="p-3 rounded-lg bg-black/40 border border-white/5">
                        <span className="text-[9px] text-gray-600 font-mono block mb-1">Stack</span>
                        <span className="text-[10px] text-gray-400 font-mono">
                            Next.js 15 • React 19 • Tailwind v4 • Gemini 2.0 Flash • Coinbase API • CoinGecko API • TradingView Widgets
                        </span>
                    </div>
                </section>

                <div className="h-10"></div>
            </div>
        </>
    );
}
