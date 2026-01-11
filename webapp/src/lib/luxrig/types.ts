/**
 * LuxRig Command Center - Type Definitions
 * Central types for all system monitoring and management
 */

// ============= SERVICE STATUS =============
export type ServiceState = 'operational' | 'degraded' | 'down' | 'checking';

export interface ServiceStatus {
    name: string;
    status: ServiceState;
    latency?: number;
    icon: string;
    lastChecked?: Date;
}

// ============= SYSTEM METRICS =============
export interface GPUMetrics {
    available: boolean;
    name?: string;
    utilization: number;          // 0-100%
    memoryUsed: number;           // MB
    memoryTotal: number;          // MB
    memoryUsedGB: string;
    memoryTotalGB: string;
    memoryPercent: string;
    temperature: number;          // Celsius
    powerDraw: number;            // Watts
    error?: string;
}

export interface CPUMetrics {
    name?: string;
    cores: number;
    utilization: number;          // 0-100%
    error?: string;
}

export interface MemoryMetrics {
    totalGB: string;
    usedGB: string;
    freeGB: string;
    percentUsed: string;
    error?: string;
}

export interface DiskMetrics {
    drive: string;
    totalGB: string;
    usedGB: string;
    freeGB: string;
    percentUsed: string;
    error?: string;
}

export interface SystemMetrics {
    gpu: GPUMetrics;
    cpu: CPUMetrics;
    memory: MemoryMetrics;
    disks?: DiskMetrics[];
    timestamp: string;
}

// ============= BRIDGE HEALTH =============
export interface BridgeHealth {
    status: 'healthy' | 'degraded' | 'unhealthy';
    uptime: number;
    memory: {
        used: number;
        total: number;
    };
    services: Record<string, 'up' | 'down' | 'degraded'>;
}

export interface BridgeMetrics {
    activeConnections: number;
    activeAgents: number;
    memory: {
        heapUsed: number;
        heapTotal: number;
    };
    platform: string;
    nodeVersion: string;
}

// ============= ERROR TRACKING =============
export interface ErrorLog {
    message: string;
    timestamp: string;
    context?: {
        method?: string;
        url?: string;
    };
    stack?: string;
}

export interface ErrorStats {
    errors: ErrorLog[];
    stats: {
        last24Hours: number;
        lastHour: number;
    };
}

// ============= MODEL MANAGEMENT =============
export interface LLMModel {
    id: string;
    name: string;
    provider: 'lmstudio' | 'ollama';
    loaded?: boolean;
    size?: string;
    quantization?: string;
    contextLength?: number;
    vramUsage?: number;
}

export interface ModelStats {
    tokensPerSecond?: number;
    timeToFirstToken?: number;
    contextUsed?: number;
    contextTotal?: number;
}

// ============= AGENT MANAGEMENT =============
export interface AgentInfo {
    id: string;
    name: string;
    status: 'running' | 'idle' | 'paused' | 'error';
    currentTask?: string;
    lastRun?: string;
    nextRun?: string;
    runtime?: number;
}

// ============= NETWORK =============
export interface ISPStatus {
    name: string;
    model: string;
    type: 'primary' | 'failover';
    status: 'online' | 'offline' | 'degraded';
    latency?: number;
    downloadSpeed?: number;
    uploadSpeed?: number;
}

export interface NetworkStatus {
    isps: ISPStatus[];
    router: {
        name: string;
        model: string;
        mode: string;
        wanPorts: number;
        lanPorts: number;
    };
    wifi: {
        name: string;
        model: string;
        standard: string;
        bands: string[];
        status: 'broadcasting' | 'offline';
    };
}

// ============= COMBINED STATE =============
export interface LuxRigState {
    // Connection
    connected: boolean;
    lastUpdated: Date | null;

    // Services
    services: ServiceStatus[];

    // System
    system: SystemMetrics | null;

    // Bridge
    health: BridgeHealth | null;
    metrics: BridgeMetrics | null;

    // Errors
    errors: ErrorStats;

    // Models
    models: {
        lmstudio: LLMModel[];
        ollama: LLMModel[];
        loaded: LLMModel[];
    };

    // Agents
    agents: AgentInfo[];

    // Network
    network: NetworkStatus | null;
}

// ============= HOOK RETURN TYPE =============
export interface UseLuxRigDataReturn {
    // State
    state: LuxRigState;

    // Loading states
    isLoading: boolean;
    isRefreshing: boolean;

    // Actions
    refresh: () => Promise<void>;
    refreshService: (serviceName: string) => Promise<void>;

    // Model actions
    loadModel: (modelId: string, provider: 'lmstudio' | 'ollama') => Promise<void>;
    unloadModel: (modelId: string, provider: 'lmstudio' | 'ollama') => Promise<void>;

    // Agent actions
    runAgent: (agentId: string) => Promise<void>;
    pauseAgent: (agentId: string) => Promise<void>;

    // Optimization actions
    clearCache: () => Promise<{ cleared: number }>;
    freeMemory: () => Promise<{ freed: number }>;

    // Computed
    overallStatus: ServiceState;
    gpuHealthy: boolean;
    bridgeOnline: boolean;
}

// ============= WEBSOCKET EVENTS =============
export type WebSocketEventType =
    | 'system_update'
    | 'model_loaded'
    | 'model_unloaded'
    | 'agent_started'
    | 'agent_completed'
    | 'agent_error'
    | 'error_logged'
    | 'alert_triggered'
    | 'network_change';

export interface WebSocketMessage {
    type: WebSocketEventType;
    data: unknown;
    timestamp: string;
}

// ============= THRESHOLDS =============
export interface AlertThresholds {
    gpuTempWarning: number;
    gpuTempCritical: number;
    vramPressure: number;
    ramPressure: number;
    diskUsage: number;
}

export const DEFAULT_THRESHOLDS: AlertThresholds = {
    gpuTempWarning: 80,
    gpuTempCritical: 90,
    vramPressure: 85,
    ramPressure: 80,
    diskUsage: 90,
};
