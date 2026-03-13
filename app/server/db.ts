import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, '..', 'nexus.db');

export const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent performance
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS agents (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    description TEXT DEFAULT '',
    status TEXT DEFAULT 'active',
    system_prompt TEXT DEFAULT ''
  );

  CREATE TABLE IF NOT EXISTS pipeline_tracks (
    id TEXT PRIMARY KEY,
    artist TEXT,
    title TEXT,
    status TEXT DEFAULT 'in-progress',
    progress INTEGER DEFAULT 0,
    steps TEXT DEFAULT '[]',
    target_date TEXT
  );

  CREATE TABLE IF NOT EXISTS news_items (
    id TEXT PRIMARY KEY,
    title TEXT,
    source TEXT,
    type TEXT,
    url TEXT,
    summary TEXT,
    bias TEXT,
    time TEXT,
    impact TEXT,
    feed TEXT DEFAULT 'nexus'
  );

  CREATE TABLE IF NOT EXISTS chat_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS portfolio_accounts (
    id TEXT PRIMARY KEY,
    name TEXT,
    description TEXT,
    balance REAL DEFAULT 0,
    cash_percent REAL DEFAULT 0,
    pnl REAL DEFAULT 0,
    pnl_percent REAL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS portfolio_positions (
    id TEXT PRIMARY KEY,
    account_id TEXT,
    asset TEXT,
    allocation_percent REAL DEFAULT 0,
    pnl REAL DEFAULT 0,
    value REAL DEFAULT 0,
    units REAL DEFAULT 0,
    spot_price REAL DEFAULT 0,
    cost_basis REAL DEFAULT 0,
    FOREIGN KEY (account_id) REFERENCES portfolio_accounts(id)
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    completed INTEGER DEFAULT 0,
    category TEXT DEFAULT 'general'
  );

  CREATE TABLE IF NOT EXISTS songs (
    id TEXT PRIMARY KEY,
    title TEXT,
    artist TEXT,
    genre TEXT,
    mood TEXT,
    lyrics TEXT,
    suno_prompt TEXT,
    status TEXT DEFAULT 'draft',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// ─── Safe migrations (run after table creation, idempotent) ─────────────────
// SQLite doesn't support IF NOT EXISTS on ALTER TABLE, so we catch errors.
const safeAlter = (sql: string) => { try { db.exec(sql); } catch { /* column already exists */ } };

// Add timestamps to tables that lack them
safeAlter(`ALTER TABLE agents        ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP`);
safeAlter(`ALTER TABLE agents        ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP`);
safeAlter(`ALTER TABLE tasks         ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP`);
safeAlter(`ALTER TABLE tasks         ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP`);
safeAlter(`ALTER TABLE pipeline_tracks ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP`);
safeAlter(`ALTER TABLE pipeline_tracks ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP`);
safeAlter(`ALTER TABLE news_items    ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP`);

// Add agent_id to chat_history for per-agent thread scoping
safeAlter(`ALTER TABLE chat_history  ADD COLUMN agent_id TEXT DEFAULT NULL`);

// Add pipeline track fields for enhanced tracking
safeAlter(`ALTER TABLE pipeline_tracks ADD COLUMN genre TEXT DEFAULT NULL`);
safeAlter(`ALTER TABLE pipeline_tracks ADD COLUMN bpm INTEGER DEFAULT NULL`);
safeAlter(`ALTER TABLE pipeline_tracks ADD COLUMN key TEXT DEFAULT NULL`);
safeAlter(`ALTER TABLE pipeline_tracks ADD COLUMN notes TEXT DEFAULT NULL`);

console.log(`[DB] SQLite connected: ${DB_PATH}`);

