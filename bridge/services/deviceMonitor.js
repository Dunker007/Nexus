import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Store known devices in data directory
const KNOWN_DEVICES_FILE = path.join(__dirname, '../data/known_devices.json');
const SCAN_INTERVAL = 30000; // 30 seconds

class DeviceMonitor {
    constructor() {
        this.knownDevices = new Set();
        this.onAlert = null;
        this.interval = null;
        this.ensureDataDir();
        this.loadKnownDevices();
    }

    ensureDataDir() {
        try {
            const dataDir = path.dirname(KNOWN_DEVICES_FILE);
            if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir, { recursive: true });
            }
        } catch (error) {
            console.error('Error creating data directory:', error);
        }
    }

    loadKnownDevices() {
        try {
            if (fs.existsSync(KNOWN_DEVICES_FILE)) {
                const data = JSON.parse(fs.readFileSync(KNOWN_DEVICES_FILE, 'utf8'));
                // Migrate or load
                if (Array.isArray(data)) {
                    data.forEach(d => this.knownDevices.add(d.mac));
                }
            }
        } catch (e) {
            console.error('Error loading known devices:', e);
        }
    }

    saveKnownDevices() {
        try {
            const list = Array.from(this.knownDevices).map(mac => ({ mac }));
            fs.writeFileSync(KNOWN_DEVICES_FILE, JSON.stringify(list, null, 2));
        } catch (e) {
            console.error('Error saving known devices:', e);
        }
    }

    start(onAlertCallback) {
        this.onAlert = onAlertCallback;
        console.log('🛡️ Device Monitor started (Interval: 30s)');
        this.scan(); // Initial scan
        this.interval = setInterval(() => this.scan(), SCAN_INTERVAL);
    }

    stop() {
        if (this.interval) clearInterval(this.interval);
    }

    scan() {
        // Use arp -a for Windows compatibility
        exec('arp -a', (error, stdout, stderr) => {
            if (error) {
                console.error('ARP scan error:', error);
                return;
            }

            const lines = stdout.split('\n');
            const currentDevices = new Set();

            // Regex for IP and MAC (Windows format: 192.168.1.1 ... 00-11-22-33-44-55)
            // Matches dash-separated MACs common in Windows arp -a
            const entryRegex = /\s+([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})\s+([0-9a-fA-F]{2}(?:-[0-9a-fA-F]{2}){5})\s+/;

            for (const line of lines) {
                const match = line.match(entryRegex);
                if (match) {
                    const ip = match[1];
                    let mac = match[2].toUpperCase().replace(/-/g, ':'); // Normalize to colons

                    // Ignore broadcast/multicast/invalid
                    if (mac.startsWith('FF:FF')) continue;
                    if (mac.startsWith('01:00:5E')) continue; // IPv4 Multicast

                    currentDevices.add(mac);

                    // Alert if new
                    if (!this.knownDevices.has(mac)) {
                        const alert = `Unknown device detected: ${mac} @ ${ip}`;
                        console.log('🚨 ' + alert);

                        // Emit alert
                        if (this.onAlert) {
                            this.onAlert({
                                type: 'device_alert',
                                message: alert,
                                device: { mac, ip, timestamp: new Date().toISOString() }
                            });
                        }

                        // For MVP, auto-add to known to prevent spamming the same device every 30s
                        // Ideally, we'd have a "pending" state, but this meets the "Alert" requirement.
                        this.knownDevices.add(mac);
                        this.saveKnownDevices();
                    }
                }
            }
        });
    }
}

export const deviceMonitor = new DeviceMonitor();
