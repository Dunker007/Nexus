/**
 * Network Service - Ping tests and network status checks
 * Works in standalone mode (no Omada Controller required)
 */

import { exec } from 'child_process';
import FastSpeedtest from 'fast-speedtest-api';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Network configuration (matches user's actual setup)
const NETWORK_CONFIG = {
    isps: [
        {
            id: 'verizon',
            name: 'Verizon 5G Home',
            model: 'ASK-NCQ1338',
            type: 'primary',
            gateway: '192.168.1.1',  // Typical Verizon gateway
            testHost: '8.8.8.8',     // Google DNS for external test
        },
        {
            id: 'tmobile',
            name: 'T-Mobile 5G Home',
            model: 'Sagemcom Fast 5688W',
            type: 'failover',
            gateway: '192.168.12.1', // Typical T-Mobile gateway
            testHost: '1.1.1.1',     // Cloudflare for external test
        },
    ],
    router: {
        name: 'TP-Link ER605 V2',
        role: 'Core Router',
        gateway: '192.168.0.1',      // ER605 LAN gateway
    },
};

export const networkService = {
    config: NETWORK_CONFIG,

    /**
     * Ping a host and return latency
     */
    async ping(host, count = 4) {
        try {
            // Windows ping command
            const { stdout } = await execAsync(`ping -n ${count} ${host}`, { timeout: 10000 });

            // Parse average latency from Windows ping output
            const avgMatch = stdout.match(/Average = (\d+)ms/);
            const lossMatch = stdout.match(/Lost = (\d+)/);

            const avgLatency = avgMatch ? parseInt(avgMatch[1]) : null;
            const packetLoss = lossMatch ? parseInt(lossMatch[1]) : 0;

            return {
                host,
                reachable: avgLatency !== null,
                latency: avgLatency,
                packetLoss: (packetLoss / count) * 100,
                status: avgLatency !== null ? 'online' : 'offline',
            };
        } catch (error) {
            return {
                host,
                reachable: false,
                latency: null,
                packetLoss: 100,
                status: 'offline',
                error: error.message,
            };
        }
    },

    /**
     * Check all ISP statuses
     */
    async checkISPs() {
        const results = await Promise.all(
            NETWORK_CONFIG.isps.map(async (isp) => {
                // Ping both gateway and external host
                const [gatewayPing, externalPing] = await Promise.all([
                    this.ping(isp.gateway, 2),
                    this.ping(isp.testHost, 2),
                ]);

                let status = 'offline';
                if (gatewayPing.reachable && externalPing.reachable) {
                    status = 'online';
                } else if (gatewayPing.reachable) {
                    status = 'degraded'; // Gateway up but no internet
                }

                return {
                    id: isp.id,
                    name: isp.name,
                    model: isp.model,
                    type: isp.type,
                    status,
                    gatewayLatency: gatewayPing.latency,
                    externalLatency: externalPing.latency,
                    gatewayReachable: gatewayPing.reachable,
                    internetReachable: externalPing.reachable,
                };
            })
        );

        return results;
    },

    /**
     * Check router status
     */
    async checkRouter() {
        const ping = await this.ping(NETWORK_CONFIG.router.gateway, 2);

        return {
            name: NETWORK_CONFIG.router.name,
            role: NETWORK_CONFIG.router.role,
            gateway: NETWORK_CONFIG.router.gateway,
            status: ping.reachable ? 'online' : 'offline',
            latency: ping.latency,
        };
    },

    /**
     * Get full network status
     */
    async getStatus() {
        const [isps, router] = await Promise.all([
            this.checkISPs(),
            this.checkRouter(),
        ]);

        // Determine overall status
        const onlineISPs = isps.filter(i => i.status === 'online').length;
        let overallStatus = 'offline';
        if (onlineISPs === isps.length) {
            overallStatus = 'optimal';
        } else if (onlineISPs > 0) {
            overallStatus = 'degraded';
        }

        return {
            overallStatus,
            isps,
            router,
            timestamp: new Date().toISOString(),
        };
    },

    /**
     * Run a speed test (uses fast.com CLI or falls back to ping latency)
     * Note: For full speed test, install speedtest-cli: npm install speedtest-net
     */
    /**
     * Run a speed test using fast-speedtest-api
     */
    async runSpeedTest() {
        try {
            console.log('🚀 Starting Fast.com speed test...');
            // Token is required. Use env var or default public token (often used in examples).
            const token = process.env.FAST_TOKEN || "YXNkZmFzZGxmbnNkYWZoYXNkZmhrYWxm";

            // Run latency check in parallel with speedtest init
            // Fast.com check takes time, so we ping google for a quick latency "feel"
            const latencyPromise = this.ping('8.8.8.8', 2);

            const speedtest = new FastSpeedtest({
                token,
                verbose: false,
                timeout: 10000,
                https: true,
                urlCount: 5,
                bufferSize: 8,
                unit: FastSpeedtest.UNITS.Mbps
            });

            const download = await speedtest.getDownloadSpeed();

            // Try upload (might fail)
            let upload = null;
            try {
                upload = await speedtest.getUploadSpeed();
            } catch (e) {
                // Ignore upload error
            }

            // Resolve latency
            const latencyResult = await latencyPromise;

            return {
                success: true,
                download: (download).toFixed(1),
                upload: upload ? (upload).toFixed(1) : null,
                ping: latencyResult.latency || null,
                server: 'Fast.com',
                timestamp: new Date().toISOString(),
            };
        } catch (error) {
            console.error('Speedtest error:', error.message);
            // Fallback to ping latency check
            const [google] = await Promise.all([
                this.ping('8.8.8.8', 4)
            ]);

            return {
                success: false,
                message: 'Fast.com test failed. Showing latency only.',
                latency: {
                    google: google.latency
                },
                ping: google.latency, // Fallback ping
                timestamp: new Date().toISOString(),
            };
        }
    },

    /**
     * Update configuration (for when user provides actual gateway IPs)
     */
    updateConfig(newConfig) {
        if (newConfig.isps) {
            newConfig.isps.forEach((isp, index) => {
                if (NETWORK_CONFIG.isps[index]) {
                    Object.assign(NETWORK_CONFIG.isps[index], isp);
                }
            });
        }
        if (newConfig.router) {
            Object.assign(NETWORK_CONFIG.router, newConfig.router);
        }
        return NETWORK_CONFIG;
    },
};

export default networkService;
