/**
 * Art Products Service
 * Phase 14: Track digital art products for Etsy/POD platforms
 * 
 * @module services/art-products
 */

// In-memory storage (will be moved to database later)
let artProducts = [];
let productStats = {
    etsy: { listings: 0, views: 0, sales: 0, revenue: 0 },
    redbubble: { listings: 0, views: 0, sales: 0, revenue: 0 },
    creativeMarket: { listings: 0, views: 0, sales: 0, revenue: 0 },
    gumroad: { listings: 0, views: 0, sales: 0, revenue: 0 }
};

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
export function addProduct(product) {
    const newProduct = {
        id: Date.now(),
        ...product,
        createdAt: new Date().toISOString(),
        status: product.status || 'draft', // draft, listed, sold
        platforms: product.platforms || ['etsy'],
        views: 0,
        sales: 0,
        revenue: 0,
        tags: product.tags || [],
        mockups: product.mockups || []
    };

    artProducts.push(newProduct);
    return newProduct;
}

/**
 * Get all products
 */
export function getProducts(filters = {}) {
    let filtered = [...artProducts];

    if (filters.status) {
        filtered = filtered.filter(p => p.status === filters.status);
    }
    if (filters.category) {
        filtered = filtered.filter(p => p.category === filters.category);
    }
    if (filters.platform) {
        filtered = filtered.filter(p => p.platforms.includes(filters.platform));
    }

    return filtered;
}

/**
 * Get product by ID
 */
export function getProductById(id) {
    return artProducts.find(p => p.id === parseInt(id));
}

/**
 * Update product
 */
export function updateProduct(id, updates) {
    const product = artProducts.find(p => p.id === parseInt(id));
    if (product) {
        Object.assign(product, updates, { updatedAt: new Date().toISOString() });
        return product;
    }
    return null;
}

/**
 * Update product status
 */
export function updateProductStatus(id, status, details = {}) {
    const product = artProducts.find(p => p.id === parseInt(id));
    if (product) {
        product.status = status;
        product.statusUpdatedAt = new Date().toISOString();
        if (details.listingUrl) product.listingUrl = details.listingUrl;
        if (details.price) product.price = details.price;

        // Update platform stats
        if (status === 'listed') {
            product.platforms.forEach(platform => {
                if (productStats[platform]) {
                    productStats[platform].listings++;
                }
            });
        }

        return product;
    }
    return null;
}

/**
 * Record a sale
 */
export function recordSale(id, platform, salePrice) {
    const product = artProducts.find(p => p.id === parseInt(id));
    if (product) {
        product.sales++;
        product.revenue += salePrice;
        product.lastSaleAt = new Date().toISOString();

        // Update platform stats
        if (productStats[platform]) {
            productStats[platform].sales++;
            productStats[platform].revenue += salePrice;
        }

        return product;
    }
    return null;
}

/**
 * Update views
 */
export function updateViews(id, platform, views) {
    const product = artProducts.find(p => p.id === parseInt(id));
    if (product) {
        product.views = views;

        if (productStats[platform]) {
            productStats[platform].views += views - (product.platformViews?.[platform] || 0);
        }

        return product;
    }
    return null;
}

/**
 * Delete product
 */
export function deleteProduct(id) {
    const idx = artProducts.findIndex(p => p.id === parseInt(id));
    if (idx !== -1) {
        const removed = artProducts.splice(idx, 1)[0];
        return removed;
    }
    return null;
}

/**
 * Get platform statistics
 */
export function getPlatformStats() {
    return productStats;
}

/**
 * Get revenue summary
 */
export function getRevenueSummary() {
    const totalRevenue = artProducts.reduce((sum, p) => sum + p.revenue, 0);
    const totalSales = artProducts.reduce((sum, p) => sum + p.sales, 0);
    const totalViews = artProducts.reduce((sum, p) => sum + p.views, 0);

    const listedProducts = artProducts.filter(p => p.status === 'listed').length;
    const draftProducts = artProducts.filter(p => p.status === 'draft').length;

    // Calculate conversion rate
    const conversionRate = totalViews > 0 ? (totalSales / totalViews * 100).toFixed(2) : 0;

    return {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalSales,
        totalViews,
        totalProducts: artProducts.length,
        listedProducts,
        draftProducts,
        conversionRate: parseFloat(conversionRate),
        platforms: productStats,
        averagePrice: totalSales > 0 ? Math.round(totalRevenue / totalSales * 100) / 100 : 0
    };
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
