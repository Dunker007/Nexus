import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// The old Next.js app was in Nexus/webapp/prisma/dev.db (or wherever Prisma kept it)
// We need to guess the path or look for it.
const OLD_DB_PATH = path.join(__dirname, '..', '..', 'webapp', 'prisma', 'dev.db');
const NEW_DB_PATH = path.join(__dirname, '..', 'nexus.db');

if (!fs.existsSync(OLD_DB_PATH)) {
  console.log(`❌ Old database not found at ${OLD_DB_PATH}`);
  process.exit(1);
}

const oldDb = new Database(OLD_DB_PATH);
const newDb = new Database(NEW_DB_PATH);

console.log('🔄 Starting Migration from old Next.js DB to new Nexus DB...');

const migrateData = newDb.transaction(() => {
  try {
    // 1. Migrate Chat History
    const oldChats = oldDb.prepare('SELECT * FROM ChatMessage').all() as any[];
    const insertChat = newDb.prepare('INSERT OR REPLACE INTO chat_history (id, role, content, timestamp) VALUES (?, ?, ?, ?)');
    let chatCount = 0;
    for (const chat of oldChats) {
      insertChat.run(chat.id, chat.role, chat.content, chat.createdAt);
      chatCount++;
    }
    console.log(`✅ Migrated ${chatCount} chat messages.`);
  } catch(e: any) { console.log('⚠️ Could not migrate ChatMessage:', e.message); }

  try {
    // 2. Migrate Agents
    const oldAgentsObj = oldDb.prepare("SELECT * FROM sqlite_master WHERE type='table' AND name='Agent'").get();
    if (oldAgentsObj) {
      const agents = oldDb.prepare('SELECT * FROM Agent').all() as any[];
      const insertAgent = newDb.prepare('INSERT OR REPLACE INTO agents (id, name, role, description, status, system_prompt) VALUES (?, ?, ?, ?, ?, ?)');
      let count = 0;
      for (const a of agents) {
        insertAgent.run(a.id, a.name, a.role, a.description, a.status, a.systemPrompt || '');
        count++;
      }
      console.log(`✅ Migrated ${count} agents.`);
    }
  } catch(e: any) { console.log('⚠️ Could not migrate Agents:', e.message); }

  try {
    // 3. Migrate Pipeline
    const pipelineExists = oldDb.prepare("SELECT * FROM sqlite_master WHERE type='table' AND name='PipelineTrack'").get();
    if (pipelineExists) {
      const tracks = oldDb.prepare('SELECT * FROM PipelineTrack').all() as any[];
      const insertTrack = newDb.prepare('INSERT OR REPLACE INTO pipeline_tracks (id, artist, title, status, progress, steps, target_date) VALUES (?, ?, ?, ?, ?, ?, ?)');
      let count = 0;
      for (const t of tracks) {
        insertTrack.run(t.id, t.artist, t.title, t.status, t.progress, t.steps, t.targetDate);
        count++;
      }
      console.log(`✅ Migrated ${count} pipeline tracks.`);
    }
  } catch(e: any) { console.log('⚠️ Could not migrate Pipeline Tracks:', e.message); }
});

migrateData();

console.log('🎉 Migration Complete!');
