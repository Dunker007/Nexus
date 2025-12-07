'use client';

import React from 'react';
import { VibeContext } from './VibeContext';

interface PageBackgroundProps {
    color?: 'cyan' | 'green' | 'purple' | 'amber' | 'pink' | 'emerald' | 'orange' | 'indigo' | 'red' | 'blue' | 'auto';
    useTheme?: boolean; // If true, uses current theme's floodlight color
}

export default function PageBackground({ color, useTheme = false }: PageBackgroundProps) {
    // Try to get theme context safely
    const vibeContext = React.useContext(VibeContext);
    const themeColor = vibeContext?.theme?.floodlightColor;

    // Determine final color: explicit prop > theme > default cyan
    const finalColor = color === 'auto' || useTheme ? (themeColor || 'cyan') : (color || 'cyan');

    // Tailwind colors to hex/rgba mapping for style injection
    const colorMap: Record<string, string> = {
        cyan: '0, 245, 212',
        green: '34, 197, 94',
        purple: '168, 85, 247',
        amber: '255, 191, 0',
        pink: '236, 64, 122',
        emerald: '46, 204, 113',
        orange: '249, 115, 22',
        indigo: '99, 102, 241',
        red: '255, 23, 68',
        blue: '96, 165, 250'
    };

    const rgb = colorMap[finalColor] || colorMap.cyan;

    return (
        <div className="fixed inset-0 min-h-screen w-full pointer-events-none -z-50 overflow-hidden bg-[var(--bg-void,#050508)]">
            {/* Subtle Animated Grid - Retained as requested */}
            <div className="absolute inset-0 bg-grid opacity-[0.1]" />

            {/* Radiant Floodlight Effect */}
            <div className="absolute top-[-10%] left-0 right-0 h-[120vh] w-full flex justify-center">

                {/* 1. Core Beam: Conic Gradient for the directional spread */}
                <div
                    className="absolute top-0 w-full h-full opacity-60 mix-blend-screen"
                    style={{
                        background: `conic-gradient(from 180deg at 50% 0%, transparent 140deg, rgba(${rgb}, 0.1) 160deg, rgba(${rgb}, 0.6) 180deg, rgba(${rgb}, 0.1) 200deg, transparent 220deg)`,
                        maskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)',
                        WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)',
                        filter: 'blur(40px)'
                    }}
                />

                {/* 2. Soft Ambient Cone: Radial Ellipse stretched vertically */}
                <div
                    className="absolute top-0 w-[80%] h-[70%] opacity-40 mix-blend-screen"
                    style={{
                        background: `radial-gradient(ellipse at 50% 0%, rgba(${rgb}, 0.4), transparent 70%)`,
                        filter: 'blur(60px)',
                    }}
                />

                {/* 3. Source Glow: Hotspot at the very top */}
                <div
                    className="absolute top-[-50px] w-[300px] h-[150px] rounded-full opacity-80 mix-blend-screen"
                    style={{
                        background: `rgba(${rgb}, 0.8)`,
                        filter: 'blur(80px)',
                    }}
                />
            </div>
        </div>
    );
}
