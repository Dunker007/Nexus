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
    <div className="flex h-full bg-[#0a0a0f]">
      <aside className="w-64 border-r border-white/5 bg-[#0d0d14] flex flex-col shrink-0">
        <div className="p-5 border-b border-white/5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h1 className="font-bold text-white text-sm">Agent Roster</h1>
            <p className="text-[10px] text-cyan-400 font-mono tracking-widest">NEXUS</p>
          </div>
        </div>
        <div className="p-3 space-y-1 overflow-y-auto flex-1">
          {agents.map(agent => (
            <div key={agent.id} onClick={() => { setSelectedAgent(agent); setIsCreating(false); setIsEditing(false); }}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-all ${selectedAgent?.id === agent.id && !isCreating ? 'bg-cyan-500/10 border border-cyan-500/20 text-white' : 'text-white/40 hover:text-white hover:bg-white/5 border border-transparent'}`}>
              <div className="flex items-center gap-2 overflow-hidden">
                <Bot className={`w-4 h-4 shrink-0 ${agent.status === 'active' ? 'text-cyan-400' : 'text-white/20'}`} />
                <div className="overflow-hidden">
                  <div className="text-sm font-medium truncate">{agent.name}</div>
                  <div className="text-[10px] font-mono text-white/30 truncate">{agent.role}</div>
                </div>
              </div>
              <button onClick={e => handleToggleStatus(agent, e)} className={`p-1 rounded transition-colors ${agent.status === 'active' ? 'text-emerald-400 hover:bg-emerald-400/10' : 'text-white/20 hover:text-white/60'}`}>
                {agent.status === 'active' ? <Power className="w-3 h-3" /> : <PowerOff className="w-3 h-3" />}
              </button>
            </div>
          ))}
          <button onClick={() => { setSelectedAgent(null); setIsCreating(true); setIsEditing(true); setEditForm({ name: '', role: '', description: '', status: 'active', system_prompt: '' }); }}
            className={`w-full mt-3 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm border border-dashed transition-all ${isCreating ? 'border-cyan-500/50 text-cyan-400 bg-cyan-500/10' : 'border-white/10 text-white/30 hover:text-white/60 hover:border-white/20'}`}>
            <Plus className="w-4 h-4" /><span className="font-mono text-xs">NEW AGENT</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-3xl mx-auto">
          {(selectedAgent || isCreating) ? (
            <motion.div key={isCreating ? 'create' : selectedAgent?.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
              <div className="flex items-start justify-between">
                {isEditing ? (
                  <div className="flex-1 mr-4 space-y-2">
                    <input type="text" value={editForm.name || ''} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} placeholder="Agent Name"
                      className="text-2xl font-bold text-white bg-transparent border-b border-white/10 focus:border-cyan-500 focus:outline-none w-full pb-1 transition-colors" />
                    <div className="flex gap-2">
                      <input type="text" value={editForm.role || ''} onChange={e => setEditForm(p => ({ ...p, role: e.target.value }))} placeholder="Role"
                        className="px-2 py-1 rounded bg-white/5 text-xs font-mono text-white border border-white/10 focus:border-cyan-500 focus:outline-none" />
                      <select value={editForm.status || 'active'} onChange={e => setEditForm(p => ({ ...p, status: e.target.value }))}
                        className="px-2 py-1 rounded bg-white/5 text-xs font-mono text-white border border-white/10 focus:border-cyan-500 focus:outline-none">
                        <option value="active">ACTIVE</option>
                        <option value="inactive">INACTIVE</option>
                        <option value="development">DEVELOPMENT</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">{selectedAgent?.name}</h2>
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-1 rounded bg-white/5 text-xs font-mono text-white border border-white/10">{selectedAgent?.role}</span>
                      <span className={`flex items-center gap-1 text-xs font-mono ${selectedAgent?.status === 'active' ? 'text-emerald-400' : 'text-amber-400'}`}>
                        <Activity className="w-3 h-3" />{selectedAgent?.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                )}
                <div className="flex gap-2 shrink-0">
                  {isEditing ? (
                    <>
                      <button onClick={() => { setIsEditing(false); if (isCreating) { setIsCreating(false); if (agents.length) setSelectedAgent(agents[0]); } }}
                        className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm hover:bg-white/10 transition-colors">Cancel</button>
                      <button onClick={handleSave}
                        className="px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-sm hover:bg-cyan-500/20 transition-colors flex items-center gap-2">
                        <Save className="w-3 h-3" />Save
                      </button>
                    </>
                  ) : (
                    <button onClick={() => { setIsEditing(true); setEditForm(selectedAgent!); }}
                      className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm hover:bg-white/10 transition-colors flex items-center gap-2">
                      <Settings className="w-3 h-3" />Configure
                    </button>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-white/5 bg-white/3 p-5">
                <h3 className="text-xs font-mono font-bold tracking-widest text-white/30 mb-3">DESCRIPTION</h3>
                {isEditing
                  ? <textarea value={editForm.description || ''} onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))} placeholder="Brief description..." className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-cyan-500 min-h-[80px] transition-colors" />
                  : <p className="text-white/70 text-sm leading-relaxed">{selectedAgent?.description || 'No description.'}</p>}
              </div>

              <div className="rounded-xl border border-white/5 bg-white/3 p-5">
                <h3 className="text-xs font-mono font-bold tracking-widest text-white/30 mb-3">SYSTEM PROMPT</h3>
                {isEditing
                  ? <textarea value={editForm.system_prompt || ''} onChange={e => setEditForm(p => ({ ...p, system_prompt: e.target.value }))} placeholder="You are..." className="w-full bg-white/5 border border-white/10 rounded-lg p-3 font-mono text-sm text-white focus:outline-none focus:border-cyan-500 min-h-[240px] transition-colors" />
                  : <pre className="p-4 rounded-lg bg-black/30 border border-white/5 font-mono text-xs text-white/70 whitespace-pre-wrap">{selectedAgent?.system_prompt || 'No system prompt configured.'}</pre>}
              </div>
            </motion.div>
          ) : (
            <div className="h-96 rounded-xl border border-dashed border-white/10 flex flex-col items-center justify-center text-center">
              <Bot className="w-10 h-10 text-white/10 mb-3" />
              <h3 className="text-lg font-bold text-white/30">No Agent Selected</h3>
              <p className="text-xs text-white/20 mt-1">Pick an agent from the roster or create one</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
