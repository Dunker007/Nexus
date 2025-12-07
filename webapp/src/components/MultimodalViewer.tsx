'use client';

import { motion } from 'framer-motion';
import { Image, Film, Music, FileText } from 'lucide-react';

interface MultimodalViewerProps {
    type?: 'image' | 'video' | 'audio' | 'text';
    src?: string;
    alt?: string;
}

export function MultimodalViewer({ type = 'image', src, alt = 'Media content' }: MultimodalViewerProps) {
    return (
        <div className="glass-card p-4 flex flex-col items-center justify-center min-h-[300px] border-dashed border-2 border-white/10 bg-black/20">
            <div className="mb-4 p-4 rounded-full bg-white/5">
                {type === 'image' && <Image size={32} className="text-cyan-400" />}
                {type === 'video' && <Film size={32} className="text-purple-400" />}
                {type === 'audio' && <Music size={32} className="text-green-400" />}
                {type === 'text' && <FileText size={32} className="text-orange-400" />}
            </div>

            <h3 className="text-lg font-bold mb-2">Multimodal Viewer</h3>
            <p className="text-sm text-gray-500 text-center max-w-xs mb-6">
                Waiting for {type} content generation...
            </p>

            {/* Placeholder visualization */}
            <div className="w-full max-w-md h-32 bg-white/5 rounded-lg overflow-hidden relative">
                <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                />
            </div>
        </div>
    );
}
