'use strict';
// Creates the first admin user (once). Run:  npm run seed
const crypto = require('node:crypto');
const bcrypt = require('bcryptjs');
const db = require('../src/db');

const username = (process.env.ADMIN_USERNAME || 'admin').trim();
let password = process.env.ADMIN_PASSWORD || '';
let generated = false;

if (db.prepare('SELECT 1 FROM users WHERE role = ? LIMIT 1').get('admin')) {
  console.log('An admin user already exists. Nothing to do.');
  process.exit(0);
}
if (!password) { password = crypto.randomBytes(9).toString('base64url'); generated = true; }
if (password.length < 8) { console.error('ADMIN_PASSWORD must be at least 8 characters.'); process.exit(1); }

db.prepare('INSERT INTO users (username, password_hash, full_name, role) VALUES (?, ?, ?, ?)')
  .run(username, bcrypt.hashSync(password, 10), 'Administrator', 'admin');
console.log(`Admin user created: ${username}`);
if (generated) console.log(`Password (shown once, please save it): ${password}`);
