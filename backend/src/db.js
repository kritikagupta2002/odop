'use strict';
const { DatabaseSync } = require('node:sqlite');
const { DB_FILE } = require('./config');

const db = new DatabaseSync(DB_FILE);
db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  username      TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  full_name     TEXT NOT NULL DEFAULT '',
  role          TEXT NOT NULL DEFAULT 'trainer' CHECK (role IN ('admin', 'trainer')),
  active        INTEGER NOT NULL DEFAULT 1,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS records (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id       INTEGER NOT NULL REFERENCES users(id),
  ent_name      TEXT NOT NULL,
  district      TEXT NOT NULL,
  product       TEXT NOT NULL,
  person        TEXT NOT NULL DEFAULT '',
  mobile        TEXT NOT NULL DEFAULT '',
  udyam_no      TEXT NOT NULL DEFAULT '',
  odop_ref      TEXT NOT NULL DEFAULT '',
  batch_no      TEXT NOT NULL DEFAULT '',
  template_uid  TEXT NOT NULL DEFAULT '',
  color         TEXT NOT NULL DEFAULT '',
  status        TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'final')),
  form_json     TEXT NOT NULL,
  variants_json TEXT NOT NULL,
  logo_file     TEXT NOT NULL DEFAULT '',
  pdf_file      TEXT NOT NULL DEFAULT '',
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_records_udyam ON records (udyam_no) WHERE udyam_no <> '';
CREATE INDEX IF NOT EXISTS ix_records_user ON records (user_id);
CREATE INDEX IF NOT EXISTS ix_records_district ON records (district, product);
CREATE INDEX IF NOT EXISTS ix_records_mobile ON records (mobile);
`);

// Run several statements as one unit: all succeed or none do.
db.transaction = fn => {
  db.exec('BEGIN IMMEDIATE');
  try { const out = fn(); db.exec('COMMIT'); return out; }
  catch (err) { db.exec('ROLLBACK'); throw err; }
};

module.exports = db;
