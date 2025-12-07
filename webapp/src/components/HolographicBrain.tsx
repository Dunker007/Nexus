'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import ForceGraph3D with no SSR
const ForceGraph3D = dynamic(() => import('react-force-graph-3d'), {
    ssr: false,
    loading: () => <div className="flex items-center justify-center h-full text-cyan-400 animate-pulse">Initializing Neural Interface...</div>
});

const LUXRIG_BRIDGE_URL = process.env.NEXT_PUBLIC_BRIDGE_URL || 'http://localhost:3456';
const WS_URL = LUXRIG_BRIDGE_URL.replace('http', 'ws') + '/stream';

interface GraphNode {
    id: string;
    name: string;
    group: 'hub' | 'service' | 'agent';
    status?: string;
    val: number; // Size
    color?: string;
}

interface GraphLink {
    source: string;
    target: string;
    particles?: number; // For visual traffic
}

interface GraphData {
    nodes: GraphNode[];
    links: GraphLink[];
}

interface StatusMessage {
    services: {
        lmstudio: { online: boolean };
        ollama: { online: boolean };
    };
    agents: Array<{
        id: string;
        name: string;
        status: string;
    }>;
}

export default function HolographicBrain() {
    const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
    const [mounted, setMounted] = useState(false);
    const wsRef = useRef<WebSocket | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

    const updateGraph = useCallback((data: StatusMessage) => {
        setGraphData(prev => {
            const newNodes = [...prev.nodes];
            const newLinks = [...prev.links];
            const existingIds = new Set(newNodes.map(n => n.id));

            // Update Services Status Colors
            const lmStudioNode = newNodes.find(n => n.id === 'lmstudio');
            if (lmStudioNode) {
                lmStudioNode.color = data.services.lmstudio.online ? '#3b82f6' : '#ef4444'; // Blue or Red
            }

            const ollamaNode = newNodes.find(n => n.id === 'ollama');
            if (ollamaNode) {
                ollamaNode.color = data.services.ollama.online ? '#f97316' : '#ef4444'; // Orange or Red
            }

            // Add Agents
            if (data.agents) {
                data.agents.forEach((agent) => {
                    if (!existingIds.has(agent.id)) {
                        newNodes.push({
                            id: agent.id,
                            name: agent.name,
                            group: 'agent',
                            val: 5,
                            color: '#22c55e', // Green
                            status: agent.status
                        });

                        // Link agent to LuxRig
                        newLinks.push({ source: 'luxrig', target: agent.id });
                        existingIds.add(agent.id);
                    } else {
                        // Update existing agent status
                        const node = newNodes.find(n => n.id === agent.id);
                        if (node) {
                            node.status = agent.status;
                            node.color = agent.status === 'idle' ? '#22c55e' : '#eab308'; // Green or Yellow
                        }
                    }
                });
            }

            return { nodes: newNodes, links: newLinks };
        });
    }, []);

    useEffect(() => {
        setMounted(true);

        // Initial static nodes
        const initialNodes: GraphNode[] = [
            { id: 'luxrig', name: 'LuxRig Core', group: 'hub', val: 20, color: '#a855f7' }, // Purple
            { id: 'lmstudio', name: 'LM Studio', group: 'service', val: 10, color: '#3b82f6' }, // Blue
            { id: 'ollama', name: 'Ollama', group: 'service', val: 10, color: '#f97316' }, // Orange
        ];

        const initialLinks: GraphLink[] = [
            { source: 'luxrig', target: 'lmstudio' },
            { source: 'luxrig', target: 'ollama' },
        ];

        setGraphData({ nodes: initialNodes, links: initialLinks });

        // WebSocket disabled - showing static visualization
        // TODO: Re-enable when bridge WebSocket is active
        // const connect = () => { ... };

        return () => {
            // Cleanup if needed
        };
    }, [updateGraph]);

    // Resize Observer
    useEffect(() => {
        if (!containerRef.current || !mounted) return;

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                setDimensions({
                    width: entry.contentRect.width,
                    height: entry.contentRect.height
                });
            }
        });

        resizeObserver.observe(containerRef.current);
        return () => resizeObserver.disconnect();
    }, [mounted]);

    if (!mounted) return null;

    return (
        <div ref={containerRef} className="w-full h-full absolute inset-0 overflow-hidden">
            <div className="absolute top-4 left-4 z-10 pointer-events-none">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <span className="animate-pulse">🧠</span> Neural Topology
                </h2>
                <p className="text-xs text-gray-400">Live System Visualization</p>
            </div>

            <ForceGraph3D
                graphData={graphData}
                nodeLabel="name"
                nodeColor="color"
                nodeVal="val"
                linkColor={() => '#ffffff33'}
                linkWidth={1}
                enableNodeDrag={false}
                showNavInfo={false}
                backgroundColor="#00000000"
                width={dimensions.width}
                height={dimensions.height}
            />
        </div>
    );
}
