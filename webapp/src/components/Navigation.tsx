'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Command } from 'lucide-react';
import { useVibe } from './VibeContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import { NavItem } from '@/components/NavItem';

import {
    LayoutDashboard, Palette, MessageSquare, Bot, Radio, Users,
    FlaskConical, DollarSign, Settings, Workflow
} from 'lucide-react';

const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, shortcut: 'G D' },
    { href: '/studios', label: 'Studios', icon: <Palette size={20} /> },
    { href: '/chat', label: 'Chat', icon: <MessageSquare size={20} />, shortcut: 'G C' },
    { href: '/agents', label: 'Agents', icon: <Bot size={20} /> },
    { href: '/news', label: 'News', icon: <Radio size={20} /> },
    { href: '/meeting', label: 'Meeting', icon: <Users size={20} /> },
    { href: '/labs', label: 'Labs', icon: <FlaskConical size={20} />, shortcut: 'G L' },
    { href: '/pipeline', label: 'Pipeline', icon: <Workflow size={20} />, shortcut: 'G P' },
    { href: '/income', label: 'Revenue', icon: <DollarSign size={20} />, shortcut: 'G I' },
    { href: '/settings', label: 'Settings', icon: <Settings size={20} />, shortcut: 'G S' },
];

export default function Navigation() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [hoveredItem, setHoveredItem] = useState<string | null>(null);
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const isPopup = searchParams.get('mode') === 'popup';
    const { themeId, setTheme, availableThemes, mode } = useVibe();

    // If in popup mode, don't render the navigation bar
    if (isPopup) return null;

    const toggleTheme = () => {
        const ids = availableThemes.map(t => t.id);
        const currentIndex = ids.indexOf(themeId);
        const nextIndex = (currentIndex + 1) % ids.length;
        setTheme(ids[nextIndex]);
    };

    return (
        <nav
            className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 transition-colors duration-300 backdrop-blur-md bg-black/30"
        >
            <div className="w-full px-6">
                <div className="flex items-center h-16 relative justify-between">
                    {/* Logo - Absolute Left or Flex Start */}
                    <div className="flex-1 flex items-center justify-start">
                        <Link href="/" className="flex items-center gap-3 group">
                            <motion.div
                                className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center"
                                whileHover={{ scale: 1.05, rotate: 5 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <span className="text-xl font-bold text-white">D</span>
                            </motion.div>
                            <span className="text-xl font-bold text-gradient">DLX STUDIO</span>
                        </Link>
                    </div>

                    {/* Desktop Nav - Centered */}
                    <div className="hidden lg:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
                        {navItems.map((item) => (
                            <NavItem
                                key={item.href}
                                href={item.href}
                                label={item.label}
                                icon={item.icon}
                                shortcut={item.shortcut}
                                isActive={pathname === item.href}
                                isHovered={hoveredItem === item.href}
                                onMouseEnter={() => setHoveredItem(item.href)}
                                onMouseLeave={() => setHoveredItem(null)}
                            />
                        ))}
                    </div>

                    {/* Desktop Actions - Right Aligned */}
                    <div className="flex-1 flex items-center justify-end gap-3 hidden lg:flex">

                        <ThemeToggle />

                        <motion.button
                            onClick={toggleTheme}
                            className="relative p-2 rounded-full glass-panel hover:bg-white/10 transition-colors border border-white/5"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            aria-label="Cycle vibe mode"
                        >
                            <Palette className={`w-5 h-5 ${mode === 'crisis' ? 'text-red-500' :
                                mode === 'high-load' ? 'text-yellow-500' :
                                    'text-purple-400'
                                }`} />
                        </motion.button>

                        <button
                            className="flex items-center gap-2 px-3 py-2 rounded-lg glass-panel hover:bg-white/10 transition-colors border border-white/5 text-gray-400 hover:text-white text-sm"
                            onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
                            aria-label="Open command palette"
                        >
                            <Command className="w-4 h-4" />
                            <span>Cmd+K</span>
                        </button>

                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 border border-white/20 shadow-lg shadow-cyan-500/20" />
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="lg:hidden flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <ThemeToggle />
                            <motion.button
                                onClick={toggleTheme}
                                className="p-2 rounded-full glass-panel"
                                whileTap={{ scale: 0.95 }}
                                aria-label="Cycle vibe mode"
                            >
                                <Palette className="w-5 h-5 text-purple-400" />
                            </motion.button>
                        </div>

                        <button
                            onClick={() => setMobileOpen(!mobileOpen)}
                            className="p-2 text-gray-400 hover:text-white"
                            aria-label={mobileOpen ? "Close menu" : "Open menu"}
                            aria-expanded={mobileOpen}
                        >
                            <div className="w-6 flex flex-col gap-1.5">
                                <motion.span
                                    animate={{ rotate: mobileOpen ? 45 : 0, y: mobileOpen ? 6 : 0 }}
                                    className="w-full h-0.5 bg-current block origin-center"
                                />
                                <motion.span
                                    animate={{ opacity: mobileOpen ? 0 : 1 }}
                                    className="w-full h-0.5 bg-current block"
                                />
                                <motion.span
                                    animate={{ rotate: mobileOpen ? -45 : 0, y: mobileOpen ? -6 : 0 }}
                                    className="w-full h-0.5 bg-current block origin-center"
                                />
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="lg:hidden border-t border-white/5 bg-[#050508]/95 backdrop-blur-xl overflow-hidden"
                    >
                        <div className="px-6 py-4 space-y-2">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setMobileOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${pathname === item.href
                                        ? 'bg-cyan-500/10 text-cyan-400'
                                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                        }`}
                                    aria-current={pathname === item.href ? 'page' : undefined}
                                >
                                    <span className="text-lg">{item.icon}</span>
                                    <span className="font-medium">{item.label}</span>
                                </Link>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
