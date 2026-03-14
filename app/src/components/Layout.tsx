import { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, Users, HardDrive, GitBranch, Music, Newspaper, Wifi, WifiOff, Settings, Beaker, UsersRound, Command, Moon, Palette, Menu, X, Workflow } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useMemory } from '../contexts/MemoryContext';
import VoiceControl from './VoiceControl';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/studios', icon: Music, label: 'Studios' },
  { to: '/chat', icon: MessageSquare, label: 'Chat' },
  { to: '/agents', icon: Users, label: 'Agents' },
  { to: '/agentflow', icon: Workflow, label: 'AgentFlow' },
  { to: '/news', icon: Newspaper, label: 'News' },
  { to: '/meeting', icon: UsersRound, label: 'Meeting' },
  { to: '/labs', icon: Beaker, label: 'Labs' },
  { to: '/pipeline', icon: GitBranch, label: 'Pipeline' },
  { to: '/drive', icon: HardDrive, label: 'Drive' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function Layout() {
  const { loading, error } = useMemory();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex flex-col h-screen bg-[#07070a] text-white overflow-hidden font-sans selection:bg-cyan-500/30">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-32 bg-cyan-500/5 blur-[120px] rounded-full" />
      </div>

      {/* Top Navigation Bar */}
      <nav className="flex-none h-16 border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-2xl relative z-50 px-4 md:px-8">
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
            {navItems.map((item) => {
              const { to, icon: Icon, label } = item;
              return (
                <NavLink
                  key={to}
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
                      {isActive && (
                        <motion.div 
                            layoutId="nav-active-pill"
                            className="absolute -bottom-[21px] left-1/2 -translate-x-1/2 w-12 h-1 bg-cyan-500 rounded-full shadow-[0_0_12px_rgba(6,182,212,0.8)]" 
                        />
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
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
                 {loading ? 'Sycing' : error ? 'Error' : 'Verified'}
               </span>
             </div>

             <div className="w-px h-6 bg-white/5 mx-1 hidden lg:block"></div>

            <div className="hidden md:flex items-center gap-2">
                <button className="w-10 h-10 rounded-xl flex items-center justify-center text-white/20 hover:text-white hover:bg-white/5 transition-all" title="Kernel Display">
                    <Moon className="w-4 h-4" />
                </button>
                <button className="w-10 h-10 rounded-xl flex items-center justify-center text-purple-400/40 hover:text-purple-400 hover:bg-purple-500/10 transition-all" title="Interface Matrix">
                    <Palette className="w-4 h-4" />
                </button>
            </div>
            
            <button 
                className="hidden xl:flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all text-[10px] font-black uppercase tracking-widest"
            >
                <Command className="w-3.5 h-3.5" />
                <span>Quick Access</span>
            </button>

            <div className="relative group p-0.5 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-white/10 hover:border-cyan-500/40 transition-all cursor-pointer">
                <div className="w-9 h-9 rounded-[14px] bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-black text-black overflow-hidden">
                    <img 
                        src="https://api.dicebear.com/7.x/avataaars/svg?seed=Dunker" 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#0a0a0f] shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
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
                className="lg:hidden absolute top-20 left-4 right-4 bg-[#0d0d14]/95 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden z-[60] shadow-2xl p-4"
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
      <main className="flex-1 overflow-auto relative z-10 custom-scrollbar">
        <Outlet />
      </main>

      {/* Global Overlays */}
      <div className="fixed bottom-8 right-8 z-[100]">
        <VoiceControl />
      </div>
    </div>
  );
}
