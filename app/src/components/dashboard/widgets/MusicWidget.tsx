import { useState } from 'react';

export function MusicWidget() {
    const [musicMode, setMusicMode] = useState<'youtube' | 'local'>('youtube');
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [localAudioFile, setLocalAudioFile] = useState<string | null>(null);

    const getYoutubeId = (url: string) => {
        const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&\n?#]+)/);
        return match ? match[1] : null;
    };
    const videoId = getYoutubeId(youtubeUrl);

    return (
        <div className="h-full flex flex-col space-y-3 pb-8 md:pb-0">
            <div className="flex bg-[#12121a] rounded-lg p-1 border border-white/5 shrink-0">
                <button
                    onClick={() => setMusicMode('youtube')}
                    className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${musicMode === 'youtube' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'text-gray-500 hover:text-white'}`}
                >
                    YouTube
                </button>
                <button
                    onClick={() => setMusicMode('local')}
                    className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${musicMode === 'local' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-gray-500 hover:text-white'}`}
                >
                    Local
                </button>
            </div>

            {musicMode === 'youtube' ? (
                <>
                    <input
                        type="text"
                        value={youtubeUrl}
                        onChange={(e) => setYoutubeUrl(e.target.value)}
                        placeholder="Paste YouTube URL..."
                        className="w-full bg-[#12121a] border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500/50 text-white/80 placeholder:text-gray-600 transition-colors shrink-0"
                    />
                    {videoId && (
                        <div className="flex-1 w-full bg-black/40 rounded-lg overflow-hidden border border-white/5">
                            <iframe
                                src={`https://www.youtube.com/embed/${videoId}?autoplay=0`}
                                className="w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </div>
                    )}
                </>
            ) : (
                <div className="flex flex-col gap-3 h-full">
                    <label className="w-full h-24 border border-dashed border-white/10 hover:border-cyan-500/30 rounded-xl bg-[#12121a] flex flex-col items-center justify-center cursor-pointer transition-colors group">
                        <span className="text-2xl mb-1 opacity-50 group-hover:opacity-100 transition-opacity">🎵</span>
                        <span className="text-xs font-bold uppercase tracking-widest text-gray-500 group-hover:text-cyan-400 transition-colors">Select Audio File</span>
                        <input
                            type="file"
                            accept="audio/*"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    setLocalAudioFile(URL.createObjectURL(file));
                                }
                            }}
                            className="hidden"
                        />
                    </label>
                    {localAudioFile && (
                        <div className="bg-[#12121a] p-3 rounded-xl border border-white/5 mt-auto shrink-0 flex items-center justify-center h-14">
                            <audio
                                src={localAudioFile}
                                controls
                                className="w-full h-8 max-h-8 filter invert sepia hue-rotate-[180deg] saturate-200 contrast-125 opacity-80"
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
