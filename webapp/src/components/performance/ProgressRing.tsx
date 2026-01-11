/**
 * ProgressRing - Circular progress indicator for gauges
 */

'use client';

import { motion } from 'framer-motion';
import { CHART_COLORS, THRESHOLDS } from '@/lib/luxrig/constants';

interface ProgressRingProps {
    value: number;           // 0-100
    size?: number;           // px
    strokeWidth?: number;    // px
    color?: keyof typeof CHART_COLORS | string;
    bgColor?: string;
    showValue?: boolean;
    label?: string;
    animate?: boolean;
    thresholdType?: 'gpu' | 'vram' | 'ram' | 'disk';
}

export function ProgressRing({
    value,
    size = 80,
    strokeWidth = 6,
    color = 'gpu',
    bgColor = 'rgba(255,255,255,0.1)',
    showValue = true,
    label,
    animate = true,
    thresholdType,
}: ProgressRingProps) {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (Math.min(value, 100) / 100) * circumference;

    // Determine color based on thresholds
    let fillColor = CHART_COLORS[color as keyof typeof CHART_COLORS] || color;

    if (thresholdType) {
        const thresholdKey = thresholdType.toUpperCase() as keyof typeof THRESHOLDS;
        const threshold = THRESHOLDS[thresholdKey];
        if (threshold && 'WARNING' in threshold) {
            if (value >= threshold.CRITICAL) {
                fillColor = CHART_COLORS.error;
            } else if (value >= threshold.WARNING) {
                fillColor = '#F59E0B'; // amber
            }
        }
    }

    return (
        <div className="relative inline-flex flex-col items-center">
            <svg width={size} height={size} className="transform -rotate-90">
                {/* Background ring */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="transparent"
                    stroke={bgColor}
                    strokeWidth={strokeWidth}
                />

                {/* Progress ring */}
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="transparent"
                    stroke={fillColor}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={animate ? { strokeDashoffset: circumference } : { strokeDashoffset: offset }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                />
            </svg>

            {/* Center value */}
            {showValue && (
                <div
                    className="absolute inset-0 flex flex-col items-center justify-center"
                    style={{ fontSize: size * 0.2 }}
                >
                    <span className="font-bold" style={{ color: fillColor }}>
                        {Math.round(value)}%
                    </span>
                    {label && (
                        <span className="text-gray-500 text-[10px]">{label}</span>
                    )}
                </div>
            )}
        </div>
    );
}

export default ProgressRing;
