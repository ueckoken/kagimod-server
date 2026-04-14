import { Database } from 'bun:sqlite';
import { join } from 'path';

const db = new Database(join(import.meta.dirname, '../../../db/kagimod.sqlite'), { create: true });

db.run('PRAGMA journal_mode = WAL;');

db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  discord_id TEXT UNIQUE NOT NULL,
  active INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (DATETIME('now', 'localtime')),
  updated_at TEXT NOT NULL DEFAULT (DATETIME('now', 'localtime'))
)`);
db.run(`CREATE TRIGGER IF NOT EXISTS users_updated_at AFTER UPDATE ON users
  BEGIN
    UPDATE users SET updated_at = DATETIME('now', 'localtime') WHERE rowid == NEW.rowid;
  END;
`);

db.run(`CREATE TABLE IF NOT EXISTS cards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  label TEXT NOT NULL,
  idm_raw TEXT UNIQUE NOT NULL,
  idm_hash TEXT UNIQUE NOT NULL,
  created_at TEXT NOT NULL DEFAULT (DATETIME('now', 'localtime')),
  updated_at TEXT NOT NULL DEFAULT (DATETIME('now', 'localtime'))
)`);
db.run(`CREATE TRIGGER IF NOT EXISTS cards_updated_at AFTER UPDATE ON cards
  BEGIN
    UPDATE cards SET updated_at = DATETIME('now', 'localtime') WHERE rowid == NEW.rowid;
  END;
`);

export default db;
