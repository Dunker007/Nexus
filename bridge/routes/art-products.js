/**
 * Art Products Routes
 * Phase 14: Track digital art products for Etsy/POD
 * 
 * @module routes/art-products
 */

import { Router } from 'express';
import { artProductsService } from '../services/art-products.js';

const router = Router();

/**
 * GET /art/products
 * Get all products with optional filters
 */
router.get('/products', async (req, res) => {
    try {
        const { status, category, platform } = req.query;
        const products = await artProductsService.getProducts({ status, category, platform });
        res.json({
            success: true,
            products,
            total: products.length
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /art/products/:id
 * Get specific product
 */
router.get('/products/:id', async (req, res) => {
    try {
        const product = await artProductsService.getProductById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }
        res.json({ success: true, product });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /art/products
 * Add a new product
 */
router.post('/products', async (req, res) => {
    try {
        const { title, description, category, style, platforms, price, tags, imageUrl } = req.body;

        if (!title) {
            return res.status(400).json({ success: false, error: 'Title is required' });
        }

        const product = await artProductsService.addProduct({
            title,
            description,
            category,
            style,
            platforms,
            price,
            tags,
            imageUrl
        });

        res.json({ success: true, product });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * PUT /art/products/:id
 * Update a product
 */
router.put('/products/:id', async (req, res) => {
    try {
        const product = await artProductsService.updateProduct(req.params.id, req.body);
        if (!product) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }
        res.json({ success: true, product });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * PUT /art/products/:id/status
 * Update product status (draft, listed, sold)
 */
router.put('/products/:id/status', async (req, res) => {
    try {
        const { status, listingUrl, price } = req.body;

        if (!status) {
            return res.status(400).json({ success: false, error: 'Status is required' });
        }

        const product = await artProductsService.updateProductStatus(req.params.id, status, { listingUrl, price });
        if (!product) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }

        res.json({ success: true, product });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /art/products/:id/sale
 * Record a sale
 */
router.post('/products/:id/sale', async (req, res) => {
    try {
        const { platform, salePrice } = req.body;

        if (!platform || salePrice === undefined) {
            return res.status(400).json({ success: false, error: 'Platform and salePrice are required' });
        }

        const product = await artProductsService.recordSale(req.params.id, platform, salePrice);
        if (!product) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }

        res.json({ success: true, product });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * DELETE /art/products/:id
 * Delete a product
 */
router.delete('/products/:id', async (req, res) => {
    try {
        const removed = await artProductsService.deleteProduct(req.params.id);
        if (!removed) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }
        res.json({ success: true, message: 'Product deleted', removed });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /art/stats
 * Get platform statistics
 */
router.get('/stats', async (req, res) => {
    const stats = artProductsService.getPlatformStats();
    res.json({ success: true, stats });
});

/**
 * GET /art/summary
 * Get revenue summary
 */
router.get('/summary', async (req, res) => {
    const summary = await artProductsService.getRevenueSummary();
    res.json({ success: true, summary });
});

/**
 * GET /art/categories
 * Get available categories
 */
router.get('/categories', (req, res) => {
    const categories = artProductsService.getCategories();
    res.json({ success: true, categories });
});

/**
 * GET /art/styles
 * Get available styles
 */
router.get('/styles', (req, res) => {
    const styles = artProductsService.getStyles();
    res.json({ success: true, styles });
});

/**
 * POST /art/products/:id/keywords
 * Generate SEO keywords for a product
 */
router.post('/products/:id/keywords', async (req, res) => {
    try {
        const product = await artProductsService.getProductById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }

        const keywords = artProductsService.generateKeywords(product);
        res.json({ success: true, keywords });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /art/products/:id/description
 * Generate Etsy listing description
 */
router.post('/products/:id/description', async (req, res) => {
    try {
        const product = await artProductsService.getProductById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }

        const description = artProductsService.generateListingDescription(product);
        res.json({ success: true, description });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
