/**
 * Pipeline Routes
 * REST API for controlling the PowerShell content pipeline from the webapp
 * 
 * @module routes/pipeline
 */

import { spawn } from 'child_process';
import { Router } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

// Pipeline state
let pipelineProcess = null;
let pipelineStatus = {
    running: false,
    lastRun: null,
    lastResult: null,
    output: [],
    errors: []
};

// Content queue (in-memory for now, will be moved to DB)
let contentQueue = [];

/**
 * GET /pipeline/status
 * Get current pipeline status
 */
router.get('/status', (req, res) => {
    res.json({
        success: true,
        status: pipelineStatus,
        queueLength: contentQueue.length
    });
});

/**
 * GET /pipeline/config
 * Get pipeline configuration (sanitized - no credentials)
 */
router.get('/config', async (req, res) => {
    const configPath = path.resolve(__dirname, '../../pipeline/core/Config.json');
    try {
        const configRaw = await fs.readFile(configPath, 'utf-8');
        const config = JSON.parse(configRaw);

        // Sanitize sensitive data
        const sanitized = {
            LMStudio: {
                ApiUrl: config.LMStudio?.ApiUrl,
                Model: config.LMStudio?.Model,
                MaxTokens: config.LMStudio?.MaxTokens,
                Temperature: config.LMStudio?.Temperature
            },
            WordPress: {
                Enabled: config.WordPress?.Enabled,
                SiteUrl: config.WordPress?.SiteUrl,
                DefaultStatus: config.WordPress?.DefaultStatus,
                Categories: config.WordPress?.Categories,
                Tags: config.WordPress?.Tags,
                // Do NOT expose username/password
                credentialsSet: !!(config.WordPress?.Username && config.WordPress?.AppPassword)
            },
            Revenue: {
                AdSense: {
                    Enabled: config.Revenue?.AdSense?.Enabled,
                    // Do NOT expose client ID
                    configured: !!config.Revenue?.AdSense?.ClientId
                },
                Affiliates: {
                    Enabled: config.Revenue?.Affiliates?.Enabled,
                    programCount: config.Revenue?.Affiliates?.Programs?.length || 0
                }
            },
            Paths: config.Paths,
            Defaults: config.Defaults
        };

        res.json({
            success: true,
            config: sanitized
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to read pipeline config',
            details: error.message,
            debugPath: configPath,
            dirname: __dirname
        });
    }
});

/**
 * POST /pipeline/config
 * Update pipeline configuration
 */
router.post('/config', async (req, res) => {
    try {
        const configPath = path.resolve(__dirname, '../../pipeline/core/Config.json');
        const configRaw = await fs.readFile(configPath, 'utf-8');
        const config = JSON.parse(configRaw);

        const updates = req.body;

        // Merge updates (shallow merge for safety)
        if (updates.LMStudio) {
            config.LMStudio = { ...config.LMStudio, ...updates.LMStudio };
        }
        if (updates.WordPress) {
            config.WordPress = { ...config.WordPress, ...updates.WordPress };
        }
        if (updates.Defaults) {
            config.Defaults = { ...config.Defaults, ...updates.Defaults };
        }

        await fs.writeFile(configPath, JSON.stringify(config, null, 4), 'utf-8');

        res.json({
            success: true,
            message: 'Configuration updated'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to update pipeline config',
            details: error.message
        });
    }
});

/**
 * POST /pipeline/generate
 * Trigger content generation with optional topic override
 */
router.post('/generate', async (req, res) => {
    if (pipelineStatus.running) {
        return res.status(409).json({
            success: false,
            error: 'Pipeline is already running'
        });
    }

    const { topic } = req.body;

    try {
        pipelineStatus.running = true;
        pipelineStatus.output = [];
        pipelineStatus.errors = [];



        // Dynamic Path Resolution
        const parentDir = path.resolve(__dirname, '..');
        const grandparentDir = path.resolve(parentDir, '..');

        let orchestratorPath;
        let cwd;

        // Check for bundled structure (routes -> bridge-bundle -> pipeline is mapped to ../pipeline)
        const bundledPipeline = path.resolve(parentDir, 'pipeline');

        console.log('====== PIPELINE DEBUG ======');
        console.log('__dirname:', __dirname);
        console.log('Looking for bundled pipeline at:', bundledPipeline);

        if (fs.existsSync(bundledPipeline)) {
            orchestratorPath = path.resolve(bundledPipeline, 'core/Orchestrator.ps1');
            cwd = path.resolve(bundledPipeline, 'core');
            console.log('Found bundled pipeline.');
        } else {
            // Fallback to dev structure (routes -> bridge -> repo -> pipeline)
            orchestratorPath = path.resolve(grandparentDir, 'pipeline/core/Orchestrator.ps1');
            cwd = path.resolve(grandparentDir, 'pipeline/core');
            console.log('Using dev structure. Grandparent:', grandparentDir);
        }

        console.log('Orchestrator Path:', orchestratorPath);
        console.log('CWD:', cwd);
        console.log('Script Exists:', fs.existsSync(orchestratorPath));
        console.log('============================');

        const args = [
            '-ExecutionPolicy', 'Bypass',
            '-File', orchestratorPath
        ];

        pipelineProcess = spawn('powershell.exe', args, {
            cwd: cwd,
            env: {
                ...process.env,
                PIPELINE_TOPIC: topic || ''
            }
        });

        pipelineProcess.stdout.on('data', (data) => {
            const line = data.toString();
            pipelineStatus.output.push(line);
            console.log('[Pipeline]', line.trim());
        });

        pipelineProcess.stderr.on('data', (data) => {
            const line = data.toString();
            pipelineStatus.errors.push(line);
            console.error('[Pipeline Error]', line.trim());
        });

        pipelineProcess.on('close', (code) => {
            pipelineStatus.running = false;
            pipelineStatus.lastRun = new Date().toISOString();
            pipelineStatus.lastResult = code === 0 ? 'success' : 'failed';
            pipelineProcess = null;

            // Add to content queue if successful
            if (code === 0) {
                contentQueue.push({
                    id: Date.now(),
                    topic: topic || 'Default Topic',
                    generatedAt: new Date().toISOString(),
                    status: 'pending_review',
                    output: pipelineStatus.output.join('\n')
                });
            }
        });

        res.json({
            success: true,
            message: 'Pipeline started',
            topic: topic || 'Using default topic from config'
        });

    } catch (error) {
        pipelineStatus.running = false;
        res.status(500).json({
            success: false,
            error: 'Failed to start pipeline',
            details: error.message,
            debug: {
                dirname: __dirname,
                resolvedPath: path.resolve(__dirname, '../../pipeline/core/Orchestrator.ps1'),
                attemptedPath: error.path || 'unknown'
            }
        });
    }
});

/**
 * POST /pipeline/stop
 * Stop running pipeline
 */
router.post('/stop', (req, res) => {
    if (!pipelineProcess) {
        return res.status(400).json({
            success: false,
            error: 'No pipeline process running'
        });
    }

    try {
        pipelineProcess.kill('SIGTERM');
        pipelineStatus.running = false;
        pipelineStatus.lastResult = 'stopped';
        pipelineProcess = null;

        res.json({
            success: true,
            message: 'Pipeline stopped'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to stop pipeline',
            details: error.message
        });
    }
});

/**
 * GET /pipeline/queue
 * Get content queue
 */
router.get('/queue', (req, res) => {
    res.json({
        success: true,
        queue: contentQueue,
        total: contentQueue.length
    });
});

/**
 * GET /pipeline/queue/:id
 * Get specific content item
 */
router.get('/queue/:id', (req, res) => {
    const item = contentQueue.find(c => c.id === parseInt(req.params.id));

    if (!item) {
        return res.status(404).json({
            success: false,
            error: 'Content not found'
        });
    }

    res.json({
        success: true,
        content: item
    });
});

/**
 * PUT /pipeline/queue/:id
 * Update content item (approve, reject, edit)
 */
router.put('/queue/:id', (req, res) => {
    const idx = contentQueue.findIndex(c => c.id === parseInt(req.params.id));

    if (idx === -1) {
        return res.status(404).json({
            success: false,
            error: 'Content not found'
        });
    }

    const { status, content } = req.body;

    if (status) {
        contentQueue[idx].status = status;
    }
    if (content) {
        contentQueue[idx].content = content;
    }
    contentQueue[idx].updatedAt = new Date().toISOString();

    res.json({
        success: true,
        content: contentQueue[idx]
    });
});

/**
 * DELETE /pipeline/queue/:id
 * Remove content from queue
 */
router.delete('/queue/:id', (req, res) => {
    const idx = contentQueue.findIndex(c => c.id === parseInt(req.params.id));

    if (idx === -1) {
        return res.status(404).json({
            success: false,
            error: 'Content not found'
        });
    }

    const removed = contentQueue.splice(idx, 1)[0];

    res.json({
        success: true,
        message: 'Content removed from queue',
        removed
    });
});

/**
 * POST /pipeline/publish/:id
 * Publish specific content item
 */
router.post('/publish/:id', async (req, res) => {
    const item = contentQueue.find(c => c.id === parseInt(req.params.id));

    if (!item) {
        return res.status(404).json({
            success: false,
            error: 'Content not found'
        });
    }

    if (item.status !== 'approved') {
        return res.status(400).json({
            success: false,
            error: 'Content must be approved before publishing'
        });
    }

    // TODO: Implement publishing logic
    // For now, mark as published
    item.status = 'published';
    item.publishedAt = new Date().toISOString();

    res.json({
        success: true,
        message: 'Content published',
        content: item
    });
});

/**
 * GET /pipeline/output
 * Get list of published content files
 */
router.get('/output', async (req, res) => {
    try {
        const outputPath = path.resolve(__dirname, '../../data/published');

        // Ensure directory exists
        try {
            await fs.access(outputPath);
        } catch {
            await fs.mkdir(outputPath, { recursive: true });
        }

        const files = await fs.readdir(outputPath);
        const fileStats = await Promise.all(
            files.map(async (file) => {
                const filePath = path.join(outputPath, file);
                const stats = await fs.stat(filePath);
                return {
                    name: file,
                    size: stats.size,
                    created: stats.birthtime,
                    modified: stats.mtime
                };
            })
        );

        res.json({
            success: true,
            outputPath,
            files: fileStats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to list output files',
            details: error.message
        });
    }
});

export default router;
