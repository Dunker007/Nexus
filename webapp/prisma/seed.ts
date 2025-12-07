
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const INITIAL_LABS_DATA = [
    // Operations
    { title: 'AI Staff Meeting', icon: '👥', description: 'Multi-agent debate room.', status: 'active', category: 'Operations', priority: 'High', agents: ['architect', 'qa'], href: '/meeting', timeline: { startMonth: 0, durationMonths: 4, progress: 80 }, stats: { ideas: 3 }, owner: 'Architect' },
    { title: 'Voice Command', icon: '🎙️', description: 'System-wide God Mode.', status: 'active', category: 'Operations', priority: 'High', agents: ['guardian'], href: '/voice', timeline: { startMonth: 0, durationMonths: 6, progress: 90 }, stats: { ideas: 1 }, owner: 'Guardian' },
    { title: 'Automation Lab', icon: '⚡', description: 'Workflow builder.', status: 'active', category: 'Operations', priority: 'Medium', agents: ['bytebot'], href: '/workflows', timeline: { startMonth: 1, durationMonths: 3, progress: 60 }, stats: { ideas: 5 }, owner: 'ByteBot' },
    { title: 'Smart Home Control', icon: '🏠', description: 'Home automation hub.', status: 'active', category: 'Operations', priority: 'Medium', agents: ['bytebot'], href: '/home', timeline: { startMonth: 0, durationMonths: 12, progress: 45 }, stats: { ideas: 2 }, owner: 'ByteBot' },

    // Intelligence
    { title: 'Analytics Hub', icon: '📊', description: 'Performance dashboards.', status: 'active', category: 'Intelligence', priority: 'Medium', agents: ['oracle'], href: '/analytics', timeline: { startMonth: 2, durationMonths: 4, progress: 40 }, stats: { ideas: 0 }, owner: 'Oracle' },
    { title: 'Knowledge Base', icon: '📚', description: 'Doc search & index.', status: 'preview', category: 'Intelligence', priority: 'Medium', agents: ['oracle'], href: '/learn', timeline: { startMonth: 3, durationMonths: 5, progress: 20 }, stats: { ideas: 2 }, owner: 'Oracle' },
    { title: 'Data Weave', icon: '🌐', description: 'ETL & Data pipes.', status: 'active', category: 'Intelligence', priority: 'Low', agents: ['bytebot'], href: null, timeline: { startMonth: 4, durationMonths: 2, progress: 10 }, stats: { ideas: 0 }, owner: 'ByteBot' },

    // Creation
    { title: 'Agent Forge', icon: '🔨', description: 'Build AI agents.', status: 'preview', category: 'Creation', priority: 'High', agents: ['lux'], href: '/agents', timeline: { startMonth: 1, durationMonths: 5, progress: 50 }, stats: { ideas: 8 }, owner: 'Lux' },
    { title: 'Code Generator', icon: '💻', description: 'AI refactoring tools.', status: 'active', category: 'Creation', priority: 'High', agents: ['bytebot'], href: '/playground', timeline: { startMonth: 0, durationMonths: 3, progress: 75 }, stats: { ideas: 4 }, owner: 'ByteBot' },
    { title: 'Vision Lab', icon: '👁️', description: 'Computer vision tools.', status: 'concept', category: 'Creation', priority: 'Low', agents: ['lux'], href: null, timeline: { startMonth: 5, durationMonths: 6, progress: 5 }, stats: { ideas: 1 }, owner: 'Lux' },

    // Capital
    { title: 'Passive Income', icon: '💸', description: 'Revenue tracking.', status: 'active', category: 'Capital', priority: 'High', agents: ['oracle'], href: '/income', timeline: { startMonth: 0, durationMonths: 12, progress: 60 }, stats: { ideas: 12 }, owner: 'Oracle' },
    { title: 'Crypto Lab', icon: '💎', description: 'DeFi & Solana.', status: 'active', category: 'Capital', priority: 'Medium', agents: ['oracle'], href: '/crypto', timeline: { startMonth: 2, durationMonths: 4, progress: 30 }, stats: { ideas: 3 }, owner: 'Oracle' },

    // Experimental
    { title: 'AURA Interface', icon: '✨', description: 'Natural UI research.', status: 'concept', category: 'Experimental', priority: 'Low', agents: ['lux'], href: null, timeline: { startMonth: 6, durationMonths: 6, progress: 0 }, stats: { ideas: 9 }, owner: 'Lux' },
    { title: 'PC Optimizer', icon: '⚡', description: 'System performance tuning & resource management.', status: 'concept', category: 'Experimental', priority: 'Medium', agents: ['bytebot', 'guardian'], href: null, timeline: { startMonth: 3, durationMonths: 4, progress: 0 }, stats: { ideas: 4 }, owner: 'ByteBot' },
    { title: 'LLM Lab', icon: '🧠', description: 'Local model tuning, quantization & benchmarking.', status: 'concept', category: 'Experimental', priority: 'High', agents: ['architect', 'oracle'], href: null, timeline: { startMonth: 2, durationMonths: 6, progress: 0 }, stats: { ideas: 7 }, owner: 'Architect' },
];

const NEXUS_PLAN_MD = `# Unified Project Evaluation & Implementation Plan

## Evaluation Checklist (from task.md)
- [ ] Review overall architecture and AI integration flow
- [ ] Audit code quality (lint, TypeScript, unused imports)
- [ ] Measure performance (bundle size, runtime FPS, heavy animations)
- [ ] Verify accessibility (ARIA, focus management, color contrast)
- [ ] Check SEO fundamentals (meta tags, headings, alt text)
- [ ] Evaluate UI/UX consistency (glass, gradients, micro-animations, dark-mode support)
- [ ] Assess theme system (5 preset themes, toggle implementation)
- [ ] Review documentation (README, AI design docs, user guides)
- [ ] Validate testing coverage (unit, integration, e2e)
- [ ] Scan for security issues (dependency audit, CSP, XSS vectors)
- [ ] Identify opportunities for AI-driven enhancements (voice control, auto-summaries)

## Implementation Plan (from implementation_plan.md)
### 1️⃣ Dark-Mode & Theming
- [x] Add a [ThemeProvider] context that toggles a \`data-theme="dark"\` attribute on \`<html>\`.
- [x] Move all hard-coded colors into CSS custom properties in [globals.css].
- [x] Create a toggle button (\`ThemeToggle\`) to switch themes and persist choice in \`localStorage\`.
- [x] Update glass utility to respect theme.

### 2️⃣ Component Refactorings
- [x] Split [Navigation] into \`NavItem\` and \`NavMenu\`.
- [x] Extract \`ShortcutModal\` and \`Backdrop\` from [KeyboardShortcuts].
- [x] Break [MeetingRoom] into \`AvatarCircle\` and \`ControlPanel\`.
- [x] Export reusable UI components from \`components/ui/\`.

### ... (And more, referring to PRIMARY_PLAN.md)

See full document for remaining items.
`;

async function main() {
    console.log('Start seeding...');

    // Clear existing
    await prisma.project.deleteMany();

    // Seed Standard Labs
    for (const lab of INITIAL_LABS_DATA) {
        // @ts-ignore - Types might be out of sync temporarily
        await prisma.project.create({
            data: {
                title: lab.title,
                icon: lab.icon,
                description: lab.description,
                status: lab.status,
                category: lab.category,
                priority: lab.priority,
                owner: lab.owner,
                href: lab.href,
                agents: JSON.stringify(lab.agents),
                timeline: JSON.stringify(lab.timeline),
                stats: JSON.stringify(lab.stats),
            }
        });
    }

    // Seed Nexus Plan
    // @ts-ignore - Types might be out of sync temporarily
    await prisma.project.create({
        data: {
            title: 'Nexus Implementation Plan',
            icon: '📜',
            description: NEXUS_PLAN_MD,
            status: 'active',
            category: 'Operations',
            priority: 'High',
            owner: 'Antigravity',
            href: null,
            agents: JSON.stringify(['antigravity']),
            timeline: JSON.stringify({ startMonth: 11, durationMonths: 12, progress: 40 }),
            stats: JSON.stringify({ ideas: 99 }),
        }
    });

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
