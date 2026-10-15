'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = process.env.ODOP_DATA_DIR || path.join(ROOT, 'data');
const UPLOAD_DIR = process.env.ODOP_UPLOAD_DIR || path.join(ROOT, 'uploads');
const FRONTEND_DIR = path.resolve(ROOT, '..', 'frontend');

for (const dir of [DATA_DIR, UPLOAD_DIR]) fs.mkdirSync(dir, { recursive: true });

// A secret that survives restarts, so users stay logged in.
function jwtSecret() {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  const file = path.join(DATA_DIR, '.jwt-secret');
  if (!fs.existsSync(file)) fs.writeFileSync(file, crypto.randomBytes(48).toString('hex'), { mode: 0o600 });
  return fs.readFileSync(file, 'utf8').trim();
}

module.exports = {
  PORT: Number(process.env.PORT) || 3000,
  DATA_DIR,
  UPLOAD_DIR,
  FRONTEND_DIR,
  DB_FILE: path.join(DATA_DIR, 'odop.sqlite'),
  JWT_SECRET: jwtSecret(),
  TOKEN_HOURS: 12,
  CORS_ORIGIN: process.env.CORS_ORIGIN || '',
  LIMITS: { photoBytes: 12 * 1024 * 1024, pdfBytes: 90 * 1024 * 1024, maxVariants: 12 }
};
