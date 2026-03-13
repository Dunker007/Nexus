/**
 * SmartFolio — Price Alert Engine
 * ================================
 * Monitors asset prices against user-defined thresholds.
 * Triggers browser notifications and visual alerts when conditions are met.
 */

// ─── Types ───
export interface PriceAlert {
    id: string;
    symbol: string;
    condition: 'above' | 'below';
    price: number;
    note: string;
    active: boolean;
    triggered: boolean;
    triggeredAt?: number;
    createdAt: number;
}

// ─── Storage ───
const STORAGE_KEY = 'smartfolio_price_alerts';

function loadAlerts(): PriceAlert[] {
    if (typeof window === 'undefined') return [];
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function saveAlerts(alerts: PriceAlert[]): void {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
    } catch (e) {
        console.warn('[AlertEngine] Save failed:', e);
    }
}

// ─── Notification Permission ───
let _permissionGranted = false;

export async function requestNotificationPermission(): Promise<boolean> {
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

function sendNotification(title: string, body: string): void {
    if (!_permissionGranted || typeof window === 'undefined') return;
    try {
        new Notification(title, {
            body,
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            tag: 'smartfolio-alert',
        });
    } catch (e) {
        console.warn('[AlertEngine] Notification failed:', e);
    }
}

// ─── Public API ───

export function getAlerts(): PriceAlert[] {
    return loadAlerts();
}

export function getActiveAlerts(): PriceAlert[] {
    return loadAlerts().filter(a => a.active && !a.triggered);
}

export function getTriggeredAlerts(): PriceAlert[] {
    return loadAlerts().filter(a => a.triggered);
}

export function addAlert(
    symbol: string,
    condition: 'above' | 'below',
    price: number,
    note: string = ''
): PriceAlert {
    const alerts = loadAlerts();
    const alert: PriceAlert = {
        id: `alert-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        symbol: symbol.toUpperCase(),
        condition,
        price,
        note: note || `${symbol} ${condition} $${price}`,
        active: true,
        triggered: false,
        createdAt: Date.now(),
    };
    alerts.push(alert);
    saveAlerts(alerts);
    return alert;
}

export function removeAlert(id: string): void {
    const alerts = loadAlerts().filter(a => a.id !== id);
    saveAlerts(alerts);
}

export function clearTriggered(): void {
    const alerts = loadAlerts().filter(a => !a.triggered);
    saveAlerts(alerts);
}

export function toggleAlert(id: string): void {
    const alerts = loadAlerts();
    const idx = alerts.findIndex(a => a.id === id);
    if (idx >= 0) {
        alerts[idx].active = !alerts[idx].active;
        saveAlerts(alerts);
    }
}

export function resetAlert(id: string): void {
    const alerts = loadAlerts();
    const idx = alerts.findIndex(a => a.id === id);
    if (idx >= 0) {
        alerts[idx].triggered = false;
        alerts[idx].triggeredAt = undefined;
        alerts[idx].active = true;
        saveAlerts(alerts);
    }
}

/**
 * Check current prices against active alerts.
 * Call this on every price update cycle.
 * Returns array of newly triggered alerts.
 */
export function checkAlerts(currentPrices: Record<string, number>): PriceAlert[] {
    const alerts = loadAlerts();
    const newlyTriggered: PriceAlert[] = [];

    for (const alert of alerts) {
        if (!alert.active || alert.triggered) continue;

        const price = currentPrices[alert.symbol];
        if (price === undefined) continue;

        const triggered =
            (alert.condition === 'above' && price >= alert.price) ||
            (alert.condition === 'below' && price <= alert.price);

        if (triggered) {
            alert.triggered = true;
            alert.triggeredAt = Date.now();
            newlyTriggered.push(alert);

            // Fire browser notification
            const direction = alert.condition === 'above' ? '📈' : '📉';
            sendNotification(
                `${direction} ${alert.symbol} Alert!`,
                `${alert.symbol} is now $${price.toFixed(4)} (${alert.condition} $${alert.price}). ${alert.note}`
            );
        }
    }

    if (newlyTriggered.length > 0) {
        saveAlerts(alerts);
    }

    return newlyTriggered;
}
