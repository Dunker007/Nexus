import * as Pieces from '@pieces.app/pieces-os-client';
import os from 'os';

/**
 * Pieces OS Integration Service
 * Replaces previous local SQLite databases for storing Agent Context (Memory) and Workstream Tracking.
 */

// Discover correct port depending on OS (Windows/Mac uses 1000, Linux uses 39300)
const determinePort = () => {
    const platform = os.platform();
    if (platform === 'linux') return 39300;
    return 1000;
};

const PIECES_URL = `http://localhost:${determinePort()}`;

// Setup configuration
const configuration = new Pieces.Configuration({
    basePath: PIECES_URL,
});

// APIs
const annotationsApi = new Pieces.AnnotationsApi(configuration);
const workstreamSummariesApi = new Pieces.WorkstreamSummariesApi(configuration);
const modelsApi = new Pieces.ModelsApi(configuration);
const assetsApi = new Pieces.AssetsApi(configuration);
const formatApi = new Pieces.FormatApi(configuration);

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
}

export const piecesService = new PiecesService();
