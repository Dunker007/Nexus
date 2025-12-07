'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { LUXRIG_BRIDGE_URL } from '@/lib/utils';

interface Agent {
    name: string;
    description: string;
    status: string;
}

interface Result {
    id: number;
    agent: string;
    task: any;
    result: any;
    timestamp: Date;
}

export default function AIStudioPage() {
    const [agents, setAgents] = useState<Agent[]>([]);
    const [systemStatus, setSystemStatus] = useState<any>(null);
    const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
    const [taskInput, setTaskInput] = useState('');
    const [executing, setExecuting] = useState(false);
    const [results, setResults] = useState<Result[]>([]);

    useEffect(() => {
        loadAgents();
        loadSystemStatus();
        const interval = setInterval(loadSystemStatus, 5000);
        return () => clearInterval(interval);
    }, []);

    async function loadAgents() {
        try {
            const response = await fetch(`${LUXRIG_BRIDGE_URL}/agents`);
            const data = await response.json();
            setAgents(data.agents || []);
        } catch (error) {
            console.error('Failed to load agents:', error);
        }
    }

    async function loadSystemStatus() {
        try {
            const response = await fetch(`${LUXRIG_BRIDGE_URL}/status`);
            const data = await response.json();
            setSystemStatus(data);
        } catch (error) {
            console.error('Failed to load status:', error);
        }
    }

    async function executeTask(agentType: string, task: any) {
        setExecuting(true);
        try {
            const response = await fetch(`${LUXRIG_BRIDGE_URL}/agents/execute`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ agentType, task })
            });
            const data = await response.json();

            setResults(prev => [{
                id: Date.now(),
                agent: data.agent.name,
                task,
                result: data.result,
                timestamp: new Date()
            }, ...prev]);

            setTaskInput('');
            loadAgents(); // Refresh agent list
        } catch (error) {
            console.error('Task execution failed:', error);
        } finally {
            setExecuting(false);
        }
    }

    const quickActions = [
        {
            name: 'Code Review',
            icon: '🔍',
            agent: 'code',
            task: { action: 'review', code: 'sample code', language: 'javascript' },
            description: 'Review code for issues and best practices'
        },
        {
            name: 'Security Scan',
            icon: '🛡️',
            agent: 'code',
            task: { action: 'security-scan', code: 'sample code', language: 'javascript' },
            description: 'Scan code for security vulnerabilities'
        },
        {
            name: 'Research Task',
            icon: '🔬',
            agent: 'research',
            task: { query: 'AI trends 2026', sources: ['web'] },
            description: 'Gather information from multiple sources'
        }
    ];

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
                        <h1 className="text-5xl md:text-6xl font-bold mb-4">
                            AI <span className="text-gradient">Studio</span>
                        </h1>
                        <p className="text-xl text-gray-400">
                            Autonomous Agent Orchestration Platform
                        </p>
                    </motion.div>
                </div>
            </section>

            <section className="container-main pb-16">
                {/* System Overview */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <motion.div
                        className="glass-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                            <h3 className="font-bold">System Status</h3>
                        </div>
                        <p className="text-2xl font-bold text-green-400">Operational</p>
                        <p className="text-sm text-gray-400 mt-1">
                            {systemStatus?.services?.lmstudio?.modelCount || 0} LM Studio models • {' '}
                            {systemStatus?.services?.ollama?.modelCount || 0} Ollama models
                        </p>
                    </motion.div>

                    <motion.div
                        className="glass-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">🤖</span>
                            <h3 className="font-bold">Active Agents</h3>
                        </div>
                        <p className="text-2xl font-bold text-cyan-400">{agents.length}</p>
                        <p className="text-sm text-gray-400 mt-1">
                            {agents.filter(a => a.status === 'running').length} running
                        </p>
                    </motion.div>

                    <motion.div
                        className="glass-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">⚡</span>
                            <h3 className="font-bold">Tasks Completed</h3>
                        </div>
                        <p className="text-2xl font-bold text-purple-400">{results.length}</p>
                        <p className="text-sm text-gray-400 mt-1">
                            This session
                        </p>
                    </motion.div>
                </div>

                {/* Quick Actions */}
                <motion.div
                    className="glass-card mb-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <h2 className="text-xl font-bold mb-4">⚡ Quick Actions</h2>
                    <div className="grid md:grid-cols-3 gap-4">
                        {quickActions.map((action, i) => (
                            <button
                                key={i}
                                onClick={() => executeTask(action.agent, action.task)}
                                disabled={executing}
                                className="p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors text-left"
                            >
                                <div className="text-3xl mb-2">{action.icon}</div>
                                <h3 className="font-bold mb-1">{action.name}</h3>
                                <p className="text-sm text-gray-400">{action.description}</p>
                            </button>
                        ))}
                    </div>
                </motion.div>

                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Agent Control */}
                    <motion.div
                        className="glass-card"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h2 className="text-xl font-bold mb-4">🎮 Agent Control</h2>

                        {/* Agent Selection */}
                        <div className="mb-4">
                            <label className="block text-sm text-gray-400 mb-2">Select Agent</label>
                            <select
                                value={selectedAgent || ''}
                                onChange={(e) => setSelectedAgent(e.target.value)}
                                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2"
                            >
                                <option value="">Choose an agent...</option>
                                <option value="research">🔬 Research Agent</option>
                                <option value="code">💻 Code Agent</option>
                                <option value="workflow">🔄 Workflow Agent</option>
                            </select>
                        </div>

                        {/* Task Input */}
                        <div className="mb-4">
                            <label className="block text-sm text-gray-400 mb-2">Task Description</label>
                            <textarea
                                value={taskInput}
                                onChange={(e) => setTaskInput(e.target.value)}
                                placeholder="Describe the task you want the agent to perform..."
                                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 min-h-[100px]"
                            />
                        </div>

                        <button
                            onClick={() => {
                                if (selectedAgent && taskInput) {
                                    executeTask(selectedAgent, { prompt: taskInput });
                                }
                            }}
                            disabled={!selectedAgent || !taskInput || executing}
                            className="btn-primary w-full"
                        >
                            {executing ? 'Executing...' : 'Execute Task'}
                        </button>

                        {/* Active Agents List */}
                        <div className="mt-6 pt-6 border-t border-gray-700">
                            <h3 className="font-bold mb-3">Active Agents</h3>
                            {agents.length > 0 ? (
                                <div className="space-y-2">
                                    {agents.map((agent, i) => (
                                        <div key={i} className="p-3 bg-white/5 rounded-lg">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium">{agent.name}</p>
                                                    <p className="text-xs text-gray-400">{agent.description}</p>
                                                </div>
                                                <span className={`px-2 py-1 rounded text-xs ${agent.status === 'running' ? 'bg-green-500/20 text-green-400' :
                                                    agent.status === 'idle' ? 'bg-gray-500/20 text-gray-400' :
                                                        'bg-yellow-500/20 text-yellow-400'
                                                    }`}>
                                                    {agent.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-400 text-sm">No active agents. Execute a task to create one.</p>
                            )}
                        </div>
                    </motion.div>

                    {/* Results Feed */}
                    <motion.div
                        className="glass-card"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h2 className="text-xl font-bold mb-4">📊 Results Feed</h2>
                        <div className="space-y-3 max-h-[600px] overflow-y-auto">
                            {results.length > 0 ? (
                                results.map((result) => (
                                    <div key={result.id} className="p-4 bg-white/5 rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-bold text-cyan-400">{result.agent}</span>
                                            <span className="text-xs text-gray-400">
                                                {result.timestamp.toLocaleTimeString()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-300 mb-2">
                                            Task: {JSON.stringify(result.task).substring(0, 100)}...
                                        </p>
                                        <div className="p-2 bg-black/30 rounded text-xs font-mono">
                                            {JSON.stringify(result.result, null, 2).substring(0, 200)}...
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12">
                                    <p className="text-gray-400 mb-4">No results yet</p>
                                    <p className="text-sm text-gray-500">Execute a task to see results here</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>

                {/* Features Grid */}
                <motion.div
                    className="mt-8 grid md:grid-cols-3 gap-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="glass-card">
                        <div className="text-3xl mb-3">🔐</div>
                        <h3 className="font-bold mb-2">Security First</h3>
                        <p className="text-sm text-gray-400">
                            Built-in code scanning, vulnerability detection, and audit logging
                        </p>
                    </div>

                    <div className="glass-card">
                        <div className="text-3xl mb-3">🔄</div>
                        <h3 className="font-bold mb-2">Self-Healing</h3>
                        <p className="text-sm text-gray-400">
                            Automatic error recovery and workflow retry mechanisms
                        </p>
                    </div>

                    <div className="glass-card">
                        <div className="text-3xl mb-3">📈</div>
                        <h3 className="font-bold mb-2">Production Ready</h3>
                        <p className="text-sm text-gray-400">
                            Enterprise-grade monitoring, logging, and performance tracking
                        </p>
                    </div>
                </motion.div>
            </section>

            {/* Back link */}
            <div className="container-main pb-8">
                <Link href="/" className="text-gray-400 hover:text-cyan-400 transition-colors">
                    ← Back to Dashboard
                </Link>
            </div>
        </div>
    );
}
