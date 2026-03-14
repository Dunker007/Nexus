import { motion } from 'motion/react';
import { Bot, Settings, Activity, Plus, Save, Power, PowerOff, Cpu } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from '../contexts/ToastContext';
import PageLayout, { StatPill } from '../components/PageLayout';

interface Agent {
  id: string;
  name: string;
  role: string;
  description: string;
  status: string;
  system_prompt: string;
}

export function Agents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Agent>>({});
  const { toast } = useToast();

  const fetchAgents = async () => {
    try {
      const res = await fetch('/api/agents');
      if (res.ok) {
        const data = await res.json();
        setAgents(data);
        if (data.length > 0 && !selectedAgent && !isCreating) setSelectedAgent(data[0]);
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchAgents(); }, []);

  const handleToggleStatus = async (agent: Agent, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const newStatus = agent.status === 'active' ? 'inactive' : 'active';
    try {
      const res = await fetch(`/api/agents/${agent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...agent, status: newStatus }),
      });
      if (res.ok) {
        const updated = await res.json();
        setAgents(a => a.map(x => x.id === updated.id ? updated : x));
        if (selectedAgent?.id === updated.id) setSelectedAgent(updated);
        toast.info(`${agent.name} set to ${newStatus}`);
      } else {
        toast.error('Failed to toggle agent status');
      }
    } catch { toast.error('Server unreachable'); }
  };

  const handleSave = async () => {
    if (isCreating) {
      const id = editForm.name?.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'new-agent';
      try {
        const res = await fetch('/api/agents', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, name: editForm.name || 'New Agent', role: editForm.role || 'Assistant', description: editForm.description || '', status: editForm.status || 'active', system_prompt: editForm.system_prompt || '' }),
        });
        if (res.ok) {
          const a = await res.json();
          setAgents(p => [...p, a]);
          setSelectedAgent(a);
          setIsCreating(false);
          setIsEditing(false);
          toast.success(`Agent "${a.name}" created`);
        } else { toast.error('Failed to create agent'); }
      } catch { toast.error('Server unreachable'); }
    } else if (selectedAgent) {
      try {
        const res = await fetch(`/api/agents/${selectedAgent.id}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...selectedAgent, ...editForm }),
        });
        if (res.ok) {
          const a = await res.json();
          setAgents(p => p.map(x => x.id === a.id ? a : x));
          setSelectedAgent(a);
          setIsEditing(false);
          toast.success(`"${a.name}" updated`);
        } else { toast.error('Failed to save agent'); }
      } catch { toast.error('Server unreachable'); }
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full min-h-[500px]">
      <div className="animate-spin rounded-full h-10 w-10 border-2 border-purple-500 border-t-transparent shadow-[0_0_20px_rgba(168,85,247,0.3)]" />
    </div>
  );

  return (
    <PageLayout color="purple" noPadding>
      <div className="flex h-[calc(100vh-64px)] relative overflow-hidden">
        {/* Agent List Sidebar */}
        <aside className="w-80 border-r border-white/5 bg-black/40 backdrop-blur-xl flex flex-col shrink-0 relative z-20 shadow-2xl">
          <div className="p-8 border-b border-white/5 bg-gradient-to-br from-purple-500/5 to-transparent">
            <h2 className="text-[10px] uppercase font-black tracking-[0.4em] text-purple-400 mb-2">Neural Roster</h2>
            <div className="flex items-center justify-between">
              <span className="text-xl font-black text-white tracking-tighter">AGENTS</span>
              <button
                onClick={() => { setSelectedAgent(null); setIsCreating(true); setIsEditing(true); setEditForm({ name: '', role: '', description: '', status: 'active', system_prompt: '' }); }}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all border border-white/10"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1">
            {agents.map((agent, idx) => (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => { setSelectedAgent(agent); setIsCreating(false); setIsEditing(false); }}
                className={`group px-4 py-3 rounded-xl cursor-pointer transition-all border relative ${
                  selectedAgent?.id === agent.id && !isCreating
                    ? 'bg-purple-500/10 border-purple-500/30 text-white shadow-lg shadow-purple-950/20'
                    : 'text-white/40 border-transparent hover:bg-white/[0.03] hover:text-white'
                }`}
              >
                {selectedAgent?.id === agent.id && !isCreating && (
                  <motion.div className="absolute left-1.5 top-3 bottom-3 w-0.5 bg-purple-500 rounded-full" layoutId="active-marker" />
                )}
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-black/40 ${selectedAgent?.id === agent.id ? 'text-purple-400' : 'text-white/20'}`}>
                    <Bot size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-black truncate uppercase tracking-tight">{agent.name}</div>
                    <div className="text-[8px] font-black uppercase tracking-widest opacity-30 group-hover:opacity-60">{agent.role}</div>
                  </div>
                  <button
                    onClick={e => handleToggleStatus(agent, e)}
                    className={`p-1.5 rounded-lg transition-all ${agent.status === 'active' ? 'text-emerald-500 hover:bg-emerald-500/10' : 'text-white/10 hover:bg-white/10'}`}
                  >
                    {agent.status === 'active' ? <Power size={12} /> : <PowerOff size={12} />}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </aside>

        {/* Main Workspace Area */}
        <main className="flex-1 overflow-y-auto custom-scrollbar relative z-10 bg-black/20">
          <div className="max-w-4xl mx-auto px-8 py-10">
            {(selectedAgent || isCreating) ? (
              <motion.div key={isCreating ? 'create' : selectedAgent?.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                {/* Visual Header */}
                <div className="flex flex-col md:flex-row items-start justify-between gap-6 pb-8 border-b border-white/5">
                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <div className="space-y-4 w-full">
                        <input
                          type="text"
                          value={editForm.name || ''}
                          onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
                          placeholder="AGENT_NAME"
                          className="text-4xl font-black text-white bg-transparent border-0 focus:ring-0 w-full p-0 tracking-tighter placeholder:text-white/5"
                        />
                        <div className="flex flex-wrap gap-3">
                          <input
                            type="text"
                            value={editForm.role || ''}
                            onChange={e => setEditForm(p => ({ ...p, role: e.target.value }))}
                            placeholder="OPERATIONAL_ROLE"
                            className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-purple-400 focus:border-purple-500/50 outline-none"
                          />
                          <select
                            value={editForm.status || 'active'}
                            onChange={e => setEditForm(p => ({ ...p, status: e.target.value }))}
                            className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white/50 outline-none"
                          >
                            <option value="active">STATUS: ONLINE</option>
                            <option value="inactive">STATUS: OFFLINE</option>
                          </select>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="text-[10px] font-black uppercase tracking-[0.4em] text-purple-500/50">Construct // {selectedAgent?.id}</div>
                        <h1 className="text-4xl font-black text-white tracking-tighter uppercase">{selectedAgent?.name}</h1>
                        <div className="flex gap-2">
                          <StatPill label={selectedAgent?.role || ''} color="purple" />
                          <StatPill label={selectedAgent?.status.toUpperCase() || ''} color={selectedAgent?.status === 'active' ? 'green' : 'amber'} pulse={selectedAgent?.status === 'active'} />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 pt-2">
                    {isEditing ? (
                      <>
                        <button onClick={() => { setIsEditing(false); if (isCreating) { setIsCreating(false); if (agents.length) setSelectedAgent(agents[0]); } }}
                          className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/30 text-[10px] font-black uppercase tracking-widest hover:text-white transition-all">
                          Discard
                        </button>
                        <button onClick={handleSave}
                          className="px-6 py-2.5 rounded-xl bg-purple-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-purple-500 transition-all shadow-xl shadow-purple-500/20 flex items-center gap-2">
                          <Save size={14} /> Commit
                        </button>
                      </>
                    ) : (
                      <button onClick={() => { setIsEditing(true); setEditForm(selectedAgent!); }}
                        className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/50 text-[10px] font-black uppercase tracking-widest hover:text-white hover:bg-white/10 transition-all flex items-center gap-2">
                        <Settings size={14} /> Reconfigure
                      </button>
                    )}
                  </div>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 gap-6">
                  {/* Purpose Section */}
                  <div className="glass-card p-6 border-white/5 bg-white/[0.02]">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mb-4 flex items-center gap-3">
                      <Activity size={12} className="text-purple-400" />
                      Operational Directive
                    </h3>
                    {isEditing
                      ? <textarea
                          value={editForm.description || ''}
                          onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))}
                          placeholder="Brief description of agent's purpose..."
                          className="w-full bg-black/40 border border-white/10 rounded-xl p-5 text-sm text-white/80 focus:border-purple-500/50 outline-none min-h-[100px] transition-all"
                        />
                      : <p className="text-sm font-medium text-white/70 leading-relaxed uppercase tracking-tight">
                          {selectedAgent?.description || 'No operational description provided.'}
                        </p>}
                  </div>

                  {/* System Prompt Section */}
                  <div className="glass-card border-white/5 bg-black/40 overflow-hidden">
                    <div className="p-5 border-b border-white/5 bg-gradient-to-r from-purple-500/5 to-transparent">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 flex items-center gap-3">
                        <Cpu size={12} className="text-cyan-400" />
                        Neural Logic Pattern
                      </h3>
                    </div>
                    {isEditing
                      ? <textarea
                          value={editForm.system_prompt || ''}
                          onChange={e => setEditForm(p => ({ ...p, system_prompt: e.target.value }))}
                          placeholder="CORE_LOGIC_INIT..."
                          className="w-full p-6 font-mono text-xs text-cyan-400 bg-transparent outline-none min-h-[400px] custom-scrollbar focus:bg-white/[0.01]"
                        />
                      : <div className="p-8 font-mono text-[11px] text-cyan-400/60 whitespace-pre-wrap leading-relaxed max-h-[500px] overflow-y-auto custom-scrollbar bg-black/20">
                          {selectedAgent?.system_prompt || 'Neural pattern currently unpopulated.'}
                        </div>}
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="h-[60vh] flex flex-col items-center justify-center text-center p-12">
                <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/5 flex items-center justify-center mb-6 shadow-2xl">
                  <Bot className="w-8 h-8 text-white/10" />
                </div>
                <h3 className="text-xl font-black text-white/20 uppercase tracking-widest">Interface Idle</h3>
                <p className="text-[10px] text-white/10 mt-2 max-w-xs uppercase font-black tracking-[0.2em] leading-loose">
                  Select a construct from the roster to begin diagnostic or parameter adjustment
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </PageLayout>
  );
}
