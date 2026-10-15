/* Three more catalogue families, made from export / trade catalogues:
   X1  "Export catalogue"  - landscape, index page, surface + edge finishes, one big page per product with formats and sizes
   X2  "Panel catalogue"   - minimal white, technical specification page, product-code grid, full-page product spreads
   X3  "Swatch mosaic"     - cover mosaic, about + why choose us, section page, labelled swatch mosaics, specification + contact
   Page count follows the number of products.                                                                      */
(function () {
  const E = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const cap = s => (s || '').toUpperCase();
  const pn = n => String(n).padStart(2, '0');
  const bg = (u, pos) => `background-image:url(${u});background-position:${pos || 'center'}`;
  let uid = 0;
  const svgCut = (img, x, y, w, h, pts) => {
    const id = 's' + (++uid), p = pts.map(q => `${q[0] * w / 100},${q[1] * h / 100}`).join(' ');
    return `<svg style="position:absolute;left:${x}px;top:${y}px" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg"><defs><clipPath id="${id}"><polygon points="${p}"/></clipPath></defs><image href="${img}" x="0" y="0" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice" clip-path="url(#${id})"/></svg>`;
  };
  const initials = n => { const w = n.replace(/[^A-Za-z ]/g, '').split(/\s+/).filter(Boolean); return ((w[0] || '?')[0] + (w[1] ? w[1][0] : '')).toUpperCase(); };
  const logoBox = (c, cls) => c.info.logo ? `<div class="${cls} lg"><img src="${c.info.logo}"></div>` : `<div class="${cls} lg mono">${E(initials(c.info.ent))}</div>`;
  const lorem = {
    disc: 'Natural stone varies in shade, grain and size from piece to piece. Photos and samples are indicative.',
    custom: 'Custom sizes and thicknesses are available on request.'
  };
  const FIN = [['Natural / Cleft', 'The raw split face with a natural, textured look.'], ['Sawn', 'Machine cut with a flat, even surface.'], ['Honed', 'Smooth matte surface with no shine.'], ['Brushed', 'Soft, aged feel with light texture.'], ['Flamed', 'Heat-treated for a rough, anti-slip finish.'], ['Tumbled', 'Softened edges and an antique look.'], ['Sandblasted', 'Fine textured, matte surface.'], ['Bush-hammered', 'Coarse textured surface for good grip.'], ['Polished', 'Glossy surface that shows the colour and grain.']];
  const EDGES = ['Handcut', 'Straight handcut', 'Machine cut / sawn', 'Chamfered / bevelled', 'Full bullnose', 'Half bullnose', '1/4 round', 'Coping edge', 'Chiselled edge'];
  const edgePath = k => [
    'M4 8H86L96 20V36H4Z', 'M4 8H96V36H4Z', 'M4 8H96V36H4Z', 'M4 8H82L96 22V36H4Z', 'M4 8H70Q96 8 96 22Q96 36 70 36H4Z', 'M4 8H80Q96 8 96 18V36H4Z', 'M4 8H88Q96 8 96 16V36H4Z', 'M4 8H64Q76 8 76 18Q76 28 90 28H96V36H4Z', 'M4 8H90L96 14L90 20L96 26L90 32L96 36H4Z'][k];

  const th = (name, bg, ink, muted, acc, dark, soft, line, bars) => ({ name, bg, ink, muted, acc, dark, soft, line, bars });
  const TEMPLATES = [
    { id: 'x1a', fam: 'x1', cat: 'Sandstone', name: 'Export Catalogue · Light', size: [1123, 794], theme: th('Classic', '#ffffff', '#1d1f24', '#6c7078', '#2f8c9a', '#10132b', '#f1f2f3', '#d9dbde', ['#8fd3dc', '#4a7f8c', '#8fb9a8', '#e0a23a', '#b9c46f', '#d6334a', '#a58fb3']), hf: "'Playfair Display','Noto Serif Devanagari',serif", bf: "'Poppins','Noto Sans Devanagari',sans-serif" },
    { id: 'x2a', fam: 'x2', cat: 'Kota Stone', name: 'Panel Catalogue · Light', size: [794, 1123], theme: th('Minimal White', '#ffffff', '#1e1e1e', '#777777', '#b07a4f', '#2b2b2b', '#f5f2ee', '#e4e0da', []), hf: "'Montserrat','Noto Sans Devanagari',sans-serif", bf: "'Montserrat','Noto Sans Devanagari',sans-serif" },
    { id: 'x3a', fam: 'x3', cat: 'Sandstone', name: 'Swatch Mosaic · A', size: [794, 1123], theme: th('Maroon', '#ffffff', '#222222', '#6c6c6c', '#8b2a2a', '#262626', '#f4efec', '#e2d8d3', []), hf: "'Playfair Display','Noto Serif Devanagari',serif", bf: "'Poppins','Noto Sans Devanagari',sans-serif" }
  ];

  /* =============== X1 : export catalogue (landscape 1123 x 794) =============== */
  const x1 = {
    head: (c, no, left) => `<div class="x-tab"><span>${pn(no)} / Product catalogue / ${E(c.info.product)}</span><span>${E(c.info.ent)}</span></div>`,
    cover: c => `<div class="x-full" style="${bg(c.hero)}"></div><div class="x-cbox">${logoBox(c, 'x-logo')}<div class="x-cname">${E(c.info.ent)}</div><div class="x-csub">${E(cap(c.info.district))} · RAJASTHAN</div><div class="x-cpc">PRODUCT CATALOGUE ${c.year}</div></div>`,
    about: c => `<div class="x-topph" style="${bg(c.items[1] ? c.items[1].img : c.hero)}"></div>
      <div class="x-abox"><h3>${E(c.info.ent)}</h3><p>${E(c.info.desc)}</p><h4>What we supply</h4><p>${E(c.info.use || '')}</p><h4>Where we are</h4><p>${E(c.info.addr)}</p></div><div class="x-wm">${E(initials(c.info.ent))}</div>`,
    index: (c, pages) => `<h2 class="x-idx">I&nbsp;&nbsp;N&nbsp;&nbsp;D&nbsp;&nbsp;E&nbsp;&nbsp;X</h2>
      <div class="x-bars">${pages.map((p, k) => `<div style="margin-left:${k % 2 ? 70 : 0}px;background:${c.th.bars[k % c.th.bars.length]}"><b>› ${E(cap(p[0]))} ‹</b><small>${E(p[1])}</small><i style="${bg(c.items[k % c.items.length].img)}"></i></div>`).join('')}</div>
      <div class="x-idxph" style="${bg(c.items[2 % c.items.length].img)}"></div>
      <div class="x-idxbox"><div><b>SURFACE FINISHES</b><b>EDGE FINISHES</b><b>${E(cap(c.info.product))}</b>${c.items.slice(0, 9).map(i => `<span>${E(i.name)}</span>`).join('')}</div><div><b>CONTACT</b><span>${E(c.info.person)}</span><span>${E(c.info.mobile)}</span><span>${E(c.info.email)}</span></div></div>`,
    surface: c => `<div class="x-big">Surface<br>Finishes</div><div class="x-intro">${E(c.info.ent)} offers these surface finishes. Ask us which suits your project.</div>
      <div class="x-fin">${c.copy.finAll.map((f, k) => `<div><div class="t" style="${bg(c.items[k % c.items.length].img, ['center', 'left top', 'right bottom'][k % 3])}"></div><b>${E(f[0])}</b><span>${E(f[1])}</span></div>`).join('')}</div>`,
    edge: c => `<div class="x-big">Edge<br>Finishes</div>
      <div class="x-edges">${EDGES.map((n, k) => `<div><svg viewBox="0 0 100 44" width="150" height="66"><path d="${edgePath(k)}" fill="#e9eaec" stroke="${c.th.ink}" stroke-width="1.6"/></svg><span>${E(n)}</span></div>`).join('')}</div>
      <div class="x-eph" style="${bg(c.items[0].img)}"></div><div class="x-estrip" style="${bg((c.items[1] || c.items[0]).img)}"></div>`,
    product: (c, no, it, k) => {
      const pos = ['center', 'left top', 'right bottom', 'right top', 'left bottom', '30% 70%'], f = (c.copy.formats || [['Product', null]]).slice(0, 6).map((r, k) => [r[0], r[1] || it.size || 'On request', pos[k % 6]]);
      return `${x1.head(c, no)}<div class="x-ptitle">${E(it.name)}</div>
        <div class="x-pic" style="${bg(it.img)}"></div>
        <div class="x-formats">${f.map(r => `<div><div class="fp" style="${bg(it.img, r[2])}"></div><b>${E(cap(r[0]))}</b><span>${E(r[1])}</span></div>`).join('')}</div>
        <div class="x-pdesc"><b>${E(it.name)}</b> ${E([it.colour, it.material].filter(Boolean).join(', '))}. ${E(c.info.desc.split('. ')[0])}.<br><span>${it.price ? 'Price: ' + E(it.price) + ' · ' : ''}${it.moq ? 'MOQ ' + E(it.moq) : ''}</span><br><span>${lorem.custom}</span></div>
        <div class="x-disc"><b>Please note:</b> ${E(c.copy.note)}</div>`;
    },
    contact: c => `<div class="x-full" style="${bg(c.items[c.items.length - 1].img)};width:520px"></div>
      <div class="x-dark">${logoBox(c, 'x-logo2')}<div class="x-cname2">${E(c.info.ent)}</div>
        <div class="x-ci"><b>Corporate office</b>${E(c.info.addr)}</div><div class="x-ci"><b>Phone</b>${E(c.info.person)} · ${E(c.info.mobile)}${c.info.wa && c.info.wa !== c.info.mobile ? ' · WhatsApp ' + E(c.info.wa) : ''}</div><div class="x-ci"><b>Email</b>${E(c.info.email)}</div>${c.info.gst ? `<div class="x-ci"><b>GSTIN</b>${E(c.info.gst)}</div>` : ''}
        ${(c.info.socials || []).length ? `<div class="x-soc">${c.info.socials.map(s => `<span class="soc" data-url="${E(s[1])}">${s[0]}</span>`).join('')}</div>` : ''}${c.qr ? `<div class="x-qr"><img class="qrimg" src="${c.qr}"></div>` : ''}</div>`
  };

  /* =============== X2 : panel catalogue (portrait) =============== */
  const x2 = {
    cover: c => `${logoBox(c, 'p-logo')}<div class="p-co1" style="${bg(c.items[0].img)}"></div><div class="p-co2" style="${bg((c.items[1] || c.items[0]).img)}"></div><div class="p-co3" style="${bg((c.items[2] || c.items[0]).img)}"></div><div class="p-co4" style="${bg((c.items[3] || c.items[0]).img)}"></div>
      <div class="p-ctitle">${E(c.info.product)}</div><div class="p-csub">${E(c.info.ent)} · ${E(c.info.district)}</div><div class="p-cline"><span>V.01</span><span>${c.year}</span></div>`,
    about: c => `${svgCut((c.items[1] || c.items[0]).img, 0, 0, 380, 330, [[0, 0], [100, 0], [70, 60], [20, 100], [0, 100]])}${logoBox(c, 'p-logo')}
      <div class="p-about"><h3>About ${E(c.info.ent)}</h3><p>${E(c.info.desc)}</p></div>
      <div class="p-why"><h4>Why choose ${E(c.info.product)}?</h4><ul>${c.copy.why.slice(0, 6).map(x => `<li>${E(x)}</li>`).join('')}</ul></div>`,
    specs: c => {
      const sizes = [...new Set(c.items.map(i => i.size).filter(Boolean))].slice(0, 3), fin = [...new Set(c.items.map(i => i.finish || i.material).filter(Boolean))].slice(0, 3);
      return `<div class="p-halfph" style="${bg(c.hero)}"></div><div class="p-spec"><h3>Technical specifications</h3><ul><li>Size: ${E(sizes.join(' / ') || 'on request')}</li><li>Material: ${E(c.info.product)}</li><li>Finish options: ${E(fin.join(', ') || 'natural, custom')}</li><li>Thickness: ${E(c.items[0].thickness || 'as per product')}</li><li>Lifespan: long-lasting with minimal maintenance</li></ul></div>`;
    },
    grid: (c, items, no) => `${logoBox(c, 'p-logo')}<div class="p-gtitle">Our range</div><div class="p-grid">${items.map(it => `<div><div class="g" style="${bg(it.img)}"></div><b>${E(it.code)}</b></div>`).join('')}</div>
      <div class="p-icons">${['Strong & durable', 'Natural look', 'Easy to install', 'Low maintenance', 'Custom sizes', 'Eco-friendly'].map(t => `<div><i></i><span>${E(t)}</span></div>`).join('')}</div>`,
    spread: (c, it, no) => `<div class="p-sl" style="${bg(it.img)}"></div><div class="p-sr" style="${bg(it.img, 'right bottom')}"></div><div class="p-scode">${E(it.code)}</div><div class="p-sname">${E(it.name)}</div><div class="p-sspec">${E([it.size, it.finish || it.material, it.price].filter(Boolean).join('  ·  '))}</div>`,
    contact: c => `${logoBox(c, 'p-logo')}<div class="p-end"><h3>${E(c.info.ent)}</h3><p>${E(c.info.addr)}</p><p>${E(c.info.person)} · ${E(c.info.mobile)}</p><p>${E(c.info.email)}</p>${c.qr ? `<img class="qrimg" src="${c.qr}">` : ''}</div>`
  };

  /* =============== X3 : swatch mosaic (portrait) =============== */
  const x3 = {
    cover: c => {
      const B = 265, h = 270, id = 's' + (++uid), n = c.items.length, im = k => c.items[k % n].img;
      const U = x => [[x, h], [x + B, h], [x + B / 2, 0]], D = x => [[x, 0], [x + B, 0], [x + B / 2, h]];
      const tris = [];
      [0, B, 2 * B].forEach(x => tris.push([U(x), 0]));
      [B / 2, B * 1.5, B * 2.5].forEach(x => tris.push([D(x), 0]));
      [0, B, 2 * B].forEach(x => tris.push([D(x), h]));
      [B / 2, B * 1.5, B * 2.5].forEach(x => tris.push([U(x), h]));
      const defs = tris.map((t, k) => `<clipPath id="${id}_${k}"><polygon points="${t[0].map(p => p[0] + ',' + (p[1] + t[1])).join(' ')}"/></clipPath>`).join('');
      const body = tris.map((t, k) => `<image href="${im(k)}" x="0" y="0" width="794" height="540" preserveAspectRatio="xMidYMid slice" clip-path="url(#${id}_${k})"/><polygon points="${t[0].map(p => p[0] + ',' + (p[1] + t[1])).join(' ')}" fill="none" stroke="#ffffff" stroke-width="5"/>`).join('');
      return `<svg style="position:absolute;left:0;top:0" width="794" height="540" viewBox="0 0 794 540" xmlns="http://www.w3.org/2000/svg"><defs>${defs}</defs>${body}</svg>
      <div class="m-ctitle">PRODUCT<br>CATALOGUE</div><div class="m-cbrand">${logoBox(c, 'm-logo')}<b>${E(c.info.ent)}</b><span>${E(c.info.district)}, Rajasthan</span></div>`;
    },
    about: c => `<h2 class="m-h">ABOUT US</h2><div class="m-tx"><p>${E(c.info.desc)}</p><p>${E(c.info.use ? 'Our products are used for: ' + c.info.use + '.' : '')}</p></div>
      <div class="m-why"><h4>WHY CHOOSE US?</h4>${c.copy.why.slice(0, 4).map(t => `<div><i></i>${E(t)}</div>`).join('')}</div>
      <div class="m-aph" style="${bg((c.items[1] || c.items[0]).img)}"></div>`,
    section: c => `<div class="m-secph" style="${bg(c.hero)}"></div><div class="m-sect">${E(cap(c.info.product))}</div><div class="m-secsub">${E(c.info.desc.split('. ')[0])}.</div>`,
    mosaic: (c, items, no) => `<div class="m-mos">${items.map((it, k) => `<div class="t${items.length % 2 && k === items.length - 1 ? ' wide' : ''}" style="${bg(it.img)}"><span>${E(cap(it.name))}</span></div>`).join('')}</div><div class="m-no">${pn(no)}</div>`,
    specs: c => `<div class="m-dark"><div class="m-sp"><h3>SPECIFICATIONS</h3>${[['SIZES', [...new Set(c.items.map(i => i.size).filter(Boolean))].slice(0, 3).join(' · ') || 'on request'], ['THICKNESS', c.items[0].thickness || 'as per product'], ['FINISHES', [...new Set(c.items.map(i => i.finish || i.material).filter(Boolean))].slice(0, 3).join(', ') || 'natural, custom'], ['APPLICATIONS', c.info.use || 'on request']].map(r => `<div><b>${r[0]}</b><span>${E(r[1])}</span></div>`).join('')}</div>
      <h3 class="m-cu">CONTACT US</h3><div class="m-cbox"><div><p>⌂ ${E(c.info.addr)}</p><p>☎ ${E(c.info.person)}: ${E(c.info.mobile)}</p><p>@ ${E(c.info.email)}</p>${c.info.gst ? `<p>GSTIN ${E(c.info.gst)}</p>` : ''}</div>${c.qr ? `<img class="qrimg" src="${c.qr}">` : ''}</div></div>`
  };

  /* =============== render =============== */
  function pageCount(t, n){
    if (t.fam === 'x1') return 6 + n;
    if (t.fam === 'x2') return 3 + Math.ceil(n / 6) + n + 1;
    return 3 + Math.ceil(n / 8) + 1;
  }
  function render(t, ctx){
    const th = t.theme, items = ctx.items.map((it, k) => Object.assign({ code: (t.fam === 'x2' ? 'P' : '#KS-') + pn(k + 1), _n: k + 1 }, it));
    const c = Object.assign({}, ctx, { items, th, copy: ctx.copy || window.getCopy(ctx.info), year: new Date().getFullYear(), hero: ctx.heroImg || items[0].img });
    const style = `--bg:${th.bg};--ink:${th.ink};--muted:${th.muted};--acc:${th.acc};--dark:${th.dark};--soft:${th.soft};--line:${th.line};--hf:${t.hf};--bf:${t.bf};width:${t.size[0]}px;height:${t.size[1]}px;background-color:${th.bg};font-family:${t.bf}`;
    const wrap = h => `<div class="pg xs ${t.fam}" style="${style}">${h}</div>`;
    const P = [];
    if (t.fam === 'x1'){
      const first = 6, last = first + items.length - 1;
      P.push(wrap(x1.cover(c))); P.push(wrap(x1.about(c)));
      P.push(wrap(x1.index(c, [['Products', 'Pg ' + pn(first) + ' - ' + pn(last)], ['Surface finishes', 'Pg 04'], ['Edge finishes', 'Pg 05'], ['Contact', 'Pg ' + pn(last + 1)]])));
      P.push(wrap(x1.surface(c))); P.push(wrap(x1.edge(c)));
      items.forEach((it, k) => P.push(wrap(x1.product(c, first + k, it, k))));
      P.push(wrap(x1.contact(c)));
    } else if (t.fam === 'x2'){
      P.push(wrap(x2.cover(c))); P.push(wrap(x2.about(c))); P.push(wrap(x2.specs(c)));
      for (let k = 0; k < items.length; k += 6) P.push(wrap(x2.grid(c, items.slice(k, k + 6), P.length + 1)));
      items.forEach((it, k) => P.push(wrap(x2.spread(c, it, P.length + 1))));
      P.push(wrap(x2.contact(c)));
    } else {
      P.push(wrap(x3.cover(c))); P.push(wrap(x3.about(c))); P.push(wrap(x3.section(c)));
      for (let k = 0; k < items.length; k += 8) P.push(wrap(x3.mosaic(c, items.slice(k, k + 8), P.length + 1)));
      P.push(wrap(x3.specs(c)));
    }
    return P;
  }

  const CSS = `
.pg.xs{position:relative;overflow:hidden;margin-bottom:16px;color:var(--ink);font-size:11px}
.xs .lg{background:#fff;display:flex;align-items:center;justify-content:center;overflow:hidden}
.xs .lg img{max-width:100%;max-height:100%;object-fit:contain}
.xs .lg.mono{font-family:var(--hf);font-weight:700;color:var(--acc)}
.xs h2,.xs h3,.xs h4{font-family:var(--hf);margin:0}
/* ---- X1 ---- */
.x1 .x-full{position:absolute;left:0;top:0;width:1123px;height:794px;background-size:cover;background-position:center}
.x1 .x-cbox{position:absolute;left:60px;bottom:60px;width:470px;background:rgba(255,255,255,.94);padding:28px 32px}
.x1 .x-logo{width:64px;height:64px;border:1px solid var(--line);font-size:24px;margin-bottom:12px}
.x1 .x-cname{font-family:var(--hf);font-size:34px;font-weight:700;line-height:1.1}
.x1 .x-csub{margin-top:8px;font-size:10px;letter-spacing:.3em;color:var(--acc)}
.x1 .x-cpc{margin-top:20px;font-size:12px;letter-spacing:.26em;font-weight:600}
.x1 .x-topph{position:absolute;left:0;top:0;width:1123px;height:520px;background-size:cover;background-position:center}
.x1 .x-abox{position:absolute;left:60px;top:300px;width:480px;background:#fff;padding:26px 30px;line-height:1.6;color:var(--muted)}
.x1 .x-abox h3{font-size:22px;color:var(--ink);margin-bottom:8px}
.x1 .x-abox h4{font-size:12px;letter-spacing:.14em;color:var(--ink);margin:12px 0 4px;text-transform:uppercase}
.x1 .x-abox p{margin:0}
.x1 .x-wm{position:absolute;right:60px;bottom:40px;font-family:var(--hf);font-size:200px;font-weight:700;color:var(--soft);line-height:1}
.x1 .x-idx{position:absolute;left:80px;top:50px;font-size:24px;font-weight:400;letter-spacing:.3em}
.x1 .x-bars{position:absolute;left:80px;top:130px;width:430px}
.x1 .x-bars>div{position:relative;height:62px;margin-bottom:16px;width:360px;color:#fff;padding:10px 14px;overflow:hidden}
.x1 .x-bars b{display:block;font-size:11px;letter-spacing:.1em}
.x1 .x-bars small{display:block;font-size:9px;margin-top:3px;opacity:.9}
.x1 .x-bars i{position:absolute;right:0;top:0;width:110px;height:100%;background-size:cover;opacity:.55}
.x1 .x-idxph{position:absolute;left:620px;top:0;width:503px;height:330px;background-size:cover;background-position:center}
.x1 .x-idxbox{position:absolute;left:620px;top:330px;width:503px;height:464px;background:var(--dark);color:#fff;padding:26px 30px;display:grid;grid-template-columns:1fr 1fr;gap:20px;font-size:9.5px;line-height:1.9}
.x1 .x-idxbox b{display:block;font-size:10px;letter-spacing:.1em;margin-top:8px}
.x1 .x-idxbox span{display:block;opacity:.75}
.x1 .x-big{position:absolute;left:60px;top:50px;font-family:var(--hf);font-weight:700;font-size:58px;line-height:1.05;color:#8d9096}
.x1 .x-intro{position:absolute;left:60px;top:220px;width:300px;color:var(--muted);line-height:1.6}
.x1 .x-fin{position:absolute;left:420px;top:50px;width:640px;display:grid;grid-template-columns:repeat(3,1fr);gap:22px 22px}
.x1 .x-fin .t{height:96px;background-size:cover;margin-bottom:8px}
.x1 .x-fin b{display:block;font-size:10px}
.x1 .x-fin span{display:block;font-size:8.5px;line-height:1.5;color:var(--muted);margin-top:2px}
.x1 .x-edges{position:absolute;left:60px;top:230px;width:470px;display:grid;grid-template-columns:repeat(3,1fr);gap:20px 14px}
.x1 .x-edges span{display:block;font-size:9px;margin-top:4px}
.x1 .x-eph{position:absolute;left:600px;top:0;width:523px;height:794px;background-size:cover;background-position:center}
.x1 .x-estrip{position:absolute;left:60px;top:600px;width:470px;height:150px;background-size:cover;background-position:center}
.x1 .x-tab{position:absolute;left:40px;right:40px;top:14px;display:flex;justify-content:space-between;font-size:7.5px;color:#9aa;letter-spacing:.04em}
.x1 .x-ptitle{position:absolute;left:40px;top:34px;font-family:var(--hf);font-weight:700;font-size:30px;line-height:1.05;color:#6f737a;width:560px}
.x1 .x-pic{position:absolute;left:40px;top:112px;width:540px;height:560px;background-size:cover;background-position:center}
.x1 .x-formats{position:absolute;left:610px;top:112px;width:480px;display:grid;grid-template-columns:1fr 1fr;gap:16px 20px}
.x1 .x-formats .fp{height:84px;background-size:cover;margin-bottom:6px}
.x1 .x-formats b{display:block;font-size:8.5px;letter-spacing:.08em}
.x1 .x-formats span{display:block;font-size:8.5px;color:var(--muted);line-height:1.5}
.x1 .x-pdesc{position:absolute;left:610px;top:560px;width:470px;font-size:9px;line-height:1.7;color:var(--muted)}
.x1 .x-pdesc b{color:var(--ink)}
.x1 .x-disc{position:absolute;left:40px;right:40px;bottom:22px;background:#7b7e84;color:#fff;font-size:8px;padding:9px 14px}
.x1 .x-dark{position:absolute;left:520px;top:0;width:603px;height:794px;background:var(--dark);color:#fff;padding:60px 60px}
.x1 .x-logo2{width:70px;height:70px;font-size:26px;margin-bottom:16px}
.x1 .x-cname2{font-family:var(--hf);font-size:30px;font-weight:700;margin-bottom:30px}
.x1 .x-ci{margin-bottom:18px;font-size:12px;line-height:1.7;opacity:.9}
.x1 .x-ci b{display:block;font-size:10px;letter-spacing:.2em;color:var(--acc);margin-bottom:2px;opacity:1}
.x1 .x-soc .soc{display:inline-block;border:1px solid rgba(255,255,255,.5);padding:2px 10px;border-radius:99px;margin-right:6px;font-size:10px}
.x1 .x-qr img{width:120px;height:120px;background:#fff;padding:8px;margin-top:16px;box-sizing:content-box}
/* ---- X2 ---- */
.x2 .p-logo{position:absolute;right:40px;top:30px;width:54px;height:54px;font-size:20px;border:1px solid var(--line)}
.x2 .p-co1{position:absolute;left:0;top:120px;width:250px;height:440px;background-size:cover}
.x2 .p-co2{position:absolute;left:270px;top:200px;width:200px;height:340px;background-size:cover}
.x2 .p-co3{position:absolute;left:490px;top:120px;width:250px;height:440px;background-size:cover}
.x2 .p-co4{position:absolute;left:600px;top:240px;width:194px;height:340px;background-size:cover}
.x2 .p-ctitle{position:absolute;left:0;right:0;top:780px;text-align:center;font-family:var(--hf);font-weight:600;font-size:40px;color:var(--acc);letter-spacing:.02em}
.x2 .p-csub{position:absolute;left:0;right:0;top:840px;text-align:center;font-size:12px;color:var(--muted)}
.x2 .p-cline{position:absolute;left:30px;right:30px;bottom:50px;border-top:1px solid var(--ink);padding-top:6px;display:flex;justify-content:space-between;font-size:8px}
.x2 .p-about{position:absolute;left:150px;right:150px;top:470px;text-align:center}
.x2 .p-about h3{font-size:16px;margin-bottom:12px}
.x2 .p-about p,.x2 .p-why li{font-size:11px;line-height:1.7;color:var(--muted)}
.x2 .p-why{position:absolute;left:60px;top:740px;width:420px}
.x2 .p-why h4{font-size:13px;margin-bottom:8px}
.x2 .p-why ul{margin:0;padding-left:18px}
.x2 .p-halfph{position:absolute;left:0;top:0;width:794px;height:560px;background-size:cover;background-position:center}
.x2 .p-spec{position:absolute;left:0;right:0;top:640px;text-align:center}
.x2 .p-spec h3{font-size:18px;margin-bottom:16px}
.x2 .p-spec ul{margin:0;padding:0;list-style:none;line-height:2;font-size:12px;color:var(--muted)}
.x2 .p-gtitle{position:absolute;left:0;right:0;top:80px;text-align:center;font-family:var(--hf);font-size:26px;font-weight:600}
.x2 .p-grid{position:absolute;left:70px;right:70px;top:150px;display:grid;grid-template-columns:repeat(3,1fr);gap:26px 26px;text-align:center}
.x2 .p-grid .g{height:300px;background-size:cover;background-position:center;margin-bottom:8px}
.x2 .p-grid b{font-size:12px;color:var(--acc)}
.x2 .p-icons{position:absolute;left:60px;right:60px;bottom:50px;display:grid;grid-template-columns:repeat(6,1fr);gap:10px;text-align:center;font-size:8.5px;color:var(--muted)}
.x2 .p-icons i{display:block;margin:0 auto 6px;width:34px;height:34px;border-radius:50%;border:2px solid var(--acc);background:var(--soft)}
.x2 .p-sl{position:absolute;left:0;top:0;width:340px;height:1123px;background-size:cover}
.x2 .p-sr{position:absolute;left:340px;top:0;width:454px;height:1123px;background-size:cover}
.x2 .p-scode{position:absolute;left:20px;top:20px;color:#fff;font-size:12px;font-weight:600;text-shadow:0 1px 3px rgba(0,0,0,.5)}
.x2 .p-sname{position:absolute;left:30px;bottom:56px;color:#fff;font-family:var(--hf);font-size:20px;font-weight:600;max-width:700px;text-shadow:0 1px 4px rgba(0,0,0,.6)}
.x2 .p-sspec{position:absolute;left:30px;bottom:30px;color:#fff;font-size:10px;text-shadow:0 1px 3px rgba(0,0,0,.6)}
.x2 .p-end{position:absolute;left:100px;right:100px;top:400px;text-align:center;color:var(--muted);line-height:1.8}
.x2 .p-end h3{font-size:24px;color:var(--ink);margin-bottom:14px}
.x2 .p-end img{width:130px;height:130px;margin-top:20px;background:#fff;padding:8px;border:1px solid var(--line);box-sizing:content-box}
/* ---- X3 ---- */
.x3 .m-ctitle{position:absolute;left:50px;top:590px;text-align:left;font-family:var(--hf);font-weight:700;font-size:40px;letter-spacing:.12em;line-height:1.2;color:var(--dark)}
.x3 .m-cbrand{position:absolute;left:50px;bottom:60px;width:420px;border-top:3px solid var(--acc);padding-top:20px}
.x3 .m-logo{width:80px;height:80px;font-size:28px;border:1px solid var(--line);margin-bottom:12px}
.x3 .m-cbrand b{display:block;font-family:var(--hf);font-size:26px}
.x3 .m-cbrand span{display:block;margin-top:4px;color:var(--muted)}
.x3 .m-h{position:absolute;left:260px;top:60px;font-size:28px;letter-spacing:.06em}
.x3 .m-tx{position:absolute;left:260px;right:60px;top:130px;line-height:1.8;color:var(--muted);font-size:11.5px}
.x3 .m-tx p{margin:0 0 12px}
.x3 .m-why{position:absolute;left:260px;top:420px;width:380px;border:1px solid var(--line);padding:20px 26px;background:var(--soft)}
.x3 .m-why h4{font-size:14px;letter-spacing:.06em;margin-bottom:12px}
.x3 .m-why div{margin:10px 0;color:var(--acc);font-family:var(--hf);font-size:14px}
.x3 .m-why i{display:inline-block;width:10px;height:10px;border:2px solid var(--acc);border-radius:50%;margin-right:10px}
.x3 .m-aph{position:absolute;left:0;top:0;width:230px;height:1123px;background-size:cover}
.x3 .m-secph{position:absolute;left:0;top:0;width:794px;height:1123px;background-size:cover;background-position:center}
.x3 .m-sect{position:absolute;left:60px;top:100px;font-family:var(--hf);font-weight:700;font-size:56px;letter-spacing:.04em;color:#fff;text-shadow:0 2px 12px rgba(0,0,0,.45);max-width:680px}
.x3 .m-secsub{position:absolute;left:0;right:0;bottom:0;padding:90px 60px 60px;background:linear-gradient(180deg,rgba(0,0,0,0),rgba(0,0,0,.6));font-size:13px;color:#fff;text-shadow:0 1px 8px rgba(0,0,0,.6);line-height:1.6}
.x3 .m-mos{position:absolute;left:0;top:0;width:794px;height:1123px;display:grid;grid-template-columns:1fr 1fr;grid-auto-rows:1fr;gap:3px}
.x3 .m-mos .t{position:relative;background-size:cover;background-position:center}
.x3 .m-mos .t.wide{grid-column:1/3}
.x3 .m-mos .t span{position:absolute;left:12px;bottom:12px;background:rgba(255,255,255,.92);color:var(--ink);font-size:9px;font-weight:600;letter-spacing:.06em;padding:4px 12px;border:1px solid var(--line)}
.x3 .m-no{position:absolute;right:16px;top:12px;background:var(--acc);color:#fff;font-size:10px;padding:2px 8px;z-index:2}
.x3 .m-dark{position:absolute;left:0;top:0;width:794px;height:1123px;background:var(--dark);color:#fff;padding:60px 50px}
.x3 .m-sp h3,.x3 .m-cu{font-size:22px;letter-spacing:.08em;margin-bottom:20px}
.x3 .m-sp div{display:grid;grid-template-columns:200px 1fr;border-bottom:1px solid rgba(255,255,255,.2);padding:14px 0;font-size:12px}
.x3 .m-sp b{letter-spacing:.14em;font-size:10px;color:var(--acc);filter:brightness(1.8)}
.x3 .m-cu{margin-top:60px}
.x3 .m-cbox{display:flex;justify-content:space-between;align-items:flex-start;gap:20px;font-size:12px;line-height:1.8;opacity:.92}
.x3 .m-cbox p{margin:0 0 8px}
.x3 .m-cbox img{width:130px;height:130px;background:#fff;padding:8px;box-sizing:content-box}
`;

  window.STONECAT_TEMPLATES = { list: TEMPLATES, css: CSS, render, pageCount };
})();
