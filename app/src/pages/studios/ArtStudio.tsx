import { useState } from 'react';
import { motion } from 'motion/react';
import { Image as ImageIcon, Download, Wand2, Settings, Layers, Maximize } from 'lucide-react';
import PageLayout, { PageHeader, StatPill } from '../../components/PageLayout';

// Mock styles
const styles = [
    { id: 'photoreal', name: 'Photorealistic' },
    { id: 'cyberpunk', name: 'Cyberpunk' },
    { id: 'anime', name: 'Anime' },
    { id: 'oil', name: 'Oil Painting' },
    { id: '3d', name: '3D Render' },
];

// Mock projects
const projects = [
    { id: 'p1', name: 'Neon City Game' },
    { id: 'p2', name: 'Lo-Fi Music Channel' },
    { id: 'p3', name: 'Personal Brand' },
    { id: 'new', name: '+ New Project' }
];

export function ArtStudio() {
    const [prompt, setPrompt] = useState('');
    const [selectedStyle, setSelectedStyle] = useState('photoreal');
    const [selectedProject, setSelectedProject] = useState('p1');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedImages, setGeneratedImages] = useState<any[]>([]);
    const [refineImage, setRefineImage] = useState<any | null>(null);

    const handleGenerate = () => {
        if (!prompt) return;
        setIsGenerating(true);

        // Simulate generation
        setTimeout(() => {
            const newImage = {
                id: Date.now(),
                url: `https://picsum.photos/seed/${Date.now()}/1024/1024`,
                prompt: prompt,
                style: selectedStyle,
                project: projects.find(p => p.id === selectedProject)?.name
            };
            setGeneratedImages([newImage, ...generatedImages]);
            setIsGenerating(false);
        }, 3000);
    };

    return (
        <PageLayout color="purple">
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-8">
                <PageHeader
                    title="Art Studio"
                    subtitle="AI IMAGE GENERATION • STYLES • PROJECT LIBRARY"
                    icon={<ImageIcon size={24} className="text-purple-400" />}
                    color="purple"
                    actions={
                        <StatPill label={isGenerating ? 'Generating...' : `${generatedImages.length} Images`} color={isGenerating ? 'purple' : 'cyan'} pulse={isGenerating} />
                    }
                />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Controls Sidebar */}
                    <div className="lg:col-span-4 space-y-6">
                        <motion.div
                            className="glass-card border-white/5 relative overflow-hidden"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                            <div className="space-y-6 relative z-10">
                                {/* Project Selector */}
                                <div>
                                    <label className="block text-[10px] uppercase font-bold tracking-widest mb-2 text-white/30">Target Project</label>
                                    <select
                                        value={selectedProject}
                                        onChange={(e) => setSelectedProject(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm focus:border-purple-500/50 outline-none transition-colors"
                                    >
                                        {projects.map(p => (
                                            <option key={p.id} value={p.id} className="bg-[#12121a]">{p.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Prompt Input */}
                                <div>
                                    <label className="block text-[10px] uppercase font-bold tracking-widest mb-2 text-white/30">Prompt</label>
                                    <textarea
                                        value={prompt}
                                        onChange={(e) => setPrompt(e.target.value)}
                                        placeholder="A futuristic city with flying cars, neon lights, rainy atmosphere..."
                                        className="w-full h-32 bg-black/40 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-purple-500/50 transition-colors resize-none custom-scrollbar"
                                    />
                                </div>

                                {/* Style Selector */}
                                <div>
                                    <label className="block text-[10px] uppercase font-bold tracking-widest mb-2 text-white/30">Style</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {styles.map(style => (
                                            <button
                                                key={style.id}
                                                onClick={() => setSelectedStyle(style.id)}
                                                className={`p-3 rounded-xl text-xs font-bold uppercase tracking-wider text-left transition-all border ${selectedStyle === style.id
                                                        ? 'bg-purple-500/10 border-purple-500/30 text-purple-400'
                                                        : 'bg-white/5 border-transparent text-white/30 hover:bg-white/10 hover:text-white/60'
                                                    }`}
                                            >
                                                {style.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Settings */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] uppercase font-bold tracking-widest mb-2 text-white/30">Aspect Ratio</label>
                                        <select className="w-full bg-black/40 border border-white/10 rounded-xl p-2 text-xs outline-none">
                                            <option>1:1 (Square)</option>
                                            <option>16:9 (Landscape)</option>
                                            <option>9:16 (Portrait)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] uppercase font-bold tracking-widest mb-2 text-white/30">Quality</label>
                                        <select className="w-full bg-black/40 border border-white/10 rounded-xl p-2 text-xs outline-none">
                                            <option>Standard</option>
                                            <option>HD</option>
                                            <option>Ultra</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Generate Button */}
                                <button
                                    onClick={handleGenerate}
                                    disabled={!prompt || isGenerating}
                                    className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all mt-4 ${!prompt || isGenerating
                                            ? 'bg-white/5 text-white/20 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:scale-[1.02] shadow-lg shadow-purple-900/40 text-white'
                                        }`}
                                >
                                    {isGenerating ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            <span className="uppercase tracking-widest text-xs">Dreaming...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Wand2 size={18} />
                                            <span className="uppercase tracking-widest text-xs font-bold">Generate Art</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </div>

                    {/* Canvas / Gallery */}
                    <div className="lg:col-span-8">
                        {generatedImages.length === 0 && !isGenerating ? (
                            <motion.div
                                className="h-full min-h-[600px] glass-card border-white/5 flex flex-col items-center justify-center text-white/20"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6">
                                    <Layers size={40} className="opacity-10" />
                                </div>
                                <h3 className="text-lg font-bold uppercase tracking-widest mb-2">Canvas Empty</h3>
                                <p className="text-xs max-w-xs text-center leading-relaxed">
                                    Select a project, enter a prompt, and choose a style to begin creating.
                                </p>
                            </motion.div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {isGenerating && (
                                    <div className="aspect-square glass-card border-purple-500/20 flex flex-col items-center justify-center animate-pulse">
                                        <div className="w-12 h-12 border-2 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mb-4"></div>
                                        <p className="text-purple-400/60 text-[10px] font-bold uppercase tracking-widest">Generating Visual...</p>
                                    </div>
                                )}
                                {generatedImages.map((img) => (
                                    <motion.div
                                        key={img.id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="group relative aspect-square rounded-2xl overflow-hidden glass-card border-white/5 shadow-2xl"
                                    >
                                        <img
                                            src={img.url}
                                            alt={img.prompt}
                                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                        />
                                        <div className="absolute top-4 left-4">
                                            <span className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-white/10 text-white/80">
                                                {img.project}
                                            </span>
                                        </div>
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-6">
                                            <p className="text-xs text-white/90 line-clamp-2 mb-4 font-medium leading-relaxed italic">"{img.prompt}"</p>
                                            <div className="flex gap-2">
                                                <button className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-bold uppercase tracking-widest backdrop-blur-md flex items-center justify-center gap-2 transition-all border border-white/10">
                                                    <Download size={14} />
                                                    Save
                                                </button>
                                                <button
                                                    onClick={() => setRefineImage(img)}
                                                    className="p-2.5 bg-purple-500/20 hover:bg-purple-500/40 text-purple-300 rounded-xl backdrop-blur-md transition-all border border-purple-500/30"
                                                    title="Refine Image"
                                                >
                                                    <Settings size={14} />
                                                </button>
                                                <button className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl backdrop-blur-md transition-all border border-white/10">
                                                    <Maximize size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Refine Modal Overlay */}
            {refineImage && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="glass-card border-white/10 max-w-4xl w-full rounded-2xl overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-2"
                    >
                        <div className="aspect-square overflow-hidden bg-black">
                            <img src={refineImage.url} className="w-full h-full object-cover" />
                        </div>
                        <div className="p-8 flex flex-col h-full">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <Settings className="text-purple-400" size={20} />
                                Refine Visual
                            </h2>
                            <div className="space-y-6 flex-1">
                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 block mb-2">Prompt Adjustment</label>
                                    <textarea
                                        defaultValue={refineImage.prompt}
                                        className="w-full h-32 bg-black/40 border border-white/10 rounded-xl p-4 text-sm focus:border-purple-500/50 outline-none transition-colors"
                                    />
                                </div>
                                <div>
                                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2">
                                        <span>Variation Strength</span>
                                        <span className="text-purple-400">0.5</span>
                                    </div>
                                    <input type="range" className="w-full accent-purple-500" />
                                </div>
                            </div>
                            <div className="flex gap-3 mt-8 pt-6 border-t border-white/10">
                                <button
                                    onClick={() => setRefineImage(null)}
                                    className="px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest text-white/40 hover:bg-white/5 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 font-bold uppercase tracking-widest text-xs shadow-lg shadow-purple-900/40">
                                    Generate Variation
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </PageLayout>
    );
}
