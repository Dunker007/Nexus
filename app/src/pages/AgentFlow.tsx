import { useCallback, useState, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type Edge,
  type Node,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Play, Plus, Save, Sparkles, Music, FileText, MessageSquare, CheckCircle, RefreshCw } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { ErrorBoundary } from '../components/ErrorBoundary';
import PageLayout, { PageHeader, StatPill } from '../components/PageLayout';

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'input',
    data: { label: '🎯 Start: Song Idea' },
    position: { x: 250, y: 50 },
    style: {
      background: 'rgba(102, 126, 234, 0.1)',
      color: '#667eea',
      border: '1px solid rgba(102, 126, 234, 0.3)',
      borderRadius: '12px',
      padding: '12px 20px',
      fontSize: '11px',
      fontWeight: '900',
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      backdropFilter: 'blur(10px)',
    },
  },
  {
    id: '2',
    data: { label: '✍️ Lyricist Agent', description: 'Generates creative lyrics' },
    position: { x: 200, y: 150 },
    style: {
      background: 'rgba(6, 182, 212, 0.05)',
      color: 'white',
      border: '1px solid rgba(6, 182, 212, 0.2)',
      borderRadius: '16px',
      padding: '16px',
      width: '200px',
      fontSize: '10px',
      fontWeight: 'bold',
      backdropFilter: 'blur(10px)',
    },
  },
  {
    id: '3',
    data: { label: '🎵 Composer Agent', description: 'Creates melodies & chords' },
    position: { x: 450, y: 150 },
    style: {
      background: 'rgba(139, 92, 246, 0.05)',
      color: 'white',
      border: '1px solid rgba(139, 92, 246, 0.2)',
      borderRadius: '16px',
      padding: '16px',
      width: '200px',
      fontSize: '10px',
      fontWeight: 'bold',
      backdropFilter: 'blur(10px)',
    },
  },
  {
    id: '4',
    data: { label: '🎭 Critic Agent', description: 'Reviews & provides feedback' },
    position: { x: 325, y: 280 },
    style: {
      background: 'rgba(245, 158, 11, 0.05)',
      color: 'white',
      border: '1px solid rgba(245, 158, 11, 0.2)',
      borderRadius: '16px',
      padding: '16px',
      width: '200px',
      fontSize: '10px',
      fontWeight: 'bold',
      backdropFilter: 'blur(10px)',
    },
  },
  {
    id: '5',
    data: { label: '🎚️ Producer Agent', description: 'Final mixing & mastering' },
    position: { x: 325, y: 410 },
    style: {
      background: 'rgba(16, 185, 129, 0.05)',
      color: 'white',
      border: '1px solid rgba(16, 185, 129, 0.2)',
      borderRadius: '16px',
      padding: '16px',
      width: '200px',
      fontSize: '10px',
      fontWeight: 'bold',
      backdropFilter: 'blur(10px)',
    },
  },
  {
    id: '6',
    type: 'output',
    data: { label: '🎉 Final Song' },
    position: { x: 350, y: 540 },
    style: {
      background: 'rgba(16, 185, 129, 0.1)',
      color: '#10b981',
      border: '1px solid rgba(16, 185, 129, 0.3)',
      borderRadius: '12px',
      padding: '12px 20px',
      fontSize: '11px',
      fontWeight: '900',
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      backdropFilter: 'blur(10px)',
    },
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: 'rgba(6, 182, 212, 0.3)', strokeWidth: 1 } },
  { id: 'e1-3', source: '1', target: '3', animated: true, style: { stroke: 'rgba(139, 92, 246, 0.3)', strokeWidth: 1 } },
  { id: 'e2-4', source: '2', target: '4', animated: true, style: { stroke: 'rgba(245, 158, 11, 0.3)', strokeWidth: 1 } },
  { id: 'e3-4', source: '3', target: '4', animated: true, style: { stroke: 'rgba(245, 158, 11, 0.3)', strokeWidth: 1 } },
  { id: 'e4-5', source: '4', target: '5', animated: true, style: { stroke: 'rgba(16, 185, 129, 0.3)', strokeWidth: 1 } },
  { id: 'e5-6', source: '5', target: '6', animated: true, style: { stroke: 'rgba(16, 185, 129, 0.3)', strokeWidth: 1 } },
];

export function AgentFlow() {
  const { toast } = useToast();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isExecuting, setIsExecuting] = useState(false);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: 'rgba(255,255,255,0.2)', strokeWidth: 1 } }, eds)),
    [setEdges]
  );

  const defaultEdgeOptions = useMemo(() => ({
    animated: true,
    style: { stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 },
  }), []);

  const nodeColor = useCallback((node: Node) => {
    if (node.type === 'input') return 'rgba(102, 126, 234, 0.3)';
    if (node.type === 'output') return 'rgba(16, 185, 129, 0.3)';
    return 'rgba(255,255,255,0.05)';
  }, []);

  const handleExecute = useCallback(async () => {
    setIsExecuting(true);
    toast.info('Initiating Neural Sequence…');

    setTimeout(() => {
      setIsExecuting(false);
      toast.success('Sequence Successfully Terminated');
    }, 2500);
  }, [toast]);

  const handleSave = useCallback(() => {
    const workflow = { nodes, edges };
    localStorage.setItem('agentflow-workflow', JSON.stringify(workflow));
    toast.success('Workflow Matrix Cached');
  }, [nodes, edges, toast]);

  const addNode = useCallback((type: string) => {
    const newNode: Node = {
      id: `${Date.now()}`,
      data: { label: `New ${type} Node` },
      position: { x: 400, y: 300 },
      style: {
        background: 'rgba(255, 255, 255, 0.02)',
        color: 'white',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        padding: '16px',
        width: '180px',
        fontSize: '10px',
        fontWeight: 'bold',
        textTransform: 'uppercase',
      },
    };
    setNodes((nds) => [...nds, newNode]);
    toast.success(`Node ${type} Initialized`);
  }, [setNodes, toast]);

  return (
    <PageLayout color="purple" noPadding>
      <ErrorBoundary>
        <div className="flex flex-col h-[calc(100vh-64px)] relative overflow-hidden bg-[var(--bg-void)]">
          
          {/* Tactical Header */}
          <div className="px-8 py-6 border-b border-white/5 bg-black/40 backdrop-blur-xl relative z-30">
            <PageHeader
               title="Agent Flow"
               subtitle="VISUAL WORKFLOW ORCHESTRATION"
               icon={<Sparkles size={24} className="text-purple-400" />}
               actions={
                 <div className="flex items-center gap-3">
                    <button 
                      onClick={() => addNode('Generic')}
                      className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/40 text-[10px] font-black uppercase tracking-widest hover:text-white hover:bg-white/10 transition-all flex items-center gap-2"
                    >
                      <Plus size={14} /> New Node
                    </button>
                    <button 
                      onClick={handleSave}
                      className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/40 text-[10px] font-black uppercase tracking-widest hover:text-white hover:bg-white/10 transition-all flex items-center gap-2"
                    >
                      <Save size={14} /> Cache Matrix
                    </button>
                    <button 
                      onClick={handleExecute}
                      disabled={isExecuting}
                      className="px-6 py-2.5 rounded-xl bg-purple-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-purple-500 disabled:opacity-30 disabled:grayscale transition-all flex items-center gap-2 shadow-xl shadow-purple-500/20"
                    >
                      {isExecuting ? <RefreshCw size={14} className="animate-spin" /> : <Play size={14} />}
                      {isExecuting ? 'TRANSMITTING' : 'INITIATE'}
                    </button>
                 </div>
               }
            />
          </div>

          {/* Canvas Ecosystem */}
          <div className="flex-1 relative w-full h-full bg-mesh-purple">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              fitView
              className="bg-[var(--bg-void)]"
              defaultEdgeOptions={defaultEdgeOptions}
            >
              <Background color="#ffffff05" gap={20} />
              <Controls className="!bg-black/60 !border-white/10 !rounded-xl !p-2 !backdrop-blur-xl" />
              <MiniMap
                className="!bg-black/60 !border-white/10 !rounded-xl !backdrop-blur-xl"
                nodeColor={nodeColor}
                maskColor="rgba(0,0,0,0.6)"
              />

              {/* Template Panel Overlay */}
              <Panel position="top-left" className="m-6 p-6 glass-card border-white/5 bg-black/40 backdrop-blur-xl w-56 space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 mb-6">Neural Templates</h3>
                <div className="space-y-2">
                  {[
                    { type: 'Lyricist', icon: FileText, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
                    { type: 'Composer', icon: Music, color: 'text-purple-400', bg: 'bg-purple-500/10' },
                    { type: 'Critic', icon: MessageSquare, color: 'text-amber-400', bg: 'bg-amber-500/10' },
                    { type: 'Producer', icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                  ].map((t) => (
                    <button
                      key={t.type}
                      onClick={() => addNode(t.type)}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/5 hover:border-white/20 transition-all text-white/40 hover:text-white"
                    >
                      <t.icon size={14} className={t.color} />
                      <span className="text-[9px] font-black uppercase tracking-widest">{t.type}</span>
                    </button>
                  ))}
                </div>
              </Panel>

              {/* Stats Panel Overlay */}
              <Panel position="top-right" className="m-6 p-6 glass-card border-white/5 bg-black/40 backdrop-blur-xl w-56 space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 mb-6">Matrix Status</h3>
                <div className="space-y-3">
                   <div className="flex justify-between items-center">
                     <span className="text-[9px] font-black uppercase tracking-widest text-white/20">Nodes</span>
                     <StatPill label={nodes.length.toString()} color="purple" />
                   </div>
                   <div className="flex justify-between items-center">
                     <span className="text-[9px] font-black uppercase tracking-widest text-white/20">Vector Trace</span>
                     <StatPill label={edges.length.toString()} color="cyan" />
                   </div>
                   <div className="flex justify-between items-center">
                     <span className="text-[9px] font-black uppercase tracking-widest text-white/20">Lifecycle</span>
                     <StatPill label={isExecuting ? 'SEQ_RUN' : 'SIGNAL_OK'} color={isExecuting ? 'amber' : 'green'} pulse={isExecuting} />
                   </div>
                </div>
              </Panel>
            </ReactFlow>
          </div>
        </div>
      </ErrorBoundary>
    </PageLayout>
  );
}
