import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        className="relative p-2 rounded-full glass-panel border border-white/5"
        aria-label="Toggle theme"
      >
        <div className="w-5 h-5" />
      </button>
    );
  }

  return (
    <button
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      className="relative p-2 rounded-full glass-panel hover:bg-white/10 transition-all hover:scale-105 active:scale-95 border border-white/5"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
    >
      <div className="relative w-5 h-5">
        <div className={`absolute inset-0 flex items-center justify-center transition-all duration-200 ${theme === 'dark' ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-0 rotate-90'}`}>
          <Moon className="w-5 h-5 text-cyan-400" />
        </div>
        <div className={`absolute inset-0 flex items-center justify-center transition-all duration-200 ${theme === 'light' ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-0 -rotate-90'}`}>
          <Sun className="w-5 h-5 text-yellow-400" />
        </div>
      </div>
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}
