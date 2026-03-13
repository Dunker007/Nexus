/**
 * SmartFolio — Error Notification Service
 * ========================================
 * Provides user-facing error feedback and structured logging.
 * Integrates with existing browser notification system.
 */

// ─── Types ───
export type ErrorSeverity = 'critical' | 'warning' | 'info';
export type ErrorCategory = 'bridge' | 'ai' | 'price' | 'storage' | 'system';

export interface ErrorNotification {
    severity: ErrorSeverity;
    category: ErrorCategory;
    message: string;
    details?: string;
    timestamp: number;
    userMessage?: string; // Simplified message for notifications
}

// ─── Storage for Error History ───
const ERROR_HISTORY_KEY = 'smartfolio_error_history';
const MAX_HISTORY = 50;

function saveError(error: ErrorNotification): void {
    if (typeof window === 'undefined') return;
    try {
        const history = JSON.parse(localStorage.getItem(ERROR_HISTORY_KEY) || '[]');
        history.unshift(error);
        if (history.length > MAX_HISTORY) history.splice(MAX_HISTORY);
        localStorage.setItem(ERROR_HISTORY_KEY, JSON.stringify(history));
    } catch {
        // Storage quota exceeded - clear old errors
        localStorage.removeItem(ERROR_HISTORY_KEY);
    }
}

export function getErrorHistory(): ErrorNotification[] {
    if (typeof window === 'undefined') return [];
    try {
        return JSON.parse(localStorage.getItem(ERROR_HISTORY_KEY) || '[]');
    } catch {
        return [];
    }
}

export function clearErrorHistory(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(ERROR_HISTORY_KEY);
}

// ─── Notification Permission ───
let _permissionGranted = false;

export async function requestErrorNotificationPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) return false;

    if (Notification.permission === 'granted') {
        _permissionGranted = true;
        return true;
    }

    if (Notification.permission === 'denied') return false;

    const result = await Notification.requestPermission();
    _permissionGranted = result === 'granted';
    return _permissionGranted;
}

// ─── Core Error Handler ───
export function notifyError(
    category: ErrorCategory,
    severity: ErrorSeverity,
    message: string,
    details?: string,
    userMessage?: string
): void {
    const error: ErrorNotification = {
        severity,
        category,
        message,
        details,
        userMessage,
        timestamp: Date.now()
    };

    // Save to history
    saveError(error);

    // Structured console logging
    const prefix = `[SmartFolio:${category.toUpperCase()}]`;
    const logMessage = details ? `${message}\nDetails: ${details}` : message;

    switch (severity) {
        case 'critical':
            console.error(prefix, logMessage);
            break;
        case 'warning':
            console.warn(prefix, logMessage);
            break;
        case 'info':
            console.info(prefix, logMessage);
            break;
    }

    // Browser notification for critical errors
    if (severity === 'critical' && _permissionGranted) {
        try {
            new Notification('SmartFolio Error', {
                body: userMessage || message,
                icon: '/favicon.ico',
                badge: '/favicon.ico',
                tag: 'smartfolio-error',
            });
        } catch (e) {
            console.warn('[ErrorNotification] Failed to show notification:', e);
        }
    }
}

// ─── Convenience Wrappers ───

export const bridgeError = (message: string, details?: string, userMessage?: string) =>
    notifyError('bridge', 'critical', message, details, userMessage);

export const bridgeWarning = (message: string, details?: string) =>
    notifyError('bridge', 'warning', message, details);

export const aiError = (message: string, details?: string, userMessage?: string) =>
    notifyError('ai', 'warning', message, details, userMessage);

export const priceError = (message: string, details?: string) =>
    notifyError('price', 'warning', message, details);

export const storageError = (message: string, details?: string) =>
    notifyError('storage', 'info', message, details);

// ─── Error Recovery Helpers ───

export function getLastError(category?: ErrorCategory): ErrorNotification | null {
    const history = getErrorHistory();
    if (!category) return history[0] || null;
    return history.find(e => e.category === category) || null;
}

export function hasRecentErrors(category?: ErrorCategory, withinMs: number = 60000): boolean {
    const history = getErrorHistory();
    const cutoff = Date.now() - withinMs;
    const recent = history.filter(e => e.timestamp > cutoff);
    if (!category) return recent.length > 0;
    return recent.some(e => e.category === category);
}
