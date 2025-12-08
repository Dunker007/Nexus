'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Palette,
    Plus,
    TrendingUp,
    DollarSign,
    Eye,
    ShoppingCart,
    ExternalLink,
    Trash2,
    RefreshCw,
    Check,
    Clock,
    FileText,
    Tag,
    Copy,
    Sparkles
} from 'lucide-react';

interface Product {
    id: number;
    title: string;
    description?: string;
    category: string;
    style: string;
    status: 'draft' | 'listed' | 'sold';
    platforms: string[];
    price?: number;
    views: number;
    sales: number;
    revenue: number;
    createdAt: string;
    listingUrl?: string;
    imageUrl?: string;
}

interface ArtSummary {
    totalRevenue: number;
    totalSales: number;
    totalViews: number;
    totalProducts: number;
    listedProducts: number;
    draftProducts: number;
    conversionRate: number;
    averagePrice: number;
}

import { LUXRIG_BRIDGE_URL } from '@/lib/utils';

const PLATFORM_COLORS: Record<string, string> = {
    etsy: 'bg-orange-500/20 text-orange-400',
    redbubble: 'bg-red-500/20 text-red-400',
    creativeMarket: 'bg-green-500/20 text-green-400',
    gumroad: 'bg-pink-500/20 text-pink-400'
};

export default function ArtRevenuePage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [summary, setSummary] = useState<ArtSummary | null>(null);
    const [categories, setCategories] = useState<string[]>([]);
    const [styles, setStyles] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDescModal, setShowDescModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [generatedDesc, setGeneratedDesc] = useState('');
    const [generatedKeywords, setGeneratedKeywords] = useState<string[]>([]);
    const [newProduct, setNewProduct] = useState({
        title: '',
        category: 'Digital Print',
        style: 'Minimalist',
        platforms: ['etsy'],
        price: 4.99
    });

    const fetchData = useCallback(async () => {
        try {
            const [productsRes, summaryRes, catsRes, stylesRes] = await Promise.all([
                fetch(`${LUXRIG_BRIDGE_URL}/art/products`),
                fetch(`${LUXRIG_BRIDGE_URL}/art/summary`),
                fetch(`${LUXRIG_BRIDGE_URL}/art/categories`),
                fetch(`${LUXRIG_BRIDGE_URL}/art/styles`)
            ]);

            const productsData = await productsRes.json();
            const summaryData = await summaryRes.json();
            const catsData = await catsRes.json();
            const stylesData = await stylesRes.json();

            if (productsData.success) setProducts(productsData.products);
            if (summaryData.success) setSummary(summaryData.summary);
            if (catsData.success) setCategories(catsData.categories);
            if (stylesData.success) setStyles(stylesData.styles);
        } catch (err) {
            console.error('Failed to fetch data:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const addProduct = async () => {
        if (!newProduct.title) return;

        try {
            const res = await fetch(`${LUXRIG_BRIDGE_URL}/art/products`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newProduct)
            });
            const data = await res.json();
            if (data.success) {
                setProducts([...products, data.product]);
                setNewProduct({ title: '', category: 'Digital Print', style: 'Minimalist', platforms: ['etsy'], price: 4.99 });
                setShowAddModal(false);
                fetchData();
            }
        } catch (err) {
            console.error('Failed to add product:', err);
        }
    };

    const updateStatus = async (id: number, status: string) => {
        try {
            await fetch(`${LUXRIG_BRIDGE_URL}/art/products/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            fetchData();
        } catch (err) {
            console.error('Failed to update status:', err);
        }
    };

    const deleteProduct = async (id: number) => {
        try {
            await fetch(`${LUXRIG_BRIDGE_URL}/art/products/${id}`, { method: 'DELETE' });
            setProducts(products.filter(p => p.id !== id));
            fetchData();
        } catch (err) {
            console.error('Failed to delete product:', err);
        }
    };

    const generateDescription = async (product: Product) => {
        setSelectedProduct(product);
        setShowDescModal(true);

        try {
            const [descRes, keywordsRes] = await Promise.all([
                fetch(`${LUXRIG_BRIDGE_URL}/art/products/${product.id}/description`, { method: 'POST' }),
                fetch(`${LUXRIG_BRIDGE_URL}/art/products/${product.id}/keywords`, { method: 'POST' })
            ]);

            const descData = await descRes.json();
            const keywordsData = await keywordsRes.json();

            if (descData.success) setGeneratedDesc(descData.description);
            if (keywordsData.success) setGeneratedKeywords(keywordsData.keywords);
        } catch (err) {
            console.error('Failed to generate description:', err);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'listed': return 'text-emerald-400 bg-emerald-500/20';
            case 'draft': return 'text-amber-400 bg-amber-500/20';
            case 'sold': return 'text-blue-400 bg-blue-500/20';
            default: return 'text-gray-400 bg-gray-500/20';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 flex items-center justify-center">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                    <RefreshCw className="w-8 h-8 text-purple-400" />
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <Palette className="w-8 h-8 text-orange-400" />
                            Art Revenue
                        </h1>
                        <p className="text-gray-400 mt-1">Phase 14 • Etsy & POD Products</p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-500 hover:to-pink-500 rounded-lg text-white font-medium shadow-lg shadow-orange-500/25 transition-all"
                    >
                        <Plus className="w-5 h-5" />
                        Add Product
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    {/* Total Revenue */}
                    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-emerald-500/20">
                                <DollarSign className="w-5 h-5 text-emerald-400" />
                            </div>
                            <span className="text-gray-400 text-sm">Total Revenue</span>
                        </div>
                        <p className="text-2xl font-bold text-white">${summary?.totalRevenue.toFixed(2) || '0.00'}</p>
                        <p className="text-xs text-gray-500 mt-1">Avg: ${summary?.averagePrice.toFixed(2) || '0.00'}/sale</p>
                    </div>

                    {/* Total Sales */}
                    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-blue-500/20">
                                <ShoppingCart className="w-5 h-5 text-blue-400" />
                            </div>
                            <span className="text-gray-400 text-sm">Total Sales</span>
                        </div>
                        <p className="text-2xl font-bold text-white">{summary?.totalSales || 0}</p>
                    </div>

                    {/* Total Views */}
                    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-purple-500/20">
                                <Eye className="w-5 h-5 text-purple-400" />
                            </div>
                            <span className="text-gray-400 text-sm">Total Views</span>
                        </div>
                        <p className="text-2xl font-bold text-white">{summary?.totalViews.toLocaleString() || 0}</p>
                        <p className="text-xs text-gray-500 mt-1">{summary?.conversionRate || 0}% conversion</p>
                    </div>

                    {/* Listed Products */}
                    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-orange-500/20">
                                <Palette className="w-5 h-5 text-orange-400" />
                            </div>
                            <span className="text-gray-400 text-sm">Products Listed</span>
                        </div>
                        <p className="text-2xl font-bold text-white">{summary?.listedProducts || 0}</p>
                        <p className="text-xs text-gray-500 mt-1">{summary?.draftProducts || 0} drafts</p>
                    </div>
                </div>

                {/* Products List */}
                <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Palette className="w-5 h-5 text-orange-400" />
                        Art Products
                        <span className="ml-auto text-sm text-gray-400">{products.length} total</span>
                    </h3>

                    {products.length === 0 ? (
                        <div className="text-center py-12">
                            <Palette className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-400">No products yet</p>
                            <p className="text-sm text-gray-500 mt-1">Create art in the Art Studio, then add products here</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {products.map((product) => (
                                <motion.div
                                    key={product.id}
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-4 bg-gray-900/50 border border-gray-700 rounded-lg"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                                                {product.imageUrl ? (
                                                    <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover rounded-lg" />
                                                ) : (
                                                    <Palette className="w-6 h-6 text-white" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-white font-medium">{product.title}</p>
                                                <p className="text-sm text-gray-400">{product.category} • {product.style}</p>
                                                <div className="flex gap-1 mt-1">
                                                    {product.platforms.map(p => (
                                                        <span key={p} className={`text-xs px-2 py-0.5 rounded ${PLATFORM_COLORS[p] || 'bg-gray-700 text-gray-400'}`}>
                                                            {p}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6">
                                            {/* Stats */}
                                            <div className="hidden md:flex items-center gap-6">
                                                <div className="text-center">
                                                    <p className="text-white font-medium">{product.views}</p>
                                                    <p className="text-xs text-gray-500">views</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-white font-medium">{product.sales}</p>
                                                    <p className="text-xs text-gray-500">sales</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-emerald-400 font-medium">${product.revenue.toFixed(2)}</p>
                                                    <p className="text-xs text-gray-500">earned</p>
                                                </div>
                                            </div>

                                            {/* Price */}
                                            {product.price && (
                                                <div className="text-right hidden md:block">
                                                    <p className="text-white font-medium">${product.price.toFixed(2)}</p>
                                                    <p className="text-xs text-gray-500">price</p>
                                                </div>
                                            )}

                                            {/* Status */}
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                                                {product.status}
                                            </span>

                                            {/* Actions */}
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => generateDescription(product)}
                                                    className="p-2 rounded-lg bg-purple-600/20 text-purple-400 hover:bg-purple-600/30"
                                                    title="Generate Etsy Listing"
                                                >
                                                    <Sparkles className="w-4 h-4" />
                                                </button>
                                                {product.status === 'draft' && (
                                                    <button
                                                        onClick={() => updateStatus(product.id, 'listed')}
                                                        className="p-2 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30"
                                                        title="Mark as Listed"
                                                    >
                                                        <Check className="w-4 h-4" />
                                                    </button>
                                                )}
                                                {product.listingUrl && (
                                                    <a
                                                        href={product.listingUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600/30"
                                                    >
                                                        <ExternalLink className="w-4 h-4" />
                                                    </a>
                                                )}
                                                <button
                                                    onClick={() => deleteProduct(product.id)}
                                                    className="p-2 rounded-lg bg-gray-700 text-gray-400 hover:bg-red-600/20 hover:text-red-400"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Add Product Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
                        onClick={() => setShowAddModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-md"
                            onClick={e => e.stopPropagation()}
                        >
                            <h3 className="text-xl font-bold text-white mb-4">Add Art Product</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Product Title *</label>
                                    <input
                                        type="text"
                                        value={newProduct.title}
                                        onChange={e => setNewProduct({ ...newProduct, title: e.target.value })}
                                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-orange-500 outline-none"
                                        placeholder="Minimalist Abstract Wall Art"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Category</label>
                                        <select
                                            value={newProduct.category}
                                            onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-orange-500 outline-none"
                                        >
                                            {categories.map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Style</label>
                                        <select
                                            value={newProduct.style}
                                            onChange={e => setNewProduct({ ...newProduct, style: e.target.value })}
                                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-orange-500 outline-none"
                                        >
                                            {styles.map(style => (
                                                <option key={style} value={style}>{style}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Price ($)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={newProduct.price}
                                        onChange={e => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })}
                                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-orange-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 py-3 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={addProduct}
                                    disabled={!newProduct.title}
                                    className="flex-1 py-3 rounded-lg bg-gradient-to-r from-orange-600 to-pink-600 text-white font-medium disabled:opacity-50"
                                >
                                    Add Product
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Generated Description Modal */}
            <AnimatePresence>
                {showDescModal && selectedProduct && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        onClick={() => setShowDescModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto"
                            onClick={e => e.stopPropagation()}
                        >
                            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-orange-400" />
                                Etsy Listing for: {selectedProduct.title}
                            </h3>

                            {/* Keywords */}
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm text-gray-400 flex items-center gap-2">
                                        <Tag className="w-4 h-4" />
                                        SEO Tags (Copy to Etsy)
                                    </label>
                                    <button
                                        onClick={() => copyToClipboard(generatedKeywords.join(', '))}
                                        className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
                                    >
                                        <Copy className="w-3 h-3" />
                                        Copy All
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {generatedKeywords.map((kw, i) => (
                                        <span
                                            key={i}
                                            className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-sm cursor-pointer hover:bg-purple-500/30"
                                            onClick={() => copyToClipboard(kw)}
                                        >
                                            {kw}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm text-gray-400">Listing Description</label>
                                    <button
                                        onClick={() => copyToClipboard(generatedDesc)}
                                        className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
                                    >
                                        <Copy className="w-3 h-3" />
                                        Copy
                                    </button>
                                </div>
                                <pre className="bg-gray-900 rounded-lg p-4 text-sm text-gray-300 whitespace-pre-wrap font-sans">
                                    {generatedDesc || 'Generating...'}
                                </pre>
                            </div>

                            <button
                                onClick={() => setShowDescModal(false)}
                                className="w-full mt-6 py-3 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600"
                            >
                                Close
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
