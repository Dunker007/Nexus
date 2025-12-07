'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Film, Music, Upload, Play, Pause, Settings, Share2, Monitor, ExternalLink, Video, Clock, CheckCircle, AlertCircle, RefreshCw, Wand2 } from 'lucide-react';
import Link from 'next/link';

const projects = [
    { id: 1, name: 'Neon City Drive', status: 'completed', duration: '3:45', thumbnail: '/thumbnails/neon.jpg', date: '2h ago' },
    { id: 2, name: 'Cyberpunk Glitch', status: 'rendering', progress: 45, duration: '2:12', thumbnail: '/thumbnails/glitch.jpg', date: 'In progress' },
    { id: 3, name: 'Lo-Fi Study Session', status: 'draft', duration: '15:00', thumbnail: '/thumbnails/lofi.jpg', date: '1d ago' },
];

const RENDER_STEPS = [
    "Analyzing Audio Spectrum...",
    "Extracting Bass Stems...",
    "Generating Neural Noise...",
    "Syncing Reactivity...",
    "Rendering Frames...",
    "Finalizing Encode..."
];

// Simple CSS Audio Visualizer
const AudioVisualizer = ({ isPlaying }: { isPlaying: boolean }) => {
    return (
        <div className="flex items-end justify-center gap-1 h-32 w-full px-12">
            {[...Array(20)].map((_, i) => (
                <motion.div
                    key={i}
                    className="w-4 bg-orange-500 rounded-t-md opacity-80"
                    animate={isPlaying ? {
                        height: [40, Math.random() * 120 + 20, 40],
                    } : { height: 20 }}
                    transition={{
                        repeat: Infinity,
                        duration: 0.5 + Math.random() * 0.5,
                        ease: "easeInOut"
                    }}
                />
            ))}
        </div>
    );
};

export default function VideoStudioPage() {
    const [selectedAudio, setSelectedAudio] = useState<string | null>(null);
    const [prompt, setPrompt] = useState('Cyberpunk city with neon lights, rain, glitch effects');
    const [reactivity, setReactivity] = useState(75);

    // Rendering State
    const [isRendering, setIsRendering] = useState(false);
    const [renderStep, setRenderStep] = useState(0);
    const [renderProgress, setRenderProgress] = useState(0);
    const [resultReady, setResultReady] = useState(false);

    // Playback State
    const [isPlaying, setIsPlaying] = useState(false);

    const handleRender = () => {
        setIsRendering(true);
        setRenderStep(0);
        setRenderProgress(0);
        setResultReady(false);

        // Simulate complex rendering process
        let step = 0;
        const interval = setInterval(() => {
            setRenderProgress(prev => {
                const next = prev + 1;
                if (next % 20 === 0 && step < RENDER_STEPS.length - 1) {
                    step++;
                    setRenderStep(step);
                }
                return next;
            });
        }, 100); // Total ~10s render

        setTimeout(() => {
            clearInterval(interval);
            setIsRendering(false);
            setResultReady(true);
            setRenderProgress(100);
        }, 10000);
    };

    return (
        <div className="min-h-screen pt-20 pb-12 bg-[#050508] text-white">
            {/* Background Gradients */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-900/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-red-900/10 rounded-full blur-[120px]"></div>
            </div>

            <div className="container-main relative z-10">
                {/* Header */}
                <div className="flex items-center gap-2 mb-8 text-sm text-orange-400">
                    <Link href="/studios" className="hover:underline">Studios</Link>
                    <span>/</span>
                    <span>Video</span>
                </div>

                <div className="mb-8 flex justify-between items-end">
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent mb-2">
                            Video Studio
                        </h1>
                        <p className="text-gray-400">
                            Create AI-powered music videos and visualizers. Powered by Neural Frames.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Panel: Inputs */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* Audio Source Card */}
                        <div className="glass-card p-4 space-y-4">
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                                <Music className="text-orange-500" size={20} /> Audio Source
                            </h3>

                            <div className="space-y-2">
                                <button
                                    onClick={() => setSelectedAudio('upload')}
                                    className={`w-full p-3 rounded-lg border text-left flex items-center gap-3 transition-colors ${selectedAudio === 'upload' ? 'bg-orange-500/20 border-orange-500' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                                >
                                    <div className="p-2 bg-orange-500/20 rounded-lg"><Upload size={16} className="text-orange-400" /></div>
                                    <div className="flex-1">
                                        <div className="text-sm font-medium">Upload File</div>
                                        <div className="text-xs text-gray-500">MP3, WAV, FLAC</div>
                                    </div>
                                </button>
                                <button
                                    onClick={() => setSelectedAudio('suno')}
                                    className={`w-full p-3 rounded-lg border text-left flex items-center gap-3 transition-colors ${selectedAudio === 'suno' ? 'bg-orange-500/20 border-orange-500' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                                >
                                    <div className="p-2 bg-purple-500/20 rounded-lg"><Music size={16} className="text-purple-400" /></div>
                                    <div className="flex-1">
                                        <div className="text-sm font-medium">From Music Studio</div>
                                        <div className="text-xs text-gray-500">Select generated track</div>
                                    </div>
                                </button>
                            </div>

                            <AnimatePresence>
                                {selectedAudio === 'suno' && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="p-3 bg-black/30 rounded-lg text-xs text-gray-400 border border-white/5 mt-2">
                                            <p className="mb-2 font-semibold text-gray-300">Recent Tracks:</p>
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 p-2 rounded hover:bg-white/10 cursor-pointer border border-transparent hover:border-white/10 transition-colors">
                                                    <div className="w-8 h-8 bg-purple-500/20 rounded flex items-center justify-center">🎵</div>
                                                    <div className="flex-1">
                                                        <div className="text-white">Neon Nights</div>
                                                        <div>3:45 • Electro</div>
                                                    </div>
                                                    <CheckCircle size={14} className="text-green-500" />
                                                </div>
                                                <div className="flex items-center gap-2 p-2 rounded hover:bg-white/10 cursor-pointer border border-transparent hover:border-white/10 transition-colors opacity-50">
                                                    <div className="w-8 h-8 bg-purple-500/20 rounded flex items-center justify-center">🎵</div>
                                                    <div className="flex-1">
                                                        <div className="text-white">Cyber Chase</div>
                                                        <div>2:12 • Synthwave</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Settings Card */}
                        <div className="glass-card p-4 space-y-4">
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                                <Settings className="text-orange-500" size={20} /> Parameters
                            </h3>
                            <div>
                                <label className="text-sm text-gray-400 mb-1 block flex justify-between">
                                    Visual Prompt
                                    <span className="text-xs text-orange-400 flex items-center gap-1 cursor-pointer hover:text-orange-300"><Wand2 size={10} /> Enhance</span>
                                </label>
                                <textarea
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm h-32 resize-none focus:border-orange-500 outline-none transition-colors"
                                    placeholder="Describe the visual style..."
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-400 mb-1 block flex justify-between">
                                    Audio Reactivity
                                    <span className="text-white">{reactivity}%</span>
                                </label>
                                <input
                                    type="range"
                                    min="0" max="100"
                                    value={reactivity}
                                    onChange={(e) => setReactivity(parseInt(e.target.value))}
                                    className="w-full accent-orange-500 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                                />
                                <div className="flex justify-between text-xs text-gray-500 mt-2">
                                    <span>Subtle</span>
                                    <span>Intense</span>
                                </div>
                            </div>
                        </div>

                        {/* Render Button */}
                        <button
                            onClick={handleRender}
                            disabled={isRendering || !selectedAudio}
                            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all relative overflow-hidden group ${isRendering || !selectedAudio
                                ? 'bg-white/5 text-gray-500 cursor-not-allowed'
                                : 'bg-gradient-to-r from-orange-500 to-red-600 hover:scale-[1.02] shadow-lg shadow-orange-900/20'
                                }`}
                        >
                            {isRendering ? (
                                <>
                                    <div className="absolute inset-0 bg-black/20" style={{ width: `${renderProgress}%` }}></div>
                                    <div className="relative flex items-center gap-2 text-white">
                                        <RefreshCw size={18} className="animate-spin" />
                                        Processing... {renderProgress}%
                                    </div>
                                </>
                            ) : (
                                <>
                                    <Film size={20} />
                                    Render Video
                                </>
                            )}
                        </button>
                    </div>

                    {/* Center: Preview / Player */}
                    <div className="lg:col-span-6 flex flex-col gap-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-black border border-white/10 rounded-2xl aspect-video overflow-hidden relative group shadow-2xl"
                        >
                            {/* Rendering State Overlay */}
                            <AnimatePresence>
                                {isRendering && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="absolute inset-0 z-20 bg-black/90 flex flex-col items-center justify-center p-8 text-center"
                                    >
                                        <div className="w-20 h-20 mb-6 relative">
                                            <div className="absolute inset-0 border-4 border-orange-500/20 rounded-full"></div>
                                            <div className="absolute inset-0 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                                            <div className="absolute inset-0 flex items-center justify-center text-orange-500 font-bold">
                                                {renderProgress}%
                                            </div>
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-2">{RENDER_STEPS[renderStep]}</h3>
                                        <p className="text-gray-400 text-sm max-w-sm">
                                            Neural Frames is generating latent noise patterns based on your audio spectrum analysis.
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Result / Playback State */}
                            {resultReady ? (
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-black flex items-center justify-center overflow-hidden">
                                    <div className="absolute inset-0 bg-[url('/grid.png')] opacity-20"></div>

                                    {/* Simulated Visualizer */}
                                    <div className="relative z-10 w-full">
                                        <AudioVisualizer isPlaying={isPlaying} />
                                    </div>

                                    {/* Play Button Overlay */}
                                    {!isPlaying && (
                                        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/30 backdrop-blur-sm transition-opacity group-hover:bg-black/40">
                                            <button
                                                onClick={() => setIsPlaying(true)}
                                                className="w-20 h-20 rounded-full bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center hover:scale-110 transition-transform"
                                            >
                                                <Play size={32} className="fill-white ml-2" />
                                            </button>
                                        </div>
                                    )}

                                    {/* Controls */}
                                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/80 to-transparent">
                                        <div className="flex items-center gap-4 mb-2">
                                            <button onClick={() => setIsPlaying(!isPlaying)}>
                                                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                                            </button>
                                            <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                                                <motion.div
                                                    className="h-full bg-orange-500"
                                                    animate={{ width: isPlaying ? '100%' : '0%' }}
                                                    transition={{ duration: 10, ease: "linear" }}
                                                />
                                            </div>
                                            <span className="text-xs font-mono">0:10 / 0:10</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a0a0f]">
                                    <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-4">
                                        <Video size={40} className="text-white/20" />
                                    </div>
                                    <p className="text-gray-500">Preview Area</p>
                                </div>
                            )}
                        </motion.div>

                        {/* Recent Projects Table */}
                        <div className="glass-card p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-xl">Recent Projects</h3>
                                <button className="text-xs text-orange-400 hover:text-white transition-colors">View All</button>
                            </div>
                            <div className="space-y-4">
                                {projects.map((p) => (
                                    <div key={p.id} className="flex items-center gap-4 p-3 hover:bg-white/5 rounded-lg transition-colors border border-transparent hover:border-white/10 group">
                                        <div className="w-20 h-14 bg-gray-800 rounded overflow-hidden relative">
                                            <div className={`w-full h-full bg-gradient-to-br ${p.id === 1 ? 'from-purple-900 to-blue-900' : 'from-gray-800 to-gray-700'}`}></div>
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 transition-opacity">
                                                <Play size={16} className="fill-white" />
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-medium truncate text-sm">{p.name}</h4>
                                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                                <span>{p.duration}</span>
                                                <span>•</span>
                                                <span>{p.date}</span>
                                                <span>•</span>
                                                <span className={
                                                    p.status === 'completed' ? 'text-green-400' :
                                                        p.status === 'rendering' ? 'text-orange-400' : 'text-gray-400'
                                                }>
                                                    {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {p.status === 'completed' && (
                                                <>
                                                    <button className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white" title="Download">
                                                        <Monitor size={16} />
                                                    </button>
                                                    <button className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white" title="Share">
                                                        <Share2 size={16} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right: Quick Tools */}
                    <div className="lg:col-span-3 space-y-6">
                        <div className="glass-card p-5 bg-gradient-to-br from-green-900/10 to-transparent border-green-500/20">
                            <h3 className="font-bold mb-2 flex items-center gap-2 text-green-400">
                                <ExternalLink size={16} /> Neural Frames
                            </h3>
                            <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                                Access the full Neural Frames dashboard for advanced stem-based reactivity and timeline editing.
                            </p>
                            <button className="w-full py-2.5 bg-green-500/10 text-green-400 border border-green-500/30 rounded-lg text-sm hover:bg-green-500/20 font-medium transition-colors">
                                Launch Dashboard
                            </button>
                        </div>

                        <div className="glass-card p-5">
                            <h3 className="font-bold mb-4 text-xs text-gray-400 uppercase tracking-wider">Production Ops</h3>
                            <ul className="space-y-1">
                                <li className="flex items-center gap-3 p-2 rounded hover:bg-white/5 cursor-pointer text-sm text-gray-300 hover:text-white transition-colors">
                                    <div className="w-8 h-8 rounded bg-gray-800 flex items-center justify-center text-gray-500"><Video size={14} /></div>
                                    <div>
                                        <p>Stock Footage</p>
                                        <p className="text-xs text-gray-500">Browse Library</p>
                                    </div>
                                </li>
                                <li className="flex items-center gap-3 p-2 rounded hover:bg-white/5 cursor-pointer text-sm text-gray-300 hover:text-white transition-colors">
                                    <div className="w-8 h-8 rounded bg-gray-800 flex items-center justify-center text-gray-500"><Clock size={14} /></div>
                                    <div>
                                        <p>Render Queue</p>
                                        <p className="text-xs text-orange-400">1 Job Pending</p>
                                    </div>
                                </li>
                            </ul>
                        </div>

                        <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/20">
                            <h3 className="font-bold text-sm mb-2 text-indigo-300">Pro Tip</h3>
                            <p className="text-xs text-indigo-200/70 leading-relaxed">
                                Use high "Audio Reactivity" (&gt;80%) for bass-heavy tracks to generate more intense visual pulse effects.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
