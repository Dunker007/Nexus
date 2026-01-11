/**
 * Knowledge Base Routes
 * Endpoints for document management and RAG search
 */

import { Router } from 'express';
import vectorStore from '../services/vectorStore.js';

const router = Router();

// Initialize vector store on load
vectorStore.initialize();

/**
 * GET /knowledge/stats
 * Get vector store statistics
 */
router.get('/stats', (req, res) => {
    try {
        const stats = vectorStore.getStats();
        res.json({ success: true, stats });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /knowledge/documents
 * List all indexed documents
 */
router.get('/documents', (req, res) => {
    try {
        const documents = vectorStore.listDocuments();
        res.json({ success: true, documents });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /knowledge/upload
 * Upload and index a document
 * Body: { content: string, name: string, type?: string, category?: string }
 */
router.post('/upload', async (req, res) => {
    try {
        const { content, name, type = 'text', category = 'General' } = req.body;

        if (!content) {
            return res.status(400).json({ success: false, error: 'Content is required' });
        }

        const result = await vectorStore.addDocument(content, {
            name: name || 'Untitled',
            type,
            category,
            size: `${(content.length / 1024).toFixed(1)} KB`
        });

        res.json({
            success: true,
            message: `Document indexed with ${result.chunks} chunks`,
            documentId: result.id
        });
    } catch (error) {
        console.error('[Knowledge] Upload error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /knowledge/search
 * Search documents by query
 * Query params: q (query string), limit (default 5)
 */
router.get('/search', async (req, res) => {
    try {
        const { q, limit = 5 } = req.query;

        if (!q) {
            return res.status(400).json({ success: false, error: 'Query parameter "q" is required' });
        }

        const results = await vectorStore.search(q, parseInt(limit));

        res.json({
            success: true,
            query: q,
            results: results.map(r => ({
                id: r.id,
                content: r.content,
                score: r.score.toFixed(4),
                metadata: r.metadata
            }))
        });
    } catch (error) {
        console.error('[Knowledge] Search error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * DELETE /knowledge/documents/:id
 * Delete a document by ID
 */
router.delete('/documents/:id', (req, res) => {
    try {
        const { id } = req.params;
        const deleted = vectorStore.deleteDocument(id);

        if (deleted) {
            res.json({ success: true, message: 'Document deleted' });
        } else {
            res.status(404).json({ success: false, error: 'Document not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
