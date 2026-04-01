/**
 * Agent Core - Base Class
 * Defines the fundamental behavior of all AI agents
 */

export class Agent {
    constructor(config) {
        this.id = config.id;
        this.name = config.name;
        this.description = config.description;
        this.capabilities = config.capabilities || [];
        this.memory = []; // In-memory cache
        this.status = 'idle'; // idle, running, paused, completed, failed
        this.currentTask = null;
        this.useDatabase = true;
        this.dbReady = false;

        // Initialize Pieces OS connection
        this.initDatabase();
    }

    async initDatabase() {
        try {
            const { piecesService } = await import('./pieces.js');
            this.db = piecesService;
            this.dbReady = await this.db.ping();

            // Load existing memory from database (if available)
            await this.loadMemory();
        } catch (error) {
            console.warn(`[${this.name}] Pieces OS not available, using in-memory only:`, error.message);
            this.useDatabase = false;
        }
    }

    async loadMemory() {
        if (!this.useDatabase || !this.dbReady) return;

        try {
            const memories = await this.db.getAgentMemories(this.id);
            if (memories && memories.length > 0) {
                // Hydrate in-memory cache from Pieces OS assets
                for (const asset of memories) {
                    try {
                        const entry = {
                            source: 'pieces-os',
                            assetId: asset.id,
                            name: asset.name || 'Unknown',
                            timestamp: asset.created?.value || new Date(),
                        };
                        this.memory.push(entry);
                    } catch (parseErr) {
                        // Skip unparseable entries
                    }
                }
                // Cap at 100 entries
                if (this.memory.length > 100) {
                    this.memory = this.memory.slice(-100);
                }
                console.log(`[${this.name}] Hydrated ${this.memory.length} memory entries from Pieces OS.`);
            }
        } catch (error) {
            console.warn(`[${this.name}] Failed to load memory from Pieces OS:`, error.message);
        }
    }

    async execute(task, context = {}) {
        this.status = 'running';
        this.currentTask = task;

        // Log Workstream Summary - Start
        let summaryId = null;
        if (this.useDatabase && this.dbReady) {
            summaryId = await this.db.logTaskSummary(this.id, task, 'running', context);
        }

        try {
            const result = await this.processTask(task, context);
            await this.addToMemory({ task, result, timestamp: new Date() });
            this.status = 'completed';

            // Log Workstream Summary - Complete
            if (this.useDatabase && this.dbReady) {
                await this.db.logTaskSummary(this.id, task, 'completed', { result, previousSummaryId: summaryId });
            }

            return result;
        } catch (error) {
            this.status = 'failed';
            await this.addToMemory({ task, error: error.message, timestamp: new Date() });

            // Log Workstream Summary - Failed
            if (this.useDatabase && this.dbReady) {
                await this.db.logTaskSummary(this.id, task, 'failed', { error: error.message, previousSummaryId: summaryId });
            }

            throw error;
        }
    }

    async processTask(task, context) {
        // Override in specific agent implementations
        throw new Error('processTask must be implemented by agent subclass');
    }

    async addToMemory(entry) {
        // Add to in-memory cache
        this.memory.push(entry);

        // Keep last 100 entries in memory
        if (this.memory.length > 100) {
            this.memory = this.memory.slice(-100);
        }

        // Persist to Pieces OS Context (async, non-blocking)
        if (this.useDatabase && this.dbReady) {
            try {
                // Store each memory entry as a distinct Annotation/Asset in Pieces OS
                await this.db.storeAgentMemory(this.id, `entry-${Date.now()}`, entry);
            } catch (error) {
                console.warn(`[${this.name}] Failed to persist memory to Pieces OS:`, error.message);
            }
        }
    }

    async getMemory(limit = 10) {
        // Fallback to in-memory since fetching live array requires complex Pieces OS asset parsing in MVP
        return this.memory.slice(-limit);
    }

    pause() {
        this.status = 'paused';
    }

    resume() {
        this.status = 'running';
    }

    async reset() {
        this.status = 'idle';
        this.currentTask = null;
        this.memory = [];

        // Note: For Pieces OS, deciding not to clear all external assets to preserve history mapping.
        console.log(`[${this.name}] reset complete. Preserved Pieces OS memories.`);
    }
}
