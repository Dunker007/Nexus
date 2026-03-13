import { useState, useEffect } from 'react';
import { GitBranch, Plus, Save, Clock, CheckCircle2, Circle, PlayCircle, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import { useToast } from '../contexts/ToastContext';

interface PipelineStep {
  name: string;
  status: 'pending' | 'active' | 'completed' | 'blocked';
}

interface PipelineTrack {
  id: string;
  artist: string;
  title: string;
  status: 'planning' | 'production' | 'mixing' | 'mastering' | 'release' | 'done';
  progress: number; // 0-100
  steps: string; // JSON string of PipelineStep[]
  target_date: string;
}

const STATUS_COLORS = {
  planning: 'text-zinc-400 bg-zinc-400/10 border-zinc-400/20',
  production: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
  mixing: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
  mastering: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  release: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  done: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
};

const DEFAULT_STEPS = [
  { name: 'Concept & Lyrics', status: 'pending' },
  { name: 'Beat Selection', status: 'pending' },
  { name: 'Vocal Tracking', status: 'pending' },
  { name: 'Rough Mix', status: 'pending' },
  { name: 'Final Mix', status: 'pending' },
  { name: 'Mastering', status: 'pending' },
  { name: 'Cover Art', status: 'pending' },
  { name: 'Distribution', status: 'pending' }
];

export function Pipeline() {
  const [tracks, setTracks] = useState<PipelineTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrack, setSelectedTrack] = useState<PipelineTrack | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editForm, setEditForm] = useState<Partial<PipelineTrack>>({});
  const [syncing, setSyncing] = useState(false);
  const { toast } = useToast();

  const fetchTracks = async () => {
    try {
      const res = await fetch('/api/pipeline');
      if (res.ok) {
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await res.json();
          setTracks(data);
          if (data.length > 0 && !selectedTrack && !isCreating) {
            setSelectedTrack(data[0]);
          }
        } else {
          console.warn('Pipeline API returned non-JSON response');
          setTracks([]);
        }
      } else {
        console.warn(`Pipeline API returned ${res.status}`);
        setTracks([]);
      }
    } catch (err) {
      console.error('Pipeline fetch error:', err);
      setTracks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTracks();
  }, []);

  const handleSave = async () => {
    if (isCreating) {
      const id = editForm.title?.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now();
      const newTrack = {
        id,
        artist: editForm.artist || 'Unknown Artist',
        title: editForm.title || 'Untitled',
        status: editForm.status || 'planning',
        progress: editForm.progress || 0,
        steps: editForm.steps || JSON.stringify(DEFAULT_STEPS),
        target_date: editForm.target_date || new Date().toISOString().split('T')[0]
      };
      const res = await fetch('/api/pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTrack),
      });
      if (res.ok) {
        const saved = await res.json();
        setTracks(prev => [...prev, saved]);
        setSelectedTrack(saved);
        setIsCreating(false);
        setIsEditing(false);
        toast.success(`"${newTrack.title}" added to pipeline`);
      } else {
        toast.error('Failed to create track');
      }
    } else if (selectedTrack) {
      const updatedTrack = { ...selectedTrack, ...editForm };
      const res = await fetch(`/api/pipeline/${selectedTrack.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTrack),
      });
      if (res.ok) {
        setTracks(prev => prev.map(t => t.id === updatedTrack.id ? updatedTrack : t));
        setSelectedTrack(updatedTrack);
        setIsEditing(false);
        toast.success('Track saved');
        fetchTracks();
      } else {
        toast.error('Failed to save track');
      }
    }
  };

  const updateStepStatus = async (stepIndex: number, newStatus: PipelineStep['status']) => {
    if (!selectedTrack) return;
    try {
      const steps: PipelineStep[] = JSON.parse(selectedTrack.steps || '[]');
      if (steps[stepIndex]) {
        steps[stepIndex].status = newStatus;
        
        // Recalculate progress
        const completed = steps.filter(s => s.status === 'completed').length;
        const progress = Math.round((completed / steps.length) * 100);

        const updatedTrack = { ...selectedTrack, steps: JSON.stringify(steps), progress };
        
        const res = await fetch(`/api/pipeline/${selectedTrack.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedTrack),
        });
        
        if (res.ok) {
           setSelectedTrack(updatedTrack);
           setTracks(prev => prev.map(t => t.id === updatedTrack.id ? updatedTrack : t));
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    toast.info('Syncing with Google Sheets…');
    try {
      const res = await fetch('/api/pipeline/sync', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.tracks) {
           setTracks(data.tracks);
           if (selectedTrack) {
             const updatedCurrent = data.tracks.find((t: PipelineTrack) => t.id === selectedTrack.id);
             if (updatedCurrent) setSelectedTrack(updatedCurrent);
           }
           toast.success('Pipeline synced with Google Sheets');
        }
      } else {
        const err = await res.json();
        toast.error('Sync failed: ' + err.error);
      }
    } catch (e) {
        console.error(e);
        toast.error('Sync failed — server unreachable');
    } finally {
      setSyncing(false);
    }
  };

  const parsedSteps: PipelineStep[] = selectedTrack?.steps ? JSON.parse(selectedTrack.steps) : [];

  if (loading) return <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 text-cyan-400 animate-spin" /></div>;

  return (
    <div className="flex h-full bg-[#0a0a0f]">
      {/* Sidebar ListView */}
      <aside className="w-72 border-r border-white/5 bg-[#0d0d14] flex flex-col shrink-0">
        <div className="p-5 border-b border-white/5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <GitBranch className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h1 className="font-bold text-white text-sm">Release Pipeline</h1>
              <p className="text-[10px] text-emerald-400 font-mono tracking-widest">{tracks.length} ACTIVE TRACKS</p>
            </div>
          </div>
          <button onClick={handleSync} disabled={syncing} title="Sync with Google Sheets" className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-white/50 hover:text-white">
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <div className="p-3 space-y-2 overflow-y-auto flex-1">
          {tracks.map(track => (
            <div key={track.id} 
              onClick={() => { setSelectedTrack(track); setIsCreating(false); setIsEditing(false); setEditForm(track); }}
              className={`p-3 rounded-lg cursor-pointer transition-all border ${selectedTrack?.id === track.id && !isCreating ? 'bg-white/10 border-white/20' : 'bg-white/5 border-transparent hover:bg-white/10'}`}>
              <div className="flex justify-between items-start mb-2">
                <div className="overflow-hidden">
                  <div className="text-sm font-bold text-white truncate">{track.title}</div>
                  <div className="text-xs text-white/40 truncate">{track.artist}</div>
                </div>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${STATUS_COLORS[track.status as keyof typeof STATUS_COLORS] || 'text-white/40 border-white/10'}`}>
                  {track.status.toUpperCase()}
                </span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-1.5 mt-2">
                <div className="bg-emerald-400 h-1.5 rounded-full" style={{ width: `${track.progress}%` }}></div>
              </div>
            </div>
          ))}
          <button onClick={() => { setSelectedTrack(null); setIsCreating(true); setIsEditing(true); setEditForm({ status: 'planning', progress: 0, steps: JSON.stringify(DEFAULT_STEPS) }); }}
            className={`w-full mt-2 flex items-center justify-center gap-2 px-3 py-3 rounded-lg text-sm border border-dashed transition-all ${isCreating ? 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10' : 'border-white/10 text-white/30 hover:text-white/60 hover:border-white/20'}`}>
            <Plus className="w-4 h-4" /><span className="font-mono text-xs">NEW TRACK</span>
          </button>
        </div>
      </aside>

      {/* Main Detail View */}
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto">
          {(selectedTrack || isCreating) ? (
            <motion.div key={isCreating ? 'create' : selectedTrack?.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              
              {/* Header Header */}
              <div className="flex items-start justify-between">
                {isEditing ? (
                  <div className="flex-1 mr-4 space-y-3">
                    <input type="text" value={editForm.title || ''} onChange={e => setEditForm(p => ({ ...p, title: e.target.value }))} placeholder="Track Title"
                      className="text-3xl font-bold text-white bg-transparent border-b border-white/10 focus:border-emerald-500 focus:outline-none w-full pb-1 transition-colors" />
                    <input type="text" value={editForm.artist || ''} onChange={e => setEditForm(p => ({ ...p, artist: e.target.value }))} placeholder="Artist"
                      className="text-lg text-white/60 bg-transparent border-b border-white/10 focus:border-emerald-500 focus:outline-none w-full pb-1 transition-colors" />
                    
                    <div className="flex gap-3 mt-4">
                      <div>
                        <label className="text-[10px] uppercase font-mono text-white/30 block mb-1">Status</label>
                        <select value={editForm.status || 'planning'} onChange={e => setEditForm(p => ({ ...p, status: e.target.value as any }))}
                          className="px-3 py-1.5 rounded-lg bg-white/5 text-sm text-white border border-white/10 focus:border-emerald-500 focus:outline-none outline-none">
                          {Object.keys(STATUS_COLORS).map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-mono text-white/30 block mb-1">Target Date</label>
                        <input type="date" value={editForm.target_date || ''} onChange={e => setEditForm(p => ({ ...p, target_date: e.target.value }))}
                          className="px-3 py-1.5 rounded-lg bg-white/5 text-sm text-white border border-white/10 focus:border-emerald-500 outline-none" style={{ colorScheme: 'dark' }} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-1">{selectedTrack?.title}</h2>
                    <h3 className="text-lg text-white/60 mb-4">{selectedTrack?.artist}</h3>
                    
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 rounded font-mono text-xs border ${STATUS_COLORS[selectedTrack?.status as keyof typeof STATUS_COLORS]}`}>
                        {selectedTrack?.status.toUpperCase()}
                      </span>
                      {selectedTrack?.target_date && (
                        <span className="flex items-center gap-1.5 text-xs text-white/40">
                          <Clock className="w-3.5 h-3.5" />
                          {selectedTrack.target_date}
                        </span>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="flex gap-2 shrink-0">
                  {isEditing ? (
                    <>
                      <button onClick={() => { setIsEditing(false); if (isCreating) { setIsCreating(false); if (tracks.length) setSelectedTrack(tracks[0]); } }}
                        className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm hover:bg-white/10 transition-colors">Cancel</button>
                      <button onClick={handleSave}
                        className="px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm hover:bg-emerald-500/20 transition-colors flex items-center gap-2">
                        <Save className="w-4 h-4" />Save
                      </button>
                    </>
                  ) : (
                    <button onClick={() => { setIsEditing(true); setEditForm(selectedTrack!); }}
                      className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm hover:bg-white/10 transition-colors flex items-center gap-2">
                       Edit
                    </button>
                  )}
                </div>
              </div>

              {/* Steps UI (Only viewable when not creating/editing root data, though we can allow toggling anytime) */}
              {!isCreating && (
                 <div className="mt-8">
                   <div className="flex items-center justify-between mb-4">
                     <h3 className="text-sm font-bold text-white">Production Checklist</h3>
                     <span className="text-xs font-mono text-emerald-400">{selectedTrack?.progress}% COMPLETED</span>
                   </div>
                   
                   <div className="grid gap-2">
                     {parsedSteps.map((step, idx) => (
                       <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                         <div className="flex items-center gap-3">
                           <button onClick={() => updateStepStatus(idx, step.status === 'completed' ? 'pending' : 'completed')}
                            className={`p-0.5 rounded-full transition-colors ${step.status === 'completed' ? 'text-emerald-400' : 'text-white/20 hover:text-white/40'}`}>
                             {step.status === 'completed' ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                           </button>
                           <span className={`text-sm ${step.status === 'completed' ? 'text-white/40 line-through' : 'text-white/90'}`}>{step.name}</span>
                         </div>
                         <div className="flex gap-1 border border-white/5 rounded p-0.5 bg-black/20">
                             {(['pending', 'active', 'blocked'] as const).map(s => (
                               <button key={s} onClick={() => updateStepStatus(idx, s)}
                                 className={`p-1.5 rounded transition-all ${step.status === s ? 
                                    (s === 'active' ? 'bg-cyan-500/20 text-cyan-400' : s === 'blocked' ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-white') 
                                    : 'text-white/20 hover:text-white/40'}`}>
                                 {s === 'active' ? <PlayCircle className="w-3.5 h-3.5" /> : s === 'blocked' ? <AlertCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                               </button>
                             ))}
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>
              )}
            </motion.div>
          ) : (
             <div className="flex flex-col items-center justify-center h-full text-center py-20">
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                <GitBranch className="w-8 h-8 text-white/20" />
              </div>
              <h3 className="text-xl font-bold text-white/50 mb-2">No Tracks Pipeline</h3>
              <p className="text-white/30 text-sm max-w-xs">Create your first track to start managing the production process.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
