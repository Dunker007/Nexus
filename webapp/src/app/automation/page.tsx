'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Plus,
    Play,
    Trash2,
    Clock,
    Terminal,
    MessageSquare,
    Settings,
    ChevronRight,
    Workflow
} from 'lucide-react';
import PageBackground from '@/components/PageBackground';

// Types
type StepType = 'agent' | 'delay' | 'log' | 'http';

interface WorkflowStep {
    id: string;
    type: StepType;
    label: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    params: Record<string, any>;
}

interface AutomationWorkflow {
    id: string;
    name: string;
    description: string;
    steps: WorkflowStep[];
    lastRun?: string;
    status: 'idle' | 'running' | 'completed' | 'failed';
}

const TEMPLATES: AutomationWorkflow[] = [
    {
        id: 'template-1',
        name: 'Morning Briefing',
        description: 'Gather news and summary for the day',
        status: 'idle',
        steps: [
            { id: '1', type: 'agent', label: 'Fetch News', params: { agent: 'newsician', task: 'Get top 5 headlines' } },
            { id: '2', type: 'agent', label: 'Summarize', params: { agent: 'lux', task: 'Summarize these headlines' } },
            { id: '3', type: 'log', label: 'Log Summary', params: { message: 'Briefing complete' } }
        ]
    }
];

export default function AutomationPage() {
    const [workflows, setWorkflows] = useState<AutomationWorkflow[]>([]);
    const [selectedWorkflow, setSelectedWorkflow] = useState<AutomationWorkflow | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [executionLog, setExecutionLog] = useState<string[]>([]);

    useEffect(() => {
        // Load from local storage or templates
        const saved = localStorage.getItem('nexus_workflows');
        if (saved) {
            setWorkflows(JSON.parse(saved));
        } else {
            setWorkflows(TEMPLATES);
        }
    }, []);

    const saveWorkflows = (updated: AutomationWorkflow[]) => {
        setWorkflows(updated);
        localStorage.setItem('nexus_workflows', JSON.stringify(updated));
    };

    const handleCreate = () => {
        const newWorkflow: AutomationWorkflow = {
            id: Date.now().toString(),
            name: 'New Workflow',
            description: 'Describe your automation...',
            status: 'idle',
            steps: []
        };
        const updated = [...workflows, newWorkflow];
        saveWorkflows(updated);
        setSelectedWorkflow(newWorkflow);
        setIsEditing(true);
    };

    const handleDelete = (id: string) => {
        const updated = workflows.filter(w => w.id !== id);
        saveWorkflows(updated);
        if (selectedWorkflow?.id === id) {
            setSelectedWorkflow(null);
            setIsEditing(false);
        }
    };

    const updateSelected = (updates: Partial<AutomationWorkflow>) => {
        if (!selectedWorkflow) return;
        const updatedWorkflow = { ...selectedWorkflow, ...updates };
        setSelectedWorkflow(updatedWorkflow);
        const allUpdated = workflows.map(w => w.id === selectedWorkflow.id ? updatedWorkflow : w);
        saveWorkflows(allUpdated);
    };

    const addStep = (type: StepType) => {
        if (!selectedWorkflow) return;
        const step: WorkflowStep = {
            id: Date.now().toString(),
            type,
            label: type === 'agent' ? 'Execute Agent' :
                type === 'delay' ? 'Wait' :
                    type === 'log' ? 'Log Message' : 'HTTP Request',
            params: type === 'delay' ? { ms: 1000 } : {}
        };
        updateSelected({ steps: [...selectedWorkflow.steps, step] });
    };

    const removeStep = (stepId: string) => {
        if (!selectedWorkflow) return;
        updateSelected({ steps: selectedWorkflow.steps.filter(s => s.id !== stepId) });
    };

    const runWorkflow = async () => {
        if (!selectedWorkflow) return;
        setExecutionLog([]);
        updateSelected({ status: 'running', lastRun: new Date().toISOString() });

        try {
            for (const step of selectedWorkflow.steps) {
                const stepMsg = `[${new Date().toLocaleTimeString()}] Running step: ${step.label}`;
                setExecutionLog(prev => [...prev, stepMsg]);

                if (step.type === 'agent') {
                    setExecutionLog(prev => [...prev, `> Invoking agent ${step.params.agent}...`]);
                    try {
                        const LUXRIG_BRIDGE_URL = 'http://localhost:3456';
                        const res = await fetch(`${LUXRIG_BRIDGE_URL}/agents/${step.params.agent}/task`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                task: {
                                    action: 'generate', // simplified default for demo
                                    type: 'task',
                                    prompt: step.params.task,
                                    ...step.params
                                }
                            })
                        });
                        const data = await res.json();

                        if (data.success) {
                            const resultSummary = JSON.stringify(data.result).slice(0, 100);
                            setExecutionLog(prev => [...prev, `> Result: ${resultSummary}...`]);
                        } else {
                            throw new Error(data.error);
                        }
                    } catch (e: any) {
                        setExecutionLog(prev => [...prev, `> Agent Error: ${e.message}`]);
                        throw e; // Stop execution
                    }

                } else if (step.type === 'delay') {
                    await new Promise(r => setTimeout(r, step.params.ms || 1000));
                } else if (step.type === 'log') {
                    setExecutionLog(prev => [...prev, `> LOG: ${step.params.message}`]);
                }

                setExecutionLog(prev => [...prev, `Step complete.`]);
            }
            updateSelected({ status: 'completed' });
            setExecutionLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Workflow completed successfully.`]);
        } catch (error) {
            updateSelected({ status: 'failed' });
            setExecutionLog(prev => [...prev, `[Error] Workflow failed.`]);
        }
    };

    return (
        <div className="min-h-screen text-white relative overflow-hidden">
            <PageBackground color="purple" />

            <div className="container-main py-8 relative z-10">
                <header className="mb-8 border-b border-white/10 pb-6 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3">
                            <Workflow className="w-8 h-8 text-purple-400" />
                            Automation Lab
                        </h1>
                        <p className="text-gray-400 mt-1">Design and execute automated agent workflows. (Beta)</p>
                    </div>
                    <button
                        onClick={handleCreate}
                        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded-lg transition-colors"
                    >
                        <Plus className="w-4 h-4" /> New Workflow
                    </button>
                </header>

                <div className="grid lg:grid-cols-3 gap-6 h-[70vh]">
                    {/* Sidebar List */}
                    <div className="lg:col-span-1 bg-black/20 rounded-xl border border-white/10 p-4 overflow-y-auto custom-scrollbar">
                        <h2 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">Your Workflows</h2>
                        <div className="space-y-2">
                            {workflows.map(w => (
                                <motion.div
                                    key={w.id}
                                    onClick={() => { setSelectedWorkflow(w); setIsEditing(false); }}
                                    className={`p-4 rounded-lg border cursor-pointer transition-all ${selectedWorkflow?.id === w.id
                                        ? 'bg-purple-500/20 border-purple-500'
                                        : 'bg-white/5 border-transparent hover:bg-white/10'
                                        }`}
                                    whileHover={{ x: 4 }}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-semibold">{w.name}</h3>
                                            <p className="text-xs text-gray-400 line-clamp-1">{w.description}</p>
                                        </div>
                                        <div className={`w-2 h-2 rounded-full mt-1.5 ${w.status === 'running' ? 'bg-blue-400 animate-pulse' :
                                            w.status === 'completed' ? 'bg-green-400' :
                                                w.status === 'failed' ? 'bg-red-400' : 'bg-gray-600'
                                            }`} />
                                    </div>
                                    <div className="flex justify-between items-center mt-3 text-xs text-gray-500">
                                        <span>{w.steps.length} steps</span>
                                        <span>{w.lastRun ? new Date(w.lastRun).toLocaleDateString() : 'Never run'}</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Main Editor */}
                    <div className="lg:col-span-2 bg-black/20 rounded-xl border border-white/10 p-6 flex flex-col">
                        {selectedWorkflow ? (
                            <>
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex-1">
                                        {isEditing ? (
                                            <input
                                                value={selectedWorkflow.name}
                                                onChange={e => updateSelected({ name: e.target.value })}
                                                className="bg-transparent text-2xl font-bold border-b border-purple-500 outline-none w-full"
                                                autoFocus
                                            />
                                        ) : (
                                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                                {selectedWorkflow.name}
                                                <button onClick={() => setIsEditing(true)} className="text-gray-500 hover:text-white">
                                                    <Settings className="w-4 h-4" />
                                                </button>
                                            </h2>
                                        )}
                                        {isEditing ? (
                                            <input
                                                value={selectedWorkflow.description}
                                                onChange={e => updateSelected({ description: e.target.value })}
                                                className="bg-transparent text-sm text-gray-400 mt-2 border-b border-gray-600 outline-none w-full"
                                            />
                                        ) : (
                                            <p className="text-gray-400 mt-1">{selectedWorkflow.description}</p>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleDelete(selectedWorkflow.id)}
                                            className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={runWorkflow}
                                            disabled={selectedWorkflow.status === 'running'}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${selectedWorkflow.status === 'running'
                                                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                                : 'bg-green-600 hover:bg-green-500 text-white'
                                                }`}
                                        >
                                            <Play className="w-4 h-4" /> Run
                                        </button>
                                    </div>
                                </div>

                                {/* Step Builder */}
                                <div className="flex-1 overflow-y-auto mb-6 pr-2 custom-scrollbar">
                                    {selectedWorkflow.steps.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center text-gray-500 border-2 border-dashed border-gray-700 rounded-xl">
                                            <Workflow className="w-12 h-12 mb-4 opacity-50" />
                                            <p>No steps configured.</p>
                                            <p className="text-sm">Add a step below to get started.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3 relative">
                                            {/* Connecting Line */}
                                            <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-gray-700 z-0" />

                                            {selectedWorkflow.steps.map((step, index) => (
                                                <div key={step.id} className="relative z-10 flex gap-4 group">
                                                    <div className="w-12 h-12 rounded-full bg-gray-800 border-2 border-gray-600 flex items-center justify-center shrink-0 font-bold text-gray-400">
                                                        {index + 1}
                                                    </div>
                                                    <div className="flex-1 bg-gray-800/50 border border-gray-700 rounded-lg p-4 group-hover:border-purple-500/50 transition-colors">
                                                        <div className="flex justify-between items-start">
                                                            <div className="flex items-center gap-2 font-medium text-purple-300">
                                                                {step.type === 'agent' && <Terminal className="w-4 h-4" />}
                                                                {step.type === 'delay' && <Clock className="w-4 h-4" />}
                                                                {step.type === 'log' && <MessageSquare className="w-4 h-4" />}
                                                                {step.label}
                                                            </div>
                                                            <button
                                                                onClick={() => removeStep(step.id)}
                                                                className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                        <div className="mt-2 text-sm text-gray-400">
                                                            {/* Simple params editor */}
                                                            {step.type === 'agent' && (
                                                                <div className="grid grid-cols-2 gap-2">
                                                                    <input
                                                                        placeholder="Agent (e.g. lux)"
                                                                        className="bg-black/20 border border-gray-700 rounded px-2 py-1 outline-none focus:border-purple-500"
                                                                        value={step.params.agent || ''}
                                                                        onChange={e => {
                                                                            const newSteps = [...selectedWorkflow.steps];
                                                                            newSteps[index].params.agent = e.target.value;
                                                                            updateSelected({ steps: newSteps });
                                                                        }}
                                                                    />
                                                                    <input
                                                                        placeholder="Task"
                                                                        className="bg-black/20 border border-gray-700 rounded px-2 py-1 outline-none focus:border-purple-500"
                                                                        value={step.params.task || ''}
                                                                        onChange={e => {
                                                                            const newSteps = [...selectedWorkflow.steps];
                                                                            newSteps[index].params.task = e.target.value;
                                                                            updateSelected({ steps: newSteps });
                                                                        }}
                                                                    />
                                                                </div>
                                                            )}
                                                            {step.type === 'delay' && (
                                                                <div className="flex items-center gap-2">
                                                                    <span>Wait</span>
                                                                    <input
                                                                        type="number"
                                                                        className="w-20 bg-black/20 border border-gray-700 rounded px-2 py-1 outline-none focus:border-purple-500"
                                                                        value={step.params.ms || 1000}
                                                                        onChange={e => {
                                                                            const newSteps = [...selectedWorkflow.steps];
                                                                            newSteps[index].params.ms = parseInt(e.target.value);
                                                                            updateSelected({ steps: newSteps });
                                                                        }}
                                                                    />
                                                                    <span>ms</span>
                                                                </div>
                                                            )}
                                                            {step.type === 'log' && (
                                                                <input
                                                                    placeholder="Message to log"
                                                                    className="w-full bg-black/20 border border-gray-700 rounded px-2 py-1 outline-none focus:border-purple-500"
                                                                    value={step.params.message || ''}
                                                                    onChange={e => {
                                                                        const newSteps = [...selectedWorkflow.steps];
                                                                        newSteps[index].params.message = e.target.value;
                                                                        updateSelected({ steps: newSteps });
                                                                    }}
                                                                />
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Step Controls */}
                                <div className="grid grid-cols-3 gap-2 pt-4 border-t border-white/10">
                                    <button onClick={() => addStep('agent')} className="flex flex-col items-center gap-1 p-2 bg-gray-800 hover:bg-purple-900/30 rounded-lg transition-colors border border-gray-700 hover:border-purple-500/50">
                                        <Terminal className="w-5 h-5 text-purple-400" />
                                        <span className="text-xs">Agent Task</span>
                                    </button>
                                    <button onClick={() => addStep('log')} className="flex flex-col items-center gap-1 p-2 bg-gray-800 hover:bg-blue-900/30 rounded-lg transition-colors border border-gray-700 hover:border-blue-500/50">
                                        <MessageSquare className="w-5 h-5 text-blue-400" />
                                        <span className="text-xs">Log Msg</span>
                                    </button>
                                    <button onClick={() => addStep('delay')} className="flex flex-col items-center gap-1 p-2 bg-gray-800 hover:bg-amber-900/30 rounded-lg transition-colors border border-gray-700 hover:border-amber-500/50">
                                        <Clock className="w-5 h-5 text-amber-400" />
                                        <span className="text-xs">Delay</span>
                                    </button>
                                </div>

                                {/* Execution Log Panel */}
                                {executionLog.length > 0 && (
                                    <div className="mt-6 bg-black p-4 rounded-lg font-mono text-xs text-green-400 border border-green-900 max-h-40 overflow-y-auto">
                                        {executionLog.map((line, i) => (
                                            <div key={i}>{line}</div>
                                        ))}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-500">
                                <ChevronRight className="w-16 h-16 opacity-20 mb-4" />
                                <h3 className="text-xl font-bold text-gray-400">Select a Workflow</h3>
                                <p>Choose a workflow from the sidebar or help yourself to a new one.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
