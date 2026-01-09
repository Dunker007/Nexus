/**
 * Art Products Service
 * Phase 14: Track digital art products for Etsy/POD platforms
 * 
 * @module services/art-products
 */

/**
 * Art Products Service
 * Phase 14: Track digital art products for Etsy/POD platforms
 * 
 * @module services/art-products
 */

import { prisma as db } from './database.js';

// Product categories
const CATEGORIES = [
    'Digital Print',
    'Phone Wallpaper',
    'Desktop Wallpaper',
    'T-Shirt Design',
    'Poster',
    'Album Art',
    'Social Media Template',
    'Logo Design',
    'Pattern',
    'Illustration'
];

// Art styles that sell well
const STYLES = [
    'Minimalist',
    'Boho',
    'Abstract',
    'Geometric',
    'Vintage',
    'Cyberpunk',
    'Aesthetic',
    'Watercolor',
    'Line Art',
    'Surreal'
];

/**
 * Add a new art product
 */
export async function addProduct(product) {
    try {
        const newProduct = await db.artProduct.create({
            data: {
                title: product.title,
                prompt: product.prompt || '',
                style: product.style || 'Other',
                description: product.description || '',
                category: product.category || 'Digital Print',
                price: product.price ? parseFloat(product.price) : null,
                tags: product.tags ? JSON.stringify(product.tags) : '[]',
                platforms: product.platforms ? JSON.stringify(product.platforms) : '["etsy"]',
                status: product.status || 'draft',
                localPath: product.imageUrl || null
            }
        });
        return parseProduct(newProduct);
    } catch (error) {
        console.error('[ArtService] Create Error:', error);
        throw error;
    }
}

/**
 * Get all products
 */
export async function getProducts(filters = {}) {
    try {
        const where = {};
        if (filters.status) where.status = filters.status;
        if (filters.category) where.category = filters.category;

        // Note: Prisma string filter for JSON arrays (platforms) is limited in SQLite
        // We'll filter platforms in memory if needed, but for now strict filtering

        const products = await db.artProduct.findMany({
            where,
            orderBy: { createdAt: 'desc' }
        });

        return products.map(parseProduct);
    } catch (error) {
        console.error('[ArtService] Get Error:', error);
        return [];
    }
}

/**
 * Get product by ID
 */
export async function getProductById(id) {
    const product = await db.artProduct.findUnique({ where: { id } });
    return product ? parseProduct(product) : null;
}

/**
 * Update product
 */
export async function updateProduct(id, updates) {
    try {
        const data = { ...updates };
        if (data.tags) data.tags = JSON.stringify(data.tags);
        if (data.platforms) data.platforms = JSON.stringify(data.platforms);

        const product = await db.artProduct.update({
            where: { id },
            data
        });
        return parseProduct(product);
    } catch (error) {
        return null;
    }
}

/**
 * Update product status
 */
export async function updateProductStatus(id, status, details = {}) {
    try {
        const updateData = { status };
        if (details.price) updateData.price = parseFloat(details.price);

        const product = await db.artProduct.update({
            where: { id },
            data: updateData
        });
        return parseProduct(product);
    } catch (error) {
        return null;
    }
}

/**
 * Record a sale
 */
export async function recordSale(id, platform, salePrice) {
    try {
        const product = await db.artProduct.update({
            where: { id },
            data: {
                sales: { increment: 1 },
                revenue: { increment: parseFloat(salePrice) }
            }
        });
        return parseProduct(product);
    } catch (error) {
        return null;
    }
}

/**
 * Update views
 */
export async function updateViews(id, platform, views) {
    try {
        const product = await db.artProduct.update({
            where: { id },
            data: { views: parseInt(views) }
        });
        return parseProduct(product);
    } catch (error) {
        return null;
    }
}

/**
 * Delete product
 */
export async function deleteProduct(id) {
    try {
        return await db.artProduct.delete({ where: { id } });
    } catch (error) {
        return null;
    }
}

/**
 * Get platform statistics
 */
export function getPlatformStats() {
    // TODO: implement aggregation query if needed
    // For now returning mock stats or empty
    return {
        etsy: { listings: 0, views: 0, sales: 0, revenue: 0 },
        redbubble: { listings: 0, views: 0, sales: 0, revenue: 0 }
    };
}

/**
 * Get revenue summary
 */
export async function getRevenueSummary() {
    const products = await db.artProduct.findMany();

    const totalRevenue = products.reduce((sum, p) => sum + (p.revenue || 0), 0);
    const totalSales = products.reduce((sum, p) => sum + (p.sales || 0), 0);
    const totalViews = products.reduce((sum, p) => sum + (p.views || 0), 0);

    return {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalSales,
        totalViews,
        totalProducts: products.length,
        listedProducts: products.filter(p => p.status === 'listed').length,
        draftProducts: products.filter(p => p.status === 'draft').length
    };
}

/**
 * Helper to parse JSON fields from DB
 */
function parseProduct(product) {
    return {
        ...product,
        tags: parseJSON(product.tags, []),
        platforms: parseJSON(product.platforms, [])
    };
}

function parseJSON(str, fallback) {
    try {
        return JSON.parse(str);
    } catch {
        return fallback;
    }
}

/**
 * Get available categories
 */
export function getCategories() {
    return CATEGORIES;
}

/**
 * Get available styles
 */
export function getStyles() {
    return STYLES;
}

/**
 * Generate SEO keywords for a product
 */
export function generateKeywords(product) {
    const baseKeywords = [];

    // Add style keywords
    if (product.style) {
        baseKeywords.push(product.style.toLowerCase());
        baseKeywords.push(`${product.style.toLowerCase()} art`);
        baseKeywords.push(`${product.style.toLowerCase()} design`);
    }

    // Add category keywords
    if (product.category) {
        baseKeywords.push(product.category.toLowerCase());
        baseKeywords.push(`${product.category.toLowerCase()} download`);
        baseKeywords.push(`digital ${product.category.toLowerCase()}`);
    }

    // Add common selling keywords
    baseKeywords.push('instant download');
    baseKeywords.push('printable');
    baseKeywords.push('wall art');
    baseKeywords.push('home decor');

    return [...new Set(baseKeywords)].slice(0, 13); // Etsy max is 13 tags
}

/**
 * Generate Etsy listing description
 */
export function generateListingDescription(product) {
    return `
${product.title}

${product.description || 'Beautiful digital art for your home or device.'}

✨ WHAT YOU GET:
- High-resolution digital file (${product.resolution || '3000x3000px'})
- Instant download after purchase
- Print-ready quality (300 DPI)

🖼️ HOW TO USE:
1. Purchase and download the file
2. Print at home or use a professional print service
3. Frame and enjoy!

💡 PERFECT FOR:
- Home decoration
- Office artwork
- Gift for art lovers
- ${product.category || 'Wall art'}

📧 Need a custom size? Message us!

---
This is a DIGITAL DOWNLOAD. No physical item will be shipped.
Created with AI art technology.
  `.trim();
}

export const artProductsService = {
    addProduct,
    getProducts,
    getProductById,
    updateProduct,
    updateProductStatus,
    recordSale,
    updateViews,
    deleteProduct,
    getPlatformStats,
    getRevenueSummary,
    getCategories,
    getStyles,
    generateKeywords,
    generateListingDescription
};

export default artProductsService;
