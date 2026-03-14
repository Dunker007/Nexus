import { useEffect, useState, useCallback, useRef } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MarkerType,
  useNodesState,
  useEdgesState,
  ConnectionMode
} from 'reactflow';
import type { Node, Edge } from 'reactflow';
import 'reactflow/dist/style.css';
import GlassNode from './nodes/GlassNode.js';

const nodeTypes = {
  glass: GlassNode,
};

interface PipelineFlowProps {
  steps: { name: string; status: 'pending' | 'active' | 'completed' | 'blocked' }[];
  onUpdateStep: (index: number, status: 'pending' | 'active' | 'completed' | 'blocked') => void;
}

export default function PipelineFlow({ steps, onUpdateStep }: PipelineFlowProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [menu, setMenu] = useState<{ id: string, index: number, top: number, left: number } | null>(null);
  const flowRef = useRef<HTMLDivElement>(null);

  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.preventDefault();
      
      const pane = flowRef.current?.getBoundingClientRect();
      if (!pane) return;

      const index = parseInt(node.id.split('-')[1], 10);
      setMenu({
        id: node.id,
        index,
        top: event.clientY - pane.top,
        left: event.clientX - pane.left,
      });
    },
    [setMenu]
  );

  const onPaneClick = useCallback(() => setMenu(null), [setMenu]);

  useEffect(() => {
    const initialNodes: Node[] = steps.map((step, i) => ({
      id: `step-${i}`,
      type: 'glass',
      position: { x: i * 220, y: i % 2 === 0 ? 0 : 80 },
      data: {
        label: step.name,
        status: step.status,
        onStatusChange: (status: any) => onUpdateStep(i, status),
      },
    }));

    const initialEdges: Edge[] = steps.slice(0, -1).map((_, i) => ({
      id: `edge-${i}-${i + 1}`,
      source: `step-${i}`,
      target: `step-${i + 1}`,
      animated: steps[i].status === 'active' || steps[i].status === 'completed',
      type: 'smoothstep',
      style: { 
        stroke: steps[i].status === 'completed' ? '#10b981' : 
                steps[i].status === 'active' ? '#06b6d4' : '#a855f7',
        strokeWidth: 2,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: steps[i].status === 'completed' ? '#10b981' : 
               steps[i].status === 'active' ? '#06b6d4' : '#a855f7',
      },
    }));

    // Keep existing node positions if they have already been drawn to avoid jumping
    setNodes((nds) => 
      initialNodes.map((n) => {
        const existingNode = nds.find((nd) => nd.id === n.id);
        return existingNode ? { ...n, position: existingNode.position } : n;
      })
    );
    setEdges(initialEdges);
  }, [steps, onUpdateStep, setNodes, setEdges]);

  return (
    <div ref={flowRef} className="w-full h-[500px] border border-white/5 bg-black/40 rounded-3xl overflow-hidden glass-card relative cursor-grab active:cursor-grabbing">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeContextMenu={onNodeContextMenu}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        className="touch-none"
      >
        <Background color="rgba(255,255,255,0.03)" size={1} gap={24} />
        <Controls className="!bg-black/80 !border-white/10 !fill-white/50" />
      </ReactFlow>
      
      {/* Dynamic Context Menu */}
      {menu && (
        <div
          className="absolute z-50 glass-card bg-[#0a0a0f]/95 border border-white/10 rounded-2xl shadow-2xl p-2 min-w-[200px] backdrop-blur-3xl overflow-hidden"
          style={{ top: menu.top, left: menu.left }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent pointer-events-none" />
          <div className="relative z-10">
            <div className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30 mb-2 px-3 pt-2 border-b border-white/5 pb-3">Neural Override</div>
            <div className="space-y-1">
              <button 
                onClick={() => { onUpdateStep(menu.index, 'active'); setMenu(null); }}
                className="w-full text-left px-3 py-2.5 text-[10px] font-black uppercase tracking-widest hover:bg-cyan-500/20 hover:text-cyan-400 rounded-xl transition-all text-cyan-400/70"
              >
                Force Run Agent
              </button>
              <button 
                onClick={() => { onUpdateStep(menu.index, 'completed'); setMenu(null); }}
                className="w-full text-left px-3 py-2.5 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500/20 hover:text-emerald-400 rounded-xl transition-all text-emerald-400/70"
              >
                Mark Completed
              </button>
              <button 
                onClick={() => { onUpdateStep(menu.index, 'pending'); setMenu(null); }}
                className="w-full text-left px-3 py-2.5 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 text-white/40 hover:text-white rounded-xl transition-all"
              >
                Reset Status
              </button>
            </div>
            <div className="h-px bg-white/5 my-2" />
            <div className="space-y-1 pb-1">
              <button 
                onClick={() => { onUpdateStep(menu.index, 'blocked'); setMenu(null); }}
                className="w-full text-left px-3 py-2.5 text-[10px] font-black uppercase tracking-widest hover:bg-red-500/20 hover:text-red-400 rounded-xl transition-all text-red-500/70"
              >
                Flag as Blocked
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
