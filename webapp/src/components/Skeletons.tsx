'use client';

import { motion } from 'framer-motion';

interface SkeletonProps {
    className?: string;
    variant?: 'text' | 'circular' | 'rectangular';
    width?: string | number;
    height?: string | number;
    lines?: number;
}

export function Skeleton({
    className = '',
    variant = 'rectangular',
    width,
    height,
    lines = 1
}: SkeletonProps) {
    const baseClass = "bg-white/5 animate-pulse";

    const variantClass = {
        text: "rounded h-4",
        circular: "rounded-full",
        rectangular: "rounded-lg"
    }[variant];

    if (lines > 1) {
        return (
            <div className={`space-y-2 ${className}`}>
                {Array.from({ length: lines }).map((_, i) => (
                    <div
                        key={i}
                        className={`${baseClass} ${variantClass}`}
                        style={{
                            width: i === lines - 1 ? '60%' : width || '100%',
                            height: height || (variant === 'text' ? '1rem' : '100%')
                        }}
                    />
                ))}
            </div>
        );
    }

    return (
        <div
            className={`${baseClass} ${variantClass} ${className}`}
            style={{ width, height }}
        />
    );
}

// Widget skeleton for dashboard
export function WidgetSkeleton({ className = '' }: { className?: string }) {
    return (
        <div className={`glass-card p-6 ${className}`}>
            <div className="flex items-center gap-3 mb-4">
                <Skeleton variant="circular" width={40} height={40} />
                <Skeleton variant="text" width="60%" />
            </div>
            <Skeleton variant="text" lines={3} className="mb-4" />
            <div className="flex gap-2">
                <Skeleton variant="rectangular" width={80} height={32} />
                <Skeleton variant="rectangular" width={80} height={32} />
            </div>
        </div>
    );
}

// Card skeleton for agents/studios
export function CardSkeleton() {
    return (
        <div className="glass-card p-6">
            <div className="flex justify-center mb-4">
                <Skeleton variant="rectangular" width={96} height={96} className="rounded-2xl" />
            </div>
            <Skeleton variant="text" width="70%" className="mx-auto mb-2" />
            <Skeleton variant="text" width="50%" className="mx-auto mb-4" />
            <Skeleton variant="text" lines={2} />
            <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-white/5">
                <Skeleton variant="rectangular" height={40} />
                <Skeleton variant="rectangular" height={40} />
                <Skeleton variant="rectangular" height={40} />
            </div>
        </div>
    );
}

// List item skeleton
export function ListItemSkeleton() {
    return (
        <div className="flex items-center gap-3 p-3">
            <Skeleton variant="circular" width={32} height={32} />
            <div className="flex-1">
                <Skeleton variant="text" width="80%" />
                <Skeleton variant="text" width="50%" className="mt-1" />
            </div>
        </div>
    );
}

// Stats skeleton for revenue
export function StatsSkeleton() {
    return (
        <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
                <div key={i} className="text-center p-3 bg-white/5 rounded-lg">
                    <Skeleton variant="text" width="60%" className="mx-auto mb-1" />
                    <Skeleton variant="text" width="40%" className="mx-auto" height={12} />
                </div>
            ))}
        </div>
    );
}

// Loading spinner with shimmer
export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
    const sizeMap = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12'
    };

    return (
        <motion.div
            className={`${sizeMap[size]} border-2 border-cyan-500/30 border-t-cyan-500 rounded-full`}
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        />
    );
}

// Full page loading
export function PageLoading() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <LoadingSpinner size="lg" />
                <p className="mt-4 text-gray-400 text-sm animate-pulse">Loading...</p>
            </div>
        </div>
    );
}
