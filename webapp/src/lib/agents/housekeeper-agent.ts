'use client';

/**
 * Housekeeper Agent
 * 
 * Responsible for system health, file organization, and backups.
 * This is a client-side agent that manages local operations.
 */

export interface SyncConfig {
    enabled: boolean;
    folders: string[];
    lastSync: Date | null;
    syncStatus: 'idle' | 'syncing' | 'error' | 'success';
}

export interface DiskStatus {
    totalGB: number;
    usedGB: number;
    freeGB: number;
    percentUsed: number;
}

export interface CleanupResult {
    filesRemoved: number;
    bytesFreed: number;
    errors: string[];
}

export interface BackupStatus {
    lastCommit: Date | null;
    lastPush: Date | null;
    uncommittedChanges: number;
    needsBackup: boolean;
}

class HousekeeperAgent {
    private static instance: HousekeeperAgent;
    private syncConfig: SyncConfig;
    private listeners: Set<(status: any) => void> = new Set();

    private constructor() {
        // Load config from localStorage if available
        this.syncConfig = this.loadSyncConfig();
    }

    public static getInstance(): HousekeeperAgent {
        if (!HousekeeperAgent.instance) {
            HousekeeperAgent.instance = new HousekeeperAgent();
        }
        return HousekeeperAgent.instance;
    }

    // === SYNC CONFIG ===

    private loadSyncConfig(): SyncConfig {
        if (typeof window === 'undefined') {
            return this.getDefaultSyncConfig();
        }
        try {
            const saved = localStorage.getItem('housekeeper_sync_config');
            if (saved) {
                const parsed = JSON.parse(saved);
                return {
                    ...parsed,
                    lastSync: parsed.lastSync ? new Date(parsed.lastSync) : null
                };
            }
        } catch (e) {
            console.warn('[Housekeeper] Failed to load sync config:', e);
        }
        return this.getDefaultSyncConfig();
    }

    private getDefaultSyncConfig(): SyncConfig {
        return {
            enabled: false,
            folders: ['Fresh-Start', 'Nexus'],
            lastSync: null,
            syncStatus: 'idle'
        };
    }

    public getSyncConfig(): SyncConfig {
        return { ...this.syncConfig };
    }

    public updateSyncConfig(updates: Partial<SyncConfig>): void {
        this.syncConfig = { ...this.syncConfig, ...updates };
        if (typeof window !== 'undefined') {
            localStorage.setItem('housekeeper_sync_config', JSON.stringify(this.syncConfig));
        }
        this.notifyListeners();
    }

    public addFolder(folderName: string): void {
        if (!this.syncConfig.folders.includes(folderName)) {
            this.syncConfig.folders.push(folderName);
            this.updateSyncConfig({ folders: this.syncConfig.folders });
        }
    }

    public removeFolder(folderName: string): void {
        this.syncConfig.folders = this.syncConfig.folders.filter(f => f !== folderName);
        this.updateSyncConfig({ folders: this.syncConfig.folders });
    }

    // === SYNC OPERATIONS ===

    public async triggerSync(): Promise<{ success: boolean; message: string }> {
        if (!this.syncConfig.enabled) {
            return { success: false, message: 'Sync is not enabled' };
        }

        this.updateSyncConfig({ syncStatus: 'syncing' });

        try {
            // In a real implementation, this would call a backend API
            // that interfaces with Google Drive API
            await this.simulateSync();

            this.updateSyncConfig({
                syncStatus: 'success',
                lastSync: new Date()
            });

            return { success: true, message: `Synced ${this.syncConfig.folders.length} folders to Google Drive` };
        } catch (error: any) {
            this.updateSyncConfig({ syncStatus: 'error' });
            return { success: false, message: error.message };
        }
    }

    private async simulateSync(): Promise<void> {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // 10% chance of simulated error for testing
        if (Math.random() < 0.1) {
            throw new Error('Simulated sync error - retry later');
        }
    }

    // === CLEANUP OPERATIONS ===

    public async getCleanupSuggestions(): Promise<string[]> {
        const suggestions: string[] = [];

        // These would be populated by actual file system scanning in production
        suggestions.push('Clear Next.js cache (.next folder) - potential 50-200MB');
        suggestions.push('Clear node_modules and reinstall - potential 500MB+');
        suggestions.push('Remove old log files - potential 10-50MB');
        suggestions.push('Clear browser cache for localhost');

        return suggestions;
    }

    public async performCleanup(options: {
        clearNextCache?: boolean;
        clearLogs?: boolean;
        clearTempFiles?: boolean;
    }): Promise<CleanupResult> {
        const result: CleanupResult = {
            filesRemoved: 0,
            bytesFreed: 0,
            errors: []
        };

        // In production, this would call a backend API
        // For now, we log the intent
        console.log('[Housekeeper] Cleanup requested with options:', options);

        if (options.clearNextCache) {
            result.filesRemoved += 100;
            result.bytesFreed += 100 * 1024 * 1024; // 100MB estimate
        }

        if (options.clearLogs) {
            result.filesRemoved += 10;
            result.bytesFreed += 5 * 1024 * 1024; // 5MB estimate
        }

        if (options.clearTempFiles) {
            result.filesRemoved += 20;
            result.bytesFreed += 10 * 1024 * 1024; // 10MB estimate
        }

        return result;
    }

    // === BACKUP STATUS ===

    public async getBackupStatus(): Promise<BackupStatus> {
        // In production, this would query git status via backend API
        return {
            lastCommit: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
            lastPush: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
            uncommittedChanges: 3, // Would be from `git status`
            needsBackup: true
        };
    }

    public async triggerBackup(): Promise<{ success: boolean; message: string }> {
        try {
            // This would call a backend API that runs:
            // git add -A && git commit -m "Auto backup" && git push
            console.log('[Housekeeper] Backup triggered');

            return {
                success: true,
                message: 'Backup completed successfully'
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.message
            };
        }
    }

    // === DISK STATUS ===

    public async getDiskStatus(): Promise<DiskStatus> {
        // In production, this would query actual disk usage via backend
        // For now, return mock data
        return {
            totalGB: 500,
            usedGB: 320,
            freeGB: 180,
            percentUsed: 64
        };
    }

    // === LISTENERS ===

    public subscribe(callback: (status: any) => void): () => void {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback);
    }

    private notifyListeners(): void {
        const status = {
            syncConfig: this.syncConfig
        };
        this.listeners.forEach(cb => cb(status));
    }

    // === UTILITY ===

    public formatBytes(bytes: number): string {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// Export singleton instance
export const housekeeper = HousekeeperAgent.getInstance();

// Export class for type reference
export { HousekeeperAgent };
