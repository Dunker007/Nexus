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
import { Play, Plus, Save, Sparkles, Music, FileText, MessageSquare, CheckCircle } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { ErrorBoundary } from '../components/ErrorBoundary';

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'input',
    data: { label: '🎯 Start: Song Idea' },
    position: { x: 250, y: 50 },
    style: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      border: '2px solid #667eea',
      borderRadius: '12px',
      padding: '12px 20px',
      fontSize: '14px',
      fontWeight: 'bold',
    },
  },
  {
    id: '2',
    data: { label: '✍️ Lyricist Agent', description: 'Generates creative lyrics' },
    position: { x: 200, y: 150 },
    style: {
      background: '#1a1a2e',
      color: 'white',
      border: '2px solid #06b6d4',
      borderRadius: '12px',
      padding: '16px',
      width: '200px',
    },
  },
  {
    id: '3',
    data: { label: '🎵 Composer Agent', description: 'Creates melodies & chords' },
    position: { x: 450, y: 150 },
    style: {
      background: '#1a1a2e',
      color: 'white',
      border: '2px solid #8b5cf6',
      borderRadius: '12px',
      padding: '16px',
      width: '200px',
    },
  },
  {
    id: '4',
    data: { label: '🎭 Critic Agent', description: 'Reviews & provides feedback' },
    position: { x: 325, y: 280 },
    style: {
      background: '#1a1a2e',
      color: 'white',
      border: '2px solid #f59e0b',
      borderRadius: '12px',
      padding: '16px',
      width: '200px',
    },
  },
  {
    id: '5',
    data: { label: '🎚️ Producer Agent', description: 'Final mixing & mastering' },
    position: { x: 325, y: 410 },
    style: {
      background: '#1a1a2e',
      color: 'white',
      border: '2px solid #10b981',
      borderRadius: '12px',
      padding: '16px',
      width: '200px',
    },
  },
  {
    id: '6',
    type: 'output',
    data: { label: '🎉 Final Song' },
    position: { x: 350, y: 540 },
    style: {
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      color: 'white',
      border: '2px solid #10b981',
      borderRadius: '12px',
      padding: '12px 20px',
      fontSize: '14px',
      fontWeight: 'bold',
    },
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#06b6d4' } },
  { id: 'e1-3', source: '1', target: '3', animated: true, style: { stroke: '#8b5cf6' } },
  { id: 'e2-4', source: '2', target: '4', animated: true, style: { stroke: '#f59e0b' } },
  { id: 'e3-4', source: '3', target: '4', animated: true, style: { stroke: '#f59e0b' } },
  { id: 'e4-5', source: '4', target: '5', animated: true, style: { stroke: '#10b981' } },
  { id: 'e5-6', source: '5', target: '6', animated: true, style: { stroke: '#10b981' } },
];

export function AgentFlow() {
  const { toast } = useToast();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isExecuting, setIsExecuting] = useState(false);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    [setEdges]
  );

  // Memoize default edge options to prevent re-creation on every render
  const defaultEdgeOptions = useMemo(() => ({
    animated: true,
    style: { stroke: '#06b6d4', strokeWidth: 2 },
  }), []);

  // Memoize node color function for MiniMap
  const nodeColor = useCallback((node: Node) => {
    if (node.type === 'input') return '#667eea';
    if (node.type === 'output') return '#10b981';
    return '#06b6d4';
  }, []);

  const handleExecute = useCallback(async () => {
    setIsExecuting(true);
    toast.info('Executing workflow...');

    // Simulate workflow execution
    setTimeout(() => {
      setIsExecuting(false);
      toast.success('Workflow executed successfully!');
    }, 2000);
  }, [toast]);

  const handleSave = useCallback(() => {
    const workflow = { nodes, edges };
    localStorage.setItem('agentflow-workflow', JSON.stringify(workflow));
    toast.success('Workflow saved!');
  }, [nodes, edges, toast]);

  const addNode = useCallback((type: string) => {
    const newNode: Node = {
      id: `${Date.now()}`,
      data: { label: `New ${type} Node` },
      position: { x: Math.random() * 400 + 100, y: Math.random() * 400 + 100 },
      style: {
        background: '#1a1a2e',
        color: 'white',
        border: '2px solid #06b6d4',
        borderRadius: '12px',
        padding: '16px',
        width: '180px',
      },
    };
    setNodes((nds) => [...nds, newNode]);
    toast.success(`Added ${type} node`);
  }, [setNodes, toast]);

  return (
    <ErrorBoundary>
    <div className="flex-1 flex flex-col bg-[#0b0e11] text-white h-screen">
      {/* Header */}
      <div className="p-6 border-b border-white/10 bg-[#12121a]">
        <div className="flex items-center justify-between max-w-[1800px] mx-auto">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3 mb-2">
              <Sparkles className="text-purple-400" />
              Agent Flow
            </h1>
            <p className="text-white/40 text-sm">Visual workflow builder for AI agent orchestration</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => addNode('Agent')}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition-colors text-sm uppercase tracking-wider"
            >
              <Plus size={16} />
              Add Node
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors text-sm uppercase tracking-wider"
            >
              <Save size={16} />
              Save
            </button>
            <button
              onClick={handleExecute}
              disabled={isExecuting}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors text-sm uppercase tracking-wider"
            >
              {isExecuting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Executing...
                </>
              ) : (
                <>
                  <Play size={16} />
                  Execute
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* React Flow Canvas */}
      <div className="flex-1 relative w-full h-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          className="bg-[#0b0e11]"
          defaultEdgeOptions={defaultEdgeOptions}
        >
          <Background color="#ffffff10" gap={16} />
          <Controls className="bg-[#1a1a2e] border border-white/10 rounded-lg" />
          <MiniMap
            className="bg-[#1a1a2e] border border-white/10 rounded-lg"
            nodeColor={nodeColor}
          />

          {/* Agent Templates Panel */}
          <Panel position="top-left" className="bg-[#1a1a2e] border border-white/10 rounded-xl p-4 m-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white/80 mb-3">Agent Templates</h3>
            <div className="space-y-2">
              <button
                onClick={() => addNode('Lyricist')}
                className="w-full flex items-center gap-2 px-3 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 rounded-lg text-xs font-bold uppercase tracking-wider text-cyan-400 transition-colors"
              >
                <FileText size={14} />
                Lyricist
              </button>
              <button
                onClick={() => addNode('Composer')}
                className="w-full flex items-center gap-2 px-3 py-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 rounded-lg text-xs font-bold uppercase tracking-wider text-purple-400 transition-colors"
              >
                <Music size={14} />
                Composer
              </button>
              <button
                onClick={() => addNode('Critic')}
                className="w-full flex items-center gap-2 px-3 py-2 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 rounded-lg text-xs font-bold uppercase tracking-wider text-orange-400 transition-colors"
              >
                <MessageSquare size={14} />
                Critic
              </button>
              <button
                onClick={() => addNode('Producer')}
                className="w-full flex items-center gap-2 px-3 py-2 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 rounded-lg text-xs font-bold uppercase tracking-wider text-green-400 transition-colors"
              >
                <CheckCircle size={14} />
                Producer
              </button>
            </div>
          </Panel>

          {/* Workflow Info Panel */}
          <Panel position="top-right" className="bg-[#1a1a2e] border border-white/10 rounded-xl p-4 m-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white/80 mb-3">Workflow Stats</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between gap-4">
                <span className="text-white/50">Nodes:</span>
                <span className="font-bold text-cyan-400">{nodes.length}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-white/50">Connections:</span>
                <span className="font-bold text-purple-400">{edges.length}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-white/50">Status:</span>
                <span className={`font-bold ${isExecuting ? 'text-orange-400' : 'text-emerald-400'}`}>
                  {isExecuting ? 'Running' : 'Ready'}
                </span>
              </div>
            </div>
          </Panel>
        </ReactFlow>
      </div>
    </div>
    </ErrorBoundary>
  );
}
