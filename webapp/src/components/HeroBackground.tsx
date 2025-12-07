'use client';

import { motion } from 'framer-motion';

// Fixed particle positions to avoid hydration mismatch
const particles = [
  { left: 15, top: 20 }, { left: 82, top: 45 }, { left: 45, top: 70 },
  { left: 68, top: 15 }, { left: 25, top: 55 }, { left: 90, top: 30 },
  { left: 35, top: 80 }, { left: 55, top: 25 }, { left: 78, top: 65 },
  { left: 12, top: 40 }, { left: 60, top: 85 }, { left: 42, top: 35 },
  { left: 88, top: 75 }, { left: 22, top: 60 }, { left: 72, top: 50 },
];

export default function HeroBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Dark theater curtain tops - subtle draping */}
      <div className="absolute top-0 left-0 w-1/3 h-64 bg-gradient-to-br from-black via-black/60 to-transparent rounded-br-[100%] opacity-40" />
      <div className="absolute top-0 right-0 w-1/3 h-64 bg-gradient-to-bl from-black via-black/60 to-transparent rounded-bl-[100%] opacity-40" />
      
      {/* Stage spotlights - slow panning */}
      <motion.div
        className="absolute top-0 left-1/4 w-[600px] h-[800px] opacity-40"
        style={{
          background: 'conic-gradient(from 180deg at 50% 0%, transparent 30%, rgba(6, 182, 212, 0.6) 50%, transparent 70%)',
        }}
        animate={{
          rotate: [0, 15, -10, 5, 0],
          x: [0, 100, -50, 30, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-0 right-1/4 w-[600px] h-[800px] opacity-40"
        style={{
          background: 'conic-gradient(from 180deg at 50% 0%, transparent 30%, rgba(168, 85, 247, 0.6) 50%, transparent 70%)',
        }}
        animate={{
          rotate: [0, -12, 8, -5, 0],
          x: [0, -80, 60, -20, 0],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[700px] opacity-35"
        style={{
          background: 'conic-gradient(from 180deg at 50% 0%, transparent 30%, rgba(236, 72, 153, 0.5) 50%, transparent 70%)',
        }}
        animate={{
          rotate: [-5, 8, -8, 5, -5],
        }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Ambient glow orbs */}
      <motion.div
        className="absolute top-1/3 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"
        animate={{
          x: [0, 30, 0],
          y: [0, 20, 0],
          scale: [1, 1.05, 1],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/2 right-1/4 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl"
        animate={{
          x: [0, -20, 0],
          y: [0, 30, 0],
          scale: [1, 1.08, 1],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Subtle grid */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(6, 182, 212, 0.4) 1px, transparent 1px),
            linear-gradient(90deg, rgba(6, 182, 212, 0.4) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Floating particles - fixed positions */}
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-cyan-400 rounded-full"
          style={{ left: `${p.left}%`, top: `${p.top}%` }}
          animate={{
            y: [0, -80, 0],
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: 5 + (i % 3),
            repeat: Infinity,
            delay: i * 0.3,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Bottom vignette */}
      <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-[#030305] to-transparent pointer-events-none" />
      
      {/* Side curtain shadows */}
      <div className="absolute top-0 bottom-0 left-0 w-32 bg-gradient-to-r from-black/30 to-transparent pointer-events-none" />
      <div className="absolute top-0 bottom-0 right-0 w-32 bg-gradient-to-l from-black/30 to-transparent pointer-events-none" />
    </div>
  );
}
