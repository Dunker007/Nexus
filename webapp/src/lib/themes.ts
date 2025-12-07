/**
 * DLX Studio Theme System
 * 5 distinct visual themes with full color palettes
 */

export type ThemeId = 'cyberpunk' | 'midnight' | 'hacker' | 'sunset' | 'minimal';

export interface Theme {
    id: ThemeId;
    name: string;
    description: string;
    colors: {
        primary: string;
        primaryRGB: string;
        accent: string;
        accentRGB: string;
        background: string;
        backgroundAlt: string;
        surface: string;
        text: string;
        textMuted: string;
        success: string;
        warning: string;
        error: string;
    };
    floodlightColor: 'cyan' | 'blue' | 'green' | 'orange' | 'purple' | 'pink' | 'red';
}

export const themes: Record<ThemeId, Theme> = {
    cyberpunk: {
        id: 'cyberpunk',
        name: 'Cyberpunk',
        description: 'Neon cyan & magenta on deep void',
        colors: {
            primary: '#00f5d4',
            primaryRGB: '0, 245, 212',
            accent: '#c77dff',
            accentRGB: '199, 125, 255',
            background: '#030305',
            backgroundAlt: '#0a0e1a',
            surface: 'rgba(10, 14, 26, 0.8)',
            text: '#ffffff',
            textMuted: '#a0aec0',
            success: '#00c853',
            warning: '#ffd600',
            error: '#ff1744'
        },
        floodlightColor: 'cyan'
    },
    midnight: {
        id: 'midnight',
        name: 'Midnight',
        description: 'Deep blues & soft moonlight',
        colors: {
            primary: '#60a5fa',
            primaryRGB: '96, 165, 250',
            accent: '#c4b5fd',
            accentRGB: '196, 181, 253',
            background: '#0a1628',
            backgroundAlt: '#1e293b',
            surface: 'rgba(15, 23, 42, 0.9)',
            text: '#f1f5f9',
            textMuted: '#94a3b8',
            success: '#34d399',
            warning: '#fbbf24',
            error: '#f87171'
        },
        floodlightColor: 'blue'
    },
    hacker: {
        id: 'hacker',
        name: 'Hacker',
        description: 'Matrix green on pure black',
        colors: {
            primary: '#22c55e',
            primaryRGB: '34, 197, 94',
            accent: '#86efac',
            accentRGB: '134, 239, 172',
            background: '#000000',
            backgroundAlt: '#0a0a0a',
            surface: 'rgba(0, 0, 0, 0.9)',
            text: '#22c55e',
            textMuted: '#4ade80',
            success: '#22c55e',
            warning: '#eab308',
            error: '#ef4444'
        },
        floodlightColor: 'green'
    },
    sunset: {
        id: 'sunset',
        name: 'Sunset',
        description: 'Warm oranges & deep purples',
        colors: {
            primary: '#f97316',
            primaryRGB: '249, 115, 22',
            accent: '#a855f7',
            accentRGB: '168, 85, 247',
            background: '#1a0a1e',
            backgroundAlt: '#2d1b36',
            surface: 'rgba(45, 27, 54, 0.9)',
            text: '#fef3c7',
            textMuted: '#d8b4fe',
            success: '#4ade80',
            warning: '#fbbf24',
            error: '#fb7185'
        },
        floodlightColor: 'orange'
    },
    minimal: {
        id: 'minimal',
        name: 'Minimal',
        description: 'Clean monochrome elegance',
        colors: {
            primary: '#e5e5e5',
            primaryRGB: '229, 229, 229',
            accent: '#a3a3a3',
            accentRGB: '163, 163, 163',
            background: '#0a0a0a',
            backgroundAlt: '#171717',
            surface: 'rgba(23, 23, 23, 0.9)',
            text: '#fafafa',
            textMuted: '#737373',
            success: '#4ade80',
            warning: '#fbbf24',
            error: '#f87171'
        },
        floodlightColor: 'blue'
    }
};

export function getTheme(id: ThemeId): Theme {
    return themes[id] || themes.cyberpunk;
}

export function applyTheme(theme: Theme): void {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    const { colors } = theme;

    // Apply CSS custom properties
    root.style.setProperty('--primary', colors.primary);
    root.style.setProperty('--primary-rgb', colors.primaryRGB);
    root.style.setProperty('--accent', colors.accent);
    root.style.setProperty('--accent-rgb', colors.accentRGB);
    root.style.setProperty('--bg-void', colors.background);
    root.style.setProperty('--bg-deep', colors.backgroundAlt);
    root.style.setProperty('--glass-bg', colors.surface);
    root.style.setProperty('--text-primary', colors.text);
    root.style.setProperty('--text-secondary', colors.textMuted);
    root.style.setProperty('--green', colors.success);
    root.style.setProperty('--yellow', colors.warning);
    root.style.setProperty('--red', colors.error);

    // Update body background
    document.body.style.backgroundColor = colors.background;
}

export function saveTheme(id: ThemeId): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('dlx-theme', id);
}

export function loadSavedTheme(): ThemeId {
    if (typeof window === 'undefined') return 'cyberpunk';
    const saved = localStorage.getItem('dlx-theme') as ThemeId | null;
    return saved && themes[saved] ? saved : 'cyberpunk';
}
