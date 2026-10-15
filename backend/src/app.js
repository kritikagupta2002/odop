'use strict';
const express = require('express');
const config = require('./config');
require('./db');

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 'loopback');

// Basic security headers; CORS only when a different frontend address is configured.
app.use((req, res, next) => {
  res.set({ 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer', 'X-Frame-Options': 'SAMEORIGIN' });
  if (config.CORS_ORIGIN) {
    res.set({
      'Access-Control-Allow-Origin': config.CORS_ORIGIN,
      'Access-Control-Allow-Headers': 'Authorization, Content-Type',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      Vary: 'Origin'
    });
    if (req.method === 'OPTIONS') return res.sendStatus(204);
  }
  next();
});

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/records', require('./routes/records'));
app.use('/api/export', require('./routes/export'));
app.use('/api', (_req, res) => res.status(404).json({ error: 'not_found', message: 'Unknown API address' }));

// The frontend is plain files, so the same server can hand them out.
app.use(express.static(config.FRONTEND_DIR, { extensions: ['html'] }));

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  if (err.type === 'entity.too.large') return res.status(413).json({ error: 'too_large', message: 'The upload is too large' });
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'bad_json', message: 'Invalid request' });
  const status = err.status || 500;
  if (status >= 500) console.error(err);
  res.status(status).json({ error: err.code || 'server_error', message: status >= 500 ? 'Something went wrong on the server' : err.message });
});

module.exports = app;
