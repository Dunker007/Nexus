import { useState, useEffect } from 'react';
import { GitBranch, Plus, Save, Clock, CheckCircle2, Circle, PlayCircle, Loader2, AlertCircle, RefreshCw, ChevronRight, Music, Edit3, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
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

const STATUS_CONFIG = {
  planning: { color: 'text-zinc-400', bg: 'bg-zinc-400/10', border: 'border-zinc-400/20', label: 'PLANNING' },
  production: { color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20', label: 'PRODUCTION' },
  mixing: { color: 'text-cyan-400', bg: 'bg-cyan-400/10', border: 'border-cyan-400/20', label: 'MIXING' },
  mastering: { color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20', label: 'MASTERING' },
  release: { color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20', label: 'RELEASE' },
  done: { color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20', label: 'FINALIZED' },
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
          setTracks([]);
        }
      } else {
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
    } catch (e) { console.error(e); }
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
        toast.error('Sync failed — server unreachable');
    } finally {
      setSyncing(false);
    }
  };

  const parsedSteps: PipelineStep[] = selectedTrack?.steps ? JSON.parse(selectedTrack.steps) : [];

  if (loading) return (
    <div className="flex h-full items-center justify-center bg-[#07070a]">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
            <Loader2 className="w-10 h-10 text-purple-500/50" />
        </motion.div>
    </div>
  );

  return (
    <div className="flex h-full bg-[#07070a] text-gray-100 overflow-hidden relative bg-mesh-purple">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-1/2 left-1/4 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[120px] mix-blend-screen" />
          <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[120px] mix-blend-screen" />
      </div>

      {/* Sidebar ListView */}
      <aside className="w-80 glass-sidebar flex flex-col shrink-0 z-10 border-r border-white/5 shadow-2xl">
        <div className="p-8 border-b border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shadow-lg">
                    <GitBranch className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                    <h1 className="text-sm font-black uppercase tracking-widest text-white/90">Pipeline</h1>
                    <p className="text-[9px] text-purple-400/80 font-black tracking-[0.2em]">{tracks.length} ACTIVE TRACKS</p>
                </div>
            </div>
            <motion.button 
                whileTap={{ scale: 0.9 }}
                onClick={handleSync} 
                disabled={syncing} 
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 border border-white/5 text-white/30 hover:text-white hover:bg-white/10 transition-all"
            >
                <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            </motion.button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {tracks.map(track => (
            <motion.div 
               key={track.id} 
               layoutId={track.id}
               onClick={() => { setSelectedTrack(track); setIsCreating(false); setIsEditing(false); setEditForm(track); }}
               className={`group p-4 rounded-2xl cursor-pointer transition-all border ${selectedTrack?.id === track.id && !isCreating ? 'bg-white/10 border-white/20 shadow-xl' : 'bg-transparent border-transparent hover:bg-white/[0.04]'}`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="w-full min-w-0 pr-2">
                   <div className={`text-[13px] font-black uppercase tracking-tight truncate ${selectedTrack?.id === track.id ? 'text-white' : 'text-white/60 group-hover:text-white'}`}>{track.title}</div>
                   <div className="text-[10px] text-white/30 font-black uppercase tracking-widest truncate mt-1">{track.artist}</div>
                </div>
                <div className={`w-1.5 h-1.5 rounded-full shadow-[0_0_8px_currentColor] ${STATUS_CONFIG[track.status as keyof typeof STATUS_CONFIG]?.color || 'text-white/20'}`} />
              </div>
              
              <div className="flex items-center justify-between gap-4 mt-3">
                  <div className="flex-1 bg-white/5 rounded-full h-1 overflow-hidden relative">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${track.progress}%` }}
                        className="bg-purple-500 h-full rounded-full shadow-[0_0_10px_rgba(168,85,247,0.4)]" 
                    />
                  </div>
                  <span className="text-[9px] font-black font-mono text-white/20">{track.progress}%</span>
              </div>
            </motion.div>
          ))}
          
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { setSelectedTrack(null); setIsCreating(true); setIsEditing(true); setEditForm({ status: 'planning', progress: 0, steps: JSON.stringify(DEFAULT_STEPS) }); }}
            className={`w-full p-4 rounded-2xl border-2 border-dashed transition-all flex items-center justify-center gap-3 ${isCreating ? 'border-purple-500/50 bg-purple-500/10 text-purple-400' : 'border-white/5 text-white/20 hover:text-white/40 hover:border-white/10 hover:bg-white/5'}`}
          >
            <Plus className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Deploy Track</span>
          </motion.button>
        </div>
      </aside>

      {/* Main Detail View */}
      <main className="flex-1 overflow-y-auto p-12 z-10 custom-scrollbar">
        <div className="max-w-5xl mx-auto h-full">
          <AnimatePresence mode="wait">
          {(selectedTrack || isCreating) ? (
            <motion.div 
               key={isCreating ? 'create' : selectedTrack?.id} 
               initial={{ opacity: 0, y: 30 }} 
               animate={{ opacity: 1, y: 0 }} 
               exit={{ opacity: 0, y: -30 }}
               className="space-y-10"
            >
              <div className="flex items-start justify-between bg-black/20 p-8 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 blur-[80px] rounded-full -mr-20 -mt-20 transition-all group-hover:bg-purple-500/20" />
                
                <div className="relative z-10 flex-1">
                  {isEditing ? (
                    <div className="space-y-6 max-w-xl">
                      <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 ml-1">Release Title</label>
                          <input type="text" value={editForm.title || ''} onChange={e => setEditForm(p => ({ ...p, title: e.target.value }))}
                             className="text-4xl font-black text-white bg-transparent border-b-2 border-white/10 focus:border-purple-500 focus:outline-none w-full pb-2 transition-all placeholder:text-white/10 uppercase tracking-tight" />
                      </div>
                      <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 ml-1">Artist Profile</label>
                          <input type="text" value={editForm.artist || ''} onChange={e => setEditForm(p => ({ ...p, artist: e.target.value }))}
                             className="text-xl font-black text-white/60 bg-transparent border-b border-white/10 focus:border-purple-500 focus:outline-none w-full pb-2 transition-all placeholder:text-white/10 uppercase tracking-widest" />
                      </div>
                      
                      <div className="flex flex-wrap gap-8 mt-6">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Matrix Status</label>
                           <select value={editForm.status || 'planning'} onChange={e => setEditForm(p => ({ ...p, status: e.target.value as any }))}
                             className="px-4 py-2 rounded-xl bg-white/5 text-[11px] font-black uppercase tracking-widest text-white border border-white/10 focus:border-purple-500 focus:outline-none outline-none appearance-none cursor-pointer hover:bg-white/10 transition-all min-w-[160px]">
                             {Object.keys(STATUS_CONFIG).map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                           </select>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Target Launch</label>
                           <input type="date" value={editForm.target_date || ''} onChange={e => setEditForm(p => ({ ...p, target_date: e.target.value }))}
                             className="px-4 py-2 rounded-xl bg-white/5 text-[11px] font-black text-white border border-white/10 focus:border-purple-500 outline-none uppercase tracking-widest" style={{ colorScheme: 'dark' }} />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 mb-2">
                          <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] border ${STATUS_CONFIG[selectedTrack?.status as keyof typeof STATUS_CONFIG]?.bg} ${STATUS_CONFIG[selectedTrack?.status as keyof typeof STATUS_CONFIG]?.color} ${STATUS_CONFIG[selectedTrack?.status as keyof typeof STATUS_CONFIG]?.border}`}>
                             {STATUS_CONFIG[selectedTrack?.status as keyof typeof STATUS_CONFIG]?.label}
                          </div>
                      </motion.div>
                      <h2 className="text-5xl font-black text-white uppercase tracking-tight leading-none overflow-hidden text-ellipsis">{selectedTrack?.title}</h2>
                      <h3 className="text-xl font-black text-white/30 uppercase tracking-[0.4em] mb-4">{selectedTrack?.artist}</h3>
                      
                      {selectedTrack?.target_date && (
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/20 bg-white/5 w-fit px-3 py-1.5 rounded-lg border border-white/5">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Deadline: {new Date(selectedTrack.target_date).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="relative z-10 flex flex-col gap-3 ml-12">
                  {isEditing ? (
                    <>
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { setIsEditing(false); if (isCreating) { setIsCreating(false); if (tracks.length) setSelectedTrack(tracks[0]); } }}
                        className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2">
                          <X className="w-3.5 h-3.5" /> Cancel
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleSave}
                        className="px-6 py-3 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 text-white text-[10px] font-black uppercase tracking-widest hover:from-purple-400 transition-all flex items-center gap-2 shadow-xl shadow-purple-500/20">
                        <Save className="w-4 h-4" /> Save Commit
                      </motion.button>
                    </>
                  ) : (
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { setIsEditing(true); setEditForm(selectedTrack!); }}
                      className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/10 hover:border-white/20 transition-all flex items-center gap-2 group/btn">
                       <Edit3 className="w-4 h-4 text-white/40 group-hover/btn:text-white transition-colors" /> Edit Manifest
                    </motion.button>
                  )}
                </div>
              </div>

              {/* Steps UI */}
              {!isCreating && (
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="space-y-8">
                   <div className="flex items-center justify-between px-2">
                     <div className="flex items-center gap-4">
                        <div className="w-1.5 h-6 bg-purple-500 rounded-full" />
                        <h3 className="text-xl font-black text-white uppercase tracking-widest">Production Matrix</h3>
                     </div>
                     <div className="flex items-center gap-3">
                         <span className="text-[11px] font-black tracking-widest text-white/30 uppercase">Deployment Progress</span>
                         <span className="text-sm font-black text-purple-400 font-mono tracking-tighter">{selectedTrack?.progress}%</span>
                     </div>
                   </div>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {parsedSteps.map((step, idx) => (
                       <motion.div 
                          key={idx} 
                          initial={{ opacity: 0, x: -10 }} 
                          animate={{ opacity: 1, x: 0 }} 
                          transition={{ delay: 0.1 + idx * 0.05 }}
                          className={`group glass-card p-5 border-white/5 hover:border-white/10 transition-all flex items-center justify-between ${step.status === 'completed' ? 'opacity-60 grayscale-[0.5]' : ''}`}
                       >
                         <div className="flex items-center gap-5">
                           <motion.button 
                             whileHover={{ scale: 1.1 }}
                             whileTap={{ scale: 0.9 }}
                             onClick={() => updateStepStatus(idx, step.status === 'completed' ? 'pending' : 'completed')}
                             className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${step.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-white/5 text-white/10 group-hover:text-white/40 border border-transparent'}`}
                           >
                             {step.status === 'completed' ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                           </motion.button>
                           <div>
                               <span className={`text-[13px] font-black uppercase tracking-tight transition-all pb-0.5 block ${step.status === 'completed' ? 'text-white/30 line-through' : 'text-white/90 group-hover:text-white'}`}>{step.name}</span>
                               <span className={`text-[9px] font-black uppercase tracking-widest ${step.status === 'active' ? 'text-cyan-400' : step.status === 'blocked' ? 'text-red-400' : 'text-white/10'}`}>
                                  {step.status}
                               </span>
                           </div>
                         </div>
                         
                         <div className="flex gap-1.5 bg-black/40 border border-white/5 p-1 rounded-xl opacity-0 group-hover:opacity-100 transition-all">
                             {(['pending', 'active', 'blocked'] as const).map(s => (
                               <motion.button 
                                 key={s} 
                                 whileHover={{ scale: 1.1 }}
                                 whileTap={{ scale: 0.9 }}
                                 onClick={() => updateStepStatus(idx, s)}
                                 className={`p-2 rounded-lg transition-all ${step.status === s ? 
                                    (s === 'active' ? 'bg-cyan-500/20 text-cyan-400' : s === 'blocked' ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-white') 
                                    : 'text-white/10 hover:text-white/40 hover:bg-white/5'}`}>
                                 {s === 'active' ? <PlayCircle size={14} /> : s === 'blocked' ? <AlertCircle size={14} /> : <Clock size={14} />}
                               </motion.button>
                             ))}
                         </div>
                       </motion.div>
                     ))}
                   </div>
                 </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }}
               className="flex flex-col items-center justify-center h-full text-center py-40"
            >
              <div className="w-24 h-24 rounded-[2rem] bg-white/[0.02] border border-white/5 flex items-center justify-center mb-8 relative group">
                <div className="absolute inset-0 bg-purple-500/10 blur-[40px] rounded-full opacity-0 group-hover:opacity-100 transition-all" />
                <Music className="w-10 h-10 text-white/10 group-hover:text-purple-500/40 transition-all relative z-10" />
              </div>
              <h3 className="text-2xl font-black text-white uppercase tracking-[0.4em] mb-4">Neural Buffer Empty</h3>
              <p className="text-[11px] text-white/20 font-black uppercase tracking-widest max-w-sm leading-loose">The production matrix is ready for track allocation. Deploy a new track to begin the synthesis process.</p>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => { setSelectedTrack(null); setIsCreating(true); setIsEditing(true); setEditForm({ status: 'planning', progress: 0, steps: JSON.stringify(DEFAULT_STEPS) }); }}
                className="mt-10 px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] text-white/40 hover:text-white hover:bg-white/10 hover:border-purple-500/30 transition-all flex items-center gap-3"
              >
                <Plus size={16} /> Init New Deployment
              </motion.button>
            </motion.div>
          )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
