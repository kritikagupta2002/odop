/* The form is shown one step at a time (tabs) instead of one long scroll. */
(function () {
  const TABS = [
    { label: 'Product', secs: ['s1'] }, { label: 'Company', secs: ['s2'] }, { label: 'QR & links', secs: ['s3'] },
    { label: 'Photos', secs: ['s4'] }, { label: 'Design & text', secs: ['s5', 's7'] }
  ];
  const col = document.querySelector('.form-col'); if (!col) return;
  const nav = document.createElement('nav'); nav.className = 'tabbar'; nav.setAttribute('role', 'tablist');
  nav.innerHTML = TABS.map((t, i) => `<button type="button" role="tab" data-i="${i}"><i>${i + 1}</i>${t.label}</button>`).join('');
  col.insertBefore(nav, col.firstChild);
  let cur = 0;
  function show(i, scroll) {
    cur = Math.max(0, Math.min(TABS.length - 1, i));
    TABS.forEach((t, k) => t.secs.forEach(id => { const s = document.getElementById(id); if (s) s.classList.toggle('tab-off', k !== cur); }));
    nav.querySelectorAll('button').forEach((b, k) => { b.classList.toggle('on', k === cur); b.setAttribute('aria-selected', k === cur); });
    const ab = nav.querySelectorAll('button')[cur]; if (ab) nav.scrollTo({ left: ab.offsetLeft - (nav.clientWidth - ab.offsetWidth) / 2 });
    if (scroll) nav.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.dispatchEvent(new Event('resize'));
  }
  nav.addEventListener('click', e => { const b = e.target.closest('button'); if (b) show(+b.dataset.i, true); });
  // Back / Next buttons at the end of each step
  TABS.forEach((t, i) => {
    const last = document.getElementById(t.secs[t.secs.length - 1]); if (!last) return;
    const bar = document.createElement('div'); bar.className = 'tabnext';
    bar.innerHTML = (i > 0 ? `<button type="button" class="btn2" data-go="${i - 1}">&larr; Back</button>` : '<span></span>') +
      (i < TABS.length - 1 ? `<button type="button" class="btn" data-go="${i + 1}">Next: ${TABS[i + 1].label} &rarr;</button>` : '<span class="hint">All set? Check the preview and press <b>Download PDF</b>.</span>');
    bar.addEventListener('click', e => { const b = e.target.closest('[data-go]'); if (b) show(+b.dataset.go, true); });
    last.appendChild(bar);
  });
  // when something is missing, open the step that has the problem
  document.getElementById('errors') && new MutationObserver(() => {
    const box = document.getElementById('errors'); if (box.style.display === 'none' || !box.textContent.trim()) return;
    const t = box.textContent.toLowerCase();
    const k = /district|product name|odop product/.test(t) ? 0 : /enterprise|mobile|company/.test(t) ? 1 : /link|qr|account/.test(t) ? 2 : /variant|photo|real/.test(t) ? 3 : -1;
    if (k >= 0 && k !== cur) show(k, false);
  }).observe(document.getElementById('errors'), { childList: true, attributes: true, subtree: true });
  // small screens: a button that jumps to the preview / PDF box
  const fab = document.createElement('button'); fab.type = 'button'; fab.className = 'fab'; fab.innerHTML = '👁 Preview &amp; PDF';
  fab.addEventListener('click', () => { const p = document.getElementById('s6'); if (p) p.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
  document.body.appendChild(fab);
  const fabShow = () => { const p = document.getElementById('s6'); const r = p && p.getBoundingClientRect(); fab.classList.toggle('hide', !r || (r.top < innerHeight * .6 && r.bottom > 0)); };
  window.addEventListener('scroll', fabShow, { passive: true }); window.addEventListener('resize', fabShow); fabShow();
  show(0, false);
  window.StepTabs = { show };
})();
