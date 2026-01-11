/**
 * LuxRig Command Center - Unified Data Hook
 * Single source of truth for all LuxRig system data
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSettings } from '@/components/SettingsContext';
import { luxrigAPI } from '@/lib/luxrig/api';
import { REFRESH_INTERVALS, SERVICES } from '@/lib/luxrig/constants';
import type {
    LuxRigState,
    ServiceStatus,
    ServiceState,
    SystemMetrics,
    BridgeHealth,
    BridgeMetrics,
    ErrorStats,
    LLMModel,
} from '@/lib/luxrig/types';

// ============= INITIAL STATE =============
const initialState: LuxRigState = {
    connected: false,
    lastUpdated: null,
    services: [
        { name: SERVICES.BRIDGE.name, status: 'checking', icon: SERVICES.BRIDGE.icon },
        { name: SERVICES.LMSTUDIO.name, status: 'checking', icon: SERVICES.LMSTUDIO.icon },
        { name: SERVICES.OLLAMA.name, status: 'checking', icon: SERVICES.OLLAMA.icon },
        { name: SERVICES.GPU.name, status: 'checking', icon: SERVICES.GPU.icon },
    ],
    system: null,
    health: null,
    metrics: null,
    errors: { errors: [], stats: { last24Hours: 0, lastHour: 0 } },
    models: { lmstudio: [], ollama: [], loaded: [] },
    agents: [],
    network: null,
};

// ============= HOOK OPTIONS =============
interface UseLuxRigDataOptions {
    /** Auto-refresh interval in ms (default: 5000) */
    refreshInterval?: number;
    /** Enable WebSocket real-time updates */
    enableWebSocket?: boolean;
    /** Only fetch specific data types */
    include?: ('system' | 'models' | 'agents' | 'errors' | 'network')[];
}

// ============= MAIN HOOK =============
export function useLuxRigData(options: UseLuxRigDataOptions = {}) {
    const {
        refreshInterval = REFRESH_INTERVALS.FAST,
        enableWebSocket = false,
        include,
    } = options;

    const { settings } = useSettings();
    const [state, setState] = useState<LuxRigState>(initialState);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const wsRef = useRef<WebSocket | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Update API base URL when settings change
    useEffect(() => {
        if (settings.bridgeUrl) {
            luxrigAPI.setBaseUrl(settings.bridgeUrl);
        }
    }, [settings.bridgeUrl]);

    // ============= SERVICE STATUS UPDATE =============
    const updateService = useCallback((name: string, status: ServiceState, latency?: number) => {
        setState(prev => ({
            ...prev,
            services: prev.services.map(s =>
                s.name === name ? { ...s, status, latency, lastChecked: new Date() } : s
            ),
        }));
    }, []);

    // ============= FETCH ALL DATA =============
    const fetchAllData = useCallback(async () => {
        setIsRefreshing(true);
        const startTime = Date.now();

        try {
            // Determine what to fetch
            const shouldFetch = (type: string) => !include || include.includes(type as typeof include[number]);

            // Parallel fetches
            const results = await Promise.allSettled([
                luxrigAPI.getHealth(),
                luxrigAPI.getMetrics(),
                shouldFetch('system') ? luxrigAPI.getSystem() : null,
                shouldFetch('errors') ? luxrigAPI.getErrors(10) : null,
                shouldFetch('models') ? luxrigAPI.getAllModels() : null,
            ]);

            const bridgeLatency = Date.now() - startTime;
            const [healthResult, metricsResult, systemResult, errorsResult, modelsResult] = results;

            // Process health
            const health = healthResult.status === 'fulfilled' ? healthResult.value : null;
            if (health) {
                updateService(SERVICES.BRIDGE.name, 'operational', bridgeLatency);
                setState(prev => ({ ...prev, health, connected: true }));
            } else {
                updateService(SERVICES.BRIDGE.name, 'down');
                setState(prev => ({ ...prev, connected: false }));
            }

            // Process metrics
            const metrics = metricsResult.status === 'fulfilled' ? metricsResult.value : null;
            if (metrics) {
                setState(prev => ({ ...prev, metrics }));
            }

            // Process system
            if (shouldFetch('system')) {
                const system = systemResult.status === 'fulfilled' ? systemResult.value as SystemMetrics | null : null;
                if (system) {
                    updateService(SERVICES.GPU.name, system.gpu?.available ? 'operational' : 'degraded');
                    setState(prev => ({ ...prev, system }));
                } else {
                    updateService(SERVICES.GPU.name, 'down');
                }
            }

            // Process errors
            if (shouldFetch('errors')) {
                const errors = errorsResult.status === 'fulfilled' ? errorsResult.value as ErrorStats | null : null;
                if (errors) {
                    setState(prev => ({ ...prev, errors }));
                }
            }

            // Process models
            if (shouldFetch('models')) {
                const models = modelsResult.status === 'fulfilled'
                    ? modelsResult.value as { lmstudio: LLMModel[]; ollama: LLMModel[] } | null
                    : null;

                if (models) {
                    updateService(SERVICES.LMSTUDIO.name, models.lmstudio.length > 0 ? 'operational' : 'degraded');
                    updateService(SERVICES.OLLAMA.name, models.ollama.length > 0 ? 'operational' : 'degraded');

                    // Loaded models are those currently in VRAM/RAM
                    const loaded = [...models.lmstudio, ...models.ollama].filter(m => m.loaded);

                    setState(prev => ({
                        ...prev,
                        models: { ...models, loaded },
                    }));
                } else {
                    updateService(SERVICES.LMSTUDIO.name, 'down');
                    updateService(SERVICES.OLLAMA.name, 'down');
                }
            }

            // Update timestamp
            setState(prev => ({ ...prev, lastUpdated: new Date() }));

        } catch (error) {
            console.error('[useLuxRigData] Fetch error:', error);
            updateService(SERVICES.BRIDGE.name, 'down');
            setState(prev => ({ ...prev, connected: false }));
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [include, updateService]);

    // ============= REFRESH SINGLE SERVICE =============
    const refreshService = useCallback(async (serviceName: string) => {
        updateService(serviceName, 'checking');

        switch (serviceName) {
            case SERVICES.BRIDGE.name: {
                const health = await luxrigAPI.getHealth();
                updateService(serviceName, health ? 'operational' : 'down');
                break;
            }
            case SERVICES.LMSTUDIO.name: {
                const models = await luxrigAPI.getLMStudioModels();
                updateService(serviceName, models.length > 0 ? 'operational' : 'down');
                break;
            }
            case SERVICES.OLLAMA.name: {
                const models = await luxrigAPI.getOllamaModels();
                updateService(serviceName, models.length > 0 ? 'operational' : 'down');
                break;
            }
            case SERVICES.GPU.name: {
                const system = await luxrigAPI.getSystem();
                updateService(serviceName, system?.gpu?.available ? 'operational' : 'down');
                break;
            }
        }
    }, [updateService]);

    // ============= MODEL ACTIONS =============
    const loadModel = useCallback(async (modelId: string, provider: 'lmstudio' | 'ollama') => {
        await luxrigAPI.loadModel(modelId, provider);
        await fetchAllData(); // Refresh to get updated state
    }, [fetchAllData]);

    const unloadModel = useCallback(async (modelId: string, provider: 'lmstudio' | 'ollama') => {
        await luxrigAPI.unloadModel(modelId, provider);
        await fetchAllData();
    }, [fetchAllData]);

    // ============= AGENT ACTIONS =============
    const runAgent = useCallback(async (agentId: string) => {
        await luxrigAPI.runAgent(agentId);
        await fetchAllData();
    }, [fetchAllData]);

    const pauseAgent = useCallback(async (agentId: string) => {
        await luxrigAPI.pauseAgent(agentId);
        await fetchAllData();
    }, [fetchAllData]);

    // ============= OPTIMIZATION ACTIONS =============
    const clearCache = useCallback(async () => {
        const result = await luxrigAPI.clearCache();
        return result || { cleared: 0 };
    }, []);

    const freeMemory = useCallback(async () => {
        const result = await luxrigAPI.freeMemory();
        return result || { freed: 0 };
    }, []);

    // ============= WEBSOCKET CONNECTION =============
    useEffect(() => {
        if (!enableWebSocket || !settings.bridgeUrl) return;

        const wsUrl = settings.bridgeUrl.replace('http', 'ws') + '/stream';

        const connect = () => {
            try {
                const ws = new WebSocket(wsUrl);

                ws.onopen = () => {
                    console.log('[useLuxRigData] WebSocket connected');
                };

                ws.onmessage = (event) => {
                    try {
                        const message = JSON.parse(event.data);

                        // Handle different message types
                        if (message.type === 'system_update' && message.data) {
                            setState(prev => ({
                                ...prev,
                                system: message.data as SystemMetrics,
                                lastUpdated: new Date(),
                            }));
                        }
                    } catch (e) {
                        console.warn('[useLuxRigData] Failed to parse WS message:', e);
                    }
                };

                ws.onclose = () => {
                    console.log('[useLuxRigData] WebSocket disconnected');
                    // Reconnect after delay
                    setTimeout(connect, 3000);
                };

                ws.onerror = (error) => {
                    console.warn('[useLuxRigData] WebSocket error:', error);
                };

                wsRef.current = ws;
            } catch (e) {
                console.warn('[useLuxRigData] Failed to connect WebSocket:', e);
            }
        };

        connect();

        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, [enableWebSocket, settings.bridgeUrl]);

    // ============= AUTO-REFRESH =============
    useEffect(() => {
        // Initial fetch
        setTimeout(() => fetchAllData(), 0);

        // Set up interval
        intervalRef.current = setInterval(fetchAllData, refreshInterval);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [fetchAllData, refreshInterval]);

    // ============= COMPUTED VALUES =============
    const operationalCount = state.services.filter(s => s.status === 'operational').length;
    const overallStatus: ServiceState =
        operationalCount === state.services.length ? 'operational' :
            operationalCount > 0 ? 'degraded' : 'down';

    const gpuHealthy = state.system?.gpu?.available === true &&
        (state.system?.gpu?.temperature || 0) < 90;

    const bridgeOnline = state.services.find(s => s.name === SERVICES.BRIDGE.name)?.status === 'operational';

    return {
        // State
        state,

        // Loading
        isLoading,
        isRefreshing,

        // Actions
        refresh: fetchAllData,
        refreshService,

        // Model actions
        loadModel,
        unloadModel,

        // Agent actions
        runAgent,
        pauseAgent,

        // Optimization
        clearCache,
        freeMemory,

        // Computed
        overallStatus,
        gpuHealthy,
        bridgeOnline,
    };
}

export default useLuxRigData;
