import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Backdrop } from './Backdrop';
import { ShortcutModal } from './ShortcutModal';

interface Shortcut {
  keys: string[];
  description: string;
  category: string;
}

const shortcuts: Shortcut[] = [
  // Navigation
  { keys: ['Ctrl', 'K'], description: 'Open Command Palette', category: 'Navigation' },
  { keys: ['G', 'D'], description: 'Go to Dashboard', category: 'Navigation' },
  { keys: ['G', 'C'], description: 'Go to Chat', category: 'Navigation' },
  { keys: ['G', 'A'], description: 'Go to Agents', category: 'Navigation' },
  { keys: ['G', 'N'], description: 'Go to News', category: 'Navigation' },
  { keys: ['G', 'L'], description: 'Go to Labs', category: 'Navigation' },
  { keys: ['G', 'P'], description: 'Go to Pipeline', category: 'Navigation' },
  { keys: ['G', 'S'], description: 'Go to Settings', category: 'Navigation' },

  // General
  { keys: ['?'], description: 'Show Keyboard Shortcuts', category: 'General' },
  { keys: ['Esc'], description: 'Close Modal / Cancel', category: 'General' },
  { keys: ['↑', '↓'], description: 'Navigate Lists', category: 'General' },
  { keys: ['Enter'], description: 'Confirm / Select', category: 'General' },
];

// G + key navigation map
const gNavigation: Record<string, string> = {
  'd': '/dashboard',
  'c': '/chat',
  'a': '/agents',
  'n': '/news',
  'l': '/labs',
  'p': '/pipeline',
  's': '/settings',
};

export default function KeyboardShortcuts() {
  const [open, setOpen] = useState(false);
  const [gPressed, setGPressed] = useState(false);
  const [showGHint, setShowGHint] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let gTimeout: ReturnType<typeof setTimeout>;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if in input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      // Open on ? key
      if (e.key === '?') {
        e.preventDefault();
        setOpen(prev => !prev);
        return;
      }

      // Close on Escape
      if (e.key === 'Escape') {
        setOpen(false);
        setGPressed(false);
        setShowGHint(false);
        return;
      }

      // Handle G + key navigation
      if (e.key.toLowerCase() === 'g' && !gPressed) {
        setGPressed(true);
        setShowGHint(true);
        gTimeout = setTimeout(() => {
          setGPressed(false);
          setShowGHint(false);
        }, 1500);
        return;
      }

      if (gPressed) {
        const targetPath = gNavigation[e.key.toLowerCase()];
        if (targetPath) {
          e.preventDefault();
          navigate(targetPath);
          setGPressed(false);
          setShowGHint(false);
          if (gTimeout) clearTimeout(gTimeout);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (gTimeout) clearTimeout(gTimeout);
    };
  }, [gPressed, navigate]);

  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) acc[shortcut.category] = [];
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, Shortcut[]>);

  return (
    <>
      {open && (
        <>
          <Backdrop onClick={() => setOpen(false)} />
          <ShortcutModal onClose={() => setOpen(false)} groupedShortcuts={groupedShortcuts} />
        </>
      )}

      {/* G key hint */}
      {showGHint && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[90] animate-in fade-in slide-in-from-bottom-4 duration-150">
          <div className="bg-[#0a0a0f]/95 backdrop-blur-xl rounded-xl border border-cyan-500/30 shadow-lg shadow-cyan-500/10 px-4 py-3">
            <div className="flex items-center gap-3 text-sm">
              <kbd className="px-2 py-1 bg-cyan-500/20 border border-cyan-500/30 rounded text-cyan-400 font-mono">G</kbd>
              <span className="text-gray-400">then</span>
              <div className="flex gap-1">
                {Object.keys(gNavigation).map(key => (
                  <kbd key={key} className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-gray-400 font-mono uppercase">
                    {key}
                  </kbd>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
