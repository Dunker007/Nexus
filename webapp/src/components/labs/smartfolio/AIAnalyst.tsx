"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { usePortfolio } from '@/context/labs/smartfolio/PortfolioContext';
import {
    sendMessage,
    quickHealthCheck,
    PortfolioSnapshot,
    AIData
} from '@/lib/labs/smartfolio/geminiService';
import { QuickAction } from './QuickAction';

// ─── Persona Definitions ───
const PERSONAS = {
    sui: {
        name: 'The Anchor',
        role: 'Strategic Accumulation Manager',
        icon: '⚓',
        color: 'text-blue-400',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/20',
        gradient: 'from-blue-900/50 to-blue-600/10',
        voice: 'Disciplined. Mathematical. Obsessed with 60/40 ratio.',
        persona: 'anchor' as const,
    },
    alts: {
        name: 'The Tactician',
        role: 'High Conviction Rotator',
        icon: '⚡',
        color: 'text-purple-400',
        bg: 'bg-purple-500/10',
        border: 'border-purple-500/20',
        gradient: 'from-purple-900/50 to-purple-600/10',
        voice: 'Agile. Anti-bloat. Maximizing the High Conviction 5.',
        persona: 'tactician' as const,
    }
};

export default function AIAnalyst() {
    const {
        activeStrategy,
        activeAccount,
        assets,
        pendingOrders,
        marketCondition,
        journal,
        // Global Unified State
        globalTotalValue,
        globalCashBalance,
        isSafetyNetCritical,
        getAccountState,
        addJournalEntry
    } = usePortfolio();

    const [query, setQuery] = useState('');
    const [history, setHistory] = useState<{ role: 'user' | 'ai'; text: string; timestamp: string }[]>([]);
    const [isTyping, setIsTyping] = useState(false);

    // Directive State (AI Driven or Local Fallback)
    const [primaryDirective, setPrimaryDirective] = useState<{ title: string; desc: string; type: 'alert' | 'success' | 'info' } | null>(null);
    const [aiDirective, setAiDirective] = useState<{ title: string; desc: string; type: 'alert' | 'success' | 'info' } | null>(null);
    const [proposedActions, setProposedActions] = useState<AIData['actions']>([]);
    const [psychology, setPsychology] = useState<AIData['psychology'] | undefined>(undefined);

    const bottomRef = useRef<HTMLDivElement>(null);

    const persona = PERSONAS[activeAccount];
    const totalValue = assets.reduce((s, a) => s + a.currentValue, 0);
    const cashAsset = assets.find(a => a.symbol === 'USD');
    const cashPercent = totalValue > 0 ? ((cashAsset?.currentValue || 0) / totalValue * 100) : 0;

    // ─── Build Portfolio Snapshot for Gemini ───
    const buildSnapshot = useCallback((): PortfolioSnapshot => {
        const suiState = getAccountState('sui');
        const altsState = getAccountState('alts');

        // Helper to map assets to simple snapshot
        const mapSimple = (assets: any[]) => {
            const val = assets.reduce((s: number, a: any) => s + a.currentValue, 0);
            const cash = assets.find((a: any) => a.symbol === 'USD')?.currentValue || 0;
            return {
                totalValue: val,
                cashPercent: val > 0 ? (cash / val) * 100 : 0,
                positions: assets.filter((a: any) => a.symbol !== 'USD').map((a: any) => ({
                    symbol: a.symbol,
                    units: a.units,
                    avgCost: a.avgCost,
                    currentPrice: a.currentPrice,
                    currentValue: a.currentValue,
                    allocation: a.allocation,
                    gainLoss: a.gainLoss
                }))
            };
        };

        return {
            accountName: activeAccount === 'sui' ? 'SUI Account' : 'Alts Account',
            strategyName: activeStrategy.name,
            targetMask: activeStrategy.targetMask,
            marketRegime: marketCondition,
            totalValue,
            cashPercent,
            positions: assets.filter(a => a.symbol !== 'USD').map(a => ({
                symbol: a.symbol,
                units: a.units,
                avgCost: a.avgCost,
                currentPrice: a.currentPrice,
                currentValue: a.currentValue,
                allocation: a.allocation,
                targetAllocation: a.targetAllocation,
                gainLoss: a.gainLoss,
            })),
            pendingOrders: pendingOrders.map(o => ({
                type: o.type,
                symbol: o.symbol,
                units: o.units,
                price: o.price,
                note: o.note,
            })),
            strategyRules: activeStrategy.rules,
            journal: journal.slice(0, 10), // Send last 10 entries for context

            // GLOBAL TRIAD AWARENESS
            global: {
                totalValue: globalTotalValue,
                cashPercent: globalTotalValue > 0 ? (globalCashBalance / globalTotalValue) * 100 : 0,
                isSafetyNetCritical,
                suiAccount: mapSimple(suiState.assets),
                altsAccount: mapSimple(altsState.assets)
            }
        };
    }, [activeAccount, activeStrategy, assets, pendingOrders, journal, globalTotalValue, globalCashBalance, isSafetyNetCritical, getAccountState]);

    // ─── Initialize Chat on Account Change ───
    const lastGreetedAccount = useRef<string | null>(null);

    useEffect(() => {
        if (lastGreetedAccount.current === activeAccount) return;
        if (assets.length === 0) return;

        lastGreetedAccount.current = activeAccount;
        const snapshot = buildSnapshot();

        quickHealthCheck(snapshot, persona.persona).then(greeting => {
            setHistory([{
                role: 'ai',
                text: greeting, // Simple text greeting (no JSON parsing for health check yet)
                timestamp: 'Just now'
            }]);
        }).catch((err: any) => {
            console.warn("Gemini Greeting Failed", err);
            setHistory([{
                role: 'ai',
                text: `${persona.name} Online. Global Grid Active.`,
                timestamp: 'Just now'
            }]);
        });
    }, [activeAccount, persona, assets.length, buildSnapshot]);

    // ─── Directive Engine: Local Rules + AI Overlay ───
    useEffect(() => {
        if (aiDirective) {
            setPrimaryDirective(aiDirective);
            return;
        }

        // FALLBACK: Local Rules (Safety Net -> Account Specific)
        if (isSafetyNetCritical) {
            setPrimaryDirective({
                title: 'SAFETY NET CRITICAL',
                desc: 'Global Cash < 5%. DO NOT BUY. All agents must prioritize rebuilding reserves.',
                type: 'alert'
            });
            return;
        }

        if (activeAccount === 'sui') {
            const sui = assets.find(a => a.symbol === 'SUI');
            const suiAlloc = sui?.allocation || 0;

            if (suiAlloc > 62) {
                setPrimaryDirective({
                    title: 'OVERWEIGHT DETECTED',
                    desc: `SUI is at ${suiAlloc.toFixed(1)}% (Target 60%). Recommend trimming to restore cash buffer.`,
                    type: 'alert'
                });
            } else if (cashPercent < 10) {
                setPrimaryDirective({
                    title: 'CASH LOW',
                    desc: 'Liquidity below 10%. Stop buying. Prioritize SUI trims on next pump.',
                    type: 'alert'
                });
            } else {
                setPrimaryDirective({
                    title: 'ACCUMULATION MODE',
                    desc: 'Portfolio balanced. Maintain 60/40 drift checks.',
                    type: 'success'
                });
            }
        } else {
            // Tactician Rules
            const positionCount = assets.filter(a => a.symbol !== 'USD' && a.currentValue > 10).length;
            if (positionCount > 5) {
                setPrimaryDirective({
                    title: 'BLOAT WARNING',
                    desc: `Holding ${positionCount} positions. Doctrine limit is 5. Consolidate conviction.`,
                    type: 'alert'
                });
            } else {
                setPrimaryDirective({
                    title: 'HIGH CONVICTION',
                    desc: 'Core 5 structure intact. Monitoring rotation opportunities.',
                    type: 'success'
                });
            }
        }
    }, [activeAccount, assets, pendingOrders, marketCondition, isSafetyNetCritical, aiDirective]);


    // ─── Action Handler ───
    const handleExecuteAction = (action: NonNullable<AIData['actions']>[0]) => {
        addJournalEntry({
            type: action.type,
            symbol: action.symbol,
            units: action.units,
            price: action.price,
            notes: `AI Execution: ${action.reason}`,
            timestamp: new Date().toISOString()
        });

        // Remove from list
        setProposedActions(prev => prev?.filter(a => a !== action));

        // Add success message
        setHistory(prev => [...prev, {
            role: 'ai',
            text: `✅ Executed: ${action.type.toUpperCase()} ${action.units} ${action.symbol}.`,
            timestamp: 'Just now'
        }]);
    };

    // ─── Send Message Handler ───
    const handleSend = async () => {
        if (!query.trim()) return;
        const userMessage = query.trim();
        setQuery('');

        setHistory(prev => [...prev, { role: 'user', text: userMessage, timestamp: 'Now' }]);
        setIsTyping(true);
        setProposedActions([]); // Clear previous actions on new query

        try {
            const snapshot = buildSnapshot();
            const response = await sendMessage(snapshot, persona.persona, history, userMessage);

            setHistory(prev => [...prev, { role: 'ai', text: response.text, timestamp: 'Just now' }]);

            // Handle AI Data Payloads
            if (response.data) {
                if (response.data.directive) {
                    setAiDirective(response.data.directive);
                }
                if (response.data.actions && response.data.actions.length > 0) {
                    setProposedActions(response.data.actions);
                }
                if (response.data.psychology) {
                    setPsychology(response.data.psychology);
                }
            }

        } catch (error) {
            setHistory(prev => [...prev, { role: 'ai', text: '⚠️ Bridge error. Check connection.', timestamp: 'Just now' }]);
        }

        setIsTyping(false);
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className={`flex flex-col h-full overflow-hidden relative ${persona.gradient} bg-opacity-20 transition-all duration-500 ${isSafetyNetCritical ? 'border-4 border-rose-600 shadow-[inset_0_0_50px_rgba(225,29,72,0.3)]' : ''
            }`}>
            {/* SAFETY NET OVERLAY: Striped Background Pattern for Critical State */}
            {isSafetyNetCritical && (
                <div className="absolute inset-0 pointer-events-none opacity-10"
                    style={{ backgroundImage: 'repeating-linear-gradient(45deg, #000, #000 10px, #ff0000 10px, #ff0000 20px)' }}>
                </div>
            )}

            {/* ═══ COMMAND HEADER ═══ */}
            <div className={`p-4 border-b ${persona.border} bg-black/20 backdrop-blur-md flex items-center justify-between z-10`}>
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${persona.bg} border ${persona.border} flex items-center justify-center text-xl shadow-[0_0_15px_rgba(0,0,0,0.3)]`}>
                        {persona.icon}
                    </div>
                    <div>
                        <h3 className={`text-sm font-black uppercase tracking-widest ${persona.color} drop-shadow-sm`}>
                            {persona.name}
                        </h3>
                        <div className="flex items-center gap-2">
                            <span className="text-[9px] text-gray-400 font-mono tracking-wider uppercase">
                                {persona.role}
                            </span>
                            {psychology && (
                                <span className={`text-[8px] px-1.5 py-0.5 rounded-full border ${psychology.sentiment === 'Zen' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                                    psychology.sentiment === 'Fomo' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' :
                                        'bg-blue-500/10 border-blue-500/30 text-blue-400'
                                    }`}>
                                    Mindset: {psychology.sentiment}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]`}></span>
                        <span className={`text-[9px] font-bold uppercase tracking-widest text-emerald-500`}>
                            Bridge Live
                        </span>
                    </div>
                    <span className="text-[8px] text-gray-500">
                        gemini-2.5-pro
                    </span>
                </div>
            </div>

            {/* ═══ PRIMARY DIRECTIVE CARD ═══ */}
            {primaryDirective && (
                <div className="px-4 pt-4">
                    <div className={`p-3 rounded-lg border-l-2 flex items-start gap-3 shadow-lg transition-all hover:scale-[1.01] ${primaryDirective.type === 'alert'
                        ? 'bg-rose-500/10 border-l-rose-500 border-y border-r border-rose-500/10'
                        : primaryDirective.type === 'info'
                            ? 'bg-blue-500/10 border-l-blue-500 border-y border-r border-blue-500/10'
                            : 'bg-emerald-500/10 border-l-emerald-500 border-y border-r border-emerald-500/10'}`}>
                        <div className={`mt-0.5 text-lg ${primaryDirective.type === 'alert' ? 'animate-bounce' : ''}`}>
                            {primaryDirective.type === 'alert' ? '⚠️' : primaryDirective.type === 'info' ? 'ℹ️' : '✅'}
                        </div>
                        <div>
                            <h4 className={`text-[10px] font-black uppercase tracking-widest mb-0.5 ${primaryDirective.type === 'alert' ? 'text-rose-400'
                                : primaryDirective.type === 'info' ? 'text-blue-400'
                                    : 'text-emerald-400'
                                }`}>
                                {primaryDirective.title}
                            </h4>
                            <p className="text-[10px] text-gray-300 leading-relaxed font-medium">
                                {primaryDirective.desc}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ CHAT STREAM ═══ */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {history.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                        <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-[11px] leading-relaxed relative shadow-md ${msg.role === 'user'
                            ? 'bg-blue-600/20 text-blue-100 border border-blue-500/30 rounded-br-none'
                            : `bg-[#1a1a1a] text-gray-300 border ${persona.border} rounded-bl-none`
                            }`}>
                            {/* AI Avatar for messages */}
                            {msg.role === 'ai' && (
                                <div className={`absolute -left-2 -top-2 w-4 h-4 rounded-full ${persona.bg} border ${persona.border} flex items-center justify-center text-[8px]`}>
                                    {persona.icon}
                                </div>
                            )}
                            <div className="whitespace-pre-wrap">{msg.text}</div>
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex justify-start">
                        <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 flex gap-1 items-center">
                            <span className="w-1 h-1 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                            <span className="w-1 h-1 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="w-1 h-1 bg-gray-500 rounded-full animate-bounce"></span>
                        </div>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            {/* ═══ PROPOSED ACTIONS ═══ */}
            {proposedActions && proposedActions.length > 0 && (
                <div className="px-4 pb-2">
                    <div className="text-[10px] font-bold text-gray-500 uppercase mb-1 flex items-center gap-2">
                        <span>⚡ Proposed Execution</span>
                        <div className="h-px bg-white/10 flex-1"></div>
                    </div>
                    {proposedActions.map((action, i) => (
                        <QuickAction
                            key={i}
                            action={action}
                            onExecute={() => handleExecuteAction(action)}
                            onDismiss={() => setProposedActions(prev => prev?.filter(a => a !== action))}
                        />
                    ))}
                </div>
            )}

            {/* ═══ INPUT FIELD ═══ */}
            <div className="p-4 bg-black/40 backdrop-blur-md border-t border-white/5">
                <div className="flex gap-2 items-center bg-[#0b0e11] border border-white/10 rounded-xl px-2 py-1 focus-within:border-blue-500/50 transition-colors shadow-inner">
                    <input
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                        placeholder={`Ask ${persona.name} anything...`}
                        className="flex-1 bg-transparent px-2 py-2 text-xs text-white placeholder-gray-600 outline-none font-medium"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!query.trim() || isTyping}
                        className={`p-2 rounded-lg transition-all ${query.trim() && !isTyping ? 'text-blue-400 hover:text-blue-300 hover:bg-blue-500/10' : 'text-gray-700'}`}
                    >
                        ➤
                    </button>
                </div>
                <div className="flex justify-between mt-2 px-1">
                    <span className="text-[9px] text-gray-600 font-mono">Strategy: {activeStrategy.name}</span>
                    <span className={`text-[9px] font-mono text-emerald-600`}>
                        {isSafetyNetCritical ? '⚠️ SAFETY NET CRITICAL' : marketCondition?.toUpperCase() || 'LIVE'}
                    </span>
                </div>
            </div>
        </div>
    );
}
