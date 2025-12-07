'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

const sections = [
    {
        title: 'AI & LLM',
        icon: '🤖',
        apps: [
            { name: 'Chat', href: '/chat', icon: '💬', desc: 'AI conversations' },
            { name: 'Agents', href: '/agents', icon: '🤖', desc: '6 specialized agents' },
            { name: 'Labs', href: '/labs', icon: '🔬', desc: '11 AI experiments' },
            { name: 'Playground', href: '/playground', icon: '🧪', desc: 'Test prompts' },
            { name: 'Models', href: '/models', icon: '🔎', desc: 'Explore 12+ models' },
            { name: 'Prompts', href: '/prompts', icon: '📝', desc: '12 prompt templates' },
            { name: 'Voice', href: '/voice', icon: '🎤', desc: 'Voice control' },
        ]
    },
    {
        title: 'Finance',
        icon: '💰',
        apps: [
            { name: 'Finance Hub', href: '/finance', icon: '📊', desc: 'Overview' },
            { name: 'Portfolio', href: '/portfolio', icon: '📈', desc: 'Track investments' },
            { name: 'Trading Bots', href: '/trading', icon: '🤖', desc: 'AI automation' },
            { name: 'Budget', href: '/budget', icon: '💰', desc: 'Spending tracker' },
        ]
    },
    {
        title: 'Passive Income',
        icon: '💸',
        apps: [
            { name: 'Income Hub', href: '/income', icon: '💸', desc: '8 categories' },
            { name: 'Idea Generator', href: '/income/ideas', icon: '💡', desc: 'AI-curated ideas' },
            { name: 'Opportunities', href: '/income/opportunities', icon: '🎯', desc: 'Vetted platforms' },
            { name: 'Tracker', href: '/income/tracker', icon: '📊', desc: 'Track earnings' },
            { name: 'Idle PC', href: '/idle', icon: '💻', desc: '6 idle apps' },
            { name: 'Crypto Lab', href: '/crypto', icon: '💎', desc: 'Seeker + DeFi' },
        ]
    },
    {
        title: 'Smart Home',
        icon: '🏠',
        apps: [
            { name: 'Home Control', href: '/home', icon: '🏠', desc: 'Devices & scenes' },
        ]
    },
    {
        title: 'Productivity',
        icon: '📋',
        apps: [
            { name: 'Calendar', href: '/calendar', icon: '📅', desc: 'Events & tasks' },
            { name: 'Notes', href: '/notes', icon: '📝', desc: 'Quick capture' },
            { name: 'Files', href: '/files', icon: '📁', desc: 'File browser' },
            { name: 'Workflows', href: '/workflows', icon: '⚡', desc: '6 automations' },
            { name: 'Scratchpad', href: '/scratchpad', icon: '📋', desc: 'Quick ideas' },
            { name: 'Projects', href: '/projects', icon: '🚀', desc: '5 projects' },
            { name: 'Media', href: '/media', icon: '🖼️', desc: '12 items' },
            { name: 'Blog', href: '/blog', icon: '📰', desc: '8 articles' },
        ]
    },
    {
        title: 'System',
        icon: '⚙️',
        apps: [
            { name: 'Dashboard', href: '/dashboard', icon: '📊', desc: 'Command center' },
            { name: 'Search', href: '/search', icon: '🔍', desc: 'Find anything' },
            { name: 'Profile', href: '/profile', icon: '👤', desc: 'Your account' },
            { name: 'GitHub', href: '/github', icon: '🐙', desc: 'Vibe-coder git' },
            { name: 'Status', href: '/status', icon: '🚦', desc: 'Service health' },
            { name: 'Setup', href: '/setup', icon: '🔧', desc: 'Dev environment' },
            { name: 'Terminal', href: '/terminal', icon: '💻', desc: 'Command line' },
            { name: 'Settings', href: '/settings', icon: '⚙️', desc: 'Configuration' },
            { name: 'Analytics', href: '/analytics', icon: '📊', desc: 'Usage stats' },
            { name: 'Notifications', href: '/notifications', icon: '🔔', desc: 'Alerts' },
            { name: 'Logs', href: '/logs', icon: '📜', desc: 'Activity log' },
            { name: 'Backup', href: '/backup', icon: '💾', desc: 'Data safety' },
            { name: 'API Keys', href: '/api-keys', icon: '🔑', desc: 'Credentials' },
        ]
    },
    {
        title: 'Resources',
        icon: '📚',
        apps: [
            { name: 'Learn', href: '/learn', icon: '🎓', desc: '16 lessons' },
            { name: 'Free AI', href: '/deals', icon: '💎', desc: '24 free resources' },
            { name: 'Compare', href: '/compare', icon: '⚖️', desc: 'AI cost calculator' },
            { name: 'Trends', href: '/trends', icon: '📈', desc: 'Industry news' },
            { name: 'Showcase', href: '/showcase', icon: '🖼️', desc: 'Projects' },
            { name: 'API Docs', href: '/docs', icon: '📚', desc: 'Developer docs' },
        ]
    },
    {
        title: 'Customize',
        icon: '🎨',
        apps: [
            { name: 'Themes', href: '/themes', icon: '🎨', desc: '8 color themes' },
            { name: 'Integrations', href: '/integrations', icon: '🔌', desc: '12 services' },
            { name: 'Shortcuts', href: '/shortcuts', icon: '⌨️', desc: 'Keyboard' },
        ]
    },
    {
        title: 'Info',
        icon: 'ℹ️',
        apps: [
            { name: 'Vision 2026', href: '/vision', icon: '🔮', desc: 'Roadmap' },
            { name: 'Changelog', href: '/changelog', icon: '📋', desc: 'Updates' },
            { name: 'Community', href: '/community', icon: '👥', desc: 'Join us' },
            { name: 'Download', href: '/download', icon: '📥', desc: 'Get the app' },
        ]
    },
];

export default function AppsPage() {
    const totalApps = sections.reduce((sum, s) => sum + s.apps.length, 0);

    return (
        <div className="min-h-screen pt-8">
            {/* Header */}
            <section className="section-padding pb-8">
                <div className="container-main">
                    <motion.div
                        className="text-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h1 className="text-4xl md:text-5xl font-bold mb-2">
                            All <span className="text-gradient">Apps</span>
                        </h1>
                        <p className="text-gray-400">{totalApps} apps in DLX Studio WebOS</p>
                    </motion.div>
                </div>
            </section>

            {/* App Sections */}
            <section className="container-main pb-16">
                <motion.div
                    className="space-y-8"
                    initial="initial"
                    animate="animate"
                    variants={{ animate: { transition: { staggerChildren: 0.05 } } }}
                >
                    {sections.map((section) => (
                        <motion.div
                            key={section.title}
                            variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }}
                        >
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <span>{section.icon}</span>
                                <span>{section.title}</span>
                            </h2>

                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                                {section.apps.map((app) => (
                                    <Link key={app.href} href={app.href}>
                                        <motion.div
                                            className="glass-card text-center p-4 cursor-pointer hover:ring-2 hover:ring-cyan-500/50 transition-all group"
                                            whileHover={{ y: -5 }}
                                        >
                                            <span className="text-3xl">{app.icon}</span>
                                            <h3 className="font-medium mt-2 group-hover:text-cyan-400 transition-colors">
                                                {app.name}
                                            </h3>
                                            <p className="text-xs text-gray-500 mt-1">{app.desc}</p>
                                        </motion.div>
                                    </Link>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </section>

            {/* Command Palette Hint */}
            <section className="container-main pb-16">
                <motion.div
                    className="glass-card text-center py-8"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                >
                    <p className="text-gray-400 mb-2">Pro tip: Press</p>
                    <div className="flex items-center justify-center gap-2">
                        <kbd className="px-3 py-1 bg-white/10 rounded text-sm">Ctrl</kbd>
                        <span className="text-gray-500">+</span>
                        <kbd className="px-3 py-1 bg-white/10 rounded text-sm">K</kbd>
                    </div>
                    <p className="text-gray-400 mt-2">to open Command Palette and jump to any app instantly</p>
                </motion.div>
            </section>

            {/* Back link */}
            <div className="container-main pb-8">
                <Link href="/" className="text-gray-400 hover:text-cyan-400 transition-colors">
                    ← Back to Home
                </Link>
            </div>
        </div>
    );
}
