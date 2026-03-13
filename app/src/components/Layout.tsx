import { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, Users, HardDrive, GitBranch, Music, Newspaper, Wifi, WifiOff, Settings, Beaker, UsersRound, Command, Moon, Palette, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useMemory } from '../contexts/MemoryContext';
import VoiceControl from './VoiceControl';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/studios', icon: Music, label: 'Studios' },
  { to: '/chat', icon: MessageSquare, label: 'Chat' },
  { to: '/agents', icon: Users, label: 'Agents' },
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
    <div className="flex flex-col h-screen bg-[#060809] text-white overflow-hidden font-sans">
      {/* Top Navigation Bar */}
      <nav className="flex-none h-14 border-b border-white/5 bg-[#0a0a0f]/95 backdrop-blur-md relative z-50">
        <div className="h-full px-4 md:px-6 flex items-center justify-between">
          
          {/* Logo Section */}
          <div className="flex items-center gap-3 shrink-0">
            <motion.div 
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                className="w-7 h-7 rounded bg-[#5b8eff] flex items-center justify-center font-bold text-sm text-white shadow-lg"
            >
              D
            </motion.div>
            <span className="font-bold tracking-widest text-[#e2e8f0] text-sm md:text-sm hidden sm:block uppercase">DLX STUDIO</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1 xl:gap-2 mx-4 overflow-x-auto custom-scrollbar flex-1 justify-center">
            {navItems.map((item) => {
              const { to, icon: Icon, label } = item;
              return (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all relative group whitespace-nowrap ${
                      isActive
                        ? 'text-cyan-400 bg-cyan-500/10'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{label}</span>
                </NavLink>
              );
            })}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3 shrink-0">
             {/* Drive Status Indicator */}
             <div className="hidden md:flex items-center gap-2 px-2 py-1 rounded-md text-[10px] font-mono border border-white/5" title={loading ? 'Drive Connecting...' : error ? 'Drive Error' : 'Drive Online'}>
               {error ? <WifiOff className="w-3 h-3 text-red-500" /> : <Wifi className={`w-3 h-3 ${loading ? 'text-amber-500' : 'text-emerald-500'}`} />}
             </div>

             <div className="w-px h-4 bg-white/10 mx-1 hidden md:block"></div>

            <button className="text-gray-400 hover:text-white transition-colors" title="Dark Mode">
                <Moon className="w-4 h-4" />
            </button>
            <button className="text-purple-400 hover:text-purple-300 transition-colors" title="Theme">
                <Palette className="w-4 h-4" />
            </button>
            <button 
                className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-colors text-xs font-mono"
            >
                <Command className="w-3 h-3" />
                <span>Cmd+K</span>
            </button>
            <div className="w-7 h-7 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 border border-white/20 ml-2" />

            {/* Mobile Menu Toggle */}
            <button 
                className="lg:hidden p-2 text-gray-400 hover:text-white ml-1"
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
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="lg:hidden flex-none bg-[#0a0a0f] border-b border-white/5 overflow-hidden z-40"
            >
                <div className="p-4 grid grid-cols-2 gap-2">
                    {navItems.map((item) => {
                        const { to, icon: Icon, label } = item;
                        return (
                            <NavLink
                                key={to}
                                to={to}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                                        isActive
                                        ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                                        : 'text-gray-400 bg-white/5 hover:text-white hover:bg-white/10'
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
      <main className="flex-1 overflow-auto relative">
        <Outlet />
      </main>

      {/* Global Overlays */}
      <VoiceControl />
    </div>
  );
}
