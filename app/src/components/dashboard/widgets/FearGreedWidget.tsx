import { useState, useEffect, useMemo } from 'react';
import { TrendingDown, TrendingUp, AlertCircle } from 'lucide-react';

interface FearGreedData {
  value: number;
  classification: string;
  timestamp: string;
}

const CACHE_KEY = 'fear-greed-cache';
const CACHE_DURATION = 3600000; // 1 hour in ms

export function FearGreedWidget() {
  const [data, setData] = useState<FearGreedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFearGreed = async () => {
    try {
      // Check cache first
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data: cachedData, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_DURATION) {
          setData(cachedData);
          setLoading(false);
          return;
        }
      }

      const res = await fetch('https://api.alternative.me/fng/?limit=1');
      if (!res.ok) throw new Error('Failed to fetch Fear & Greed index');

      const json = await res.json();
      if (json?.data && json.data.length > 0) {
        const newData = {
          value: parseInt(json.data[0].value),
          classification: json.data[0].value_classification,
          timestamp: json.data[0].timestamp
        };
        setData(newData);
        setError(null);

        // Cache the result
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          data: newData,
          timestamp: Date.now()
        }));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load index');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFearGreed();
    const timer = setInterval(fetchFearGreed, CACHE_DURATION);
    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-white/40 font-mono">Loading index...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-2 text-red-400/60">
          <AlertCircle size={24} />
          <p className="text-xs font-mono">{error || 'No data'}</p>
        </div>
      </div>
    );
  }

  // Memoize color calculations to prevent recalculation on every render
  const colorClasses = useMemo(() => {
    if (!data) return { color: '', bgGradient: '', borderColor: '' };

    const { value } = data;
    let color = '', bgGradient = '', borderColor = '';

    if (value <= 25) {
      color = 'text-red-400';
      bgGradient = 'bg-red-500/10';
      borderColor = 'border-red-500/30';
    } else if (value <= 45) {
      color = 'text-orange-400';
      bgGradient = 'bg-orange-500/10';
      borderColor = 'border-orange-500/30';
    } else if (value <= 55) {
      color = 'text-yellow-400';
      bgGradient = 'bg-yellow-500/10';
      borderColor = 'border-yellow-500/30';
    } else if (value <= 75) {
      color = 'text-emerald-400';
      bgGradient = 'bg-emerald-500/10';
      borderColor = 'border-emerald-500/30';
    } else {
      color = 'text-green-400';
      bgGradient = 'bg-green-500/10';
      borderColor = 'border-green-500/30';
    }

    return { color, bgGradient, borderColor };
  }, [data]);

  const isExtreme = data ? (data.value <= 25 || data.value >= 75) : false;

  return (
    <div className="flex flex-col h-full gap-3">
      {/* Main Display */}
      <div className={`flex-1 rounded-xl border p-4 ${colorClasses.bgGradient} ${colorClasses.borderColor} flex flex-col items-center justify-center gap-3`}>

        {/* Value Circle */}
        <div className="relative">
          <svg className="w-32 h-32 transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-white/5"
            />
            {/* Progress circle */}
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="url(#gradient)"
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${(data.value / 100) * 351.86} 351.86`}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" className={colorClasses.color} />
                <stop offset="100%" className={colorClasses.color} />
              </linearGradient>
            </defs>
          </svg>

          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className={`text-4xl font-bold tracking-tight ${colorClasses.color}`}>
              {data.value}
            </div>
            <div className="text-[10px] text-white/40 font-mono uppercase tracking-wider">
              / 100
            </div>
          </div>
        </div>

        {/* Classification */}
        <div className="flex flex-col items-center gap-1">
          <div className={`text-sm font-bold uppercase tracking-wider ${colorClasses.color}`}>
            {data.classification}
          </div>
          <div className="text-[10px] text-white/30 font-mono uppercase tracking-widest">
            Fear & Greed Index
          </div>
        </div>

        {/* Extreme indicator */}
        {isExtreme && (
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider">
            {data.value <= 25 ? (
              <>
                <TrendingDown size={12} className="text-red-400" />
                <span className="text-red-400">Extreme Fear</span>
              </>
            ) : (
              <>
                <TrendingUp size={12} className="text-green-400" />
                <span className="text-green-400">Extreme Greed</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-5 gap-1 text-[9px] font-mono uppercase tracking-wider">
        <div className="text-center">
          <div className="h-1 bg-red-500 rounded mb-1" />
          <div className="text-red-400/60">0-25</div>
        </div>
        <div className="text-center">
          <div className="h-1 bg-orange-500 rounded mb-1" />
          <div className="text-orange-400/60">26-45</div>
        </div>
        <div className="text-center">
          <div className="h-1 bg-yellow-500 rounded mb-1" />
          <div className="text-yellow-400/60">46-55</div>
        </div>
        <div className="text-center">
          <div className="h-1 bg-emerald-500 rounded mb-1" />
          <div className="text-emerald-400/60">56-75</div>
        </div>
        <div className="text-center">
          <div className="h-1 bg-green-500 rounded mb-1" />
          <div className="text-green-400/60">76-100</div>
        </div>
      </div>
    </div>
  );
}
