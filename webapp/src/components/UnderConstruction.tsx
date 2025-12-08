'use client';

import { motion } from 'framer-motion';
import { Hammer, Construction, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface UnderConstructionProps {
    title?: string;
    message?: string;
    eta?: string;
}

export default function UnderConstruction({
    title = "Under Construction",
    message = "This feature is planned for the Growth Phase (v1.x).",
    eta = "Coming Soon"
}: UnderConstructionProps) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="w-24 h-24 bg-yellow-500/10 rounded-full flex items-center justify-center mb-6 border border-yellow-500/20"
            >
                <Construction className="w-12 h-12 text-yellow-500" />
            </motion.div>

            <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500"
            >
                {title}
            </motion.h1>

            <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-gray-400 max-w-md mb-8"
            >
                {message}
            </motion.p>

            {eta && (
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full text-sm text-gray-400 mb-8"
                >
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                    ETA: {eta}
                </motion.div>
            )}

            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
            >
                <Link
                    href="/dashboard"
                    className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                </Link>
            </motion.div>
        </div>
    );
}
