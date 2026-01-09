
import express from 'express';
import artProductsRoutes from './routes/art-products.js';

console.log('Art Routes Type:', typeof artProductsRoutes);
console.log('Art Routes:', artProductsRoutes);

try {
    const app = express();
    app.use('/art', artProductsRoutes);
    console.log('App use successful');
} catch (e) {
    console.error('App use failed:', e);
}
