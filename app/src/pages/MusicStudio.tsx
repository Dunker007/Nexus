import { useState, useEffect } from 'react';
import { Music, Sparkles, Mic2, FileText, Send, RefreshCw, Copy, Check, ChevronDown } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

type Tab = 'songwriter' | 'library';

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
    <div className="flex flex-col h-full bg-[#0a0a0f]">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/5 bg-[#0d0d14]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
            <Music className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <h1 className="font-bold text-white">Music Studio</h1>
            <p className="text-xs text-white/30">AI songwriter powered by {genre} · {mood}</p>
          </div>
        </div>
        {/* Tabs */}
        <div className="flex gap-1 mt-4">
          {(['songwriter', 'library'] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${tab === t ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'text-white/30 hover:text-white/60'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {tab === 'songwriter' && (
        <div className="flex flex-1 overflow-hidden">
          {/* Controls panel */}
          <div className="w-72 border-r border-white/5 bg-[#0d0d14] p-5 flex flex-col gap-4 overflow-y-auto shrink-0">
            <div>
              <label className="text-xs font-mono font-bold tracking-widest text-white/30 block mb-2">THEME / CONCEPT</label>
              <textarea
                value={theme}
                onChange={e => setTheme(e.target.value)}
                placeholder="e.g. Fighting back against the system, late nights grinding, lost love..."
                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white text-sm resize-none focus:outline-none focus:border-purple-500/50 transition-colors min-h-[100px]"
              />
            </div>

            <div>
              <label className="text-xs font-mono font-bold tracking-widest text-white/30 block mb-2">GENRE</label>
              <div className="relative">
                <select value={genre} onChange={e => setGenre(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500/50 appearance-none cursor-pointer">
                  {GENRES.map(g => <option key={g} value={g} className="bg-[#0d0d14]">{g}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-white/30 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="text-xs font-mono font-bold tracking-widest text-white/30 block mb-2">MOOD</label>
              <div className="flex flex-wrap gap-1.5">
                {MOODS.map(m => (
                  <button key={m} onClick={() => setMood(m)}
                    className={`px-2 py-1 rounded-md text-xs transition-all ${mood === m ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-white/5 text-white/40 border border-transparent hover:text-white/70'}`}>
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={generate} disabled={!theme.trim() || generating}
              className="mt-auto flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed">
              {generating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {generating ? 'Writing...' : 'Generate Song'}
            </button>

            {error && (
              <div className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg p-3">
                ⚠️ {error}
              </div>
            )}
          </div>

          {/* Output panel */}
          <div className="flex-1 overflow-y-auto p-6">
            {!draft && !generating && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-4">
                  <Mic2 className="w-8 h-8 text-purple-400" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Songwriter Agent</h2>
                <p className="text-sm text-white/30 max-w-xs">Enter a theme, pick your genre and mood, then let the AI write your next track.</p>
              </div>
            )}

            {generating && (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-4 animate-pulse">
                  <Sparkles className="w-6 h-6 text-purple-400" />
                </div>
                <p className="text-white/50 text-sm">Writing your {genre} track...</p>
                <p className="text-white/20 text-xs mt-1">qwen3:8b is composing</p>
              </div>
            )}

            {draft && !generating && (
              <div className="space-y-5 max-w-3xl mx-auto">
                {/* Title bar */}
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{draft.title}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">{draft.genre}</span>
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/5 text-white/40 border border-white/10">{draft.mood}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={saveSong} disabled={saving || saved}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${saved ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-white/5 text-white/50 hover:text-white border border-white/10 hover:border-white/20'}`}>
                      {saved ? <><Check className="w-3 h-3" />Saved</> : saving ? <><RefreshCw className="w-3 h-3 animate-spin" />Saving</> : <><FileText className="w-3 h-3" />Save</>}
                    </button>
                  </div>
                </div>

                {/* Lyrics */}
                <div className="rounded-xl border border-white/5 bg-white/3 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-mono font-bold tracking-widest text-white/30">LYRICS</h3>
                    <button onClick={() => copy('lyrics')} className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition-colors">
                      {copied === 'lyrics' ? <><Check className="w-3 h-3 text-emerald-400" /><span className="text-emerald-400">Copied</span></> : <><Copy className="w-3 h-3" />Copy</>}
                    </button>
                  </div>
                  <pre className="text-sm text-white/80 whitespace-pre-wrap leading-relaxed font-sans">{draft.lyrics}</pre>
                </div>

                {/* Suno Prompt */}
                {draft.sunoPrompt && (
                  <div className="rounded-xl border border-cyan-500/10 bg-cyan-500/5 p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Send className="w-3 h-3 text-cyan-400" />
                        <h3 className="text-xs font-mono font-bold tracking-widest text-cyan-400/60">SUNO PROMPT</h3>
                      </div>
                      <button onClick={() => copy('suno')} className="flex items-center gap-1.5 text-xs text-cyan-400/50 hover:text-cyan-400 transition-colors">
                        {copied === 'suno' ? <><Check className="w-3 h-3" />Copied</> : <><Copy className="w-3 h-3" />Copy for Suno</>}
                      </button>
                    </div>
                    <p className="text-sm text-cyan-100/70 leading-relaxed">{draft.sunoPrompt}</p>
                  </div>
                )}

                <button onClick={() => { setDraft(null); setSaved(false); }}
                  className="flex items-center gap-2 text-sm text-white/30 hover:text-white/60 transition-colors">
                  <RefreshCw className="w-3 h-3" />Start over
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'library' && <SongLibrary />}
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
