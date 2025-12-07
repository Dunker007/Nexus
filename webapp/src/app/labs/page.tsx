'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, LayoutGrid, List, Kanban, Plus, Lightbulb, Users, ArrowUpRight, MoreHorizontal, MessageSquare, Calendar, ChevronRight, ChevronDown, X, FileText } from 'lucide-react';
import Link from 'next/link';
import PageBackground from '@/components/PageBackground';
import StaffMeetingPanel from '@/components/StaffMeetingPanel';

// Types
interface Lab {
    id: string;
    icon: string;
    name: string;
    desc: string;
    content?: string; // Markdown content for plans/docs
    status: 'active' | 'preview' | 'concept';
    category: 'Operations' | 'Intelligence' | 'Creation' | 'Capital' | 'Experimental';
    priority: 'High' | 'Medium' | 'Low';
    agents: string[];
    href: string | null;
    ideas: number;
    timeline: { startMonth: number; durationMonths: number; progress: number }; // Relative to Jan
    owner: string;
}

const NEXUS_PLAN_MD = `# Unified Project Evaluation & Implementation Plan

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

const INITIAL_LABS_DATA: Lab[] = [
    // Operations
    { id: 'nexus-plan', icon: '📜', name: 'Nexus Implementation Plan', desc: 'Unified project roadmap.', content: NEXUS_PLAN_MD, status: 'active', category: 'Operations', priority: 'High', agents: ['antigravity'], href: null, ideas: 99, timeline: { startMonth: 11, durationMonths: 12, progress: 40 }, owner: 'Antigravity' },
    { id: 'meeting', icon: '👥', name: 'AI Staff Meeting', desc: 'Multi-agent debate room.', status: 'active', category: 'Operations', priority: 'High', agents: ['architect', 'qa'], href: '/meeting', ideas: 3, timeline: { startMonth: 0, durationMonths: 4, progress: 80 }, owner: 'Architect' },
    { id: 'voice', icon: '🎙️', name: 'Voice Command', desc: 'System-wide God Mode.', status: 'active', category: 'Operations', priority: 'High', agents: ['guardian'], href: '/voice', ideas: 1, timeline: { startMonth: 0, durationMonths: 6, progress: 90 }, owner: 'Guardian' },
    { id: 'automation', icon: '⚡', name: 'Automation Lab', desc: 'Workflow builder.', status: 'active', category: 'Operations', priority: 'Medium', agents: ['bytebot'], href: '/workflows', ideas: 5, timeline: { startMonth: 1, durationMonths: 3, progress: 60 }, owner: 'ByteBot' },
    { id: 'smarthome', icon: '🏠', name: 'Smart Home Control', desc: 'Home automation hub.', status: 'active', category: 'Operations', priority: 'Medium', agents: ['bytebot'], href: '/home', ideas: 2, timeline: { startMonth: 0, durationMonths: 12, progress: 45 }, owner: 'ByteBot' },

    // Intelligence
    { id: 'analytics', icon: '📊', name: 'Analytics Hub', desc: 'Performance dashboards.', status: 'active', category: 'Intelligence', priority: 'Medium', agents: ['oracle'], href: '/analytics', ideas: 0, timeline: { startMonth: 2, durationMonths: 4, progress: 40 }, owner: 'Oracle' },
    { id: 'knowledge', icon: '📚', name: 'Knowledge Base', desc: 'Doc search & index.', status: 'preview', category: 'Intelligence', priority: 'Medium', agents: ['oracle'], href: '/learn', ideas: 2, timeline: { startMonth: 3, durationMonths: 5, progress: 20 }, owner: 'Oracle' },
    { id: 'dataweave', icon: '🌐', name: 'Data Weave', desc: 'ETL & Data pipes.', status: 'active', category: 'Intelligence', priority: 'Low', agents: ['bytebot'], href: null, ideas: 0, timeline: { startMonth: 4, durationMonths: 2, progress: 10 }, owner: 'ByteBot' },

    // Creation
    { id: 'forge', icon: '🔨', name: 'Agent Forge', desc: 'Build AI agents.', status: 'preview', category: 'Creation', priority: 'High', agents: ['lux'], href: '/agents', ideas: 8, timeline: { startMonth: 1, durationMonths: 5, progress: 50 }, owner: 'Lux' },
    { id: 'codegen', icon: '💻', name: 'Code Generator', desc: 'AI refactoring tools.', status: 'active', category: 'Creation', priority: 'High', agents: ['bytebot'], href: '/playground', ideas: 4, timeline: { startMonth: 0, durationMonths: 3, progress: 75 }, owner: 'ByteBot' },
    { id: 'vision', icon: '👁️', name: 'Vision Lab', desc: 'Computer vision tools.', status: 'concept', category: 'Creation', priority: 'Low', agents: ['lux'], href: null, ideas: 1, timeline: { startMonth: 5, durationMonths: 6, progress: 5 }, owner: 'Lux' },

    // Capital
    { id: 'income', icon: '💸', name: 'Passive Income', desc: 'Revenue tracking.', status: 'active', category: 'Capital', priority: 'High', agents: ['oracle'], href: '/income', ideas: 12, timeline: { startMonth: 0, durationMonths: 12, progress: 60 }, owner: 'Oracle' },
    { id: 'crypto', icon: '💎', name: 'Crypto Lab', desc: 'DeFi & Solana.', status: 'active', category: 'Capital', priority: 'Medium', agents: ['oracle'], href: '/crypto', ideas: 3, timeline: { startMonth: 2, durationMonths: 4, progress: 30 }, owner: 'Oracle' },

    // Experimental
    { id: 'aura', icon: '✨', name: 'AURA Interface', desc: 'Natural UI research.', status: 'concept', category: 'Experimental', priority: 'Low', agents: ['lux'], href: null, ideas: 9, timeline: { startMonth: 6, durationMonths: 6, progress: 0 }, owner: 'Lux' },
    { id: 'pcoptimize', icon: '⚡', name: 'PC Optimizer', desc: 'System performance tuning & resource management.', status: 'concept', category: 'Experimental', priority: 'Medium', agents: ['bytebot', 'guardian'], href: null, ideas: 4, timeline: { startMonth: 3, durationMonths: 4, progress: 0 }, owner: 'ByteBot' },
    { id: 'llmoptimize', icon: '🧠', name: 'LLM Lab', desc: 'Local model tuning, quantization & benchmarking.', status: 'concept', category: 'Experimental', priority: 'High', agents: ['architect', 'oracle'], href: null, ideas: 7, timeline: { startMonth: 2, durationMonths: 6, progress: 0 }, owner: 'Architect' },
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const AGENT_COLORS: Record<string, string> = {
    lux: 'bg-cyan-500',
    guardian: 'bg-green-500',
    architect: 'bg-purple-500',
    bytebot: 'bg-orange-500',
    oracle: 'bg-indigo-500',
    qa: 'bg-pink-500',
    security: 'bg-red-500',
    antigravity: 'bg-yellow-500'
};

export default function LabsPage() {
    const [labsData, setLabsData] = useState<Lab[]>(INITIAL_LABS_DATA);
    const [viewMode, setViewMode] = useState<'grid' | 'kanban' | 'gantt'>('gantt');
    const [filterCategory, setFilterCategory] = useState<string>('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedRows, setExpandedRows] = useState<string[]>([]);
    const [selectedLabId, setSelectedLabId] = useState<string | null>(null);
    const [isIdeaModalOpen, setIsIdeaModalOpen] = useState(false);
    const [viewContent, setViewContent] = useState<string | null>(null);
    const [newIdea, setNewIdea] = useState({ title: '', desc: '', category: 'Operations' });

    const handleAddIdea = () => {
        if (!newIdea.title) return;
        const newLab: Lab = {
            id: Date.now().toString(),
            icon: '💡',
            name: newIdea.title,
            desc: newIdea.desc,
            status: 'concept',
            category: newIdea.category as any,
            priority: 'Medium',
            agents: ['architect'],
            href: null,
            ideas: 0,
            timeline: { startMonth: new Date().getMonth(), durationMonths: 3, progress: 0 },
            owner: 'Architect'
        };
        setLabsData(prev => [...prev, newLab]);
        setIsIdeaModalOpen(false);
        setNewIdea({ title: '', desc: '', category: 'Operations' });
        setTimeout(() => {
            const event = new CustomEvent('new-lab-idea', { detail: newLab });
            window.dispatchEvent(event);
        }, 500);
    };

    const handleUpdateLab = (id: string, updates: any) => {
        setLabsData(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
    };

    const handleQuickIdea = (labId: string) => {
        // Placeholder for quick idea
    };

    const filteredLabs = labsData.filter(lab => {
        const matchesCategory = filterCategory === 'All' || lab.category === filterCategory;
        const matchesSearch = lab.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            lab.desc.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const toggleRow = (id: string) => {
        setExpandedRows(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]);
        setSelectedLabId(id);
    };

    return (
        <div className="min-h-screen relative overflow-hidden text-white pb-20">
            <PageBackground color="cyan" />

            <div className="container-main py-8 relative z-10">
                {/* Header ... */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            <span className="text-4xl">🧪</span>
                            <span>Labs</span>
                            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Hub</span>
                        </h1>
                        <p className="text-gray-400 mt-1">Experimental feature roadmap & agent assignments</p>
                    </div>
                    <div className="flex gap-2 bg-black/30 p-1 rounded-lg border border-white/10">
                        <button onClick={() => setViewMode('gantt')} className={`p-2 rounded ${viewMode === 'gantt' ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-400 hover:text-white'}`}><List size={20} /></button>
                        <button onClick={() => setViewMode('grid')} className={`p-2 rounded ${viewMode === 'grid' ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-400 hover:text-white'}`}><LayoutGrid size={20} /></button>
                        <button onClick={() => setViewMode('kanban')} className={`p-2 rounded ${viewMode === 'kanban' ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-400 hover:text-white'}`}><Kanban size={20} /></button>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
                    <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto">
                        {['All', 'Operations', 'Intelligence', 'Creation', 'Capital', 'Experimental'].map(cat => (
                            <button
                                key={cat}
                                onClick={() => setFilterCategory(cat)}
                                className={`px-4 py-2 rounded-full text-sm whitespace-nowrap border transition-all ${filterCategory === cat
                                        ? 'bg-cyan-500 text-black border-cyan-500 font-bold'
                                        : 'bg-black/30 text-gray-400 border-white/10 hover:border-white/30'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                            <input
                                type="text"
                                placeholder="Search labs..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full bg-black/30 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                            />
                        </div>
                        <button
                            onClick={() => setIsIdeaModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-purple-600 rounded-lg text-white font-semibold hover:shadow-lg hover:shadow-cyan-500/20 transition-all"
                        >
                            <Plus size={16} />
                            <span className="hidden md:inline">New Idea</span>
                        </button>
                    </div>
                </div>

                {/* Content Views */}
                <AnimatePresence mode="wait">
                    {viewMode === 'gantt' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                            {filteredLabs.map(lab => (
                                <div key={lab.id} className="glass-card p-0 overflow-hidden group">
                                    <div className="p-4 flex items-center gap-4 cursor-pointer hover:bg-white/5 transition-colors" onClick={() => toggleRow(lab.id)}>
                                        <div className="text-2xl w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">{lab.icon}</div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold truncate flex items-center gap-2">
                                                {lab.name}
                                                {lab.content && <FileText size={14} className="text-cyan-400" />}
                                            </h3>
                                            <p className="text-sm text-gray-500 truncate">{lab.desc}</p>
                                        </div>
                                        {/* Status Pill */}
                                        <div className={`hidden md:block px-2 py-1 rounded text-xs uppercase tracking-wider ${lab.status === 'active' ? 'bg-green-500/20 text-green-400' :
                                                lab.status === 'preview' ? 'bg-yellow-500/20 text-yellow-400' :
                                                    'bg-gray-500/20 text-gray-400'
                                            }`}>{lab.status}</div>

                                        {/* Owner Avatar */}
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${AGENT_COLORS[lab.owner.toLowerCase()] || 'bg-gray-600'}`}>
                                            {lab.owner[0]}
                                        </div>

                                        <ChevronDown className={`text-gray-500 transition-transform ${expandedRows.includes(lab.id) ? 'rotate-180' : ''}`} />
                                    </div>

                                    {/* Expanded Details */}
                                    <AnimatePresence>
                                        {expandedRows.includes(lab.id) && (
                                            <motion.div
                                                initial={{ height: 0 }}
                                                animate={{ height: 'auto' }}
                                                exit={{ height: 0 }}
                                                className="overflow-hidden border-t border-white/5 bg-black/20"
                                            >
                                                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                                                    {/* Timeline */}
                                                    <div className="col-span-2 space-y-2">
                                                        <h4 className="text-xs uppercase text-gray-500 font-bold mb-2">Development Timeline</h4>
                                                        <div className="h-12 bg-white/5 rounded-lg relative overflow-hidden flex items-center px-2">
                                                            {MONTHS.map((m, i) => (
                                                                <div key={m} className={`flex-1 text-[10px] text-center ${i >= lab.timeline.startMonth && i < lab.timeline.startMonth + lab.timeline.durationMonths ? 'text-white font-bold' : 'text-gray-700'}`}>
                                                                    {m}
                                                                </div>
                                                            ))}
                                                            <div
                                                                className="absolute top-0 bottom-0 bg-cyan-500/20 border-l border-r border-cyan-500/50"
                                                                style={{
                                                                    left: `${(lab.timeline.startMonth / 12) * 100}%`,
                                                                    width: `${(lab.timeline.durationMonths / 12) * 100}%`
                                                                }}
                                                            >
                                                                <div
                                                                    className="h-full bg-cyan-500/40"
                                                                    style={{ width: `${lab.timeline.progress}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="flex justify-between text-xs text-gray-500">
                                                            <span>Start: {MONTHS[lab.timeline.startMonth]}</span>
                                                            <span>Progress: {lab.timeline.progress}%</span>
                                                        </div>
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="space-y-2">
                                                        <h4 className="text-xs uppercase text-gray-500 font-bold mb-2">Actions</h4>
                                                        {lab.href ? (
                                                            <Link href={lab.href} className="flex items-center justify-between w-full p-3 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 rounded-lg transition-colors border border-cyan-500/30">
                                                                <span>Open Lab</span>
                                                                <ArrowUpRight size={16} />
                                                            </Link>
                                                        ) : (
                                                            <div className="w-full p-3 bg-white/5 text-gray-500 rounded-lg border border-white/5 cursor-not-allowed">
                                                                In Concept Phase
                                                            </div>
                                                        )}

                                                        {lab.content && (
                                                            <button
                                                                onClick={() => setViewContent(lab.content || null)}
                                                                className="flex items-center justify-between w-full p-3 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded-lg transition-colors border border-purple-500/30"
                                                            >
                                                                <span>View Plan Document</span>
                                                                <FileText size={16} />
                                                            </button>
                                                        )}

                                                        <button
                                                            className="flex items-center justify-between w-full p-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg transition-colors"
                                                            onClick={(e) => {
                                                                const event = new CustomEvent('new-milestone', { detail: { labId: lab.id } });
                                                                window.dispatchEvent(event);
                                                                const btn = e.currentTarget;
                                                                btn.style.backgroundColor = 'rgba(0, 255, 0, 0.2)';
                                                                setTimeout(() => btn.style.backgroundColor = '', 200);
                                                            }}
                                                        >
                                                            <span>+ Add Milestone</span>
                                                            <Calendar size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </motion.div>
                    )}

                    {(viewMode === 'grid' || viewMode === 'kanban') && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "grid grid-cols-1 md:grid-cols-3 gap-6 overflow-x-auto pb-4"}
                        >
                            {viewMode === 'grid' && filteredLabs.map(lab => (
                                <LabCard key={lab.id} lab={lab} onQuickIdea={handleQuickIdea} onViewContent={(c) => setViewContent(c)} />
                            ))}

                            {viewMode === 'kanban' && ['active', 'preview', 'concept'].map(status => (
                                <div key={status} className="bg-white/5 rounded-xl border border-white/10 p-4 h-fit min-h-[400px]">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="font-bold uppercase tracking-widest text-sm text-gray-400">{status}</h3>
                                        <span className="px-2 py-1 bg-white/5 rounded text-xs">{filteredLabs.filter(l => l.status === status).length}</span>
                                    </div>
                                    <div className="space-y-4">
                                        {filteredLabs.filter(l => l.status === status).map(lab => (
                                            <LabCard key={lab.id} lab={lab} simple onQuickIdea={handleQuickIdea} onViewContent={(c) => setViewContent(c)} />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Document Viewer Modal */}
            <AnimatePresence>
                {viewContent && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-[#0a0e1a] border border-white/10 rounded-xl w-full max-w-4xl max-h-[80vh] flex flex-col shadow-2xl"
                        >
                            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5 rounded-t-xl">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <FileText className="text-cyan-400" />
                                    Document Viewer
                                </h2>
                                <button onClick={() => setViewContent(null)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="p-8 overflow-y-auto font-mono text-sm text-gray-300 custom-scrollbar whitespace-pre-line">
                                {viewContent}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Add Idea Modal */}
            <AnimatePresence>
                {isIdeaModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div className="bg-[#0d1117] border border-white/10 rounded-xl w-full max-w-lg p-6 relative">
                            <button onClick={() => setIsIdeaModalOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X size={20} /></button>
                            <h2 className="text-2xl font-bold mb-6">Suggest New Idea</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Title</label>
                                    <input
                                        type="text"
                                        className="w-full bg-black/50 border border-white/10 rounded p-3 focus:border-cyan-500 focus:outline-none"
                                        value={newIdea.title}
                                        onChange={e => setNewIdea({ ...newIdea, title: e.target.value })}
                                        autoFocus
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Description</label>
                                    <textarea
                                        className="w-full bg-black/50 border border-white/10 rounded p-3 focus:border-cyan-500 focus:outline-none h-32"
                                        value={newIdea.desc}
                                        onChange={e => setNewIdea({ ...newIdea, desc: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Category</label>
                                    <select
                                        className="w-full bg-black/50 border border-white/10 rounded p-3 focus:border-cyan-500 focus:outline-none"
                                        value={newIdea.category}
                                        onChange={e => setNewIdea({ ...newIdea, category: e.target.value })}
                                    >
                                        {['Operations', 'Intelligence', 'Creation', 'Capital', 'Experimental'].map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <button
                                    onClick={handleAddIdea}
                                    className="w-full py-3 bg-cyan-600 rounded-lg font-bold hover:bg-cyan-500 transition-colors mt-2"
                                >
                                    Submit to Roadmap
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

function LabCard({ lab, simple = false, onQuickIdea, onViewContent }: { lab: Lab, simple?: boolean, onQuickIdea?: (labId: string) => void, onViewContent?: (content: string) => void }) {
    return (
        <motion.div
            layout
            className="glass-card group relative hover:-translate-y-1 transition-transform p-6"
        >
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-white/5 rounded-xl text-3xl group-hover:scale-110 transition-transform">
                    {lab.icon}
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                        {lab.agents.map((agent, i) => (
                            <div key={i} className={`w-6 h-6 rounded-full border border-black flex items-center justify-center text-[10px] text-white font-bold uppercase ${AGENT_COLORS[agent.toLowerCase()] || 'bg-gray-500'}`} title={agent}>
                                {agent[0]}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mb-4">
                <h3 className="font-bold text-lg text-white group-hover:text-cyan-400 transition-colors flex items-center gap-2">
                    {lab.name}
                    {lab.href && <ArrowUpRight size={14} className="opacity-50" />}
                </h3>
                {!simple && <p className="text-sm text-gray-400 line-clamp-2 mt-1">{lab.desc}</p>}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="flex gap-3">
                    <button className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-cyan-400 transition-colors">
                        <Lightbulb size={14} />
                        <span>{lab.ideas} Ideas</span>
                    </button>
                    {!simple && (
                        <span className={`text-[10px] px-2 py-0.5 rounded border ${lab.priority === 'High' ? 'border-red-500/30 text-red-400' :
                            lab.priority === 'Medium' ? 'border-yellow-500/30 text-yellow-400' :
                                'border-blue-500/30 text-blue-400'
                            }`}>
                            {lab.priority}
                        </span>
                    )}
                </div>

                {lab.href ? (
                    <Link href={lab.href} className="p-2 hover:bg-white/10 rounded-lg text-cyan-400">
                        <ArrowUpRight size={18} />
                    </Link>
                ) : lab.content ? (
                    <button onClick={() => onViewContent?.(lab.content!)} className="p-2 hover:bg-white/10 rounded-lg text-cyan-400">
                        <FileText size={18} />
                    </button>
                ) : (
                    <button className="p-2 hover:bg-white/10 rounded-lg text-gray-600 cursor-not-allowed">
                        <MoreHorizontal size={18} />
                    </button>
                )}
            </div>

            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-6 text-center pointer-events-none group-hover:pointer-events-auto rounded-xl">
                <button
                    onClick={() => onQuickIdea?.(lab.id)}
                    className="mb-4 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
                >
                    <Plus size={16} /> Add Quick Idea
                </button>
                {lab.href ? (
                    <Link href={lab.href} className="text-sm text-gray-300 hover:text-white underline">
                        Launch Lab
                    </Link>
                ) : lab.content ? (
                    <button onClick={() => onViewContent?.(lab.content!)} className="text-sm text-gray-300 hover:text-white underline">
                        View Document
                    </button>
                ) : null}
            </div>
        </motion.div>
    );
}
