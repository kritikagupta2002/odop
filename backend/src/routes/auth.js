'use strict';
const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');
const { signToken, requireAuth, requireAdmin } = require('../middleware/auth');
const { HttpError } = require('../utils/files');

const router = express.Router();
router.use(express.json({ limit: '50kb' }));

// Very small brute-force guard: 8 wrong tries per 10 minutes for the same user + address.
const attempts = new Map();
function tooMany(key) {
  const now = Date.now();
  const list = (attempts.get(key) || []).filter(t => now - t < 10 * 60 * 1000);
  attempts.set(key, list);
  return list.length >= 8;
}
const noteFail = key => attempts.set(key, [...(attempts.get(key) || []), Date.now()]);

const publicUser = u => ({ id: u.id, username: u.username, name: u.full_name, role: u.role });
const text = (v, max) => String(v == null ? '' : v).trim().slice(0, max);

router.post('/login', (req, res) => {
  const username = text(req.body.username, 60);
  const password = String(req.body.password || '');
  const key = `${req.ip}|${username.toLowerCase()}`;
  if (tooMany(key)) throw new HttpError(429, 'too_many_attempts', 'Too many wrong attempts. Try again in a few minutes');
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!user || !user.active || !bcrypt.compareSync(password, user.password_hash)) {
    noteFail(key);
    throw new HttpError(401, 'bad_login', 'Wrong username or password');
  }
  attempts.delete(key);
  res.json({ token: signToken(user), user: publicUser(user) });
});

router.get('/me', requireAuth, (req, res) => res.json({ user: publicUser(req.user) }));

router.post('/change-password', requireAuth, (req, res) => {
  const current = String(req.body.current || '');
  const next = String(req.body.next || '');
  const row = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(req.user.id);
  if (!bcrypt.compareSync(current, row.password_hash)) throw new HttpError(400, 'bad_password', 'Current password is wrong');
  if (next.length < 8) throw new HttpError(400, 'weak_password', 'New password must be at least 8 characters');
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(bcrypt.hashSync(next, 10), req.user.id);
  res.json({ ok: true });
});

// ---- admin: manage trainers ----
router.get('/users', requireAuth, requireAdmin, (_req, res) => {
  res.json({ users: db.prepare('SELECT id, username, full_name, role, active, created_at FROM users ORDER BY id').all() });
});

router.post('/users', requireAuth, requireAdmin, (req, res) => {
  const username = text(req.body.username, 40);
  const name = text(req.body.name, 80);
  const password = String(req.body.password || '');
  const role = req.body.role === 'admin' ? 'admin' : 'trainer';
  if (!/^[A-Za-z0-9._-]{3,40}$/.test(username)) throw new HttpError(400, 'bad_username', 'Username: 3-40 letters, numbers, . _ -');
  if (password.length < 8) throw new HttpError(400, 'weak_password', 'Password must be at least 8 characters');
  if (db.prepare('SELECT 1 FROM users WHERE username = ?').get(username)) throw new HttpError(409, 'username_taken', 'That username already exists');
  const info = db.prepare('INSERT INTO users (username, password_hash, full_name, role) VALUES (?, ?, ?, ?)')
    .run(username, bcrypt.hashSync(password, 10), name, role);
  res.status(201).json({ id: Number(info.lastInsertRowid) });
});

router.patch('/users/:id', requireAuth, requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  if (id === req.user.id) throw new HttpError(400, 'self_edit', 'You cannot change your own account here');
  if (req.body.active != null) db.prepare('UPDATE users SET active = ? WHERE id = ?').run(req.body.active ? 1 : 0, id);
  if (req.body.password) {
    const pw = String(req.body.password);
    if (pw.length < 8) throw new HttpError(400, 'weak_password', 'Password must be at least 8 characters');
    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(bcrypt.hashSync(pw, 10), id);
  }
  res.json({ ok: true });
});

module.exports = router;
