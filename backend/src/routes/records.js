'use strict';
const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const { LIMITS } = require('../config');
const files = require('../utils/files');
const { HttpError } = files;

const router = express.Router();
router.use(requireAuth);

/* ---------------- small helpers ---------------- */
const str = (v, max) => String(v == null ? '' : v).trim().slice(0, max);
const digits = v => String(v || '').replace(/\D/g, '');
const normUdyam = v => str(v, 40).toUpperCase().replace(/\s+/g, '');
const UDYAM_RE = /^UDYAM-[A-Z]{2}-\d{2}-\d{7}$/;

const FORM_KEYS = ['district', 'districtOther', 'product', 'productOther', 'entName', 'person', 'mobile', 'wa', 'email', 'addr', 'gst', 'desc', 'use',
  'platform', 'accLink', 'locLink', 'socIg', 'socFb', 'socYt', 'socWeb', 'txTagline', 'txWhy', 'txApps', 'txValues', 'udyam', 'odopRef', 'batchNo'];
const LONG_KEYS = new Set(['desc', 'txWhy', 'txApps', 'txValues']);
const VARIANT_KEYS = ['name', 'size', 'material', 'colour', 'price', 'moq', 'code', 'finish', 'thickness'];

const canAccess = (user, rec) => user.role === 'admin' || rec.user_id === user.id;
function load(user, id) {
  const rec = db.prepare('SELECT * FROM records WHERE id = ?').get(Number(id));
  if (!rec) throw new HttpError(404, 'not_found', 'Catalogue not found');
  if (!canAccess(user, rec)) throw new HttpError(403, 'forbidden', 'This catalogue belongs to another user');
  return rec;
}

function cleanForm(raw) {
  const form = {};
  for (const k of FORM_KEYS) form[k] = str(raw && raw[k], LONG_KEYS.has(k) ? 4000 : 400);
  form.mobile = digits(form.mobile).slice(0, 10);
  form.wa = digits(form.wa).slice(0, 10);
  form.udyam = normUdyam(form.udyam);
  return form;
}

function validate(form, variants, status) {
  const district = form.district === '__other__' ? form.districtOther : form.district;
  const product = form.product === '__other__' ? form.productOther : form.product;
  if (!form.entName) throw new HttpError(400, 'validation', 'Enterprise name is required');
  if (!district || !product) throw new HttpError(400, 'validation', 'District and product are required');
  if (form.mobile && form.mobile.length !== 10) throw new HttpError(400, 'validation', 'Mobile number must be 10 digits');
  if (form.udyam && !UDYAM_RE.test(form.udyam)) throw new HttpError(400, 'validation', 'Udyam number must look like UDYAM-RJ-17-0123456');
  if (!Array.isArray(variants) || variants.length > LIMITS.maxVariants) throw new HttpError(400, 'validation', `Add up to ${LIMITS.maxVariants} variants`);
  if (status === 'final') {
    if (variants.length < 5) throw new HttpError(400, 'validation', 'A final catalogue needs at least 5 variants');
    if (variants.some(v => !v.photo && !v.photoFile)) throw new HttpError(400, 'validation', 'Every variant needs a photo');
  }
  return { district, product };
}

function findUdyamClash(udyam, exceptId) {
  if (!udyam) return null;
  return db.prepare('SELECT id, ent_name, district FROM records WHERE udyam_no = ? AND id <> ?').get(udyam, Number(exceptId) || 0) || null;
}

/* ---------------- create / update ---------------- */
function persist(user, existing, body) {
  const form = cleanForm(body.form);
  const status = body.status === 'final' ? 'final' : 'draft';
  const rawVariants = Array.isArray(body.variants) ? body.variants : [];
  const { district, product } = validate(form, rawVariants, status);

  const clash = findUdyamClash(form.udyam, existing && existing.id);
  if (clash) throw new HttpError(409, 'duplicate_udyam', `This Udyam number is already used by "${clash.ent_name}" (${clash.district})`);

  const colour = /^#[0-9a-fA-F]{6}$/.test(body.color || '') ? body.color : '';
  const template = str(body.template, 60);
  const oldVariants = existing ? JSON.parse(existing.variants_json) : [];
  const oldNames = new Set(oldVariants.map(v => v.photoFile).filter(Boolean));

  return db.transaction(() => {
    let id = existing && existing.id;
    const cols = [form.entName, district, product, form.person, form.mobile, form.udyam, form.odopRef, form.batchNo, template, colour, status, JSON.stringify(form)];
    if (!id) {
      const info = db.prepare(`INSERT INTO records (user_id, ent_name, district, product, person, mobile, udyam_no, odop_ref, batch_no, template_uid, color, status, form_json, variants_json)
                               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '[]')`).run(user.id, ...cols);
      id = Number(info.lastInsertRowid);
    }
    const variants = rawVariants.map((v, i) => {
      const out = {
        fit: ['auto', 'full', 'fill'].includes(v.fit) ? v.fit : 'auto',
        useEnh: !!v.useEnh,
        strength: Math.min(1, Math.max(0.1, Number(v.strength) || 0.6)),
        photoFile: ''
      };
      for (const k of VARIANT_KEYS) out[k] = str(v[k], k === 'name' ? 200 : 120);
      if (typeof v.photo === 'string' && v.photo.startsWith('data:')) out.photoFile = files.saveImage(id, `photo-${i + 1}`, v.photo, LIMITS.photoBytes);
      else if (files.isSafeName(v.photoFile) && oldNames.has(v.photoFile)) out.photoFile = v.photoFile;
      return out;
    });
    let logo = existing ? existing.logo_file : '';
    if (typeof body.logo === 'string' && body.logo.startsWith('data:')) logo = files.saveImage(id, 'logo', body.logo, LIMITS.photoBytes);
    else if (body.logo === null || body.logo === '') logo = '';
    const pdf = existing ? existing.pdf_file : '';

    db.prepare(`UPDATE records SET ent_name=?, district=?, product=?, person=?, mobile=?, udyam_no=?, odop_ref=?, batch_no=?, template_uid=?, color=?, status=?,
                form_json=?, variants_json=?, logo_file=?, updated_at=datetime('now') WHERE id=?`).run(...cols, JSON.stringify(variants), logo, id);
    files.removeFiles(id, variants.map(v => v.photoFile).concat([logo, pdf]));
    return id;
  });
}

const view = rec => {
  const variants = JSON.parse(rec.variants_json).map(v => ({ ...v, photoUrl: v.photoFile ? `/api/records/${rec.id}/files/${v.photoFile}` : '' }));
  return {
    id: rec.id,
    status: rec.status,
    template: rec.template_uid,
    color: rec.color,
    form: JSON.parse(rec.form_json),
    variants,
    logoUrl: rec.logo_file ? `/api/records/${rec.id}/files/${rec.logo_file}` : '',
    hasPdf: !!rec.pdf_file,
    createdAt: rec.created_at,
    updatedAt: rec.updated_at
  };
};

/* ---------------- routes ---------------- */
const bigJson = express.json({ limit: '60mb' });

router.get('/', (req, res) => {
  const where = [];
  const args = [];
  if (req.user.role !== 'admin') { where.push('r.user_id = ?'); args.push(req.user.id); }
  for (const [q, col] of [['district', 'r.district'], ['product', 'r.product'], ['status', 'r.status'], ['batch', 'r.batch_no']]) {
    const v = str(req.query[q], 80);
    if (v) { where.push(`${col} = ?`); args.push(v); }
  }
  const s = str(req.query.search, 80).toLowerCase();
  if (s) {
    where.push('(LOWER(r.ent_name) LIKE ? OR LOWER(r.udyam_no) LIKE ? OR r.mobile LIKE ? OR LOWER(r.person) LIKE ?)');
    const like = `%${s}%`;
    args.push(like, like, like, like);
  }
  const limit = Math.min(200, Math.max(1, Number(req.query.limit) || 50));
  const offset = Math.max(0, Number(req.query.offset) || 0);
  const from = `FROM records r JOIN users u ON u.id = r.user_id ${where.length ? 'WHERE ' + where.join(' AND ') : ''}`;
  const total = db.prepare(`SELECT COUNT(*) AS n ${from}`).get(...args).n;
  const rows = db.prepare(`SELECT r.id, r.ent_name, r.district, r.product, r.udyam_no, r.odop_ref, r.batch_no, r.mobile, r.template_uid, r.status, r.pdf_file, r.updated_at, u.username AS owner
                           ${from} ORDER BY r.updated_at DESC, r.id DESC LIMIT ? OFFSET ?`).all(...args, limit, offset);
  res.json({
    total,
    records: rows.map(r => ({
      id: r.id, name: r.ent_name, district: r.district, product: r.product, udyam: r.udyam_no, odopRef: r.odop_ref, batch: r.batch_no,
      mobile: r.mobile, template: r.template_uid, status: r.status, hasPdf: !!r.pdf_file, updatedAt: r.updated_at, owner: r.owner
    }))
  });
});

// Is this Udyam number / mobile already used by another catalogue?
router.get('/duplicates', (req, res) => {
  const udyam = normUdyam(req.query.udyam);
  const mobile = digits(req.query.mobile);
  const except = Number(req.query.exclude) || 0;
  const mini = r => ({ id: r.id, name: r.ent_name, district: r.district });
  res.json({
    udyam: udyam ? (db.prepare('SELECT id, ent_name, district FROM records WHERE udyam_no = ? AND id <> ?').all(udyam, except).map(mini)[0] || null) : null,
    mobile: mobile.length === 10 ? db.prepare('SELECT id, ent_name, district FROM records WHERE mobile = ? AND id <> ? LIMIT 5').all(mobile, except).map(mini) : []
  });
});

router.post('/', bigJson, (req, res) => {
  const id = persist(req.user, null, req.body || {});
  res.status(201).json(view(db.prepare('SELECT * FROM records WHERE id = ?').get(id)));
});

router.get('/:id', (req, res) => res.json(view(load(req.user, req.params.id))));

router.put('/:id', bigJson, (req, res) => {
  const rec = load(req.user, req.params.id);
  const id = persist(req.user, rec, req.body || {});
  res.json(view(db.prepare('SELECT * FROM records WHERE id = ?').get(id)));
});

router.delete('/:id', (req, res) => {
  const rec = load(req.user, req.params.id);
  db.prepare('DELETE FROM records WHERE id = ?').run(rec.id);
  files.removeRecordDir(rec.id);
  res.json({ ok: true });
});

router.get('/:id/files/:name', (req, res) => {
  const rec = load(req.user, req.params.id);
  const name = req.params.name;
  const known = JSON.parse(rec.variants_json).map(v => v.photoFile).concat([rec.logo_file, rec.pdf_file]);
  if (!files.isSafeName(name) || !known.includes(name)) throw new HttpError(404, 'not_found', 'File not found');
  res.set('Cache-Control', 'private, max-age=300');
  res.sendFile(files.filePath(rec.id, name));
});

router.post('/:id/pdf', express.json({ limit: '110mb' }), (req, res) => {
  const rec = load(req.user, req.params.id);
  const name = files.savePdf(rec.id, req.body && req.body.pdf, LIMITS.pdfBytes);
  db.prepare(`UPDATE records SET pdf_file = ?, updated_at = datetime('now') WHERE id = ?`).run(name, rec.id);
  res.json({ ok: true });
});

router.get('/:id/pdf', (req, res) => {
  const rec = load(req.user, req.params.id);
  if (!rec.pdf_file) throw new HttpError(404, 'no_pdf', 'No PDF saved for this catalogue yet');
  res.download(files.filePath(rec.id, rec.pdf_file), `Catalogue_${rec.ent_name.replace(/[^\w]+/g, '_').slice(0, 40)}.pdf`);
});

module.exports = router;
