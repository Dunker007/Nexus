import { motion } from 'motion/react';
import { Users, Bot, Settings, Activity, Plus, Save, Power, PowerOff } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from '../contexts/ToastContext';

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

  if (loading) return <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-400" /></div>;

  return (
    <div className="flex h-full bg-[#0a0a0f] bg-mesh-purple overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-600/5 rounded-full blur-[120px] mix-blend-screen" />
      </div>

      <aside className="w-80 glass-sidebar flex flex-col shrink-0 relative z-10">
        <div className="p-8 border-b border-white/5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shadow-lg shadow-purple-500/5">
            <Users className="w-5 h-4 text-purple-400" />
          </div>
          <div>
            <h1 className="font-black text-white text-base tracking-tight leading-none">Agent Roster</h1>
            <p className="text-[10px] text-purple-400/60 font-black uppercase tracking-[0.2em] mt-1.5">Command Center</p>
          </div>
        </div>

        <div className="p-4 space-y-2 overflow-y-auto flex-1 custom-scrollbar">
          {agents.map((agent, idx) => (
            <motion.div 
              key={agent.id} 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => { setSelectedAgent(agent); setIsCreating(false); setIsEditing(false); }}
              className={`group flex items-center justify-between px-4 py-3.5 rounded-xl cursor-pointer transition-all duration-300 relative overflow-hidden ${selectedAgent?.id === agent.id && !isCreating 
                ? 'bg-white/5 border border-white/10 text-white shadow-xl' 
                : 'text-white/40 hover:text-white hover:bg-white/[0.02] border border-transparent'}`}
            >
              {selectedAgent?.id === agent.id && !isCreating && (
                <motion.div layoutId="active-agent" className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500" />
              )}
              
              <div className="flex items-center gap-3 overflow-hidden relative z-10">
                <div className={`p-2 rounded-lg transition-colors ${selectedAgent?.id === agent.id ? 'bg-purple-500/20' : 'bg-white/5 group-hover:bg-white/10'}`}>
                  <Bot className={`w-4 h-4 shrink-0 transition-colors ${agent.status === 'active' ? 'text-cyan-400' : 'text-white/20'}`} />
                </div>
                <div className="overflow-hidden">
                  <div className="text-[13px] font-bold truncate tracking-tight">{agent.name}</div>
                  <div className="text-[10px] font-black uppercase tracking-wider text-white/20 group-hover:text-white/40 transition-colors">{agent.role}</div>
                </div>
              </div>

              <button 
                onClick={e => handleToggleStatus(agent, e)} 
                className={`p-2 rounded-lg transition-all relative z-10 ${agent.status === 'active' ? 'text-emerald-400/60 hover:text-emerald-400 hover:bg-emerald-400/10' : 'text-white/20 hover:text-white/60 hover:bg-white/5'}`}
              >
                {agent.status === 'active' ? <Power className="w-3.5 h-3.5" /> : <PowerOff className="w-3.5 h-3.5" />}
              </button>
            </motion.div>
          ))}
          
          <button onClick={() => { setSelectedAgent(null); setIsCreating(true); setIsEditing(true); setEditForm({ name: '', role: '', description: '', status: 'active', system_prompt: '' }); }}
            className={`w-full mt-6 flex items-center justify-center gap-2 px-4 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border border-dashed transition-all active:scale-[0.98] ${isCreating 
              ? 'border-purple-500/50 text-purple-400 bg-purple-500/10' 
              : 'border-white/10 text-white/30 hover:text-white/60 hover:border-white/20 hover:bg-white/[0.02]'}`}>
            <Plus className="w-4 h-4" /> New AI Construct
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto relative z-10">
        <div className="max-w-4xl mx-auto px-10 py-12">
          {(selectedAgent || isCreating) ? (
            <motion.div key={isCreating ? 'create' : selectedAgent?.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              <div className="flex items-start justify-between">
                {isEditing ? (
                  <div className="flex-1 mr-8 space-y-4">
                    <input type="text" value={editForm.name || ''} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} placeholder="Agent Name"
                      className="text-4xl font-black text-white bg-transparent border-b-2 border-white/5 focus:border-purple-500 focus:outline-none w-full pb-2 transition-all tracking-tight placeholder:text-white/10" />
                    <div className="flex gap-3">
                      <div className="flex-1 max-w-[200px] relative">
                        <input type="text" value={editForm.role || ''} onChange={e => setEditForm(p => ({ ...p, role: e.target.value }))} placeholder="Role"
                          className="w-full px-4 py-2.5 rounded-xl bg-white/5 text-[10px] font-black uppercase tracking-widest text-white border border-white/5 focus:border-purple-500/50 focus:outline-none focus:ring-4 focus:ring-purple-500/10 transition-all" />
                      </div>
                      <div className="relative">
                        <select value={editForm.status || 'active'} onChange={e => setEditForm(p => ({ ...p, status: e.target.value }))}
                          className="appearance-none px-4 py-2.5 rounded-xl bg-white/5 text-[10px] font-black uppercase tracking-widest text-white border border-white/5 focus:border-cyan-500/50 focus:outline-none focus:ring-4 focus:ring-cyan-500/10 transition-all pr-10">
                          <option value="active">ONLINE / ALPHA</option>
                          <option value="inactive">OFFLINE</option>
                          <option value="development">LABS / DEV</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h2 className="text-4xl font-black text-white mb-3 tracking-tight">
                      <span className="text-gradient-purple">{selectedAgent?.name}</span>
                    </h2>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1.5 rounded-lg bg-white/5 text-[10px] font-black uppercase tracking-[0.15em] text-white/50 border border-white/5">{selectedAgent?.role}</span>
                      <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-[0.15em] border ${selectedAgent?.status === 'active' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${selectedAgent?.status === 'active' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                        {selectedAgent?.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                )}
                
                <div className="flex gap-3 shrink-0 pt-2">
                  {isEditing ? (
                    <>
                      <button onClick={() => { setIsEditing(false); if (isCreating) { setIsCreating(false); if (agents.length) setSelectedAgent(agents[0]); } }}
                        className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/50 text-[10px] font-black uppercase tracking-widest hover:text-white hover:bg-white/10 transition-all active:scale-95">Discard</button>
                      <button onClick={handleSave}
                        className="px-6 py-2.5 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-400 text-[10px] font-black uppercase tracking-widest hover:bg-purple-500/30 transition-all flex items-center gap-2 shadow-lg shadow-purple-500/10 active:scale-95">
                        <Save className="w-4 h-4" /> Commit Changes
                      </button>
                    </>
                  ) : (
                    <button onClick={() => { setIsEditing(true); setEditForm(selectedAgent!); }}
                      className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60 text-[10px] font-black uppercase tracking-widest hover:text-white hover:bg-white/10 transition-all flex items-center gap-2 active:scale-95">
                      <Settings className="w-4 h-4" /> Parameters
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-8">
                <div className="glass-card p-8 border-white/5 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                    <Activity className="w-32 h-32" />
                  </div>
                  <h3 className="text-[10px] font-black tracking-[0.3em] text-white/20 mb-4 uppercase">Directives & Identity</h3>
                  {isEditing
                    ? <textarea value={editForm.description || ''} onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))} placeholder="Brief description of agent's purpose..." 
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-5 text-white text-sm focus:outline-none focus:border-purple-500/50 min-h-[100px] transition-all placeholder:text-white/10 focus:ring-4 focus:ring-purple-500/5" />
                    : <p className="text-white/80 text-base leading-relaxed tracking-tight">{selectedAgent?.description || 'No operational description provided.'}</p>}
                </div>

                <div className="glass-card p-1 border-white/5">
                  <div className="p-7">
                    <h3 className="text-[10px] font-black tracking-[0.3em] text-white/20 mb-4 uppercase">Neural Configuration (System Prompt)</h3>
                  </div>
                  <div className="px-1 pb-1">
                    {isEditing
                      ? <textarea value={editForm.system_prompt || ''} onChange={e => setEditForm(p => ({ ...p, system_prompt: e.target.value }))} placeholder="The core logic defining this agent's personality and constraints..." 
                          className="w-full bg-black/40 border-t border-white/5 rounded-b-2xl p-6 font-mono text-sm text-cyan-400/80 focus:outline-none focus:text-cyan-400 min-h-[400px] transition-all custom-scrollbar placeholder:text-white/5" />
                      : <div className="bg-black/40 border-t border-white/5 rounded-b-2xl p-8 font-mono text-[13px] text-cyan-400/70 whitespace-pre-wrap leading-relaxed max-h-[600px] overflow-y-auto custom-scrollbar">
                          {selectedAgent?.system_prompt || 'No neural pattern established.'}
                        </div>}
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="h-[60vh] rounded-3xl border border-dashed border-white/5 bg-white/[0.01] flex flex-col items-center justify-center text-center p-12">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 border border-white/5 shadow-inner">
                <Bot className="w-10 h-10 text-white/10" />
              </div>
              <h3 className="text-2xl font-black text-white/30 tracking-tight">System Idle</h3>
              <p className="text-sm text-white/20 mt-2 max-w-xs uppercase font-black tracking-widest leading-loose">Initialize an agent from the roster to begin diagnostic or parameter adjustment</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
