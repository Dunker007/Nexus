import { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, MessageSquare, Users, HardDrive, GitBranch,
  Music, Newspaper, Wifi, WifiOff, Settings, Beaker,
  UsersRound, Command as CommandIcon, Menu, X, Workflow, LogOut
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useMemory } from '../contexts/MemoryContext';
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

  return (
    <div className="flex flex-col h-screen bg-[var(--bg-void)] text-white overflow-hidden font-sans selection:bg-cyan-500/30">
      <KeyboardShortcuts />
      <CommandPalette />

      {/* Skip to main content link */}
      <a href="#main-content" className="skip-link">Skip to main content</a>

      {/* Top Navigation Bar */}
      <nav aria-label="Main navigation" className="flex-none h-16 border-b border-white/5 bg-[var(--glass-bg)] backdrop-blur-2xl relative z-50 px-4 md:px-6">
        <div className="h-full max-w-[1600px] mx-auto flex items-center justify-between">
          
          {/* Logo Section */}
          <div className="flex items-center gap-4 shrink-0 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center font-black text-black shadow-xl shadow-cyan-500/20 cursor-pointer transition-transform duration-150 hover:scale-105 active:scale-95">
              N
            </div>
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
            </div>
            
            <button
                onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}
                className="hidden xl:flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all text-[10px] font-black uppercase tracking-widest"
                aria-label="Open command palette (Ctrl+K)"
            >
                <CommandIcon className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Ctrl+K</span>
            </button>

            <div ref={profileRef} className="relative">
              <button
                onClick={() => setShowProfileMenu(v => !v)}
                className="relative p-0.5 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-white/10 hover:border-cyan-500/40 transition-all"
                aria-label="User profile menu"
                aria-expanded={showProfileMenu}
                aria-haspopup="true"
              >
                <div className="w-9 h-9 rounded-[14px] bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-black text-black overflow-hidden">
                  {user?.picture
                    ? <img src={user.picture} alt={user.name} className="w-full h-full object-cover" />
                    : <span className="text-sm">{(user?.name?.[0] || 'U').toUpperCase()}</span>
                  }
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#0a0a0f] shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              </button>

              {showProfileMenu && (
                  <div
                    className="absolute right-0 top-12 w-52 bg-[var(--bg-deep)]/95 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-50 animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-150"
                    role="menu"
                    aria-label="User menu"
                  >
                    <div className="px-4 py-3 border-b border-white/5">
                      <div className="text-[9px] font-black text-white/60 uppercase tracking-widest truncate">{user?.name}</div>
                      <div className="text-[8px] text-white/30 truncate mt-0.5">{user?.email}</div>
                    </div>
                    <button
                      onClick={() => { setShowProfileMenu(false); logout(); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all"
                      role="menuitem"
                    >
                      <LogOut size={13} aria-hidden="true" />
                      Sign out
                    </button>
                  </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
                className="lg:hidden w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-all border border-white/5"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
                aria-expanded={mobileOpen}
                aria-controls="mobile-menu"
            >
                {mobileOpen ? <X className="w-5 h-5" aria-hidden="true" /> : <Menu className="w-5 h-5" aria-hidden="true" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
        {mobileOpen && (
            <div
                id="mobile-menu"
                className="lg:hidden absolute top-20 left-4 right-4 bg-[var(--bg-deep)]/95 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden z-[60] shadow-2xl p-4 animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-150"
                role="navigation"
                aria-label="Mobile navigation"
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
            </div>
        )}

      {/* Main Content Area */}
      <main id="main-content" className="flex-1 w-full overflow-x-hidden overflow-y-auto relative z-10 custom-scrollbar">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>

    </div>
  );
}
