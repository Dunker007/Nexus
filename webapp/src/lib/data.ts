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
    // Operations
    { id: 'nexus-plan', icon: '📜', name: 'Nexus Implementation Plan', desc: 'Unified project roadmap.', content: NEXUS_PLAN_MD, status: 'active' as const, category: 'Operations' as const, priority: 'High' as const, agents: ['antigravity'], href: '/docs', ideas: 99, timeline: { startMonth: 11, durationMonths: 12, progress: 40 }, owner: 'Antigravity' },
    { id: 'meeting', icon: '👥', name: 'AI Staff Meeting', desc: 'Multi-agent debate room.', status: 'active' as const, category: 'Operations' as const, priority: 'High' as const, agents: ['architect', 'qa'], href: '/meeting', ideas: 3, timeline: { startMonth: 0, durationMonths: 4, progress: 80 }, owner: 'Architect' },
    { id: 'voice', icon: '🎙️', name: 'Voice Command', desc: 'System-wide God Mode.', status: 'active' as const, category: 'Operations' as const, priority: 'High' as const, agents: ['guardian'], href: '/voice', ideas: 1, timeline: { startMonth: 0, durationMonths: 6, progress: 90 }, owner: 'Guardian' },
    { id: 'automation', icon: '⚡', name: 'Automation Lab', desc: 'Workflow builder.', status: 'active' as const, category: 'Operations' as const, priority: 'Medium' as const, agents: ['bytebot'], href: '/workflows', ideas: 5, timeline: { startMonth: 1, durationMonths: 3, progress: 60 }, owner: 'ByteBot' },
    { id: 'smarthome', icon: '🏠', name: 'Smart Home Control', desc: 'Home automation hub.', status: 'active' as const, category: 'Operations' as const, priority: 'Medium' as const, agents: ['bytebot'], href: '/home', ideas: 2, timeline: { startMonth: 0, durationMonths: 12, progress: 45 }, owner: 'ByteBot' },

    // Intelligence
    { id: 'analytics', icon: '📊', name: 'Analytics Hub', desc: 'Performance dashboards.', status: 'active' as const, category: 'Intelligence' as const, priority: 'Medium' as const, agents: ['oracle'], href: '/analytics', ideas: 0, timeline: { startMonth: 2, durationMonths: 4, progress: 40 }, owner: 'Oracle' },
    { id: 'knowledge', icon: '📚', name: 'Knowledge Base', desc: 'Doc search & index.', status: 'preview' as const, category: 'Intelligence' as const, priority: 'Medium' as const, agents: ['oracle'], href: '/learn', ideas: 2, timeline: { startMonth: 3, durationMonths: 5, progress: 20 }, owner: 'Oracle' },
    { id: 'dataweave', icon: '🌐', name: 'Data Weave', desc: 'ETL & Data pipes.', status: 'active' as const, category: 'Intelligence' as const, priority: 'Low' as const, agents: ['bytebot'], href: '/data', ideas: 0, timeline: { startMonth: 4, durationMonths: 2, progress: 10 }, owner: 'ByteBot' },

    // Creation
    { id: 'music-studio', icon: '🎵', name: 'Music Studio', desc: 'Suno → Neural Frames → DaVinci → YouTube + TikTok', status: 'active' as const, category: 'Creation' as const, priority: 'High' as const, agents: ['lyricist', 'composer', 'producer'], href: '/music', ideas: 5, timeline: { startMonth: 10, durationMonths: 3, progress: 75 }, owner: 'Producer' },
    { id: 'forge', icon: '🔨', name: 'Agent Forge', desc: 'Build AI agents.', status: 'preview' as const, category: 'Creation' as const, priority: 'High' as const, agents: ['lux'], href: '/agents', ideas: 8, timeline: { startMonth: 1, durationMonths: 5, progress: 50 }, owner: 'Lux' },
    { id: 'codegen', icon: '💻', name: 'Code Generator', desc: 'AI refactoring tools.', status: 'active' as const, category: 'Creation' as const, priority: 'High' as const, agents: ['bytebot'], href: '/playground', ideas: 4, timeline: { startMonth: 0, durationMonths: 3, progress: 75 }, owner: 'ByteBot' },
    { id: 'vision', icon: '👁️', name: 'Vision Lab', desc: 'Computer vision tools.', status: 'concept' as const, category: 'Creation' as const, priority: 'Low' as const, agents: ['lux'], href: '/vision', ideas: 1, timeline: { startMonth: 5, durationMonths: 6, progress: 5 }, owner: 'Lux' },

    // Capital
    { id: 'smartfolio', icon: '💰', name: 'SmartFolio', desc: 'AI-driven portfolio management and analysis.', status: 'active' as const, category: 'Capital' as const, priority: 'High' as const, agents: ['oracle', 'antigravity'], href: '/labs/smartfolio', ideas: 15, timeline: { startMonth: 2, durationMonths: 12, progress: 85 }, owner: 'Oracle' },
    { id: 'income', icon: '💸', name: 'Passive Income', desc: 'Revenue tracking.', status: 'active' as const, category: 'Capital' as const, priority: 'High' as const, agents: ['oracle'], href: '/income', ideas: 12, timeline: { startMonth: 0, durationMonths: 12, progress: 60 }, owner: 'Oracle' },
    { id: 'crypto', icon: '💎', name: 'Crypto Lab', desc: 'DeFi & Solana.', status: 'active' as const, category: 'Capital' as const, priority: 'Medium' as const, agents: ['oracle'], href: '/crypto', ideas: 3, timeline: { startMonth: 2, durationMonths: 4, progress: 30 }, owner: 'Oracle' },

    // Experimental
    { id: 'aura', icon: '✨', name: 'AURA Interface', desc: 'Natural UI research.', status: 'concept' as const, category: 'Experimental' as const, priority: 'Low' as const, agents: ['lux'], href: '/aura', ideas: 9, timeline: { startMonth: 6, durationMonths: 6, progress: 0 }, owner: 'Lux' },
    { id: 'pcoptimize', icon: '⚡', name: 'PC Optimizer', desc: 'System performance tuning & resource management.', status: 'concept' as const, category: 'Experimental' as const, priority: 'Medium' as const, agents: ['bytebot', 'guardian'], href: '/dashboard', ideas: 4, timeline: { startMonth: 3, durationMonths: 4, progress: 0 }, owner: 'ByteBot' },
    { id: 'llmoptimize', icon: '🧠', name: 'LLM Lab', desc: 'Local model tuning, quantization & benchmarking.', status: 'concept' as const, category: 'Experimental' as const, priority: 'High' as const, agents: ['architect', 'oracle'], href: '/settings', ideas: 7, timeline: { startMonth: 2, durationMonths: 6, progress: 0 }, owner: 'Architect' },
];
