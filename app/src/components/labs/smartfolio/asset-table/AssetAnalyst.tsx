import { useState, useRef, useCallback, useEffect } from 'react';
import { usePortfolio } from '@/contexts/labs/smartfolio/PortfolioContext';
import { analyzePortfolio, type PortfolioSnapshot } from '@/lib/smartfolio/geminiService';
import { PERSONAS, type PositionDetailProps } from '@/config/smartfolioConfig';

export function AssetAnalyst({ symbol, asset, activeAccount, currentCashPercent }: {
    symbol: string;
    asset: PositionDetailProps['asset'];
    activeAccount: 'sui' | 'alts';
    currentCashPercent: number;
}) {
    const { activeStrategy, assets, pendingOrders, marketCondition } = usePortfolio();
    const [query, setQuery] = useState('');
    const [messages, setMessages] = useState<{ role: 'ai' | 'user'; text: string; timestamp?: string }[]>([]);
    const [typing, setTyping] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    const persona = PERSONAS[activeAccount] || PERSONAS.sui;

    const buildPositionSnapshot = useCallback((): PortfolioSnapshot => {
        const totalValue = assets.reduce((s, a) => s + a.currentValue, 0);
        return {
            accountName: activeAccount === 'sui' ? 'SUI Account' : 'Alts Account',
            strategyName: activeStrategy.name,
            targetMask: activeStrategy.targetMask,
            marketRegime: marketCondition || 'unknown',
            totalValue,
            cashPercent: currentCashPercent,
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
        };
    }, [activeAccount, activeStrategy, assets, pendingOrders, marketCondition, currentCashPercent]);

    // INITIAL ANALYSIS - Runs once on mount or when symbol changes
    useEffect(() => {
        setTyping(true);
        const snapshot = buildPositionSnapshot();
        analyzePortfolio(snapshot, persona.persona,
            `Give a status report on ${symbol}. Price $${asset.currentPrice}, PnL $${(asset.gainLoss || 0).toFixed(2)}. Allocation ${asset.allocation.toFixed(1)}% (Target ${asset.targetAllocation.toFixed(1)}%). Cash ${currentCashPercent.toFixed(0)}%. Is this position healthy? Keep it brief.`
        ).then(response => {
            setMessages([{ role: 'ai', text: response.text, timestamp: 'Now' }]);
            setTyping(false);
        }).catch(() => {
            setMessages([{ role: 'ai', text: `${persona.name} here. Monitoring ${symbol}. Standing by for queries.`, timestamp: 'Now' }]);
            setTyping(false);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [symbol]); // ONLY re-run when symbol changes

    const handleSend = useCallback(async () => {
        if (!query.trim()) return;
        const q = query.trim();
        setQuery('');
        setMessages(prev => [...prev, { role: 'user', text: q, timestamp: 'Now' }]);
        setTyping(true);

        try {
            const snapshot = buildPositionSnapshot();
            const response = await analyzePortfolio(snapshot, persona.persona,
                `User asks regarding ${symbol}: "${q}".\n\nContext: ${symbol} Price $${asset.currentPrice}, PnL $${(asset.gainLoss || 0).toFixed(2)}, Alloc ${asset.allocation.toFixed(1)}%.`
            );
            setMessages(prev => [...prev, { role: 'ai', text: response.text, timestamp: 'Now' }]);
        } catch {
            setMessages(prev => [...prev, { role: 'ai', text: "⚠️ Connection unstable. Unable to reach HQ.", timestamp: 'Now' }]);
        }
        setTyping(false);
    }, [query, symbol, asset, persona, buildPositionSnapshot]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className={`flex flex-col h-full rounded-2xl overflow-hidden border ${persona.border} bg-black/20 relative group`}>
            <div className={`px-4 py-3 flex justify-between items-center bg-white/[0.02] border-b ${persona.border}`}>
                <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg ${persona.bg} border ${persona.border} flex items-center justify-center text-lg shadow-sm`}>
                        {persona.icon}
                    </div>
                    <div className="flex flex-col">
                        <span className={`text-[10px] font-black uppercase tracking-widest ${persona.color}`}>{persona.name}</span>
                        <span className="text-[8px] text-gray-500 font-mono">Analyzing {symbol}</span>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest">Live</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar min-h-[250px] max-h-[400px]">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                        <div className={`max-w-[90%] rounded-xl px-3 py-2 text-[10px] leading-relaxed relative shadow-sm ${msg.role === 'user'
                            ? 'bg-blue-600/20 text-blue-100 border border-blue-500/20 rounded-br-none'
                            : `bg-[#1a1a1a] text-gray-300 border ${persona.border} rounded-bl-none`
                            }`}>
                            {msg.role === 'ai' && (
                                <div className={`absolute -left-2 -top-2 w-4 h-4 rounded-md ${persona.bg} border ${persona.border} flex items-center justify-center text-[8px] shadow-sm`}>
                                    {persona.icon}
                                </div>
                            )}
                            <div className="whitespace-pre-wrap">{msg.text}</div>
                        </div>
                    </div>
                ))}
                {typing && (
                    <div className="flex justify-start pl-2">
                        <div className="px-3 py-2 rounded-xl bg-white/5 border border-white/5 flex gap-1 items-center">
                            <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                            <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce"></div>
                        </div>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            <div className="p-3 bg-white/[0.01] border-t border-white/5">
                <div className="flex gap-2 items-center bg-black/40 border border-white/10 rounded-xl px-2 py-1 transition-all focus-within:border-blue-500/50 focus-within:shadow-lg focus-within:shadow-blue-500/10">
                    <input
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                        placeholder={`Ask ${persona.name} about ${symbol}...`}
                        className="flex-1 bg-transparent px-2 py-1.5 text-[10px] text-white placeholder-gray-600 outline-none font-medium"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!query.trim() || typing}
                        className={`p-1.5 rounded-lg transition-all ${query.trim() && !typing ? 'text-blue-400 hover:bg-blue-500/10' : 'text-gray-700'}`}
                    >
                        ➤
                    </button>
                </div>
            </div>
        </div>
    );
}
