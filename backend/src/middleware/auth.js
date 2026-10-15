'use strict';
const jwt = require('jsonwebtoken');
const db = require('../db');
const { JWT_SECRET, TOKEN_HOURS } = require('../config');
const { HttpError } = require('../utils/files');

const signToken = user => jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, { expiresIn: `${TOKEN_HOURS}h` });

function requireAuth(req, _res, next) {
  const m = /^Bearer (.+)$/.exec(req.get('authorization') || '');
  if (!m) return next(new HttpError(401, 'login_required', 'Please log in'));
  try {
    const payload = jwt.verify(m[1], JWT_SECRET);
    const user = db.prepare('SELECT id, username, full_name, role, active FROM users WHERE id = ?').get(payload.sub);
    if (!user || !user.active) throw new Error('inactive');
    req.user = user;
    next();
  } catch {
    next(new HttpError(401, 'login_required', 'Session expired. Please log in again'));
  }
}

const requireAdmin = (req, _res, next) =>
  req.user && req.user.role === 'admin' ? next() : next(new HttpError(403, 'admin_only', 'Admin access needed'));

module.exports = { signToken, requireAuth, requireAdmin };
