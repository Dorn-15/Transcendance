import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import config from '../config.js';

const	databaseDirectory = path.dirname(config.sqliteFile);

if (!fs.existsSync(databaseDirectory)) {
	fs.mkdirSync(databaseDirectory, { recursive: true });
}

const	db = new Database(config.sqliteFile);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
	CREATE TABLE IF NOT EXISTS users (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		email TEXT NOT NULL UNIQUE,
		password_hash TEXT NOT NULL,
		display_name TEXT NOT NULL,
		avatar_url TEXT DEFAULT '',
		is_guest INTEGER DEFAULT 0,
		created_at INTEGER NOT NULL,
		updated_at INTEGER NOT NULL
	);
`);

export default db;

