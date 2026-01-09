
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'data', 'nexus.db');

console.log('Checking database at:', dbPath);

try {
    const db = new Database(dbPath, { readonly: true });

    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    console.log('Tables found:', tables.map(t => t.name));

    const artProduct = tables.find(t => t.name === 'ArtProduct');
    if (artProduct) {
        console.log('✅ ArtProduct table exists');
        const count = db.prepare('SELECT count(*) as count FROM ArtProduct').get();
        console.log('Row count:', count.count);
    } else {
        console.error('❌ ArtProduct table MISSING');
    }

    db.close();
} catch (e) {
    console.error('Error opening database:', e);
}
