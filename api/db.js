import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

let db = null;

export async function getDb() {
  if (db) return db;
  
  db = await open({
    filename: '../dental-clinic.db',
    driver: sqlite3.Database
  });
  
  // CRITICAL: Enable foreign keys (required for CASCADE to work)
  await db.exec('PRAGMA foreign_keys = ON');
  
  // Enable WAL mode for better concurrency
  await db.exec('PRAGMA journal_mode = WAL');
  
  return db;
}

export default getDb;
