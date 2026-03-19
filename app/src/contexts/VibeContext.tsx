import { createContext, useContext, useEffect, useState, useCallback, useRef, type ReactNode } from 'react';
import { type ThemeId, type Theme, themes, getTheme, applyTheme, saveTheme, loadSavedTheme } from '../lib/themes';

type VibeMode = 'normal' | 'high-load' | 'crisis' | 'focus';
export type UserRole = 'architect' | 'developer' | 'viewer';

interface VibeState {
  mode: VibeMode;
  metrics: {
    gpuUsage: number;
    cpuUsage: number;
    errorRate: number;
  };
  setMode: (mode: VibeMode) => void;
  // Theme
  theme: Theme;
  themeId: ThemeId;
  setTheme: (id: ThemeId) => void;
  availableThemes: Theme[];
  // Roles
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
}

export const VibeContext = createContext<VibeState | undefined>(undefined);

// Bridge WebSocket URL — opt-in only. Set VITE_BRIDGE_URL in .env to enable telemetry stream.
// If not set, the bridge is simply disabled and no connection is attempted.
const BRIDGE_URL = import.meta.env.VITE_BRIDGE_URL || null;
const WS_URL = BRIDGE_URL ? BRIDGE_URL.replace('http', 'ws') + '/stream' : null;

export function VibeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<VibeMode>('normal');
  const [metrics, setMetrics] = useState({ gpuUsage: 0, cpuUsage: 0, errorRate: 0 });
  const [manualOverride, setManualOverride] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>('architect');

  // Theme state
  const [themeId, setThemeId] = useState<ThemeId>('cyberpunk');
  const [theme, setThemeState] = useState<Theme>(themes.cyberpunk);

  // WebSocket management
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);
  const retryCountRef = useRef(0);
  const MAX_RETRIES = 5;
  const BASE_RETRY_DELAY = 5000; // 5s base, doubles each attempt up to 60s

  // Load saved theme on mount
  useEffect(() => {
    const savedTheme = loadSavedTheme();
    setThemeId(savedTheme);
    const themeConfig = getTheme(savedTheme);
    setThemeState(themeConfig);
    applyTheme(themeConfig);
  }, []);

  // Theme setter
  const handleSetTheme = (id: ThemeId) => {
    setThemeId(id);
    const themeConfig = getTheme(id);
    setThemeState(themeConfig);
    applyTheme(themeConfig);
    saveTheme(id);
  };

  const connectRef = useRef<(() => void) | null>(null);

  const connect = useCallback(() => {
    if (!isMountedRef.current) return;

    // Bridge is opt-in — skip entirely if VITE_BRIDGE_URL not configured
    if (!WS_URL) return;

    // Give up after max retries — bridge is optional telemetry
    if (retryCountRef.current >= MAX_RETRIES) {
      if (import.meta.env.DEV) console.log('🔌 Nexus Bridge: stream unavailable, running without telemetry.');
      return;
    }

    // Cleanup any existing connection
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    try {
      const ws = new WebSocket(WS_URL!);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!isMountedRef.current) {
          ws.close();
          return;
        }
        retryCountRef.current = 0; // reset on successful connection
        if (import.meta.env.DEV) console.log('🔌 Nexus Intelligence Stream: ONLINE');
      };

      ws.onmessage = (event) => {
        if (!isMountedRef.current) return;
        try {
          const message = JSON.parse(event.data);
          if (message.type === 'status') {
            const { system, errors } = message.data;

            const gpuUsage = system?.gpu?.utilization || 0;
            const cpuUsage = system?.cpu?.usage || 0;
            const errorRate = errors?.rate || 0;

            setMetrics({ gpuUsage, cpuUsage, errorRate });

            if (!manualOverride) {
              if (errorRate > 5) {
                setMode('crisis');
              } else if (gpuUsage > 80 || cpuUsage > 90) {
                setMode('high-load');
              } else {
                setMode('normal');
              }
            }
          }
        } catch (e) {
          // Ignore parse errors
        }
      };

      ws.onclose = () => {
        wsRef.current = null;
        if (isMountedRef.current) {
          retryCountRef.current += 1;
          const delay = Math.min(BASE_RETRY_DELAY * Math.pow(2, retryCountRef.current - 1), 60000);
          if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = setTimeout(() => { if (connectRef.current) connectRef.current(); }, delay);
        }
      };

      ws.onerror = () => {
        ws.close();
      };
    } catch (e) {
      if (isMountedRef.current) {
        retryCountRef.current += 1;
        const delay = Math.min(BASE_RETRY_DELAY * Math.pow(2, retryCountRef.current - 1), 60000);
        if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = setTimeout(() => { if (connectRef.current) connectRef.current(); }, delay);
      }
    }
  }, [manualOverride]);

  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  useEffect(() => {
    isMountedRef.current = true;
    connect();

    return () => {
      isMountedRef.current = false;
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) {
        const ws = wsRef.current;
        // Check state to avoid "close before established" warning
        if (ws.readyState === WebSocket.OPEN) {
          ws.close(1000, 'Component unmounting');
        } else if (ws.readyState === WebSocket.CONNECTING) {
          // Just remove listeners and let it time out or close naturally 
          // to avoid the browser console warning in StrictMode
          ws.onopen = null;
          ws.onclose = null;
          ws.onerror = null;
          ws.onmessage = null;
          ws.close();
        }
        wsRef.current = null;
      }
    };
  }, [connect]);

  // Apply global classes to body based on mode
  useEffect(() => {
    document.body.setAttribute('data-vibe', mode);
  }, [mode]);

  return (
    <VibeContext.Provider value={{
      mode,
      metrics,
      setMode: (m) => { setMode(m); setManualOverride(true); },
      theme,
      themeId,
      setTheme: handleSetTheme,
      availableThemes: Object.values(themes),
      userRole,
      setUserRole
    }}>
      {children}
    </VibeContext.Provider>
  );
}

export function useVibe() {
  const context = useContext(VibeContext);
  if (context === undefined) {
    throw new Error('useVibe must be used within a VibeProvider');
  }
  return context;
}
