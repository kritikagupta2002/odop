/* Kota Stone brochure templates (inspired by stone-trader brochures: geometric diagonal cuts, colour swatches with codes,
   specification table, surface finishes, applications, patterns, price list, QR contact page).
   Page count follows the number of colours / products.                                                   */
(function () {
  const E = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const cap = s => (s || '').toUpperCase();
  const pn = n => String(n).padStart(2, '0');
  let uid = 0;
  /* a photo cut into a polygon (percent points) - drawn as inline SVG so it also renders in the PDF */
  const cut = (img, x, y, w, h, pts, extra) => {
    const id = 'k' + (++uid), p = pts.map(q => `${q[0] * w / 100},${q[1] * h / 100}`).join(' ');
    return `<svg style="position:absolute;left:${x}px;top:${y}px" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg"><defs><clipPath id="${id}"><polygon points="${p}"/></clipPath></defs><image href="${img}" x="0" y="0" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice" clip-path="url(#${id})"/>${extra || ''}</svg>`;
  };
  const poly = (x, y, w, h, pts, fill, op) => `<svg style="position:absolute;left:${x}px;top:${y}px" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg"><polygon points="${pts.map(q => `${q[0] * w / 100},${q[1] * h / 100}`).join(' ')}" fill="${fill}" fill-opacity="${op == null ? 1 : op}"/></svg>`;
  const icon = {
    shield: c => `<svg width="34" height="34" viewBox="0 0 34 34" xmlns="http://www.w3.org/2000/svg"><path d="M17 3l12 4v9c0 7-5 12-12 15C10 28 5 23 5 16V7z" fill="${c}"/><path d="M11 17l4 4 8-9" stroke="#fff" stroke-width="2.4" fill="none"/></svg>`,
    foot: c => `<svg width="34" height="34" viewBox="0 0 34 34" xmlns="http://www.w3.org/2000/svg"><ellipse cx="14" cy="20" rx="6" ry="9" fill="${c}"/><circle cx="23" cy="9" r="2.6" fill="${c}"/><circle cx="19" cy="6" r="2.2" fill="${c}"/><circle cx="14" cy="5" r="2" fill="${c}"/><circle cx="9.5" cy="6.5" r="1.8" fill="${c}"/></svg>`,
    star: c => `<svg width="34" height="34" viewBox="0 0 34 34" xmlns="http://www.w3.org/2000/svg"><path d="M17 3l4 9 10 1-7.500 7 2 10L17 25l-8.500 5 2-10L3 13l10-1z" fill="${c}"/></svg>`,
    drop: c => `<svg width="34" height="34" viewBox="0 0 34 34" xmlns="http://www.w3.org/2000/svg"><path d="M17 3C11 12 7 17 7 22a10 10 0 0020 0c0-5-4-10-10-19z" fill="${c}"/></svg>`,
    box: c => `<svg width="34" height="34" viewBox="0 0 34 34" xmlns="http://www.w3.org/2000/svg"><path d="M17 3l13 6v16l-13 6L4 25V9z" fill="${c}"/><path d="M4 9l13 6 13-6M17 15v16" stroke="#fff" stroke-width="1.8" fill="none"/></svg>`,
    leaf: c => `<svg width="34" height="34" viewBox="0 0 34 34" xmlns="http://www.w3.org/2000/svg"><path d="M6 28C6 14 14 6 29 5c0 15-8 23-21 23z" fill="${c}"/><path d="M8 27C14 19 19 14 26 9" stroke="#fff" stroke-width="1.8" fill="none"/></svg>`
  };
  const spec = (items, key) => [...new Set(items.map(i => i[key]).filter(Boolean))];

  const TEXT = {
    legacy: ent => `Built on experience, ${ent} stands for reliability, honest dealing and stone that lasts.`,
    what: ['Residential projects', 'Hospitality projects', 'Commercial developments', 'Landscaping & outdoor works', 'Architectural & decorative works'],
    why: ['Quality assurance', 'Timely delivery', 'Durable material', 'Competitive pricing', 'Customer satisfaction', 'Eco-friendly practices'],
    isKota: 'Kota Stone is a fine-grained limestone from the Hadoti region of Rajasthan. It forms in natural layers and is known for its grey and green shades. It is quarried directly from the earth and is widely used for its strength and natural look.',
    benefits: [['shield', 'Exceptional durability', 'Strong enough for heavy foot traffic and daily use.'], ['foot', 'Naturally non-slip', 'The surface keeps its grip even when wet, so it suits walkways and wet areas.'], ['leaf', 'Natural & eco-friendly', 'A natural material that stays cool to the touch and has little impact on the environment.']],
    finishes: [['Leather finish', 'A refined matte texture with extra grip and a modern look.'], ['Semi-polish', 'A soft sheen that brings out the stone while keeping its natural look.'], ['Mirror polish', 'A high-gloss finish with deep reflection for a rich, luxury look.'], ['Rough / natural', 'The raw, textured surface straight from the cut, best for outdoors.']],
    apps: ['Staircases', 'Interior flooring', 'Hospitality & outdoor leisure', 'Outdoor pathways & landscaping', 'Commercial spaces'],
    patterns: ['Radial X', 'Diamond layout', 'Plus pattern', 'Single diagonal', 'Brick strips', 'Square grid']
  };

  const th = (name, bg, ink, muted, acc, dark, soft, line, onDark) => ({ name, bg, ink, muted, acc, dark, soft, line, onDark });
  const TEMPLATES = [
    { id: 'ks-b1', cat: 'Kota Stone', name: 'Classic Brochure', theme: th('Sage Olive', '#edeee6', '#22251e', '#656a5a', '#8a8a55', '#4e5230', '#e0e2d6', '#cfd2c1', '#f1f2e8'), hf: "'Playfair Display','Noto Serif Devanagari',serif", bf: "'Lora','Noto Serif Devanagari',serif", patterns: true, brochure: true },
    { id: 'ks-b3', cat: 'Kota Stone', name: 'Warm Brochure', theme: th('Warm Sand & Terracotta', '#f3ece0', '#2c241d', '#7a6b5c', '#b0643d', '#6b3d28', '#e8dcc8', '#d8c9ae', '#f7efe2'), hf: "'Playfair Display','Noto Serif Devanagari',serif", bf: "'Poppins','Noto Sans Devanagari',sans-serif", patterns: false, brochure: true }
  ];

  /* ---------------- pages ---------------- */
  const head = (c, label, no) => `<div class="k-head"><span>${E(c.info.ent)}</span><span>${label}</span><span>${pn(no)}</span></div>`;
  const foot = c => `<div class="k-foot"><span>${E(c.info.ent)}</span><span>${E(c.info.mobile)}</span></div>`;
  const stripes = (c, x, y, w, h, flip) => `<svg style="position:absolute;left:${x}px;top:${y}px" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">${[0, 1, 2].map(k => `<polygon points="${flip ? `${w - k * 26},0 ${w - k * 26 - 14},0 ${w - k * 26 - 14 - h * .6},${h} ${w - k * 26 - h * .6},${h}` : `${k * 26},0 ${k * 26 + 14},0 ${k * 26 + 14 + h * .6},${h} ${k * 26 + h * .6},${h}`}" fill="${k === 1 ? c.th.dark : c.th.acc}" fill-opacity="${k === 1 ? .9 : .7}"/>`).join('')}</svg>`;

  function cover(c){
    const i = c.info, big = i.ent.length > 24 ? 24 : 30;
    return `${stripes(c, 640, 0, 150, 200)}<div class="k-brand" style="font-size:${big}px">${E(i.ent)}</div><div class="k-brandsub">${E(cap(i.district))} · RAJASTHAN</div>
      ${cut(c.hero, 40, 150, 714, 770, [[0, 0], [100, 0], [100, 70], [40, 100], [0, 100]], `<polygon points="0,659 520,470 520,770 0,770" fill="${c.th.bg}"/>`)}
      <div class="k-big">${E(i.product)}</div>
      <div class="k-tri"><span>Natural</span><i></i><span>Durable</span><i></i><span>Timeless</span></div>
      <div class="k-cov">Quarried in Hadoti. We supply across India, with careful selection from start to finish.</div>${stripes(c, 40, 940, 150, 170, true)}`;
  }
  function about(c, no){
    const i = c.info, it = c.items;
    return `${head(c, 'ABOUT US', no)}
      ${cut((it[1] || it[0]).img, 380, 70, 380, 330, [[22, 0], [100, 0], [78, 100], [0, 100]])}
      ${cut((it[2] || it[0]).img, 380, 420, 380, 330, [[22, 0], [100, 0], [78, 100], [0, 100]])}
      ${cut((it[3] || it[0]).img, 380, 770, 380, 290, [[22, 0], [100, 0], [78, 100], [0, 100]])}
      <div class="k-col" style="left:44px;top:96px;width:320px">
        <h3>About us</h3><p>${E(i.desc)}</p>
        <h3>Our legacy</h3><p>${E(c.copy.legacy)}</p>
        <h3>What we do</h3><ul>${c.copy.what.map(x => `<li>${E(x)}</li>`).join('')}</ul>
        <h3>Why choose us</h3><ul>${c.copy.why.map(x => `<li>${E(x)}</li>`).join('')}</ul></div>
      <div class="k-contact">${[i.addr, i.mobile && '☎ ' + i.mobile].filter(Boolean).map(E).join('<br>')}</div>${foot(c)}`;
  }
  function understand(c, no){
    const it = c.items;
    return `${head(c, 'UNDERSTANDING ' + cap(c.info.product), no)}
      ${cut((it[4] || it[0]).img, 330, 70, 464, 1040, [[34, 0], [100, 0], [100, 100], [34, 100], [0, 68], [0, 32]])}
      <div class="k-bar"></div><h2 class="k-h2" style="left:62px;top:96px">UNDERSTANDING<br>${E(cap(c.info.product))}</h2>
      <div class="k-col" style="left:44px;top:230px;width:270px"><h3>What is ${E(c.info.product)}:</h3><p>${E(c.copy.isText)}</p></div>
      <h3 class="k-kb">KEY BENEFITS</h3>
      <div class="k-ben">${c.copy.benefits.map(b => `<div><div class="k-ic">${icon[b[0]](c.th.acc)}</div><b>${E(cap(b[1]))}</b><span>${E(b[2])}</span></div>`).join('')}</div>${foot(c)}`;
  }
  function colours(c, no, items, first){
    const f = items[0] || c.items[0];
    return `${head(c, 'AVAILABLE COLOURS', no)}${stripes(c, 640, 60, 150, 190)}
      <div class="k-featt">${E(c.info.product)}<br><b>${E(f.name)}</b></div><div class="k-code">${E(f.code || '')}</div><div class="k-rule"></div><h2 class="k-h2" style="left:44px;top:250px;font-size:30px">AVAILABLE<br>COLOURS:</h2>
      <div class="k-feat" style="${bg(f.img)}"></div>
      <div class="k-sws">${items.map(it => `<div><div class="sw" style="${bg(it.img)}"></div><b>${E(it.colour || it.name)}</b><small>${E(it.code || '')}</small></div>`).join('')}</div>${foot(c)}`;
  }
  function specs(c, no){
    const sizes = spec(c.items, 'size'), fin = spec(c.items, 'finish').length ? spec(c.items, 'finish') : spec(c.items, 'material'), th = spec(c.items, 'thickness');
    return `${head(c, 'SPECIFICATIONS', no)}<h2 class="k-h2" style="left:44px;top:96px">SPECIFICATIONS</h2><div class="k-sub" style="left:44px;top:170px">With calibration and box packing</div>
      <div class="k-spec" style="top:230px"><div><h4>SIZES</h4>${sizes.map(x => `<p>${E(x)}</p>`).join('') || '<p>On request</p>'}</div><div><h4>FINISHES</h4>${fin.map(x => `<p>${E(x)}</p>`).join('') || '<p>On request</p>'}</div><div><h4>THICKNESS</h4>${th.map(x => `<p>${E(x)}</p>`).join('') || '<p>18 - 20 mm</p>'}</div></div>
      ${cut(c.hero, 44, 390, 706, 590, [[0, 0], [100, 0], [100, 80], [62, 100], [0, 100]])}
      <div class="k-pill" style="left:44px;top:1010px">Custom sizes and thickness on request</div>${foot(c)}`;
  }
  function finishes(c, no){
    const it = c.items;
    return `${head(c, 'SURFACE FINISHES', no)}${stripes(c, 640, 60, 150, 190)}<h2 class="k-h2" style="left:44px;top:96px">${E(cap(c.copy.fin.title[0]))}<br>${E(cap(c.copy.fin.title[1]))}</h2>
      <div class="k-sub" style="left:44px;top:200px;width:330px;line-height:1.6">${E(c.copy.fin.intro)}</div>
      <div class="k-fins">${c.copy.fin.items.map((f, k) => `<div><div class="fp" style="${bg((it[k % it.length]).img)}"></div><b>${E(cap(f[0]))}</b><span>${E(f[1])}</span></div>`).join('')}</div>
      <div class="k-pill" style="left:44px;top:1010px">Natural beauty · Enhanced durability · Low maintenance</div>${foot(c)}`;
  }
  function apps(c, no){
    const it = c.items, list = (c.info.use ? c.info.use.split(',').map(x => x.trim()).filter(Boolean) : []);
    const names = c.copy.apps.map((d, k) => list[k] ? list[k].charAt(0).toUpperCase() + list[k].slice(1) : d);
    return `${head(c, 'APPLICATIONS', no)}<h2 class="k-h2" style="left:44px;top:96px;font-size:34px">${E(c.copy.appsTitle)}</h2><div class="k-sub" style="left:44px;top:158px">${E(c.info.product)} for every need</div>
      <div class="k-apps">${names.map((n, k) => `<div class="a${k}"><div class="ap" style="${bg(it[k % it.length].img)}"></div><b>${k + 1}. ${E(n)}</b></div>`).join('')}</div>${foot(c)}`;
  }
  const patSvg = (k, c) => {
    const s = 'stroke="#fff" stroke-opacity=".8" stroke-width="2" fill="none"';
    const m = [`<path d="M0 0L100 100M100 0L0 100" ${s}/>`, `<path d="M50 0L100 50L50 100L0 50Z" ${s}/>`, `<path d="M50 0V100M0 50H100" ${s}/>`, `<path d="M0 100L100 0" ${s}/>`, `<path d="M0 25H100M0 50H100M0 75H100" ${s}/>`, `<path d="M25 0V100M50 0V100M75 0V100M0 25H100M0 50H100M0 75H100" ${s}/>`];
    return `<svg style="position:absolute;left:0;top:0" width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">${m[k]}</svg>`;
  };
  function patterns(c, no){
    return `${head(c, 'PATTERNS', no)}<h2 class="k-h2" style="left:44px;top:96px;font-size:32px">SPECIAL PATTERNS</h2><div class="k-sub" style="left:44px;top:150px">Can be customised as per your requirement</div>
      <div class="k-pats">${(c.copy.patterns || TEXT.patterns).map((n, k) => `<div><div class="pt" style="${bg(c.items[k % c.items.length].img)}">${patSvg(k, c)}</div><b>${E(n)}</b></div>`).join('')}</div>${foot(c)}`;
  }
  function pricelist(c, no, items, page, pages){
    return `${head(c, 'PRICE LIST', no)}<h2 class="k-h2" style="left:44px;top:96px;font-size:34px">PRICE LIST</h2><div class="k-sub" style="left:44px;top:150px">Indicative prices. Please contact us for a firm quote${pages > 1 ? ` · part ${page} of ${pages}` : ''}.</div>
      <div class="k-tb"><div class="r h"><span></span><span>PRODUCT</span><span>SIZE</span><span>FINISH</span><span>MOQ</span><span>PRICE</span></div>
      ${items.map(it => `<div class="r"><div class="t" style="${bg(it.img)}"></div><div><b>${E(it.name)}</b><small>${E(it.code || '')} ${E(it.colour || '')}</small></div><span>${E(it.size)}</span><span>${E(it.finish || it.material)}</span><span>${E(it.moq)}</span><b>${E(it.price)}</b></div>`).join('')}</div>${foot(c)}`;
  }
  function contact(c, no){
    const i = c.info, qr = c.qrs || [];
    return `${stripes(c, 640, 0, 150, 200)}<h2 class="k-h2" style="left:44px;top:80px;font-size:40px">GET IN TOUCH<br><span style="color:${c.th.muted}">CONTACT US</span></h2><div class="k-rule" style="left:44px;top:230px;width:706px"></div>
      <div class="k-qrbox">${qr.length ? qr.map(q => `<div><img src="${q.img}"><b>${E(cap(q.label))}</b><small>Scan to open</small></div>`).join('') : '<div class="k-noqr">QR codes appear here when you add links</div>'}</div>
      <div class="k-addr"><div><h4>ADDRESS</h4><p>${E(i.addr)}</p>${i.gst ? `<p>GSTIN: ${E(i.gst)}</p>` : ''}</div><div><h4>PHONE</h4><p>${E(i.person)}<br>${E(i.mobile)}${i.wa && i.wa !== i.mobile ? '<br>WhatsApp ' + E(i.wa) : ''}</p><p>${E(i.email)}</p></div></div>${stripes(c, 40, 940, 150, 170, true)}`;
  }
  const bg = u => `background-image:url(${u})`;

  /* ---------------- plan + render ---------------- */
  const per = 6;
  function pageCount(t, n){ return 3 + Math.ceil(n / per) + 1 + 1 + 1 + (t.patterns ? 1 : 0) + Math.ceil(n / 6) + 1; }
  function render(t, ctx){
    const th = t.theme, items = ctx.items.map((it, k) => Object.assign({ code: '#KS-' + pn(k + 1), _n: k + 1 }, it));
    const c = Object.assign({}, ctx, { items, th, copy: ctx.copy || window.getCopy(ctx.info), hero: ctx.heroImg || items[0].img });
    const style = `--bg:${th.bg};--ink:${th.ink};--muted:${th.muted};--acc:${th.acc};--dark:${th.dark};--soft:${th.soft};--line:${th.line};--onDark:${th.onDark};--hf:${t.hf};--bf:${t.bf};background-color:${th.bg};font-family:${t.bf}`;
    const wrap = h => `<div class="pg ks" style="${style}">${h}</div>`;
    const P = [wrap(cover(c))]; let no = 2;
    P.push(wrap(about(c, no++))); P.push(wrap(understand(c, no++)));
    for (let k = 0; k < items.length; k += per) P.push(wrap(colours(c, no++, items.slice(k, k + per), k === 0)));
    P.push(wrap(specs(c, no++))); P.push(wrap(finishes(c, no++))); P.push(wrap(apps(c, no++)));
    if (t.patterns) P.push(wrap(patterns(c, no++)));
    const pages = Math.ceil(items.length / 6);
    for (let k = 0; k < items.length; k += 6) P.push(wrap(pricelist(c, no++, items.slice(k, k + 6), k / 6 + 1, pages)));
    P.push(wrap(contact(c, no)));
    return P;
  }

  const CSS = `
.pg.ks{width:794px;height:1123px;position:relative;overflow:hidden;background-color:var(--bg);color:var(--ink);font-family:var(--bf);font-size:11.5px;margin-bottom:16px}
.ks .k-head{position:absolute;left:44px;right:44px;top:30px;display:flex;justify-content:space-between;font-size:9px;letter-spacing:.2em;color:var(--muted);border-bottom:1px solid var(--line);padding-bottom:9px;z-index:3}
.ks .k-foot{position:absolute;left:44px;right:44px;bottom:26px;display:flex;justify-content:space-between;font-size:9px;letter-spacing:.14em;color:var(--muted);border-top:1px solid var(--line);padding-top:9px;z-index:3}
.ks h2,.ks h3{font-family:var(--hf);margin:0;font-weight:500}
.ks .k-h2{position:absolute;font-size:36px;line-height:1.1;color:var(--ink);letter-spacing:.02em;z-index:3}
.ks .k-sub{position:absolute;font-size:12px;color:var(--muted);z-index:3}
.ks .k-bar{position:absolute;left:44px;top:96px;width:6px;height:86px;background:var(--acc);z-index:3}
.ks .k-brand{position:absolute;left:44px;top:56px;font-family:var(--hf);font-weight:600;letter-spacing:.04em;max-width:560px;line-height:1.1}
.ks .k-brandsub{position:absolute;left:46px;top:106px;font-size:10px;letter-spacing:.32em;color:var(--acc)}
.ks .k-big{position:absolute;left:60px;top:812px;font-family:var(--hf);font-style:italic;font-weight:500;font-size:96px;line-height:.95;color:var(--ink);z-index:2;max-width:520px}
.ks .k-tri{position:absolute;left:60px;top:968px;display:flex;align-items:center;gap:14px;font-size:14px;letter-spacing:.06em;z-index:2}
.ks .k-tri i{width:6px;height:6px;border-radius:50%;background:var(--ink);display:inline-block}
.ks .k-cov{position:absolute;left:250px;right:60px;top:1010px;font-size:11px;line-height:1.7;color:var(--muted);text-align:right}
.ks .k-col{position:absolute;z-index:3}
.ks .k-col h3{font-size:19px;margin:0 0 6px;padding-top:4px}
.ks .k-col p{margin:0 0 14px;line-height:1.7;color:var(--muted)}
.ks .k-col ul{margin:0 0 14px;padding-left:16px;line-height:1.75;color:var(--muted)}
.ks .k-contact{position:absolute;left:44px;bottom:70px;font-size:10px;line-height:1.7;color:var(--muted);width:320px}
.ks .k-kb{position:absolute;left:44px;top:560px;font-size:22px;letter-spacing:.04em;z-index:3}
.ks .k-ben{position:absolute;left:44px;top:610px;width:300px;z-index:3}
.ks .k-ben>div{margin-bottom:26px}
.ks .k-ben b{display:block;font-size:11.5px;letter-spacing:.06em;margin:4px 0}
.ks .k-ben span{font-size:11px;line-height:1.6;color:var(--muted);display:block;width:250px}
.ks .k-featt{position:absolute;left:44px;top:90px;font-family:var(--hf);font-size:20px;line-height:1.25;z-index:3}
.ks .k-featt b{font-weight:600;font-size:22px}
.ks .k-code{position:absolute;left:44px;top:176px;font-size:15px;font-weight:700;letter-spacing:.06em;z-index:3}
.ks .k-rule{position:absolute;left:44px;top:206px;width:170px;height:4px;background:var(--acc);z-index:3}
.ks .k-feat{position:absolute;left:380px;top:90px;width:250px;height:250px;border-radius:30px;background-size:cover;background-position:center;z-index:3}
.ks .k-sws{position:absolute;left:44px;top:380px;width:706px;display:grid;grid-template-columns:repeat(3,1fr);gap:30px 26px;z-index:3}
.ks .k-sws .sw{height:220px;border-radius:24px;background-size:cover;background-position:center}
.ks .k-sws b{display:block;margin-top:10px;font-family:var(--hf);font-size:16px}
.ks .k-sws small{display:block;margin-top:3px;font-size:10px;letter-spacing:.1em;color:var(--muted)}
.ks .k-spec{position:absolute;left:44px;right:44px;display:grid;grid-template-columns:1fr 1fr 1fr;border:1px solid var(--line);z-index:3}
.ks .k-spec>div{padding:16px 18px;border-right:1px solid var(--line)}
.ks .k-spec>div:last-child{border-right:0}
.ks .k-spec h4{margin:0 0 10px;font-size:10px;letter-spacing:.24em;color:var(--acc)}
.ks .k-spec p{margin:0 0 6px;font-size:13px}
.ks .k-pill{position:absolute;background:var(--dark);color:var(--onDark);padding:9px 18px;font-size:10.5px;letter-spacing:.1em;z-index:3}
.ks .k-fins{position:absolute;left:44px;right:44px;top:330px;display:grid;grid-template-columns:1fr 1fr;gap:30px 26px;z-index:3}
.ks .k-fins .fp{height:240px;border-radius:24px;background-size:cover;background-position:center}
.ks .k-fins b{display:block;margin-top:12px;font-size:12px;letter-spacing:.14em}
.ks .k-fins span{display:block;margin-top:4px;font-size:11px;line-height:1.6;color:var(--muted)}
.ks .k-apps{position:absolute;left:44px;right:44px;top:210px;height:780px;z-index:3}
.ks .k-apps>div{position:absolute}
.ks .k-apps .ap{width:100%;height:calc(100% - 28px);background-size:cover;background-position:center;border-radius:14px}
.ks .k-apps b{display:block;margin-top:8px;font-size:12px;font-weight:500;letter-spacing:.04em}
.ks .k-apps .a0{left:0;top:0;width:330px;height:290px}
.ks .k-apps .a1{left:350px;top:0;width:356px;height:340px}
.ks .k-apps .a2{left:190px;top:310px;width:320px;height:300px;z-index:2;border:6px solid var(--bg);border-radius:20px;background:var(--bg)}
.ks .k-apps .a3{left:0;top:350px;width:180px;height:430px}
.ks .k-apps .a4{left:530px;top:370px;width:176px;height:410px}
.ks .k-pats{position:absolute;left:44px;right:44px;top:210px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:34px 26px;z-index:3}
.ks .k-pats .pt{position:relative;height:300px;border-radius:22px;background-size:cover;background-position:center;overflow:hidden}
.ks .k-pats b{display:block;margin-top:10px;font-size:12px;font-weight:500}
.ks .k-tb{position:absolute;left:44px;right:44px;top:210px;z-index:3}
.ks .k-tb .r{display:grid;grid-template-columns:78px 1.5fr 1fr 1fr .6fr 1fr;gap:12px;align-items:center;padding:14px 0;border-bottom:1px solid var(--line);font-size:11px}
.ks .k-tb .r.h{font-size:9px;letter-spacing:.2em;color:var(--acc);border-bottom:2px solid var(--acc);padding:8px 0}
.ks .k-tb .t{width:78px;height:78px;border-radius:16px;background-size:cover;background-position:center}
.ks .k-tb b{display:block;font-size:12.5px}
.ks .k-tb small{display:block;color:var(--muted);font-size:9.5px;margin-top:3px}
.ks .k-qrbox{position:absolute;left:44px;right:44px;top:270px;background:var(--soft);border-radius:22px;padding:30px;display:grid;grid-template-columns:1fr 1fr;gap:26px 20px;z-index:3;text-align:center}
.ks .k-qrbox img{width:150px;height:150px;background:#fff;padding:8px;display:block;margin:0 auto 8px;box-sizing:content-box}
.ks .k-qrbox b{display:block;font-size:12px;letter-spacing:.12em}
.ks .k-qrbox small{font-size:10px;color:var(--muted)}
.ks .k-noqr{grid-column:1/3;padding:60px 0;color:var(--muted)}
.ks .k-addr{position:absolute;left:44px;right:44px;top:800px;display:grid;grid-template-columns:1fr 1fr;gap:30px;z-index:3}
.ks .k-addr h4{margin:0 0 8px;font-size:14px;letter-spacing:.14em;font-family:var(--hf)}
.ks .k-addr p{margin:0 0 6px;font-size:12px;line-height:1.7;color:var(--muted)}
`;

  window.KOTASTONE_TEMPLATES = { list: TEMPLATES, css: CSS, render, pageCount };
})();
