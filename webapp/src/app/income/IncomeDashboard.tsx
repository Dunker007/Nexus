'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import {
    Zap, Target, BookOpen,
    CheckCircle, Circle, AlertCircle,
    Music, Video, ShoppingBag, Mic, Printer, TrendingUp
} from 'lucide-react';
import { LUXRIG_BRIDGE_URL, bridgeFetch } from '@/lib/utils';
import RevenueAgentWidget from '@/components/RevenueAgentWidget';
import RevenueTracker from '@/components/RevenueTracker';
import PageBackground from '@/components/PageBackground';
import { STREAM_TEMPLATES_DATA } from '@/lib/income-templates';

// Stub functions to replace server actions (will use bridge API later)
const toggleStreamStep = async (streamId: string, stepIndex: number) => { console.log('toggleStreamStep', streamId, stepIndex); };
const activateStream = async (streamId: string) => { console.log('activateStream', streamId); };
const saveContentProject = async (streamId: string, data: any) => { console.log('saveContentProject', streamId, data); return { path: '/stub/path' }; };

const IconMap: any = { Music, Video, ShoppingBag, Mic, Printer, Zap, TrendingUp };

interface IncomeDashboardProps {
    dbStreams: any[];
}

export default function IncomeDashboard({ dbStreams }: IncomeDashboardProps) {
    const [selectedStreamId, setSelectedStreamId] = useState<string | null>(null);
    const [generatorData, setGeneratorData] = useState<any>(null);
    const [nicheInput, setNicheInput] = useState('');
    const [isGeneratingAsset, setIsGeneratingAsset] = useState(false);
    const [saving, setSaving] = useState(false);

    // Merge DB data with Templates
    const streams = STREAM_TEMPLATES_DATA.map(t => {
        const db = dbStreams.find(s => s.templateId === t.id);
        if (!db) return null; // Should ideally be seeded

        let steps = t.steps;
        try {
            steps = typeof db.steps === 'string' ? JSON.parse(db.steps) : db.steps;
        } catch (e) { console.error("Error parsing steps", e); }

        return {
            ...t,
            ...db, // Overwrite status, id, etc from DB
            steps,
            icon: IconMap[t.iconName] || Zap
        };
    }).filter(s => s !== null) as any[];

    // Stats
    const activeStreams = streams.filter(s => s.status === 'active');
    const stats = {
        monthly: activeStreams.reduce((acc, s) => acc + (s.currentMonthly || 0), 0),
        active: activeStreams.length,
        projected: 450 // Hardcoded for now, or calc
    };

    const selectedStream = streams.find(s => s.id === selectedStreamId) || streams[0];

    // Actions
    const handleToggleStep = async (streamId: string, stepIndex: number) => {
        await toggleStreamStep(streamId, stepIndex);
    };

    const handleActivateStream = async (streamId: string) => {
        await activateStream(streamId);
    };

    const handleSaveProject = async () => {
        if (!generatorData) return;
        setSaving(true);
        try {
            const res = await saveContentProject('default', { niche: nicheInput, ...generatorData });
            alert(`Project created at: ${res.path}`);
        } catch (e) {
            console.error(e);
            alert('Failed to save project');
        } finally {
            setSaving(false);
        }
    };

    // --- Generator Logic ---
    // --- Generator Logic ---
    const generateAssets = async (niche: string, type: 'pod' | 'youtube') => {
        setIsGeneratingAsset(true);
        let systemPrompt = '';
        let userPrompt = '';

        if (type === 'pod') {
            systemPrompt = 'You are a Print-on-Demand expert. return ONLY JSON. Format: { "titles": ["string"], "description": "string", "tags": "string (comma separated)", "prompts": ["string"] }';
            userPrompt = `Generate 5 witty/punny t-shirt titles, a compelling description, 20 high-traffic separate tags, and 3 Midjourney image prompts for the niche: "${niche}".`;
        } else if (type === 'youtube') {
            systemPrompt = 'You are a YouTube Growth expert. return ONLY JSON. Format: { "titles": ["string"], "description": "string", "tags": "string (comma separated)", "thumbnail_prompts": ["string"] }';
            userPrompt = `Generate 5 viral clickbait titles, a description (with chapters/timestamps placeholder), 20 high-volume tags, and 3 thumbnail art prompts for a music video in the genre/mood: "${niche}".`;
        }

        try {
            const response = await bridgeFetch('/llm/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userPrompt }
                    ]
                })
            });
            const data = await response.json();
            let cleanJson = data.content.replace(/```json/g, '').replace(/```/g, '').trim();
            setGeneratorData({ type, ...JSON.parse(cleanJson) });
        } catch (error) {
            console.error('Generation failed:', error);
            alert('AI Generation failed. Check LuxRig connection.');
        } finally {
            setIsGeneratingAsset(false);
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden text-white">
            <PageBackground color="green" />

            {/* Decorative Elements */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                {/* Floating orbs */}
                <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-green-500/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/3 left-1/4 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" style={{ animationDelay: '1s' }} />
                <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-cyan-500/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }} />

                {/* Connection lines */}
                <svg className="absolute inset-0 w-full h-full opacity-5">
                    <defs>
                        <linearGradient id="incomeLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#22c55e" stopOpacity="0" />
                            <stop offset="50%" stopColor="#10b981" stopOpacity="0.6" />
                            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    <path d="M0,35% Q25%,25% 50%,40% T100%,30%" stroke="url(#incomeLineGradient)" strokeWidth="1" fill="none" />
                    <path d="M0,65% Q40%,70% 70%,55% T100%,65%" stroke="url(#incomeLineGradient)" strokeWidth="1" fill="none" />
                </svg>
            </div>

            {/* Main Content */}
            <div className="container-main py-8 relative z-10">
                {/* Enhanced Header */}
                <motion.div
                    className="flex items-center justify-between mb-8"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="absolute inset-0 bg-green-500 rounded-xl blur-xl opacity-30" />
                            <div className="relative p-3 bg-gradient-to-br from-green-500/30 to-emerald-500/30 rounded-xl border border-white/10">
                                <Zap className="text-green-400" size={28} />
                            </div>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">
                                Income<span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">Lab</span>
                            </h1>
                            <p className="text-gray-500 text-sm">Autonomous Revenue Generation & Guided Workflows</p>
                        </div>
                    </div>

                    {/* Live Stats Pills */}
                    <div className="hidden md:flex items-center gap-3">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-lg">
                            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                            <span className="text-xs text-green-400">${stats.monthly}/mo</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                            <span className="text-xs text-cyan-400">{stats.active} Active</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                            <Target size={12} className="text-purple-400" />
                            <span className="text-xs text-purple-400">$1K Goal</span>
                        </div>
                    </div>
                </motion.div>

                {/* Dashboard Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4">
                        <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">Monthly Income</div>
                        <div className="text-2xl font-bold text-green-400">${stats.monthly}</div>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-4">
                        <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">Active Streams</div>
                        <div className="text-2xl font-bold text-white">{stats.active}</div>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-4">
                        <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">Projected (Mo)</div>
                        <div className="text-2xl font-bold text-cyan-400">${stats.projected}</div>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                            <Target size={20} className="text-purple-400" />
                        </div>
                        <div className="text-sm">
                            <div className="font-bold">Next Goal</div>
                            <div className="text-gray-400">$1,000/mo</div>
                        </div>
                    </motion.div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left: Revenue Command & Agent */}
                    <div className="lg:col-span-1 space-y-6">
                        <RevenueTracker
                            monthly={stats.monthly}
                            projected={stats.projected}
                            activeStreams={stats.active}
                        />

                        <RevenueAgentWidget />

                        <div className="glass-card p-6">
                            <h3 className="font-bold mb-4 flex items-center gap-2">
                                <AlertCircle size={18} className="text-yellow-400" />
                                Anti-Scam Protocols
                            </h3>
                            <ul className="space-y-3 text-sm text-gray-400">
                                <li className="flex gap-2">
                                    <CheckCircle size={16} className="text-green-500 shrink-0" />
                                    No "Get Rich Quick" schemes
                                </li>
                                <li className="flex gap-2">
                                    <CheckCircle size={16} className="text-green-500 shrink-0" />
                                    No Upfront Fees &gt; $50
                                </li>
                                <li className="flex gap-2">
                                    <CheckCircle size={16} className="text-green-500 shrink-0" />
                                    Verified Platforms Only
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Right: Guided Workflows */}
                    <div className="lg:col-span-2">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <BookOpen className="text-cyan-400" size={24} />
                                Active Blueprints
                            </h2>
                        </div>

                        <div className="space-y-6">
                            {streams.map((stream) => {
                                const isSelected = selectedStreamId === stream.id || (!selectedStreamId && stream.id === streams[0]?.id);
                                const progress = Math.round((stream.steps.filter((s: any) => s.completed).length / stream.steps.length) * 100);

                                return (
                                    <motion.div
                                        key={stream.id}
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        onClick={() => setSelectedStreamId(stream.id)}
                                        className={`glass-card relative overflow-hidden transition-all cursor-pointer group ${isSelected ? 'ring-2 ring-cyan-500/50 bg-white/5' : 'hover:bg-white/5'
                                            }`}
                                    >
                                        {/* Hover Glow Effect */}
                                        <div className={`absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}></div>

                                        {/* Status Strip */}
                                        <div className={`absolute left-0 top-0 bottom-0 w-1 z-20 ${stream.status === 'active' ? 'bg-green-500' : 'bg-gray-700'
                                            }`} />

                                        <div className="p-6 pl-8">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stream.status === 'active' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-gray-800 text-gray-500'
                                                        }`}>
                                                        <stream.icon size={24} />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-lg">{stream.title}</h3>
                                                        <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                                                            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/5">{stream.category}</span>
                                                            <span>•</span>
                                                            <span className="text-green-400">{stream.potential}</span>
                                                            <span>•</span>
                                                            <span>{stream.difficulty}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {stream.status !== 'active' ? (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleActivateStream(stream.id);
                                                        }}
                                                        className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors"
                                                    >
                                                        Start Project
                                                    </button>
                                                ) : (
                                                    <div className="text-right">
                                                        <div className="text-2xl font-bold text-cyan-400">{progress}%</div>
                                                        <div className="text-xs text-gray-500">Completed</div>
                                                    </div>
                                                )}
                                            </div>

                                            <p className="text-gray-400 text-sm mb-6 pl-16 max-w-2xl">
                                                {stream.description}
                                            </p>

                                            {/* ACTIVE TOOL AREA: Generators */}
                                            <AnimatePresence>
                                                {isSelected && stream.status === 'active' && (stream.templateId === 'pod-farm' || stream.templateId === 'youtube-music') && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="pl-16 mb-8 pr-4"
                                                    >
                                                        <div className="bg-[#0a0a0f] border border-cyan-500/30 rounded-xl p-5 relative overflow-hidden">
                                                            <div className="absolute top-0 right-0 p-2 opacity-10">
                                                                <Zap size={100} />
                                                            </div>
                                                            <h4 className="text-cyan-400 font-bold mb-3 flex items-center gap-2">
                                                                <Zap size={16} />
                                                                {stream.templateId === 'pod-farm' ? 'Merch Asset Generator' : 'YouTube Pack Generator'}
                                                            </h4>
                                                            <p className="text-xs text-gray-400 mb-4">
                                                                {stream.templateId === 'pod-farm'
                                                                    ? "Stop thinking. Let the AI generate your titles, tags, and descriptions for Redbubble."
                                                                    : "Generate optimized titles, descriptions, and thumbnail prompts for your music video."}
                                                            </p>

                                                            {!generatorData ? (
                                                                <div className="flex gap-2 relative z-10">
                                                                    <input
                                                                        type="text"
                                                                        value={nicheInput}
                                                                        onChange={(e) => setNicheInput(e.target.value)}
                                                                        placeholder={stream.templateId === 'pod-farm' ? "Enter a niche (e.g. 'Introverted Accountants')" : "Enter genre/mood (e.g. 'Dark Cyberpunk Lofi')"}
                                                                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:border-cyan-500 outline-none"
                                                                    />
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            if (nicheInput) generateAssets(nicheInput, stream.templateId === 'pod-farm' ? 'pod' : 'youtube');
                                                                        }}
                                                                        disabled={isGeneratingAsset}
                                                                        className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-2 min-w-[140px] justify-center"
                                                                    >
                                                                        {isGeneratingAsset ? (
                                                                            <span className="animate-pulse">Dreaming...</span>
                                                                        ) : (
                                                                            <>
                                                                                <Zap size={14} /> Generate
                                                                            </>
                                                                        )}
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 relative z-10">
                                                                    <div>
                                                                        <div className="text-xs font-bold text-gray-500 uppercase mb-1">Titles</div>
                                                                        <div className="flex flex-wrap gap-2">
                                                                            {generatorData.titles?.map((t: string, i: number) => (
                                                                                <button key={i} onClick={() => navigator.clipboard.writeText(t)} className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-xs text-cyan-300 transition-colors text-left">
                                                                                    {t}
                                                                                </button>
                                                                            ))}
                                                                        </div>
                                                                    </div>

                                                                    {/* Thumbnail Prompts for Youtube */}
                                                                    {generatorData.type === 'youtube' && (
                                                                        <div>
                                                                            <div className="text-xs font-bold text-gray-500 uppercase mb-1">Thumbnail Ideas</div>
                                                                            <div className="space-y-2">
                                                                                {generatorData.thumbnail_prompts?.map((p: string, i: number) => (
                                                                                    <div key={i} className="text-xs text-gray-400 bg-black/30 p-2 rounded border border-white/5">{p}</div>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                    <div>
                                                                        <div className="text-xs font-bold text-gray-500 uppercase mb-1">Optimized Tags (Copy All)</div>
                                                                        <div
                                                                            onClick={() => navigator.clipboard.writeText(generatorData.tags)}
                                                                            className="p-3 bg-black/30 border border-white/10 rounded text-xs text-gray-400 font-mono cursor-pointer hover:border-cyan-500/50 transition-colors break-words"
                                                                        >
                                                                            {generatorData.tags}
                                                                        </div>
                                                                    </div>

                                                                    <div className="flex items-center gap-4 pt-4 border-t border-white/10">
                                                                        <button
                                                                            onClick={(e) => { e.stopPropagation(); handleSaveProject(); }}
                                                                            disabled={saving}
                                                                            className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
                                                                        >
                                                                            {saving ? 'Saving...' : '💾 Save Project to Disk'}
                                                                        </button>
                                                                        <button onClick={(e) => { e.stopPropagation(); setGeneratorData(null); }} className="text-xs text-gray-500 hover:text-white underline">
                                                                            Reset / New Niche
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>

                                            {/* Expanded Steps */}
                                            <AnimatePresence>
                                                {isSelected && stream.status === 'active' && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="pl-16 border-t border-white/5 pt-4"
                                                    >
                                                        {stream.howItWorks && (
                                                            <div className="mb-6 p-4 bg-cyan-900/10 border border-cyan-500/20 rounded-lg">
                                                                <h4 className="text-xs font-bold text-cyan-400 mb-2 uppercase tracking-wider">How This Makes Money</h4>
                                                                <p className="text-sm text-gray-300 leading-relaxed">
                                                                    {stream.howItWorks}
                                                                </p>
                                                            </div>
                                                        )}

                                                        <h4 className="text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider">Launch Checklist</h4>
                                                        <div className="space-y-3">
                                                            {stream.steps.map((step: any, idx: number) => (
                                                                <div
                                                                    key={idx}
                                                                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors cursor-pointer ${step.completed ? 'bg-green-500/10 text-green-200' : 'bg-black/20 text-gray-400 hover:bg-black/40'
                                                                        }`}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleToggleStep(stream.id, idx);
                                                                    }}
                                                                >
                                                                    {step.completed ? (
                                                                        <CheckCircle size={20} className="text-green-500 shrink-0" />
                                                                    ) : (
                                                                        <Circle size={20} className="text-gray-600 shrink-0" />
                                                                    )}
                                                                    <span className={step.completed ? 'line-through opacity-70' : ''}>
                                                                        {step.text}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>

                                                        {progress === 100 && (
                                                            <motion.div
                                                                initial={{ opacity: 0, y: 10 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                className="mt-6 p-4 bg-green-500/20 border border-green-500/30 rounded-xl flex items-center justify-between"
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-black font-bold">✓</div>
                                                                    <div>
                                                                        <div className="font-bold text-green-400">Stream Launched!</div>
                                                                        <div className="text-sm text-green-200/70">Keep consistent and monitor results.</div>
                                                                    </div>
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div >
                </div >
            </div >
        </div>
    );
}
