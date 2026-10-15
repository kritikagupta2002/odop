/* Template picker, multi-page preview and PDF export for every template family.
   Families: simple (20), editorial (12), kotastone (3), stonecat (6)  +  the original "Classic" auto-changing design. */
(function () {
  const FAMS = [
    ['simple', window.CATALOGUE_TEMPLATES, 'Simple'],
    ['editorial', window.EDITORIAL_TEMPLATES, 'Editorial'],
    ['kotastone', window.KOTASTONE_TEMPLATES, 'Brochure'],
    ['stonecat', window.STONECAT_TEMPLATES, 'Trade']
  ];
  const REG = [{ uid: 'classic', fam: 'classic', name: 'Classic · changes design every time', cat: 'All', size: [794, 1123] }];
  let css = '';
  FAMS.forEach(([key, mod, label]) => {
    if (!mod) return;
    css += mod.css;
    mod.list.forEach(t => REG.push({ uid: key + ':' + t.id, fam: key, label, mod, t, name: t.name, cat: t.cat, size: t.size || [794, 1123], theme: t.theme }));
  });
  const st = document.createElement('style'); st.id = 'tplcss'; st.textContent = css; document.head.appendChild(st);
  window.TEMPLATE_REGISTRY = REG;

  let selected = null, manual = false, onlyMine = false;
  const CATS = ['Kota Doria', 'Kota Stone', 'Sandstone', 'Garlic'];
  const catOf = () => { const p = (getProduct() || '').toLowerCase(); return CATS.find(c => p.includes(c.toLowerCase())) || null; };
  const FAM_ORDER = ['kotastone', 'editorial', 'stonecat', 'simple'];
  const isStone = () => getCopy({ product: getProduct() || '' }).stone;
  const STONE_ONLY = r => r.fam === 'kotastone' || (r.fam === 'stonecat' && (r.t.fam === 'x1' || r.t.fam === 'x2'));
  const fits = r => r.uid === 'classic' || !STONE_ONLY(r) || isStone();
  // every template that suits the product; templates made for this product come first
  const recommended = () => { const c = catOf(); return REG.filter(r => r.uid !== 'classic' && fits(r) && (!onlyMine || !c || r.cat === c))
    .sort((x, y) => ((y.cat === c) - (x.cat === c)) || (FAM_ORDER.indexOf(x.fam) - FAM_ORDER.indexOf(y.fam))); };
  // the template with the chosen colour applied (or its own colours)
  const themed = r => (window.TplColor && r.t && r.t.theme) ? Object.assign({}, r.t, { theme: window.recolorTheme(r.t.theme, window.TplColor) }) : (r.t || null);
  const byUid = uid => REG.find(r => r.uid === uid);

  /* ---------------- photos: every photo is made square-safe (never badly cropped) ---------------- */
  const sqCache = new Map(), fitMeta = new Map(); let lastItems = [];
  window.ODOP_FIT = { meta: fitMeta, items: () => lastItems, get fitImg(){ return fitImg; } };
  // Makes the photo exactly fit a box of aspect ratio ar (width/height): filled when the photo is close to it, otherwise whole photo over a soft blurred backdrop.
  async function fitImg(src, fit, ar){
    ar = ar || 1; const key = src.length + ':' + src.slice(-40) + ':' + (fit || 'auto') + ':' + ar.toFixed(2);
    if (sqCache.has(key)) return sqCache.get(key);
    const im = await ensureImg(src), iw = im.naturalWidth, ih = im.naturalHeight, pa = iw / ih, L = Math.min(1500, Math.max(1000, Math.max(iw, ih)));
    const W = Math.round(ar >= 1 ? L : L * ar), H = Math.round(ar >= 1 ? L / ar : L);
    const mode = fit === 'fill' ? 'fill' : fit === 'full' ? 'full' : (Math.abs(Math.log(pa / ar)) < .5 ? 'fill' : 'full');
    const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d'); x.imageSmoothingQuality = 'high';
    if (mode === 'fill'){ const s = Math.max(W / iw, H / ih); x.drawImage(im, (W - iw * s) / 2, (H - ih * s) / 2, iw * s, ih * s); }
    else {
      const sm = document.createElement('canvas'), k = 24 / Math.min(iw, ih); sm.width = Math.max(2, Math.round(iw * k)); sm.height = Math.max(2, Math.round(ih * k));
      sm.getContext('2d').drawImage(im, 0, 0, sm.width, sm.height);
      const mw = 160, mh = Math.max(40, Math.round(160 / ar)), mid = document.createElement('canvas'); mid.width = mw; mid.height = mh; const mx = mid.getContext('2d'); mx.imageSmoothingQuality = 'high';
      const cv = Math.max(mw / sm.width, mh / sm.height); mx.drawImage(sm, (mw - sm.width * cv) / 2, (mh - sm.height * cv) / 2, sm.width * cv, sm.height * cv);
      x.drawImage(mid, 0, 0, W, H); x.fillStyle = 'rgba(255,255,255,.2)'; x.fillRect(0, 0, W, H);
      const s = Math.min(W * .96 / iw, H * .96 / ih); x.drawImage(im, (W - iw * s) / 2, (H - ih * s) / 2, iw * s, ih * s);
    }
    const url = c.toDataURL('image/jpeg', .94); sqCache.set(key, url); fitMeta.set(url, { src, fit });
    if (sqCache.size > 80) sqCache.delete(sqCache.keys().next().value);
    return url;
  }
  const squareImg = (src, fit) => fitImg(src, fit, 1);
  async function prepareItems(){
    const out = [];
    const list = liveMode ? variants.filter(v => v.orig) : variants;
    for (let k = 0; k < list.length; k++){
      const v = list[k], src = v.enh && v.useEnh ? v.enh : v.orig;
      out.push({ name: v.name || ('Product ' + (k + 1)), size: v.size, material: v.material, colour: v.colour, price: v.price, moq: v.moq,
        code: v.code || undefined, finish: v.finish || undefined, thickness: v.thickness || undefined, img: src ? await squareImg(src, v.fit) : '', _src: src || '', _fit: v.fit });
    }
    out.forEach(it => { if (it.img && it._src) fitMeta.set(it.img, { src: it._src, fit: it._fit }); });
    if (!liveMode || true) lastItems = out;
    return out;
  }
  // After a template has made its pages, every photo box that is not square gets a picture cut for its own shape, so nothing important is cropped away.
  async function fitPages(pages, items, uid){
    const bySq = new Map(items.filter(i => i.img && i._src).map(i => [i.img, i]));
    if (!bySq.size) return pages;
    const host = document.createElement('div'); host.style.cssText = 'position:fixed;left:-99999px;top:0;visibility:hidden;pointer-events:none';
    host.innerHTML = pages.join(''); document.body.appendChild(host);
    try {
      if (uid && window.DesignEditor) await window.DesignEditor.applyAll(host, uid, items);
      for (const pg of host.querySelectorAll(':scope > .pg')){
        for (const e of pg.querySelectorAll('*')){
          let url = '', isImg = e.tagName === 'IMG' && e.classList && !e.classList.contains('qrimg');
          if (isImg) url = e.getAttribute('src') || '';
          else { const m = /url\(["']?(data:image[^"')]+)["']?\)/.exec(e.getAttribute('style') || ''); url = m ? m[1] : ''; }
          const it = url && bySq.get(url); if (!it) continue;
          const b = e.getBoundingClientRect(); if (b.width < 60 || b.height < 60) continue;
          const ar = b.width / b.height; if (Math.abs(Math.log(ar)) < .12) continue;
          const nu = await fitImg(it._src, it._fit, ar);
          if (isImg) e.setAttribute('src', nu); else e.setAttribute('style', e.getAttribute('style').split(url).join(nu));
        }
      }
      return [...host.children].map(p => p.outerHTML);
    } finally { host.remove(); }
  }
  const hasPhotos = () => variants.some(v => v.orig);

  /* ---------------- build the pages of the chosen template ---------------- */
  function qrOf(url){ try { return qrDataUrl(url); } catch (e) { return ''; } }
  function textOverrides(){
    const lines = id => ($(id) ? $(id).value.split('\n').map(x => x.trim()).filter(Boolean) : []);
    const ov = {}, tg = $('txTagline') && $('txTagline').value.trim(); if (tg) ov.tagline = tg;
    const why = lines('txWhy'); if (why.length) ov.why = why.slice(0, 6);
    const apps = lines('txApps'); if (apps.length) ov.apps = apps.slice(0, 5);
    const vals = lines('txValues').map(l => { const k = l.indexOf(':'); return k > 0 ? [l.slice(0, k).trim(), l.slice(k + 1).trim()] : [l, '']; });
    if (vals.length === 3) ov.values = vals;
    return ov;
  }
  function makeCtx(info, items, withQr){
    const qrs = [], copy = getCopy({ ent: info.ent, district: info.district, product: info.product }, textOverrides());
    if (withQr){
      const pfLabel = { wa: 'WhatsApp', fb: 'Facebook', ig: 'Instagram' }[info.platform];
      if (info.link) qrs.push({ label: pfLabel, img: qrOf(info.link) });
      info.socials.forEach(s => { if (!qrs.some(q => q.label === s[0]) && s[0] !== 'YouTube') qrs.push({ label: s[0], img: qrOf(s[1]) }); });
      const loc = ($('locLink') && $('locLink').value.trim()); if (/^https?:\/\//.test(loc || '')) qrs.push({ label: 'Location', img: qrOf(loc) });
    }
    return { info, items, copy, qr: withQr && info.link ? qrOf(info.link) : '', qrs: qrs.slice(0, 4), pf: PF[info.platform], socialLabel };
  }
  /* ---------------- last page: one QR code for every link the customer entered ---------------- */
  function qrPage(info, sel){
    const pf = { wa: 'WhatsApp', fb: 'Facebook', ig: 'Instagram' }[info.platform], list = [];
    const add = (label, url, note) => { if (/^https?:\/\//i.test(url || '') && !list.some(q => q.url === url)) { const img = qrOf(url); if (img) list.push({ label, url, img, note }); } };
    add(pf + (info.platform === 'wa' ? ' Business' : ''), info.link, 'Our new business account');
    info.socials.forEach(sc => add(sc[0], sc[1], sc[0] === 'Website' ? 'Visit our website' : 'Follow us'));
    const loc = $('locLink') && $('locLink').value.trim(); add('Location', loc, 'Find us on the map');
    if (!list.length) return '';
    const th = (window.TplColor && sel.theme ? window.recolorTheme(sel.theme, window.TplColor) : sel.theme) || {}, bg = th.bg || '#fbfaf7', ink = th.ink || '#1f2433', acc = th.acc || th.accent || th.gold || '#2c3e91', [pw, ph] = sel.size, land = pw > ph;
    const n = list.length, gap = land ? 22 : 30, per = land ? Math.min(n, 3) : (n <= 2 ? n : n <= 4 ? 2 : 3), rows = Math.ceil(n / per);
    const availW = pw - 112, availH = ph - (land ? 225 : 330) - (land ? 85 : 90);
    const q = Math.floor(Math.max(110, Math.min(300, (availW - (per - 1) * gap) / per - 44, (availH - (rows - 1) * gap) / rows - 92))), cardW = q + 44;
    const dark = (() => { const m = /^#?([0-9a-f]{6})$/i.exec(bg); if (!m) return false; const v = parseInt(m[1], 16); return ((v >> 16) * .3 + ((v >> 8) & 255) * .59 + (v & 255) * .11) < 110; })();
    const mut = dark ? 'rgba(255,255,255,.7)' : 'rgba(0,0,0,.55)';
    const cards = list.map(c => `<div class="soc" data-url="${esc(c.url)}" style="width:${cardW}px;background:#fff;border-radius:14px;padding:22px 22px 18px;text-align:center;box-sizing:border-box">
        <img class="qrx" src="${c.img}" alt="" style="display:block;width:${q}px;height:${q}px;margin:0 auto">
        <div style="font:600 ${q > 240 ? 20 : 17}px/1.2 Montserrat,sans-serif;color:#1f2433;margin-top:14px;letter-spacing:.3px">${esc(c.label)}</div>
        <div style="font:400 12px/1.4 Montserrat,sans-serif;color:#6b7280;margin-top:4px">${esc(c.note)}</div></div>`).join('');
    const contact = [info.mobile ? '+91 ' + info.mobile : '', info.email, info.addr].filter(Boolean).map(esc).join('  ·  ');
    return `<div class="pg" style="width:${pw}px;height:${ph}px;position:relative;overflow:hidden;background:${bg};color:${ink};font-family:Montserrat,sans-serif;box-sizing:border-box">
      <div style="position:absolute;left:0;top:0;right:0;height:10px;background:${acc}"></div>
      <div style="padding:${land ? 44 : 78}px 56px 0;text-align:center">
        <div style="font:600 12px/1 Montserrat,sans-serif;letter-spacing:5px;text-transform:uppercase;color:${acc}">Scan &amp; connect</div>
        <div style="font:600 ${land ? 34 : 44}px/1.15 'Cormorant Garamond',serif;margin-top:${land ? 12 : 18}px">${esc(info.ent)}</div>
        <div style="width:56px;height:2px;background:${acc};margin:${land ? 12 : 18}px auto"></div>
        <div style="font:400 ${land ? 13 : 15}px/1.6 Montserrat,sans-serif;color:${mut};max-width:560px;margin:0 auto">Point your phone camera at a code to open our page, see more of our products and place an order.</div>
      </div>
      <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:${gap}px;width:${per * cardW + (per - 1) * gap}px;margin:${land ? 26 : 44}px auto 0">${cards}</div>
      <div style="position:absolute;left:56px;right:56px;bottom:${land ? 22 : 40}px;text-align:center;font:400 12px/1.5 Montserrat,sans-serif;color:${mut}">${contact}</div></div>`;
  }
  async function buildCatalogue(info, thumb){
    const sel = selected || byUid('classic');
    if (sel.uid === 'classic'){
      if (!design) rollDesign();
      const tmp = document.createElement('div'); tmp.innerHTML = buildPages(info, design);
      const cp = [...tmp.children].map(e => e.outerHTML); if (!thumb){ const qp = qrPage(info, sel); if (qp) cp.push(qp); }
      return { sel, pages: cp };
    }
    const items = await prepareItems();
    const pgs = sel.mod.render(themed(sel), makeCtx(info, items, !thumb));
    if (!thumb){ const qp = qrPage(info, sel); if (qp) pgs.push(qp); }
    return { sel, pages: await fitPages(pgs, items, thumb ? null : sel.uid) };
  }
  window.buildCatalogue = buildCatalogue;

  /* ---------------- multi-page preview ---------------- */
  // Live preview: follows every change in the form. It is forgiving (missing details get placeholders) so you can see the effect of each edit at once.
  let liveMode = false, renderSeq = 0, liveTimer = null, busy = false;
  function liveInfo(){
    const i = collect(); i.ent = i.ent || 'Your Company'; i.district = i.district || 'District'; i.product = i.product || 'Product';
    if (!i.mobile) i.mobile = '0000000000'; return i;
  }
  function scheduleLive(){
    clearTimeout(liveTimer);
    liveTimer = setTimeout(async () => {
      if (busy) return;
      if (!variants.some(v => v.orig)){ $('previewWrap').classList.add('hidden'); $('previewEmpty').classList.remove('hidden'); $('pageInfo').textContent = ''; return; }
      showErrors([]); try { await renderPreview(true); } catch (e) { console.error(e); }
    }, 350);
  }
  window.livePreview = scheduleLive;
  async function renderPreview(live){
    live = live === true; const seq = ++renderSeq; liveMode = live;
    let info;
    if (live) info = liveInfo();
    else { const v = validate(); showErrors(v.errors); if (v.errors.length) return false; info = v.info; }
    const { sel, pages } = await buildCatalogue(info);
    if (seq !== renderSeq) return false;
    const wrap = $('previewWrap'); wrap.classList.remove('hidden'); $('previewEmpty').classList.add('hidden');
    const W = Math.max(280, wrap.clientWidth - 32), [pw, ph] = sel.size, s = W / pw, sc = $('previewScaler');
    sc.style.transform = 'none'; sc.style.width = '100%'; sc.style.height = 'auto';
    const host = $('previewHost'); host.innerHTML = '';
    pages.forEach((h, k) => {
      const d = document.createElement('div'); d.className = 'pvpage'; d.dataset.i = k; d.dataset.s = s; d.style.cssText = `position:relative;width:${W}px;height:${ph * s}px;overflow:hidden;margin:0 0 12px;background:#fff`;
      d.innerHTML = h; const pg = d.firstElementChild; pg.style.cssText += `;position:absolute;left:0;top:0;margin:0;transform-origin:0 0;transform:scale(${s})`;
      const tag = document.createElement('div'); tag.className = 'pvtag'; tag.textContent = (k + 1) + ' / ' + pages.length; d.appendChild(tag);
      host.appendChild(d);
    });
    $('pageInfo').textContent = `${sel.name} · ${pages.length} pages`;
    if (window.DesignEditor) window.DesignEditor.onRendered(sel);
    const t = $('qrTest'); t.classList.toggle('hidden', !/^https?:\/\//.test(info.link || ''));
    t.innerHTML = `The QR will open: <a href="${esc(info.link)}" target="_blank" rel="noopener">${esc(info.link)}</a>. After downloading, scan the QR with a phone to check it.`;
    return true;
  }
  window.renderPreview = renderPreview;

  /* ---------------- PDF ---------------- */
  async function downloadPdf(){
    const { info, errors } = validate();
    showErrors(errors);
    if (errors.length) return;
    const btn = $('btnDownload'); btn.disabled = true; $('status').textContent = 'Creating PDF… please wait';
    try {
      busy = true; clearTimeout(liveTimer); await renderPreview(); await document.fonts.ready;
      const { sel, pages } = await buildCatalogue(info);
      const off = $('offscreen'); off.innerHTML = pages.join('');
      const els = [...off.querySelectorAll(':scope > .pg')];
      const { jsPDF } = window.jspdf, K = 25.4 / 96; let pdf = null;
      for (let i = 0; i < els.length; i++){
        $('status').textContent = `Creating PDF… page ${i + 1} of ${els.length}`;
        const el = els[i], w = el.offsetWidth, h = el.offsetHeight, o = w > h ? 'l' : 'p';
        const canvas = await html2canvas(el, { scale: els.length > 8 ? 2.6 : 3.2, useCORS: true, backgroundColor: '#ffffff', logging: false });
        if (!pdf) pdf = new jsPDF({ unit: 'mm', format: [w * K, h * K], orientation: o }); else pdf.addPage([w * K, h * K], o);
        pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, w * K, h * K);
        const pr = el.getBoundingClientRect();
        const link = (node, url) => { const r = node.getBoundingClientRect(); pdf.link((r.left - pr.left) * K, (r.top - pr.top) * K, r.width * K, r.height * K, { url }); };
        el.querySelectorAll('.qrimg').forEach(q => link(q, info.link));
        el.querySelectorAll('.soc').forEach(s => { if (s.dataset.url) link(s, s.dataset.url); });
      }
      off.innerHTML = '';
      downloadCount++;
      const fname = 'Catalogue_' + info.ent.replace(/[^\wऀ-ॿ]+/g, '_').slice(0, 40) + '_' + downloadCount + '.pdf';
      pdf.save(fname);
      if (window.ODOP_afterPdf) await window.ODOP_afterPdf(pdf.output('blob'));
      if (selected && selected.uid === 'classic') rollDesign();
      else if ($('tplSurprise') && $('tplSurprise').checked){ const pool = recommended().filter(r => r.uid !== selected.uid); if (pool.length) selected = pool[Math.floor(Math.random() * pool.length)]; drawPicker(); }
      await renderPreview();
      $('status').textContent = `✔ ${fname} downloaded (${els.length} pages).`;
    } catch (err) {
      console.error(err); $('status').textContent = 'Could not create the PDF: ' + err.message + ' (is the internet on? fonts and libraries must load)';
    } finally { btn.disabled = false; busy = false; }
  }
  $('btnDownload').addEventListener('click', downloadPdf);
  $('btnPreview').addEventListener('click', async () => {
    if (selected && selected.uid === 'classic') rollDesign();
    const ok = await renderPreview(); if (ok && window.innerWidth <= 1000) $('previewWrap').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  /* ---------------- template picker: categories first, designs open on click ---------------- */
  let openCat = null;
  const CAT_INFO = {
    mine:      ['', 'Designed for this product'],
    kotastone: ['Brochure style', 'Premium stone brochures with large photos'],
    editorial: ['Editorial lookbook', 'Magazine-style pages, soft and elegant'],
    stonecat:  ['Trade & export', 'Export catalogues, panel and mosaic layouts'],
    simple:    ['Simple & clean', 'Clear, easy layouts in many colours'],
    classic:   ['Classic', 'Auto-changing design']
  };
  function groups(){
    const list = recommended(), c = catOf(), g = [];
    if (c){ const m = list.filter(r => r.cat === c); if (m.length) g.push({ key: 'mine', title: 'Made for ' + c, sub: CAT_INFO.mine[1], items: m }); }
    ['kotastone', 'editorial', 'stonecat', 'simple'].forEach(f => {
      const it = list.filter(r => r.fam === f); if (it.length) g.push({ key: f, title: CAT_INFO[f][0], sub: CAT_INFO[f][1], items: it });
    });
    g.push({ key: 'classic', title: CAT_INFO.classic[0], sub: CAT_INFO.classic[1], items: [byUid('classic')] });
    return g;
  }
  function card(r, extra, title, sub){
    const th = window.TplColor && r.theme ? window.recolorTheme(r.theme, window.TplColor) : r.theme, dots = th ? [th.bg, th.acc || th.accent, th.dark || th.acc2 || th.gold || th.ink, th.ink].filter(Boolean) : ['#fff', '#2c3e91', '#e8873a', '#1f2433'];
    return `<div class="tc ${extra}" data-uid="${r.uid}"${title.k ? ` data-cat="${title.k}"` : ''}><div class="th" style="aspect-ratio:${r.size[0]}/${r.size[1]}"><div class="ph0">${dots.map(d => `<i style="background:${d}"></i>`).join('')}</div></div>
        <b>${esc(title.t)}</b><small>${esc(sub)}</small></div>`;
  }
  function drawPicker(){
    const box = $('tplGrid'); if (!box) return;
    const cat = catOf(), gs = groups();
    $('tplInfo').innerHTML = selected ? `Selected: <b>${esc(selected.name)}</b> <small>${selected.uid === 'classic' ? '' : esc(selected.label) + ' · ' + esc(selected.cat)}</small>` : '';
    if ($('tplMode')) $('tplMode').classList.add('hidden');
    const g = openCat && gs.find(x => x.key === openCat);
    if (!g){
      openCat = null;
      box.className = 'tgrid cats';
      box.innerHTML = gs.map(x => {
        const rep = (selected && x.items.find(r => r.uid === selected.uid)) || x.items[0], has = selected && x.items.some(r => r.uid === selected.uid);
        return card(rep, has ? 'on' : '', { t: x.title, k: x.key }, x.key === 'classic' ? x.sub : `${x.items.length} designs · ${x.sub}`);
      }).join('');
      box.querySelectorAll('.tc').forEach(el => el.addEventListener('click', () => {
        if (el.dataset.cat === 'classic'){ manual = true; selected = byUid('classic'); drawPicker(); scheduleLive(); return; }
        openCat = el.dataset.cat; drawPicker();
      }));
    } else {
      box.className = 'tgrid';
      box.innerHTML = `<div class="tback"><button class="btn2" type="button" id="tplBack">&larr; All categories</button><b>${esc(g.title)}</b><small>${g.items.length} designs</small></div>` +
        g.items.map(r => card(r, selected && selected.uid === r.uid ? 'on' : '', { t: r.name }, r.label + (r.size[0] > r.size[1] ? ' · landscape' : ''))).join('');
      $('tplBack').onclick = () => { openCat = null; drawPicker(); };
      box.querySelectorAll('.tc').forEach(el => el.addEventListener('click', () => { manual = true; selected = byUid(el.dataset.uid); drawPicker(); scheduleLive(); }));
    }
    lazyThumbs();
  }
  let thumbObs = null;
  function lazyThumbs(){
    if (thumbObs) thumbObs.disconnect();
    if (!hasPhotos() || !('IntersectionObserver' in window)) return;
    thumbObs = new IntersectionObserver(async es => {
      for (const e of es){
        if (!e.isIntersecting) continue; thumbObs.unobserve(e.target);
        const card = e.target, r = byUid(card.dataset.uid), th = card.querySelector('.th');
        try {
          const info = Object.assign(collect(), { ent: ($('entName').value.trim() || 'Your Company'), district: getDistrict() || 'District', product: getProduct() || 'Product' });
          let html;
          if (r.uid === 'classic'){ const tmp = document.createElement('div'); tmp.innerHTML = buildPages(info, design || rollDesign()); html = tmp.firstElementChild.outerHTML; }
          else { const its = await prepareItems(); html = (await fitPages([r.mod.render(themed(r), makeCtx(info, its, false))[0]], its))[0]; }
          const w = th.clientWidth, s = w / r.size[0]; th.innerHTML = ''; th.style.height = (r.size[1] * s) + 'px'; th.style.position = 'relative'; th.style.overflow = 'hidden';
          const d = document.createElement('div'); d.innerHTML = html; const pg = d.firstElementChild; pg.style.cssText += `;position:absolute;left:0;top:0;margin:0;transform-origin:0 0;transform:scale(${s})`; th.appendChild(pg);
        } catch (err) { /* keep the colour dots */ }
      }
    }, { rootMargin: '200px' });
    document.querySelectorAll('#tplGrid .tc').forEach(el => thumbObs.observe(el));
  }
  function autoSelect(){
    if (manual && selected) return;
    const rec = recommended(); selected = rec[0] || byUid('classic');
  }
  const dirty = {};
  function fillTextDefaults(force){
    const c = getCopy({ ent: ($('entName').value || '').trim(), district: getDistrict(), product: getProduct() });
    const set = (id, val) => { const el = $(id); if (!el) return; if (force || !dirty[id]) { el.value = val; dirty[id] = false; } };
    set('txTagline', c.tagline); set('txWhy', c.why.join('\n')); set('txApps', c.apps.join('\n')); set('txValues', c.values.map(v => v[0] + ': ' + v[1]).join('\n'));
  }
  ['txTagline', 'txWhy', 'txApps', 'txValues'].forEach(id => $(id) && $(id).addEventListener('input', () => { dirty[id] = true; }));
  $('txReset') && $('txReset').addEventListener('click', () => { fillTextDefaults(true); scheduleLive(); });
  ['entName', 'district'].forEach(id => $(id).addEventListener('change', () => fillTextDefaults(false)));
  function refresh(){ autoSelect(); fillTextDefaults(false); drawPicker(); }
  $('tplMode') && $('tplMode').addEventListener('click', () => { onlyMine = !onlyMine; drawPicker(); });
  $('product').addEventListener('change', () => { manual = false; openCat = null; refresh(); });
  $('district').addEventListener('change', () => setTimeout(() => { manual = false; refresh(); }, 0));
  $('btnRefreshThumbs') && $('btnRefreshThumbs').addEventListener('click', drawPicker);
  window.addEventListener('odop:colour', () => { drawPicker(); scheduleLive(); });
  const formCol = document.querySelector('.form-col');
  ['input', 'change'].forEach(ev => formCol.addEventListener(ev, e => { if (!e.target.closest('#tplGrid')) scheduleLive(); }));
  if (typeof window.renderVariants === 'function'){ const rv = window.renderVariants; window.renderVariants = function () { const r = rv.apply(this, arguments); scheduleLive(); return r; }; }
  window.refreshTemplatePicker = refresh;
  window.TemplateUI = {
    uid: () => (selected ? selected.uid : 'classic'),
    select: uid => { const r = byUid(uid); if (r) { manual = true; selected = r; openCat = null; drawPicker(); } }
  };
  refresh();
})();
