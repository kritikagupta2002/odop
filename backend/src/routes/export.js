'use strict';
const express = require('express');
const ExcelJS = require('exceljs');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

const str = (v, max) => String(v == null ? '' : v).trim().slice(0, max);

const PARTICIPANT_COLUMNS = [
  { header: 'S.No', key: 'n', width: 6 }, { header: 'Enterprise', key: 'ent', width: 34 }, { header: 'Participant', key: 'person', width: 22 },
  { header: 'District', key: 'district', width: 14 }, { header: 'ODOP product', key: 'product', width: 16 }, { header: 'Udyam number', key: 'udyam', width: 22 },
  { header: 'ODOP reference / certificate', key: 'odop', width: 24 }, { header: 'Batch', key: 'batch', width: 10 }, { header: 'Mobile', key: 'mobile', width: 13 },
  { header: 'Account link', key: 'link', width: 40 }, { header: 'Products', key: 'count', width: 9 }, { header: 'Status', key: 'status', width: 9 },
  { header: 'PDF saved', key: 'pdf', width: 10 }, { header: 'Updated', key: 'updated', width: 18 }, { header: 'Trainer', key: 'owner', width: 14 }
];
const PRODUCT_COLUMNS = [
  { header: 'Enterprise', key: 'ent', width: 30 }, { header: 'Udyam number', key: 'udyam', width: 22 }, { header: 'Product', key: 'name', width: 34 },
  { header: 'Code', key: 'code', width: 12 }, { header: 'Size', key: 'size', width: 18 }, { header: 'Material', key: 'material', width: 22 },
  { header: 'Finish', key: 'finish', width: 14 }, { header: 'Thickness', key: 'thickness', width: 12 }, { header: 'Colour', key: 'colour', width: 16 },
  { header: 'Price', key: 'price', width: 18 }, { header: 'MOQ', key: 'moq', width: 12 }, { header: 'Photo file', key: 'photo', width: 26 }
];

function styleHeader(ws) {
  ws.getRow(1).font = { bold: true };
  ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8EDF7' } };
  ws.views = [{ state: 'frozen', ySplit: 1 }];
}

function selectRecords(user, query) {
  const where = [];
  const args = [];
  if (user.role !== 'admin') { where.push('r.user_id = ?'); args.push(user.id); }
  for (const [q, col] of [['district', 'r.district'], ['product', 'r.product'], ['batch', 'r.batch_no'], ['status', 'r.status']]) {
    const v = str(query[q], 80);
    if (v) { where.push(`${col} = ?`); args.push(v); }
  }
  return db.prepare(`SELECT r.*, u.username AS owner FROM records r JOIN users u ON u.id = r.user_id
                     ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY r.district, r.product, r.id`).all(...args);
}

function buildWorkbook(rows) {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'ODOP Catalogue Maker';
  const participants = wb.addWorksheet('Participants');
  const products = wb.addWorksheet('Products');
  participants.columns = PARTICIPANT_COLUMNS;
  products.columns = PRODUCT_COLUMNS;

  rows.forEach((r, i) => {
    const form = JSON.parse(r.form_json);
    const variants = JSON.parse(r.variants_json);
    const row = participants.addRow({
      n: i + 1, ent: r.ent_name, person: r.person, district: r.district, product: r.product, udyam: r.udyam_no, odop: r.odop_ref,
      batch: r.batch_no, mobile: r.mobile, link: form.accLink || '', count: variants.length, status: r.status,
      pdf: r.pdf_file ? 'Yes' : 'No', updated: r.updated_at, owner: r.owner
    });
    if (/^https?:\/\//.test(form.accLink || '')) row.getCell('link').value = { text: form.accLink, hyperlink: form.accLink };
    variants.forEach(v => products.addRow({
      ent: r.ent_name, udyam: r.udyam_no, name: v.name, code: v.code, size: v.size, material: v.material, finish: v.finish,
      thickness: v.thickness, colour: v.colour, price: v.price, moq: v.moq, photo: v.photoFile
    }));
  });
  styleHeader(participants);
  styleHeader(products);
  return wb;
}

// Participant-wise record (in the spirit of Annexure A-2) as an Excel file.
router.get('/participants.xlsx', (req, res, next) => {
  const wb = buildWorkbook(selectRecords(req.user, req.query));
  res.set({
    'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'Content-Disposition': 'attachment; filename="ODOP_participants.xlsx"'
  });
  wb.xlsx.write(res).then(() => res.end()).catch(next);
});

module.exports = router;
