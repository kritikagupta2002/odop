'use strict';
// Run with:  npm test      (uses a temporary data folder, your real data is never touched)
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'odop-test-'));
process.env.ODOP_DATA_DIR = path.join(tmp, 'data');
process.env.ODOP_UPLOAD_DIR = path.join(tmp, 'uploads');
process.env.JWT_SECRET = 'test-secret-test-secret-test-secret';

const bcrypt = require('bcryptjs');
const db = require('../src/db');
const app = require('../src/app');

const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
const PDF = 'data:application/pdf;base64,' + Buffer.from('%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF').toString('base64');

let server, base, adminToken, trainerToken, otherToken;

test.before(async () => {
  const hash = bcrypt.hashSync('password123', 4);
  for (const [u, role] of [['admin', 'admin'], ['trainer1', 'trainer'], ['trainer2', 'trainer']]) {
    db.prepare('INSERT INTO users (username, password_hash, full_name, role) VALUES (?, ?, ?, ?)').run(u, hash, u, role);
  }
  server = app.listen(0);
  base = `http://127.0.0.1:${server.address().port}`;
});
test.after(() => {
  server.close();
  db.close();
  try { fs.rmSync(tmp, { recursive: true, force: true }); } catch { /* temp folder is cleaned by the system later */ }
});

const call = (method, url, token, body) => fetch(base + url, {
  method,
  headers: { ...(token ? { Authorization: 'Bearer ' + token } : {}), ...(body ? { 'Content-Type': 'application/json' } : {}) },
  body: body ? JSON.stringify(body) : undefined
});
const login = async user => (await (await call('POST', '/api/auth/login', null, { username: user, password: 'password123' })).json()).token;

const variants = n => Array.from({ length: n }, (_, i) => ({ name: 'Product ' + (i + 1), size: '10 inch', material: 'Stone', colour: 'Grey', price: 'Rs 100', moq: '10', photo: PNG }));
const payload = (over = {}, n = 5) => ({
  form: { district: 'Bundi', product: 'Sandstone', entName: 'Bundi Sandstone Arts', person: 'Mahesh', mobile: '9414765432', udyam: 'UDYAM-RJ-17-0123456', accLink: 'https://wa.me/919414765432', ...over },
  variants: variants(n), template: 'editorial:ed-ss1', color: '#1d6fb8', status: 'final'
});

test('health and login', async () => {
  assert.equal((await call('GET', '/api/health')).status, 200);
  assert.equal((await call('POST', '/api/auth/login', null, { username: 'admin', password: 'wrong' })).status, 401);
  adminToken = await login('admin'); trainerToken = await login('trainer1'); otherToken = await login('trainer2');
  assert.ok(adminToken && trainerToken && otherToken);
  assert.equal((await call('GET', '/api/records')).status, 401);
});

test('create, read and list a catalogue', async () => {
  const res = await call('POST', '/api/records', trainerToken, payload());
  assert.equal(res.status, 201);
  const rec = await res.json();
  assert.equal(rec.variants.length, 5);
  assert.match(rec.variants[0].photoUrl, /^\/api\/records\/\d+\/files\/photo-1-[0-9a-f]{10}\.png$/);
  const img = await call('GET', rec.variants[0].photoUrl, trainerToken);
  assert.equal(img.status, 200);
  assert.equal(img.headers.get('content-type'), 'image/png');
  const list = await (await call('GET', '/api/records?search=bundi', trainerToken)).json();
  assert.equal(list.total, 1);
});

test('same Udyam number cannot be used twice', async () => {
  const res = await call('POST', '/api/records', otherToken, payload({ entName: 'Another Co' }));
  assert.equal(res.status, 409);
  assert.equal((await res.json()).error, 'duplicate_udyam');
  const dup = await (await call('GET', '/api/records/duplicates?udyam=UDYAM-RJ-17-0123456', otherToken)).json();
  assert.equal(dup.udyam.name, 'Bundi Sandstone Arts');
});

test('validation rejects bad input', async () => {
  assert.equal((await call('POST', '/api/records', trainerToken, payload({ udyam: 'BAD' }))).status, 400);
  assert.equal((await call('POST', '/api/records', trainerToken, payload({ mobile: '123' }))).status, 400);
  assert.equal((await call('POST', '/api/records', trainerToken, payload({ udyam: '' }, 3))).status, 400);
  const bad = payload({ udyam: '' }); bad.variants[0].photo = 'data:text/html;base64,PGI+';
  assert.equal((await call('POST', '/api/records', trainerToken, bad)).status, 400);
});

test('trainers only see their own catalogues, admin sees all', async () => {
  const list = await (await call('GET', '/api/records', otherToken)).json();
  assert.equal(list.total, 0);
  assert.equal((await call('GET', '/api/records/1', otherToken)).status, 403);
  assert.equal((await call('GET', '/api/records', adminToken).then(r => r.json())).total, 1);
});

test('update keeps photos, saves the PDF and exports Excel', async () => {
  const rec = await (await call('GET', '/api/records/1', trainerToken)).json();
  const body = { form: rec.form, variants: rec.variants, template: rec.template, color: rec.color, status: 'final' };
  body.form.entName = 'Bundi Sandstone Arts Pvt';
  const upd = await call('PUT', '/api/records/1', trainerToken, body);
  assert.equal(upd.status, 200);
  const after = await upd.json();
  assert.equal(after.variants[0].photoFile, rec.variants[0].photoFile);
  assert.equal((await call('POST', '/api/records/1/pdf', trainerToken, { pdf: PDF })).status, 200);
  assert.equal((await call('POST', '/api/records/1/pdf', trainerToken, { pdf: PNG })).status, 400);
  const pdf = await call('GET', '/api/records/1/pdf', trainerToken);
  assert.equal(pdf.status, 200);
  const xlsx = await call('GET', '/api/export/participants.xlsx', trainerToken);
  assert.equal(xlsx.status, 200);
  assert.ok((await xlsx.arrayBuffer()).byteLength > 1000);
});

test('files cannot be read by path tricks', async () => {
  assert.equal((await call('GET', '/api/records/1/files/..%2F..%2Fdata%2Fodop.sqlite', trainerToken)).status, 404);
  assert.equal((await call('GET', '/api/records/1/files/photo-9-aaaaaaaaaa.png', trainerToken)).status, 404);
});

test('admin can add a trainer; delete removes the catalogue', async () => {
  assert.equal((await call('POST', '/api/auth/users', trainerToken, { username: 'x1234', password: 'longpassword' })).status, 403);
  assert.equal((await call('POST', '/api/auth/users', adminToken, { username: 'newtrainer', password: 'longpassword', name: 'New' })).status, 201);
  assert.equal((await call('DELETE', '/api/records/1', trainerToken)).status, 200);
  assert.equal((await call('GET', '/api/records/1', trainerToken)).status, 404);
});
