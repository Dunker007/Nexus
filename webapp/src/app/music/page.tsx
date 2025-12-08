'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { LUXRIG_BRIDGE_URL } from '@/lib/utils';
import {
  Music, Mic, Radio, Play, Pause, Video, Film,
  Volume2, Heart, Share2, Download, Disc, Activity,
  ExternalLink, Copy, Check, ChevronRight, Sparkles,
  FileVideo, Clapperboard, Upload, Youtube, Newspaper, RefreshCw, Smartphone,
  Wifi, WifiOff, AlertCircle, UserCog
} from 'lucide-react';
import { fetchAllNews, refreshNewsSources, type NewsArticle } from '@/lib/news-service';
import { MUSIC_AGENTS } from '@/lib/music-agents';
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
  { id: 'standard', name: 'Studio Mode', desc: 'Manual composition control', icon: Music, color: 'purple' },
  { id: 'political', name: 'Newsician', desc: 'Political Rap / Truth-to-Power', icon: Mic, color: 'red' },
  { id: 'sentinel', name: 'Midwest Sentinel', desc: 'Faith, Family, Boom Bap', icon: Radio, color: 'blue' },
  { id: 'pop', name: 'Neon Icon', desc: 'Viral Pop & Trends', icon: Sparkles, color: 'pink' },
  { id: 'manager', name: 'Mic (Manager)', desc: 'Strategy & Orchestration', icon: UserCog, color: 'gray' }
];

const GENRES = ['Pop', 'EDM', 'Indie', 'R&B', 'Rock', 'Hip Hop', 'Synthwave', 'Jazz', 'Lofi', 'Ambient'];
const MOODS = ['Uplifting', 'Energetic', 'Chill', 'Emotional', 'Dark', 'Aggressive', 'Dreamy', 'Nostalgic'];

export default function MusicStudioPage() {
  /* State */
  const [mode, setMode] = useState('standard');
  const [theme, setTheme] = useState('');
  const [headlines, setHeadlines] = useState<NewsArticle[]>([]);
  const [selectedHeadline, setSelectedHeadline] = useState<NewsArticle | null>(null);
  const [isLoadingNews, setIsLoadingNews] = useState(false);
  const [genre, setGenre] = useState('Synthwave');
  const [mood, setMood] = useState('Dreamy');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<SongResult | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'create' | 'pipeline' | 'library'>('create');
  const [bridgeStatus, setBridgeStatus] = useState<'online' | 'offline' | 'checking'>('checking');
  const [bridgeError, setBridgeError] = useState<string | null>(null);
  const [pipelineSteps, setPipelineSteps] = useState<PipelineStep[]>([
    { id: 'suno', name: 'Suno AI', icon: Music, status: 'pending', link: 'https://suno.com/create', description: 'Generate AI music from prompt' },
    { id: 'neural', name: 'Neural Frames', icon: Film, status: 'pending', link: 'https://www.neuralframes.com/', description: 'Create AI music visualizer' },
    { id: 'davinci', name: 'DaVinci Resolve', icon: Clapperboard, status: 'pending', description: 'Professional editing & polish' },
    { id: 'youtube', name: 'YouTube', icon: Youtube, status: 'pending', link: 'https://studio.youtube.com/', description: 'Publish to YouTube' },
    { id: 'tiktok', name: 'TikTok', icon: Smartphone, status: 'pending', link: 'https://www.tiktok.com/creator', description: 'Music Shorts & viral clips' }
  ]);

  // Check bridge connection status
  const checkBridgeStatus = async () => {
    setBridgeStatus('checking');
    try {
      const response = await fetch(`${LUXRIG_BRIDGE_URL}/status`, {
        signal: AbortSignal.timeout(5000)
      });
      if (response.ok) {
        setBridgeStatus('online');
        setBridgeError(null);
        return true;
      }
      setBridgeStatus('offline');
      setBridgeError('Bridge returned error');
      return false;
    } catch (error) {
      setBridgeStatus('offline');
      setBridgeError('Cannot connect to LuxRig Bridge');
      return false;
    }
  };

  useEffect(() => {
    // Check bridge status first
    checkBridgeStatus();

    // Load Agents
    fetch(`${LUXRIG_BRIDGE_URL}/music/agents`, { signal: AbortSignal.timeout(5000) })
      .then(res => res.json())
      .then(data => {
        setAgents(data.agents || []);
        setBridgeStatus('online');
        setBridgeError(null);
      })
      .catch(() => {
        setBridgeStatus('offline');
        setBridgeError('Bridge offline - using fallback agents');
        setAgents([
          { id: 'lyricist', name: 'Lyricist', emoji: '✍️', style: 'Poetic', color: 'purple', description: 'Writes song lyrics' },
          { id: 'composer', name: 'Composer', emoji: '🎹', style: 'Melodic', color: 'cyan', description: 'Structures the song' },
          { id: 'producer', name: 'Producer', emoji: '🎧', style: 'Technical', color: 'pink', description: 'Refines the prompt' }
        ]);
      });

    // Load News
    setIsLoadingNews(true);
    fetchAllNews()
      .then(news => setHeadlines(news))
      .catch(err => console.error("News failed", err))
      .finally(() => setIsLoadingNews(false));
  }, []);

  const handleGenerate = async () => {
    if (mode === 'standard' && !theme && !selectedHeadline) return;
    setIsGenerating(true);
    setResult(null);

    // Context
    let topic = selectedHeadline ? selectedHeadline.title : theme;
    let context = selectedHeadline ? selectedHeadline.description : '';

    try {
      let agentType = 'lyricist'; // Default
      let task: any = { action: 'write-lyrics', theme: topic, mood, genre };

      if (mode === 'political') {
        agentType = 'newsician';
        task = {
          action: 'create-political-rap',
          headlines: selectedHeadline ? [selectedHeadline] : [],
          focusArea: 'minnesota'
        };
      } else if (mode === 'sentinel') {
        agentType = 'midwest-sentinel';
        task = {
          action: 'create-sentinel-track',
          headlines: selectedHeadline ? [selectedHeadline] : [],
          focusArea: 'midwest'
        };
      } else if (mode === 'pop') {
        agentType = 'lyricist'; // Use lyricist for Pop for now
        task = { action: 'write-lyrics', theme: topic, mood: 'energetic', genre: 'pop' };
      } else if (mode === 'manager') {
        agentType = 'mic';
        task = {
          action: 'manage-session',
          input: topic + (context ? `\nContext: ${context}` : '')
        };
      }

      // Execute Agent
      const response = await fetch(`${LUXRIG_BRIDGE_URL}/agents/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentType, task })
      });

      if (!response.ok) throw new Error('Agent execution failed');
      const data = await response.json();
      const agentResult = data.result;

      // Map Agent result to UI format
      let sunoPromptText = '';
      let copyContent = '';

      if (agentResult.sunoPrompt) {
        // Unify format
        const sp = agentResult.sunoPrompt;
        sunoPromptText = sp.fullPrompt || sp; // Handle string or obj
        copyContent = sp.copyToSuno || sp;
      } else {
        // Fallback if no explicit suno prompt
        copyContent = JSON.stringify(agentResult, null, 2);
      }

      const finalResult = {
        theme: topic,
        genre: agentResult.genre || genre,
        mood: agentResult.mood || mood,
        sunoPrompt: {
          fullPrompt: sunoPromptText || "See copy text",
          copyToSuno: copyContent
        },
        ready: true
      };

      setResult(finalResult);

      // Save to Content Queue
      try {
        await fetch(`${LUXRIG_BRIDGE_URL}/content/queue`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'song',
            data: {
              ...finalResult,
              agentType,
              mode,
              source: selectedHeadline ? 'news' : 'manual'
            }
          })
        });
        console.log("Saved to content queue");
      } catch (qErr) {
        console.error("Failed to save to queue:", qErr);
      }

      // Activate pipeline
      setPipelineSteps(steps => steps.map((s, i) => i === 0 ? { ...s, status: 'active' } : s));

    } catch (error) {
      console.error("Generation failed:", error);
      alert("Failed to generate track. Bridge may be offline or agent not found.");
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
            {/* Bridge Connection Status */}
            <StatPill
              label={bridgeStatus === 'online' ? 'Bridge Online' : bridgeStatus === 'checking' ? 'Connecting...' : 'Bridge Offline'}
              color={bridgeStatus === 'online' ? 'green' : bridgeStatus === 'checking' ? 'amber' : 'red'}
              pulse={bridgeStatus === 'checking'}
              icon={bridgeStatus === 'online' ? <Wifi size={12} /> : bridgeStatus === 'checking' ? <RefreshCw size={12} className="animate-spin" /> : <WifiOff size={12} />}
            />
            <StatPill label={`${agents.length} Agents`} color="green" />
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

      {/* Bridge Offline Warning */}
      {bridgeStatus === 'offline' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3"
        >
          <AlertCircle size={20} className="text-red-400 shrink-0" />
          <div className="flex-1">
            <div className="text-sm font-medium text-red-300">Bridge Offline</div>
            <div className="text-xs text-red-400/70">
              {bridgeError || 'Cannot connect to LuxRig Bridge. Using fallback agents with local generation.'}
            </div>
          </div>
          <button
            onClick={checkBridgeStatus}
            className="px-3 py-1.5 text-xs font-medium bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <RefreshCw size={12} />
            Retry
          </button>
        </motion.div>
      )}

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

            {/* News Source Selector */}
            {(mode !== 'standard' || activeTab === 'create') && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass-card p-6 mb-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <Newspaper size={18} className="text-cyan-400" />
                    Source Material
                  </h2>
                  <button
                    onClick={() => {
                      setIsLoadingNews(true);
                      refreshNewsSources()
                        .then(() => fetchAllNews())
                        .then(n => { setHeadlines(n); setIsLoadingNews(false); })
                        .catch(() => setIsLoadingNews(false));
                    }}
                    className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                  >
                    <RefreshCw size={14} className={isLoadingNews ? 'animate-spin' : ''} />
                  </button>
                </div>

                <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar snap-x">
                  {headlines.map(article => (
                    <button
                      key={article.id}
                      onClick={() => {
                        setSelectedHeadline(selectedHeadline?.id === article.id ? null : article);
                        setTheme(selectedHeadline?.id === article.id ? '' : article.title);
                      }}
                      className={`flex-shrink-0 w-64 p-3 rounded-xl border text-left transition-all snap-start group relative overflow-hidden ${selectedHeadline?.id === article.id
                        ? 'bg-cyan-500/20 border-cyan-500/50 shadow-lg shadow-cyan-500/10'
                        : 'bg-black/40 border-white/10 hover:bg-white/5 hover:border-white/20'
                        }`}
                    >
                      <div className="flex items-center gap-2 mb-2 text-xs text-gray-400">
                        <span>{article.source.logo}</span>
                        <span className="truncate max-w-[100px]">{article.source.name}</span>
                        <span className={`ml-auto px-1.5 py-0.5 rounded text-[10px] uppercase ${article.category === 'local' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'
                          }`}>{article.category}</span>
                      </div>
                      <h4 className={`text-sm font-medium line-clamp-3 mb-2 group-hover:text-cyan-400 transition-colors ${selectedHeadline?.id === article.id ? 'text-white' : 'text-gray-300'}`}>
                        {article.title}
                      </h4>
                      <div className="text-[10px] text-gray-500 flex justify-between">
                        <span>{new Date(article.pubDate).toLocaleDateString()}</span>
                      </div>
                    </button>
                  ))}
                  {headlines.length === 0 && !isLoadingNews && (
                    <div className="w-full text-center py-8 text-gray-500 text-sm">
                      No news loaded. Check connection.
                    </div>
                  )}
                </div>
              </motion.div>
            )}

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

              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    {selectedHeadline ? 'Selected Context' : 'Topic / Theme'}
                  </label>
                  <textarea
                    value={theme}
                    onChange={e => {
                      setTheme(e.target.value);
                      if (selectedHeadline) setSelectedHeadline(null); // Clear selection if typing manually
                    }}
                    placeholder={mode === 'standard' ? "e.g. Neon city nights..." : "Select a headline above or type a topic..."}
                    className={`w-full bg-[#0a0a0f] border rounded-lg px-4 py-3 focus:outline-none transition-colors min-h-[80px] text-sm resize-none ${selectedHeadline
                      ? 'border-cyan-500/50 text-cyan-100'
                      : 'border-white/10 focus:border-purple-400'
                      }`}
                  />
                </div>

                {mode === 'standard' && (
                  <>
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
                  </>
                )}

                {mode !== 'standard' && (
                  <div className={`border rounded-lg p-4 text-sm ${mode === 'political' ? 'bg-red-500/10 border-red-500/20 text-red-200' :
                    mode === 'sentinel' ? 'bg-blue-500/10 border-blue-500/20 text-blue-200' :
                      'bg-pink-500/10 border-pink-500/20 text-pink-200'
                    }`}>
                    <div className="font-bold mb-2 flex items-center gap-2">
                      {(() => {
                        const m = MODES.find(m => m.id === mode);
                        const Icon = m?.icon;
                        return Icon && <Icon size={16} />;
                      })()}
                      {MODES.find(m => m.id === mode)?.name} Persona Active
                    </div>
                    <p className="opacity-80">
                      {MUSIC_AGENTS[mode]?.description || "This agent operates autonomously."}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-8">
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || (!theme && !selectedHeadline)}
                  className={`w-full py-4 rounded-xl font-bold text-white shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${mode === 'political' ? 'bg-gradient-to-r from-red-600 to-orange-600 shadow-red-900/40' :
                    mode === 'sentinel' ? 'bg-gradient-to-r from-blue-600 to-cyan-600 shadow-blue-900/40' :
                      mode === 'pop' ? 'bg-gradient-to-r from-pink-500 to-purple-500 shadow-pink-900/40' :
                        mode === 'manager' ? 'bg-gradient-to-r from-gray-700 to-gray-900 shadow-gray-900/40' :
                          'bg-gradient-to-r from-purple-600 to-pink-600 shadow-purple-900/40'
                    }`}
                >
                  {isGenerating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Composing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={20} />
                      <span>{selectedHeadline ? 'Auto-Compose Track' : 'Generate Track'}</span>
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
            <div className="grid grid-cols-3 gap-4">
              <a
                href="https://studio.youtube.com/"
                target="_blank"
                className="glass-card p-4 flex items-center gap-3 hover:border-red-500/30 transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                  <Youtube className="text-red-400" size={20} />
                </div>
                <div>
                  <div className="font-medium group-hover:text-red-400 transition-colors">YouTube</div>
                  <div className="text-xs text-gray-500">Upload & publish</div>
                </div>
                <ExternalLink size={14} className="ml-auto text-gray-600" />
              </a>
              <a
                href="https://www.tiktok.com/creator"
                target="_blank"
                className="glass-card p-4 flex items-center gap-3 hover:border-pink-500/30 transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center">
                  <Smartphone className="text-pink-400" size={20} />
                </div>
                <div>
                  <div className="font-medium group-hover:text-pink-400 transition-colors">TikTok</div>
                  <div className="text-xs text-gray-500">Music Shorts</div>
                </div>
                <ExternalLink size={14} className="ml-auto text-gray-600" />
              </a>
              <a
                href="#"
                className="glass-card p-4 flex items-center gap-3 hover:border-blue-500/30 transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Share2 className="text-blue-400" size={20} />
                </div>
                <div>
                  <div className="font-medium group-hover:text-blue-400 transition-colors">DistroKid</div>
                  <div className="text-xs text-gray-500">Distribution</div>
                </div>
                <ExternalLink size={14} className="ml-auto text-gray-600" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Pipeline Tab Placeholder */}
      {activeTab === 'pipeline' && (
        <div className="flex flex-col items-center justify-center h-[400px] text-gray-500">
          <Film size={48} className="mb-4 opacity-50" />
          <h3 className="text-lg font-medium">Production Pipeline</h3>
          <p>Task kanban and status tracking coming soon.</p>
        </div>
      )}

      {/* Library Tab Placeholder */}
      {activeTab === 'library' && (
        <div className="flex flex-col items-center justify-center h-[400px] text-gray-500">
          <Music size={48} className="mb-4 opacity-50" />
          <h3 className="text-lg font-medium">Concept Library</h3>
          <p>History of generated concepts coming soon.</p>
        </div>
      )}

    </PageLayout>
  );
}
