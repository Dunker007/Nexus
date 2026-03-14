import { useState, useEffect } from 'react';
import { Plus, Save, Clock, RefreshCw, Music, Edit3 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useToast } from '../contexts/ToastContext';
import PageLayout, { StatPill } from '../components/PageLayout';
import { io } from 'socket.io-client';
import PipelineFlow from '../components/pipeline/PipelineFlow';

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

    // Phase 6: Subscribing to Socket.IO events for live UI updates
    const LOCAL_BACKEND = (window as any).NEXUS_API_BASE || '';
    const socket = io(LOCAL_BACKEND); // Connects dynamically (Tauri uses port 3001, normal web uses relative origin)

    socket.on('pipeline_update', () => {
      // When the backend or an autonomous agent updates a track, automatically refresh the list
      fetchTracks();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleSave = async () => {
    if (isCreating) {
      const id = editForm.title?.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now();
      const newTrack = {
        id,
        artist: editForm.artist || 'Unknown Artist',
        title: editForm.title || 'Untitled',
        status: (editForm.status as any) || 'planning',
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
        setSelectedTrack(updatedTrack as any);
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
           setSelectedTrack(updatedTrack as any);
           setTracks(prev => prev.map(t => t.id === updatedTrack.id ? updatedTrack : (t as any)));
        }
      }
    } catch (e) { console.error(e); }
  };

  const handleSync = async () => {
    setSyncing(true);
    toast.info('Syncing Trace Signal…');
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
           toast.success('Pipeline Vector Synchronized');
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
    <div className="flex h-full min-h-[500px] items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-2 border-purple-500 border-t-transparent shadow-[0_0_20px_rgba(168,85,247,0.3)]" />
    </div>
  );

  return (
    <PageLayout color="purple" noPadding>
      <div className="flex flex-col md:flex-row h-[calc(100vh-64px)] relative overflow-hidden">

        {/* Sidebar: Pipeline Stack */}
        <aside className="w-full md:w-80 border-b md:border-b-0 md:border-r border-white/5 bg-black/40 backdrop-blur-xl flex flex-col shrink-0 relative z-20 shadow-2xl max-h-64 md:max-h-none overflow-y-auto md:overflow-visible">
          <div className="p-8 border-b border-white/5 bg-gradient-to-br from-purple-500/5 to-transparent flex items-center justify-between">
            <div>
              <h2 className="text-[10px] uppercase font-black tracking-[0.4em] text-purple-400 mb-2">Vector Tracking</h2>
              <span className="text-xl font-black text-white tracking-tighter uppercase">Pipeline</span>
            </div>
            <button
                onClick={handleSync} 
                disabled={syncing} 
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/30 hover:text-white transition-all group"
                title="Sync with GSheets"
            >
                <RefreshCw size={16} className={syncing ? 'animate-spin text-purple-500' : 'group-hover:rotate-180 transition-transform duration-500'} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1">
            {tracks.length === 0 && (
              <div className="flex flex-col items-center justify-center h-40 text-center px-4">
                <div className="text-[8px] font-black text-white/20 uppercase tracking-[0.3em] mb-2">NO TRACKS</div>
                <div className="text-[9px] text-white/30">Add your first release to the pipeline.</div>
              </div>
            )}
            {tracks.map((track, idx) => {
              const statusInfo = STATUS_CONFIG[track.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.planning;
              return (
                <motion.div
                  key={track.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => { setSelectedTrack(track); setIsCreating(false); setIsEditing(false); setEditForm(track); }}
                  className={`group px-4 py-4 rounded-xl cursor-pointer transition-all border relative ${selectedTrack?.id === track.id && !isCreating 
                    ? 'bg-purple-500/10 border-purple-500/30 text-white shadow-xl shadow-purple-950/20' 
                    : 'text-white/40 border-transparent hover:bg-white/[0.03] hover:text-white'}`}
                >
                  {selectedTrack?.id === track.id && !isCreating && (
                    <motion.div layoutId="pipeline-active-marker" className="absolute left-1.5 top-4 bottom-4 w-0.5 bg-purple-500 rounded-full" />
                  )}
                  <div className="flex justify-between items-start mb-3">
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-black truncate uppercase tracking-tight">{track.title}</div>
                      <div className="text-[8px] font-black uppercase tracking-widest opacity-30 mt-1">{track.artist}</div>
                    </div>
                    <div className={`w-1.5 h-1.5 rounded-full ${statusInfo.color.replace('text-', 'bg-')} shadow-[0_0_8px_currentColor]`} />
                  </div>
                  <div className="flex items-center gap-3 mt-4">
                    <div className="flex-1 h-0.5 bg-white/5 rounded-full overflow-hidden">
                       <motion.div initial={{ width: 0 }} animate={{ width: `${track.progress}%` }} className="h-full bg-purple-500" />
                    </div>
                    <span className="text-[8px] font-black text-white/20 font-mono tracking-tighter">{track.progress}%</span>
                  </div>
                </motion.div>
              );
            })}
            
            <button
               onClick={() => { setSelectedTrack(null); setIsCreating(true); setIsEditing(true); setEditForm({ status: 'planning', progress: 0, steps: JSON.stringify(DEFAULT_STEPS) }); }}
               className="w-full mt-4 p-4 rounded-xl border border-dashed border-white/10 text-white/20 hover:text-white/50 hover:border-white/20 hover:bg-white/[0.02] transition-all flex items-center justify-center gap-3"
            >
               <Plus size={16} />
               <span className="text-[10px] font-black uppercase tracking-[0.2em]">Deploy Track</span>
            </button>
          </div>
        </aside>

        {/* Primary Operational View */}
        <main className="flex-1 overflow-y-auto custom-scrollbar relative z-10 bg-black/20">
          <div className="max-w-4xl mx-auto px-8 py-10 pb-40">
            <AnimatePresence mode="wait">
              {(selectedTrack || isCreating) ? (
                <motion.div key={isCreating ? 'create' : selectedTrack?.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} className="space-y-10">
                  
                  {/* Status Header Panel */}
                  <div className="glass-card border-white/5 bg-white/[0.01] p-8 relative overflow-hidden group">
                     <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                     <div className="relative z-10 flex flex-col md:flex-row items-start justify-between gap-6">
                        <div className="flex-1 min-w-0">
                           {isEditing ? (
                             <div className="space-y-6 w-full">
                                <div className="space-y-1">
                                   <label className="text-[9px] font-black text-white/10 uppercase tracking-[0.3em]">Track Manifest // Title</label>
                                   <input type="text" value={editForm.title || ''} onChange={e => setEditForm(p => ({ ...p, title: e.target.value }))}
                                      className="text-4xl font-black text-white bg-transparent border-0 focus:ring-0 w-full p-0 tracking-tighter uppercase placeholder:text-white/5" />
                                </div>
                                <div className="space-y-1">
                                   <label className="text-[9px] font-black text-white/10 uppercase tracking-[0.3em]">Artist Profile</label>
                                   <input type="text" value={editForm.artist || ''} onChange={e => setEditForm(p => ({ ...p, artist: e.target.value }))}
                                      className="text-lg font-black text-white/40 bg-transparent border-0 focus:ring-0 w-full p-0 tracking-[0.2em] uppercase placeholder:text-white/5" />
                                </div>
                                <div className="flex flex-wrap gap-4 pt-4">
                                   <div className="space-y-2">
                                      <label className="text-[9px] font-black text-white/10 uppercase tracking-[0.3em]">Lifecycle State</label>
                                      <select value={editForm.status || 'planning'} onChange={e => setEditForm(p => ({ ...p, status: e.target.value as any }))}
                                         className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-[10px] font-black uppercase text-purple-400 outline-none">
                                         {Object.keys(STATUS_CONFIG).map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                                      </select>
                                   </div>
                                   <div className="space-y-2">
                                      <label className="text-[9px] font-black text-white/10 uppercase tracking-[0.3em]">Target Sector Date</label>
                                      <input type="date" value={editForm.target_date || ''} onChange={e => setEditForm(p => ({ ...p, target_date: e.target.value }))}
                                         className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-[10px] font-black text-white outline-none" style={{ colorScheme: 'dark' }} />
                                   </div>
                                </div>
                             </div>
                           ) : (
                             <div className="space-y-6">
                                <div className="flex gap-2">
                                  <StatPill label={STATUS_CONFIG[selectedTrack?.status as keyof typeof STATUS_CONFIG]?.label || ''} color="purple" pulse />
                                  <StatPill label={`STK-${(selectedTrack?.id || '').slice(0, 5).toUpperCase()}`} />
                                </div>
                                <h1 className="text-5xl font-black text-white uppercase tracking-tighter leading-none">{selectedTrack?.title}</h1>
                                <p className="text-xl font-black text-white/20 uppercase tracking-[0.4em]">{selectedTrack?.artist}</p>
                                <div className="flex items-center gap-4 pt-2">
                                   <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/20 bg-black/40 px-3 py-2 rounded-xl border border-white/5">
                                      <Clock size={12} className="text-purple-500" />
                                      {selectedTrack?.target_date ? `Deadline: ${new Date(selectedTrack.target_date).toLocaleDateString()}` : 'No Deadline Established'}
                                   </div>
                                </div>
                             </div>
                           )}
                        </div>

                        <div className="flex gap-3">
                           {isEditing ? (
                             <>
                               <button onClick={() => { setIsEditing(false); if (isCreating) { setIsCreating(false); if (tracks.length) setSelectedTrack(tracks[0]); } }}
                                 className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/30 text-[10px] font-black uppercase tracking-widest hover:text-white transition-all">Discard</button>
                               <button onClick={handleSave}
                                 className="px-6 py-2.5 rounded-xl bg-purple-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-purple-500 transition-all shadow-xl shadow-purple-500/20 flex items-center gap-2">
                                 <Save size={14} /> Commit
                               </button>
                             </>
                           ) : (
                             <button onClick={() => { setIsEditing(true); setEditForm(selectedTrack!); }}
                               className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/50 text-[10px] font-black uppercase tracking-widest hover:text-white hover:bg-white/10 transition-all flex items-center gap-2">
                               <Edit3 size={14} /> Reconfigure
                             </button>
                           )}
                        </div>
                     </div>
                  </div>

                  {/* Operational Matrix / Steps */}
                  {!isCreating && (
                    <div className="space-y-8">
                       <div className="flex items-center justify-between px-2">
                          <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 flex items-center gap-4">
                            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
                            Deployment Sub-Routines
                          </h3>
                          <div className="flex items-center gap-4">
                             <span className="text-[9px] font-black uppercase tracking-widest text-white/20">Phase Progress</span>
                             <div className="flex items-center gap-3">
                                <div className="w-40 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                   <motion.div initial={{ width: 0 }} animate={{ width: `${selectedTrack?.progress}%` }} className="h-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.3)]" />
                                </div>
                                <span className="text-[11px] font-black text-purple-400 font-mono">{selectedTrack?.progress}%</span>
                             </div>
                          </div>
                       </div>

                       <div className="mt-8 rounded-3xl overflow-hidden glass-card shadow-2xl shadow-purple-900/10">
                          <PipelineFlow
                            steps={parsedSteps as any}
                            onUpdateStep={updateStepStatus}
                          />
                       </div>
                    </div>
                  )}

                </motion.div>
              ) : (
                <div className="h-[60vh] flex flex-col items-center justify-center text-center p-12">
                   <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/5 flex items-center justify-center mb-6 shadow-2xl relative group cursor-pointer" 
                        onClick={() => { setSelectedTrack(null); setIsCreating(true); setIsEditing(true); setEditForm({ status: 'planning', progress: 0, steps: JSON.stringify(DEFAULT_STEPS) }); }}>
                      <Music className="w-8 h-8 text-white/10 group-hover:text-purple-400 transition-all" />
                      <div className="absolute inset-0 bg-purple-500/10 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-all" />
                   </div>
                   <h3 className="text-xl font-black text-white/20 uppercase tracking-widest">Neural Buffer Idle</h3>
                   <p className="text-[10px] text-white/10 mt-2 max-w-xs uppercase font-black tracking-[0.2em] leading-loose">
                      Select a vector from the pipeline stack or initialize a new track manifest
                   </p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </PageLayout>
  );
}
