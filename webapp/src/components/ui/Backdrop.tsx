'use client';

import { motion } from 'framer-motion';

interface BackdropProps {
    onClick: () => void;
    className?: string; // Allow custom styling via class props
}

export function Backdrop({ onClick, className = '' }: BackdropProps) {
    return (
        <motion.div
            className={`fixed inset-0 z-50 bg-black/70 backdrop-blur-md ${className}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClick}
        />
    );
}
