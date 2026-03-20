import { useState } from 'react';
import { m, AnimatePresence } from 'motion/react';
import { Film, Music, Upload, Play, Pause, Settings, Share2, Monitor, ExternalLink, Video, Clock, CheckCircle, RefreshCw, Wand2 } from 'lucide-react';
import PageLayout, { PageHeader, StatPill } from '../../components/PageLayout';

const projects = [
    { id: 1, name: 'Neon City Drive', status: 'completed', duration: '3:45', date: '2h ago' },
    { id: 2, name: 'Cyberpunk Glitch', status: 'rendering', progress: 45, duration: '2:12', date: 'In progress' },
    { id: 3, name: 'Lo-Fi Study Session', status: 'draft', duration: '15:00', date: '1d ago' },
];

const RENDER_STEPS = [
    "Analyzing Audio Spectrum...",
    "Extracting Bass Stems...",
    "Generating Neural Noise...",
    "Syncing Reactivity...",
    "Rendering Frames...",
    "Finalizing Encode..."
];

const AudioVisualizer = ({ isPlaying }: { isPlaying: boolean }) => {
    return (
        <div className="flex items-end justify-center gap-1 h-32 w-full px-12">
            {[...Array(20)].map((_, i) => (
                <m.div
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

export function VideoStudio() {
    const [selectedAudio, setSelectedAudio] = useState<string | null>(null);
    const [prompt, setPrompt] = useState('Cyberpunk city with neon lights, rain, glitch effects');
    const [reactivity, setReactivity] = useState(75);
    const [isRendering, setIsRendering] = useState(false);
    const [renderStep, setRenderStep] = useState(0);
    const [renderProgress, setRenderProgress] = useState(0);
    const [resultReady, setResultReady] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);

    const handleRender = () => {
        setIsRendering(true);
        setRenderStep(0);
        setRenderProgress(0);
        setResultReady(false);

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
        }, 100);

        setTimeout(() => {
            clearInterval(interval);
            setIsRendering(false);
            setResultReady(true);
            setRenderProgress(100);
        }, 10000);
    };

    return (
        <PageLayout color="amber">
            <div className="max-w-[2000px] mx-auto px-4 sm:px-6 py-8">
                <PageHeader
                    title="Video Studio"
                    subtitle="NEURAL FRAMES • AI VIDEO GENERATION • RENDER QUEUE"
                    icon={<Film size={24} className="text-amber-400" />}
                    color="amber"
                    actions={
                        <StatPill label={isRendering ? `Rendering ${renderProgress}%` : resultReady ? 'Render Complete' : 'Idle'} color={isRendering ? 'amber' : resultReady ? 'green' : 'cyan'} pulse={isRendering} />
                    }
                />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-3 space-y-6">
                        <m.div
                            className="glass-card border-white/5 space-y-4"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <h3 className="font-bold text-sm uppercase tracking-widest flex items-center gap-2 text-white/80">
                                <Music className="text-orange-500" size={18} /> Audio Source
                            </h3>

                            <div className="space-y-2">
                                <button
                                    onClick={() => setSelectedAudio('upload')}
                                    className={`w-full p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${selectedAudio === 'upload' ? 'bg-orange-500/10 border-orange-500/30' : 'bg-white/5 border-transparent hover:bg-white/10'}`}
                                >
                                    <div className="p-2 bg-orange-500/20 rounded-lg"><Upload size={16} className="text-orange-400" /></div>
                                    <div>
                                        <div className="text-xs font-bold uppercase tracking-wider">Upload File</div>
                                        <div className="text-[10px] text-gray-500">MP3, WAV, FLAC</div>
                                    </div>
                                </button>
                                <button
                                    onClick={() => setSelectedAudio('suno')}
                                    className={`w-full p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${selectedAudio === 'suno' ? 'bg-orange-500/10 border-orange-500/30' : 'bg-white/5 border-transparent hover:bg-white/10'}`}
                                >
                                    <div className="p-2 bg-purple-500/20 rounded-lg"><Music size={16} className="text-purple-400" /></div>
                                    <div>
                                        <div className="text-xs font-bold uppercase tracking-wider text-white/90">From Music Studio</div>
                                        <div className="text-[10px] text-gray-500">Select generated track</div>
                                    </div>
                                </button>
                            </div>

                            <AnimatePresence>
                                {selectedAudio === 'suno' && (
                                    <m.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="p-3 bg-black/40 border border-white/5 rounded-xl space-y-2">
                                            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer border border-transparent hover:border-white/10 transition-colors">
                                                <div className="w-8 h-8 bg-purple-500/20 rounded flex items-center justify-center text-xs">🎵</div>
                                                <div className="flex-1 overflow-hidden">
                                                    <div className="text-white text-[10px] font-bold uppercase truncate">Neon Nights</div>
                                                    <div className="text-[8px] text-gray-500 uppercase tracking-widest">3:45 • Electro</div>
                                                </div>
                                                <CheckCircle size={14} className="text-green-500 shrink-0" />
                                            </div>
                                        </div>
                                    </m.div>
                                )}
                            </AnimatePresence>
                        </m.div>

                        <m.div
                            className="glass-card border-white/5 space-y-4"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <h3 className="font-bold text-sm uppercase tracking-widest flex items-center gap-2 text-white/80">
                                <Settings className="text-orange-500" size={18} /> Parameters
                            </h3>
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2 block flex justify-between">
                                    Visual Prompt
                                    <span className="text-orange-400 flex items-center gap-1 cursor-pointer hover:text-orange-300"><Wand2 size={10} /> Enhance</span>
                                </label>
                                <textarea
                                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm h-28 resize-none focus:outline-none focus:border-orange-500/50 transition-colors custom-scrollbar"
                                    placeholder="Describe the visual style..."
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2 block flex justify-between">
                                    Audio Reactivity
                                    <span className="text-white">{reactivity}%</span>
                                </label>
                                <input
                                    type="range"
                                    min="0" max="100"
                                    value={reactivity}
                                    onChange={(e) => setReactivity(parseInt(e.target.value))}
                                    className="w-full accent-orange-500 h-1.5 bg-black/40 rounded-full appearance-none cursor-pointer"
                                />
                            </div>
                        </m.div>

                        <button
                            onClick={handleRender}
                            disabled={isRendering || !selectedAudio}
                            className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all relative overflow-hidden group ${isRendering || !selectedAudio
                                ? 'bg-white/5 text-white/20 cursor-not-allowed'
                                : 'bg-gradient-to-r from-orange-600 to-red-600 hover:scale-[1.02] shadow-lg shadow-orange-900/40 text-white'
                                }`}
                        >
                            {isRendering ? (
                                <>
                                    <div className="absolute inset-0 bg-black/20" style={{ width: `${renderProgress}%` }}></div>
                                    <div className="relative flex items-center gap-2 uppercase tracking-widest text-xs font-bold">
                                        <RefreshCw size={16} className="animate-spin" />
                                        Rendering {renderProgress}%
                                    </div>
                                </>
                            ) : (
                                <>
                                    <Film size={18} />
                                    <span className="uppercase tracking-widest text-xs font-bold">Render Video</span>
                                </>
                            )}
                        </button>
                    </div>

                    <div className="lg:col-span-6 flex flex-col gap-6">
                        <m.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-black border border-white/10 rounded-3xl aspect-video overflow-hidden relative group shadow-2xl"
                        >
                            <AnimatePresence>
                                {isRendering && (
                                    <m.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="absolute inset-0 z-20 bg-black/95 flex flex-col items-center justify-center p-8 text-center"
                                    >
                                        <div className="w-24 h-24 mb-6 relative">
                                            <div className="absolute inset-0 border-4 border-orange-500/10 rounded-full"></div>
                                            <div className="absolute inset-0 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                                            <div className="absolute inset-0 flex items-center justify-center text-orange-400 font-bold text-xl font-mono">
                                                {renderProgress}%
                                            </div>
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-tight">{RENDER_STEPS[renderStep]}</h3>
                                        <p className="text-white/40 text-xs max-w-sm leading-relaxed">
                                            Neural Frames is generating latent noise patterns based on your audio spectrum analysis.
                                        </p>
                                    </m.div>
                                )}
                            </AnimatePresence>

                            {resultReady ? (
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-950 to-black flex items-center justify-center overflow-hidden">
                                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                                    <div className="relative z-10 w-full transform -translate-y-4">
                                        <AudioVisualizer isPlaying={isPlaying} />
                                    </div>

                                    {!isPlaying && (
                                        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/20 backdrop-blur-[2px] transition-all">
                                            <button
                                                onClick={() => setIsPlaying(true)}
                                                className="w-20 h-20 rounded-full bg-white/5 border border-white/20 backdrop-blur-xl flex items-center justify-center hover:scale-110 shadow-2xl transition-all group/play"
                                            >
                                                <Play size={32} className="fill-white ml-2 group-hover/play:scale-110 transition-transform" />
                                            </button>
                                        </div>
                                    )}

                                    <div className="absolute bottom-0 left-0 right-0 p-8 bg-linear-to-t from-black via-black/80 to-transparent">
                                        <div className="flex items-center gap-4 mb-2">
                                            <button onClick={() => setIsPlaying(!isPlaying)} className="hover:scale-110 transition-transform">
                                                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                                            </button>
                                            <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                                                <m.div
                                                    className="h-full bg-gradient-to-r from-orange-500 to-red-500"
                                                    animate={{ width: isPlaying ? '100%' : '0%' }}
                                                    transition={{ duration: 10, ease: "linear" }}
                                                />
                                            </div>
                                            <span className="text-[10px] font-mono text-white/50 tracking-tighter">0:10 / 0:10</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a0a0f]">
                                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4 transition-all group-hover:bg-white/10">
                                        <Video size={36} className="text-white/10" />
                                    </div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/20">Studio Preview Area</p>
                                </div>
                            )}
                        </m.div>

                        <div className="glass-card border-white/5 relative overflow-hidden">
                             <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-lg flex items-center gap-2">
                                   <Film size={20} className="text-orange-400" /> Recent Projects
                                </h3>
                            </div>
                            <div className="space-y-3">
                                {projects.map((p) => (
                                    <div key={p.id} className="flex items-center gap-4 p-3 hover:bg-white/[0.03] rounded-2xl transition-all border border-transparent hover:border-white/5 group">
                                        <div className="w-20 h-14 bg-black/60 rounded-xl overflow-hidden relative border border-white/5">
                                            <div className={`w-full h-full bg-gradient-to-br ${p.id === 1 ? 'from-purple-900 to-blue-900' : 'from-gray-900 to-gray-800'}`}></div>
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 transition-opacity">
                                                <Play size={16} className="fill-white" />
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-sm truncate text-white/90">{p.name}</h4>
                                            <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest mt-1 text-white/30">
                                                <span>{p.duration}</span>
                                                <span className={p.status === 'completed' ? 'text-green-500/80' : p.status === 'rendering' ? 'text-orange-500/80' : ''}>
                                                    {p.status}
                                                </span>
                                                <span>{p.date}</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            {p.status === 'completed' && (
                                                <button className="p-2.5 hover:bg-white/5 rounded-xl text-white/40 hover:text-white transition-all border border-transparent hover:border-white/10">
                                                    <Share2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-3 space-y-6">
                        <m.div
                            className="bg-linear-to-br from-emerald-950/20 to-transparent border border-emerald-500/20 p-6 rounded-3xl"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <h3 className="font-bold mb-3 flex items-center gap-2 text-emerald-400 uppercase tracking-widest text-xs">
                                <ExternalLink size={16} /> Neural Frames
                            </h3>
                            <p className="text-xs text-white/40 mb-5 leading-relaxed font-medium">
                                Access the full Neural Frames dashboard for advanced stem-based reactivity and timeline editing.
                            </p>
                            <button className="w-full py-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-500/20 transition-all">
                                Launch Dashboard
                            </button>
                        </m.div>

                        <m.div
                            className="glass-card border-white/5"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <h3 className="font-bold mb-5 text-[10px] text-white/30 uppercase tracking-[0.2em]">Production Ops</h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4 group cursor-pointer">
                                    <div className="w-10 h-10 rounded-2xl bg-white/[0.03] flex items-center justify-center text-white/20 group-hover:bg-white/10 group-hover:text-white transition-all">
                                        <Monitor size={18} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-wider text-white/80">Stock Assets</p>
                                        <p className="text-[10px] text-white/30 uppercase tracking-tighter">Browse Library</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 group cursor-pointer">
                                    <div className="w-10 h-10 rounded-2xl bg-white/[0.03] flex items-center justify-center text-white/20 group-hover:bg-white/10 transition-all">
                                        <Clock size={18} className="text-orange-500/40" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-wider text-white/80">Render Queue</p>
                                        <p className="text-[10px] text-orange-400 font-bold uppercase tracking-tighter">1 Job Pending</p>
                                    </div>
                                </div>
                            </div>
                        </m.div>

                        <div className="p-6 rounded-3xl bg-linear-to-br from-indigo-950/40 to-black/40 border border-indigo-500/20 shadow-2xl">
                            <h3 className="font-bold text-[10px] uppercase tracking-widest mb-3 text-indigo-300">Pro Tip</h3>
                            <p className="text-xs text-indigo-200/50 leading-relaxed font-medium">
                                Use high "Audio Reactivity" (&gt;80%) for bass-heavy tracks to generate more intense visual pulse effects.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </PageLayout>
    );
}
