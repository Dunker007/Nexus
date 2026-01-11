/**
 * TrendIndicator - Shows value change with arrow
 */

'use client';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface TrendIndicatorProps {
    current: number;
    previous: number;
    unit?: string;
    showPercent?: boolean;
    invertColors?: boolean;  // For metrics where down is good (temp, errors)
    size?: 'sm' | 'md' | 'lg';
}

export function TrendIndicator({
    current,
    previous,
    unit = '',
    showPercent = true,
    invertColors = false,
    size = 'sm',
}: TrendIndicatorProps) {
    const diff = current - previous;
    const percentChange = previous !== 0 ? ((diff / previous) * 100) : 0;

    const isUp = diff > 0;
    const isDown = diff < 0;
    const isNeutral = diff === 0;

    // Determine color (normally up = green, down = red, but can invert)
    let colorClass: string;
    if (isNeutral) {
        colorClass = 'text-gray-500';
    } else if (invertColors) {
        colorClass = isUp ? 'text-red-400' : 'text-green-400';
    } else {
        colorClass = isUp ? 'text-green-400' : 'text-red-400';
    }

    const sizeConfig = {
        sm: { icon: 12, text: 'text-xs' },
        md: { icon: 14, text: 'text-sm' },
        lg: { icon: 16, text: 'text-base' },
    };

    const config = sizeConfig[size];

    return (
        <span className={`inline-flex items-center gap-0.5 ${colorClass} ${config.text}`}>
            {isUp && <TrendingUp size={config.icon} />}
            {isDown && <TrendingDown size={config.icon} />}
            {isNeutral && <Minus size={config.icon} />}

            {showPercent ? (
                <span>{Math.abs(percentChange).toFixed(1)}%</span>
            ) : (
                <span>{Math.abs(diff).toFixed(1)}{unit}</span>
            )}
        </span>
    );
}

export default TrendIndicator;
