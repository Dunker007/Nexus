import React, { useState } from 'react';

interface ActionData {
    label: string;
    type: 'buy' | 'sell';
    symbol: string;
    units: number;
    price: number;
    reason: string;
}

interface QuickActionProps {
    action: ActionData;
    onExecute: () => void;
    onDismiss: () => void;
}

export const QuickAction: React.FC<QuickActionProps> = ({ action, onExecute, onDismiss }) => {
    const [executing, setExecuting] = useState(false);

    const handleExecute = async () => {
        setExecuting(true);
        // Simulate a small delay for "Processing" feel
        await new Promise(r => setTimeout(r, 800));
        onExecute();
        setExecuting(false);
    };

    const isBuy = action.type === 'buy';
    const colorClass = isBuy ? 'emerald' : 'rose';
    const bgClass = isBuy ? 'bg-emerald-500/10' : 'bg-rose-500/10';
    const borderClass = isBuy ? 'border-emerald-500/20' : 'border-rose-500/20';
    const textClass = isBuy ? 'text-emerald-400' : 'text-rose-400';
    const btnClass = isBuy ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-rose-600 hover:bg-rose-500';

    return (
        <div className={`rounded-xl border ${borderClass} ${bgClass} p-3 my-2 animate-fade-in backdrop-blur-md`}>
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                    <span className={`text-lg p-1.5 rounded-lg bg-black/20 ${textClass}`}>
                        {isBuy ? '📥' : '📤'}
                    </span>
                    <div>
                        <h4 className={`text-sm font-bold ${textClass} uppercase tracking-wide`}>
                            {action.label}
                        </h4>
                        <span className="text-[10px] text-gray-400 font-mono">
                            {action.reason}
                        </span>
                    </div>
                </div>
                <button
                    onClick={onDismiss}
                    className="text-gray-500 hover:text-white transition-colors text-xs px-2"
                >
                    ✕
                </button>
            </div>

            <div className="flex items-center justify-between bg-black/20 rounded-lg p-2 mb-3 border border-white/5">
                <div className="flex flex-col">
                    <span className="text-[9px] text-gray-500 uppercase">Token</span>
                    <span className="text-xs font-bold text-white">{action.symbol}</span>
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-[9px] text-gray-500 uppercase">Units</span>
                    <span className="text-xs font-mono text-white">{action.units}</span>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[9px] text-gray-500 uppercase">Price</span>
                    <span className="text-xs font-mono text-white">${action.price.toFixed(4)}</span>
                </div>
            </div>

            <button
                onClick={handleExecute}
                disabled={executing}
                className={`w-full py-2 rounded-lg ${btnClass} text-white text-xs font-bold uppercase tracking-wider shadow-lg transition-all active:scale-[0.98] flex justify-center items-center gap-2`}
            >
                {executing ? (
                    <>
                        <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        Executing...
                    </>
                ) : (
                    <>
                        {isBuy ? 'Confirm Buy' : 'Confirm Sell'}
                    </>
                )}
            </button>
        </div>
    );
};
