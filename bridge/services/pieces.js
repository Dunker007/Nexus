import * as Pieces from '@pieces.app/pieces-os-client';
import os from 'os';
import fs from 'fs';

/**
 * Pieces OS Integration Service
 * Replaces previous local SQLite databases for storing Agent Context (Memory) and Workstream Tracking.
 */

// Discover correct port depending on OS (Windows/Mac uses 1000, Linux uses 39300)
// When running in WSL connecting to Windows host, use port 39300 via gateway IP
const determinePort = () => {
    const platform = os.platform();
    // WSL2 connects to Windows host via gateway IP:39300
    // Native Windows/Mac use 1000 on localhost
    if (platform === 'linux') {
        // Check if we're in WSL by looking for Windows mount points
        if (fs.existsSync('/mnt/c')) {
            // We're in WSL - Pieces OS on Windows host is accessible via gateway IP:39300
            return 39300;
        }
        return 39300;
    }
    return 1000;
};

// Get WSL gateway IP (Windows host) for Pieces OS connectivity
const getWslGateway = () => {
    try {
        const { execSync } = require('child_process');
        const gateway = execSync('ip route | grep default').toString().trim().split(/\s+/)[2];
        return gateway || 'localhost';
    } catch {
        return 'localhost';
    }
};

const PIECES_HOST = os.platform() === 'linux' && fs.existsSync('/mnt/c') ? getWslGateway() : 'localhost';
const PIECES_URL = `http://${PIECES_HOST}:${determinePort()}`;

// Setup configuration
const configuration = new Pieces.Configuration({
    basePath: PIECES_URL,
});

// APIs
const annotationsApi = new Pieces.AnnotationsApi(configuration);
const workstreamSummariesApi = new Pieces.WorkstreamSummariesApi(configuration);
const workstreamEventsApi = new Pieces.WorkstreamEventsApi(configuration);
const modelsApi = new Pieces.ModelsApi(configuration);
const assetsApi = new Pieces.AssetsApi(configuration);
const formatApi = new Pieces.FormatApi(configuration);
const connectorApi = new Pieces.ConnectorApi(configuration);

class PiecesService {
    constructor() {
        this.basePath = PIECES_URL;
        console.log(`[Pieces] Initialized connection to Pieces OS at ${PIECES_URL}`);
    }

    /**
     * Store Agent Memory as Pieces Annotations attached to a generated Asset.
     * Pieces handles the context beautifully.
     */
    async storeAgentMemory(agentType, key, memoryData) {
        try {
            // Memory Data typically contains tasks, drafts, or context
            // Convert to string representation
            const textContent = typeof memoryData === 'string' ? memoryData : JSON.stringify(memoryData, null, 2);

            // Create a SeededAsset with our context 
            const seededAsset = {
                application: {
                    id: 'nexus-local',
                    name: 'Nexus_OS',
                    version: '1.0.0',
                    platform: Pieces.PlatformEnum.Windows
                },
                format: {
                    fragment: {
                        string: { raw: textContent }
                    }
                },
                metadata: {
                    name: `Agent Memory: ${agentType} - ${key}`,
                    tags: [{ text: 'nexus-agent-memory' }, { text: agentType }],
                    annotations: [
                        {
                            type: Pieces.AnnotationTypeEnum.Description,
                            text: `Stored memory context for agent ${agentType}. Key: ${key}`
                        }
                    ]
                }
            };

            const asset = await assetsApi.assetsCreateNewAsset({
                transferables: false,
                seededAsset
            });

            return asset.id;
        } catch (error) {
            console.error('[Pieces] Failed to store agent memory:', error.message);
            throw error;
        }
    }

    /**
     * Retrieve all relevant agent memory items mapped previously
     * Retrieves assets tagged with 'nexus-agent-memory' and the given agentType
     */
    async getAgentMemories(agentType) {
        try {
             // In a true Pieces fashion, we could search or list assets filtered by tag.
             // For now, we fetch recent snippets and filter if there's no native tag search endpoint readily exposed in SDK.
             const assets = await assetsApi.assetsSnapshot({});
             
             // Very basic filtering (Production should use /search endpoints or native tag filters)
             const relevantAssets = (assets.iterable || []).filter(asset => {
                 return asset.name && asset.name.includes(`Agent Memory: ${agentType}`);
             });

             return relevantAssets;
        } catch (error) {
            console.error('[Pieces] Failed to get agent memories:', error.message);
            return [];
        }
    }

    /**
     * Log an Agent/System Task as a Pieces Workstream Summary
     */
    async logTaskSummary(agentType, task, status, metadata = {}) {
        try {
            const summaryName = `${agentType} Task: ${task.action || 'Execute'}`;
            const description = `Status: ${status}\n\nTask Details:\n${JSON.stringify(task, null, 2)}\n\nMetadata:\n${JSON.stringify(metadata, null, 2)}`;
            
            // Note: Workstream Summaries API typically requires SeededWorkstreamSummary
            const seededSummary = {
                name: summaryName,
                annotations: [
                    {
                        type: Pieces.AnnotationTypeEnum.Description,
                        text: description
                    }
                ]
            };
            
            const summary = await workstreamSummariesApi.workstreamSummariesCreateNewWorkstreamSummary({
                seededWorkstreamSummary: seededSummary
            });

            return summary.id;
        } catch (error) {
            console.error('[Pieces] Failed to log task summary:', error.message);
            // Non-blocking
            return null;
        }
    }

    /**
     * Check if Pieces OS is alive
     */
    async ping() {
        try {
            const response = await fetch(`${this.basePath}/.well-known/health`);
            return response.ok;
        } catch (e) {
            return false;
        }
    }

    /**
     * Search memory using Pieces OS search_memory API
     * @param {string} question - Natural language question
     * @param {Object} options - { from, to } ISO 8601 timestamps
     */
    async searchMemory(question, options = {}) {
        try {
            const { from, to } = options;
            
            // Search workstream summaries for narrative context
            const summaries = await workstreamSummariesApi.searchWorkstreamSummaries({
                searchInput: {
                    engines: 'WORKSTREAM_SUMMARIES'
                }
            });
            
            return summaries;
        } catch (error) {
            console.error('[Pieces] searchMemory failed:', error.message);
            throw error;
        }
    }

    /**
     * Search annotations using Pieces OS full-text search
     * @param {string} query - Keywords to search
     * @param {Object} options - { from, to } ISO 8601 timestamps
     */
    async searchAnnotations(query, options = {}) {
        try {
            const { from, to } = options;
            
            // Get snapshot of all annotations (SDK doesn't support FTS on annotations)
            const result = await annotationsApi.annotationsSnapshot();
            
            return result;
        } catch (error) {
            console.error('[Pieces] searchAnnotations failed:', error.message);
            throw error;
        }
    }

    /**
     * Get Google Calendar events via Pieces OS connector
     * @param {Object} options - { timeMin, timeMax } ISO 8601 timestamps
     * NOTE: Requires GCAL connector setup in Pieces OS. Returns empty if not configured.
     */
    async getCalendarEvents(options = {}) {
        // GCAL integration requires connector setup - stub for now
        // Future: use connectorApi.connect() flow or MCP SSE proxy
        return { error: 'Google Calendar connector not configured' };
    }

    /**
     * Get workstream summaries for a time range
     * @param {Object} options - { from, to } ISO 8601 timestamps
     */
    async getWorkstreamSummaries(options = {}) {
        try {
            const { from, to } = options;
            
            // Get snapshot of workstream summaries
            const result = await workstreamSummariesApi.workstreamSummariesSnapshot();
            
            return result;
        } catch (error) {
            console.error('[Pieces] getWorkstreamSummaries failed:', error.message);
            throw error;
        }
    }

    /**
     * Get browser activity via Pieces OS
     * @param {Object} options - { timePreset, filter }
     */
    async getBrowserActivity(options = {}) {
        try {
            const { timePreset = 'last_7d', filter } = options;
            
            // Get snapshot of workstream events (browser activity captured there)
            const result = await workstreamEventsApi.workstreamEventsSnapshot();
            
            return result;
        } catch (error) {
            console.error('[Pieces] getBrowserActivity failed:', error.message);
            throw error;
        }
    }

    /**
     * Get annotations by UUID
     * @param {string[]} ids - Array of annotation UUIDs
     */
    async getAnnotations(ids) {
        try {
            const result = await annotationsApi.annotationsBatchSnapshot({
                identifiers: ids
            });
            
            return result;
        } catch (error) {
            console.error('[Pieces] getAnnotations failed:', error.message);
            throw error;
        }
    }
}

export const piecesService = new PiecesService();
