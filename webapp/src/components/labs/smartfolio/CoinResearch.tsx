"use client";
import React, { useState, useEffect } from 'react';
import { LOGO_MAPPING } from '@/lib/labs/smartfolio/store/portfolio';

interface CoinData {
    id: string;
    description: { en: string };
    market_data: {
        market_cap: { usd: number };
        total_volume: { usd: number };
        ath: { usd: number };
        ath_change_percentage: { usd: number };
        circulating_supply: number;
        max_supply: number;
        price_change_percentage_24h: number;
        price_change_percentage_7d: number;
        price_change_percentage_30d: number;
        price_change_percentage_1y: number;
    };
    links: {
        homepage: string[];
        twitter_screen_name: string;
    };
}

const CACHE_PREFIX = 'smartfolio_coin_';
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

// Mapping for common symbols to CoinGecko IDs
const ID_MAP: Record<string, string> = {
    'BTC': 'bitcoin',
    'ETH': 'ethereum',
    'SOL': 'solana',
    'SUI': 'sui',
    'AAVE': 'aave',
    'LINK': 'chainlink',
    'UNI': 'uniswap',
    'IMX': 'immutable-x',
    'ARB': 'arbitrum',
    'OP': 'optimism',
    'RENDER': 'render-token',
    'FET': 'fetch-ai',
    'INJ': 'injective-protocol',
    'TIA': 'celestia',
    'SEI': 'sei-network',
    'PEPE': 'pepe',
    'DOGE': 'dogecoin',
    'XRP': 'ripple',
    'ADA': 'cardano',
    'DOT': 'polkadot',
    'MATIC': 'matic-network',
};

export default function CoinResearch({ symbol }: { symbol: string }) {
    const [data, setData] = useState<CoinData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;
        const fetchCoinData = async () => {
            if (!symbol || symbol === 'USD') {
                setLoading(false);
                return;
            }

            const id = ID_MAP[symbol.toUpperCase()] || symbol.toLowerCase();
            const cacheKey = `${CACHE_PREFIX}${id}`;

            // 1. Check Cache
            const cached = localStorage.getItem(cacheKey);
            if (cached) {
                const { timestamp, payload } = JSON.parse(cached);
                if (Date.now() - timestamp < CACHE_DURATION) {
                    setData(payload);
                    setLoading(false);
                    return;
                }
            }

            // 2. Fetch Fresh
            try {
                setLoading(true);
                // Fetch with sparkline=false but requesting community data off
                const res = await fetch(`https://api.coingecko.com/api/v3/coins/${id}?localization=false&tickers=false&community_data=false&developer_data=false&sparkline=false`);

                if (!res.ok) throw new Error('Coin not found');

                const json = await res.json();

                if (mounted) {
                    setData(json);
                    localStorage.setItem(cacheKey, JSON.stringify({
                        timestamp: Date.now(),
                        payload: json
                    }));
                }
            } catch (err) {
                console.warn(`[CoinResearch] Failed to fetch ${id}`, err);
                if (mounted) setError('Research data unavailable');
            } finally {
                if (mounted) setLoading(false);
            }
        };

        fetchCoinData();
        return () => { mounted = false; };
    }, [symbol]);

    if (symbol === 'USD') return null;

    if (loading) return (
        <div className="p-4 animate-pulse space-y-3">
            <div className="h-4 bg-white/5 rounded w-1/3"></div>
            <div className="h-12 bg-white/5 rounded w-full"></div>
            <div className="grid grid-cols-2 gap-4">
                <div className="h-8 bg-white/5 rounded"></div>
                <div className="h-8 bg-white/5 rounded"></div>
            </div>
        </div>
    );

    if (error || !data) return (
        <div className="p-4 text-[10px] text-gray-500 font-mono text-center border border-white/5 rounded-lg bg-white/[0.02]">
            {error || 'No data found'} {symbol}
        </div>
    );

    // Parse description - remove HTML links
    const rawDesc = data.description?.en || '';
    const desc = rawDesc ? rawDesc.split('. ')[0] + '.' : 'No description available for this asset.';
    const cleanDesc = desc.replace(/<[^>]*>?/gm, '');

    const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
    const fmtNum = (n: number) => new Intl.NumberFormat('en-US', { notation: 'compact', compactDisplay: 'short' }).format(n);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in-up">
            {/* Fundamentals */}
            <div className="space-y-4">
                <h4 className="text-[10px] font-black text-amber-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    Start-Up Fundamentals
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                </h4>

                <p className="text-xs text-gray-400 leading-relaxed font-medium line-clamp-3">
                    {cleanDesc}
                </p>

                <div className="grid grid-cols-2 gap-y-3 gap-x-6">
                    <div>
                        <div className="text-[9px] text-gray-600 uppercase tracking-widest">Market Cap</div>
                        <div className="text-sm font-mono text-white font-bold">{fmt(data.market_data.market_cap.usd)}</div>
                    </div>
                    <div>
                        <div className="text-[9px] text-gray-600 uppercase tracking-widest">FDV / Volume</div>
                        <div className="text-sm font-mono text-white font-bold">
                            {fmtNum(data.market_data.total_volume.usd)} <span className="text-[9px] text-gray-500 font-normal">24h Vol</span>
                        </div>
                    </div>
                    <div>
                        <div className="text-[9px] text-gray-600 uppercase tracking-widest">Supply</div>
                        <div className="text-xs font-mono text-white">
                            {fmtNum(data.market_data.circulating_supply)} / {data.market_data.max_supply ? fmtNum(data.market_data.max_supply) : '∞'}
                        </div>
                    </div>
                    <div>
                        <div className="text-[9px] text-gray-600 uppercase tracking-widest">ATH Drawdown</div>
                        <div className="text-xs font-mono text-rose-400 font-bold">
                            {data.market_data.ath_change_percentage.usd.toFixed(1)}%
                        </div>
                        <div className="text-[8px] text-gray-600">Peak: {fmt(data.market_data.ath.usd)}</div>
                    </div>
                </div>

                <div className="flex gap-3 pt-2">
                    {data.links.homepage[0] && (
                        <a href={data.links.homepage[0]} target="_blank" rel="noreferrer" className="text-[9px] text-blue-400 hover:text-white uppercase tracking-wider font-bold border-b border-blue-400/30 hover:border-blue-400 pb-0.5 transition-all">
                            Website ↗
                        </a>
                    )}
                    {data.links.twitter_screen_name && (
                        <a href={`https://twitter.com/${data.links.twitter_screen_name}`} target="_blank" rel="noreferrer" className="text-[9px] text-blue-400 hover:text-white uppercase tracking-wider font-bold border-b border-blue-400/30 hover:border-blue-400 pb-0.5 transition-all">
                            Twitter ↗
                        </a>
                    )}
                </div>
            </div>

            {/* AI Analysis Stub + Momentum */}
            <div className="flex flex-col gap-4">
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col justify-center items-center text-center space-y-2 flex-1">
                    <span className="text-2xl opacity-20">🧠</span>
                    <p className="text-[10px] text-gray-500 font-mono max-w-[200px]">
                        Combined with portfolio data, this asset represents {((data.market_data.market_cap.usd / 1e9) > 10) ? 'Large Cap Stability' : 'High Growth Potential'}.
                    </p>
                </div>

                {/* Multi-Timeframe Performance */}
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                    <h5 className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-3 text-center">Momentum</h5>
                    <div className="grid grid-cols-4 gap-2">
                        <Momentum label="24h" val={data.market_data.price_change_percentage_24h} />
                        <Momentum label="7d" val={data.market_data.price_change_percentage_7d} />
                        <Momentum label="30d" val={data.market_data.price_change_percentage_30d} />
                        <Momentum label="1y" val={data.market_data.price_change_percentage_1y} />
                    </div>
                </div>
            </div>
        </div>
    );
}

function Momentum({ label, val }: { label: string; val: number | undefined | null }) {
    if (val === undefined || val === null) return (
        <div className="flex flex-col items-center opacity-30">
            <span className="text-[8px] text-gray-500 uppercase">{label}</span>
            <span className="text-xs font-mono font-bold text-gray-500">—</span>
        </div>
    );

    return (
        <div className="flex flex-col items-center">
            <span className="text-[8px] text-gray-500 uppercase">{label}</span>
            <span className={`text-xs font-mono font-bold ${val >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {val > 0 ? '+' : ''}{val.toFixed(1)}%
            </span>
        </div>
    );
}

