'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8"
                >
                    <div className="text-9xl font-bold bg-gradient-to-r from-red-500 to-purple-600 bg-clip-text text-transparent">
                        404
                    </div>
                </motion.div>

                <motion.h1
                    className="text-3xl font-bold mb-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    Lost in Cyberspace
                </motion.h1>

                <motion.p
                    className="text-gray-400 mb-8 max-w-md mx-auto"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    The signal has been lost. The page you are looking for might have been decompiled or moved to another server.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <Link
                        href="/"
                        className="px-8 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-lg transition-colors inline-block"
                    >
                        Return to Dashboard
                    </Link>
                </motion.div>
            </div>
        </div>
    );
}
