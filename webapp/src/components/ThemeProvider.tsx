'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light' | 'system';

interface ThemeProviderProps {
    children: React.ReactNode;
    defaultTheme?: Theme;
    storageKey?: string;
}

interface ThemeProviderState {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    fontSize: 'normal' | 'large' | 'xl';
    setFontSize: (size: 'normal' | 'large' | 'xl') => void;
}

const initialState: ThemeProviderState = {
    theme: 'dark',
    setTheme: () => null,
    fontSize: 'normal',
    setFontSize: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
    children,
    defaultTheme = 'dark',
    storageKey = 'vite-ui-theme',
    ...props
}: ThemeProviderProps) {
    const [theme, setTheme] = useState<Theme>(() => {
        if (typeof window !== 'undefined') {
            return (localStorage.getItem(storageKey) as Theme) || defaultTheme;
        }
        return defaultTheme;
    });

    const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xl'>(() => {
        if (typeof window !== 'undefined') {
            return (localStorage.getItem(`${storageKey}-font`) as 'normal' | 'large' | 'xl') || 'normal';
        }
        return 'normal';
    });

    useEffect(() => {
        const root = window.document.documentElement;

        root.classList.remove('light', 'dark');

        if (theme === 'system') {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
                .matches
                ? 'dark'
                : 'light';

            root.classList.add(systemTheme);
            root.setAttribute('data-theme', systemTheme);
        } else {
            root.classList.add(theme);
            root.setAttribute('data-theme', theme);
        }

        if (typeof window !== 'undefined') {
            localStorage.setItem(storageKey, theme);
        }
    }, [theme, storageKey]);

    useEffect(() => {
        const root = window.document.documentElement;
        const scale = fontSize === 'xl' ? '1.25' : fontSize === 'large' ? '1.1' : '1';
        root.style.setProperty('--font-scale', scale);
        // We could also set a data attribute for CSS selectors
        root.setAttribute('data-font-size', fontSize);

        if (typeof window !== 'undefined') {
            localStorage.setItem(`${storageKey}-font`, fontSize);
        }
    }, [fontSize, storageKey]);

    const value = {
        theme,
        setTheme,
        fontSize,
        setFontSize,
    };

    return (
        <ThemeProviderContext.Provider {...props} value={value}>
            {children}
        </ThemeProviderContext.Provider>
    );
}

export const useTheme = () => {
    const context = useContext(ThemeProviderContext);

    if (context === undefined)
        throw new Error('useTheme must be used within a ThemeProvider');

    return context;
};
