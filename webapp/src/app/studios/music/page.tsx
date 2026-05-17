'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { LUXRIG_BRIDGE_URL } from '@/lib/utils';
import {
  Music, Mic2, Disc3, Play, Pause, Copy, Check, RefreshCw,
  Wifi, WifiOff, Sparkles, Lyric, FileMusic, Radio, Clock
import { Music, Mic2, Disc3, Copy, Check, RefreshCw, Wifi, WifiOff, Sparkles, PenLine, FileMusic, Radio } from 'lucide-react';
import PageLayout, { PageHeader, StatPill } from '@/components/PageLayout';

const GENRES = ['Pop', 'EDM', 'Hip Hop', 'R&B', 'Rock', 'Indie', 'Synthwave', 'Jazz', 'Ambient', 'Country'];
const MOODS = ['Uplifting', 'Energetic', 'Chill', 'Emotional', 'Dark', 'Aggressive', 'Dreamy', 'Nostalgic'];

interface PipelineStep {
  id: string;
  agent: string;
  icon: any;
  status: 'pending' | 'running' | 'done' | 'error';
  output?: string;
}

interface SongResult {
  theme: string;
  genre: string;
  mood: string;
  sunoPrompt?: {
    fullPrompt: string;
    copyToSuno: string;
  };
  lyrics?: string;
  transcript?: string;
  style?: string;
}

export default function StudiosMusicPage() {
  const [bridgeStatus, setBridgeStatus] = useState<'online' | 'offline' | 'checking'>('checking');
  const [theme, setTheme] = useState('');
  const [genre, setGenre] = useState('Pop');
  const [mood, setMood] = useState('Uplifting');
  const [mode, setMode] = useState<'full' | 'quick'>('full');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<SongResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const steps: PipelineStep[] = [
    { id: 'lyricist', agent: 'Lyricist', icon: Lyric, status: 'pending' },
    { id: 'composer', agent: 'Composer', icon: Music, status: 'pending' },
    { id: 'critic', agent: 'Critic', icon: Disc3, status: 'pending' },
    { id: 'producer', agent: 'Producer', icon: Radio, status: 'pending' },
  ];

  useEffect(() => {
    checkBridge();
  }, []);

  const checkBridge = async () => {
    setBridgeStatus('checking');
    try {
      const res = await fetch(`${LUXRIG_BRIDGE_URL}/status`, { signal: AbortSignal.timeout(3000) });
      if (res.ok) { setBridgeStatus('online'); setError(null); }
      else setBridgeStatus('offline');
    } catch { setBridgeStatus('offline'); }
  };

  const handleGenerate = async () => {
    if (!theme.trim()) return;
    setIsGenerating(true);
    setResult(null);
    setError(null);

    try {
      let res;
      if (mode === 'quick') {
        res = await fetch(`${LUXRIG_BRIDGE_URL}/music/prompt`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ theme, genre, mood })
        });
      } else {
        res = await fetch(`${LUXRIG_BRIDGE_URL}/music/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ theme, genre, mood, rounds: 1 })
        });
      }

      if (!res.ok) throw new Error(`Bridge error: ${res.status}`);
      const data = await res.json();
      setResult(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (!result?.sunoPrompt) return;
    const text = typeof result.sunoPrompt === 'object'
      ? (result.sunoPrompt as any).copyToSuno || (result.sunoPrompt as any).fullPrompt
      : result.sunoPrompt as string;
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyLyrics = () => {
    if (!result?.lyrics) return;
    navigator.clipboard.writeText(result.lyrics).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <PageLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <PageHeader
          title="Music Studio"
          description="Songwriter pipeline — Lyricist → Composer → Critic → Producer → Suno Prompt"
          icon={<Music size={20} />}
          stats={[
            <StatPill key="bridge" label={bridgeStatus === 'online' ? 'Bridge Online' : bridgeStatus === 'checking' ? 'Connecting...' : 'Bridge Offline'}
              color={bridgeStatus === 'online' ? 'green' : bridgeStatus === 'checking' ? 'amber' : 'red'}
              icon={bridgeStatus === 'online' ? <Wifi size={12} /> : bridgeStatus === 'checking' ? <RefreshCw size={12} className="animate-spin" /> : <WifiOff size={12} />} />,
            <StatPill key="mode" label={mode === 'full' ? 'Full Pipeline' : 'Quick Prompt'} color="purple" icon={<FileMusic size={12} />} />
          ]}
        />

        {/* Bridge Offline Banner */}
        {bridgeStatus === 'offline' && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-center gap-3">
            <WifiOff size={18} className="text-red-400" />
            <p className="text-sm text-red-300">Cannot reach LuxRig Bridge. Start it with <code className="text-white">cd bridge && npm start</code></p>
          </div>
        )}

        {/* Input Panel */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 space-y-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={theme}
              onChange={e => setTheme(e.target.value)}
              placeholder="Song theme or idea..."
              className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-purple-500"
              onKeyDown={e => e.key === 'Enter' && handleGenerate()}
            />
            <select value={genre} onChange={e => setGenre(e.target.value)}
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-purple-500">
              {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
            <select value={mood} onChange={e => setMood(e.target.value)}
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-purple-500">
              {MOODS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          {/* Mode Toggle */}
          <div className="flex items-center gap-4 pt-2">
            <div className="flex gap-2">
              {[{ id: 'full', label: 'Full Pipeline', icon: Mic2 }, { id: 'quick', label: 'Quick Prompt', icon: Sparkles }].map(m => (
                <button key={m.id} onClick={() => setMode(m.id as 'full' | 'quick')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${mode === m.id ? 'bg-purple-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'}`}>
                  <m.icon size={14} /> {m.label}
                </button>
              ))}
            </div>
            <button onClick={handleGenerate} disabled={isGenerating || !theme.trim() || bridgeStatus === 'offline'}
              className="ml-auto flex items-center gap-2 bg-purple-600 hover:bg-purple-500 disabled:bg-zinc-700 disabled:text-zinc-500 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors">
              {isGenerating ? <><RefreshCw size={14} className="animate-spin" /> Generating...</> : <><Play size={14} /> Generate</>}
            </button>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}
        </div>

        {/* Pipeline Steps */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {steps.map((step, i) => {
            const r = result;
            const stepDone = !!r && mode === 'full';
            return (
              <div key={step.id} className={`bg-zinc-900/40 border rounded-lg p-4 text-center transition-all ${
                stepDone ? 'border-green-500/50 bg-green-500/5' : 'border-zinc-800'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 ${
                  stepDone ? 'bg-green-500/20 text-green-400' : 'bg-zinc-800 text-zinc-500'}`}>
                  <step.icon size={18} />
                </div>
                <p className="text-xs font-medium text-zinc-300">{step.agent}</p>
                <p className="text-xs text-zinc-600 mt-0.5">
                  {stepDone ? 'Done' : 'Waiting'}
                </p>
                {i < steps.length - 1 && (
                  <div className="hidden sm:block absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2 text-zinc-700">→</div>
                )}
              </div>
            );
          })}
        </div>

        {/* Result */}
        {result && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Suno Prompt Panel */}
            {result.sunoPrompt && (
              <div className="bg-zinc-900/50 border border-purple-500/30 rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-purple-300 flex items-center gap-2">
                    <Sparkles size={14} /> Suno Prompt
                  </h3>
                  <button onClick={copyToClipboard}
                    className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white px-3 py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 transition-colors">
                    {copied ? <><Check size={12} className="text-green-400" /> Copied</> : <><Copy size={12} /> Copy to Suno</>}
                  </button>
                </div>
                <p className="text-xs text-zinc-500 mb-3">{result.genre} · {result.mood} · Theme: {result.theme}</p>
                <div className="bg-black/50 rounded-lg p-4 border border-zinc-800">
                  <p className="text-xs text-zinc-300 leading-relaxed font-mono whitespace-pre-wrap">
                    {typeof result.sunoPrompt === 'object' ? (result.sunoPrompt as any).copyToSuno || (result.sunoPrompt as any).fullPrompt : result.sunoPrompt}
                  </p>
                </div>
                <a href="https://suno.com/create" target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-1.5 mt-3 text-xs text-purple-400 hover:text-purple-300">
                  Open Suno <Sparkles size={12} />
                </a>
              </div>
            )}

            {/* Lyrics Panel */}
            {result.lyrics && (
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
                    <Lyric size={14} /> Lyrics
                  </h3>
                  <button onClick={copyLyrics}
                    className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white px-3 py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 transition-colors">
                    {copied ? <><Check size={12} className="text-green-400" /> Copied</> : <><Copy size={12} /> Copy</>}
                  </button>
                </div>
                <div className="bg-black/50 rounded-lg p-4 border border-zinc-800">
                  <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap">{result.lyrics}</p>
                </div>
              </div>
            )}

            {/* Style Notes */}
            {result.style && (
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
                <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Style Notes</h3>
                <p className="text-sm text-zinc-300">{result.style}</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </PageLayout>
  );
}