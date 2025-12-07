'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface NavItemProps {
    href: string;
    label: string;
    icon: string;
    shortcut?: string;
    isActive: boolean;
    isHovered: boolean;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
}

export function NavItem({
    href,
    label,
    icon,
    shortcut,
    isActive,
    isHovered,
    onMouseEnter,
    onMouseLeave
}: NavItemProps) {
    return (
        <div
            className="relative"
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            <Link
                href={href}
                className="relative px-3 py-2 rounded-lg transition-colors block"
                aria-current={isActive ? 'page' : undefined}
            >
                {/* Background glow on hover */}
                <AnimatePresence>
                    {(isActive || isHovered) && (
                        <motion.div
                            className={`absolute inset-0 rounded-lg ${isActive ? 'bg-cyan-500/20' : 'bg-white/5'}`}
                            layoutId="navBg"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                        />
                    )}
                </AnimatePresence>

                {/* Content */}
                <span className={`relative z-10 flex items-center gap-2 ${isActive ? 'text-cyan-400' : 'text-gray-300 hover:text-white'}`}>
                    <span className="text-sm">{icon}</span>
                    <span className="text-sm font-medium">{label}</span>
                </span>
            </Link>

            {/* Tooltip for Shortcut */}
            <AnimatePresence>
                {isHovered && shortcut && (
                    <motion.div
                        className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/80 rounded text-[10px] text-gray-400 border border-white/10 whitespace-nowrap"
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                    >
                        {shortcut}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
