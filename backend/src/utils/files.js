'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { UPLOAD_DIR } = require('../config');

const IMAGE_TYPES = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };

class HttpError extends Error {
  constructor(status, code, message) { super(message || code); this.status = status; this.code = code; }
}

// "data:image/jpeg;base64,...." -> { mime, buf }
function parseDataUrl(value, allowed, maxBytes) {
  const m = /^data:([\w.+/-]+);base64,([A-Za-z0-9+/=\r\n]+)$/.exec(String(value || ''));
  if (!m || !allowed.includes(m[1])) throw new HttpError(400, 'bad_file', 'Unsupported or invalid file');
  const buf = Buffer.from(m[2], 'base64');
  if (!buf.length || buf.length > maxBytes) throw new HttpError(413, 'file_too_large', 'File is empty or too large');
  return { mime: m[1], buf };
}

const recordDir = id => path.join(UPLOAD_DIR, 'records', String(Number(id)));

function saveImage(recordId, prefix, dataUrl, maxBytes) {
  const { mime, buf } = parseDataUrl(dataUrl, Object.keys(IMAGE_TYPES), maxBytes);
  const dir = recordDir(recordId);
  fs.mkdirSync(dir, { recursive: true });
  const name = `${prefix}-${crypto.randomBytes(5).toString('hex')}.${IMAGE_TYPES[mime]}`;
  fs.writeFileSync(path.join(dir, name), buf);
  return name;
}

function savePdf(recordId, dataUrl, maxBytes) {
  const { buf } = parseDataUrl(dataUrl, ['application/pdf'], maxBytes);
  if (buf.subarray(0, 5).toString() !== '%PDF-') throw new HttpError(400, 'bad_file', 'Not a PDF file');
  const dir = recordDir(recordId);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'catalogue.pdf'), buf);
  return 'catalogue.pdf';
}

// Only names we created ourselves are ever read back.
const SAFE_NAME = /^(photo-\d+|logo)-[0-9a-f]{10}\.(jpg|png|webp)$|^catalogue\.pdf$/;
const isSafeName = name => SAFE_NAME.test(String(name || ''));
const filePath = (recordId, name) => path.join(recordDir(recordId), name);

function removeFiles(recordId, keepNames) {
  const dir = recordDir(recordId);
  if (!fs.existsSync(dir)) return;
  const keep = new Set(keepNames.filter(Boolean));
  for (const f of fs.readdirSync(dir)) if (!keep.has(f)) fs.rmSync(path.join(dir, f), { force: true });
}
const removeRecordDir = recordId => fs.rmSync(recordDir(recordId), { recursive: true, force: true });

module.exports = { HttpError, saveImage, savePdf, isSafeName, filePath, removeFiles, removeRecordDir };
