import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, AlertCircle } from 'lucide-react';

interface PortfolioSummary {
  totalValue: number;
  cashBalance: number;
  safetyNetPercent: number;
  isSafetyNetCritical: boolean;
  activeAccount: string;
  lastSync: string | null;
  isLive: boolean;
}

export function PortfolioSummaryWidget() {
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = async () => {
    try {
      const res = await fetch('/api/portfolio/summary');
      if (res.ok) {
        const data = await res.json();
        setSummary(data);
        setError(null);
      } else {
        setError('Failed to load portfolio');
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
    const timer = setInterval(fetchSummary, 30_000);
    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-white/40 font-mono">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-2 text-red-400/60">
          <AlertCircle size={24} />
          <p className="text-xs font-mono">{error || 'No data'}</p>
        </div>
      </div>
    );
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);
  };

  const isPositive = summary.totalValue >= summary.cashBalance;

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Total Value */}
      <div className="p-3 rounded-xl bg-[#12121a] border border-white/5 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-widest text-white/40 uppercase">Total Value</span>
          <div className="flex items-center gap-1">
            {isPositive ? (
              <TrendingUp size={12} className="text-emerald-400" />
            ) : (
              <TrendingDown size={12} className="text-red-400" />
            )}
            <span className={`w-1.5 h-1.5 rounded-full ${summary.isLive ? 'bg-emerald-400 animate-pulse' : 'bg-white/20'}`} />
          </div>
        </div>
        <p className="text-xl font-bold text-white tracking-tight">
          {formatCurrency(summary.totalValue)}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-white/30 uppercase font-mono">{summary.activeAccount.toUpperCase()}</span>
          {summary.isLive && (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold uppercase tracking-wider">LIVE</span>
          )}
        </div>
      </div>

      {/* Cash Balance */}
      <div className="p-3 rounded-xl bg-[#12121a] border border-white/5 flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold tracking-widest text-white/40 uppercase">Cash Balance</span>
          <p className="text-sm font-bold text-cyan-300 font-mono">
            {formatCurrency(summary.cashBalance)}
          </p>
        </div>
        <DollarSign size={20} className="text-cyan-400/30" />
      </div>

      {/* Safety Net */}
      <div className={`p-3 rounded-xl border flex-1 flex flex-col justify-center gap-2 ${
        summary.isSafetyNetCritical
          ? 'bg-red-500/5 border-red-500/30'
          : 'bg-[#12121a] border-white/5'
      }`}>
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-widest text-white/40 uppercase">Safety Net</span>
          {summary.isSafetyNetCritical && <AlertCircle size={12} className="text-red-400 animate-pulse" />}
        </div>
        <div className="flex items-baseline gap-2">
          <p className={`text-2xl font-bold tracking-tight ${
            summary.isSafetyNetCritical ? 'text-red-400' : 'text-emerald-400'
          }`}>
            {summary.safetyNetPercent.toFixed(1)}%
          </p>
          {summary.isSafetyNetCritical && (
            <span className="text-[9px] text-red-400/60 font-mono uppercase">Critical</span>
          )}
        </div>
        {summary.lastSync && (
          <p className="text-[10px] text-white/20 font-mono">
            Synced {new Date(summary.lastSync).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>
    </div>
  );
}
