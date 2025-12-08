// ========================================
// DLX STUDIO - SHARED UTILITIES
// ========================================

// LuxRig Bridge Configuration
export const LUXRIG_BRIDGE_URL = process.env.NEXT_PUBLIC_BRIDGE_URL || 'http://localhost:3456';

// App Configuration
export const APP_CONFIG = {
    name: 'DLX Studio',
    version: '2.0.0',
    description: 'AI Command Center',
    github: 'https://github.com/Dunker007',
};

// LuxRig API endpoints
export const API_ENDPOINTS = {
    status: `${LUXRIG_BRIDGE_URL}/status`,
    models: `${LUXRIG_BRIDGE_URL}/models`,
    chat: `${LUXRIG_BRIDGE_URL}/chat`,
    complete: `${LUXRIG_BRIDGE_URL}/complete`,
};

// Fetch with timeout and error handling
export async function fetchWithTimeout(
    url: string,
    options: RequestInit = {},
    timeout = 5000
): Promise<Response> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
        });
        clearTimeout(id);
        return response;
    } catch (error) {
        clearTimeout(id);
        throw error;
    }
}

// Format file sizes
export function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Format numbers with commas
export function formatNumber(num: number): string {
    return num.toLocaleString();
}

// Format currency
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount);
}

// Format relative time
export function formatRelativeTime(date: Date | string): string {
    const now = new Date();
    const then = new Date(date);
    const diff = now.getTime() - then.getTime();

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'just now';
}

// Debounce function
export function debounce<T extends (...args: unknown[]) => unknown>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

// Class name helper
export function cn(...classes: (string | boolean | undefined | null)[]): string {
    return classes.filter(Boolean).join(' ');
}

// Generate unique ID
export function generateId(): string {
    return Math.random().toString(36).substring(2, 9);
}

// Storage helpers with fallback
export const storage = {
    get: <T>(key: string, defaultValue: T): T => {
        if (typeof window === 'undefined') return defaultValue;
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch {
            return defaultValue;
        }
    },
    set: <T>(key: string, value: T): void => {
        if (typeof window === 'undefined') return;
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch {
            console.warn('Failed to save to localStorage');
        }
    },
    remove: (key: string): void => {
        if (typeof window === 'undefined') return;
        try {
            localStorage.removeItem(key);
        } catch {
            console.warn('Failed to remove from localStorage');
        }
    },
};
