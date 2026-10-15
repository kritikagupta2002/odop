/* Design editor: click anything in the preview to move it, resize it, change a photo's shape, swap the photo or edit the text.
   Edits are stored per template and are re-applied every time the pages are built (preview and PDF). */
(function () {
  const $ = id => document.getElementById(id);
  const EDITS = window.DesignEdits = {};            // template uid -> { "page|path": edit }
  const orig = new WeakMap();                       // element -> its untouched style / html
  const SHAPES = { original: null, square: '0', rounded: '28px', circle: '50%', arch: '999px 999px 0 0' };
  let uid = null, on = false, sel = null, editingEl = null, undo = [], cyc = { x: -99, y: -99, i: 0 }, drag = null;

  /* ---------------- helpers ---------------- */
  const pathOf = (el, pg) => { const p = []; while (el && el !== pg) { const par = el.parentElement; p.unshift([...par.children].indexOf(el)); el = par; } return p; };
  const byPath = (pg, path) => { let e = pg; for (const i of path) e = e && e.children[i]; return e || null; };
  const isPhoto = e => e.tagName === 'IMG' ? /^data:image\/(jpeg|png|webp)/.test(e.getAttribute('src') || '') : /url\(["']?data:image\/(jpeg|png|webp)/.test(e.getAttribute('style') || '');
  const isText = e => !/^(SCRIPT|STYLE|IMG|SVG|BR)$/i.test(e.tagName) && [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 0);
  // A photo is usually wrapped in a frame (arch / rounded / mat) that clips it. Editing must act on that frame, not only on the picture inside.
  function photoFrame(el, pg) {
    let cur = el;
    for (let i = 0; i < 4; i++) {
      const par = cur.parentElement; if (!par || par === pg || !pg.contains(par)) break;
      const a = cur.getBoundingClientRect(), b = par.getBoundingClientRect(), s = (pg.getBoundingClientRect().width / (pg.offsetWidth || 1)) || 1;
      const tol = 36 * s;
      if (Math.abs(b.width - a.width) > tol || Math.abs(b.height - a.height) > tol) break;
      if ([...par.querySelectorAll('*')].some(n => !cur.contains(n) && n !== cur && isText(n))) break;
      if ([...par.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) break;
      cur = par;
    }
    return cur;
  }
  const firstPhotoIn = el => (isPhoto(el) ? el : [...el.querySelectorAll('*')].find(isPhoto) || null);
  const rec = () => (EDITS[uid] = EDITS[uid] || {});
  const hex = c => { const m = /(\d+)[, ]+(\d+)[, ]+(\d+)/.exec(c || ''); return m ? '#' + [1, 2, 3].map(i => (+m[i]).toString(16).padStart(2, '0')).join('') : '#000000'; };
  function clean(node) {
    let out = '';
    node.childNodes.forEach(n => {
      if (n.nodeType === 3) out += n.textContent.replace(/&/g, '&amp;').replace(/</g, '&lt;');
      else if (n.nodeType === 1) {
        const t = n.tagName.toLowerCase();
        if (t === 'br') out += '<br>';
        else if (['i', 'b', 'em', 'strong'].includes(t)) out += `<${t}>${clean(n)}</${t}>`;
        else out += clean(n);
      }
    });
    return out;
  }
  const isEmpty = ed => !ed || !Object.keys(ed).some(k => ed[k] !== undefined && ed[k] !== null && ed[k] !== false && k !== 'kind' && !((k === 'dx' || k === 'dy') && ed[k] === 0) && !(k === 'fsMul' && ed[k] === 1));

  /* ---------------- apply one edit to one element (works on the preview and on the PDF pages) ---------------- */
  function applyEdit(el, ed, photoUrl) {
    let o = orig.get(el);
    if (!o) { o = { style: el.getAttribute('style') || '', html: el.innerHTML, htmlChanged: false }; orig.set(el, o); }
    const frame = ed.kind === 'photo' && !isPhoto(el), inner = frame ? firstPhotoIn(el) : null;
    const swap = (node, style) => {
      if (!photoUrl) return style;
      if (node.tagName === 'IMG') { node.setAttribute('src', photoUrl); return style; }
      return style.replace(/url\(["']?data:image[^"')]+["']?\)/, () => `url(${photoUrl})`);
    };
    let style = o.style;
    if (!frame) style = swap(el, style);
    el.setAttribute('style', style);
    if (inner) {
      let oi = orig.get(inner); if (!oi) { oi = { style: inner.getAttribute('style') || '', html: inner.innerHTML, htmlChanged: false }; orig.set(inner, oi); }
      inner.setAttribute('style', swap(inner, oi.style));
    }
    if (ed.html != null) { if (el.innerHTML !== ed.html) el.innerHTML = ed.html; o.htmlChanged = true; }
    else if (o.htmlChanged) { el.innerHTML = o.html; o.htmlChanged = false; }
    const cs = getComputedStyle(el), s = el.style;
    if (ed.fsMul && ed.fsMul !== 1) {
      s.fontSize = (parseFloat(cs.fontSize) * ed.fsMul) + 'px';
      if (/px$/.test(cs.lineHeight)) s.lineHeight = (parseFloat(cs.lineHeight) * ed.fsMul) + 'px';
    }
    if (ed.color) s.color = ed.color;
    if (ed.bold) s.fontWeight = '700';
    if (ed.w != null) { s.width = ed.w + 'px'; s.maxWidth = 'none'; s.minWidth = '0'; s.flex = 'none'; }
    if (ed.h != null) { s.height = ed.h + 'px'; s.maxHeight = 'none'; s.minHeight = '0'; }
    if (inner && (ed.w != null || ed.h != null)) {          // the picture follows its frame
      const is = inner.style; const wc = getComputedStyle(el); is.position = 'absolute'; is.left = wc.paddingLeft; is.top = wc.paddingTop; is.right = wc.paddingRight; is.bottom = wc.paddingBottom; is.width = 'auto'; is.height = 'auto'; is.maxWidth = 'none'; is.maxHeight = 'none'; is.margin = '0';
      if (getComputedStyle(el).position === 'static') s.position = 'relative';
      s.overflow = 'hidden';
    }
    if (ed.shape && SHAPES[ed.shape] != null) {
      s.borderRadius = SHAPES[ed.shape]; if (el.tagName !== 'IMG') s.overflow = 'hidden';
      if (inner) { inner.style.borderRadius = SHAPES[ed.shape]; if (inner.tagName !== 'IMG') inner.style.overflow = 'hidden'; }
    }
    if (ed.hide) s.visibility = 'hidden';
    if (ed.dx || ed.dy) {
      const m = getComputedStyle(el).transform;
      s.transform = `translate(${ed.dx || 0}px,${ed.dy || 0}px)` + (m && m !== 'none' ? ' ' + m : '');
    }
  }

  // called by the page builder: apply every stored edit of this template onto the freshly made pages
  async function applyAll(host, id, items) {
    const edits = EDITS[id]; if (!edits) return;
    for (const key of Object.keys(edits)) {
      const [pi, p] = key.split('|'), pg = host.children[+pi]; if (!pg) continue;
      const el = byPath(pg, p ? p.split('.').map(Number) : []); if (!el) continue;
      const ed = edits[key], it = ed.photo != null ? items[ed.photo] : null;
      applyEdit(el, ed, it && it.img);
    }
  }

  /* ---------------- live editing in the preview ---------------- */
  const pageOf = el => el.closest('.pvpage'), pgOf = pv => pv.firstElementChild;
  const scaleOf = pv => parseFloat(pv.dataset.s) || 1;
  const keyFor = (el, pv) => pv.dataset.i + '|' + pathOf(el, pgOf(pv)).join('.');
  const cur = () => (sel ? rec()[sel.key] : null);
  function snapshot() { undo.push(JSON.stringify(EDITS[uid] || {})); if (undo.length > 60) undo.shift(); }
  function setEdit(patch, live = true, quiet = false) {
    if (!sel) return;
    if (sel.photo) patch = Object.assign({ kind: 'photo' }, patch);
    const all = rec(), ed = Object.assign({}, all[sel.key] || {}, patch);
    if (isEmpty(ed)) delete all[sel.key]; else all[sel.key] = ed;
    if (live) { applyEdit(sel.el, ed, patch.photo != null || ed.photo != null ? currentPhotoUrl(ed) : null); refit(sel.inner || sel.el); }
    place(); if (!quiet) drawPanel();
  }
  const currentPhotoUrl = ed => { const items = (window.ODOP_FIT && window.ODOP_FIT.items()) || []; return ed.photo != null && items[ed.photo] ? items[ed.photo].img : null; };

  // keep a resized photo box sharp and uncropped: cut the picture again for its new shape
  async function refit(el) {
    if (!isPhoto(el) || !window.ODOP_FIT) return;
    const url = el.tagName === 'IMG' ? el.getAttribute('src') : ((/url\(["']?(data:image[^"')]+)/.exec(el.getAttribute('style') || '') || [])[1]);
    const meta = url && window.ODOP_FIT.meta.get(url); if (!meta) return;
    const r = el.getBoundingClientRect(); if (r.width < 20 || r.height < 20) return;
    const nu = await window.ODOP_FIT.fitImg(meta.src, meta.fit, r.width / r.height);
    if (nu === url) return;
    if (el.tagName === 'IMG') el.setAttribute('src', nu); else el.setAttribute('style', el.getAttribute('style').split(url).join(nu));
    const o = orig.get(el); if (o) o.style = o.style.split(url).join(nu);
  }

  /* ---------------- selection box, handles, hover ---------------- */
  let box = null, hov = null;
  function ensureBox(pv) {
    if (box && box.parentElement === pv) return;
    killBox();
    box = document.createElement('div'); box.className = 'dz-sel';
    box.innerHTML = '<i data-h="nw"></i><i data-h="ne"></i><i data-h="sw"></i><i data-h="se"></i>';
    pv.appendChild(box);
  }
  function killBox() { if (box) box.remove(); box = null; }
  function place() {
    if (!sel || !box) return;
    const r = sel.el.getBoundingClientRect(), p = pageOf(sel.el).getBoundingClientRect();
    Object.assign(box.style, { left: (r.left - p.left) + 'px', top: (r.top - p.top) + 'px', width: r.width + 'px', height: r.height + 'px' });
    box.classList.toggle('noedit', !!editingEl);
    positionBar();
  }
  function candidatesAt(x, y, pv) {
    const pg = pgOf(pv);
    return document.elementsFromPoint(x, y).filter(e => e !== pg && pg.contains(e) && (isPhoto(e) || isText(e)) && e.getBoundingClientRect().width > 4);
  }
  function select(el, pv, keepLayers) {
    stopText();
    if (el) { const photo = isPhoto(el), t = photo ? photoFrame(el, pgOf(pv)) : el; sel = { el: t, inner: photo ? el : null, photo, pv, key: keyFor(t, pv) }; }
    else sel = null;
    if (!keepLayers) layers = [];
    if (sel) { ensureBox(pv); box.style.display = 'block'; place(); updateBase(); } else killBox();
    drawPanel();
  }
  function showHover(el, pv) {
    if (!hov) { hov = document.createElement('div'); hov.className = 'dz-hov'; }
    if (!el || (sel && (sel.el === el || sel.inner === el))) { hov.remove(); return; }
    if (hov.parentElement !== pv) pv.appendChild(hov);
    if (isPhoto(el)) el = photoFrame(el, pgOf(pv));
    const r = el.getBoundingClientRect(), p = pv.getBoundingClientRect();
    Object.assign(hov.style, { left: (r.left - p.left) + 'px', top: (r.top - p.top) + 'px', width: r.width + 'px', height: r.height + 'px' });
  }

  /* ---------------- pointer handling ---------------- */
  function host() { return $('previewHost'); }
  function onDown(e) {
    if (!on) return;
    const pv = e.target.closest && e.target.closest('.pvpage'); if (!pv) return;
    if (editingEl && editingEl.contains(e.target)) return;
    const h = e.target.dataset && e.target.dataset.h;
    if (h && sel) { snapshot(); startDrag(e, 'resize:' + h); return; }
    if (e.target === box) { snapshot(); startDrag(e, 'move'); return; }
    const list = candidatesAt(e.clientX, e.clientY, pv); if (!list.length) { select(null); return; }
    const same = Math.abs(e.clientX - cyc.x) < 4 && Math.abs(e.clientY - cyc.y) < 4;
    cyc.i = same ? (cyc.i + 1) % list.length : 0; cyc.x = e.clientX; cyc.y = e.clientY;
    layers = list; select(list[cyc.i], pv, true);
    snapshot(); startDrag(e, 'move', true);
    e.preventDefault();
  }
  function startDrag(e, mode, fromPage) {
    if (!sel) return;
    const ed = cur() || {}, r = sel.el.getBoundingClientRect(), s = scaleOf(sel.pv);
    drag = { mode, x: e.clientX, y: e.clientY, dx: ed.dx || 0, dy: ed.dy || 0, w: r.width / s, h: r.height / s, s, moved: false, onBox: e.target === box };
    window.addEventListener('pointermove', onMove); window.addEventListener('pointerup', onUp, { once: true });
    e.preventDefault();
  }
  function onMove(e) {
    if (!drag || !sel) return;
    const ddx = (e.clientX - drag.x) / drag.s, ddy = (e.clientY - drag.y) / drag.s;
    if (Math.abs(ddx) + Math.abs(ddy) > 0.5) drag.moved = true;
    if (drag.mode === 'move') setEdit({ dx: Math.round(drag.dx + ddx), dy: Math.round(drag.dy + ddy) });
    else {
      const h = drag.mode.split(':')[1], lock = e.shiftKey, ratio = drag.w / drag.h;
      let w = drag.w + (h.includes('e') ? ddx : -ddx), hh = drag.h + (h.includes('s') ? ddy : -ddy);
      w = Math.max(24, w); hh = Math.max(24, hh);
      if (lock) hh = w / ratio;
      const dx = drag.dx + (h.includes('w') ? drag.w - w : 0), dy = drag.dy + (h.includes('n') ? drag.h - hh : 0);
      setEdit({ w: Math.round(w), h: Math.round(hh), dx: Math.round(dx), dy: Math.round(dy) });
    }
  }
  function onUp(e) {
    window.removeEventListener('pointermove', onMove);
    const d = drag; drag = null;
    if (d && !d.moved) {
      undo.pop();
      // a plain click on the selection box: pick the next thing underneath
      if (d.onBox && sel) { const pv = sel.pv; box.style.pointerEvents = 'none';
        const list = candidatesAt(e.clientX, e.clientY, pv), at = list.indexOf(sel.inner || sel.el);
        box.style.pointerEvents = ''; layers = list; if (list.length > 1) select(list[(at + 1) % list.length], pv, true); }
    } else refitSel().then(updateBase);
  }
  const refitSel = () => (sel ? refit(sel.inner || sel.el).then(place) : Promise.resolve());
  function onHover(e) {
    if (!on || drag || editingEl) return;
    const pv = e.target.closest && e.target.closest('.pvpage'); if (!pv) { showHover(null); return; }
    const list = candidatesAt(e.clientX, e.clientY, pv); showHover(list[0] || null, pv);
  }
  function onDbl(e) { if (!on || !sel) return; if (!sel.photo && isText(sel.el) && sel.el.contains(e.target)) startText(); }
  function onKey(e) {
    if (editingEl && e.key === 'Escape') { stopText(); return; }
    if (!on || !sel || editingEl || /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement && document.activeElement.tagName)) return;
    const st = e.shiftKey ? 10 : 1, d = { ArrowLeft: [-st, 0], ArrowRight: [st, 0], ArrowUp: [0, -st], ArrowDown: [0, st] }[e.key];
    if (d) { e.preventDefault(); snapshot(); const ed = cur() || {}; setEdit({ dx: (ed.dx || 0) + d[0], dy: (ed.dy || 0) + d[1] }); }
    else if (e.key === 'Escape') select(null);
    else if (e.key === 'Delete') { e.preventDefault(); snapshot(); setEdit({ hide: true }); }
  }

  /* ---------------- text editing ---------------- */
  function startText() {
    if (!sel || !isText(sel.el)) return;
    editingEl = sel.el; editingEl.contentEditable = 'true'; editingEl.style.outline = 'none'; editingEl.focus();
    const r = document.createRange(); r.selectNodeContents(editingEl); const sl = getSelection(); sl.removeAllRanges(); sl.addRange(r);
    editingEl.addEventListener('blur', stopText, { once: true }); place(); drawPanel();
  }
  function stopText() {
    if (!editingEl) return;
    const el = editingEl; editingEl = null; el.contentEditable = 'false'; el.style.outline = '';
    const html = clean(el), o = orig.get(el);
    if (!o || html !== clean({ childNodes: new DOMParser().parseFromString('<body>' + o.html + '</body>', 'text/html').body.childNodes })) {
      snapshot(); const all = rec(), key = sel ? sel.key : null;
      if (key) { all[key] = Object.assign({}, all[key] || {}, { html }); }
    }
    if (sel) { place(); drawPanel(); }
  }

  /* ---------------- top panel (always visible while scrolling) ---------------- */
  function panel() {
    let p = $('editPanel'); if (p) return p;
    p = document.createElement('div'); p.id = 'editPanel'; p.className = 'editpanel hidden';
    $('pageInfo').insertAdjacentElement('beforebegin', p); return p;
  }
  const labelOf = el => isPhoto(el) ? 'Photo' : 'Text: ' + (el.textContent.trim().slice(0, 16) || '…');
  const safe = t => String(t).replace(/</g, '&lt;');
  function drawPanel() {
    const p = panel(); p.classList.toggle('hidden', !on); if (!on) { drawBar(); return; }
    p.innerHTML = '<div class="ep-line"><b>✏️ Edit design</b><span class="ep-hint">' +
      (sel ? 'Selected: <b>' + safe(sel.photo ? 'Photo' : labelOf(sel.el)) + '</b>. Use the small toolbar next to it, or drag it on the page.' : 'Click a photo or a text on the page to edit it.') + '</span></div>' +
      '<div class="ep-line"><button type="button" data-act="undo" ' + (undo.length ? '' : 'disabled') + '>↶ Undo</button><button type="button" data-act="resetall">Reset all</button><button type="button" data-act="done" class="done">✔ Done</button></div>';
    drawBar();
  }
  function onPanel(e) {
    const b = e.target.closest('button'); if (!b) return;
    if (editingEl) stopText();
    if (b.dataset.act === 'undo') { if (undo.length) { EDITS[uid] = JSON.parse(undo.pop()); rerender(); } }
    else if (b.dataset.act === 'resetall') { if (confirm('Remove all edits made to this design?')) { snapshot(); delete EDITS[uid]; rerender(); } }
    else if (b.dataset.act === 'done') setMode(false);
  }

  /* ---------------- floating toolbar next to the selection ---------------- */
  let bar = null, layers = [], base = null;
  function ensureBar() {
    if (bar) return bar;
    bar = document.createElement('div'); bar.className = 'dz-bar'; bar.style.display = 'none'; document.body.appendChild(bar);
    ['pointerdown', 'mousedown'].forEach(t => bar.addEventListener(t, ev => {
      if (!/^(INPUT|SELECT)$/.test(ev.target.tagName)) ev.preventDefault();
      ev.stopPropagation();
      if (ev.target.id === 'bSize' && t === 'pointerdown') snapshot();
    }));
    bar.addEventListener('click', onBar); bar.addEventListener('input', onBarInput); bar.addEventListener('change', onBarChange);
    const pos = () => positionBar(); window.addEventListener('scroll', pos, true); window.addEventListener('resize', pos);
    return bar;
  }
  function updateBase() {
    if (!sel) { base = null; return; }
    const r = sel.el.getBoundingClientRect(), s = scaleOf(sel.pv), ed = cur() || {};
    base = { w: r.width / s, h: r.height / s, dx: ed.dx || 0, dy: ed.dy || 0 };
  }
  const SHP = [['original', 'Original shape'], ['square', 'Square corners'], ['rounded', 'Rounded corners'], ['circle', 'Circle'], ['arch', 'Arch']];
  function drawBar() {
    ensureBar();
    if (!on || !sel) { bar.style.display = 'none'; return; }
    const ed = cur() || {}, items = (window.ODOP_FIT && window.ODOP_FIT.items()) || [], photo = sel.photo;
    let h = '';
    if (layers.length > 1) h += '<div class="bar-row bar-layers"><span>Here:</span>' + layers.map((l, i) => '<button type="button" data-layer="' + i + '" class="' + (l === (sel.inner || sel.el) ? 'on' : '') + '">' + safe(labelOf(l)) + '</button>').join('') + '</div>';
    if (photo) {
      h += '<div class="bar-row"><span>Shape</span>' + SHP.map(([k, t]) => '<button type="button" class="shp shp-' + k + ' ' + ((ed.shape || 'original') === k ? 'on' : '') + '" data-shape="' + k + '" title="' + t + '"><i></i></button>').join('') + '</div>' +
        '<div class="bar-row"><span>Size</span><input type="range" id="bSize" min="30" max="200" value="100" title="Make the photo smaller or bigger"><em id="bSizeV">100%</em></div>' +
        '<div class="bar-row"><span>Photo</span><select id="bPhoto" title="Use another photo here"><option value="">Keep this photo</option>' +
        items.map((it, i) => '<option value="' + i + '" ' + (ed.photo === i ? 'selected' : '') + '>Variant ' + (i + 1) + ': ' + safe((it.name || '').slice(0, 28)) + '</option>').join('') + '</select></div>';
    } else {
      h += '<div class="bar-row"><button type="button" data-act="edittext" class="wide">' + (editingEl ? 'Typing… click outside to finish' : '✎ Edit text') + '</button></div>' +
        '<div class="bar-row"><span>Text</span><button type="button" data-fs="0.9" title="Smaller text">A&minus;</button><button type="button" data-fs="1.1" title="Bigger text">A+</button>' +
        '<button type="button" data-act="bold" class="' + (ed.bold ? 'on' : '') + '" title="Bold"><b>B</b></button><input type="color" id="bColor" value="' + (ed.color || hex(getComputedStyle(sel.el).color)) + '" title="Text colour"></div>' +
        '<div class="bar-row"><span>Width</span><input type="range" id="bSize" min="40" max="200" value="100" title="Make the text box narrower or wider"><em id="bSizeV">100%</em></div>';
    }
    h += '<div class="bar-row bar-end"><button type="button" data-act="hide">' + (ed.hide ? 'Show again' : 'Hide') + '</button><button type="button" data-act="resetone">Reset this</button><button type="button" data-act="close" title="Deselect">✕</button></div>';
    bar.innerHTML = h; bar.style.display = 'block'; positionBar();
  }
  function positionBar() {
    if (!bar || bar.style.display === 'none' || !sel) return;
    const r = sel.el.getBoundingClientRect(), pvr = ($('previewHost').closest('.box.pv') || document.body).getBoundingClientRect();
    bar.style.visibility = (r.bottom > pvr.top + 40 && r.top < pvr.bottom - 10) ? 'visible' : 'hidden';
    const bw = bar.offsetWidth, bh = bar.offsetHeight, W = innerWidth, H = innerHeight;
    let top = r.top - bh - 10; if (top < 8) top = r.bottom + 10;
    if (top + bh > H - 8) top = Math.max(8, Math.min(H - bh - 8, r.top + 10));
    let left = r.left + r.width / 2 - bw / 2; left = Math.max(8, Math.min(W - bw - 8, left));
    bar.style.top = top + 'px'; bar.style.left = left + 'px';
  }
  function onBar(ev) {
    const b = ev.target.closest('button'); if (!b || !sel) return;
    const ed = cur() || {}, d = b.dataset;
    if (d.layer != null) { const el = layers[+d.layer]; if (el) { stopText(); select(el, sel.pv, true); } return; }
    if (editingEl && d.act !== 'edittext') stopText();
    if (d.shape) {
      snapshot(); const p = { shape: d.shape === 'original' ? undefined : d.shape };
      if (d.shape === 'circle') {
        const r = sel.el.getBoundingClientRect(), s = scaleOf(sel.pv), m = Math.round(Math.min(r.width, r.height) / s);
        Object.assign(p, { w: m, h: m, dx: (ed.dx || 0) + Math.round((r.width / s - m) / 2), dy: (ed.dy || 0) + Math.round((r.height / s - m) / 2) });
      }
      setEdit(p); refitSel().then(updateBase);
    }
    else if (d.fs) { snapshot(); setEdit({ fsMul: Math.round((ed.fsMul || 1) * +d.fs * 100) / 100 }); }
    else if (d.act === 'edittext') startText();
    else if (d.act === 'bold') { snapshot(); setEdit({ bold: !ed.bold }); }
    else if (d.act === 'hide') { snapshot(); setEdit({ hide: !ed.hide }); }
    else if (d.act === 'resetone') { snapshot(); delete rec()[sel.key]; rerender(); }
    else if (d.act === 'close') select(null);
  }
  function onBarInput(ev) {
    if (ev.target.id !== 'bSize' || !sel || !base) return;
    const v = +ev.target.value / 100, photo = sel.photo; $('bSizeV').textContent = ev.target.value + '%';
    const w = Math.max(24, Math.round(base.w * v)), h = Math.max(24, Math.round(base.h * v));
    setEdit(photo ? { w, h, dx: Math.round(base.dx - (w - base.w) / 2), dy: Math.round(base.dy - (h - base.h) / 2) } : { w, dx: Math.round(base.dx - (w - base.w) / 2) }, true, true);
  }
  function onBarChange(ev) {
    if (!sel) return;
    if (ev.target.id === 'bPhoto') { snapshot(); setEdit({ photo: ev.target.value === '' ? undefined : +ev.target.value }); refitSel(); }
    else if (ev.target.id === 'bColor') { snapshot(); setEdit({ color: ev.target.value }); }
    else if (ev.target.id === 'bSize') { refitSel(); }
  }
  const rerender = () => { select(null); drawPanel(); window.renderPreview && window.renderPreview(true); };

  /* ---------------- mode switch ---------------- */
  function setMode(v) {
    on = !!v; stopText(); select(null); showHover(null); layers = [];
    host().classList.toggle('editing', on);
    const b = $('btnEdit'); if (b) { b.classList.toggle('on', on); b.textContent = on ? '✔ Editing' : '✏️ Edit design'; }
    drawPanel();
  }
  function init() {
    const acts = document.querySelector('.box.pv .actions'); if (!acts || $('btnEdit')) return;
    const b = document.createElement('button'); b.id = 'btnEdit'; b.type = 'button'; b.className = 'btn2'; b.textContent = '✏️ Edit design';
    b.addEventListener('click', () => { if (b.disabled) return; if (!host().children.length) { window.renderPreview && window.renderPreview(true).then(() => setMode(true)); } else setMode(!on); });
    acts.appendChild(b);
    const h = host();
    h.addEventListener('pointerdown', onDown); h.addEventListener('pointermove', onHover); h.addEventListener('dblclick', onDbl);
    h.addEventListener('pointerleave', () => showHover(null));
    window.addEventListener('keydown', onKey);
    panel().addEventListener('click', onPanel); panel().addEventListener('change', onPanelChange);
  }
  // called after the preview pages are drawn
  function onRendered(selTpl) {
    init();
    const classic = !selTpl || selTpl.uid === 'classic';
    if (uid !== (selTpl && selTpl.uid)) { undo = []; }
    uid = selTpl && selTpl.uid;
    const b = $('btnEdit'); if (b) { b.disabled = classic; b.title = classic ? 'Pick one of the template designs to edit it' : ''; }
    if (classic && on) setMode(false);
    killBox(); sel = null; editingEl = null; drag = null;
    host().classList.toggle('editing', on && !classic); drawPanel();
  }
  window.DesignEditor = { applyAll, onRendered, setMode };
})();
