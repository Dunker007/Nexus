'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, LayoutGrid, List, Kanban, Plus, Lightbulb, Users, ArrowUpRight, MoreHorizontal, MessageSquare, Calendar, ChevronRight, ChevronDown, X } from 'lucide-react';
import Link from 'next/link';
import PageBackground from '@/components/PageBackground';
import StaffMeetingPanel from '@/components/StaffMeetingPanel';

// Types
interface Lab {
    id: string;
    icon: string;
    name: string;
    desc: string;
    status: 'active' | 'preview' | 'concept';
    category: 'Operations' | 'Intelligence' | 'Creation' | 'Capital' | 'Experimental';
    priority: 'High' | 'Medium' | 'Low';
    agents: string[];
    href: string | null;
    ideas: number;
    timeline: { startMonth: number; durationMonths: number; progress: number }; // Relative to Jan
    owner: string;
}

const INITIAL_LABS_DATA: Lab[] = [
    // Operations
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
};

export default function LabsPage() {
    const [labsData, setLabsData] = useState<Lab[]>(INITIAL_LABS_DATA);
    const [viewMode, setViewMode] = useState<'grid' | 'kanban' | 'gantt'>('gantt');
    const [filterCategory, setFilterCategory] = useState<string>('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedRows, setExpandedRows] = useState<string[]>([]);
    const [selectedLabId, setSelectedLabId] = useState<string | null>(null);
    const [isIdeaModalOpen, setIsIdeaModalOpen] = useState(false);
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
        // Announce in meeting
        setTimeout(() => {
            const event = new CustomEvent('new-lab-idea', { detail: newLab });
            window.dispatchEvent(event);
        }, 500);
    };

    // Filter Logic
    const filteredLabs = labsData.filter(lab => {
        const matchesCategory = filterCategory === 'All' || lab.category === filterCategory;
        const matchesSearch = lab.name.toLowerCase().includes(searchQuery.toLowerCase()) || lab.desc.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const toggleRow = (id: string) => {
        setExpandedRows(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]);
        setSelectedLabId(id); // Also select for Panel discussion
    };

    const handleUpdateLab = (id: string, updates: any) => {
        setLabsData(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
        // Optional: Flash feedback or toast
    };

    const categories = ['Operations', 'Intelligence', 'Creation', 'Capital', 'Experimental'];
    const statuses = ['active', 'preview', 'concept'];

    return (
        <div className="h-[calc(100vh-4rem)] bg-[#050508] relative overflow-hidden flex flex-col items-center">
            <PageBackground color="indigo" />

            {/* Split Layout Container */}
            <div className="flex flex-col lg:flex-row flex-1 w-full">

                {/* Main Content Area (2/3) */}
                <div className="flex-1 min-w-0 p-4 md:p-8 flex flex-col h-full overflow-y-auto">

                    {/* Epic Header */}
                    <div className="relative mb-8 mt-4">
                        {/* Floating Decorative Elements */}
                        <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl animate-pulse pointer-events-none" />
                        <div className="absolute -top-5 right-20 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl animate-pulse delay-500 pointer-events-none" />
                        <div className="absolute top-10 right-0 w-16 h-16 bg-cyan-500/10 rounded-full blur-xl animate-pulse delay-1000 pointer-events-none" />

                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative z-10">
                            <div>
                                {/* Main Title with Animated Gradient */}
                                <div className="flex items-center gap-4 mb-3">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 rounded-xl blur-lg opacity-50 animate-pulse" />
                                        <div className="relative p-3 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 rounded-xl border border-white/10 backdrop-blur-sm">
                                            <span className="text-3xl">🧪</span>
                                        </div>
                                    </div>
                                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight">
                                        <span className="bg-gradient-to-r from-white via-indigo-200 to-white bg-clip-text text-transparent">
                                            DLX
                                        </span>
                                        <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent animate-gradient bg-300% ml-2">
                                            Labs
                                        </span>
                                    </h1>
                                </div>

                                {/* Subtitle with Live Stats */}
                                <p className="text-gray-400 text-lg mb-4 max-w-lg">
                                    Innovation pipeline & R&D command center.
                                    <span className="text-indigo-400 ml-1">Where ideas become reality.</span>
                                </p>

                                {/* Live Stats Badges */}
                                <div className="flex flex-wrap gap-3">
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                        <span className="text-xs font-medium text-green-400">{labsData.filter(l => l.status === 'active').length} Active</span>
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-full">
                                        <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                                        <span className="text-xs font-medium text-yellow-400">{labsData.filter(l => l.status === 'preview').length} Preview</span>
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                        <span className="text-xs font-medium text-blue-400">{labsData.filter(l => l.status === 'concept').length} Concept</span>
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-full">
                                        <span className="text-xs font-medium text-purple-400">💡 {labsData.reduce((acc, l) => acc + l.ideas, 0)} Ideas</span>
                                    </div>
                                </div>
                            </div>

                            {/* View Mode Switcher */}
                            <div className="flex gap-2 bg-white/5 p-1.5 rounded-xl border border-white/10 backdrop-blur-md shadow-xl shadow-black/20">
                                <button onClick={() => setViewMode('gantt')} className={`p-2.5 rounded-lg transition-all ${viewMode === 'gantt' ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-400 shadow-lg shadow-indigo-500/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`} title="Roadmap">
                                    <Calendar size={20} />
                                </button>
                                <button onClick={() => setViewMode('kanban')} className={`p-2.5 rounded-lg transition-all ${viewMode === 'kanban' ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-400 shadow-lg shadow-indigo-500/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`} title="Board">
                                    <Kanban size={20} />
                                </button>
                                <button onClick={() => setViewMode('grid')} className={`p-2.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-400 shadow-lg shadow-indigo-500/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`} title="Grid">
                                    <LayoutGrid size={20} />
                                </button>
                                <div className="w-px bg-white/10 mx-1" />
                                <button onClick={() => setIsIdeaModalOpen(true)} className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition-all hover:shadow-indigo-500/30 hover:scale-105">
                                    <Plus size={16} />
                                    <span className="hidden md:inline">New Idea</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Toolbar */}
                    <div className="flex flex-wrap gap-4 items-center bg-white/5 border border-white/10 p-4 rounded-xl backdrop-blur-md z-40 mb-8 sticky top-0">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            <input
                                type="text"
                                placeholder="Search initiatives..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-lg pl-10 pr-4 py-2 focus:border-indigo-500 outline-none text-sm"
                            />
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
                            <button
                                onClick={() => setFilterCategory('All')}
                                className={`px-4 py-2 rounded-lg text-xs font-medium whitespace-nowrap border transition-colors ${filterCategory === 'All' ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300' : 'border-white/10 hover:bg-white/5 text-gray-400'}`}
                            >
                                All Categories
                            </button>
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setFilterCategory(cat)}
                                    className={`px-4 py-2 rounded-lg text-xs font-medium whitespace-nowrap border transition-colors ${filterCategory === cat ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300' : 'border-white/10 hover:bg-white/5 text-gray-400'}`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {/* GANTT VIEW */}
                        {viewMode === 'gantt' && (
                            <motion.div
                                key="gantt"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="bg-[#0f0f13] border border-white/10 rounded-xl overflow-hidden flex flex-col flex-1"
                            >
                                {/* Gantt Scroll Wrapper */}
                                <div className="overflow-x-auto flex-1">
                                    <div className="min-w-[800px]">
                                        {/* Gantt Header */}
                                        <div className="grid grid-cols-12 border-b border-white/10 bg-white/5">
                                            <div className="col-span-3 p-4 border-r border-white/10 font-bold text-gray-400 text-sm">Initiative Name</div>
                                            <div className="col-span-9 grid grid-cols-12">
                                                {MONTHS.map(m => (
                                                    <div key={m} className="col-span-1 p-4 border-r border-white/5 text-center text-xs font-bold text-gray-500 last:border-0">
                                                        {m}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Gantt Body */}
                                        <div className="max-h-[600px] overflow-y-auto">
                                            {filteredLabs.map((lab, index) => (
                                                <div key={lab.id} className={`grid grid-cols-12 border-b border-white/5 hover:bg-white/5 transition-colors ${index % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.02]'}`}>
                                                    {/* Name Column */}
                                                    <div className="col-span-3 p-4 border-r border-white/10 flex items-center justify-between group cursor-pointer" onClick={() => toggleRow(lab.id)}>
                                                        <div className="flex items-center gap-3 overflow-hidden">
                                                            <button className="text-gray-500 hover:text-white">
                                                                {expandedRows.includes(lab.id) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                                            </button>
                                                            <div className="truncate">
                                                                <div className="font-medium text-sm text-gray-200 group-hover:text-indigo-400 transition-colors flex items-center gap-2">
                                                                    {lab.icon} {lab.name}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {lab.href && <Link href={lab.href} onClick={(e) => e.stopPropagation()}><ArrowUpRight size={12} className="text-gray-600 hover:text-white" /></Link>}
                                                    </div>

                                                    {/* Timeline Columns */}
                                                    <div className="col-span-9 grid grid-cols-12 relative h-12 items-center">
                                                        {/* Background Grid Lines */}
                                                        {MONTHS.map((_, i) => (
                                                            <div key={i} className="absolute top-0 bottom-0 border-r border-white/5 w-px h-full" style={{ left: `${(i / 12) * 100}%` }}></div>
                                                        ))}

                                                        {/* Bar */}
                                                        <div
                                                            className={`absolute h-6 rounded flex items-center px-2 text-[10px] font-bold text-white/90 shadow-lg ${lab.status === 'active' ? 'bg-green-500/20 border border-green-500/50' :
                                                                lab.status === 'preview' ? 'bg-yellow-500/20 border border-yellow-500/50' :
                                                                    'bg-blue-500/20 border border-blue-500/50'
                                                                }`}
                                                            style={{
                                                                left: `${(lab.timeline.startMonth / 12) * 100}%`,
                                                                width: `${(lab.timeline.durationMonths / 12) * 100}%`,
                                                                marginLeft: '4px'
                                                            }}
                                                        >
                                                            {/* Progress Fill */}
                                                            <div className={`absolute top-0 bottom-0 left-0 bg-current opacity-20`} style={{ width: `${lab.timeline.progress}%` }}></div>
                                                            <span className="relative z-10 truncate">{lab.owner} • {lab.timeline.progress}%</span>
                                                        </div>
                                                    </div>

                                                    {/* Sub-Items (Expanded) */}
                                                    {expandedRows.includes(lab.id) && (
                                                        <div className="col-span-12 bg-black/40 border-t border-white/5 p-4 pl-12">
                                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                                <div className="p-3 bg-white/5 rounded border border-white/10">
                                                                    <div className="text-xs text-gray-500 uppercase font-bold mb-2">Description</div>
                                                                    <p className="text-sm text-gray-300">{lab.desc}</p>
                                                                </div>
                                                                <div className="p-3 bg-white/5 rounded border border-white/10">
                                                                    <div className="text-xs text-gray-500 uppercase font-bold mb-2">Metrics</div>
                                                                    <div className="flex justify-between text-sm mb-1">
                                                                        <span>Ideas Logged</span>
                                                                        <span className="text-indigo-400">{lab.ideas}</span>
                                                                    </div>
                                                                    <div className="flex justify-between text-sm">
                                                                        <span>Agents</span>
                                                                        <span>{lab.agents.length}</span>
                                                                    </div>
                                                                </div>
                                                                <div className="p-3 bg-white/5 rounded border border-white/10">
                                                                    <div className="text-xs text-gray-500 uppercase font-bold mb-2">Actions</div>
                                                                    <button className="w-full py-1 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 text-xs rounded mb-2">
                                                                        + Add Milestone
                                                                    </button>
                                                                    {lab.href && <Link href={lab.href} className="block w-full text-center py-1 bg-white/5 hover:bg-white/10 text-white text-xs rounded">Go to Lab</Link>}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* GRID VIEW */}
                        {viewMode === 'grid' && (
                            <motion.div
                                key="grid"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="space-y-12"
                            >
                                {(filterCategory === 'All' ? categories : [filterCategory]).map(cat => {
                                    const labsInCategory = filteredLabs.filter(l => l.category === cat);
                                    if (labsInCategory.length === 0) return null;

                                    return (
                                        <div key={cat}>
                                            <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-gray-300">
                                                <span className="w-2 h-8 bg-indigo-500/50 rounded-full"></span>
                                                {cat}
                                                <span className="text-xs font-normal text-gray-500 bg-white/5 px-2 py-1 rounded-full">{labsInCategory.length}</span>
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {labsInCategory.map(lab => (
                                                    <LabCard key={lab.id} lab={lab} />
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </motion.div>
                        )}

                        {/* KANBAN VIEW */}
                        {viewMode === 'kanban' && (
                            <motion.div
                                key="kanban"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="grid grid-cols-1 md:grid-cols-3 gap-6 overflow-x-auto pb-4"
                            >
                                {statuses.map(status => (
                                    <div key={status} className="bg-white/5 rounded-xl border border-white/10 p-4 h-fit min-h-[400px]">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="font-bold uppercase tracking-widest text-sm text-gray-400">{status}</h3>
                                            <span className="px-2 py-1 bg-white/5 rounded text-xs">{filteredLabs.filter(l => l.status === status).length}</span>
                                        </div>
                                        <div className="space-y-4">
                                            {filteredLabs.filter(l => l.status === status).map(lab => (
                                                <LabCard key={lab.id} lab={lab} simple />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Staff Meeting Panel (1/3) */}
                <div className="w-full lg:w-[400px] xl:w-[450px] border-l border-white/10 h-[50vh] lg:h-full flex flex-col bg-[#0a0a0e] relative z-20 shadow-2xl">
                    <StaffMeetingPanel
                        labsData={labsData}
                        onUpdateLab={handleUpdateLab}
                        selectedLabId={selectedLabId}
                    />
                </div>
            </div>

            {/* Idea Modal */}
            <AnimatePresence>
                {isIdeaModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-[#1a1a20] border border-white/10 rounded-xl p-6 w-full max-w-md shadow-2xl relative"
                        >
                            <button onClick={() => setIsIdeaModalOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X size={20} /></button>
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <Lightbulb className="text-yellow-400" /> New Lab Initiative
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Project Name</label>
                                    <input
                                        type="text"
                                        value={newIdea.title}
                                        onChange={(e) => setNewIdea({ ...newIdea, title: e.target.value })}
                                        className="w-full bg-black/20 border border-white/10 rounded p-2 text-sm focus:border-indigo-500 outline-none"
                                        placeholder="e.g. Quantum UI"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
                                    <textarea
                                        value={newIdea.desc}
                                        onChange={(e) => setNewIdea({ ...newIdea, desc: e.target.value })}
                                        className="w-full bg-black/20 border border-white/10 rounded p-2 text-sm focus:border-indigo-500 outline-none h-24 resize-none"
                                        placeholder="What's the goal?"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category</label>
                                    <select
                                        value={newIdea.category}
                                        onChange={(e) => setNewIdea({ ...newIdea, category: e.target.value })}
                                        className="w-full bg-black/20 border border-white/10 rounded p-2 text-sm focus:border-indigo-500 outline-none"
                                    >
                                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Link to Page (Optional)</label>
                                    <input
                                        type="text"
                                        placeholder="/route-to-unfinished-page"
                                        className="w-full bg-black/20 border border-white/10 rounded p-2 text-sm focus:border-indigo-500 outline-none text-gray-400"
                                    />
                                    <p className="text-[10px] text-gray-600 mt-1">If this replaces an existing route, specify it here.</p>
                                </div>

                                <div className="pt-4 flex justify-end gap-2">
                                    <button onClick={() => setIsIdeaModalOpen(false)} className="px-4 py-2 rounded text-gray-400 hover:bg-white/5">Cancel</button>
                                    <button onClick={handleAddIdea} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-bold">Launch Initiative</button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

function LabCard({ lab, simple = false }: { lab: Lab, simple?: boolean }) {
    return (
        <motion.div
            layout
            className="glass-card group relative hover:-translate-y-1 transition-transform"
        >
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-white/5 rounded-xl text-3xl group-hover:scale-110 transition-transform">
                    {lab.icon}
                </div>
                <div className="flex items-center gap-2">
                    {/* Agent Badges */}
                    <div className="flex -space-x-2">
                        {lab.agents.map((agent, i) => (
                            <div key={i} className={`w-6 h-6 rounded-full border border-black flex items-center justify-center text-[10px] text-white font-bold uppercase ${AGENT_COLORS[agent] || 'bg-gray-500'}`} title={agent}>
                                {agent[0]}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mb-4">
                <h3 className="font-bold text-lg text-white group-hover:text-indigo-400 transition-colors flex items-center gap-2">
                    {lab.name}
                    {lab.href && <ArrowUpRight size={14} className="opacity-50" />}
                </h3>
                {!simple && <p className="text-sm text-gray-400 line-clamp-2 mt-1">{lab.desc}</p>}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="flex gap-3">
                    <button className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-indigo-400 transition-colors">
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
                    <Link href={lab.href} className="p-2 hover:bg-white/10 rounded-lg text-indigo-400">
                        <ArrowUpRight size={18} />
                    </Link>
                ) : (
                    <button className="p-2 hover:bg-white/10 rounded-lg text-gray-600 cursor-not-allowed">
                        <MoreHorizontal size={18} />
                    </button>
                )}
            </div>

            {/* Inbox Quick Drop (Hover Overlay) */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-6 text-center pointer-events-none group-hover:pointer-events-auto">
                <button className="mb-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-bold flex items-center gap-2">
                    <Plus size={16} /> Add Quick Idea
                </button>
                {lab.href && (
                    <Link href={lab.href} className="text-sm text-gray-300 hover:text-white underline">
                        Launch Lab
                    </Link>
                )}
            </div>
        </motion.div>
    );
}
