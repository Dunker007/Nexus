'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, DollarSign, Zap } from 'lucide-react';

interface RevenueTrackerProps {
    monthly?: number;
    projected?: number;
    activeStreams?: number;
}

export default function RevenueTracker({
    monthly = 0,
    projected = 450,
    activeStreams = 2
}: RevenueTrackerProps) {
    const [displayAmount, setDisplayAmount] = useState(0);
    const [showCelebration, setShowCelebration] = useState(false);
    const [recentEarnings, setRecentEarnings] = useState<{ amount: number; timestamp: Date }[]>([]);

    // Animated counter effect
    useEffect(() => {
        const duration = 2000;
        const steps = 60;
        const increment = monthly / steps;
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= monthly) {
                current = monthly;
                clearInterval(timer);
            }
            setDisplayAmount(Math.floor(current));
        }, duration / steps);

        return () => clearInterval(timer);
    }, [monthly]);

    // Simulate occasional earnings pop
    useEffect(() => {
        if (monthly > 0) {
            const interval = setInterval(() => {
                const smallEarning = +(Math.random() * 5 + 0.5).toFixed(2);
                setRecentEarnings(prev => [
                    { amount: smallEarning, timestamp: new Date() },
                    ...prev.slice(0, 4)
                ]);
                setShowCelebration(true);
                setTimeout(() => setShowCelebration(false), 1500);
            }, 15000 + Math.random() * 30000);

            return () => clearInterval(interval);
        }
    }, [monthly]);

    return (
        <div className="relative">
            {/* Main Display */}
            <div className="glass-card p-6 relative overflow-hidden">
                {/* Animated background glow on earnings */}
                <AnimatePresence>
                    {showCelebration && (
                        <motion.div
                            className="absolute inset-0 bg-green-500/10"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        />
                    )}
                </AnimatePresence>

                <div className="flex items-start justify-between mb-4">
                    <div>
                        <div className="text-gray-400 text-xs uppercase tracking-wider mb-1 flex items-center gap-1">
                            <DollarSign size={12} />
                            Revenue Command
                        </div>
                        <div className="flex items-baseline gap-2">
                            <motion.span
                                className="text-4xl font-bold text-green-400"
                                key={displayAmount}
                            >
                                ${displayAmount.toLocaleString()}
                            </motion.span>
                            <span className="text-gray-500 text-sm">/mo</span>
                        </div>
                    </div>

                    {/* Status indicator */}
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 rounded-full border border-green-500/30">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        <span className="text-green-400 text-xs font-medium">LIVE</span>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-3 bg-white/5 rounded-lg">
                        <div className="text-cyan-400 font-bold text-lg">{activeStreams}</div>
                        <div className="text-xs text-gray-500">Active</div>
                    </div>
                    <div className="text-center p-3 bg-white/5 rounded-lg">
                        <div className="text-purple-400 font-bold text-lg">${projected}</div>
                        <div className="text-xs text-gray-500">Projected</div>
                    </div>
                    <div className="text-center p-3 bg-white/5 rounded-lg">
                        <div className="text-yellow-400 font-bold text-lg flex items-center justify-center gap-1">
                            <TrendingUp size={14} />
                            12%
                        </div>
                        <div className="text-xs text-gray-500">Growth</div>
                    </div>
                </div>

                {/* Recent Earnings Feed */}
                {recentEarnings.length > 0 && (
                    <div className="border-t border-white/5 pt-3">
                        <div className="text-xs text-gray-500 mb-2">Recent Activity</div>
                        <div className="space-y-1">
                            <AnimatePresence mode="popLayout">
                                {recentEarnings.slice(0, 3).map((earning, i) => (
                                    <motion.div
                                        key={earning.timestamp.getTime()}
                                        initial={{ opacity: 0, x: -20, height: 0 }}
                                        animate={{ opacity: 1, x: 0, height: 'auto' }}
                                        exit={{ opacity: 0, x: 20, height: 0 }}
                                        className="flex items-center justify-between text-xs"
                                    >
                                        <span className="text-gray-400 flex items-center gap-1">
                                            <Zap size={10} className="text-green-400" />
                                            Streaming royalty
                                        </span>
                                        <span className="text-green-400 font-mono">+${earning.amount}</span>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                )}

                {/* Progress to Goal */}
                <div className="mt-4 pt-3 border-t border-white/5">
                    <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-500">Goal: $1,000/mo</span>
                        <span className="text-cyan-400">{Math.min(100, Math.round((monthly / 1000) * 100))}%</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-green-500 to-cyan-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, (monthly / 1000) * 100)}%` }}
                            transition={{ duration: 1.5, ease: 'easeOut' }}
                        />
                    </div>
                </div>
            </div>

            {/* Floating money animation */}
            <AnimatePresence>
                {showCelebration && (
                    <motion.div
                        className="absolute -top-4 right-4 text-2xl"
                        initial={{ opacity: 0, y: 0 }}
                        animate={{ opacity: 1, y: -30 }}
                        exit={{ opacity: 0, y: -50 }}
                    >
                        💰
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
