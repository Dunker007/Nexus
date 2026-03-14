import { useState, useEffect } from 'react';
import { Music, Sparkles, FileText, RefreshCw, Copy, Check, Video, Activity, Mic, Radio, UserCog } from 'lucide-react';
import { motion } from 'motion/react';
import { useToast } from '../contexts/ToastContext';

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
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<'lyrics' | 'suno' | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const generate = async () => {
    if (!theme.trim()) return;
    setGenerating(true);
    setError(null);
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
      setError(e.message);
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
    <div className="flex flex-col h-full bg-[#0a0a0f] bg-mesh-purple overflow-hidden">
      {/* Header */}
      <div className="px-8 py-6 glass-panel border-b border-white/5 relative z-30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center shadow-lg shadow-purple-500/10">
              <Music className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                Music <span className="text-gradient-purple">Studio</span>
              </h1>
              <p className="text-xs text-white/40 font-medium uppercase tracking-widest">Neural Composition Engine • {genre} · {mood}</p>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="flex items-center gap-3">
             <div className="flex gap-1 p-1 bg-black/40 border border-white/5 rounded-xl backdrop-blur-md">
                {(['songwriter', 'library', 'releases'] as Tab[]).map(t => (
                  <button key={t} onClick={() => setTab(t)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all capitalize ${tab === t ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'text-white/30 hover:text-white/60 hover:bg-white/5'}`}>
                    {t === 'releases' ? 'Release Pipeline' : t}
                  </button>
                ))}
             </div>
          </div>
        </div>
      </div>

      {tab === 'songwriter' && (
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar relative z-10">
          <div className="grid lg:grid-cols-12 gap-8 max-w-[1600px] mx-auto">
            {/* Left: Modes & Source (Col 3) */}
            <div className="lg:col-span-3 space-y-6">
              <motion.div 
                initial={{ opacity: 0, x: -20 }} 
                animate={{ opacity: 1, x: 0 }} 
                className="glass-card p-5"
              >
                <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-5 ml-1">Composition Mode</h3>
                <div className="space-y-2">
                  {MODES.map(m => (
                    <button
                      key={m.id}
                      onClick={() => setMode(m.id)}
                      className={`w-full px-4 py-3 rounded-xl text-left transition-all flex items-center gap-3 relative overflow-hidden group ${mode === m.id
                        ? 'bg-purple-500/20 border border-purple-500/30 shadow-lg shadow-purple-500/10'
                        : 'bg-white/[0.02] border border-white/5 hover:border-white/20'
                        }`}
                    >
                      <div className={`p-2 rounded-lg transition-colors ${mode === m.id ? 'bg-purple-500/30' : 'bg-black/30 group-hover:bg-black/50'}`}>
                        <m.icon size={18} className={mode === m.id ? 'text-purple-400' : 'text-gray-500'} />
                      </div>
                      <div className="relative z-10">
                        <div className={`font-bold text-sm ${mode === m.id ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'}`}>{m.name}</div>
                        <div className="text-[10px] text-gray-500 font-medium">{m.desc}</div>
                      </div>
                      {mode === m.id && <motion.div layoutId="mode-active" className="absolute left-0 w-1 h-6 bg-purple-500 rounded-r-full" />}
                    </button>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Middle: Configuration (Col 5) */}
            <div className="lg:col-span-5">
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="glass-card p-8 h-full flex flex-col relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                
                <h2 className="text-sm font-black mb-6 flex items-center gap-2 text-white uppercase tracking-widest relative z-10">
                  <Activity size={18} className="text-purple-400" /> Configuration
                </h2>

                <div className="space-y-6 relative z-10 flex-1 flex flex-col">
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-3 ml-1">Theme / Narrative</label>
                    <textarea
                      value={theme}
                      onChange={e => setTheme(e.target.value)}
                      placeholder={mode === 'standard' ? "Describe the story, vibe, or specific theme..." : "Input context or topic here..."}
                      className="w-full glass-input min-h-[160px] resize-none"
                    />
                  </div>

                  {mode === 'standard' ? (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-3 ml-1">Musical Genre</label>
                        <div className="flex flex-wrap gap-2">
                          {GENRES.map(g => (
                            <button
                              key={g}
                              onClick={() => setGenre(g)}
                              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${genre === g
                                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-lg shadow-purple-500/5'
                                : 'bg-white/5 text-gray-400 hover:bg-white/10 border-transparent hover:border-white/10'
                                }`}
                            >
                              {g}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-3 ml-1">Emotional Mood</label>
                        <div className="flex flex-wrap gap-2">
                          {MOODS.map(m => (
                            <button
                              key={m}
                              onClick={() => setMood(m)}
                              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${mood === m
                                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-lg shadow-cyan-500/5'
                                : 'bg-white/5 text-gray-400 hover:bg-white/10 border-transparent hover:border-white/10'
                                }`}
                            >
                              {m}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1">
                       <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-6 mt-2 backdrop-blur-md">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                              <UserCog size={16} className="text-purple-400" />
                            </div>
                            <p className="text-sm text-purple-200 font-black uppercase tracking-widest">Agent Protocol Active</p>
                          </div>
                          <p className="text-xs text-purple-200/60 leading-relaxed font-medium">
                            The {MODES.find(m => m.id === mode)?.name} agent will take full creative control. Lyrics, arrangement, and Suno parameters will be optimized based on your theme.
                          </p>
                       </div>
                    </div>
                  )}

                  <div className="pt-6 mt-auto">
                    {error && (
                      <div className="text-[10px] font-bold text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl p-4 mb-4 animate-shake">
                        ⚠️ {error}
                      </div>
                    )}
                    <button onClick={generate} disabled={!theme.trim() || generating}
                      className="w-full py-5 rounded-2xl font-black text-white shadow-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-[length:200%_auto] hover:bg-right transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group text-sm uppercase tracking-[0.2em]">
                      {generating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />}
                      {generating ? 'Composing Masterpiece...' : 'Generate New Track'}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right: Output (Col 4) */}
            <div className="lg:col-span-4 h-full">
              {!draft && !generating && (
                <div className="h-full min-h-[500px] glass-card flex flex-col items-center justify-center text-center p-12 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent group-hover:opacity-100 opacity-0 transition-opacity duration-700" />
                  <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-white/5 flex items-center justify-center mb-8 relative">
                    <Music size={48} className="text-purple-400/30 group-hover:text-purple-400/50 transition-colors" />
                    <div className="absolute inset-0 bg-purple-400/20 blur-2xl rounded-full scale-50 group-hover:scale-100 transition-transform duration-700" />
                  </div>
                  <h3 className="text-2xl font-black text-white mb-3 tracking-tight">Studio Idle</h3>
                  <p className="text-gray-500 max-w-[280px] text-sm font-medium leading-relaxed">
                    Set your theme and musical path on the left to begin the composition process.
                  </p>
                </div>
              )}

              {generating && (
                <div className="h-full min-h-[500px] glass-card flex flex-col items-center justify-center p-12 overflow-hidden relative">
                  <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-purple-500/20 via-pink-500 to-purple-500/20 animate-pulse" />
                  <div className="w-20 h-20 rounded-3xl bg-purple-500/20 flex items-center justify-center mb-8 relative">
                    <Sparkles className="w-10 h-10 text-purple-400 animate-spin-slow" />
                    <div className="absolute inset-0 bg-purple-500/30 blur-3xl animate-pulse" />
                  </div>
                  <p className="text-white text-lg font-black uppercase tracking-[0.2em] mb-2">Composing...</p>
                  <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest">Bridging to LLM • Extracting Verses</p>
                </div>
              )}

              {draft && !generating && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.98, y: 10 }} 
                  animate={{ opacity: 1, scale: 1, y: 0 }} 
                  className="glass-card flex flex-col h-full overflow-hidden border-purple-500/30 shadow-purple-500/5"
                >
                  <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 p-6 border-b border-white/10 backdrop-blur-md">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <span className="text-[10px] font-black text-purple-400 uppercase tracking-[0.3em] mb-1 block">Active Draft</span>
                        <h3 className="text-xl font-black text-white tracking-tight truncate flex items-center gap-2">
                           <span className="text-2xl">🎵</span> {draft.title}
                        </h3>
                        <div className="flex gap-2 mt-3">
                          <span className="text-[9px] font-bold px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase tracking-wider">{draft.genre}</span>
                          <span className="text-[9px] font-bold px-3 py-1 rounded-full bg-white/5 text-white/50 border border-white/10 uppercase tracking-wider">{draft.mood}</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 shrink-0">
                        <button onClick={saveSong} disabled={saving || saved}
                          className={`text-[10px] px-4 py-2 rounded-xl border font-black uppercase tracking-widest transition-all flex items-center gap-2 justify-center shadow-lg ${saved ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-white/10 text-white hover:bg-white/20 border-white/10 hover:border-white/20'}`}>
                          {saved ? <Check size={14}/> : <FileText size={14}/>}
                          {saved ? 'Saved' : 'Save Track'}
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6 flex-1 overflow-y-auto custom-scrollbar space-y-6">
                    {/* Suno Prompt Area */}
                    <div className="group">
                      <div className="flex items-center justify-between mb-3 px-1">
                        <label className="text-[10px] font-black tracking-[0.2em] text-cyan-400 uppercase">Suno Prompt</label>
                        <button onClick={() => copy('suno')} className="text-[9px] font-bold flex items-center gap-1.5 text-white/40 hover:text-white transition-colors bg-white/5 border border-white/5 rounded-lg px-3 py-1 hover:bg-white/10">
                          {copied === 'suno' ? <Check size={12} className="text-emerald-400"/> : <Copy size={12}/>}
                          {copied === 'suno' ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                      <div className="bg-black/60 border border-cyan-500/20 group-hover:border-cyan-500/40 rounded-2xl p-5 text-xs font-mono text-cyan-100/80 leading-relaxed shadow-inner transition-colors">
                        {draft.sunoPrompt}
                      </div>
                    </div>

                    {/* Lyrics Area */}
                    <div>
                      <div className="flex items-center justify-between mb-3 px-1">
                        <label className="text-[10px] font-black tracking-[0.2em] text-white/30 uppercase">Full Lyrics</label>
                        <button onClick={() => copy('lyrics')} className="text-[9px] font-bold flex items-center gap-1.5 text-white/40 hover:text-white transition-colors bg-white/5 border border-white/5 rounded-lg px-3 py-1 hover:bg-white/10">
                          {copied === 'lyrics' ? <Check size={12} className="text-emerald-400"/> : <Copy size={12}/>}
                          {copied === 'lyrics' ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                      <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 text-sm text-white/80 whitespace-pre-wrap max-h-[400px] overflow-y-auto custom-scrollbar font-sans leading-loose shadow-inner">
                        {draft.lyrics}
                      </div>
                    </div>

                    <div className="pt-4">
                      <button onClick={() => { setDraft(null); setSaved(false); }}
                        className="w-full py-3 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white/70 transition-colors bg-white/5 rounded-xl border border-white/5 hover:bg-white/10">
                        <RefreshCw size={14} /> Reset Studio
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      )}

      {tab === 'library' && <SongLibrary />}
      {tab === 'releases' && <ReleaseBoard />}
    </div>
  );
}

// ─── Song Library ─────────────────────────────────────────────────────────────

function SongLibrary() {
  const [songs, setSongs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any | null>(null);

  useEffect(() => {
    fetch('/api/songs').then(r => r.json()).then(data => { setSongs(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center flex-1"><div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-purple-400" /></div>;

  if (songs.length === 0) return (
    <div className="flex flex-col items-center justify-center flex-1 text-center">
      <Music className="w-10 h-10 text-white/10 mb-3" />
      <h3 className="text-white/30 font-bold">No songs yet</h3>
      <p className="text-white/20 text-xs mt-1">Generate and save a song from the Songwriter tab</p>
    </div>
  );

  return (
    <div className="flex flex-1 overflow-hidden">
      <div className="w-64 border-r border-white/5 overflow-y-auto p-3">
        {songs.map(s => (
          <button key={s.id} onClick={() => setSelected(s)}
            className={`w-full text-left px-3 py-3 rounded-lg mb-1 transition-all ${selected?.id === s.id ? 'bg-purple-500/10 border border-purple-500/20' : 'hover:bg-white/5 border border-transparent'}`}>
            <div className="text-sm font-medium text-white truncate">{s.title}</div>
            <div className="text-xs text-white/30 font-mono">{s.genre} · {s.mood}</div>
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        {selected ? (
          <div className="max-w-2xl space-y-4">
            <h2 className="text-2xl font-bold text-white">{selected.title}</h2>
            <div className="flex gap-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">{selected.genre}</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/5 text-white/40 border border-white/10">{selected.mood}</span>
              <span className={`text-xs font-mono px-2 py-0.5 rounded border ${selected.status === 'published' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>{selected.status}</span>
            </div>
            <div className="rounded-xl border border-white/5 bg-white/3 p-5">
              <pre className="text-sm text-white/80 whitespace-pre-wrap leading-relaxed font-sans">{selected.lyrics}</pre>
            </div>
            {selected.suno_prompt && (
              <div className="rounded-xl border border-cyan-500/10 bg-cyan-500/5 p-4">
                <p className="text-xs font-mono text-cyan-400/60 mb-2">SUNO PROMPT</p>
                <p className="text-sm text-cyan-100/70">{selected.suno_prompt}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-white/20 text-sm">Select a song</div>
        )}
      </div>
    </div>
  );
}

// ─── Release Board ────────────────────────────────────────────────────────────

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

  if (loading) return <div className="flex items-center justify-center flex-1"><div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-purple-400" /></div>;

  const moveSong = async (id: string, newStatus: string) => {
    // Optimistic update
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
         toast.success('Status updated');
      }
    } catch(e) {
      console.error(e);
      setSongs(previousSongs);
      toast.error('Failed to update status');
    }
  };

  const getColumnSongs = (colId: string) => {
    if (colId === 'concept') return songs.filter(s => s.status === 'draft' || !s.status || s.status === 'concept');
    return songs.filter(s => s.status === colId);
  };

  return (
    <div className="flex flex-1 p-6 gap-6 overflow-x-auto bg-[#0a0a0f]">
      {COLUMNS.map(col => (
        <div key={col.id} className="flex-1 min-w-[280px] max-w-[350px] flex flex-col bg-[#12121a] rounded-xl border border-white/5">
          <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
             <div className="flex items-center gap-2">
               <div className={`p-1.5 rounded-md ${col.bg} ${col.border} border`}>
                 <col.icon className={`w-3.5 h-3.5 ${col.color}`} />
               </div>
               <span className="text-sm font-bold text-white/80">{col.label}</span>
             </div>
             <span className="text-xs font-mono text-white/30 bg-black/20 px-2 py-0.5 rounded-md border border-white/5">
               {getColumnSongs(col.id).length}
             </span>
          </div>
          
          <div className="flex-1 p-3 space-y-3 overflow-y-auto">
             {getColumnSongs(col.id).length === 0 && (
               <div className="text-center p-6 border border-dashed border-white/5 rounded-lg text-white/20 text-xs mt-2">
                 Empty
               </div>
             )}
             {getColumnSongs(col.id).map(song => (
                <div key={song.id} className="bg-[#1a1a24] border border-white/5 p-4 rounded-lg hover:border-white/20 transition-all shadow-sm">
                  <div className="text-sm font-bold text-white mb-1 truncate">{song.title}</div>
                  <div className="text-xs text-white/40 font-mono mb-4">{song.genre}</div>
                  
                  <div className="flex items-center justify-between gap-2 mt-auto">
                    <span className="text-[10px] uppercase font-bold text-white/20 tracking-wider">Status</span>
                     <select 
                       value={col.id === 'concept' ? 'draft' : col.id} 
                       onChange={(e) => moveSong(song.id, e.target.value)}
                       className="text-xs bg-black/30 text-white/80 border border-white/10 rounded-md px-2 py-1 outline-none cursor-pointer focus:border-purple-500/50 hover:bg-black/50 transition-colors"
                     >
                       <option value="draft">Concept</option>
                       <option value="audio">Audio</option>
                       <option value="video">Video</option>
                       <option value="published">Published</option>
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
