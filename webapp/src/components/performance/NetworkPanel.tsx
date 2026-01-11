import { motion } from 'framer-motion';
import { Activity, Download, Upload, Wifi, RefreshCw, AlertTriangle, Clock } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

interface NetworkPanelProps {
    bridgeUrl?: string;
    refreshInterval?: number;
}

export function NetworkPanel({ bridgeUrl, refreshInterval = 30000 }: NetworkPanelProps) {
    const [status, setStatus] = useState<any>(null);
    const [, setLoading] = useState(false); // Used implicitly
    const [speedTestResult, setSpeedTestResult] = useState<any>(null);
    const [testingSpeed, setTestingSpeed] = useState(false);
    const [, setLastChecked] = useState<Date | null>(null);
    const [lastTestTime, setLastTestTime] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchStatus = useCallback(async () => {
        if (!bridgeUrl) return;

        try {
            const res = await fetch(`${bridgeUrl}/network/status`);
            if (res.ok) {
                const data = await res.json();
                setStatus(data);
                setLastChecked(new Date());
            }
        } catch (error) {
            // console.warn('Failed to fetch network status:', error);
        }
    }, [bridgeUrl]);

    const runSpeedTest = async () => {
        if (!bridgeUrl) return;
        setTestingSpeed(true);
        setError(null);
        try {
            const res = await fetch(`${bridgeUrl}/monitoring/speedtest`);
            const data = await res.json();

            if (data.success === false) {
                setError(data.message || 'Speed test failed');
                if (data.latency) {
                    // Fallback to showing latency even if speedtest failed
                    setSpeedTestResult({ ping: data.ping || data.latency.google });
                }
            } else {
                setSpeedTestResult(data);
                setLastTestTime(new Date().toLocaleTimeString([], { timeStyle: 'short' }));
            }
        } catch (e) {
            console.error('Speedtest failed', e);
            setError('Speed test failed — check bridge connection');
        } finally {
            setTestingSpeed(false);
        }
    };

    useEffect(() => {
        fetchStatus();
        const interval = setInterval(fetchStatus, refreshInterval);
        return () => clearInterval(interval);
    }, [fetchStatus, refreshInterval]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6"
        >
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <Activity className="text-blue-400" />
                    Network Status
                </h2>
                <button
                    onClick={runSpeedTest}
                    disabled={testingSpeed}
                    className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-md text-sm flex items-center gap-2 transition-all disabled:opacity-50 text-gray-300 hover:text-white"
                >
                    {testingSpeed ? <RefreshCw className="animate-spin" size={14} /> : <Activity size={14} />}
                    {testingSpeed ? 'Testing...' : 'Test Speed'}
                </button>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400 text-sm animate-in fade-in">
                    <AlertTriangle size={16} />
                    {error}
                </div>
            )}

            {/* Speed Test Results */}
            {speedTestResult && !error && (
                <div className="mb-6 animate-in fade-in slide-in-from-top-2">
                    <div className="text-xs text-gray-500 text-center mb-4 flex items-center justify-center gap-1">
                        <Clock size={10} /> Last test: {lastTestTime}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {/* Download */}
                        <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                            <div className="text-xs text-blue-300 mb-1 flex items-center gap-1"><Download size={12} /> Download</div>
                            <div className="text-2xl font-bold text-white">{speedTestResult.download} <span className="text-sm text-gray-400">Mbps</span></div>
                        </div>
                        {/* Upload */}
                        <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                            <div className="text-xs text-purple-300 mb-1 flex items-center gap-1"><Upload size={12} /> Upload</div>
                            <div className="text-2xl font-bold text-white">{speedTestResult.upload || '--'} <span className="text-sm text-gray-400">Mbps</span></div>
                        </div>
                        {/* Ping */}
                        <div className="p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/20 col-span-2 md:col-span-1">
                            <div className="text-xs text-cyan-300 mb-1 flex items-center gap-1"><Activity size={12} /> Latency</div>
                            <div className="text-2xl font-bold text-white">{speedTestResult.ping || speedTestResult.latency?.google || '--'} <span className="text-sm text-gray-400">ms</span></div>
                        </div>
                    </div>
                </div>
            )}

            {/* Status Display */}
            <div className="text-center text-gray-500 text-sm py-4">
                {status ? (
                    <div className="animate-in fade-in">
                        {status.overallStatus === 'optimal' ? (
                            <span className="text-green-400 flex items-center justify-center gap-2">
                                <Wifi size={16} /> All Systems Optimal
                            </span>
                        ) : (
                            <span className="text-yellow-400 flex items-center justify-center gap-2">
                                <Wifi size={16} /> {status.overallStatus}
                            </span>
                        )}
                        <div className="mt-2 text-xs grid grid-cols-2 gap-2 max-w-[200px] mx-auto text-left">
                            {status.isps?.map((isp: any) => (
                                <div key={isp.id} className="flex justify-between">
                                    <span>{isp.name}:</span>
                                    <span className={isp.status === 'online' ? 'text-green-400' : 'text-red-400'}>{isp.status}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2">
                        <Wifi size={24} className="opacity-20" />
                        <p>Network Monitoring Active</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
