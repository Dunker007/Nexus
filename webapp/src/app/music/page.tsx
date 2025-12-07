'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { LUXRIG_BRIDGE_URL } from '@/lib/utils';
import {
  Music, Mic, Radio, Play, Pause, Video, Film,
  Volume2, Heart, Share2, Download, Disc, Activity,
  ExternalLink, Copy, Check, ChevronRight, Sparkles,
  FileVideo, Clapperboard, Upload, Youtube
} from 'lucide-react';
import PageLayout, { PageHeader, StatPill } from '@/components/PageLayout';

// --- Types ---
interface Agent {
  id: string;
  name: string;
  description: string;
  emoji: string;
  color: string;
  style: string;
}

interface SongResult {
  theme: string;
  genre: string;
  mood: string;
  sunoPrompt: {
    fullPrompt: string;
    copyToSuno: string;
  };
  ready: boolean;
}

interface PipelineStep {
  id: string;
  name: string;
  icon: any;
  status: 'pending' | 'active' | 'complete';
  link?: string;
  description: string;
}

const MODES = [
  { id: 'standard', name: 'Standard Mode', desc: 'Collaborative AI songwriting', icon: Music, color: 'purple' },
  { id: 'political', name: 'Newsician', desc: 'Political rap duo (Explicit)', icon: Mic, color: 'red' },
  { id: 'sentinel', name: 'Midwest Sentinel', desc: 'Boom Bap storytelling (Clean)', icon: Radio, color: 'blue' }
];

const GENRES = ['Pop', 'EDM', 'Indie', 'R&B', 'Rock', 'Hip Hop', 'Synthwave', 'Jazz', 'Lofi', 'Ambient'];
const MOODS = ['Uplifting', 'Energetic', 'Chill', 'Emotional', 'Dark', 'Aggressive', 'Dreamy', 'Nostalgic'];

export default function MusicStudioPage() {
  const [mode, setMode] = useState('standard');
  const [theme, setTheme] = useState('');
  const [genre, setGenre] = useState('Synthwave');
  const [mood, setMood] = useState('Dreamy');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<SongResult | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'create' | 'pipeline' | 'library'>('create');
  const [pipelineSteps, setPipelineSteps] = useState<PipelineStep[]>([
    { id: 'suno', name: 'Suno AI', icon: Music, status: 'pending', link: 'https://suno.com/create', description: 'Generate AI music from prompt' },
    { id: 'neural', name: 'Neural Frames', icon: Film, status: 'pending', link: 'https://www.neuralframes.com/', description: 'Create AI music visualizer' },
    { id: 'davinci', name: 'DaVinci Resolve', icon: Clapperboard, status: 'pending', description: 'Professional editing & polish' },
    { id: 'youtube', name: 'YouTube Upload', icon: Youtube, status: 'pending', link: 'https://studio.youtube.com/', description: 'Publish to YouTube' }
  ]);

  useEffect(() => {
    fetch(`${LUXRIG_BRIDGE_URL}/music/agents`)
      .then(res => res.json())
      .then(data => setAgents(data.agents || []))
      .catch(() => {
        // Fallback agents if bridge not running
        setAgents([
          { id: 'lyricist', name: 'Lyricist', emoji: '✍️', style: 'Poetic', color: 'purple', description: 'Writes song lyrics' },
          { id: 'composer', name: 'Composer', emoji: '🎹', style: 'Melodic', color: 'cyan', description: 'Structures the song' },
          { id: 'producer', name: 'Producer', emoji: '🎧', style: 'Technical', color: 'pink', description: 'Refines the prompt' }
        ]);
      });
  }, []);

  const handleGenerate = async () => {
    if (!theme && mode === 'standard') return;
    setIsGenerating(true);
    setResult(null);

    try {
      const endpoint = mode === 'standard'
        ? `${LUXRIG_BRIDGE_URL}/music/create`
        : mode === 'political'
          ? `${LUXRIG_BRIDGE_URL}/music/political`
          : `${LUXRIG_BRIDGE_URL}/music/sentinel`;

      const body = mode === 'standard'
        ? { theme, genre, mood }
        : { focusArea: 'minnesota' };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        const data = await res.json();
        setResult(data);
        // Activate first pipeline step
        setPipelineSteps(steps => steps.map((s, i) =>
          i === 0 ? { ...s, status: 'active' } : s
        ));
      } else {
        // Generate locally if bridge fails
        setResult({
          theme,
          genre,
          mood,
          sunoPrompt: {
            fullPrompt: `${mood} ${genre} song about ${theme}`,
            copyToSuno: `[Genre: ${genre}]\n[Mood: ${mood}]\n[Style: Modern, polished production]\n\nLyrics about: ${theme}\n\nInstrumental: ${genre.toLowerCase()} beat with atmospheric synths and punchy drums`
          },
          ready: true
        });
        setPipelineSteps(steps => steps.map((s, i) =>
          i === 0 ? { ...s, status: 'active' } : s
        ));
      }
    } catch (e) {
      // Fallback generation
      setResult({
        theme,
        genre,
        mood,
        sunoPrompt: {
          fullPrompt: `${mood} ${genre} song about ${theme}`,
          copyToSuno: `[Genre: ${genre}]\n[Mood: ${mood}]\n[Style: Modern, polished production]\n\nLyrics about: ${theme}\n\nInstrumental: ${genre.toLowerCase()} beat with atmospheric synths and punchy drums`
        },
        ready: true
      });
      setPipelineSteps(steps => steps.map((s, i) =>
        i === 0 ? { ...s, status: 'active' } : s
      ));
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (result) {
      navigator.clipboard.writeText(result.sunoPrompt.copyToSuno);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const advancePipeline = (stepId: string) => {
    setPipelineSteps(steps => {
      const idx = steps.findIndex(s => s.id === stepId);
      if (idx === -1) return steps;

      return steps.map((s, i) => {
        if (i === idx) return { ...s, status: 'complete' };
        if (i === idx + 1) return { ...s, status: 'active' };
        return s;
      });
    });
  };

  return (
    <PageLayout color="purple" showDecorations={true}>
      {/* Header using PageHeader component */}
      <PageHeader
        title="Music"
        titleAccent="Studio"
        subtitle="Suno → Neural Frames → DaVinci → YouTube"
        icon={<Music size={28} className="text-purple-400" />}
        color="purple"
        stats={
          <>
            <StatPill label={`${agents.length} Agents`} color="green" pulse />
            <StatPill label={MODES.find(m => m.id === mode)?.name || 'Standard'} color="purple" />
            {result && (
              <StatPill
                label="Track Ready"
                color="pink"
                icon={<Disc size={12} className="animate-spin" style={{ animationDuration: '3s' }} />}
              />
            )}
          </>
        }
        actions={
          <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
            {[
              { id: 'create', label: 'Create', icon: Sparkles },
              { id: 'pipeline', label: 'Pipeline', icon: Film },
              { id: 'library', label: 'Library', icon: Music }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === tab.id
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                  : 'text-gray-400 hover:text-white'
                  }`}
              >
                <tab.icon size={14} />
                {tab.label}
              </button>
            ))}
          </div>
        }
      />

      {/* Create Tab */}
      {activeTab === 'create' && (
        <div className="grid lg:grid-cols-3 gap-8">

          {/* Left: Controls */}
          <div className="space-y-6">
            {/* Mode Selector */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card p-4"
            >
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Mode</h3>
              <div className="space-y-2">
                {MODES.map(m => (
                  <button
                    key={m.id}
                    onClick={() => setMode(m.id)}
                    className={`w-full px-4 py-3 rounded-lg text-left transition-all flex items-center gap-3 ${mode === m.id
                      ? 'bg-purple-500/20 border border-purple-500/30'
                      : 'bg-white/5 border border-white/5 hover:border-white/20'
                      }`}
                  >
                    <m.icon size={18} className={mode === m.id ? 'text-purple-400' : 'text-gray-500'} />
                    <div>
                      <div className={`font-medium text-sm ${mode === m.id ? 'text-white' : 'text-gray-300'}`}>{m.name}</div>
                      <div className="text-xs text-gray-500">{m.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Configuration */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-6"
            >
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Activity size={18} className="text-cyan-400" />
                Configuration
              </h2>

              {mode === 'standard' ? (
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Theme / Prompt</label>
                    <input
                      type="text"
                      value={theme}
                      onChange={e => setTheme(e.target.value)}
                      placeholder="e.g. Neon city nights, lonely hearts..."
                      className="w-full bg-[#0a0a0f] border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-400 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Genre</label>
                    <div className="flex flex-wrap gap-2">
                      {GENRES.map(g => (
                        <button
                          key={g}
                          onClick={() => setGenre(g)}
                          className={`px-3 py-1.5 rounded text-xs transition-all ${genre === g
                            ? 'bg-purple-500 text-white shadow-[0_0_10px_rgba(168,85,247,0.4)]'
                            : 'bg-white/5 text-gray-400 hover:bg-white/10'
                            }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Mood</label>
                    <div className="flex flex-wrap gap-2">
                      {MOODS.map(m => (
                        <button
                          key={m}
                          onClick={() => setMood(m)}
                          className={`px-3 py-1.5 rounded text-xs transition-all ${mood === m
                            ? 'bg-cyan-500 text-black font-semibold shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                            : 'bg-white/5 text-gray-400 hover:bg-white/10'
                            }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-sm text-red-200">
                  <div className="font-bold mb-2 flex items-center gap-2">
                    <Radio size={16} /> Autonomous Mode
                  </div>
                  This agent operates autonomously. It will scan news sources, select topics, and generate lyrics automatically.
                </div>
              )}

              <div className="mt-8">
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || (mode === 'standard' && !theme)}
                  className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-bold text-white shadow-lg shadow-purple-900/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Composing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={20} />
                      <span>Generate Track</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>

            {/* Agents Status */}
            <div className="glass-card p-4">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Active Agents</h3>
              <div className="space-y-2">
                {agents.map(agent => (
                  <div key={agent.id} className="flex items-center gap-3 p-2 rounded-lg bg-white/5 border border-white/5">
                    <div className="text-xl">{agent.emoji}</div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{agent.name}</div>
                      <div className="text-xs text-gray-500">{agent.style}</div>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_5px_#22c55e]" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Center + Right: Output */}
          <div className="lg:col-span-2 space-y-6">

            {/* Prompt Display */}
            {result ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-0 overflow-hidden border-purple-500/30"
              >
                <div className="bg-gradient-to-r from-purple-900/40 to-pink-900/40 p-4 border-b border-white/10 flex items-center justify-between">
                  <h3 className="font-bold flex items-center gap-2">
                    <Disc className="text-purple-400" />
                    Ready for Suno
                  </h3>
                  <button
                    onClick={copyToClipboard}
                    className="text-xs bg-purple-500 hover:bg-purple-400 text-white px-3 py-1.5 rounded transition-colors flex items-center gap-1"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? 'Copied!' : 'Copy Prompt'}
                  </button>
                </div>
                <div className="p-6">
                  <div className="bg-[#0a0a0f] rounded-xl p-4 font-mono text-sm text-gray-300 whitespace-pre-wrap border border-white/10 max-h-[300px] overflow-y-auto custom-scrollbar">
                    {result.sunoPrompt.copyToSuno}
                  </div>

                  {/* Quick Actions */}
                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <a
                      href="https://suno.com/create"
                      target="_blank"
                      onClick={() => advancePipeline('suno')}
                      className="py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border border-purple-500/30 rounded-lg text-center font-medium transition-all flex items-center justify-center gap-2 group"
                    >
                      <Music className="text-purple-400 group-hover:scale-110 transition-transform" size={18} />
                      Open Suno
                      <ExternalLink size={12} className="opacity-50" />
                    </a>
                    <a
                      href="https://www.neuralframes.com/"
                      target="_blank"
                      onClick={() => advancePipeline('neural')}
                      className="py-3 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 border border-cyan-500/30 rounded-lg text-center font-medium transition-all flex items-center justify-center gap-2 group"
                    >
                      <Film className="text-cyan-400 group-hover:scale-110 transition-transform" size={18} />
                      Neural Frames
                      <ExternalLink size={12} className="opacity-50" />
                    </a>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="h-[400px] glass-card flex flex-col items-center justify-center text-center p-8 border-dashed border-2 border-white/10 bg-white/5">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-6">
                  <Music size={40} className="text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-300 mb-2">Studio Ready</h3>
                <p className="text-gray-500 max-w-sm">
                  Enter a theme, select genre and mood, then generate your next hit.
                </p>
              </div>
            )}

            {/* Production Pipeline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-6"
            >
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Film className="text-cyan-400" />
                Production Pipeline
              </h3>
              <div className="flex items-center justify-between">
                {pipelineSteps.map((step, idx) => (
                  <div key={step.id} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${step.status === 'complete' ? 'bg-green-500/20 border-green-500/50' :
                        step.status === 'active' ? 'bg-purple-500/20 border-purple-500/50 animate-pulse' :
                          'bg-white/5 border-white/10'
                        } border`}>
                        {step.status === 'complete' ? (
                          <Check className="text-green-400" size={20} />
                        ) : (
                          <step.icon size={20} className={
                            step.status === 'active' ? 'text-purple-400' : 'text-gray-500'
                          } />
                        )}
                      </div>
                      <span className={`text-xs mt-2 ${step.status === 'complete' ? 'text-green-400' :
                        step.status === 'active' ? 'text-purple-400' :
                          'text-gray-500'
                        }`}>{step.name}</span>
                      {step.status === 'active' && step.link && (
                        <a
                          href={step.link}
                          target="_blank"
                          onClick={() => advancePipeline(step.id)}
                          className="text-[10px] text-cyan-400 hover:underline mt-1"
                        >
                          Open →
                        </a>
                      )}
                    </div>
                    {idx < pipelineSteps.length - 1 && (
                      <ChevronRight className={`mx-2 ${pipelineSteps[idx + 1].status !== 'pending' ? 'text-purple-400' : 'text-gray-700'
                        }`} size={20} />
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-4 text-center">
                Click each step when complete to track your progress
              </p>
            </motion.div>

            {/* External Tools */}
            <div className="grid grid-cols-2 gap-4">
              <a
                href="https://studio.youtube.com/"
                target="_blank"
                className="glass-card p-4 flex items-center gap-3 hover:border-red-500/30 transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                  <Youtube className="text-red-400" size={20} />
                </div>
                <div>
                  <div className="font-medium group-hover:text-red-400 transition-colors">YouTube Studio</div>
                  <div className="text-xs text-gray-500">Upload & publish</div>
                </div>
                <ExternalLink size={14} className="ml-auto text-gray-600" />
              </a>
              <a
                href="https://www.blackmagicdesign.com/products/davinciresolve"
                target="_blank"
                className="glass-card p-4 flex items-center gap-3 hover:border-orange-500/30 transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                  <Clapperboard className="text-orange-400" size={20} />
                </div>
                <div>
                  <div className="font-medium group-hover:text-orange-400 transition-colors">DaVinci Resolve</div>
                  <div className="text-xs text-gray-500">Pro video editing</div>
                </div>
                <ExternalLink size={14} className="ml-auto text-gray-600" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Pipeline Tab */}
      {activeTab === 'pipeline' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          <div className="glass-card p-8">
            <h2 className="text-2xl font-bold mb-6 text-center">Music Production Pipeline</h2>
            <div className="max-w-4xl mx-auto">
              <div className="grid gap-6">
                {[
                  { step: 1, name: 'AI Composition', tool: 'Suno AI', icon: Music, color: 'purple', desc: 'Generate AI music from text prompts. Export as MP3/WAV.', tips: ['Use specific genre tags', 'Include mood descriptors', 'Mention instruments'] },
                  { step: 2, name: 'Visual Creation', tool: 'Neural Frames', icon: Film, color: 'cyan', desc: 'Create stunning AI music videos with beat-synced visuals.', tips: ['Upload your Suno track', 'Choose visual style', 'Sync to audio'] },
                  { step: 3, name: 'Professional Polish', tool: 'DaVinci Resolve', icon: Clapperboard, color: 'orange', desc: 'Add intros, outros, titles, and final touches.', tips: ['Add channel branding', 'Color grade', 'Export 4K'] },
                  { step: 4, name: 'Distribution', tool: 'YouTube', icon: Youtube, color: 'red', desc: 'Upload and optimize for discovery.', tips: ['SEO-rich title', 'Custom thumbnail', 'Playlists'] }
                ].map(item => (
                  <div key={item.step} className={`glass-card p-6 border-l-4 border-${item.color}-500`}>
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl bg-${item.color}-500/20 flex items-center justify-center shrink-0`}>
                        <item.icon className={`text-${item.color}-400`} size={24} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs px-2 py-0.5 bg-white/10 rounded">Step {item.step}</span>
                          <h3 className="font-bold">{item.name}</h3>
                        </div>
                        <p className="text-gray-400 text-sm mb-3">{item.desc}</p>
                        <div className="flex flex-wrap gap-2">
                          {item.tips.map(tip => (
                            <span key={tip} className="text-xs px-2 py-1 bg-white/5 rounded text-gray-500">
                              💡 {tip}
                            </span>
                          ))}
                        </div>
                      </div>
                      <a
                        href={item.tool === 'Suno AI' ? 'https://suno.com' :
                          item.tool === 'Neural Frames' ? 'https://neuralframes.com' :
                            item.tool === 'YouTube' ? 'https://youtube.com' : '#'}
                        target="_blank"
                        className={`px-4 py-2 rounded-lg bg-${item.color}-500/20 text-${item.color}-400 text-sm hover:bg-${item.color}-500/30 transition-colors flex items-center gap-1`}
                      >
                        {item.tool}
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Library Tab */}
      {activeTab === 'library' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-8 text-center"
        >
          <div className="w-20 h-20 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-6">
            <Music size={40} className="text-purple-400" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Song Library</h2>
          <p className="text-gray-400 mb-6">Your generated tracks and production history will appear here.</p>
          <div className="text-sm text-gray-600">
            Coming soon: Track history, favorites, and quick re-generate
          </div>
        </motion.div>
      )}

    </PageLayout>
  );
}
