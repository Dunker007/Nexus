// ========================================
// DLX STUDIO - SHARED DATA / MOCK DATA
// ========================================

// User Profile
export const USER = {
    name: 'Dunker',
    email: 'dunker@dlxstudio.ai',
    avatar: null,
    role: 'Creator',
    joinDate: 'Oct 2024',
};

// System specs
export const SYSTEM_SPECS = {
    gpu: 'RTX 3060 12GB',
    cpu: 'Ryzen 7 3700X',
    ram: '32GB DDR4',
    machine: 'LuxRig',
};

// AI Agents
export const AGENTS = [
    {
        id: 'lux',
        emoji: '🎨',
        name: 'Lux',
        role: 'Creative Brainstorming',
        desc: 'The original DLX agent. Generates ideas, explores possibilities, and helps you think outside the box.',
        gradient: 'from-cyan-500 to-blue-500',
        status: 'active' as const,
    },
    {
        id: 'guardian',
        emoji: '🛡️',
        name: 'Guardian',
        role: 'System Monitoring',
        desc: 'Watches over your systems, alerts issues, and keeps everything running smoothly.',
        gradient: 'from-green-500 to-teal-500',
        status: 'active' as const,
    },
    {
        id: 'bytebot',
        emoji: '⚡',
        name: 'ByteBot',
        role: 'Task Automation',
        desc: 'Executes repetitive tasks, manages workflows, and boosts your productivity.',
        gradient: 'from-purple-500 to-pink-500',
        status: 'queued' as const,
    },
];

// Navigation items for header
export const NAV_ITEMS = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/news', label: 'News', icon: '📰' },
    { href: '/music', label: 'Music', icon: '🎵' },
    { href: '/chat', label: 'Chat', icon: '💬' },
    { href: '/agents', label: 'Agents', icon: '🤖' },
    { href: '/labs', label: 'Labs', icon: '🔬' },
    { href: '/income', label: 'Income', icon: '💸' },
];

// Quick action shortcuts
export const QUICK_ACTIONS = [
    { icon: '💬', label: 'New Chat', href: '/chat', shortcut: 'G C' },
    { icon: '🚀', label: 'Labs', href: '/labs', shortcut: 'G L' },
    { icon: '🤖', label: 'Agents', href: '/agents', shortcut: 'G A' },
    { icon: '💸', label: 'Income', href: '/income', shortcut: 'G I' },
    { icon: '📊', label: 'Analytics', href: '/analytics', shortcut: 'G N' },
    { icon: '⚙️', label: 'Settings', href: '/settings', shortcut: 'G S' },
];

// Income categories
export const INCOME_CATEGORIES = [
    { name: 'Content Creation', icon: '✍️', avgMonthly: '$200-500' },
    { name: 'Print on Demand', icon: '👕', avgMonthly: '$50-300' },
    { name: 'Digital Products', icon: '📦', avgMonthly: '$100-1000' },
    { name: 'Affiliate Marketing', icon: '🔗', avgMonthly: '$50-500' },
    { name: 'Idle Computing', icon: '💻', avgMonthly: '$10-50' },
    { name: 'Micro SaaS', icon: '🚀', avgMonthly: '$100-2000' },
    { name: 'API Services', icon: '🔌', avgMonthly: '$50-500' },
    { name: 'Automation', icon: '⚡', avgMonthly: '$200-1000' },
];

// Status color mapping
export const STATUS_COLORS = {
    active: { bg: 'bg-green-500/20', text: 'text-green-400', dot: 'bg-green-400' },
    online: { bg: 'bg-green-500/20', text: 'text-green-400', dot: 'bg-green-400' },
    preview: { bg: 'bg-purple-500/20', text: 'text-purple-400', dot: 'bg-purple-400' },
    idle: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', dot: 'bg-yellow-400' },
    queued: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', dot: 'bg-yellow-400' },
    coming: { bg: 'bg-gray-500/20', text: 'text-gray-400', dot: 'bg-gray-400' },
    offline: { bg: 'bg-red-500/20', text: 'text-red-400', dot: 'bg-red-400' },
    error: { bg: 'bg-red-500/20', text: 'text-red-400', dot: 'bg-red-400' },
};

// External tools/resources
export const EXTERNAL_TOOLS = {
    finance: [
        { name: 'Kubera', url: 'https://kubera.com', icon: '💎', desc: 'Net worth tracker' },
        { name: 'Monarch', url: 'https://monarchmoney.com', icon: '👑', desc: 'Budgeting' },
        { name: '3Commas', url: 'https://3commas.io', icon: '🤖', desc: 'Trading bots' },
        { name: 'TradingView', url: 'https://tradingview.com', icon: '📊', desc: 'Charts' },
    ],
    ai: [
        { name: 'LM Studio', url: 'https://lmstudio.ai', icon: '🖥️', desc: 'Local LLMs' },
        { name: 'Ollama', url: 'https://ollama.ai', icon: '🦙', desc: 'Run models' },
        { name: 'HuggingFace', url: 'https://huggingface.co', icon: '🤗', desc: 'Models hub' },
        { name: 'OpenRouter', url: 'https://openrouter.ai', icon: '🚀', desc: 'API routing' },
    ],
};
