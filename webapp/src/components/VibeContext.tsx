'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ThemeId, Theme, themes, getTheme, applyTheme, saveTheme, loadSavedTheme } from '@/lib/themes';

import { LUXRIG_BRIDGE_URL } from '@/lib/utils';

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

const WS_URL = LUXRIG_BRIDGE_URL.replace('http', 'ws') + '/stream';

export function VibeProvider({ children }: { children: ReactNode }) {
    const [mode, setMode] = useState<VibeMode>('normal');
    const [metrics, setMetrics] = useState({ gpuUsage: 0, cpuUsage: 0, errorRate: 0 });
    const [manualOverride, setManualOverride] = useState(false);
    const [userRole, setUserRole] = useState<UserRole>('architect');

    // Theme state
    const [themeId, setThemeId] = useState<ThemeId>('cyberpunk');
    const [theme, setThemeState] = useState<Theme>(themes.cyberpunk);

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

    useEffect(() => {
        const ws = new WebSocket(WS_URL);

        ws.onerror = () => {
            // Silently fail if bridge is not running
        };

        ws.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                if (message.type === 'status') {
                    const { system, errors } = message.data;

                    // Extract metrics
                    const gpuUsage = system?.gpu?.utilization || 0;
                    const cpuUsage = system?.cpu?.usage || 0;
                    const errorRate = errors?.rate || 0;

                    setMetrics({ gpuUsage, cpuUsage, errorRate });

                    // Automatic Vibe Switching (if not manually overridden)
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

        return () => {
            ws.close();
        };
    }, [manualOverride]);

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

