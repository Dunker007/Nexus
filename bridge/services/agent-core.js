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

        // Initialize database connection
        this.initDatabase();
    }

    async initDatabase() {
        try {
            const { agentMemory } = await import('./database.js');
            this.db = agentMemory;
            this.dbReady = true;

            // Load existing memory from database
            await this.loadMemory();
        } catch (error) {
            console.warn(`[${this.name}] Database not available, using in-memory only:`, error.message);
            this.useDatabase = false;
        }
    }

    async loadMemory() {
        if (!this.useDatabase || !this.dbReady) return;

        try {
            const memoryData = await this.db.getAll(this.id);
            if (memoryData && memoryData.entries) {
                this.memory = memoryData.entries;
            }
        } catch (error) {
            console.warn(`[${this.name}] Failed to load memory from database:`, error.message);
        }
    }

    async execute(task, context = {}) {
        this.status = 'running';
        this.currentTask = task;

        try {
            const result = await this.processTask(task, context);
            await this.addToMemory({ task, result, timestamp: new Date() });
            this.status = 'completed';
            return result;
        } catch (error) {
            this.status = 'failed';
            await this.addToMemory({ task, error: error.message, timestamp: new Date() });
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

        // Persist to database (async, non-blocking)
        if (this.useDatabase && this.dbReady) {
            try {
                await this.db.set(this.id, 'entries', this.memory);
            } catch (error) {
                console.warn(`[${this.name}] Failed to persist memory to database:`, error.message);
            }
        }
    }

    async getMemory(limit = 10) {
        // Try to get from database first for most recent data
        if (this.useDatabase && this.dbReady) {
            try {
                const memoryData = await this.db.getAll(this.id);
                if (memoryData && memoryData.entries) {
                    return memoryData.entries.slice(-limit);
                }
            } catch (error) {
                console.warn(`[${this.name}] Failed to get memory from database:`, error.message);
            }
        }

        // Fallback to in-memory
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

        // Clear database too
        if (this.useDatabase && this.dbReady) {
            try {
                await this.db.clear(this.id);
            } catch (error) {
                console.warn(`[${this.name}] Failed to clear database:`, error.message);
            }
        }
    }
}
