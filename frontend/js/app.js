const $ = id => document.getElementById(id);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const MIN_VARIANTS = 5, MAX_VARIANTS = 10;
const PRESETS = [['#7b2d34','Maroon'],['#b3262e','Crimson'],['#a9553a','Terracotta'],['#d9722a','Orange'],['#b8892b','Gold'],['#6b7a3a','Olive'],['#2f6b3a','Forest'],['#1e8e4e','Green'],
  ['#1f7a5a','Emerald'],['#1f6f6b','Teal'],['#0f8b8d','Aqua'],['#2f7fb5','Sky blue'],['#1d6fb8','Blue'],['#2c3e91','Royal blue'],['#0f2f5c','Navy'],['#4b3fa0','Indigo'],
  ['#6a3d7a','Purple'],['#8e3b5f','Plum'],['#a8446c','Rose'],['#e0457b','Pink'],['#7a5c3e','Brown'],['#3f5560','Slate'],['#4a4a4a','Grey'],['#111111','Black']];
window.TplColor = null;

/* ---------------- state ---------------- */
let variants = [];   // {name,size,material,colour,price,moq, orig, enh, useEnh}
let color = '#1d6fb8';
let design = null;
let downloadCount = 0;

/* ---------------- district / product ---------------- */
const OTHER = '__other__';
function fillDistricts(){
  const d = $('district');
  d.innerHTML = '<option value="">— Select district —</option>' +
    Object.keys(window.ODOP_DATA).sort().map(k => `<option>${esc(k)}</option>`).join('');
}
function fillProducts(){
  const dv = $('district').value, p = $('product');
  $('districtOther').classList.toggle('hidden', dv !== OTHER);
  let list = (dv && dv !== OTHER && window.ODOP_DATA[dv]) || [];
  p.innerHTML = '<option value="">— Select product —</option>' +
    list.map(x => `<option>${esc(x)}</option>`).join('');
  if (list.length === 1) p.value = list[0];
  $('productOther').classList.toggle('hidden', p.value !== OTHER);
}
$('district').addEventListener('change', fillProducts);
$('product').addEventListener('change', () => $('productOther').classList.toggle('hidden', $('product').value !== OTHER));
const getDistrict = () => $('district').value === OTHER ? $('districtOther').value.trim() : $('district').value;
const getProduct = () => $('product').value === OTHER ? $('productOther').value.trim() : $('product').value;

/* ---------------- account link hint ---------------- */
function waHint(){
  const pf = $('platform').value;
  const n = ($('wa').value || $('mobile').value).replace(/\D/g,'');
  const h = $('waHint');
  if (pf === 'wa' && n.length === 10){
    h.innerHTML = `WhatsApp के लिए link: <code>https://wa.me/91${n}</code> <button class="btn2" style="padding:3px 8px;font-size:12px" id="useWa">यही इस्तेमाल करें</button>`;
    $('useWa').onclick = () => { $('accLink').value = 'https://wa.me/91' + n; };
  } else h.textContent = '';
}
['platform','wa','mobile'].forEach(i => $(i).addEventListener('input', waHint));

/* ---------------- photos ---------------- */
function loadImage(src){ return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; }); }

async function fileToDataURL(file, max = 2200){
  const url = URL.createObjectURL(file);
  try{
    const img = await loadImage(url);
    const s = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
    const c = document.createElement('canvas');
    c.width = Math.round(img.naturalWidth * s); c.height = Math.round(img.naturalHeight * s);
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL('image/jpeg', 0.93);
  } finally { URL.revokeObjectURL(url); }
}

// Separable 3-pass box blur (≈ gaussian) on a Float32 luminance plane.
function boxBlur(src, w, h, r){
  const pass = (inp, outp, horiz) => {
    const len = horiz ? w : h, lines = horiz ? h : w, stride = horiz ? 1 : w, ls = horiz ? w : 1, dd = 2 * r + 1;
    for (let l = 0; l < lines; l++){
      const base = l * ls; let sum = 0;
      for (let k = -r; k <= r; k++) sum += inp[base + Math.min(len - 1, Math.max(0, k)) * stride];
      for (let i = 0; i < len; i++){
        outp[base + i * stride] = sum / dd;
        sum += inp[base + Math.min(len - 1, i + r + 1) * stride] - inp[base + Math.max(0, i - r) * stride];
      }
    }
  };
  const x = new Float32Array(src), y = new Float32Array(src.length);
  for (let k = 0; k < 3; k++){ pass(x, y, true); pass(y, x, false); }
  return x;
}

// Natural-looking auto enhance (never changes the product itself):
// gentle white balance -> levels + gamma + S-curve -> vibrance -> local contrast (clarity) -> noise-safe sharpening.
// Small photos are also up-scaled smoothly (up to ~1800 px) so they stay crisp in HD. strength: 0..1
async function enhanceDataURL(src, strength = .6){
  const s = Math.max(0, Math.min(1, strength));
  const img = await loadImage(src);
  const w0 = img.naturalWidth, h0 = img.naturalHeight, long = Math.max(w0, h0);
  const up = long < 1500 ? Math.min(2, 1800 / long) : 1;
  const w = Math.round(w0 * up), h = Math.round(h0 * up), n = w * h;
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'; ctx.drawImage(img, 0, 0, w, h);
  const id = ctx.getImageData(0, 0, w, h), d = id.data;
  const clamp255 = v => v < 0 ? 0 : v > 255 ? 255 : v;

  // 1) white balance (gray-world, limited to +-10% and scaled by strength)
  let sr = 0, sg = 0, sb = 0, cnt = 0;
  for (let i = 0; i < d.length; i += 28){ const l = (d[i] + d[i+1] + d[i+2]) / 3; if (l > 25 && l < 235){ sr += d[i]; sg += d[i+1]; sb += d[i+2]; cnt++; } }
  let gr = 1, gg = 1, gb = 1;
  if (cnt > 50){
    const m = (sr + sg + sb) / 3 / cnt, cl = v => Math.max(.9, Math.min(1.1, m / (v / cnt)));
    gr = 1 + (cl(sr) - 1) * s * .8; gg = 1 + (cl(sg) - 1) * s * .8; gb = 1 + (cl(sb) - 1) * s * .8;
  }

  // 2) levels + gamma + S-curve (one lookup table)
  const hist = new Uint32Array(256); let lsum = 0;
  for (let i = 0; i < d.length; i += 4){
    const l = (clamp255(d[i] * gr) * .299 + clamp255(d[i+1] * gg) * .587 + clamp255(d[i+2] * gb) * .114) | 0; hist[l]++; lsum += l;
  }
  let acc = 0, lo = 0, hi = 255;
  for (let i = 0; i < 256; i++){ acc += hist[i]; if (acc >= n * .003){ lo = i; break; } }
  acc = 0;
  for (let i = 255; i >= 0; i--){ acc += hist[i]; if (acc >= n * .003){ hi = i; break; } }
  const range = Math.max(70, hi - lo), stretch = 1 + (255 / range - 1) * s * .9, loUse = lo * s * .9;
  const meanN = Math.min(.92, Math.max(.08, ((lsum / n) - loUse) * stretch / 255));
  const gam = 1 + (Math.max(.72, Math.min(1.4, Math.log(.48) / Math.log(meanN))) - 1) * s;
  const aS = .42 * s, lut = new Uint8ClampedArray(256);
  for (let i = 0; i < 256; i++){
    let t = Math.max(0, Math.min(1, (i - loUse) * stretch / 255));
    t = Math.pow(t, gam); t = t - aS * t * (1 - t) * (1 - 2 * t);
    lut[i] = t * 255;
  }
  // 3) apply curve + vibrance (boosts dull colours more than already vivid ones)
  const vib = .36 * s, L = new Float32Array(n);
  for (let i = 0, p = 0; i < d.length; i += 4, p++){
    let r = lut[Math.min(255, d[i] * gr | 0)], g = lut[Math.min(255, d[i+1] * gg | 0)], b = lut[Math.min(255, d[i+2] * gb | 0)];
    const l = r * .299 + g * .587 + b * .114, sat = (Math.max(r, g, b) - Math.min(r, g, b)) / 255, k = 1 + vib * (1 - sat);
    r = l + (r - l) * k; g = l + (g - l) * k; b = l + (b - l) * k;
    d[i] = clamp255(r); d[i+1] = clamp255(g); d[i+2] = clamp255(b);
    L[p] = d[i] * .299 + d[i+1] * .587 + d[i+2] * .114;
  }
  // 4) local contrast (large radius) + sharpening (small radius, soft threshold so noise is not boosted)
  const m = Math.min(w, h), rBig = Math.max(6, Math.round(m / 40)), rSm = Math.max(1, Math.round(m / 900));
  const Bbig = boxBlur(L, w, h, rBig), Bsm = boxBlur(L, w, h, rSm), clarity = .36 * s, sharp = .8 * s;
  let mad = 0, mc = 0; for (let p = 0; p < n; p += 7){ mad += Math.abs(L[p] - Bsm[p]); mc++; }
  const thr = Math.max(2, Math.min(9, 1.2 * mad / mc));   // noisier photo -> bigger threshold, so grain is not sharpened
  for (let i = 0, p = 0; i < d.length; i += 4, p++){
    let ds = L[p] - Bsm[p]; const a = Math.abs(ds);
    ds = a < thr ? 0 : (ds > 0 ? ds - thr : ds + thr);
    let delta = (L[p] - Bbig[p]) * clarity + ds * sharp;
    const tone = Math.abs(L[p] / 255 - .5) * 2; delta *= 1 - .6 * tone * tone * tone;   // go easy on deep shadows / highlights
    delta = delta > 45 ? 45 : delta < -45 ? -45 : delta;
    d[i] = clamp255(d[i] + delta); d[i+1] = clamp255(d[i+1] + delta); d[i+2] = clamp255(d[i+2] + delta);
  }
  ctx.putImageData(id, 0, 0);
  return c.toDataURL('image/jpeg', .93);
}

/* ---------------- variants UI ---------------- */
function newVariant(){ return {name:'',size:'',material:'',colour:'',price:'',moq:'',code:'',finish:'',thickness:'',photoFile:'',orig:null,enh:null,useEnh:false,strength:.6,enhStrength:null}; }
function renderVariants(){
  const host = $('variants'); host.innerHTML = '';
  variants.forEach((v, i) => {
    const el = document.createElement('div'); el.className = 'vitem';
    el.innerHTML = `
      <div class="vhead"><span>Variant ${i+1}</span>${variants.length > 1 ? '<button class="btn danger rm" type="button" style="padding:4px 10px">🗑 Delete</button>' : ''}</div>
      <div class="vbody">
        <div>
          <label class="vph" style="cursor:pointer;margin:0">
            ${v.orig ? `<img src="${v.enh && v.useEnh ? v.enh : v.orig}">` : '<div class="ph-t">📷 Tap to add photo<br><small style="font-weight:400">फ़ोटो चुनें</small></div>'}
            <input type="file" accept="image/*" class="hidden file">
          </label>
          ${v.orig ? `<div class="chk"><input type="checkbox" class="enh" ${v.useEnh?'checked':''}><span>✨ Enhance photo <small style="color:#6b7280">फ़ोटो साफ़ करें</small></span></div>
          <div class="enhctl ${v.useEnh ? '' : 'hidden'}"><input type="range" class="str" min="10" max="100" value="${Math.round((v.strength == null ? .6 : v.strength) * 100)}">
            <div class="enhrow"><small class="enhst">Strength ${Math.round((v.strength == null ? .6 : v.strength) * 100)}%</small><button type="button" class="btn2 cmp">Hold to compare</button></div></div>
          <div class="fitrow"><small>Photo in brochure <span style="opacity:.8">ब्रोशर में फ़ोटो</span></small>
            <select class="fit"><option value="auto" ${(!v.fit || v.fit === 'auto') ? 'selected' : ''}>Auto (recommended)</option><option value="full" ${v.fit === 'full' ? 'selected' : ''}>Show full photo</option><option value="fill" ${v.fit === 'fill' ? 'selected' : ''}>Fill frame (crop)</option></select></div>` : ''}
        </div>
        <div>
          <div class="row">
            <div><label>Variant / design name * <small>नाम</small></label><input type="text" data-k="name" value="${esc(v.name)}"></div>
            <div><label>Size <small>साइज़</small></label><input type="text" data-k="size" value="${esc(v.size)}" placeholder="e.g. 6 inch"></div>
          </div>
          <div class="row">
            <div><label>Material / finish <small>सामग्री</small></label><input type="text" data-k="material" value="${esc(v.material)}"></div>
            <div><label>Colour / pattern <small>रंग</small></label><input type="text" data-k="colour" value="${esc(v.colour)}"></div>
          </div>
          <div class="row">
            <div><label>Price range (optional) <small>कीमत</small></label><input type="text" data-k="price" value="${esc(v.price)}" placeholder="₹ 500 - 800"></div>
            <div><label>Min. order qty (optional) <small>न्यूनतम ऑर्डर</small></label><input type="text" data-k="moq" value="${esc(v.moq)}"></div>
          </div>
          <div class="row3">
            <div><label>Product code (optional)</label><input type="text" data-k="code" value="${esc(v.code || '')}" placeholder="#KS-01"></div>
            <div><label>Finish (optional)</label><input type="text" data-k="finish" value="${esc(v.finish || '')}" placeholder="Semi-polish"></div>
            <div><label>Thickness (optional)</label><input type="text" data-k="thickness" value="${esc(v.thickness || '')}" placeholder="18 - 20 mm"></div>
          </div>
        </div>
      </div>`;
    el.querySelectorAll('input[data-k]').forEach(inp => inp.addEventListener('input', () => { v[inp.dataset.k] = inp.value; }));
    el.querySelector('.file').addEventListener('change', async e => {
      const f = e.target.files[0]; if (!f) return;
      v.orig = await fileToDataURL(f); await ensureImg(v.orig); v.photoFile = '';
      v.enh = null; v.useEnh = false;
      renderVariants();
    });
    const enh = el.querySelector('.enh');
    if (enh){
      const pic = el.querySelector('.vph img'), ctl = el.querySelector('.enhctl'), st = el.querySelector('.enhst'), str = el.querySelector('.str'), cmp = el.querySelector('.cmp');
      let timer = null, token = 0;
      const show = () => { pic.src = v.useEnh && v.enh ? v.enh : v.orig; window.livePreview && window.livePreview(); };
      const run = async () => {
        if (v.strength == null) v.strength = .6;
        const my = ++token, k = v.strength; st.textContent = 'Enhancing…';
        const out = await enhanceDataURL(v.orig, k);
        if (my !== token) return;
        await ensureImg(out); if (my !== token) return;
        v.enh = out; v.enhStrength = k; show(); st.textContent = 'Strength ' + Math.round(k * 100) + '%';
      };
      enh.addEventListener('change', async () => {
        v.useEnh = enh.checked; ctl.classList.toggle('hidden', !v.useEnh);
        if (v.useEnh && (!v.enh || v.enhStrength !== v.strength)) await run(); else show();
      });
      str.addEventListener('input', () => { v.strength = str.value / 100; st.textContent = 'Strength ' + str.value + '%'; clearTimeout(timer); timer = setTimeout(run, 350); });
      const hold = () => { pic.src = v.orig; }, release = () => show();
      cmp.addEventListener('pointerdown', hold); ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => cmp.addEventListener(ev, release));
    }
    const fit = el.querySelector('.fit');
    if (fit) fit.addEventListener('change', () => { v.fit = fit.value; window.livePreview && window.livePreview(); });
    const rm = el.querySelector('.rm');
    if (rm) rm.addEventListener('click', () => { if (v.orig && !confirm('Delete Variant ' + (i + 1) + ' and its photo?')) return; variants.splice(i, 1); renderVariants(); });
    host.appendChild(el);
  });
  $('addVar').style.display = variants.length >= MAX_VARIANTS ? 'none' : '';
}
$('addVar').addEventListener('click', () => { if (variants.length < MAX_VARIANTS){ variants.push(newVariant()); renderVariants(); } });

/* ---------------- colours ---------------- */
function renderSwatches(){
  const on = window.TplColor ? window.TplColor.toLowerCase() : '';
  $('swatches').innerHTML = `<button class="sw sw-orig ${on ? '' : 'on'}" data-c="" title="Original colours of the design">Original</button>` +
    PRESETS.map(([c, n]) => `<button class="sw ${c.toLowerCase() === on ? 'on' : ''}" style="background:${c}" data-c="${c}" title="${n}"></button>`).join('');
  $('swatches').querySelectorAll('.sw').forEach(b => b.onclick = () => b.dataset.c ? setColor(b.dataset.c) : clearColor());
}
function colourChanged(){ renderSwatches(); window.dispatchEvent(new Event('odop:colour')); }
function setColor(c){ color = c; window.TplColor = c; $('colorPick').value = c; colourChanged(); }
function clearColor(){ window.TplColor = null; colourChanged(); }
$('colorPick').addEventListener('input', e => setColor(e.target.value));

function hexToHsl(hex){
  let r = parseInt(hex.slice(1,3),16)/255, g = parseInt(hex.slice(3,5),16)/255, b = parseInt(hex.slice(5,7),16)/255;
  const mx = Math.max(r,g,b), mn = Math.min(r,g,b); let h = 0, s = 0; const l = (mx+mn)/2;
  if (mx !== mn){ const d = mx-mn; s = l > .5 ? d/(2-mx-mn) : d/(mx+mn);
    h = mx===r ? (g-b)/d + (g<b?6:0) : mx===g ? (b-r)/d + 2 : (r-g)/d + 4; h *= 60; }
  return [h, s*100, l*100];
}
const hsl = (h,s,l) => `hsl(${h.toFixed(0)},${s.toFixed(0)}%,${l.toFixed(0)}%)`;
function palette(hex){
  const [h,s,l] = hexToHsl(hex);
  return { c: hex, cd: hsl(h, Math.min(100,s), Math.max(14, l*0.55)), cl: hsl(h, Math.min(70,s), 95) };
}

/* ---------------- design randomiser ---------------- */
const FONTSETS = [
  { b: "'Poppins','Noto Sans Devanagari',sans-serif", h: "'Poppins','Noto Sans Devanagari',sans-serif" },
  { b: "'Poppins','Noto Sans Devanagari',sans-serif", h: "'Playfair Display','Noto Serif Devanagari',serif" },
  { b: "'Montserrat','Noto Sans Devanagari',sans-serif", h: "'Montserrat','Noto Sans Devanagari',sans-serif" },
  { b: "'Lora','Noto Serif Devanagari',serif", h: "'Lora','Noto Serif Devanagari',serif" },
  { b: "'Montserrat','Noto Sans Devanagari',sans-serif", h: "'Cormorant Garamond','Noto Serif Devanagari',serif" },
  { b: "'Lora','Noto Serif Devanagari',serif", h: "'Montserrat','Noto Sans Devanagari',sans-serif" }
];
const SIDES = ['L','R','alt'], RADII = [0, 4, 8, 12];
const USED_KEY = 'odop_used_designs_v4';
const loadUsed = () => { try { return new Set(JSON.parse(localStorage.getItem(USED_KEY) || '[]')); } catch (e) { return new Set(); } };
const saveUsed = s => { try { localStorage.setItem(USED_KEY, JSON.stringify([...s].slice(-4000))); } catch (e) {} };
let usedDesigns = loadUsed();

// "Shuffle bag" per design dimension: every value is used once before any repeats,
// and a value is never picked twice in a row, so each download looks different.
const bags = {}, lastVal = {};
function shuffle(arr){ for (let i = arr.length - 1; i > 0; i--){ const k = Math.floor(Math.random() * (i + 1)); [arr[i], arr[k]] = [arr[k], arr[i]]; } return arr; }
function bagPick(name, vals){
  let b = bags[name];
  if (!b || !b.length){
    b = bags[name] = shuffle(vals.slice());
    if (b.length > 1 && b[b.length - 1] === lastVal[name]){ const t = b[0]; b[0] = b[b.length - 1]; b[b.length - 1] = t; }
  }
  const v = b.pop(); lastVal[name] = v; return v;
}
function rollDesign(){
  let nd, key, tries = 0;
  do {
    nd = {
      layout: bagPick('layout', [0, 1, 2]), header: bagPick('header', [0, 1, 2, 3, 4, 5]), card: bagPick('card', [0, 1, 2, 3, 4]),
      photoSide: bagPick('side', SIDES), fontSet: bagPick('fontSet', [0, 1, 2, 3, 4, 5]), radius: bagPick('radius', RADII),
      bg: bagPick('bg', [0, 1, 2]), sec: bagPick('sec', [0, 1, 2]), table: bagPick('table', [0, 1, 2]), code: bagPick('code', [0, 1]), foot: bagPick('foot', [0, 1, 2])
    };
    key = JSON.stringify(nd);
  } while (usedDesigns.has(key) && ++tries < 60);
  usedDesigns.add(key); saveUsed(usedDesigns);
  design = nd; return nd;
}

/* ---------------- catalogue builder ---------------- */
function qrDataUrl(text){
  const q = qrcode(0, 'M'); q.addData(text); q.make();
  return q.createDataURL(8, 2);
}
const PF = {wa:'WhatsApp Business', fb:'Facebook Page', ig:'Instagram Business'};

function collect(){
  const waNum = ($('wa').value || $('mobile').value).replace(/\D/g,'');
  return {
    district: getDistrict(), product: getProduct(), ent: $('entName').value.trim(),
    person: $('person').value.trim(), mobile: $('mobile').value.replace(/\D/g,''), wa: waNum,
    email: $('email').value.trim(), addr: $('addr').value.trim(), desc: $('desc').value.trim(), use: $('use').value.trim(),
    gst: $('gst').value.trim().toUpperCase(), logo: window.logoData || '',
    platform: $('platform').value, link: $('accLink').value.trim(),
    socials: [['Instagram', $('socIg').value.trim()], ['Facebook', $('socFb').value.trim()], ['YouTube', $('socYt').value.trim()], ['Website', $('socWeb').value.trim()]].filter(s => s[1])
  };
}

function socialLabel(url){
  try {
    const u = new URL(url), seg = u.pathname.split('/').filter(Boolean).pop();
    const t = decodeURIComponent(seg || u.hostname.replace(/^www\./, ''));
    return t.length > 24 ? t.slice(0, 23) + '…' : t;
  } catch (e) { return url; }
}

/* ---------------- photo framing ----------------
   A photo whose shape does not match the card's photo frame (e.g. a tall statue in a wide frame) is NOT cropped.
   It is shown in full, centred on a soft blurred copy of itself. Shape-matching photos simply fill the frame. */
const imgCache = new Map();
async function ensureImg(src){
  if (!src) return null;
  if (imgCache.has(src)) return imgCache.get(src);
  const im = await loadImage(src); imgCache.set(src, im);
  if (imgCache.size > 24) imgCache.delete(imgCache.keys().next().value);
  return im;
}
const FRAME = { h: [250, 244], v: [352, 190], big: [360, 300], vs: [352, 168] };      // photo frame size in the catalogue (css px)
const frameCache = new Map();
function framedSrc(v, kind, src){
  const im = imgCache.get(src); if (!im) return src;
  const [fw, fh] = FRAME[kind in FRAME ? kind : 'h'], iw = im.naturalWidth, ih = im.naturalHeight;
  let mode = v.fit || 'auto';
  if (mode === 'auto') mode = Math.abs(Math.log((iw / ih) / (fw / fh))) < .28 ? 'fill' : 'full';
  if (mode === 'fill') return src;
  const key = src.length + ':' + src.slice(-48) + ':' + kind;
  if (frameCache.has(key)) return frameCache.get(key);
  const K = 3, W = fw * K, H = fh * K, c = document.createElement('canvas'); c.width = W; c.height = H;
  const x = c.getContext('2d'); x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high';
  // soft backdrop: shrink the photo, then stretch it over the whole frame (two steps = smooth blur)
  const sm = document.createElement('canvas'), sc = 24 / Math.min(iw, ih); sm.width = Math.max(2, Math.round(iw * sc)); sm.height = Math.max(2, Math.round(ih * sc));
  sm.getContext('2d').drawImage(im, 0, 0, sm.width, sm.height);
  const mid = document.createElement('canvas'); mid.width = Math.round(W / 6); mid.height = Math.round(H / 6);
  const cov = Math.max(mid.width / sm.width, mid.height / sm.height), mx = mid.getContext('2d'); mx.imageSmoothingQuality = 'high';
  mx.drawImage(sm, (mid.width - sm.width * cov) / 2, (mid.height - sm.height * cov) / 2, sm.width * cov, sm.height * cov);
  x.drawImage(mid, 0, 0, W, H);
  x.fillStyle = 'rgba(255,255,255,.22)'; x.fillRect(0, 0, W, H);
  // the whole photo, centred
  const s = Math.min(W * .96 / iw, H * .96 / ih), dw = iw * s, dh = ih * s;
  x.drawImage(im, (W - dw) / 2, (H - dh) / 2, dw, dh);
  const url = c.toDataURL('image/jpeg', .92); frameCache.set(key, url);
  if (frameCache.size > 40) frameCache.delete(frameCache.keys().next().value);
  return url;
}

// kind: 'h' = photo beside text, 'v' = photo on top, 'vs' = smaller photo on top, 'big' = large featured card
function cardHtml(v, idx, d, kind, side){
  const specs = [['Size / साइज़', v.size], ['Material / सामग्री', v.material], ['Colour / रंग', v.colour]].filter(r => r[1]);
  const body = d.table === 2
    ? `<div class="chips">${specs.map(r => `<span><i>${r[0].split(' / ')[0]}</i> ${esc(r[1])}</span>`).join('')}</div>`
    : `<table>${specs.map(r => `<tr><td>${r[0]}</td><td>${esc(r[1])}</td></tr>`).join('')}</table>`;
  const raw = v.enh && v.useEnh ? v.enh : v.orig, img = framedSrc(v, kind, raw);
  const cls = (kind === 'v' || kind === 'vs') ? 'v' + (kind === 'vs' ? ' vs' : '') : kind === 'big' ? 'big' : (side === 'R' ? 'rev' : '');
  const pr = (v.price || v.moq) ? `<div class="pr"><span class="p">${esc(v.price || '')}</span>${v.moq ? `<span class="m">MOQ ${esc(v.moq)}</span>` : ''}</div>` : '';
  return `<div class="cd s${d.card} t${d.table} ${cls}"><div class="im"><img src="${img}"><span class="code c${d.code}">P-${String(idx + 1).padStart(2, '0')}</span></div>
    <div class="tx"><div class="nm">${esc(v.name)}</div>${body}${pr}</div></div>`;
}

// Splits the variants across the two pages according to the layout.
function layoutBlocks(d){
  const side = i => d.photoSide === 'alt' ? (i % 2 ? 'R' : 'L') : d.photoSide;
  const list = (arr, off) => `<div class="stack">${arr.map((v, i) => cardHtml(v, off + i, d, 'h', side(off + i))).join('')}</div>`;
  const grid = (arr, off) => `<div class="grid2">${arr.map((v, i) => cardHtml(v, off + i, d, 'v')).join('')}</div>`;
  const V = variants;
  if (d.layout === 1) return { p1: grid(V.slice(0, 4), 0), p2: V.length === 5 ? list(V.slice(4), 4) : grid(V.slice(4), 4) };
  if (d.layout === 2) return {
    p1: cardHtml(V[0], 0, d, 'big') + `<div class="grid2">${V.slice(1, 3).map((v, i) => cardHtml(v, 1 + i, d, 'vs')).join('')}</div>`,
    p2: list(V.slice(3), 3)
  };
  return { p1: list(V.slice(0, 3), 0), p2: list(V.slice(3), 3) };
}

function initials(name){ const w = name.replace(/[^A-Za-z\u0900-\u097F ]/g, '').split(/\s+/).filter(Boolean); return ((w[0] || '?')[0] + (w[1] ? w[1][0] : '')).toUpperCase(); }

function buildPages(info, d){
  const p = palette(color), fs = FONTSETS[d.fontSet];
  const bgc = ['#ffffff', '#faf8f4', '#f5f7fa'][d.bg], style = `--c:${p.c};--cd:${p.cd};--cl:${p.cl};--r:${d.radius}px;--hf:${fs.h};background-color:${bgc};font-family:${fs.b}`;
  const blocks = layoutBlocks(d), pf = PF[info.platform];
  const logo = info.logo ? `<div class="lg img"><img src="${info.logo}"></div>` : `<div class="lg mono">${esc(initials(info.ent))}</div>`;
  const page1 = `<div class="pg" style="${style}">
    <div class="hd hd${d.header}">${logo}<div class="tx"><div class="meta">${esc(info.district)} · ${esc(info.product)}</div><div class="ent">${esc(info.ent)}</div></div></div>
    <div class="intro"><span class="chip">${esc(info.product)}</span>${info.desc ? `<div class="desc">${esc(info.desc)}</div>` : ''}${info.use ? `<div class="use"><b>Use / उपयोग:</b> ${esc(info.use)}</div>` : ''}</div>
    <div class="sec k${d.sec}">Our Products</div>
    <div class="cards">${blocks.p1}</div>
    <div class="strip"><span>${esc(info.ent)} · ${esc(info.district)}</span><span>Page 1 / 2</span></div>
  </div>`;
  const contact = [
    info.person && `<div><b>${esc(info.person)}</b></div>`,
    `<div>📞 ${esc(info.mobile)}${info.wa && info.wa !== info.mobile ? ' &nbsp;·&nbsp; 💬 WhatsApp: ' + esc(info.wa) : ' &nbsp;·&nbsp; 💬 WhatsApp'}</div>`,
    info.email && `<div>✉ ${esc(info.email)}</div>`,
    info.addr && `<div class="ad">📍 ${esc(info.addr)}</div>`,
    info.gst && `<div>GSTIN: ${esc(info.gst)}</div>`
  ].filter(Boolean).join('') + (info.socials.length ? `<div class="socs">${info.socials.map(s => `<span class="soc" data-url="${esc(s[1])}"><b>${s[0]}</b> ${esc(socialLabel(s[1]))}</span>`).join('')}</div>` : '');
  const page2 = `<div class="pg" style="${style}">
    <div class="mini m${[0, 1, 2, 3, 2, 0][d.header]}"><b>${esc(info.ent)}</b><span>${esc(info.district)} · ${esc(info.product)}</span></div>
    <div class="body2">${blocks.p2}</div>
    <div class="foot f${d.foot}">
      <div class="ci"><h3>Contact Us / संपर्क करें</h3>${contact}</div>
      <div class="qr"><img class="qrimg" src="${qrDataUrl(info.link)}"><div class="cap">Scan करके ${esc(pf)} खोलें</div></div>
    </div>
    <div class="strip"><span>${esc(info.ent)}</span><span>Page 2 / 2</span></div>
  </div>`;
  return page1 + page2;
}

/* ---------------- validation ---------------- */
function validate(){
  const info = collect(), e = [];
  if (!info.district) e.push('Select or type the district <small>ज़िला चुनें</small>');
  if (!info.product) e.push('Select or type the ODOP product <small>उत्पाद चुनें</small>');
  if (!info.ent) e.push('Enter the enterprise name <small>उद्यम का नाम भरें</small>');
  if (info.mobile.length !== 10) e.push('Mobile number must be 10 digits <small>मोबाइल 10 अंक का हो</small>');
  if ($('wa').value && info.wa.length !== 10) e.push('WhatsApp number must be 10 digits <small>व्हाट्सऐप 10 अंक का हो</small>');
  if (!/^https?:\/\/\S+\.\S+/.test(info.link)) e.push('Enter a valid account link (https://...), QR needs it <small>सही link डालें</small>');
  info.socials.forEach(s => { if (!/^https?:\/\/\S+\.\S+/.test(s[1])) e.push(`${s[0]} link must start with https:// <small>${s[0]} का सही link डालें</small>`); });
  if (variants.length < MIN_VARIANTS) e.push(`At least ${MIN_VARIANTS} variants are required <small>कम से कम ${MIN_VARIANTS} variants</small>`);
  const seen = new Set();
  variants.forEach((v, i) => {
    const n = i + 1;
    if (!v.orig) e.push(`Variant ${n}: add a photo <small>फ़ोटो डालें</small>`);
    else { if (seen.has(v.orig)) e.push(`Variant ${n}: this photo is already used; identical photos count once <small>यही फ़ोटो पहले भी है</small>`); seen.add(v.orig); }
    if (!v.name.trim()) e.push(`Variant ${n}: enter a name <small>नाम भरें</small>`);
    if (!v.size.trim() && !v.material.trim() && !v.colour.trim()) e.push(`Variant ${n}: fill at least one of size, material or colour so it differs from the others <small>कम से कम एक भरें</small>`);
  });
  if (!$('realPhoto').checked) e.push('Tick the box confirming the photos are real <small>फ़ोटो असली हैं - tick करें</small>');
  return { info, errors: e };
}
function showErrors(list){
  const box = $('errors');
  if (!list.length){ box.style.display = 'none'; return; }
  box.innerHTML = '<b>Please fix these:</b><ul>' + list.map(x => `<li>${x}</li>`).join('') + '</ul>';
  box.style.display = 'block'; window.scrollTo({top: 0, behavior: 'smooth'});
}

/* preview + PDF download live in templates-ui.js */

/* ---------------- init ---------------- */
fillDistricts(); fillProducts();
for (let i = 0; i < MIN_VARIANTS; i++) variants.push(newVariant());
renderVariants(); renderSwatches();


/* ---------------- company logo ---------------- */
window.logoData = '';
$('logoFile').addEventListener('change', async e => {
  const f = e.target.files[0];
  if (!f){ window.logoData = ''; window.logoChanged = true; $('logoHint').textContent = 'If no logo is added, the company initials are shown.'; return; }
  window.logoData = await fileToDataURL(f, 400); window.logoChanged = true;
  $('logoHint').textContent = 'Logo added: ' + f.name;
});

/* ---------------- demo data ---------------- */
let demoIdx = -1;
async function fillDemo(){
  demoIdx = (demoIdx + 1) % DEMO_SETS.length;
  const d = DEMO_SETS[demoIdx];
  $('district').value = d.district; fillProducts(); $('product').value = d.product;
  $('product').dispatchEvent(new Event('change'));
  $('entName').value = d.ent; $('person').value = d.person; $('mobile').value = d.mobile; $('wa').value = d.wa;
  $('email').value = d.email; $('addr').value = d.addr; $('desc').value = d.desc; $('use').value = d.use;
  $('platform').value = d.platform; $('accLink').value = d.link; waHint();
  const so = d.social || {};
  if ($('locLink')) $('locLink').value = d.loc || '';
  $('socIg').value = so.ig || ''; $('socFb').value = so.fb || ''; $('socYt').value = so.yt || ''; $('socWeb').value = so.web || '';
  $('gst').value = d.gst || '08ABCDE1234F1Z5'; $('udyam').value = ''; $('odopRef').value = ''; $('batchNo').value = ''; window.logoData = ''; window.logoChanged = true; window.dispatchEvent(new Event('odop:new-form')); $('logoFile').value = ''; $('logoHint').textContent = 'If no logo is added, the company initials are shown.';
  $('realPhoto').checked = true;
  variants = d.variants.map(v => ({ name: v.name, orig: drawDemoPhoto(v), size: v.size, material: v.material, colour: v.colour, price: v.price, moq: v.moq, code: v.code || '', finish: v.finish || '', thickness: v.thickness || '', enh: null, useEnh: false, strength: .6, enhStrength: null }));
  await Promise.all(variants.map(v => ensureImg(v.orig)));
  renderVariants(); showErrors([]);
  $('btnDemo').textContent = `Fill demo data (${demoIdx + 1}/${DEMO_SETS.length})`;
  $('status').textContent = `Demo ${demoIdx + 1} of ${DEMO_SETS.length} loaded: ${d.ent}. Click again for the next one.`;
  if (window.refreshTemplatePicker) window.refreshTemplatePicker();
  rollDesign(); await renderPreview();
}
$('btnDemo').addEventListener('click', () => { $('btnDemo').textContent = 'Loading demo…'; setTimeout(fillDemo, 30); });
