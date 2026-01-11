/**
 * LuxRig Command Center - Constants & Configuration
 */

// ============= REFRESH INTERVALS =============
export const REFRESH_INTERVALS = {
    REALTIME: 1000,      // 1 second - GPU, CPU
    FAST: 5000,          // 5 seconds - RAM, Network
    NORMAL: 10000,       // 10 seconds - Errors, Agents
    SLOW: 30000,         // 30 seconds - Models, Disk
    LAZY: 60000,         // 1 minute - Health reports
} as const;

// ============= SERVICE DEFINITIONS =============
export const SERVICES = {
    BRIDGE: {
        name: 'LuxRig Bridge',
        icon: '🌉',
        endpoint: '/health',
    },
    LMSTUDIO: {
        name: 'LM Studio',
        icon: '🖥️',
        endpoint: '/llm/lmstudio/models',
    },
    OLLAMA: {
        name: 'Ollama',
        icon: '🦙',
        endpoint: '/llm/ollama/models',
    },
    GPU: {
        name: 'GPU Metrics',
        icon: '🎮',
        endpoint: '/system',
    },
} as const;

// ============= ALERT THRESHOLDS =============
export const THRESHOLDS = {
    GPU_TEMP: {
        WARNING: 80,
        CRITICAL: 90,
    },
    VRAM: {
        WARNING: 85,
        CRITICAL: 95,
    },
    RAM: {
        WARNING: 80,
        CRITICAL: 90,
    },
    DISK: {
        WARNING: 85,
        CRITICAL: 95,
    },
    LATENCY: {
        WARNING: 100,  // ms
        CRITICAL: 500, // ms
    },
} as const;

// ============= NETWORK CONFIG =============
export const NETWORK_CONFIG = {
    ISP_PRIMARY: {
        name: 'Verizon 5G Home',
        model: 'ASK-NCQ1338',
        type: '5G mmWave / C-Band',
        color: '#EF4444', // red
    },
    ISP_FAILOVER: {
        name: 'T-Mobile 5G Home',
        model: 'Sagemcom Fast 5688W',
        type: '5G n41 / n71',
        color: '#EC4899', // pink
    },
    ROUTER: {
        name: 'TP-Link ER605 V2',
        role: 'Core Brain',
        mode: 'Load Balance + Failover',
        wanPorts: 2,
        lanPorts: 4,
    },
    WIFI: {
        name: 'Wyze Mesh Router Pro',
        standard: 'WiFi 6E',
        bands: ['2.4GHz', '5GHz', '6GHz'],
        topology: 'Mesh',
    },
} as const;

// ============= STATUS COLORS =============
export const STATUS_COLORS = {
    operational: {
        bg: 'bg-green-500',
        text: 'text-green-400',
        border: 'border-green-500/30',
        label: 'Operational',
    },
    degraded: {
        bg: 'bg-yellow-500',
        text: 'text-yellow-400',
        border: 'border-yellow-500/30',
        label: 'Degraded',
    },
    down: {
        bg: 'bg-red-500',
        text: 'text-red-400',
        border: 'border-red-500/30',
        label: 'Down',
    },
    checking: {
        bg: 'bg-gray-500',
        text: 'text-gray-400',
        border: 'border-gray-500/30',
        label: 'Checking...',
    },
} as const;

// ============= CHART COLORS =============
export const CHART_COLORS = {
    gpu: '#06B6D4',      // cyan
    vram: '#8B5CF6',     // purple
    cpu: '#F59E0B',      // amber
    ram: '#A855F7',      // violet
    disk: '#10B981',     // emerald
    network: '#3B82F6',  // blue
    error: '#EF4444',    // red
    success: '#22C55E',  // green
} as const;

// ============= AGENT DEFINITIONS =============
export const AGENT_TYPES = {
    HOUSEKEEPER: {
        id: 'housekeeper',
        name: 'Housekeeper',
        icon: '🧹',
        description: 'Syncs files and maintains data integrity',
    },
    REVENUE: {
        id: 'revenue',
        name: 'Revenue Tracker',
        icon: '💰',
        description: 'Collects and aggregates income data',
    },
    NEWS: {
        id: 'news',
        name: 'News Curator',
        icon: '📰',
        description: 'Fetches and categorizes news articles',
    },
    OPTIMIZER: {
        id: 'optimizer',
        name: 'System Optimizer',
        icon: '🤖',
        description: 'Monitors and optimizes system performance',
    },
} as const;

// ============= WEBSOCKET =============
export const WEBSOCKET_CONFIG = {
    PATH: '/stream',
    RECONNECT_DELAY: 3000,
    MAX_RECONNECT_ATTEMPTS: 5,
    HEARTBEAT_INTERVAL: 30000,
} as const;

// ============= LOCAL STORAGE KEYS =============
export const STORAGE_KEYS = {
    THRESHOLDS: 'luxrig_thresholds',
    REFRESH_INTERVAL: 'luxrig_refresh_interval',
    ALERT_HISTORY: 'luxrig_alert_history',
    PANEL_EXPANDED: 'luxrig_panel_expanded',
} as const;

// ============= HARDWARE CONFIG =============
export const HARDWARE_CONFIG = {
    MOTHERBOARD: {
        name: 'ASRock B550M-C',
        chipset: 'AMD B550',
        formFactor: 'Micro ATX',
        socket: 'AM4',
    },
    GPU: {
        name: 'NVIDIA RTX 3060',
        vram: '12GB GDDR6',
        vramBytes: 12 * 1024 * 1024 * 1024,
        tensorCores: true,
        cudaCores: 3584,
        tdp: 170, // watts
    },
    CPU: {
        model: 'AMD Ryzen 7 3700X',
        cores: 8,
        threads: 16,
        baseClock: '3.6 GHz',
        boostClock: '4.4 GHz',
        tdp: 65, // watts
        socket: 'AM4',
    },
    RAM: {
        type: 'DDR4',
        slots: 4,
    },
} as const;

// ============= NVIDIA SDK CONFIG =============
export const NVIDIA_SDK = {
    CUDA: {
        version: '13.1',
        toolkit: 'CUDA Toolkit',
    },
    TENSORRT: {
        name: 'TensorRT for RTX',
        description: 'High-performance deep learning inference SDK',
    },
    NIM: {
        name: 'NVIDIA NIM',
        description: 'Inference Microservices for LLM/Vision deployment',
    },
    CLI_TOOLS: [
        { name: 'nvidia-smi', description: 'GPU monitoring & compute mode' },
        { name: 'AI Workbench', description: 'AI model prototyping toolkit' },
        { name: 'Nsight Systems', description: 'Performance profiling' },
    ],
} as const;

// ============= ASROCK SDK CONFIG =============
export const ASROCK_SDK = {
    AI_QUICKSET: {
        name: 'ASRock AI QuickSet (WSL Edition)',
        description: 'Automated AI framework setup with GPU acceleration',
        cli: 'ai-quickset',
        commands: [
            { cmd: 'ai-quickset launch diffusers', description: 'Launch Stable Diffusion' },
            { cmd: 'ai-quickset install pytorch', description: 'Install PyTorch with CUDA' },
            { cmd: 'ai-quickset install tensorflow', description: 'Install TensorFlow' },
        ],
    },
    SYSTEM_CLI: [
        {
            name: 'AMDRMCLI',
            description: 'Ryzen Master CLI for CPU overclocking',
            path: 'ASRock Motherboard Utilities/A-Tuning',
        },
        {
            name: 'mgmtcli',
            description: 'BIOS settings and firmware management',
            path: 'ASRRM GMT Tool',
        },
        {
            name: 'wICPFLASHADSBv2',
            description: 'RGB controller firmware',
            path: 'ASRRGBLED/Bin',
        },
    ],
    OPENRGB: {
        name: 'OpenRGB SDK',
        description: 'Network-based RGB control (Python, C++, C#)',
        bindings: ['Python', 'C++', 'C#'],
        features: ['Polychrome Sync', 'Lighting Control'],
    },
} as const;



