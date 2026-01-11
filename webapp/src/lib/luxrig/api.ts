/**
 * LuxRig Command Center - API Client
 * Centralized API calls to the LuxRig Bridge
 */

import { LUXRIG_BRIDGE_URL } from '@/lib/utils';
import type {
    SystemMetrics,
    BridgeHealth,
    BridgeMetrics,
    ErrorStats,
    LLMModel,
    AgentInfo,
    DiskMetrics,
} from './types';

// ============= API CLIENT =============
class LuxRigAPI {
    private baseUrl: string;

    constructor(baseUrl?: string) {
        this.baseUrl = baseUrl || LUXRIG_BRIDGE_URL;
    }

    setBaseUrl(url: string) {
        this.baseUrl = url;
    }

    private async fetch<T>(endpoint: string, options?: RequestInit): Promise<T | null> {
        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options?.headers,
                },
            });

            if (!response.ok) {
                console.warn(`[LuxRigAPI] ${endpoint} returned ${response.status}`);
                return null;
            }

            return await response.json();
        } catch (error) {
            console.warn(`[LuxRigAPI] Failed to fetch ${endpoint}:`, error);
            return null;
        }
    }

    // ============= HEALTH & STATUS =============

    async getHealth(): Promise<BridgeHealth | null> {
        return this.fetch<BridgeHealth>('/health');
    }

    async getMetrics(): Promise<BridgeMetrics | null> {
        return this.fetch<BridgeMetrics>('/monitoring/metrics');
    }

    async getStatus(): Promise<{ status: string; uptime: number } | null> {
        return this.fetch('/status');
    }

    // ============= SYSTEM METRICS =============

    async getSystem(): Promise<SystemMetrics | null> {
        return this.fetch<SystemMetrics>('/system');
    }

    async getDisks(): Promise<DiskMetrics[] | null> {
        // If /system/disks doesn't exist yet, we'll get null
        const result = await this.fetch<DiskMetrics[]>('/system/disks');
        if (result) return result;

        // Fallback: get C: drive from main system endpoint
        const system = await this.getSystem();
        if (system) {
            // The system service has getDisk method, but we may need to call it separately
            return null;
        }
        return null;
    }

    async getProcesses(): Promise<{ name: string; cpu: number; memory: number }[] | null> {
        return this.fetch('/system/processes');
    }

    // ============= ERRORS =============

    async getErrors(limit = 10): Promise<ErrorStats | null> {
        return this.fetch<ErrorStats>(`/monitoring/errors?limit=${limit}`);
    }

    async clearErrors(): Promise<boolean> {
        const result = await this.fetch('/monitoring/errors/clear', { method: 'POST' });
        return result !== null;
    }

    // ============= LLM MODELS =============

    async getLMStudioModels(): Promise<LLMModel[]> {
        const result = await this.fetch<Array<{ id: string;[key: string]: unknown }>>('/llm/lmstudio/models');
        if (!result) return [];

        return result.map(m => ({
            id: m.id,
            name: m.id,
            provider: 'lmstudio' as const,
            loaded: true,
        }));
    }

    async getOllamaModels(): Promise<LLMModel[]> {
        const result = await this.fetch<Array<{ name: string; size?: number;[key: string]: unknown }>>('/llm/ollama/models');
        if (!result) return [];

        return result.map(m => ({
            id: m.name,
            name: m.name,
            provider: 'ollama' as const,
            size: m.size ? `${(m.size / 1024 / 1024 / 1024).toFixed(1)}GB` : undefined,
        }));
    }

    async getAllModels(): Promise<{ lmstudio: LLMModel[]; ollama: LLMModel[] }> {
        const [lmstudio, ollama] = await Promise.all([
            this.getLMStudioModels(),
            this.getOllamaModels(),
        ]);
        return { lmstudio, ollama };
    }

    async loadModel(modelId: string, provider: 'lmstudio' | 'ollama'): Promise<boolean> {
        const endpoint = provider === 'lmstudio'
            ? '/llm/lmstudio/load'
            : '/llm/ollama/load';

        const result = await this.fetch(endpoint, {
            method: 'POST',
            body: JSON.stringify({ model: modelId }),
        });
        return result !== null;
    }

    async unloadModel(modelId: string, provider: 'lmstudio' | 'ollama'): Promise<boolean> {
        const endpoint = provider === 'lmstudio'
            ? '/llm/lmstudio/unload'
            : '/llm/ollama/unload';

        const result = await this.fetch(endpoint, {
            method: 'POST',
            body: JSON.stringify({ model: modelId }),
        });
        return result !== null;
    }

    // ============= AGENTS =============

    async getAgents(): Promise<AgentInfo[]> {
        const result = await this.fetch<AgentInfo[]>('/agents');
        return result || [];
    }

    async runAgent(agentId: string): Promise<boolean> {
        const result = await this.fetch(`/agents/${agentId}/run`, { method: 'POST' });
        return result !== null;
    }

    async pauseAgent(agentId: string): Promise<boolean> {
        const result = await this.fetch(`/agents/${agentId}/pause`, { method: 'POST' });
        return result !== null;
    }

    async stopAgent(agentId: string): Promise<boolean> {
        const result = await this.fetch(`/agents/${agentId}/stop`, { method: 'POST' });
        return result !== null;
    }

    // ============= NETWORK =============

    async getNetworkStatus(): Promise<{ latency: number; status: string } | null> {
        return this.fetch('/network/status');
    }

    async runSpeedTest(isp?: 'primary' | 'failover'): Promise<{ download: number; upload: number; latency: number } | null> {
        const endpoint = isp ? `/network/speed?isp=${isp}` : '/network/speed';
        return this.fetch(endpoint, { method: 'POST' });
    }

    // ============= OPTIMIZATION =============

    async clearCache(): Promise<{ cleared: number } | null> {
        return this.fetch('/system/cache/clear', { method: 'POST' });
    }

    async freeMemory(): Promise<{ freed: number } | null> {
        return this.fetch('/system/memory/free', { method: 'POST' });
    }

    // ============= CHAT =============

    async chat(messages: Array<{ role: string; content: string }>, options?: {
        model?: string;
        provider?: 'lmstudio' | 'ollama';
        stream?: boolean;
    }): Promise<{ message: string } | null> {
        return this.fetch('/llm/chat', {
            method: 'POST',
            body: JSON.stringify({
                messages,
                ...options,
            }),
        });
    }

    // ============= PING =============

    async ping(): Promise<{ latency: number; ok: boolean }> {
        const start = Date.now();
        try {
            const response = await fetch(`${this.baseUrl}/health`, { method: 'HEAD' });
            return {
                latency: Date.now() - start,
                ok: response.ok,
            };
        } catch {
            return {
                latency: -1,
                ok: false,
            };
        }
    }
}

// Singleton instance
export const luxrigAPI = new LuxRigAPI();

// Factory for custom instances
export function createLuxRigAPI(baseUrl: string): LuxRigAPI {
    return new LuxRigAPI(baseUrl);
}

export default luxrigAPI;
