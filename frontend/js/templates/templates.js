/* Catalogue templates.
   A template = cover style + product-page layout + colour theme (+ optional story page) + closing contact page.
   The number of pages depends on the number of products and the layout (cover + product pages + closing page).
   Every builder returns the HTML of one A4 page (794 x 1123 px). */
(function () {
  const E = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const bgi = (u, pos) => `background-image:url(${u});background-position:${pos || 'center'}`;
  const spec = it => [it.colour, it.material, it.size].filter(Boolean).join(' · ');
  const fsz = (txt, big, small, limit) => (txt.length > limit ? small : big);
  const pn = n => String(n).padStart(2, '0');

  /* ---------------- covers ---------------- */
  const covers = {
    arch: c => `<div class="t-frame"></div>
      <div class="t-run2"><span>VOLUME I</span><span>${E(c.info.district).toUpperCase()}</span><span>${c.year}</span></div>
      <div class="t-arch"><div class="ph" style="${bgi(c.hero)}"></div></div>
      <div class="t-brandc" style="font-size:${fsz(c.info.ent, 40, 28, 20)}px">${E(c.info.ent).toUpperCase()}</div>
      <div class="t-subc">${E(c.info.product).toUpperCase()} · ${E(c.info.district).toUpperCase()}</div>
      <div class="t-rule1"></div><div class="t-tagc">${E(c.tagline)}</div>
      <div class="t-botc">THE CATALOGUE ${c.year}<br>${E(c.useShort)}</div>`,
    bleed: c => `<div class="t-hero ph" style="${bgi(c.hero)}"></div><div class="t-herofade"></div>
      <div class="t-bt">${E(c.info.district).toUpperCase()} · RAJASTHAN</div>
      <div class="t-bh"><small>${E(c.info.product).toUpperCase()}</small><h1 style="font-size:${fsz(c.info.ent, 46, 34, 24)}px">${E(c.info.ent)}</h1></div>
      <div class="t-band"><h4>${c.cats ? 'RANGE AT A GLANCE' : 'OUR RANGE'}</h4>
        <div class="t-sw">${c.items.slice(0, 4).map(it => `<div class="ph" style="${bgi(it.img)}"><span>${E(it.name.split(' ').slice(0, 2).join(' ').toUpperCase())}</span></div>`).join('')}</div>
        <div class="t-facts"><div><b>${c.items.length} products</b>in this catalogue</div><div><b>${E(c.info.district)}</b>Rajasthan, India</div><div><b>${E(c.info.use.split(',')[0] || 'Quality')}</b>and more</div><div><b>Custom</b>orders welcome</div></div>
        <div class="t-cont"><span>${E(c.info.person)} · ${E(c.info.mobile)}</span><span>${E(c.info.email)}</span></div></div>`,
    split: c => `<div class="t-left"><div class="t-vt">${E(c.info.district).toUpperCase()} · ${E(c.info.product).toUpperCase()}</div>
        <h1 style="font-size:${fsz(c.info.ent, 40, 30, 20)}px">${E(c.info.ent)}</h1><p>${E(c.short)}</p>
        <div class="t-st">${c.copy.steps.map((x, k) => `<b>${k + 1}</b>${E(x)}`).join('<br>')}</div></div>
      <div class="t-rp ph" style="${bgi(c.hero)}"><div class="t-cap2"><small>${E(c.info.product).toUpperCase()}</small>${E(c.tagline)}</div></div>`,
    farm: c => `<div class="t-topbar"></div><div class="t-logo">${E(c.info.ent).toUpperCase()}<small>${E(c.info.district).toUpperCase()} · RAJASTHAN</small></div><div class="t-badge">${E(c.copy.badge)}</div>
      <h1 class="t-h1f">${E(c.copy.titleA)} <em>${E(c.copy.titleB)}</em></h1><div class="t-subf">${E(c.short)}</div>
      <div class="t-bigp ph" style="${bgi(c.hero)}"></div>
      <div class="t-factsf"><div><b>${E(c.info.district)}</b>Origin</div><div><b>${c.items.length}</b>Products</div><div><b>${E(c.items[0] && c.items[0].moq || 'On request')}</b>Minimum order</div><div><b>Pan-India</b>Delivery</div></div>
      <div class="t-proc"><h4>HOW IT REACHES YOU</h4><div class="t-steps">${c.copy.process.map((x, k) => `<div><i>${k + 1}</i>${E(x[0])}<small>${E(x[1])}</small></div>`).join('')}</div></div>
      <div class="t-cnf"><span>${E(c.info.person)} · ${E(c.info.mobile)}</span><span>${E(c.info.email)}</span></div>`,
    type: c => `<div class="t-ty1" style="font-size:${fsz(c.info.product, 92, 64, 12)}px">${E(c.info.product)}</div><div class="t-ty2">catalogue ${c.year}</div>
      <div class="t-tyl"></div><div class="t-ty3">${E(c.info.ent)}<br><small>${E(c.info.district)}, Rajasthan</small></div>
      <div class="t-collage"><div class="ph" style="${bgi(c.items[0].img)}"></div><div class="ph" style="${bgi((c.items[1] || c.items[0]).img)}"></div><div class="ph" style="${bgi((c.items[2] || c.items[0]).img)}"></div></div>
      <div class="t-tyb"><span>${E(c.tagline)}</span><span>${c.info.mobile}</span></div>`,
    frame: c => `<div class="t-bframe"></div><div class="t-mat"><div class="ph" style="${bgi(c.hero)}"></div></div>
      <div class="t-seal"><b>${E(c.copy.seal[0])}</b><b>${E(c.copy.seal[1])}</b><span>${E(c.info.district).toUpperCase()}</span></div>
      <div class="t-brandf" style="font-size:${fsz(c.info.ent, 34, 26, 22)}px">${E(c.info.ent)}</div>
      <div class="t-subf2">${E(c.info.product).toUpperCase()} · CATALOGUE ${c.year}</div>`
  };

  /* ---------------- product pages ---------------- */
  const run = (c, label, no) => `<div class="t-run"><span>${E(c.info.ent).toUpperCase()}</span><span>${label}</span><span>${pn(no)}</span></div>`;
  const pfoot = c => `<div class="t-pfoot"><span>${E(c.info.ent).toUpperCase()} · ${E(c.info.district).toUpperCase()}</span><span>${E(c.info.mobile)}</span></div>`;
  const prods = {
    grid: { per: 8, html: (c, items, no) => `${run(c, E(c.info.product).toUpperCase(), no)}
      <div class="t-lab">THE COLLECTION</div><h3 class="t-ptitle">${E(c.title1)} <i>${E(c.title2)}</i></h3>
      <div class="t-g4">${items.map(it => `<div><div class="ph t-p34" style="${bgi(it.img)}"></div><div class="t-nm">${E(it.name)}</div><div class="t-sp">${E(spec(it))}</div><div class="t-pr">${E(it.price)}</div></div>`).join('')}</div>${pfoot(c)}` },
    specrows: { per: 3, html: (c, items, no) => `${run(c, 'SPECIFICATIONS', no)}<h3 class="t-ptitle">${E(c.title1)} <i>${E(c.title2)}</i></h3>
      ${items.map((it, k) => `<div class="t-item" style="top:${140 + k * 288}px"><div class="ph t-iph" style="${bgi(it.img)}"></div><div class="t-itx"><div class="t-nm2">${E(it.name)}</div>
        <div class="t-sg">${[['Size', it.size], ['Material', it.material], ['Colour', it.colour], ['Min. order', it.moq]].filter(r => r[1]).map(r => `<div><span>${r[0]}</span><b>${E(r[1])}</b></div>`).join('')}</div>
        <div class="t-pr2">${E(it.price)}</div></div></div>`).join('')}${pfoot(c)}` },
    masonry: { per: 5, html: (c, items, no) => {
      const sp = [[4, 3], [2, 3], [2, 2], [2, 2], [2, 2]];
      return `${run(c, 'THE COLLECTION', no)}<h3 class="t-ptitle">${E(c.title1)} <i>${E(c.title2)}</i></h3>
      <div class="t-mas">${items.map((it, k) => `<div class="c ph" style="grid-column:span ${sp[k][0]};grid-row:span ${sp[k][1]};${bgi(it.img)}"><span>${E(it.name)}<small>${E([it.size, it.price].filter(Boolean).join(' · '))}</small></span></div>`).join('')}</div>${pfoot(c)}`; } },
    table: { per: 5, html: (c, items, no) => `${run(c, 'PRODUCTS &amp; PRICE LIST', no)}<h3 class="t-ptitle">${E(c.title1)} <i>${E(c.title2)}</i></h3>
      <div class="t-tb"><div class="t-tr h"><span>Photo</span><span>Product</span><span>Size</span><span>Packing / finish</span><span>MOQ</span><span>Price</span></div>
      ${items.map(it => `<div class="t-tr"><div class="ph t-tph" style="${bgi(it.img)}"></div><div><b>${E(it.name)}</b><span class="g">${E(it.colour || 'Standard')}</span></div><span>${E(it.size)}</span><span>${E(it.material)}</span><span>${E(it.moq)}</span><b>${E(it.price)}</b></div>`).join('')}</div>${pfoot(c)}` },
    cards2: { per: 4, html: (c, items, no) => `${run(c, 'OUR RANGE', no)}<h3 class="t-ptitle">${E(c.title1)} <i>${E(c.title2)}</i></h3>
      <div class="t-c2">${items.map(it => `<div class="t-card"><div class="ph t-cph" style="${bgi(it.img)}"></div><div class="t-cb"><div class="t-nm2">${E(it.name)}</div><div class="t-sp2">${E(spec(it))}</div><div class="t-cr"><b>${E(it.price)}</b>${it.moq ? `<span>MOQ ${E(it.moq)}</span>` : ''}</div></div></div>`).join('')}</div>${pfoot(c)}` },
    feature: { per: 3, html: (c, items, no) => `${run(c, 'FEATURED', no)}
      <div class="t-feat"><div class="ph t-fph" style="${bgi(items[0].img)}"></div><div class="t-ftx"><div class="t-lab">FEATURED PIECE</div><div class="t-nm3">${E(items[0].name)}</div><div class="t-sp">${E(spec(items[0]))}</div><div class="t-pr3">${E(items[0].price)}</div>${items[0].moq ? `<div class="t-chip">MOQ ${E(items[0].moq)}</div>` : ''}</div></div>
      <div class="t-two">${items.slice(1).map(it => `<div><div class="ph t-tw" style="${bgi(it.img)}"></div><div class="t-nm">${E(it.name)}</div><div class="t-sp">${E(spec(it))}</div><div class="t-pr">${E(it.price)}</div></div>`).join('')}</div>${pfoot(c)}` },
    tall: { per: 3, html: (c, items, no) => `${run(c, 'THE EDIT', no)}<h3 class="t-ptitle">${E(c.title1)} <i>${E(c.title2)}</i></h3>
      <div class="t-g3">${items.map(it => `<div><div class="ph t-tall" style="${bgi(it.img)}"></div><div class="t-nm2">${E(it.name)}</div><div class="t-sp">${E(spec(it))}</div><div class="t-pr">${E(it.price)}</div></div>`).join('')}</div>${pfoot(c)}` },
    alt: { per: 4, html: (c, items, no) => `${run(c, 'THE COLLECTION', no)}
      ${items.map((it, k) => `<div class="t-alt ${k % 2 ? 'r' : ''}" style="top:${86 + k * 238}px"><div class="ph t-aph" style="${bgi(it.img)}"></div><div class="t-atx"><div class="t-lab">${pn(it._n)}</div><div class="t-nm3">${E(it.name)}</div><div class="t-sp">${E(spec(it))}</div><div class="t-pr">${E(it.price)}${it.moq ? ' · MOQ ' + E(it.moq) : ''}</div></div></div>`).join('')}${pfoot(c)}` }
  };

  /* ---------------- story + closing ---------------- */
  const story = (c, no) => `${run(c, 'OUR STORY', no)}<div class="t-lab" style="top:100px">${E(c.info.district).toUpperCase()} · ONE PRODUCT</div>
    <h2 class="t-sh">${E(c.title1)} <i>${E(c.title2)}</i></h2>
    <div class="t-story"><p>${E(c.info.desc)}</p><p>${E(c.info.use ? 'Made for: ' + c.info.use + '.' : '')}</p></div>
    <div class="ph t-simg" style="${bgi((c.items[1] || c.items[0]).img)}"></div>
    <div class="t-vals">${c.copy.values.map(v => `<div><b>${E(v[0])}</b>${E(v[1])}</div>`).join('')}</div>${pfoot(c)}`;
  const closing = (c, no) => `${run(c, 'CONTACT', no)}<div class="t-endwrap"><div class="t-endbrand" style="font-size:${fsz(c.info.ent, 40, 28, 20)}px">${E(c.info.ent).toUpperCase()}</div>
    <div class="t-endsub">${E(c.info.product).toUpperCase()} · ${E(c.info.district).toUpperCase()}</div><div class="t-rule1" style="position:static;margin:18px auto"></div>
    <div class="t-endtag">${E(c.tagline)}</div>
    <div class="t-endrow"><div class="t-endinfo">${[c.info.person && `<b>${E(c.info.person)}</b>`, `☎ ${E(c.info.mobile)}`, c.info.wa && c.info.wa !== c.info.mobile ? `WhatsApp ${E(c.info.wa)}` : 'WhatsApp on same number', c.info.email && `✉ ${E(c.info.email)}`, c.info.addr && `⌂ ${E(c.info.addr)}`, c.info.gst && `GSTIN ${E(c.info.gst)}`].filter(Boolean).map(x => `<div>${x}</div>`).join('')}
      ${(c.info.socials || []).length ? `<div class="t-endsoc">${c.info.socials.map(s => `<span class="soc" data-url="${E(s[1])}"><b>${s[0]}</b> ${E(c.socialLabel ? c.socialLabel(s[1]) : s[1])}</span>`).join('')}</div>` : ''}</div>
      ${c.qr ? `<div class="t-endqr"><img class="qrimg" src="${c.qr}"><div>Scan to open<br>${E(c.pf || 'our page')}</div></div>` : ''}</div>
    <div class="t-endnote">Prices are indicative and subject to change. ${c.year}.</div></div>`;

  /* ---------------- themes ---------------- */
  const FONT = {
    cormorant: ["'Cormorant Garamond','Noto Serif Devanagari',serif", "'Jost','Noto Sans Devanagari',sans-serif"],
    playfair: ["'Playfair Display','Noto Serif Devanagari',serif", "'Poppins','Noto Sans Devanagari',sans-serif"],
    montserrat: ["'Montserrat','Noto Sans Devanagari',sans-serif", "'Montserrat','Noto Sans Devanagari',sans-serif"],
    poppins: ["'Poppins','Noto Sans Devanagari',sans-serif", "'Poppins','Noto Sans Devanagari',sans-serif"],
    lora: ["'Lora','Noto Serif Devanagari',serif", "'Montserrat','Noto Sans Devanagari',sans-serif"]
  };
  const th = (name, bg, ink, muted, acc, acc2, surface, line, onAcc, font, hw) => ({ name, bg, ink, muted, acc, acc2, surface, line, onAcc, hf: FONT[font][0], bf: FONT[font][1], hw: hw || 600 });
  const T = (id, cat, name, theme, cover, prod, withStory, t1, t2, note) => ({ id, cat, name, theme, cover, prod, withStory, t1, t2, note });

  const TEMPLATES = [
    // ---- Kota Doria (textile, editorial) ----
    T('kd1', 'Kota Doria', 'Heritage Editorial', th('Ivory & Maroon', '#fbf5ee', '#3a2a28', '#6b5a52', '#7b2d34', '#b08d57', '#efe4d3', '#d9c9b4', '#fff', 'cormorant', 500), 'arch', 'grid', true, 'Woven slowly,', 'by hand.', 'Lookbook style, 8 products per page'),
    T('kd2', 'Kota Doria', 'Framed Gallery', th('Sage & Gold', '#f3f5ef', '#28332b', '#5f6b61', '#4f6b52', '#c2a35d', '#e4e9dc', '#cfd6c6', '#fff', 'playfair', 600), 'frame', 'tall', false, 'Light as a', 'breath.', '3 tall portrait photos per page'),
    T('kd3', 'Kota Doria', 'Luxe Night', th('Midnight & Gold', '#141a2e', '#f1ead8', '#a9a48f', '#d4b06a', '#d4b06a', '#1f2742', '#34406a', '#141a2e', 'playfair', 600), 'type', 'masonry', true, 'Threads of', 'gold.', 'Dark premium gallery, 5 per page'),
    T('kd4', 'Kota Doria', 'Soft Split', th('Rose & Plum', '#fff6f6', '#3b2236', '#7d5a73', '#a8446c', '#e7b7c8', '#f8e1e8', '#ecc9d6', '#fff', 'lora', 600), 'split', 'alt', false, 'Made for', 'festivals.', 'Alternating photo rows, 4 per page'),
    T('kd5', 'Kota Doria', 'Clean Cards', th('Teal & Cream', '#f6f1e6', '#1f3a3a', '#5d7473', '#1f6f6b', '#d9a441', '#e6ecdf', '#cbd8d0', '#fff', 'montserrat', 700), 'bleed', 'cards2', false, 'Our', 'weaves.', '2 x 2 cards, 4 per page'),
    // ---- Kota Stone (building material) ----
    T('ks1', 'Kota Stone', 'Technical Sheet', th('Slate & Teal', '#f4f6f5', '#1f2a29', '#6b7c7a', '#2d3b3a', '#5f8f89', '#e3efed', '#d3dedc', '#fff', 'montserrat', 700), 'bleed', 'specrows', false, 'Slabs &', 'tiles.', 'Spec sheet, 3 per page'),
    T('ks2', 'Kota Stone', 'Bold Industrial', th('Charcoal & Amber', '#1f2124', '#f2f2f2', '#a7abb0', '#f0a830', '#f0a830', '#2a2d31', '#3c4046', '#1f2124', 'montserrat', 700), 'type', 'table', false, 'The stone', 'range.', 'Price-list table, 5 per page'),
    T('ks3', 'Kota Stone', 'Modern Grid', th('Concrete & Blue', '#eef1f3', '#1c2a33', '#62737d', '#2f6f95', '#2f6f95', '#dde5ea', '#ccd6dc', '#fff', 'poppins', 600), 'split', 'cards2', false, 'Built to', 'last.', 'Cards, 4 per page'),
    T('ks4', 'Kota Stone', 'Natural Story', th('Warm Stone & Olive', '#f2eee6', '#2b2a22', '#6f6d5e', '#6b7a3a', '#b9a46a', '#e5dfcf', '#d3cbb7', '#fff', 'lora', 600), 'frame', 'masonry', true, 'Cut from', 'the earth.', 'Gallery, 5 per page'),
    T('ks5', 'Kota Stone', 'Minimal Mono', th('White & Black', '#ffffff', '#111111', '#777777', '#111111', '#b9b9b9', '#f1f1f1', '#dddddd', '#fff', 'montserrat', 700), 'bleed', 'feature', false, 'Simply', 'stone.', 'Feature + 2, 3 per page'),
    // ---- Sandstone (carved stone / craft) ----
    T('ss1', 'Sandstone', 'Heritage Poster', th('Terracotta', '#f4e8d6', '#2b2623', '#8a6a55', '#a9553a', '#a9553a', '#ead9bf', '#d3bfa3', '#f7e9d4', 'playfair', 700), 'split', 'masonry', false, 'Carved &', 'cut to order.', 'Gallery, 5 per page'),
    T('ss2', 'Sandstone', 'Refined Spread', th('Sand & Charcoal', '#efe4d0', '#2b2623', '#7a6b5c', '#2b2623', '#a9553a', '#e2d3b8', '#cdbb9b', '#f4e8d6', 'cormorant', 600), 'type', 'alt', true, 'Shaped by', 'hand.', 'Large alternating rows, 4 per page'),
    T('ss3', 'Sandstone', 'Royal Court', th('Maroon & Gold', '#4a1620', '#f6e7c8', '#cdb88f', '#d9a441', '#d9a441', '#5a2230', '#7a3a47', '#4a1620', 'playfair', 600), 'arch', 'tall', true, 'A palace', 'in stone.', 'Royal Rajasthani, 3 tall photos'),
    T('ss4', 'Sandstone', 'Warm Showcase', th('Pink City', '#fbeee9', '#3b2420', '#8d6a63', '#c4574a', '#e3a79b', '#f4d9d1', '#e8c4ba', '#fff', 'lora', 600), 'frame', 'cards2', false, 'From the', 'pink city.', 'Cards, 4 per page'),
    T('ss5', 'Sandstone', 'Spec Sheet', th('Natural Earth', '#f4f1ea', '#2f2a24', '#7b7466', '#7a5c3e', '#b99b73', '#e8e2d4', '#d6cdb9', '#fff', 'poppins', 600), 'split', 'specrows', false, 'Stone', 'details.', 'Spec rows, 3 per page'),
    // ---- Garlic (farm / trade) ----
    T('gl1', 'Garlic', 'Price List', th('Fresh Green', '#ffffff', '#1f2d22', '#6a766c', '#2f6b3a', '#8d5a8f', '#e4f1e5', '#dfe8df', '#fff', 'poppins', 600), 'farm', 'table', false, 'Our', 'range.', 'Comparison table, 5 per page'),
    T('gl2', 'Garlic', 'Friendly Farm', th('Purple Garlic', '#faf6fb', '#2c1f33', '#7a6882', '#6a3d7a', '#c9a8d8', '#efe3f4', '#e0cfe8', '#fff', 'playfair', 600), 'arch', 'cards2', false, 'Fresh from', 'the farm.', 'Cards, 4 per page'),
    T('gl3', 'Garlic', 'Rustic Harvest', th('Cream & Earth', '#f7f1e3', '#3a2f1e', '#7b6f58', '#8a5a2b', '#c9b37a', '#ece2c8', '#d9cdae', '#fff', 'cormorant', 600), 'farm', 'grid', true, 'Grown with', 'patience.', 'Rustic grid, 8 per page'),
    T('gl4', 'Garlic', 'Corporate Export', th('Export Navy', '#ffffff', '#0f2740', '#5f7387', '#0f4c81', '#e8b730', '#e6eef6', '#d3dfeb', '#fff', 'montserrat', 700), 'farm', 'feature', false, 'Quality you', 'can trade.', 'Feature + 2, 3 per page'),
    T('gl5', 'Garlic', 'Fresh Modern', th('Bold Lime', '#f6ffe9', '#14301a', '#5f7a62', '#3d9a2b', '#ffd23f', '#e2f5cf', '#cfe6b6', '#fff', 'poppins', 700), 'type', 'masonry', false, 'Taste the', 'difference.', 'Colourful gallery, 5 per page')
  ];

  /* ---------------- css ---------------- */
  const CSS = `
.pg.tp{width:794px;height:1123px;position:relative;overflow:hidden;background-color:var(--bg);color:var(--ink);font-family:var(--bf);font-size:12px;margin-bottom:16px}
.tp .ph{background-size:cover;background-position:center;background-color:var(--surface)}
.tp h1,.tp h2,.tp h3{font-family:var(--hf);margin:0;font-weight:var(--hw)}
.tp i{font-style:italic;color:var(--acc)}
.tp .t-run{position:absolute;left:44px;right:44px;top:34px;display:flex;justify-content:space-between;font-size:9px;letter-spacing:.24em;color:var(--muted);border-bottom:1px solid var(--line);padding-bottom:10px}
.tp .t-pfoot{position:absolute;left:44px;right:44px;bottom:30px;display:flex;justify-content:space-between;font-size:8.5px;letter-spacing:.2em;color:var(--muted);border-top:1px solid var(--line);padding-top:10px}
.tp .t-lab{font-size:10px;letter-spacing:.22em;color:var(--acc2);font-weight:600}
.tp .t-ptitle{position:absolute;left:44px;top:84px;font-size:38px;line-height:1.1}
.tp .t-nm{font-family:var(--hf);font-size:15px;line-height:1.2;margin-top:8px;font-weight:var(--hw)}
.tp .t-nm2{font-family:var(--hf);font-size:18px;line-height:1.2;font-weight:var(--hw);color:var(--ink)}
.tp .t-nm3{font-family:var(--hf);font-size:26px;line-height:1.15;margin:8px 0;font-weight:var(--hw)}
.tp .t-sp{font-size:9.5px;color:var(--muted);margin-top:4px;line-height:1.45}
.tp .t-sp2{font-size:11px;color:var(--muted);margin-top:4px;line-height:1.45}
.tp .t-pr{font-family:var(--hf);font-size:15px;margin-top:5px;color:var(--acc);font-weight:var(--hw)}
.tp .t-pr2{margin-top:12px;font-family:var(--hf);font-size:18px;color:var(--acc);font-weight:var(--hw)}
.tp .t-pr3{font-family:var(--hf);font-size:24px;color:var(--acc);margin-top:10px;font-weight:var(--hw)}
.tp .t-chip{display:inline-block;margin-top:10px;background:var(--surface);color:var(--ink);padding:4px 12px;border-radius:99px;font-size:10.5px;font-weight:600}
.tp .soc{display:inline-block;border:1px solid var(--acc);color:var(--ink);border-radius:99px;padding:2px 10px;font-size:10px;margin:3px 5px 0 0;white-space:nowrap}
/* covers */
.tp .t-frame{position:absolute;left:18px;right:18px;top:18px;bottom:18px;border:1px solid var(--acc2)}
.tp .t-run2{position:absolute;left:44px;right:44px;top:42px;display:flex;justify-content:space-between;font-size:10px;letter-spacing:.28em;color:var(--muted)}
.tp .t-arch{position:absolute;left:217px;top:110px;width:360px;height:470px;border-radius:180px 180px 0 0;overflow:hidden;border:1px solid var(--acc2);padding:8px}
.tp .t-arch .ph{width:344px;height:452px;border-radius:172px 172px 0 0}
.tp .t-brandc{position:absolute;left:30px;right:30px;top:628px;text-align:center;font-family:var(--hf);letter-spacing:.22em;font-weight:var(--hw);line-height:1.15}
.tp .t-subc{position:absolute;left:0;right:0;top:726px;text-align:center;font-size:11px;letter-spacing:.4em;color:var(--muted)}
.tp .t-rule1{position:absolute;left:377px;width:40px;top:768px;height:1px;background:var(--acc2)}
.tp .t-tagc{position:absolute;left:60px;right:60px;top:792px;text-align:center;font-family:var(--hf);font-style:italic;font-size:24px;color:var(--acc);line-height:1.3}
.tp .t-botc{position:absolute;left:0;right:0;bottom:70px;text-align:center;font-size:10px;letter-spacing:.3em;color:var(--ink);line-height:2}
.tp .t-hero{position:absolute;left:0;top:0;width:794px;height:640px}
.tp .t-herofade{position:absolute;left:0;top:0;width:794px;height:640px;background:linear-gradient(180deg,rgba(0,0,0,.12),rgba(0,0,0,.7))}
.tp .t-bt{position:absolute;left:44px;top:40px;color:#fff;font-size:11px;letter-spacing:.3em}
.tp .t-bh{position:absolute;left:44px;bottom:500px;color:#fff;width:690px}
.tp .t-bh small{font-size:12px;letter-spacing:.28em;color:var(--acc2);font-weight:600}
.tp .t-bh h1{margin-top:8px;line-height:1.05}
.tp .t-band{position:absolute;left:0;right:0;top:640px;height:483px;background:var(--acc);color:var(--onAcc)}
.tp .t-band h4{margin:34px 44px 12px;font-size:11px;letter-spacing:.28em;opacity:.85;font-weight:600}
.tp .t-sw{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:0 44px}
.tp .t-sw .ph{height:150px;position:relative}
.tp .t-sw span{position:absolute;left:0;right:0;bottom:0;background:rgba(0,0,0,.6);color:#fff;font-size:9.5px;letter-spacing:.12em;padding:6px 8px;font-weight:600}
.tp .t-facts{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:26px 44px 0}
.tp .t-facts div{border-top:2px solid var(--acc2);padding-top:8px;font-size:11px;line-height:1.5;opacity:.95}
.tp .t-facts b{display:block;font-size:13px}
.tp .t-cont{position:absolute;left:44px;right:44px;bottom:30px;font-size:11px;border-top:1px solid rgba(255,255,255,.3);padding-top:12px;display:flex;justify-content:space-between;opacity:.9}
.tp .t-left{position:absolute;left:0;top:0;width:300px;height:1123px;background:var(--acc);color:var(--onAcc)}
.tp .t-vt{position:absolute;left:-90px;top:140px;width:300px;transform:rotate(-90deg);font-size:11px;letter-spacing:.35em;white-space:nowrap}
.tp .t-left h1{position:absolute;left:70px;right:24px;top:300px;line-height:1.1}
.tp .t-left p{position:absolute;left:70px;right:30px;top:540px;margin:0;font-size:11.5px;line-height:1.7;opacity:.92}
.tp .t-st{position:absolute;left:70px;right:24px;bottom:70px;font-size:11px;line-height:2.2;letter-spacing:.08em}
.tp .t-st b{display:inline-block;width:22px;height:22px;border-radius:50%;background:var(--onAcc);color:var(--acc);text-align:center;line-height:22px;margin-right:10px;font-size:11px}
.tp .t-rp{position:absolute;left:300px;top:0;width:494px;height:1123px}
.tp .t-cap2{position:absolute;left:0;right:0;bottom:0;padding:90px 36px 44px;color:#fff;font-size:24px;font-style:italic;font-family:var(--hf);background:linear-gradient(180deg,rgba(0,0,0,0),rgba(0,0,0,.72))}
.tp .t-cap2 small{display:block;font-family:var(--bf);font-style:normal;font-size:10px;letter-spacing:.28em;margin-bottom:6px}
.tp .t-topbar{position:absolute;left:0;right:0;top:0;height:14px;background:var(--acc)}
.tp .t-logo{position:absolute;left:44px;top:46px;font-weight:700;font-size:15px;color:var(--acc);letter-spacing:.04em}
.tp .t-logo small{display:block;font-weight:400;color:var(--muted);font-size:10px;letter-spacing:.2em;margin-top:2px}
.tp .t-badge{position:absolute;right:44px;top:44px;background:var(--surface);color:var(--ink);font-size:10.5px;font-weight:600;padding:6px 14px;border-radius:99px}
.tp .t-h1f{position:absolute;left:44px;top:130px;width:330px;font-size:40px;line-height:1.1}
.tp .t-h1f em{font-style:normal;color:var(--acc)}
.tp .t-subf{position:absolute;left:44px;top:350px;width:320px;font-size:12.5px;line-height:1.7;color:var(--muted)}
.tp .t-bigp{position:absolute;right:44px;top:120px;width:360px;height:440px;border-radius:26px}
.tp .t-factsf{position:absolute;left:44px;right:44px;top:610px;display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
.tp .t-factsf div{background:var(--surface);border-radius:12px;padding:14px;font-size:11px;color:var(--muted);line-height:1.5}
.tp .t-factsf b{display:block;font-size:15px;color:var(--acc);margin-bottom:2px}
.tp .t-proc{position:absolute;left:44px;right:44px;top:770px}
.tp .t-proc h4{margin:0 0 14px;font-size:11px;letter-spacing:.25em;color:var(--acc2);font-family:var(--bf)}
.tp .t-steps{display:flex}
.tp .t-steps div{flex:1;text-align:center;font-size:11.5px;font-weight:600;position:relative}
.tp .t-steps i{display:block;margin:0 auto 8px;width:46px;height:46px;border-radius:50%;background:var(--acc);color:var(--onAcc);font-style:normal;line-height:46px;font-size:18px}
.tp .t-steps small{display:block;font-weight:400;color:var(--muted);font-size:10px;margin-top:2px}
.tp .t-cnf{position:absolute;left:44px;right:44px;bottom:36px;border-top:1px solid var(--line);padding-top:12px;display:flex;justify-content:space-between;font-size:11px;color:var(--muted)}
.tp .t-ty1{position:absolute;left:44px;top:70px;font-family:var(--hf);font-weight:var(--hw);line-height:.95;color:var(--ink);letter-spacing:-.01em;width:710px}
.tp .t-ty2{position:absolute;left:46px;top:260px;font-size:13px;letter-spacing:.35em;color:var(--acc);font-weight:600;text-transform:uppercase}
.tp .t-tyl{position:absolute;left:44px;right:44px;top:310px;height:3px;background:var(--acc)}
.tp .t-ty3{position:absolute;left:44px;top:332px;font-family:var(--hf);font-size:22px;font-weight:var(--hw)}
.tp .t-ty3 small{display:block;font-family:var(--bf);font-size:11px;color:var(--muted);margin-top:4px;font-weight:400}
.tp .t-collage{position:absolute;left:44px;right:44px;top:420px;height:600px;display:grid;grid-template-columns:1.2fr 1fr 1fr;gap:12px}
.tp .t-collage .ph:nth-child(2){margin-top:70px}
.tp .t-collage .ph:nth-child(3){margin-top:140px}
.tp .t-tyb{position:absolute;left:44px;right:44px;bottom:36px;display:flex;justify-content:space-between;font-size:11px;color:var(--muted);border-top:1px solid var(--line);padding-top:12px}
.tp .t-bframe{position:absolute;left:20px;right:20px;top:20px;bottom:20px;border:3px solid var(--acc)}
.tp .t-mat{position:absolute;left:70px;top:70px;width:654px;height:720px;border:1px solid var(--acc2);padding:14px;background:var(--bg)}
.tp .t-mat .ph{width:624px;height:690px}
.tp .t-seal{position:absolute;left:560px;top:690px;width:150px;height:150px;border-radius:50%;background:var(--acc);color:var(--onAcc);text-align:center;padding-top:34px;border:5px solid var(--bg);font-size:20px;line-height:1.05}
.tp .t-seal b{display:block;font-family:var(--hf)}
.tp .t-seal span{display:block;font-size:8px;letter-spacing:.2em;margin-top:6px}
.tp .t-brandf{position:absolute;left:60px;right:60px;top:850px;text-align:center;font-family:var(--hf);font-weight:var(--hw);line-height:1.15}
.tp .t-subf2{position:absolute;left:0;right:0;top:960px;text-align:center;font-size:11px;letter-spacing:.35em;color:var(--muted)}
/* product pages */
.tp .t-g4{position:absolute;left:44px;right:44px;top:170px;display:grid;grid-template-columns:repeat(4,1fr);gap:22px 14px}
.tp .t-p34{height:196px}
.tp .t-g3{position:absolute;left:44px;right:44px;top:170px;display:grid;grid-template-columns:repeat(3,1fr);gap:18px}
.tp .t-tall{height:640px;margin-bottom:12px}
.tp .t-item{position:absolute;left:44px;right:44px;height:262px;background:var(--surface);display:flex;border-left:5px solid var(--acc)}
.tp .t-iph{width:300px;flex:none}
.tp .t-itx{padding:16px 20px;flex:1}
.tp .t-sg{display:grid;grid-template-columns:1fr 1fr;gap:8px 14px;margin-top:12px;font-size:11px}
.tp .t-sg span{display:block;color:var(--muted);font-size:9px;letter-spacing:.1em;text-transform:uppercase}
.tp .t-sg b{font-weight:600}
.tp .t-mas{position:absolute;left:44px;right:44px;top:160px;display:grid;grid-template-columns:repeat(6,1fr);grid-auto-rows:118px;gap:12px}
.tp .t-mas .c{position:relative}
.tp .t-mas .c span{position:absolute;left:0;right:0;bottom:0;background:linear-gradient(0deg,rgba(0,0,0,.82),rgba(0,0,0,0));color:#fff;padding:26px 10px 8px;font-size:12px;font-family:var(--hf)}
.tp .t-mas .c small{display:block;font-size:9px;opacity:.85;margin-top:2px;font-family:var(--bf)}
.tp .t-tb{position:absolute;left:44px;right:44px;top:150px}
.tp .t-tr{display:grid;grid-template-columns:130px 1.4fr 80px 110px 70px 100px;gap:12px;align-items:center;padding:10px 0;border-bottom:1px solid var(--line);font-size:11px}
.tp .t-tr.h{font-size:9px;letter-spacing:.14em;color:var(--acc2);font-weight:600;text-transform:uppercase;border-bottom:2px solid var(--acc)}
.tp .t-tph{height:88px;border-radius:8px}
.tp .t-tr b{display:block;font-size:13px}
.tp .t-tr .g{display:inline-block;margin-top:4px;background:var(--surface);color:var(--ink);font-size:9.5px;padding:2px 9px;border-radius:99px;font-weight:600}
.tp .t-c2{position:absolute;left:44px;right:44px;top:160px;display:grid;grid-template-columns:1fr 1fr;gap:18px}
.tp .t-card{background:var(--surface);border-radius:6px;overflow:hidden;height:420px}
.tp .t-cph{height:262px}
.tp .t-cb{padding:14px 16px}
.tp .t-cr{display:flex;justify-content:space-between;align-items:center;margin-top:10px}
.tp .t-cr b{font-family:var(--hf);font-size:16px;color:var(--acc)}
.tp .t-cr span{font-size:10px;background:var(--bg);padding:3px 10px;border-radius:99px}
.tp .t-feat{position:absolute;left:44px;right:44px;top:86px;height:400px;display:flex;background:var(--surface)}
.tp .t-fph{width:430px;flex:none}
.tp .t-ftx{padding:28px 24px;flex:1}
.tp .t-two{position:absolute;left:44px;right:44px;top:512px;display:grid;grid-template-columns:1fr 1fr;gap:18px}
.tp .t-tw{height:360px}
.tp .t-alt{position:absolute;left:44px;right:44px;height:218px;display:flex}
.tp .t-alt.r{flex-direction:row-reverse}
.tp .t-aph{width:360px;flex:none}
.tp .t-atx{flex:1;padding:18px 26px;display:flex;flex-direction:column;justify-content:center}
.tp .t-sh{position:absolute;left:44px;top:126px;font-size:44px;line-height:1.1;width:560px}
.tp .t-story{position:absolute;left:44px;top:290px;width:340px;font-size:12.5px;line-height:1.8;color:var(--muted)}
.tp .t-story p{margin:0 0 12px}
.tp .t-simg{position:absolute;left:420px;top:260px;width:330px;height:420px}
.tp .t-vals{position:absolute;left:44px;right:44px;top:760px;display:grid;grid-template-columns:repeat(3,1fr);gap:18px;border-top:1px solid var(--line);padding-top:18px}
.tp .t-vals b{display:block;font-family:var(--hf);font-size:17px;color:var(--acc);margin-bottom:4px}
.tp .t-vals div{font-size:11.5px;line-height:1.6;color:var(--muted)}
.tp .t-endwrap{position:absolute;left:60px;right:60px;top:200px;text-align:center}
.tp .t-endbrand{font-family:var(--hf);letter-spacing:.18em;font-weight:var(--hw);line-height:1.2}
.tp .t-endsub{margin-top:10px;font-size:11px;letter-spacing:.4em;color:var(--muted)}
.tp .t-endtag{font-family:var(--hf);font-style:italic;font-size:24px;color:var(--acc);margin-bottom:30px}
.tp .t-endrow{display:flex;gap:30px;justify-content:center;align-items:center;text-align:left}
.tp .t-endinfo div{margin:5px 0;font-size:13px}
.tp .t-endsoc{margin-top:10px}
.tp .t-endqr{text-align:center;font-size:10px;color:var(--muted)}
.tp .t-endqr img{width:130px;height:130px;display:block;margin:0 auto 8px;background:#fff;padding:8px;border:1px solid var(--line);box-sizing:content-box}
.tp .t-endnote{margin-top:60px;font-size:10px;color:var(--muted);letter-spacing:.1em}
`;

  /* ---------------- public api ---------------- */
  function pageCount(tpl, nItems){ return 1 + (tpl.withStory ? 1 : 0) + Math.ceil(nItems / prods[tpl.prod].per) + 1; }

  // ctx: { info, items:[{name,size,material,colour,price,moq,img}], qr, pf, socialLabel }
  function render(tpl, ctx){
    const copy = Object.assign({}, ctx.copy || window.getCopy(ctx.info));
    const tidyCut = (t, n) => { t = String(t).trim(); if (t.length <= n) return t; const cut = t.slice(0, n), dot = cut.lastIndexOf('. ');
      if (dot > n * .5) return cut.slice(0, dot + 1); return cut.slice(0, cut.lastIndexOf(' ')).replace(/[\s,;:\-–]+$/, '') + '…'; };
    const pool = copy.titlePool, ti = window.CONTENT ? window.CONTENT.hash(tpl.id) % pool.length : 0, tt = pool[ti];
    copy.titleA = copy.storyTitle[0].replace(/,$/, ''); copy.titleB = copy.storyTitle[1];
    const th = tpl.theme, c = Object.assign({}, ctx, {
      copy, year: new Date().getFullYear(), hero: (ctx.heroImg || ctx.items[0].img), title1: tt[0], title2: tt[1],
      tagline: copy.tagline,
      short: tidyCut(ctx.info.desc || '', 150), useShort: (ctx.info.use || '').split(',').slice(0, 3).join(' · ')
    });
    const style = `--bg:${th.bg};--ink:${th.ink};--muted:${th.muted};--acc:${th.acc};--acc2:${th.acc2};--surface:${th.surface};--line:${th.line};--onAcc:${th.onAcc};--hf:${th.hf};--bf:${th.bf};--hw:${th.hw};background-color:${th.bg};font-family:${th.bf}`;
    const wrap = html => `<div class="pg tp" style="${style}">${html}</div>`;
    c.items = c.items.map((it, n) => Object.assign({ _n: n + 1 }, it));
    const pages = [wrap(covers[tpl.cover](c))];
    let no = 2;
    if (tpl.withStory) pages.push(wrap(story(c, no++)));
    const per = prods[tpl.prod].per;
    for (let i = 0; i < c.items.length; i += per) pages.push(wrap(prods[tpl.prod].html(c, c.items.slice(i, i + per), no++)));
    pages.push(wrap(closing(c, no)));
    return pages;
  }

  window.CATALOGUE_TEMPLATES = { list: TEMPLATES, css: CSS, render, pageCount, perPage: t => prods[t.prod].per };
})();
