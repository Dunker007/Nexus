/**
 * MiniSparkline - Compact sparkline chart for metrics
 */

'use client';

import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { CHART_COLORS } from '@/lib/luxrig/constants';

interface MiniSparklineProps {
    data: number[];
    color?: keyof typeof CHART_COLORS | string;
    height?: number;
    width?: number | string;
    showGradient?: boolean;
    animate?: boolean;
}

export function MiniSparkline({
    data,
    color = 'gpu',
    height = 32,
    width = '100%',
    showGradient = true,
    animate = true,
}: MiniSparklineProps) {
    // Convert array to recharts format
    const chartData = data.map((value, index) => ({ value, index }));

    // Get color value
    const colorValue = CHART_COLORS[color as keyof typeof CHART_COLORS] || color;

    // Generate unique gradient ID
    const gradientId = `sparkline-gradient-${colorValue.replace('#', '')}`;

    if (chartData.length < 2) {
        return (
            <div
                style={{ width, height }}
                className="flex items-center justify-center text-gray-600 text-xs"
            >
                No data
            </div>
        );
    }

    return (
        <div style={{ width, height }}>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                    {showGradient && (
                        <defs>
                            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={colorValue} stopOpacity={0.4} />
                                <stop offset="100%" stopColor={colorValue} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                    )}
                    <Area
                        type="monotone"
                        dataKey="value"
                        stroke={colorValue}
                        strokeWidth={1.5}
                        fill={showGradient ? `url(#${gradientId})` : 'transparent'}
                        isAnimationActive={animate}
                        animationDuration={300}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}

export default MiniSparkline;
