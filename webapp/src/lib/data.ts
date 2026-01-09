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
        id: 'nox',
        emoji: '🌑',
        name: 'NOX',
        role: 'Structural Integrity',
        desc: 'The Shadow. Validates logic, handshakes, and state. Ensures the foundation holds.',
        gradient: 'from-slate-700 to-black',
        status: 'active' as const,
    },
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

// Nexus Plan Content
export const NEXUS_PLAN_MD = `# Unified Project Evaluation & Implementation Plan

## Evaluation Checklist
- [ ] Review overall architecture and AI integration flow
- [ ] Audit code quality (lint, TypeScript, unused imports)
- [ ] Measure performance (bundle size, runtime FPS)
- [ ] Verify accessibility (ARIA, focus management)
- [ ] Check SEO fundamentals
- [ ] Evaluate UI/UX consistency
- [ ] Assess theme system
- [ ] Review documentation
- [ ] Validate testing coverage
- [ ] Scan for security issues
- [ ] Identify opportunities for AI-driven enhancements

## Implementation Plan
### 1️⃣ Dark-Mode & Theming
- [x] Add ThemeProvider context
- [x] Move colors to CSS variables
- [x] Create ThemeToggle
- [x] Update glass utility

### 2️⃣ Component Refactorings
- [x] Split Navigation
- [x] Extract ShortcutModal
- [x] Break MeetingRoom
- [x] Export reusable UI components

### 3️⃣ Accessibility Enhancements
- [x] Add aria-labels
- [x] Implement focus trapping
- [x] Verify WCAG AA contrast

### 4️⃣ Bundle & Performance
- Use next/dynamic
- Lazy-load images
- optimize chunk size

### 5️⃣ Testing & CI
- [x] Configure Jest
- [x] Write unit tests
- [x] Add test script

### 6️⃣ Dependency Audit
- [x] Run npm audit
- Update packages

## 2026 AI & Vibe-Coding Wishes
### Action-Oriented Agents
- [x] Design TaskAgent
- [x] Expose /api/agent

### Multimodal Mastery
- [x] Add MultimodalViewer
- [x] Mock /api/multimodal

### Responsible AGI
- [x] Create SafetyGuard
- [x] Log AI outputs

### Human-AI Collaboration
- [x] Implement CollaborationToolbar
- [x] Store decisions

### Governance
- [x] Add GovernanceDashboard
- [x] Role-based access

### Creativity
- [x] Provide CreativePrompt

See full docs/PRIMARY_PLAN.md for details.
`;

// Initial Labs Data
export const INITIAL_LABS_DATA = [
    // --- SYSTEM CORE (The Operating System) ---
    { id: 'dashboard', icon: '📊', name: 'Command Center', desc: 'Main operations hub / Dashboard.', status: 'active' as const, category: 'System' as const, priority: 'High' as const, agents: ['guardian'], href: '/dashboard', ideas: 0, timeline: { startMonth: 0, durationMonths: 12, progress: 100 }, owner: 'Guardian' },
    { id: 'news', icon: '📰', name: 'Intel Feed', desc: 'Real-time news aggregation.', status: 'active' as const, category: 'System' as const, priority: 'High' as const, agents: ['oracle'], href: '/news', ideas: 0, timeline: { startMonth: 0, durationMonths: 12, progress: 100 }, owner: 'Oracle' },
    { id: 'chat', icon: '💬', name: 'Neural Chat', desc: 'Direct AI communication channel.', status: 'active' as const, category: 'System' as const, priority: 'High' as const, agents: ['lux'], href: '/chat', ideas: 0, timeline: { startMonth: 0, durationMonths: 12, progress: 100 }, owner: 'Lux' },
    { id: 'labs', icon: '🔬', name: 'Project Labs', desc: 'Development roadmap & audit.', status: 'active' as const, category: 'System' as const, priority: 'High' as const, agents: ['antigravity'], href: '/labs', ideas: 0, timeline: { startMonth: 0, durationMonths: 12, progress: 100 }, owner: 'Antigravity' },
    { id: 'settings', icon: '⚙️', name: 'System Settings', desc: 'Global configuration.', status: 'active' as const, category: 'System' as const, priority: 'High' as const, agents: ['guardian'], href: '/settings', ideas: 0, timeline: { startMonth: 0, durationMonths: 12, progress: 100 }, owner: 'Guardian' },
    { id: 'pipeline', icon: '🚀', name: 'Growth Pipeline', desc: 'Business logic & CRM.', status: 'active' as const, category: 'System' as const, priority: 'Medium' as const, agents: ['oracle'], href: '/pipeline', ideas: 0, timeline: { startMonth: 0, durationMonths: 12, progress: 90 }, owner: 'Oracle' },
    { id: 'agents', icon: '🤖', name: 'Agent Registry', desc: 'Manage AI workforce.', status: 'active' as const, category: 'System' as const, priority: 'High' as const, agents: ['lux'], href: '/agents', ideas: 0, timeline: { startMonth: 0, durationMonths: 12, progress: 90 }, owner: 'Lux' },
    { id: 'dev-planners', icon: '🧠', name: 'Dev Planners', desc: 'Core automation intelligence team.', status: 'active' as const, category: 'System' as const, priority: 'High' as const, agents: ['lux', 'claude'], href: '/team', ideas: 1, timeline: { startMonth: 0, durationMonths: 12, progress: 100 }, owner: 'Lux' },

    // --- CREATION & STUDIOS ---
    { id: 'music-studio', icon: '🎵', name: 'Music Studio', desc: 'AI music production pipeline.', status: 'active' as const, category: 'Creation' as const, priority: 'High' as const, agents: ['lyricist', 'composer', 'producer'], href: '/music', ideas: 5, timeline: { startMonth: 10, durationMonths: 3, progress: 85 }, owner: 'Producer' },
    { id: 'art-income', icon: '🎨', name: 'Art Studio & Income', desc: 'Print-on-demand revenue tracking.', status: 'active' as const, category: 'Creation' as const, priority: 'High' as const, agents: ['lux'], href: '/income/art', ideas: 3, timeline: { startMonth: 0, durationMonths: 12, progress: 70 }, owner: 'Lux' },
    { id: 'video-studio', icon: '🎥', name: 'Video Studio', desc: 'Video generation tools.', status: 'preview' as const, category: 'Creation' as const, priority: 'Medium' as const, agents: ['lux'], href: '/studios/video', ideas: 2, timeline: { startMonth: 6, durationMonths: 6, progress: 40 }, owner: 'Lux' },
    { id: 'dev-studio', icon: '💻', name: 'Dev Studio', desc: 'Code generation & git tools.', status: 'active' as const, category: 'Creation' as const, priority: 'Medium' as const, agents: ['bytebot'], href: '/studios/dev', ideas: 4, timeline: { startMonth: 0, durationMonths: 6, progress: 80 }, owner: 'ByteBot' },
    { id: 'prompts', icon: '📝', name: 'Prompt Library', desc: 'Reusable system prompts.', status: 'active' as const, category: 'Creation' as const, priority: 'Medium' as const, agents: ['lux'], href: '/prompts', ideas: 0, timeline: { startMonth: 0, durationMonths: 12, progress: 60 }, owner: 'Lux' },
    { id: 'playground', icon: '🎮', name: 'Playground', desc: 'Experimental testing area.', status: 'preview' as const, category: 'Creation' as const, priority: 'Low' as const, agents: [], href: '/playground', ideas: 0, timeline: { startMonth: 0, durationMonths: 12, progress: 30 }, owner: 'Lux' },

    // --- OPERATIONS & INTELLIGENCE ---
    { id: 'nexus-plan', icon: '📜', name: 'Nexus Master Plan', desc: 'Unified project roadmap.', content: NEXUS_PLAN_MD, status: 'active' as const, category: 'Operations' as const, priority: 'High' as const, agents: ['antigravity'], href: '/docs', ideas: 99, timeline: { startMonth: 11, durationMonths: 12, progress: 50 }, owner: 'Antigravity' },
    { id: 'meeting', icon: '👥', name: 'AI Staff Meeting', desc: 'Multi-agent debate room.', status: 'active' as const, category: 'Operations' as const, priority: 'High' as const, agents: ['architect', 'qa'], href: '/meeting', ideas: 3, timeline: { startMonth: 0, durationMonths: 4, progress: 80 }, owner: 'Architect' },
    { id: 'voice', icon: '🎙️', name: 'Voice Command', desc: 'System-wide vocal interface.', status: 'preview' as const, category: 'Operations' as const, priority: 'Medium' as const, agents: ['guardian'], href: '/voice', ideas: 1, timeline: { startMonth: 0, durationMonths: 6, progress: 90 }, owner: 'Guardian' },
    { id: 'learn', icon: '🎓', name: 'Learning Hub', desc: 'Educational resources.', status: 'active' as const, category: 'Operations' as const, priority: 'Low' as const, agents: [], href: '/learn', ideas: 0, timeline: { startMonth: 0, durationMonths: 12, progress: 40 }, owner: 'System' },
    { id: 'docs', icon: '📚', name: 'Documentation', desc: 'System docs & guides.', status: 'active' as const, category: 'Operations' as const, priority: 'High' as const, agents: [], href: '/docs', ideas: 0, timeline: { startMonth: 0, durationMonths: 12, progress: 90 }, owner: 'System' },
    { id: 'admin-gov', icon: '🏛️', name: 'Governance', desc: 'Admin controls.', status: 'concept' as const, category: 'Operations' as const, priority: 'Low' as const, agents: ['guardian'], href: '/admin/governance', ideas: 0, timeline: { startMonth: 0, durationMonths: 12, progress: 10 }, owner: 'Guardian' },

    { id: 'analytics', icon: '📊', name: 'Analytics Hub', desc: 'Performance dashboards.', status: 'active' as const, category: 'Intelligence' as const, priority: 'Medium' as const, agents: ['oracle'], href: '/analytics', ideas: 0, timeline: { startMonth: 2, durationMonths: 4, progress: 40 }, owner: 'Oracle' },
    { id: 'models', icon: '🧠', name: 'Model Manager', desc: 'Local LLM configuration.', status: 'active' as const, category: 'Intelligence' as const, priority: 'Medium' as const, agents: ['architect'], href: '/models', ideas: 0, timeline: { startMonth: 0, durationMonths: 12, progress: 75 }, owner: 'Architect' },
    { id: 'github', icon: '😼', name: 'GitHub Integration', desc: 'Repo sync & issues.', status: 'active' as const, category: 'Intelligence' as const, priority: 'High' as const, agents: ['bytebot'], href: '/github', ideas: 0, timeline: { startMonth: 0, durationMonths: 12, progress: 85 }, owner: 'ByteBot' },

    // --- CAPITAL & GROWTH ---
    { id: 'income-music', icon: '💸', name: 'Music Revenue', desc: 'Track streaming income.', status: 'active' as const, category: 'Capital' as const, priority: 'High' as const, agents: ['oracle'], href: '/income/music', ideas: 0, timeline: { startMonth: 0, durationMonths: 12, progress: 90 }, owner: 'Oracle' },
    { id: 'deals', icon: '🤝', name: 'Deal Flow', desc: 'CRM for business deals.', status: 'concept' as const, category: 'Capital' as const, priority: 'Low' as const, agents: ['oracle'], href: '/deals', ideas: 1, timeline: { startMonth: 0, durationMonths: 6, progress: 30 }, owner: 'Oracle' },
    { id: 'crypto', icon: '💎', name: 'Crypto Lab', desc: 'DeFi & Solana experiments.', status: 'active' as const, category: 'Capital' as const, priority: 'Medium' as const, agents: ['oracle'], href: '/crypto', ideas: 3, timeline: { startMonth: 2, durationMonths: 4, progress: 30 }, owner: 'Oracle' },
    { id: 'trading', icon: '📈', name: 'Trading Desk', desc: 'Market analysis tools.', status: 'concept' as const, category: 'Capital' as const, priority: 'Low' as const, agents: ['oracle'], href: '/trading', ideas: 0, timeline: { startMonth: 4, durationMonths: 4, progress: 20 }, owner: 'Oracle' },

    // --- ARCHIVE / STUBS (Candidates for Removal) ---
    { id: 'stub-finance', icon: '💰', name: 'Finance Legacy', desc: 'Old finance page.', status: 'concept' as const, category: 'Archive' as const, priority: 'Low' as const, agents: [], href: '/finance', ideas: 0, timeline: { startMonth: 0, durationMonths: 0, progress: 0 }, owner: 'System' },
    { id: 'stub-apps', icon: '📱', name: 'App Directory', desc: 'Redundant.', status: 'concept' as const, category: 'Archive' as const, priority: 'Low' as const, agents: [], href: '/apps', ideas: 0, timeline: { startMonth: 0, durationMonths: 0, progress: 0 }, owner: 'System' },
    { id: 'stub-media', icon: '📺', name: 'Media Center', desc: 'Unclear purpose.', status: 'concept' as const, category: 'Archive' as const, priority: 'Low' as const, agents: [], href: '/media', ideas: 0, timeline: { startMonth: 0, durationMonths: 0, progress: 0 }, owner: 'System' },
    { id: 'stub-notifications', icon: '🔔', name: 'Notifications', desc: 'Should be a modal.', status: 'concept' as const, category: 'Archive' as const, priority: 'Low' as const, agents: [], href: '/notifications', ideas: 0, timeline: { startMonth: 0, durationMonths: 0, progress: 0 }, owner: 'System' },
    { id: 'stub-income-landing', icon: '💸', name: 'Income Landing', desc: 'Landing page only.', status: 'concept' as const, category: 'Archive' as const, priority: 'Low' as const, agents: [], href: '/income', ideas: 0, timeline: { startMonth: 0, durationMonths: 0, progress: 0 }, owner: 'System' },
    { id: 'stub-shortcuts', icon: '⌨️', name: 'Shortcuts', desc: 'Modal candidate.', status: 'concept' as const, category: 'Archive' as const, priority: 'Low' as const, agents: [], href: '/shortcuts', ideas: 0, timeline: { startMonth: 0, durationMonths: 0, progress: 0 }, owner: 'System' },
    { id: 'stub-scratchpad', icon: '📝', name: 'Scratchpad', desc: 'Low utility.', status: 'concept' as const, category: 'Archive' as const, priority: 'Low' as const, agents: [], href: '/scratchpad', ideas: 0, timeline: { startMonth: 0, durationMonths: 0, progress: 0 }, owner: 'System' },
    { id: 'stub-income-tracker', icon: '📈', name: 'Income Tracker', desc: 'Consolidate /income.', status: 'concept' as const, category: 'Archive' as const, priority: 'Low' as const, agents: [], href: '/income/tracker', ideas: 0, timeline: { startMonth: 0, durationMonths: 0, progress: 0 }, owner: 'System' },
    { id: 'stub-download', icon: '⬇️', name: 'Download', desc: 'One-time use.', status: 'concept' as const, category: 'Archive' as const, priority: 'Low' as const, agents: [], href: '/download', ideas: 0, timeline: { startMonth: 0, durationMonths: 0, progress: 0 }, owner: 'System' },
    { id: 'stub-community', icon: '👥', name: 'Community', desc: 'Low priority.', status: 'concept' as const, category: 'Archive' as const, priority: 'Low' as const, agents: [], href: '/community', ideas: 0, timeline: { startMonth: 0, durationMonths: 0, progress: 0 }, owner: 'System' },
    { id: 'stub-calendar', icon: '📅', name: 'Calendar', desc: 'Unused.', status: 'concept' as const, category: 'Archive' as const, priority: 'Low' as const, agents: [], href: '/calendar', ideas: 0, timeline: { startMonth: 0, durationMonths: 0, progress: 0 }, owner: 'System' },
    { id: 'stub-files', icon: '📂', name: 'Files', desc: 'File manager.', status: 'concept' as const, category: 'Archive' as const, priority: 'Low' as const, agents: [], href: '/files', ideas: 0, timeline: { startMonth: 0, durationMonths: 0, progress: 0 }, owner: 'System' },
    { id: 'stub-budget', icon: '💰', name: 'Budget', desc: 'Finance tool.', status: 'concept' as const, category: 'Archive' as const, priority: 'Low' as const, agents: [], href: '/budget', ideas: 0, timeline: { startMonth: 0, durationMonths: 0, progress: 0 }, owner: 'System' },
    { id: 'stub-blog', icon: '✍️', name: 'Blog', desc: 'Content.', status: 'concept' as const, category: 'Archive' as const, priority: 'Low' as const, agents: [], href: '/blog', ideas: 0, timeline: { startMonth: 0, durationMonths: 0, progress: 0 }, owner: 'System' },
];
