import { useState, useEffect } from 'react';
import { Music, Sparkles, FileText, RefreshCw, Copy, Check, Video, Activity, Mic, Radio, UserCog, Library, Rocket } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useToast } from '../contexts/ToastContext';
import PageLayout, { PageHeader, StatPill } from '../components/PageLayout';

type Tab = 'songwriter' | 'library' | 'releases';

const MODES = [
  { id: 'standard', name: 'Studio Mode', desc: 'Manual composition control', icon: Music, color: 'purple' },
  { id: 'political', name: 'Newsician', desc: 'Political Rap / Truth-to-Power', icon: Mic, color: 'red' },
  { id: 'sentinel', name: 'Midwest Sentinel', desc: 'Faith, Family, Boom Bap', icon: Radio, color: 'blue' },
  { id: 'pop', name: 'Neon Icon', desc: 'Viral Pop & Trends', icon: Sparkles, color: 'pink' },
  { id: 'manager', name: 'Mic (Manager)', desc: 'Strategy & Orchestration', icon: UserCog, color: 'gray' }
];

interface SongDraft {
  title: string;
  genre: string;
  mood: string;
  theme: string;
  lyrics: string;
  sunoPrompt: string;
}

const GENRES = ['Hip-Hop', 'Pop', 'R&B', 'Electronic', 'Rock', 'Jazz', 'Country', 'Lo-Fi', 'Trap', 'Soul'];
const MOODS = ['Energetic', 'Melancholic', 'Uplifting', 'Dark', 'Chill', 'Aggressive', 'Romantic', 'Nostalgic', 'Defiant', 'Mysterious'];

const SONGWRITER_PROMPT = (theme: string, genre: string, mood: string) => 
  `You are a professional songwriter. Write complete, original song lyrics for the following brief:

Theme: ${theme}
Genre: ${genre}  
Mood: ${mood}

Provide:
1. A compelling song title
2. Full lyrics with clearly labeled sections: [Verse 1], [Pre-Chorus], [Chorus], [Verse 2], [Bridge], [Outro]
3. A Suno AI prompt (2-3 sentences describing the musical style, instrumentation, tempo, and vocal style for AI music generation)

Format your response exactly like this:
TITLE: [song title]

LYRICS:
[all lyrics with section labels]

SUNO PROMPT: [the suno generation prompt]`;

function parseSongResponse(text: string): Partial<SongDraft> {
  const titleMatch = text.match(/TITLE:\s*(.+)/i);
  const lyricsMatch = text.match(/LYRICS:\s*([\s\S]+?)(?=SUNO PROMPT:|$)/i);
  const sunoMatch = text.match(/SUNO PROMPT:\s*([\s\S]+?)$/i);
  return {
    title: titleMatch?.[1]?.trim() || 'Untitled',
    lyrics: lyricsMatch?.[1]?.trim() || text,
    sunoPrompt: sunoMatch?.[1]?.trim() || '',
  };
}

export function MusicStudio() {
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>('songwriter');
  const [mode, setMode] = useState('standard');
  const [theme, setTheme] = useState('');
  const [genre, setGenre] = useState('Hip-Hop');
  const [mood, setMood] = useState('Energetic');
  const [draft, setDraft] = useState<SongDraft | null>(null);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState<'lyrics' | 'suno' | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const generate = async () => {
    if (!theme.trim()) return;
    setGenerating(true);
    setDraft(null);
    setSaved(false);
    try {
      const res = await fetch('/api/brain-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: SONGWRITER_PROMPT(theme, genre, mood),
          systemPrompt: 'You are an expert lyricist and music producer. Respond only with the requested format, no preamble.',
        }),
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({})) as any;
        throw new Error(e.error || 'LLM request failed');
      }
      const data = await res.json();
      const parsed = parseSongResponse(data.text);
      setDraft({ title: parsed.title || 'Untitled', genre, mood, theme, lyrics: parsed.lyrics || '', sunoPrompt: parsed.sunoPrompt || '' });
      toast.success(`Generated "${parsed.title || 'Untitled'}"`);
    } catch (e: any) {
      toast.error(`Failed to generate: ${e.message}`);
    } finally {
      setGenerating(false);
    }
  };

  const copy = async (what: 'lyrics' | 'suno') => {
    const text = what === 'lyrics' ? draft?.lyrics : draft?.sunoPrompt;
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(what);
    setTimeout(() => setCopied(null), 2000);
  };

  const saveSong = async () => {
    if (!draft) return;
    setSaving(true);
    try {
      await fetch('/api/songs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: `song-${Date.now()}`,
          title: draft.title,
          artist: 'Nexus',
          genre: draft.genre,
          mood: draft.mood,
          lyrics: draft.lyrics,
          suno_prompt: draft.sunoPrompt,
          status: 'draft',
        }),
      });
      setSaved(true);
      toast.success(`Saved "${draft.title}" to library`);
    } catch (e) {
      console.error(e);
      toast.error('Failed to save song');
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageLayout color="purple" noPadding>
      <div className="max-w-[1600px] mx-auto px-6 py-10 pb-32">
        <PageHeader
          title="Music Studio"
          subtitle="NEURAL COMPOSITION ENGINE"
          icon={<Music size={24} className="text-purple-400" />}
          actions={
            <div className="flex gap-1 p-1 bg-white/5 border border-white/5 rounded-2xl backdrop-blur-md">
              {(['songwriter', 'library', 'releases'] as Tab[]).map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${tab === t 
                    ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30' 
                    : 'text-white/20 hover:text-white/60 hover:bg-white/5'}`}
                >
                  <span className="flex items-center gap-2">
                    {t === 'songwriter' && <Sparkles size={12} />}
                    {t === 'library' && <Library size={12} />}
                    {t === 'releases' && <Rocket size={12} />}
                    {t === 'releases' ? 'PIPELINE' : t}
                  </span>
                </button>
              ))}
            </div>
          }
        />

        <AnimatePresence mode="wait">
          {tab === 'songwriter' && (
            <motion.div
              key="songwriter"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid lg:grid-cols-12 gap-8"
            >
              {/* Left Column: Modes */}
              <div className="lg:col-span-3 space-y-6">
                <div className="glass-card p-6 border-white/5">
                  <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mb-6">Persona Mode</h3>
                  <div className="space-y-2">
                    {MODES.map(m => (
                      <button
                        key={m.id}
                        onClick={() => setMode(m.id)}
                        className={`w-full px-4 py-4 rounded-xl text-left transition-all flex items-center gap-4 relative overflow-hidden group border ${mode === m.id
                          ? 'bg-purple-500/10 border-purple-500/30 text-white shadow-xl shadow-purple-900/10'
                          : 'bg-white/[0.02] border-transparent text-white/30 hover:text-white/60'}`}
                      >
                        <div className={`p-2.5 rounded-lg transition-colors ${mode === m.id ? 'bg-purple-500/20 text-purple-400' : 'bg-black/40 text-white/10 group-hover:text-white/20'}`}>
                          <m.icon size={18} />
                        </div>
                        <div className="min-w-0">
                          <div className={`text-xs font-black uppercase tracking-tight ${mode === m.id ? 'text-white' : 'text-white/40'}`}>{m.name}</div>
                          <div className="text-[9px] font-black uppercase tracking-widest opacity-30 truncate mt-0.5">{m.desc}</div>
                        </div>
                        {mode === m.id && <motion.div layoutId="mode-marker" className="absolute left-0 top-4 bottom-4 w-0.5 bg-purple-500 rounded-full" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Middle Column: Configuration */}
              <div className="lg:col-span-5">
                <div className="glass-card p-8 min-h-[600px] flex flex-col border-white/5 bg-white/[0.01]">
                   <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 mb-8 flex items-center gap-3">
                     <Activity size={14} className="text-purple-400" />
                     Symmetry Configuration
                   </h2>

                   <div className="space-y-8 flex-1 flex flex-col">
                      <div>
                        <label className="block text-[9px] font-black text-white/20 uppercase tracking-[0.3em] mb-4 ml-1">Theme / Narrative Signal</label>
                        <textarea
                          value={theme}
                          onChange={e => setTheme(e.target.value)}
                          placeholder={mode === 'standard' ? "Describe the sonic narrative, vibe, or core idea..." : "Input context packets for LLM synthesis..."}
                          className="w-full glass-input min-h-[140px] text-sm font-medium border-white/10 focus:border-purple-500/50"
                        />
                      </div>

                      {mode === 'standard' ? (
                        <>
                          <div>
                            <label className="block text-[9px] font-black text-white/20 uppercase tracking-[0.3em] mb-4 ml-1">Genre Target</label>
                            <div className="flex flex-wrap gap-2">
                              {GENRES.map(g => (
                                <button
                                  key={g}
                                  onClick={() => setGenre(g)}
                                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${genre === g
                                    ? 'bg-purple-500/10 border-purple-500/40 text-purple-300 shadow-xl shadow-purple-900/20'
                                    : 'bg-white/5 border-white/5 text-white/30 hover:text-white hover:bg-white/10'}`}
                                >
                                  {g}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="block text-[9px] font-black text-white/20 uppercase tracking-[0.3em] mb-4 ml-1">Emotional Spectrum</label>
                            <div className="flex flex-wrap gap-2">
                              {MOODS.map(m => (
                                <button
                                  key={m}
                                  onClick={() => setMood(m)}
                                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${mood === m
                                    ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300 shadow-xl shadow-cyan-900/20'
                                    : 'bg-white/5 border-white/5 text-white/30 hover:text-white hover:bg-white/10'}`}
                                >
                                  {m}
                                </button>
                              ))}
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-8 backdrop-blur-md">
                           <div className="flex items-center gap-4 mb-4">
                             <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
                               <UserCog size={20} />
                             </div>
                             <p className="text-[11px] text-purple-200 font-black uppercase tracking-[0.2em]">Autonomous Protocol Active</p>
                           </div>
                           <p className="text-xs text-purple-200/40 leading-relaxed font-medium uppercase tracking-tight">
                             The {MODES.find(m => m.id === mode)?.name} construct will execute full creative dominance. Lyrics, prosody, and Suno parameters are optimized for thematic impact.
                           </p>
                        </div>
                      )}

                      <div className="pt-8 mt-auto">
                        <button
                          onClick={generate}
                          disabled={!theme.trim() || generating}
                          className="w-full py-5 rounded-2xl font-black text-white shadow-2xl bg-gradient-to-r from-purple-600 to-indigo-700 hover:brightness-110 active:scale-[0.98] transition-all duration-300 disabled:opacity-30 disabled:grayscale flex items-center justify-center gap-4 text-xs uppercase tracking-[0.3em]"
                        >
                          {generating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                          {generating ? 'Transmitting...' : 'INITIATE COMPOSITION'}
                        </button>
                      </div>
                   </div>
                </div>
              </div>

              {/* Right Column: Output */}
              <div className="lg:col-span-4">
                <div className="h-full min-h-[600px] flex flex-col">
                  {!draft && !generating && (
                    <div className="flex-1 glass-card border-white/5 flex flex-col items-center justify-center text-center p-12 bg-white/[0.01]">
                       <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/5 flex items-center justify-center mb-8 shadow-inner">
                         <Music size={40} className="text-white/10" />
                       </div>
                       <h3 className="text-xl font-black text-white/30 uppercase tracking-widest">Studio Idle</h3>
                       <p className="text-[10px] text-white/10 mt-2 max-w-xs uppercase font-black tracking-[0.2em] leading-loose">
                         Define signal parameters to begin neural composition flux
                       </p>
                    </div>
                  )}

                  {generating && (
                    <div className="flex-1 glass-card border-purple-500/20 flex flex-col items-center justify-center p-12 bg-purple-500/[0.02]">
                       <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-6 relative">
                         <Sparkles className="w-8 h-8 text-purple-400 animate-pulse" />
                         <div className="absolute inset-0 bg-purple-500/20 blur-2xl animate-pulse" />
                       </div>
                       <p className="text-white text-sm font-black uppercase tracking-[0.3em] mb-2 animate-pulse">Composing...</p>
                       <p className="text-[10px] text-white/20 font-black uppercase tracking-widest">Extracting Neural Harmonics</p>
                    </div>
                  )}

                  {draft && !generating && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex-1 glass-card border-purple-500/30 flex flex-col bg-[#0d0d14]/60 overflow-hidden shadow-2xl shadow-purple-950/20"
                    >
                      <div className="p-8 border-b border-white/5 bg-gradient-to-br from-purple-500/5 to-transparent">
                         <div className="flex items-start justify-between gap-6">
                            <div className="min-w-0">
                               <div className="text-[8px] font-black text-purple-500 uppercase tracking-[0.5em] mb-2">Neural Draft // 001</div>
                               <h3 className="text-2xl font-black text-white tracking-tighter uppercase truncate leading-tight">{draft.title}</h3>
                               <div className="flex gap-2 mt-4">
                                  <StatPill label={draft.genre} color="purple" />
                                  <StatPill label={draft.mood} color="cyan" />
                               </div>
                            </div>
                            <button
                              onClick={saveSong}
                              disabled={saving || saved}
                              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-xl ${saved ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-purple-600 text-white hover:bg-purple-500 shadow-purple-500/20'}`}
                            >
                              {saved ? <Check size={20} /> : <FileText size={20} />}
                            </button>
                         </div>
                      </div>

                      <div className="p-6 flex-1 overflow-y-auto custom-scrollbar space-y-8">
                         <div>
                            <div className="flex items-center justify-between mb-4">
                               <label className="text-[9px] font-black text-cyan-400 uppercase tracking-[0.3em]">Suno Prompt</label>
                               <button onClick={() => copy('suno')} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/20 hover:text-white transition-all">
                                  {copied === 'suno' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                               </button>
                            </div>
                            <div className="bg-black/60 border border-white/5 rounded-2xl p-5 text-[10px] font-mono text-cyan-400/80 leading-relaxed shadow-inner">
                               {draft.sunoPrompt}
                            </div>
                         </div>

                         <div>
                            <div className="flex items-center justify-between mb-4">
                               <label className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">Lyrics Output</label>
                               <button onClick={() => copy('lyrics')} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/20 hover:text-white transition-all">
                                  {copied === 'lyrics' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                               </button>
                            </div>
                            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 text-sm text-white/80 whitespace-pre-wrap font-medium leading-relaxed tracking-tight max-h-[400px] overflow-y-auto custom-scrollbar shadow-inner">
                               {draft.lyrics}
                            </div>
                         </div>
                      </div>

                      <div className="p-6 border-t border-white/5">
                         <button onClick={() => { setDraft(null); setSaved(false); }} className="w-full py-3 flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-[0.4em] text-white/10 hover:text-white/40 transition-all">
                            <RefreshCw size={12} /> Purge Buffer
                         </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {tab === 'library' && (
            <motion.div key="library" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <SongLibrary />
            </motion.div>
          )}
          {tab === 'releases' && (
            <motion.div key="releases" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ReleaseBoard />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageLayout>
  );
}

function SongLibrary() {
  const [songs, setSongs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any | null>(null);

  useEffect(() => {
    fetch('/api/songs').then(r => r.json()).then(data => { setSongs(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center p-20">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-500 border-t-transparent shadow-[0_0_15px_rgba(168,85,247,0.3)]" />
    </div>
  );

  if (songs.length === 0) return (
    <div className="flex flex-col items-center justify-center py-40 grayscale opacity-40">
      <Library className="w-16 h-16 text-white/10 mb-6" />
      <h3 className="text-lg font-black text-white/20 uppercase tracking-widest">Vault Empty</h3>
      <p className="text-[10px] text-white/10 mt-2 uppercase tracking-[0.3em]">No neural tracks archived</p>
    </div>
  );

  return (
    <div className="flex h-[700px] glass-card border-white/5 overflow-hidden bg-black/40">
      <aside className="w-80 border-r border-white/5 overflow-y-auto custom-scrollbar p-3 space-y-1">
        {songs.map(s => (
          <button
            key={s.id}
            onClick={() => setSelected(s)}
            className={`w-full text-left px-4 py-3 rounded-xl transition-all border ${selected?.id === s.id 
              ? 'bg-purple-500/10 border-purple-500/30 text-white' 
              : 'hover:bg-white/[0.03] border-transparent text-white/30'}`}
          >
            <div className="text-xs font-black truncate uppercase tracking-tight">{s.title}</div>
            <div className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em] mt-1">{s.genre} // {s.mood}</div>
          </button>
        ))}
      </aside>
      <main className="flex-1 overflow-y-auto p-10 custom-scrollbar shadow-inner bg-black/20">
        {selected ? (
          <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex items-start justify-between mb-10">
                <div>
                   <h2 className="text-3xl font-black text-white tracking-tighter uppercase mb-4">{selected.title}</h2>
                   <div className="flex gap-2">
                     <StatPill label={selected.genre} color="purple" />
                     <StatPill label={selected.mood} color="cyan" />
                     <StatPill label={selected.status.toUpperCase()} color={selected.status === 'published' ? 'green' : 'amber'} />
                   </div>
                </div>
             </div>
             <div className="space-y-10">
                <div className="glass-card p-8 border-white/5 bg-white/[0.01]">
                   <pre className="text-sm text-white/70 whitespace-pre-wrap leading-relaxed font-medium uppercase tracking-tight">{selected.lyrics}</pre>
                </div>
                {selected.suno_prompt && (
                  <div className="glass-card p-6 border-cyan-500/20 bg-cyan-500/5">
                    <p className="text-[9px] font-black text-cyan-400 uppercase tracking-[0.4em] mb-4">Suno AI Pipeline Prompt</p>
                    <p className="text-sm text-cyan-100/60 font-mono leading-relaxed">{selected.suno_prompt}</p>
                  </div>
                )}
             </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-white/5">
             <Library size={48} className="mb-4" />
             <span className="text-[10px] font-black uppercase tracking-[0.5em]">Select Archive Node</span>
          </div>
        )}
      </main>
    </div>
  );
}

const COLUMNS = [
  { id: 'concept', label: 'Concepts', icon: FileText, color: 'text-gray-400', bg: 'bg-gray-400/10', border: 'border-gray-400/20' },
  { id: 'audio', label: 'Audio (Suno)', icon: Music, color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20' },
  { id: 'video', label: 'Video (G Vids)', icon: Video, color: 'text-cyan-400', bg: 'bg-cyan-400/10', border: 'border-cyan-400/20' },
  { id: 'published', label: 'Published', icon: Check, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' }
];

function ReleaseBoard() {
  const [songs, setSongs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetch('/api/songs').then(r => r.json()).then(data => { setSongs(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center p-20">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-500 border-t-transparent shadow-[0_0_15px_rgba(168,85,247,0.3)]" />
    </div>
  );

  const moveSong = async (id: string, newStatus: string) => {
    const previousSongs = [...songs];
    setSongs(songs.map(s => s.id === id ? { ...s, status: newStatus } : s));
    
    try {
      const songToUpdate = songs.find(s => s.id === id);
      if (songToUpdate) {
         await fetch('/api/songs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...songToUpdate, status: newStatus }),
         });
         toast.success('Vector Update Complete');
      }
    } catch(e) {
      console.error(e);
      setSongs(previousSongs);
      toast.error('Vector Update Failed');
    }
  };

  const getColumnSongs = (colId: string) => {
    if (colId === 'concept') return songs.filter(s => s.status === 'draft' || !s.status || s.status === 'concept');
    return songs.filter(s => s.status === colId);
  };

  return (
    <div className="flex gap-6 overflow-x-auto pb-6 custom-scrollbar">
      {COLUMNS.map(col => (
        <div key={col.id} className="w-[340px] flex-shrink-0 flex flex-col glass-card border-white/5 bg-black/20 min-h-[600px] overflow-hidden">
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
             <div className="flex items-center gap-3">
               <div className={`p-2 rounded-lg ${col.bg} border ${col.border}`}>
                 <col.icon size={16} className={col.color} />
               </div>
               <span className="text-[11px] font-black text-white/60 uppercase tracking-widest">{col.label}</span>
             </div>
             <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[9px] font-black text-white/30">
               {getColumnSongs(col.id).length}
             </span>
          </div>
          
          <div className="flex-1 p-4 space-y-4 overflow-y-auto custom-scrollbar bg-black/20 shadow-inner">
             {getColumnSongs(col.id).length === 0 && (
               <div className="h-32 border border-dashed border-white/5 rounded-2xl flex items-center justify-center grayscale opacity-20">
                 <p className="text-[9px] font-black uppercase tracking-[0.4em]">Node Idle</p>
               </div>
             )}
             {getColumnSongs(col.id).map(song => (
                <div key={song.id} className="glass-card p-5 border-white/10 bg-white/[0.03] hover:border-purple-500/30 transition-all group active:scale-[0.98]">
                  <div className="text-xs font-black text-white mb-1 uppercase truncate tracking-tight group-hover:text-purple-400 transition-colors">{song.title}</div>
                  <div className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-5">{song.genre} // PIPELINE</div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <span className="text-[7px] uppercase font-black text-white/20 tracking-[0.2em]">Target Sector</span>
                     <select 
                       value={col.id === 'concept' ? 'draft' : col.id} 
                       onChange={(e) => moveSong(song.id, e.target.value)}
                       className="text-[9px] font-black bg-black border border-white/10 text-white/60 rounded-lg px-2 py-1 outline-none cursor-pointer focus:border-purple-500/50 hover:bg-white/5 transition-all uppercase tracking-widest"
                     >
                       <option value="draft">Concept</option>
                       <option value="audio">Audio</option>
                       <option value="video">Video</option>
                       <option value="published">Finalized</option>
                     </select>
                  </div>
                </div>
             ))}
          </div>
        </div>
      ))}
    </div>
  );
}
