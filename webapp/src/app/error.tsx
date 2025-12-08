'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="text-center max-w-lg">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-6 flex justify-center"
                >
                    <div className="w-24 h-24 rounded-full bg-red-500/20 flex items-center justify-center">
                        <span className="text-5xl">⚠️</span>
                    </div>
                </motion.div>

                <motion.h1
                    className="text-3xl font-bold mb-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    System Glitch Detected
                </motion.h1>

                <motion.p
                    className="text-gray-400 mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    Something went wrong while processing your request.
                    <br />
                    <span className="text-xs font-mono text-red-400 mt-2 block bg-black/30 p-2 rounded">
                        Error: {error.message || 'Unknown Error'}
                    </span>
                </motion.p>

                <motion.div
                    className="flex gap-4 justify-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <button
                        onClick={reset}
                        className="px-6 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-lg transition-colors"
                    >
                        Reboot System
                    </button>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition-colors"
                    >
                        Emergency Exit
                    </button>
                </motion.div>
            </div>
        </div>
    );
}
