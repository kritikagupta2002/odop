/* Login, saved catalogues ("My catalogues"), save to server, duplicate warning and Excel export.
   Everything here is optional: if the backend is not reachable, none of it is shown and the tool works as before. */
(function () {
  const FORM_IDS = ['district', 'districtOther', 'product', 'productOther', 'entName', 'person', 'mobile', 'wa', 'email', 'addr', 'gst', 'desc', 'use',
    'platform', 'accLink', 'locLink', 'socIg', 'socFb', 'socYt', 'socWeb', 'txTagline', 'txWhy', 'txApps', 'txValues', 'udyam', 'odopRef', 'batchNo'];
  const TEXT_IDS = ['txTagline', 'txWhy', 'txApps', 'txValues'];
  let currentId = null;
  window.logoChanged = false;

  const el = id => document.getElementById(id);
  const toast = (msg, bad) => { const t = el('toast'); t.textContent = msg; t.className = 'toast' + (bad ? ' bad' : ''); clearTimeout(toast.t); toast.t = setTimeout(() => { t.className = 'toast hidden'; }, 4500); };
  const blobToDataUrl = blob => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(blob); });

  /* ---------------- modal ---------------- */
  function openModal(html, wide) {
    el('modalBody').innerHTML = html; el('modalBox').classList.toggle('wide', !!wide);
    el('modal').classList.remove('hidden');
  }
  const closeModal = () => el('modal').classList.add('hidden');
  el('modalClose').addEventListener('click', closeModal);
  el('modal').addEventListener('mousedown', e => { if (e.target === el('modal')) closeModal(); });

  /* ---------------- account bar ---------------- */
  function drawAccount() {
    const box = el('acct'), u = API.state.user;
    if (!API.state.online) { box.innerHTML = ''; return; }
    box.innerHTML = u
      ? `<span class="who">${esc(u.name || u.username)} <small>${esc(u.role)}</small></span>
         <button class="demo" id="btnMine" type="button">My catalogues</button><button class="demo" id="btnLogout" type="button">Log out</button>`
      : `<button class="demo" id="btnLogin" type="button">Log in</button>`;
    if (el('btnMine')) el('btnMine').onclick = showMine;
    if (el('btnLogout')) el('btnLogout').onclick = () => { API.logout(); currentId = null; drawAccount(); drawSaveBox(); toast('Logged out'); };
    if (el('btnLogin')) el('btnLogin').onclick = () => showLogin();
    drawSaveBox();
  }
  function drawSaveBox() {
    const on = !!(API.state.online);
    el('saveBox').classList.toggle('hidden', !on);
    el('btnSave').textContent = currentId ? `Save changes (#${currentId})` : 'Save to server';
    el('saveInfo').textContent = API.state.user ? (currentId ? `Editing saved catalogue #${currentId}` : 'Not saved yet') : 'Log in to save your catalogues';
  }
  window.addEventListener('odop:new-form', () => { currentId = null; drawSaveBox(); });
  window.addEventListener('odop:session-ended', () => { drawAccount(); toast('Session ended. Please log in again.', true); });

  /* ---------------- login ---------------- */
  function showLogin(after) {
    openModal(`<h3>Log in</h3><p class="hint">Use the username and password given by your admin.</p>
      <label for="lgUser">Username</label><input type="text" id="lgUser" autocomplete="username">
      <label for="lgPass">Password</label><input type="password" id="lgPass" autocomplete="current-password">
      <div class="err hidden" id="lgErr"></div>
      <div class="actions"><button class="btn" id="lgGo" type="button">Log in</button><button class="btn2" id="lgSkip" type="button">Continue without login</button></div>`);
    const go = async () => {
      el('lgErr').classList.add('hidden');
      try { await API.login(el('lgUser').value.trim(), el('lgPass').value); closeModal(); drawAccount(); toast('Welcome ' + (API.state.user.name || API.state.user.username)); if (after) after(); }
      catch (e) { el('lgErr').textContent = e.message; el('lgErr').classList.remove('hidden'); }
    };
    el('lgGo').onclick = go; el('lgSkip').onclick = closeModal;
    el('lgPass').addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
    el('lgUser').focus();
  }
  const needLogin = after => { if (API.state.user) return true; showLogin(after); return false; };

  /* ---------------- save ---------------- */
  function payload(status) {
    const form = {};
    FORM_IDS.forEach(id => { const x = el(id); if (x) form[id] = x.value; });
    const body = {
      form, status, template: window.TemplateUI ? TemplateUI.uid() : '', color,
      variants: variants.map(v => ({
        name: v.name, size: v.size, material: v.material, colour: v.colour, price: v.price, moq: v.moq, code: v.code, finish: v.finish, thickness: v.thickness,
        fit: v.fit || 'auto', useEnh: !!v.useEnh, strength: v.strength == null ? 0.6 : v.strength,
        photo: v.photoFile ? undefined : v.orig, photoFile: v.photoFile || undefined
      }))
    };
    if (window.logoChanged) body.logo = window.logoData || null;
    return body;
  }
  async function saveRecord(quiet) {
    if (!needLogin(() => saveRecord(quiet))) return null;
    const btn = el('btnSave'); btn.disabled = true; el('saveInfo').textContent = 'Saving...';
    try {
      const status = validate().errors.length ? 'draft' : 'final';
      const rec = currentId ? await API.put('/api/records/' + currentId, payload(status)) : await API.post('/api/records', payload(status));
      currentId = rec.id; window.logoChanged = false;
      rec.variants.forEach((sv, i) => { if (variants[i]) variants[i].photoFile = sv.photoFile; });
      if (!quiet) toast(status === 'final' ? 'Saved. This catalogue is complete.' : 'Saved as a draft. Some details are still missing.');
      return rec;
    } catch (e) {
      toast(e.message, true); el('saveInfo').textContent = e.message; return null;
    } finally { btn.disabled = false; drawSaveBox(); }
  }
  el('btnSave').addEventListener('click', () => saveRecord(false));

  // called by the PDF download code after the file is made
  window.ODOP_afterPdf = async function (blob) {
    if (!API.state.user || !el('savePdf').checked) return;
    const rec = currentId ? { id: currentId } : await saveRecord(true);
    if (!rec) return;
    if (currentId) await saveRecord(true);          // keep the saved data in step with what was downloaded
    try { await API.post('/api/records/' + currentId + '/pdf', { pdf: await blobToDataUrl(blob) }); toast('PDF also saved on the server.'); }
    catch (e) { toast('PDF downloaded, but could not be saved on the server: ' + e.message, true); }
  };

  /* ---------------- open a saved catalogue ---------------- */
  async function photoFrom(url) { return blobToDataUrl(await API.blob(url)); }
  async function openRecord(id) {
    closeModal(); toast('Opening...');
    try {
      const rec = await API.get('/api/records/' + id), f = rec.form;
      el('district').value = f.district; el('district').dispatchEvent(new Event('change'));
      el('product').value = f.product; el('product').dispatchEvent(new Event('change'));
      FORM_IDS.filter(k => k !== 'district' && k !== 'product').forEach(k => { const x = el(k); if (x) x.value = f[k] || ''; });
      TEXT_IDS.forEach(k => el(k).dispatchEvent(new Event('input')));
      el('districtOther').classList.toggle('hidden', f.district !== '__other__'); el('productOther').classList.toggle('hidden', f.product !== '__other__');
      waHint();
      window.logoData = rec.logoUrl ? await photoFrom(rec.logoUrl) : ''; window.logoChanged = false;
      el('logoHint').textContent = rec.logoUrl ? 'Saved logo loaded.' : 'If no logo is added, the company initials are shown.';
      const list = [];
      for (const v of rec.variants) {
        const o = Object.assign(newVariant(), { name: v.name, size: v.size, material: v.material, colour: v.colour, price: v.price, moq: v.moq, code: v.code, finish: v.finish,
          thickness: v.thickness, fit: v.fit, useEnh: v.useEnh, strength: v.strength, photoFile: v.photoFile });
        if (v.photoUrl) { o.orig = await photoFrom(v.photoUrl); await ensureImg(o.orig); }
        if (o.useEnh && o.orig) { o.enh = await enhanceDataURL(o.orig, o.strength); o.enhStrength = o.strength; await ensureImg(o.enh); }
        list.push(o);
      }
      variants = list; el('realPhoto').checked = true; renderVariants();
      if (rec.color) setColor(rec.color);
      if (rec.template && window.TemplateUI) TemplateUI.select(rec.template);
      currentId = rec.id; drawSaveBox(); checkDuplicates();
      await renderPreview();
      toast(`Opened "${f.entName}"`);
    } catch (e) { toast(e.message, true); }
  }

  /* ---------------- my catalogues ---------------- */
  async function showMine() {
    if (!needLogin(showMine)) return;
    openModal(`<h3>My catalogues</h3><div class="mline"><input type="text" id="mSearch" placeholder="Search name, Udyam, mobile..."><button class="btn2" id="mXlsx" type="button">Download Excel</button><button class="btn2" id="mNew" type="button">+ New</button></div>
      <div id="mList" class="mlist">Loading...</div>`, true);
    const draw = async () => {
      try {
        const out = await API.get('/api/records?limit=100&search=' + encodeURIComponent(el('mSearch').value.trim()));
        el('mList').innerHTML = out.records.length ? `<table><thead><tr><th>Enterprise</th><th>District / product</th><th>Udyam</th><th>Status</th><th>Updated</th><th></th></tr></thead><tbody>${out.records.map(r =>
          `<tr><td><b>${esc(r.name)}</b><small>${esc(r.owner)}</small></td><td>${esc(r.district)}<small>${esc(r.product)}</small></td><td>${esc(r.udyam || '-')}</td>
           <td><span class="pill ${r.status}">${r.status}</span></td><td>${esc(r.updatedAt)}</td>
           <td class="acts"><button class="btn2" data-open="${r.id}">Open</button>${r.hasPdf ? `<button class="btn2" data-pdf="${r.id}">PDF</button>` : ''}<button class="btn2 dng" data-del="${r.id}">Delete</button></td></tr>`).join('')}</tbody></table><div class="hint">${out.total} catalogue(s)</div>` : '<p class="hint">Nothing saved yet. Fill the form and press "Save to server".</p>';
        el('mList').querySelectorAll('[data-open]').forEach(b => b.onclick = () => openRecord(b.dataset.open));
        el('mList').querySelectorAll('[data-pdf]').forEach(b => b.onclick = () => API.download('/api/records/' + b.dataset.pdf + '/pdf', 'Catalogue_' + b.dataset.pdf + '.pdf').catch(e => toast(e.message, true)));
        el('mList').querySelectorAll('[data-del]').forEach(b => b.onclick = async () => {
          if (!confirm('Delete this saved catalogue and its photos? This cannot be undone.')) return;
          try { await API.del('/api/records/' + b.dataset.del); if (+b.dataset.del === currentId) { currentId = null; drawSaveBox(); } draw(); } catch (e) { toast(e.message, true); }
        });
      } catch (e) { el('mList').textContent = e.message; }
    };
    let t; el('mSearch').addEventListener('input', () => { clearTimeout(t); t = setTimeout(draw, 300); });
    el('mXlsx').onclick = () => API.download('/api/export/participants.xlsx', 'ODOP_participants.xlsx').catch(e => toast(e.message, true));
    el('mNew').onclick = () => { closeModal(); location.reload(); };
    draw();
  }

  /* ---------------- duplicate warning ---------------- */
  async function checkDuplicates() {
    if (!API.state.user) { el('dupWarn').classList.add('hidden'); return; }
    const u = el('udyam').value.trim(), m = el('mobile').value.replace(/\D/g, '');
    if (!u && m.length !== 10) { el('dupWarn').classList.add('hidden'); return; }
    try {
      const r = await API.get(`/api/records/duplicates?udyam=${encodeURIComponent(u)}&mobile=${m}&exclude=${currentId || 0}`), msg = [];
      if (r.udyam) msg.push(`This Udyam number is already used by "${r.udyam.name}" (${r.udyam.district}). It cannot be saved twice.`);
      if (r.mobile.length) msg.push(`This mobile number is also used by: ${r.mobile.map(x => x.name).join(', ')}.`);
      el('dupWarn').textContent = msg.join(' '); el('dupWarn').classList.toggle('hidden', !msg.length);
    } catch { /* ignore */ }
  }
  el('udyam').addEventListener('blur', checkDuplicates); el('mobile').addEventListener('blur', checkDuplicates);

  /* ---------------- start ---------------- */
  // No forced login: the tool works for everyone. Login is asked only when someone wants to save to the server.
  API.ready().then(() => drawAccount());
  window.RecordsUI = { save: saveRecord, open: openRecord };
})();
