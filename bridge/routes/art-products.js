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
router.get('/products', (req, res) => {
    const { status, category, platform } = req.query;
    const products = artProductsService.getProducts({ status, category, platform });
    res.json({
        success: true,
        products,
        total: products.length
    });
});

/**
 * GET /art/products/:id
 * Get specific product
 */
router.get('/products/:id', (req, res) => {
    const product = artProductsService.getProductById(req.params.id);
    if (!product) {
        return res.status(404).json({ success: false, error: 'Product not found' });
    }
    res.json({ success: true, product });
});

/**
 * POST /art/products
 * Add a new product
 */
router.post('/products', (req, res) => {
    const { title, description, category, style, platforms, price, tags, imageUrl } = req.body;

    if (!title) {
        return res.status(400).json({ success: false, error: 'Title is required' });
    }

    const product = artProductsService.addProduct({
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
});

/**
 * PUT /art/products/:id
 * Update a product
 */
router.put('/products/:id', (req, res) => {
    const product = artProductsService.updateProduct(req.params.id, req.body);
    if (!product) {
        return res.status(404).json({ success: false, error: 'Product not found' });
    }
    res.json({ success: true, product });
});

/**
 * PUT /art/products/:id/status
 * Update product status (draft, listed, sold)
 */
router.put('/products/:id/status', (req, res) => {
    const { status, listingUrl, price } = req.body;

    if (!status) {
        return res.status(400).json({ success: false, error: 'Status is required' });
    }

    const product = artProductsService.updateProductStatus(req.params.id, status, { listingUrl, price });
    if (!product) {
        return res.status(404).json({ success: false, error: 'Product not found' });
    }

    res.json({ success: true, product });
});

/**
 * POST /art/products/:id/sale
 * Record a sale
 */
router.post('/products/:id/sale', (req, res) => {
    const { platform, salePrice } = req.body;

    if (!platform || salePrice === undefined) {
        return res.status(400).json({ success: false, error: 'Platform and salePrice are required' });
    }

    const product = artProductsService.recordSale(req.params.id, platform, salePrice);
    if (!product) {
        return res.status(404).json({ success: false, error: 'Product not found' });
    }

    res.json({ success: true, product });
});

/**
 * DELETE /art/products/:id
 * Delete a product
 */
router.delete('/products/:id', (req, res) => {
    const removed = artProductsService.deleteProduct(req.params.id);
    if (!removed) {
        return res.status(404).json({ success: false, error: 'Product not found' });
    }
    res.json({ success: true, message: 'Product deleted', removed });
});

/**
 * GET /art/stats
 * Get platform statistics
 */
router.get('/stats', (req, res) => {
    const stats = artProductsService.getPlatformStats();
    res.json({ success: true, stats });
});

/**
 * GET /art/summary
 * Get revenue summary
 */
router.get('/summary', (req, res) => {
    const summary = artProductsService.getRevenueSummary();
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
router.post('/products/:id/keywords', (req, res) => {
    const product = artProductsService.getProductById(req.params.id);
    if (!product) {
        return res.status(404).json({ success: false, error: 'Product not found' });
    }

    const keywords = artProductsService.generateKeywords(product);
    res.json({ success: true, keywords });
});

/**
 * POST /art/products/:id/description
 * Generate Etsy listing description
 */
router.post('/products/:id/description', (req, res) => {
    const product = artProductsService.getProductById(req.params.id);
    if (!product) {
        return res.status(404).json({ success: false, error: 'Product not found' });
    }

    const description = artProductsService.generateListingDescription(product);
    res.json({ success: true, description });
});

export default router;
