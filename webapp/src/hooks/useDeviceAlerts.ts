import { useEffect, useState } from 'react';

// Use same type as emitted by deviceMonitor
export interface DeviceAlert {
    type: string;
    message: string;
    device: {
        mac: string;
        ip: string;
        timestamp: string;
    };
}

export function useDeviceAlerts(bridgeUrl: string) {
    const [alerts, setAlerts] = useState<DeviceAlert[]>([]);

    useEffect(() => {
        if (!bridgeUrl) return;

        // Construct WebSocket URL from bridgeUrl (http -> ws, https -> wss)
        // Ensure we connect to /stream endpoint like server.js expects
        const wsProtocol = bridgeUrl.startsWith('https') ? 'wss:' : 'ws:';
        const wsHost = bridgeUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
        const wsUrl = `${wsProtocol}//${wsHost}/stream`;

        let ws: WebSocket | null = null;
        let reconnectTimer: NodeJS.Timeout;

        const connect = () => {
            try {
                ws = new WebSocket(wsUrl);

                ws.onopen = () => {
                    console.log('🛡️ Device Monitor connected');
                };

                ws.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        if (data.type === 'device_alert') {
                            setAlerts(prev => [data, ...prev].slice(0, 50)); // Keep last 50
                        }
                    } catch (e) {
                        // ignore parse errors
                    }
                };

                ws.onclose = () => {
                    console.log('Device Monitor disconnected, reconnecting...');
                    reconnectTimer = setTimeout(connect, 5000);
                };

                ws.onerror = (err) => {
                    console.error('Device Monitor WS error:', err);
                    ws?.close();
                };

            } catch (e) {
                console.error('WS Connection failed:', e);
                reconnectTimer = setTimeout(connect, 5000);
            }
        };

        connect();

        return () => {
            if (ws) ws.close();
            clearTimeout(reconnectTimer);
        };
    }, [bridgeUrl]);

    const clearAlerts = () => setAlerts([]);

    return { alerts, clearAlerts };
}
