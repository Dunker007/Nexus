'use client';

import React from 'react';
import { motion } from 'framer-motion';
import PageBackground from './PageBackground';

// ============================================
// STAT PILL - Compact status indicator
// ============================================
interface StatPillProps {
    label: string;
    value?: string | number;
    icon?: React.ReactNode;
    color?: 'cyan' | 'green' | 'purple' | 'amber' | 'pink' | 'red' | 'blue' | 'indigo';
    pulse?: boolean;
    className?: string;
}

const colorMap = {
    cyan: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
    green: 'bg-green-500/10 border-green-500/20 text-green-400',
    purple: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
    amber: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    pink: 'bg-pink-500/10 border-pink-500/20 text-pink-400',
    red: 'bg-red-500/10 border-red-500/20 text-red-400',
    blue: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    indigo: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
};

const pulseColorMap = {
    cyan: 'bg-cyan-400',
    green: 'bg-green-400',
    purple: 'bg-purple-400',
    amber: 'bg-amber-400',
    pink: 'bg-pink-400',
    red: 'bg-red-400',
    blue: 'bg-blue-400',
    indigo: 'bg-indigo-400',
};

export function StatPill({ label, value, icon, color = 'cyan', pulse = false, className = '' }: StatPillProps) {
    return (
        <div className={`flex items-center gap-2 px-3 py-1.5 border rounded-lg ${colorMap[color]} ${className}`}>
            {pulse && (
                <div className={`w-1.5 h-1.5 ${pulseColorMap[color]} rounded-full animate-pulse`} />
            )}
            {icon && <span className="text-sm">{icon}</span>}
            {value !== undefined && <span className="text-xs font-bold">{value}</span>}
            <span className="text-xs">{label}</span>
        </div>
    );
}

// ============================================
// CONNECTION STATUS - Shows online/offline
// ============================================
interface ConnectionStatusProps {
    status: 'online' | 'offline' | 'connecting';
    label?: string;
    className?: string;
}

export function ConnectionStatus({ status, label, className = '' }: ConnectionStatusProps) {
    const statusConfig = {
        online: { color: 'green', text: label || 'Connected' },
        offline: { color: 'red', text: label || 'Offline' },
        connecting: { color: 'amber', text: label || 'Connecting...' },
    };
    const config = statusConfig[status];
    return (
        <StatPill
            label={config.text}
            color={config.color as any}
            pulse={status === 'online' || status === 'connecting'}
            className={className}
        />
    );
}

// ============================================
// LIVE COUNTER - Animated number display
// ============================================
interface LiveCounterProps {
    value: number;
    label: string;
    prefix?: string;
    color?: 'cyan' | 'green' | 'purple' | 'amber';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export function LiveCounter({ value, label, prefix = '', color = 'cyan', size = 'md', className = '' }: LiveCounterProps) {
    const sizeClasses = {
        sm: 'text-lg',
        md: 'text-2xl',
        lg: 'text-4xl',
    };
    const colorClasses = {
        cyan: 'text-cyan-400',
        green: 'text-green-400',
        purple: 'text-purple-400',
        amber: 'text-amber-400',
    };
    return (
        <div className={`${className}`}>
            <div className={`font-bold ${sizeClasses[size]} ${colorClasses[color]}`}>
                {prefix}{value.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 uppercase tracking-wider">{label}</div>
        </div>
    );
}

// ============================================
// PAGE HEADER - Consistent header with glow icon
// ============================================
interface PageHeaderProps {
    title: string;
    titleAccent?: string;
    subtitle?: string;
    icon?: React.ReactNode;
    color?: 'cyan' | 'green' | 'purple' | 'amber' | 'pink' | 'red' | 'indigo';
    stats?: React.ReactNode;
    actions?: React.ReactNode;
    className?: string;
}

const headerColorMap = {
    cyan: { bg: 'from-cyan-500/30 to-blue-500/30', glow: 'bg-cyan-500', text: 'from-cyan-400 to-blue-400' },
    green: { bg: 'from-green-500/30 to-emerald-500/30', glow: 'bg-green-500', text: 'from-green-400 to-emerald-400' },
    purple: { bg: 'from-purple-500/30 to-pink-500/30', glow: 'bg-purple-500', text: 'from-purple-400 to-pink-400' },
    amber: { bg: 'from-amber-500/30 to-orange-500/30', glow: 'bg-amber-500', text: 'from-amber-400 to-orange-400' },
    pink: { bg: 'from-pink-500/30 to-rose-500/30', glow: 'bg-pink-500', text: 'from-pink-400 to-rose-400' },
    red: { bg: 'from-red-500/30 to-rose-500/30', glow: 'bg-red-500', text: 'from-red-400 to-rose-400' },
    indigo: { bg: 'from-indigo-500/30 to-purple-500/30', glow: 'bg-indigo-500', text: 'from-indigo-400 to-purple-400' },
};

export function PageHeader({ title, titleAccent, subtitle, icon, color = 'cyan', stats, actions, className = '' }: PageHeaderProps) {
    const colors = headerColorMap[color];

    return (
        <motion.header
            className={`flex flex-wrap items-center justify-between gap-4 mb-8 ${className}`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className="flex items-center gap-4">
                {icon && (
                    <div className="relative">
                        <div className={`absolute inset-0 ${colors.glow} rounded-xl blur-xl opacity-30`} />
                        <div className={`relative p-3 bg-gradient-to-br ${colors.bg} rounded-xl border border-white/10`}>
                            {icon}
                        </div>
                    </div>
                )}
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">
                        {title}
                        {titleAccent && (
                            <span className={`bg-gradient-to-r ${colors.text} bg-clip-text text-transparent`}>
                                {titleAccent}
                            </span>
                        )}
                    </h1>
                    {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
                </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
                {stats}
                {actions}
            </div>
        </motion.header>
    );
}

// ============================================
// PAGE LAYOUT - Universal page wrapper
// ============================================
interface PageLayoutProps {
    children: React.ReactNode;
    color?: 'cyan' | 'green' | 'purple' | 'amber' | 'pink' | 'red' | 'indigo';
    showDecorations?: boolean;
    className?: string;
    containerClass?: string;
    noPadding?: boolean;
}

export default function PageLayout({
    children,
    color = 'cyan',
    showDecorations = true,
    className = '',
    containerClass = '',
    noPadding = false,
}: PageLayoutProps) {
    const orbColorMap = {
        cyan: ['bg-cyan-500/10', 'bg-blue-500/10', 'bg-purple-500/10'],
        green: ['bg-green-500/10', 'bg-emerald-500/10', 'bg-cyan-500/10'],
        purple: ['bg-purple-500/10', 'bg-indigo-500/10', 'bg-pink-500/10'],
        amber: ['bg-amber-500/10', 'bg-orange-500/10', 'bg-yellow-500/10'],
        pink: ['bg-pink-500/10', 'bg-rose-500/10', 'bg-purple-500/10'],
        red: ['bg-red-500/10', 'bg-rose-500/10', 'bg-orange-500/10'],
        indigo: ['bg-indigo-500/10', 'bg-purple-500/10', 'bg-blue-500/10'],
    };
    const orbs = orbColorMap[color];

    return (
        <div className={`min-h-screen relative overflow-hidden text-white ${className}`}>
            <PageBackground color={color} />

            {/* Decorative floating orbs */}
            {showDecorations && (
                <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                    <div className={`absolute top-1/4 right-1/4 w-80 h-80 ${orbs[0]} rounded-full blur-3xl animate-pulse`} />
                    <div className={`absolute bottom-1/3 left-1/4 w-64 h-64 ${orbs[1]} rounded-full blur-3xl`} style={{ animationDelay: '1s' }} />
                    <div className={`absolute top-1/2 right-1/3 w-48 h-48 ${orbs[2]} rounded-full blur-2xl animate-pulse`} style={{ animationDelay: '2s' }} />
                </div>
            )}

            {/* Main content */}
            <div className={`relative z-10 ${noPadding ? '' : 'container-main py-8'} ${containerClass}`}>
                {children}
            </div>
        </div>
    );
}

// Re-export everything
export { PageBackground };
