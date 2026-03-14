import { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, MessageSquare, Users, HardDrive, GitBranch,
  Music, Newspaper, Wifi, WifiOff, Settings, Beaker,
  UsersRound, Command as CommandIcon, Palette, Menu, X, Workflow, LogOut
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { useMemory } from '../contexts/MemoryContext';
import { useVibe } from '../contexts/VibeContext';
import VoiceControl from './VoiceControl';
import VibeController from './VibeController';
import KeyboardShortcuts from './KeyboardShortcuts';
import CommandPalette from './CommandPalette';
import { ThemeToggle } from './ThemeToggle';
import { NavigationItem } from './NavigationItem';
import PageTransition from './PageTransition';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', shortcut: 'G D' },
  { to: '/studios', icon: Music, label: 'Studios' },
  { to: '/chat', icon: MessageSquare, label: 'Chat', shortcut: 'G C' },
  { to: '/agents', icon: Users, label: 'Agents', shortcut: 'G A' },
  { to: '/agentflow', icon: Workflow, label: 'AgentFlow' },
  { to: '/news', icon: Newspaper, label: 'News', shortcut: 'G N' },
  { to: '/meeting', icon: UsersRound, label: 'Meeting' },
  { to: '/labs', icon: Beaker, label: 'Labs', shortcut: 'G L' },
  { to: '/pipeline', icon: GitBranch, label: 'Pipeline', shortcut: 'G P' },
  { to: '/drive', icon: HardDrive, label: 'Drive' },
  { to: '/settings', icon: Settings, label: 'Settings', shortcut: 'G S' },
];

export function Layout() {
  const { loading, error } = useMemory();
  const { mode, setMode } = useVibe();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  // Close profile menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const toggleVibeMode = () => {
    const modes: ('normal' | 'high-load' | 'crisis' | 'focus')[] = ['normal', 'high-load', 'crisis', 'focus'];
    const currentIndex = modes.indexOf(mode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setMode(modes[nextIndex]);
  };

  return (
    <div className="flex flex-col h-screen bg-[var(--bg-void)] text-white overflow-hidden font-sans selection:bg-cyan-500/30">
      <KeyboardShortcuts />
      <CommandPalette />

      {/* Top Navigation Bar */}
      <nav className="flex-none h-16 border-b border-white/5 bg-[var(--glass-bg)] backdrop-blur-2xl relative z-50 px-4 md:px-8">
        <div className="h-full flex items-center justify-between">
          
          {/* Logo Section */}
          <div className="flex items-center gap-4 shrink-0 group">
            <motion.div 
                whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center font-black text-black shadow-xl shadow-cyan-500/20 cursor-pointer"
            >
              N
            </motion.div>
            <div className="flex flex-col">
                <span className="font-black tracking-[0.2em] text-white text-sm leading-none uppercase">NEXUS</span>
                <span className="text-[10px] text-white/30 font-black tracking-widest uppercase mt-1">Local Interface</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-2 px-6 overflow-x-auto custom-scrollbar flex-1 justify-center max-w-5xl">
            {navItems.map((item) => (
              <div 
                key={item.to}
                onMouseEnter={() => setHoveredItem(item.to)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <NavigationItem 
                  {...item} 
                  isHovered={hoveredItem === item.to}
                />
              </div>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4 shrink-0">
             {/* Drive Status Indicator */}
             <div className="hidden xl:flex items-center gap-3 px-4 py-2 rounded-xl bg-black/20 border border-white/5" title={loading ? 'Uplink Synchronizing...' : error ? 'Neural Bridge Offline' : 'Neural Bridge Secure'}>
               <div className="relative">
                  {error ? <WifiOff className="w-3.5 h-3.5 text-red-500" /> : <Wifi className={`w-3.5 h-3.5 ${loading ? 'text-amber-500' : 'text-emerald-500'}`} />}
                  {!loading && !error && <div className="absolute inset-0 bg-emerald-500/20 blur-sm rounded-full animate-pulse" />}
               </div>
               <span className={`text-[10px] font-black uppercase tracking-widest hidden 2xl:block ${error ? 'text-red-400' : loading ? 'text-amber-400' : 'text-white/40'}`}>
                 {loading ? 'Syncing' : error ? 'Error' : 'Verified'}
               </span>
             </div>

             <div className="w-px h-6 bg-white/5 mx-1 hidden lg:block"></div>

            <div className="hidden md:flex items-center gap-2">
                <ThemeToggle />
                <button 
                  onClick={toggleVibeMode}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-purple-400/40 hover:text-purple-400 hover:bg-purple-500/10 transition-all" 
                  title={`Vibe Mode: ${mode}`}
                >
                    <Palette className={`w-4 h-4 ${mode !== 'normal' ? 'animate-pulse' : ''}`} />
                </button>
            </div>
            
            <button 
                onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}
                className="hidden xl:flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all text-[10px] font-black uppercase tracking-widest"
            >
                <CommandIcon className="w-3.5 h-3.5" />
                <span>Ctrl+K</span>
            </button>

            <div ref={profileRef} className="relative">
              <button
                onClick={() => setShowProfileMenu(v => !v)}
                className="relative p-0.5 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-white/10 hover:border-cyan-500/40 transition-all"
              >
                <div className="w-9 h-9 rounded-[14px] bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-black text-black overflow-hidden">
                  {user?.picture
                    ? <img src={user.picture} alt={user.name} className="w-full h-full object-cover" />
                    : <span className="text-sm">{(user?.name?.[0] || 'U').toUpperCase()}</span>
                  }
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#0a0a0f] shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              </button>

              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -8 }}
                    className="absolute right-0 top-12 w-52 bg-[var(--bg-deep)]/95 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-50"
                  >
                    <div className="px-4 py-3 border-b border-white/5">
                      <div className="text-[9px] font-black text-white/60 uppercase tracking-widest truncate">{user?.name}</div>
                      <div className="text-[8px] text-white/30 truncate mt-0.5">{user?.email}</div>
                    </div>
                    <button
                      onClick={() => { setShowProfileMenu(false); logout(); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    >
                      <LogOut size={13} />
                      Sign out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Menu Toggle */}
            <button 
                className="lg:hidden w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-all border border-white/5"
                onClick={() => setMobileOpen(!mobileOpen)}
            >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {mobileOpen && (
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                className="lg:hidden absolute top-20 left-4 right-4 bg-[var(--bg-deep)]/95 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden z-[60] shadow-2xl p-4"
            >
                <div className="grid grid-cols-2 gap-3">
                    {navItems.map((item) => {
                        const { to, icon: Icon, label } = item;
                        return (
                            <NavLink
                                key={to}
                                to={to}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-4 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                        isActive
                                        ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-lg'
                                        : 'text-white/30 bg-white/[0.02] border border-white/5 hover:text-white'
                                    }`
                                }
                            >
                                <Icon className="w-4 h-4 shrink-0" />
                                <span>{label}</span>
                            </NavLink>
                        );
                    })}
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 w-full overflow-auto relative z-10 custom-scrollbar">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>

      {/* Global Overlays */}
      <VoiceControl />
      <VibeController />
    </div>
  );
}
