import { useState, useEffect } from 'react';
import { DAILY_QUOTES } from '../../../config/dashboardConfig';

export function QuoteWidget() {
    const [quote, setQuote] = useState<{ content: string; author: string } | null>(null);

    useEffect(() => {
        setQuote(DAILY_QUOTES[Math.floor(Math.random() * DAILY_QUOTES.length)]);
    }, []);

    return (
        <div className="flex flex-col justify-center h-full text-center px-4">
            {quote ? (
                <>
                    <p className="text-sm md:text-base italic text-white/70 font-medium leading-relaxed">"{quote.content.replace(/"/g,'')}"</p>
                    <p className="text-xs text-cyan-400/80 mt-3 font-bold tracking-widest uppercase">— {quote.author}</p>
                </>
            ) : (
                <p className="text-sm text-gray-500 animate-pulse">Loading truth...</p>
            )}
        </div>
    );
}
