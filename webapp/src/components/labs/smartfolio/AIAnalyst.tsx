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
        addJournalEntry,
        systemEvents
    } = usePortfolio();

    const [query, setQuery] = useState('');
    const [history, setHistory] = useState<{ role: 'user' | 'ai'; text: string; timestamp: string }[]>([]);
    const [isTyping, setIsTyping] = useState(false);

    // ─── Reconciliation Monitor ───
    const processedEvents = useRef<Set<string>>(new Set());

    useEffect(() => {
        if (!systemEvents || systemEvents.length === 0) return;

        systemEvents.forEach(evt => {
            const evtId = `${evt.type}-${evt.payload.order.id}`;
            if (processedEvents.current.has(evtId)) return;

            if (evt.type === 'reconciliation' && evt.account === activeAccount) {
                // Add System Message to History
                setHistory(prev => [...prev, {
                    role: 'ai',
                    text: `⚠️ ${evt.payload.message} Shall I archive the pending order?`,
                    timestamp: 'System'
                }]);
                processedEvents.current.add(evtId);
            }
        });
    }, [systemEvents, activeAccount]);

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
            <div className={`p-4 border-b ${persona.border} bg-white/[0.02] backdrop-blur-md flex items-center justify-between z-10 relative overflow-hidden`}>
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

                <div className="flex items-center gap-4 z-10">
                    <div className="relative group">
                        <div className={`w-12 h-12 rounded-xl ${persona.bg} border ${persona.border} flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(0,0,0,0.5)] group-hover:scale-105 transition-transform duration-300 relative z-10`}>
                            {persona.icon}
                        </div>
                        <div className={`absolute inset-0 rounded-xl ${persona.bg} blur-md opacity-40 group-hover:opacity-60 transition-opacity`}></div>
                    </div>

                    <div className="flex flex-col gap-0.5">
                        <h3 className={`text-base font-black uppercase tracking-[0.15em] ${persona.color} drop-shadow-sm leading-none`}>
                            {persona.name}
                        </h3>
                        <div className="flex items-center gap-2">
                            <span className="text-[9px] text-gray-400 font-mono tracking-wider uppercase border-r border-white/10 pr-2">
                                {persona.role}
                            </span>
                            {psychology && (
                                <span className={`text-[8px] px-1.5 py-px rounded-full border shadow-sm ${psychology.sentiment === 'Zen' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                                    psychology.sentiment === 'Fomo' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' :
                                        'bg-blue-500/10 border-blue-500/30 text-blue-400'
                                    }`}>
                                    {psychology.sentiment}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-1 z-10">
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                        <span className={`w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]`}></span>
                        <span className={`text-[9px] font-black uppercase tracking-widest text-emerald-400`}>
                            Live
                        </span>
                    </div>
                    <span className="text-[8px] font-mono text-gray-500 tracking-tight">
                        v2.5-pro
                    </span>
                </div>
            </div>

            {/* ═══ PRIMARY DIRECTIVE CARD ═══ */}
            {/* Same logic, just ensuring container is consistent */}
            {primaryDirective && (
                <div className="px-4 pt-4 relative z-10">
                    <div className={`p-4 rounded-xl border flex items-start gap-4 shadow-xl backdrop-blur-sm transition-all hover:translate-x-1 ${primaryDirective.type === 'alert'
                        ? 'bg-rose-500/5 border-rose-500/30 shadow-rose-900/10'
                        : primaryDirective.type === 'info'
                            ? 'bg-blue-500/5 border-blue-500/30 shadow-blue-900/10'
                            : 'bg-emerald-500/5 border-emerald-500/30 shadow-emerald-900/10'}`}>
                        <div className={`mt-0.5 text-2xl filter drop-shadow-md ${primaryDirective.type === 'alert' ? 'animate-bounce' : ''}`}>
                            {primaryDirective.type === 'alert' ? '⚠️' : primaryDirective.type === 'info' ? 'ℹ️' : '✅'}
                        </div>
                        <div>
                            <h4 className={`text-[11px] font-black uppercase tracking-[0.2em] mb-1 ${primaryDirective.type === 'alert' ? 'text-rose-400'
                                : primaryDirective.type === 'info' ? 'text-blue-400'
                                    : 'text-emerald-400'
                                }`}>
                                {primaryDirective.title}
                            </h4>
                            <p className="text-[11px] text-gray-300 leading-relaxed font-medium">
                                {primaryDirective.desc}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ CHAT STREAM ═══ */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar relative z-0">
                {history.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in group`}>
                        <div className={`max-w-[85%] rounded-2xl px-5 py-3 text-[11px] leading-relaxed relative shadow-lg backdrop-blur-sm transition-all hover:scale-[1.01] ${msg.role === 'user'
                            ? 'bg-gradient-to-br from-blue-600/20 to-blue-800/20 text-blue-50 border border-blue-500/30 rounded-br-sm'
                            : `bg-[#0f1115]/90 text-gray-200 border ${persona.border} rounded-bl-sm shadow-[0_4px_20px_rgba(0,0,0,0.2)]`
                            }`}>

                            {/* AI Avatar or Timestamp */}
                            {msg.role === 'ai' && (
                                <div className={`absolute -left-3 -top-3 w-6 h-6 rounded-lg ${persona.bg} border ${persona.border} flex items-center justify-center text-[10px] shadow-lg transform -rotate-6 group-hover:rotate-0 transition-transform`}>
                                    {persona.icon}
                                </div>
                            )}

                            <div className="whitespace-pre-wrap font-medium">{msg.text}</div>

                            {/* Timestamp footer */}
                            <div className={`absolute bottom-1 ${msg.role === 'user' ? 'left-2' : 'right-2'} text-[8px] opacity-30 group-hover:opacity-100 transition-opacity font-mono`}>
                                {msg.timestamp}
                            </div>
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex justify-start pl-2">
                        <div className="px-4 py-3 rounded-xl bg-white/5 border border-white/5 flex gap-1.5 items-center shadow-lg">
                            <div className="w-1.5 h-1.5 bg-blue-400/50 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                            <div className="w-1.5 h-1.5 bg-blue-400/50 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="w-1.5 h-1.5 bg-blue-400/50 rounded-full animate-bounce"></div>
                        </div>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            {/* ═══ PROPOSED ACTIONS (Floating) ═══ */}
            {proposedActions && proposedActions.length > 0 && (
                <div className="px-4 pb-2 relative z-10">
                    <div className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-2 flex items-center gap-2 px-1">
                        <span className="animate-pulse">⚡</span> Proposed Execution
                        <div className="h-px bg-gradient-to-r from-blue-500/50 to-transparent flex-1"></div>
                    </div>
                    <div className="space-y-2">
                        {proposedActions.map((action, i) => (
                            <QuickAction
                                key={i}
                                action={action}
                                onExecute={() => handleExecuteAction(action)}
                                onDismiss={() => setProposedActions(prev => prev?.filter(a => a !== action))}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* ═══ INPUT FIELD ═══ */}
            <div className="p-4 bg-gradient-to-t from-black/80 to-transparent backdrop-blur-sm border-t border-white/5 relative z-20">
                <div className="relative group">
                    <div className={`absolute -inset-0.5 bg-gradient-to-r ${persona.gradient} opacity-20 group-hover:opacity-40 rounded-xl blur transition duration-500`}></div>
                    <div className="relative flex gap-2 items-center bg-[#0b0e11] border border-white/10 rounded-xl px-2 py-1 transition-all shadow-xl group-focus-within:border-blue-500/50 group-focus-within:shadow-blue-500/10">
                        <input
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSend()}
                            placeholder={`Command ${persona.name}...`}
                            className="flex-1 bg-transparent px-3 py-3 text-xs text-white placeholder-gray-600 outline-none font-medium z-10"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!query.trim() || isTyping}
                            className={`p-2 rounded-lg transition-all duration-300 ${query.trim() && !isTyping
                                ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)] transform scale-100 hover:scale-105'
                                : 'text-gray-700 scale-95 opacity-50'}`}
                        >
                            ➤
                        </button>
                    </div>
                </div>
                <div className="flex justify-between mt-2 px-2 opacity-60 hover:opacity-100 transition-opacity">
                    <span className="text-[9px] text-gray-500 font-mono flex items-center gap-1">
                        <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                        {activeStrategy.name}
                    </span>
                    <span className={`text-[9px] font-mono font-bold tracking-wider ${isSafetyNetCritical ? 'text-rose-500 animate-pulse' : 'text-emerald-600'}`}>
                        {marketCondition?.toUpperCase() || 'LIVE'}
                    </span>
                </div>
            </div>
        </div>
    );
}
