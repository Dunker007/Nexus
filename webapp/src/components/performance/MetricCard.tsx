/**
 * MetricCard - Enhanced stat card with sparkline and trend
 */

'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { MiniSparkline } from './MiniSparkline';
import { TrendIndicator } from './TrendIndicator';
import { CHART_COLORS, THRESHOLDS } from '@/lib/luxrig/constants';

interface MetricCardProps {
    label: string;
    value: string | number;
    unit?: string;
    icon?: LucideIcon;
    color?: keyof typeof CHART_COLORS;
    history?: number[];
    previousValue?: number;
    thresholdType?: 'gpu' | 'vram' | 'ram' | 'disk';
    onClick?: () => void;
    isLoading?: boolean;
    delay?: number;
}

export function MetricCard({
    label,
    value,
    unit = '',
    icon: Icon,
    color = 'gpu',
    history,
    previousValue,
    thresholdType,
    onClick,
    isLoading = false,
    delay = 0,
}: MetricCardProps) {
    const colorValue = CHART_COLORS[color] || CHART_COLORS.gpu;

    // Determine if we should show warning state
    let isWarning = false;
    let isCritical = false;

    if (thresholdType && typeof value === 'number') {
        const thresholdKey = thresholdType.toUpperCase() as keyof typeof THRESHOLDS;
        const threshold = THRESHOLDS[thresholdKey];
        if (threshold && 'WARNING' in threshold) {
            isWarning = value >= threshold.WARNING;
            isCritical = value >= threshold.CRITICAL;
        }
    }

    const displayValue = typeof value === 'number' ? (
        Number.isInteger(value) ? value : value.toFixed(1)
    ) : value;

    return (
        <motion.div
            className={`glass-card text-center cursor-pointer hover:border-white/20 transition-all ${isCritical ? 'border-red-500/50 animate-pulse' :
                    isWarning ? 'border-yellow-500/30' : ''
                }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: delay * 0.05 }}
            onClick={onClick}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
        >
            {/* Icon */}
            {Icon && (
                <Icon
                    className="mx-auto mb-2"
                    size={24}
                    style={{ color: isCritical ? CHART_COLORS.error : colorValue }}
                />
            )}

            {/* Value */}
            <div
                className="text-2xl font-bold transition-colors"
                style={{ color: isCritical ? CHART_COLORS.error : isWarning ? '#F59E0B' : colorValue }}
            >
                {isLoading ? (
                    <span className="animate-pulse">--</span>
                ) : (
                    <>
                        {displayValue}
                        {unit && <span className="text-lg ml-0.5">{unit}</span>}
                    </>
                )}
            </div>

            {/* Label */}
            <div className="text-xs text-gray-500 mb-2">{label}</div>

            {/* Sparkline */}
            {history && history.length > 1 && (
                <div className="mt-2">
                    <MiniSparkline
                        data={history}
                        color={isCritical ? 'error' : color}
                        height={24}
                    />
                </div>
            )}

            {/* Trend */}
            {previousValue !== undefined && typeof value === 'number' && (
                <div className="mt-1">
                    <TrendIndicator
                        current={value}
                        previous={previousValue}
                        invertColors={thresholdType === 'gpu'} // Lower is better for temp
                    />
                </div>
            )}
        </motion.div>
    );
}

export default MetricCard;
