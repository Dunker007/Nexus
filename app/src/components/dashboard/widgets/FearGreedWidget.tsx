import { useState, useEffect } from 'react';
import { TrendingDown, TrendingUp, AlertCircle } from 'lucide-react';

interface FearGreedData {
  value: number;
  classification: string;
  timestamp: string;
}

export function FearGreedWidget() {
  const [data, setData] = useState<FearGreedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFearGreed = async () => {
    try {
      const res = await fetch('https://api.alternative.me/fng/?limit=1');
      if (!res.ok) throw new Error('Failed to fetch Fear & Greed index');

      const json = await res.json();
      if (json?.data && json.data.length > 0) {
        setData({
          value: parseInt(json.data[0].value),
          classification: json.data[0].value_classification,
          timestamp: json.data[0].timestamp
        });
        setError(null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load index');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFearGreed();
    const timer = setInterval(fetchFearGreed, 3600000); // Update hourly
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

  // Color based on Fear & Greed value
  const getColor = (value: number) => {
    if (value <= 25) return 'text-red-400';
    if (value <= 45) return 'text-orange-400';
    if (value <= 55) return 'text-yellow-400';
    if (value <= 75) return 'text-emerald-400';
    return 'text-green-400';
  };

  const getGradient = (value: number) => {
    if (value <= 25) return 'from-red-500 to-red-600';
    if (value <= 45) return 'from-orange-500 to-orange-600';
    if (value <= 55) return 'from-yellow-500 to-yellow-600';
    if (value <= 75) return 'from-emerald-500 to-emerald-600';
    return 'from-green-500 to-green-600';
  };

  const getBgGradient = (value: number) => {
    if (value <= 25) return 'bg-red-500/10';
    if (value <= 45) return 'bg-orange-500/10';
    if (value <= 55) return 'bg-yellow-500/10';
    if (value <= 75) return 'bg-emerald-500/10';
    return 'bg-green-500/10';
  };

  const isExtreme = data.value <= 25 || data.value >= 75;

  return (
    <div className="flex flex-col h-full gap-3">
      {/* Main Display */}
      <div className={`flex-1 rounded-xl border p-4 ${getBgGradient(data.value)} ${
        data.value <= 25 ? 'border-red-500/30' :
        data.value <= 45 ? 'border-orange-500/30' :
        data.value <= 55 ? 'border-yellow-500/30' :
        data.value <= 75 ? 'border-emerald-500/30' : 'border-green-500/30'
      } flex flex-col items-center justify-center gap-3`}>

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
                <stop offset="0%" className={`${getColor(data.value)}`} />
                <stop offset="100%" className={`${getColor(data.value)}`} />
              </linearGradient>
            </defs>
          </svg>

          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className={`text-4xl font-bold tracking-tight ${getColor(data.value)}`}>
              {data.value}
            </div>
            <div className="text-[10px] text-white/40 font-mono uppercase tracking-wider">
              / 100
            </div>
          </div>
        </div>

        {/* Classification */}
        <div className="flex flex-col items-center gap-1">
          <div className={`text-sm font-bold uppercase tracking-wider ${getColor(data.value)}`}>
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
