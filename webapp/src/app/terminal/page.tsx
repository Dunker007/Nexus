'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { LUXRIG_BRIDGE_URL } from '@/lib/utils';

interface TerminalLine {
    type: 'input' | 'output' | 'error' | 'success';
    content: string | string[];
}

export default function TerminalPage() {
    const [input, setInput] = useState('');
    const [history, setHistory] = useState<TerminalLine[]>([
        { type: 'success', content: '🚀 DLX Studio Terminal v1.0.1' },
        { type: 'output', content: 'Connected to LuxRig Bridge at ' + LUXRIG_BRIDGE_URL },
        { type: 'output', content: 'Type "help" for available commands.' },
        { type: 'output', content: '' },
    ]);
    const [isProcessing, setIsProcessing] = useState(false);
    const terminalEndRef = useRef<HTMLDivElement>(null);

    const commands: Record<string, (args: string) => Promise<string | string[]>> = {
        help: async () => [
            'Available commands:',
            '  status   - Show system status (Real-time)',
            '  gpu      - Show GPU info (Real-time)',
            '  models   - List available LLM models',
            '  health   - Check health of LuxRig services',
            '  clear    - Clear terminal',
            '  echo [text] - Echo text',
            '  ping [host] - Ping a host (simulated)',
            '  agent [prompt] - Delegate task to TaskAgent layer',
        ],
        clear: async () => {
            setHistory([]);
            return '';
        },
        echo: async (args) => args,
        status: async () => {
            try {
                const res = await fetch(`${LUXRIG_BRIDGE_URL}/status`);
                if (!res.ok) throw new Error(`Bridge Error: ${res.statusText}`);
                const data = await res.json();

                return [
                    '╔══════════════════════════════════════╗',
                    '║        LuxRig System Status          ║',
                    '╠══════════════════════════════════════╣',
                    `║ LM Studio        ● ${data.services.lmstudio.online ? 'Online' : 'Offline'}           ║`,
                    `║ Ollama           ● ${data.services.ollama.online ? 'Online' : 'Offline'}           ║`,
                    `║ GPU Usage        ● ${data.system.gpu?.utilization || 0}%               ║`,
                    `║ CPU Usage        ● ${Math.round(data.system.cpu?.usage || 0)}%               ║`,
                    `║ Active Agents    ● ${data.agents?.length || 0}                 ║`,
                    '╚══════════════════════════════════════╝',
                ];
            } catch (e: any) {
                throw new Error(`Failed to fetch status: ${e.message}`);
            }
        },
        gpu: async () => {
            try {
                const res = await fetch(`${LUXRIG_BRIDGE_URL}/system/gpu`);
                const data = await res.json();
                /* 
                   Assuming API returns structure like:
                   { name: 'NVIDIA RTX 4090', memory: { used: 8192, total: 24576 }, temp: 52, utilization: 45 }
                */
                return [
                    `🎮 GPU: ${data.name || 'Unknown GPU'}`,
                    `   Utilization: ${data.utilization}%`,
                    `   Memory: ${Math.round(data.memory.used / 1024)}GB / ${Math.round(data.memory.total / 1024)}GB`,
                    `   Temp: ${data.temperature}°C`,
                    `   Fan: ${data.fanSpeed || 'N/A'}%`
                ];
            } catch (e: any) {
                // Fallback / Error
                return `Error fetching GPU info: ${e.message}. Is LuxRig running?`;
            }
        },
        models: async () => {
            try {
                const res = await fetch(`${LUXRIG_BRIDGE_URL}/llm/models`);
                const data = await res.json();
                const lines = ['📦 Available Models:'];

                if (data.lmstudio) {
                    data.lmstudio.forEach((m: any) => lines.push(`  [lmstudio] ${m.id}`));
                }
                if (data.ollama) {
                    data.ollama.forEach((m: any) => lines.push(`  [ollama]   ${m.name}`));
                }
                if (lines.length === 1) lines.push('  No models found.');

                return lines;
            } catch (e: any) {
                return `Error listing models: ${e.message}`;
            }
        },
        health: async () => {
            try {
                const res = await fetch(`${LUXRIG_BRIDGE_URL}/health`);
                const data = await res.json();
                return [
                    `🏥 Health Check: ${data.status.toUpperCase()}`,
                    `   Uptime: ${Math.floor(data.uptime / 60)} minutes`,
                    `   Memory: ${data.memory.used}MB / ${data.memory.total}MB`,
                    `   Services: ${JSON.stringify(data.services)}`
                ];
            } catch (e: any) {
                return `Health check failed: ${e.message}`;
            }
        },
        agent: async (args) => {
            // Mock delegation to TaskAgent API we created earlier
            return `🤖 Delegating to TaskAgent: "${args}"... (Check /api/agent logs)`;
        }
    };

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!input.trim() || isProcessing) return;

        const rawInput = input.trim();
        const cmdName = rawInput.split(' ')[0].toLowerCase();
        const args = rawInput.slice(cmdName.length).trim();

        setHistory(prev => [...prev, { type: 'input', content: `$ ${rawInput}` }]);
        setInput('');
        setIsProcessing(true);

        try {
            if (commands[cmdName]) {
                const output = await commands[cmdName](args);
                // Handle "clear" special case if it returns empty string but handled history internally
                if (cmdName !== 'clear') {
                    const content = Array.isArray(output) ? output : [output];
                    // Filter empty lines if desired, or keep format
                    if (output) {
                        setHistory(prev => [...prev, { type: 'output', content: output }]);
                    }
                }
            } else {
                setHistory(prev => [...prev, { type: 'error', content: `Command not found: ${cmdName}` }]);
            }
        } catch (error: any) {
            setHistory(prev => [...prev, { type: 'error', content: `Error: ${error.message}` }]);
        } finally {
            setIsProcessing(false);
        }
    }

    // Auto scroll
    useEffect(() => {
        terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history]);

    return (
        <div className="min-h-screen pt-8">
            {/* Header */}
            <section className="section-padding pb-8">
                <div className="container-main">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h1 className="text-4xl md:text-5xl font-bold mb-2">
                            <span className="text-gradient">Terminal</span>
                        </h1>
                        <p className="text-gray-400">Connected to LuxRig Bridge ({LUXRIG_BRIDGE_URL})</p>
                    </motion.div>
                </div>
            </section>

            {/* Terminal */}
            <section className="container-main pb-16">
                <motion.div
                    className="glass-card p-0 overflow-hidden"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    {/* Title bar */}
                    <div className="flex items-center gap-2 px-4 py-3 bg-black/50 border-b border-gray-700">
                        <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        </div>
                        <span className="text-sm text-gray-400 font-mono ml-4">dunker007@luxrig-bridge:~</span>
                    </div>

                    {/* Output */}
                    <div className="h-[500px] overflow-y-auto p-4 font-mono text-sm bg-black/90 backdrop-blur-3xl">
                        {history.map((line, i) => (
                            <div
                                key={i}
                                className={`mb-1 ${line.type === 'input' ? 'text-cyan-400 font-bold' :
                                        line.type === 'error' ? 'text-red-400' :
                                            line.type === 'success' ? 'text-green-400' :
                                                'text-gray-300'
                                    } whitespace-pre-wrap`}
                            >
                                {Array.isArray(line.content) ? (
                                    line.content.map((l, j) => <div key={j}>{l}</div>)
                                ) : (
                                    line.content
                                )}
                            </div>
                        ))}
                        {isProcessing && <div className="text-cyan-500 animate-pulse">Processing...</div>}
                        <div ref={terminalEndRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSubmit} className="flex items-center gap-2 p-4 bg-black/50 border-t border-gray-700">
                        <span className="text-cyan-400 font-mono font-bold">$</span>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="flex-1 bg-transparent outline-none font-mono text-white placeholder-gray-600"
                            placeholder={isProcessing ? "Wait for process..." : "Enter command..."}
                            autoFocus
                            disabled={isProcessing}
                        />
                    </form>
                </motion.div>

                {/* Quick Commands */}
                <div className="flex flex-wrap gap-2 mt-4">
                    {['status', 'health', 'gpu', 'models', 'clear'].map((cmd) => (
                        <button
                            key={cmd}
                            onClick={() => !isProcessing && setInput(cmd)}
                            className="px-3 py-1 bg-white/10 rounded-full text-sm hover:bg-white/20 font-mono transition-colors border border-white/5"
                            disabled={isProcessing}
                        >
                            {cmd}
                        </button>
                    ))}
                </div>
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
