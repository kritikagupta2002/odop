/* One chosen colour recolours every template: backgrounds, text, panels and lines are all worked out from it.
   Dark templates stay dark, light ones stay light. window.recolorTheme(theme, '#hex') returns a new theme object. */
(function () {
  const rgb = h => { h = String(h).replace('#', ''); if (h.length === 3) h = h.split('').map(c => c + c).join(''); const n = parseInt(h, 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
  const hex = a => '#' + a.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
  const mix = (a, b, t) => { const x = rgb(a), y = rgb(b); return hex(x.map((v, i) => v + (y[i] - v) * t)); };
  const lum = h => { const [r, g, b] = rgb(h); return (r * .299 + g * .587 + b * .114) / 255; };
  const hue = h => { const [r, g, b] = rgb(h).map(v => v / 255), mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn; if (!d) return 0; let k = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; return (k * 60 + 360) % 360; };

  window.recolorTheme = function (th, acc) {
    if (!acc || !th) return th;
    const dark = lum(th.bg) < .35, whiteBg = /^#f{6}$/i.test(th.bg) && !dark;
    const goldish = hue(acc) > 30 && hue(acc) < 60 && lum(acc) > .4;
    const gold = goldish ? '#8a6a3b' : '#c9a45c';
    const a = dark && lum(acc) < .5 ? mix(acc, '#ffffff', .45) : acc;
    const o = {};
    if (dark) {
      o.bg = mix(acc, '#000000', .84); o.soft = o.surface = mix(acc, '#000000', .72); o.line = mix(acc, '#000000', .52);
      o.ink = mix(acc, '#ffffff', .9); o.muted = mix(acc, '#ffffff', .62); o.dark = mix(acc, '#000000', .9); o.onDark = '#f4f2ea';
    } else {
      o.bg = whiteBg ? '#ffffff' : mix(acc, '#ffffff', .94); o.soft = o.surface = mix(acc, '#ffffff', .87); o.line = mix(acc, '#ffffff', .74);
      o.ink = mix(acc, '#000000', .8); o.muted = mix(o.ink, '#ffffff', .42); o.dark = mix(acc, '#000000', .72); o.onDark = '#f4f2ea';
    }
    o.acc = a; o.acc2 = dark ? a : gold; o.gold = dark ? a : gold; o.accent = a;
    o.onAcc = lum(a) > .6 ? '#1b1b1b' : (dark ? mix(acc, '#000000', .85) : '#ffffff');
    if (dark && lum(acc) > .5) o.onAcc = mix(acc, '#000000', .85);
    if (th.bars && th.bars.length) o.bars = [mix(a, '#ffffff', .6), mix(a, '#ffffff', .3), a, mix(a, '#000000', .3), gold, mix(gold, '#ffffff', .5), mix(a, '#000000', .55)];
    const out = Object.assign({}, th);
    Object.keys(o).forEach(k => { if (k in th) out[k] = o[k]; });
    return out;
  };
})();
