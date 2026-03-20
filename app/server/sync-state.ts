import Database from 'better-sqlite3';
import { prisma } from './db.js';
import path from 'path';

// Standalone sync script — creates its own SQLite connection
const db = new Database(path.join(process.cwd(), 'nexus.db'));

// Convert SQLite date strings into actual Date objects for Prisma
const dateFields = ['created_at', 'updated_at', 'timestamp'];

async function syncTable(tableName: string, prismaModel: any) {
  console.log(`Syncing SQLite [${tableName}] -> Cloud Postgres...`);
  const rows = db.prepare(`SELECT * FROM ${tableName}`).all();
  let count = 0;
  
  for (const rawRow of rows as any[]) {
    try {
      // Massage the row to fit Postgres Prisma expectations
      const row = { ...rawRow };
      for (const field of dateFields) {
        if (row[field] && typeof row[field] === 'string') {
           // Ensure it has a timestamp boundary
           row[field] = new Date(row[field].replace(' ', 'T') + 'Z');
        }
      }
      
      const id = row.id;
      if (id !== undefined) {
          const queryId = tableName === 'chat_history' ? Number(id) : String(id);
          
          let createPayload = { ...row };
          if (tableName === 'chat_history') {
             delete createPayload.id;
          }

          await prismaModel.upsert({
            where: { id: queryId },
            update: row,
            create: createPayload,
          });
          count++;
      }
    } catch (e: any) {
      console.warn(`Failed to sync row for ${tableName} (ID: ${rawRow.id}):`, e.message);
    }
  }
  console.log(`-> Validated ${count} rows in cloud for [${tableName}]\n`);
}

async function startSync() {
  console.log('=== NEURAL STATE SYNC INITIATED ===\n');
  
  await syncTable('agents', prisma.agents);
  await syncTable('pipeline_tracks', prisma.pipeline_tracks);
  await syncTable('news_items', prisma.news_items);
  await syncTable('chat_history', prisma.chat_history);
  await syncTable('portfolio_accounts', prisma.portfolio_accounts);
  await syncTable('portfolio_positions', prisma.portfolio_positions);
  await syncTable('tasks', prisma.tasks);
  await syncTable('songs', prisma.songs);
  
  console.log('=== NEURAL STATE SYNC COMPLETE ===');
  process.exit(0);
}

startSync().catch((e) => {
  console.error("Fatal sync error:", e);
  process.exit(1);
});
