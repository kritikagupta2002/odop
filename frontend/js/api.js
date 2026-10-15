/* Small client for the backend API (same address as this page).
   When the page is opened without the backend (for example directly from a folder), the app still works on its own:
   API.ready() simply resolves to false and the save / login features stay hidden. */
(function () {
  const KEY = 'odop_token';
  const store = {
    get() { try { return localStorage.getItem(KEY) || ''; } catch { return ''; } },
    set(v) { try { v ? localStorage.setItem(KEY, v) : localStorage.removeItem(KEY); } catch { /* storage blocked */ } }
  };
  const state = { token: store.get(), user: null, online: null };

  async function request(method, url, body, kind) {
    const headers = {};
    if (state.token) headers.Authorization = 'Bearer ' + state.token;
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    const res = await fetch(url, { method, headers, body: body !== undefined ? JSON.stringify(body) : undefined });
    if (!res.ok) {
      let info = {};
      try { info = await res.json(); } catch { /* not json */ }
      if (res.status === 401 && state.token && !url.includes('/auth/login')) { API.setSession('', null); window.dispatchEvent(new Event('odop:session-ended')); }
      const err = new Error(info.message || 'Request failed (' + res.status + ')');
      err.status = res.status; err.code = info.error || '';
      throw err;
    }
    return kind === 'blob' ? res.blob() : res.json();
  }

  const API = {
    state,
    async ready() {
      if (state.online !== null) return state.online;
      if (!/^https?:$/.test(location.protocol)) return (state.online = false);
      try { state.online = (await fetch('/api/health', { cache: 'no-store' })).ok; } catch { state.online = false; }
      if (state.online && state.token) {
        try { state.user = (await request('GET', '/api/auth/me')).user; } catch { state.user = null; }
      }
      return state.online;
    },
    setSession(token, user) { state.token = token; state.user = user; store.set(token); },
    async login(username, password) {
      const out = await request('POST', '/api/auth/login', { username, password });
      API.setSession(out.token, out.user);
      return out.user;
    },
    logout() { API.setSession('', null); },
    get: url => request('GET', url),
    post: (url, body) => request('POST', url, body),
    put: (url, body) => request('PUT', url, body),
    del: url => request('DELETE', url),
    blob: url => request('GET', url, undefined, 'blob'),
    async download(url, filename) {
      const blob = await API.blob(url), a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = filename; document.body.appendChild(a); a.click();
      setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
    }
  };
  window.API = API;
})();
