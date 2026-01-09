'use client';

import { motion } from 'framer-motion';
import { Hexagon, Globe, Monitor, Shield, Zap, Terminal, Cpu } from 'lucide-react';
import PageBackground from '@/components/PageBackground';

// --- Data ---
const TEAM = [
    {
        id: 'grok',
        name: 'Grok',
        role: 'Browser Navigator',
        type: 'browser',
        icon: Globe,
        description: 'Deep research & live data.',
        capabilities: ['Web Search', 'Live Data'],
        status: 'Standby',
        color: 'amber'
    },
    {
        id: 'lux-rig',
        name: 'Lux [rig]',
        role: 'Infrastructure Host',
        type: 'host',
        icon: Hexagon,
        description: 'Guardian of the physical hardware and OS.',
        capabilities: ['System Control', 'Automation', 'Files'],
        status: 'Online',
        color: 'cyan'
    },
    {
        id: 'nox',
        name: 'NOX',
        role: 'Structural Architect',
        type: 'architect',
        icon: Hexagon,
        description: 'The Shadow. Ensures structural integrity, logic, and state. "Incognito shines best in the dark."',
        capabilities: ['Logic', 'State', 'Handshakes'],
        status: 'Online',
        color: 'slate'
    },
    {
        id: 'lux-llm',
        name: 'Lux [llm]',
        role: 'Intelligence',
        type: 'brain',
        icon: Hexagon,
        description: 'Reasoning core and creative engine.',
        capabilities: ['Thinking', 'Planning', 'Code'],
        status: 'Active',
        color: 'cyan'
    },
    {
        id: 'claude',
        name: 'Claude Desktop',
        role: 'Desktop Commander',
        type: 'desktop',
        icon: Monitor,
        description: 'Strategic overseer.',
        capabilities: ['Planning', 'App Control'],
        status: 'Active',
        color: 'purple'
    },
    {
        id: 'lux-browser',
        name: 'Lux [browser]',
        role: 'Navigator',
        type: 'browser',
        icon: Hexagon,
        description: 'Web interface and navigation specialist.',
        capabilities: ['Web Search', 'Data Extraction'],
        status: 'Standby',
        color: 'cyan'
    }
];

export default function TeamPage() {
    return (
        <div className="min-h-screen pt-24 pb-20 px-6">
            <PageBackground color="cyan" />

            <div className="max-w-6xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-10 text-center"
                >
                    <h1 className="text-3xl md:text-5xl font-bold mb-3">
                        The <span className="text-gradient-cyan">Dev Planners</span>
                    </h1>
                    <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                        High-level intelligence units driving the Nexus automation agenda.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {TEAM.map((member, index) => (
                        <motion.div
                            key={member.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className={`relative group p-1 rounded-xl bg-gradient-to-b from-${member.color}-500/20 to-transparent hover:from-${member.color}-500/40 transition-all duration-300`}
                        >
                            <div className="absolute inset-0 bg-white/5 rounded-xl backdrop-blur-sm -z-10" />

                            {/* Card Content */}
                            <div className="h-full p-4 flex flex-col items-center text-center bg-black/40 rounded-lg overflow-hidden relative">
                                {/* Status Dot - Smaller */}
                                <div className={`absolute top-2 right-2 w-2 h-2 rounded-full ${member.status === 'Online' || member.status === 'Active'
                                    ? `bg-${member.color}-400 animate-pulse`
                                    : 'bg-gray-400'
                                    }`} />

                                {/* Icon - Smaller */}
                                <div className={`w-12 h-12 rounded-xl bg-${member.color}-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 border border-${member.color}-500/20`}>
                                    <member.icon size={24} className={`text-${member.color}-400`} />
                                </div>

                                {/* Name & Role */}
                                <h2 className="text-base font-bold mb-0.5 leading-tight">{member.name}</h2>
                                <p className={`text-[10px] font-medium text-${member.color}-400 mb-2 uppercase tracking-wide`}>
                                    {member.role}
                                </p>

                                {/* Description - Truncated/Smaller */}
                                <p className="text-gray-400 text-xs leading-snug mb-3 line-clamp-3">
                                    {member.description}
                                </p>

                                {/* Capabilities */}
                                <div className="mt-auto flex flex-wrap justify-center gap-1">
                                    {member.capabilities.slice(0, 2).map(cap => (
                                        <span key={cap} className="px-1.5 py-0.5 text-[10px] rounded bg-white/5 border border-white/5 text-gray-300">
                                            {cap}
                                        </span>
                                    ))}
                                </div>

                                {/* Hover Glow */}
                                <div className={`absolute inset-0 bg-${member.color}-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`} />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
