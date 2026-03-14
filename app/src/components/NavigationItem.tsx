import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { type LucideIcon } from 'lucide-react';

interface NavItemProps {
  to: string;
  icon: LucideIcon;
  label: string;
  shortcut?: string;
  isHovered?: boolean;
}

export function NavigationItem({ to, icon: Icon, label, shortcut, isHovered }: NavItemProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-2.5 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all relative group whitespace-nowrap border ${
          isActive
            ? 'text-cyan-400 bg-white/5 border-white/10 shadow-lg shadow-black/20'
            : 'text-white/30 border-transparent hover:text-white hover:bg-white/[0.02]'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon className={`w-3.5 h-3.5 shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-cyan-400' : ''}`} />
          <span>{label}</span>
          
          {/* Active Indicator Underline */}
          <AnimatePresence>
            {isActive && (
              <motion.div 
                layoutId="nav-active-pill"
                className="absolute -bottom-[21px] left-1/2 -translate-x-1/2 w-12 h-1 bg-cyan-500 rounded-full shadow-[0_0_12px_rgba(6,182,212,0.8)]" 
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
              />
            )}
          </AnimatePresence>

          {/* Hover Tooltip (Shortcut) */}
          <AnimatePresence>
            {isHovered && shortcut && (
              <motion.div
                className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/80 rounded text-[9px] text-cyan-400 border border-cyan-500/30 whitespace-nowrap z-[100] font-mono tracking-tighter"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
              >
                {shortcut}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </NavLink>
  );
}
