'use client';

import { motion } from 'framer-motion';
import { Shield, Users, Activity, Lock, AlertTriangle } from 'lucide-react';

export default function GovernanceDashboard() {
    return (
        <div className="min-h-screen pt-24 px-4 container-main">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <div className="flex items-center gap-3 mb-2">
                    <Shield size={32} className="text-purple-400" />
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                        Governance & Strategy
                    </h1>
                </div>
                <p className="text-gray-400">Enterprise-wide oversight, policy enforcement, and AI resource allocation.</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="glass-card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-200">Safety Score</h3>
                        <Activity className="text-green-400" />
                    </div>
                    <div className="text-4xl font-bold text-white mb-2">98/100</div>
                    <div className="text-sm text-green-400 flex items-center gap-1">
                        <Shield size={12} /> All systems nominal
                    </div>
                </div>

                <div className="glass-card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-200">Active Agents</h3>
                        <Users className="text-blue-400" />
                    </div>
                    <div className="text-4xl font-bold text-white mb-2">12</div>
                    <div className="text-sm text-blue-400">Across 4 departments</div>
                </div>

                <div className="glass-card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-200">Policy Violations</h3>
                        <AlertTriangle className="text-yellow-400" />
                    </div>
                    <div className="text-4xl font-bold text-white mb-2">0</div>
                    <div className="text-sm text-gray-500">Last 24 hours</div>
                </div>
            </div>

            <div className="glass-card p-6">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Lock size={20} className="text-gray-400" />
                    Access Control & Roles
                </h2>

                <div className="space-y-4">
                    {[
                        { role: 'System Architect', access: 'Full Root Access', color: 'text-red-400', users: 1 },
                        { role: 'Available Agent', access: 'Task Execution', color: 'text-green-400', users: 8 },
                        { role: 'Audit Logger', access: 'Read-Only', color: 'text-yellow-400', users: 2 },
                    ].map((role) => (
                        <div key={role.role} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/5">
                            <div>
                                <div className="font-bold text-white">{role.role}</div>
                                <div className={`text-sm ${role.color}`}>{role.access}</div>
                            </div>
                            <div className="px-3 py-1 bg-white/10 rounded text-sm text-gray-300">
                                {role.users} Active IDs
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
