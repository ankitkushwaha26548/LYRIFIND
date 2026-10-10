/* LyriFind demo UI: talks to the REST API with fetch(). Plain JS, no build step. */
const $ = (id) => document.getElementById(id);
const state = { token: localStorage.getItem('lf_token'), user: JSON.parse(localStorage.getItem('lf_user') || 'null'), page: 1, favoritesOnly: false, authMode: 'login' };

// Escape user-provided text before inserting into HTML (prevents XSS).
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

async function api(path, { method = 'GET', body } = {}) {
  const res = await fetch('/api' + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(state.token ? { Authorization: 'Bearer ' + state.token } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = res.status === 204 ? {} : await res.json();
  if (!res.ok) throw new Error([data.error, ...(data.details || [])].join(': '));
  return data;
}

function say(text, isError = false) { const m = $('message'); m.textContent = text; m.className = isError ? 'error' : ''; }

function renderAuth() {
  const area = $('authArea');
  if (state.user) {
    area.innerHTML = `<span class="meta">Hi, ${esc(state.user.name)} (${esc(state.user.role)})</span> <button id="logout" class="ghost">Logout</button>`;
    $('logout').onclick = () => { state.token = null; state.user = null; state.favoritesOnly = false; localStorage.clear(); renderAuth(); load(); };
  } else {
    area.innerHTML = '<button id="loginBtn">Login / Register</button>';
    $('loginBtn').onclick = () => $('authDialog').showModal();
  }
  $('favToggle').hidden = !state.user;
  $('adminPanel').hidden = !(state.user && state.user.role === 'admin');
}

async function load() {
  try {
    if (state.favoritesOnly) {
      const { favorites } = await api('/favorites');
      renderSongs(favorites); $('pager').innerHTML = ''; say(`${favorites.length} favorite song(s)`); return;
    }
    const p = new URLSearchParams({ q: $('q').value, language: $('language').value, genre: $('genre').value, page: state.page, limit: 6 });
    const data = await api('/songs?' + p);
    renderSongs(data.results);
    renderPager(data);
    say(`${data.total} song(s) found`);
  } catch (e) { say(e.message, true); }
}

const seen = { language: new Set(), genre: new Set() };
function fillFilters(songs) {
  for (const key of ['language', 'genre']) {
    songs.forEach((s) => s[key] && seen[key].add(s[key]));
    const sel = $(key), cur = sel.value;
    sel.innerHTML = `<option value="">All ${key}s</option>` + [...seen[key]].sort().map((v) => `<option>${esc(v)}</option>`).join('');
    sel.value = cur;
  }
}

function renderSongs(songs) {
  $('results').innerHTML = songs.length ? songs.map((s) => `
    <article class="card">
      <h3>${esc(s.title)}</h3>
      <div class="meta">${esc(s.artist)}${s.album ? ' · ' + esc(s.album) : ''}${s.year ? ' · ' + esc(s.year) : ''}</div>
      <div>${s.language ? `<span class="tag">${esc(s.language)}</span>` : ''}${s.genre ? `<span class="tag">${esc(s.genre)}</span>` : ''}</div>
      <div class="row">
        <button data-view="${esc(s.id)}">View lyrics</button>
        ${state.user ? (state.favoritesOnly ? `<button class="ghost" data-unfav="${esc(s.id)}">Remove ❤</button>` : `<button class="ghost" data-fav="${esc(s.id)}">❤ Save</button>`) : ''}
        ${state.user && state.user.role === 'admin' ? `<button class="ghost" data-del="${esc(s.id)}">Delete</button>` : ''}
      </div>
    </article>`).join('') : '<p class="meta">No songs found.</p>';
}

function renderPager({ page, totalPages }) {
  $('pager').innerHTML = `<button class="ghost" ${page <= 1 ? 'disabled' : ''} data-page="${page - 1}">‹ Prev</button><span>Page ${page} of ${totalPages}</span><button class="ghost" ${page >= totalPages ? 'disabled' : ''} data-page="${page + 1}">Next ›</button>`;
}

document.addEventListener('click', async (e) => {
  const t = e.target;
  try {
    if (t.dataset.view) {
      const { song } = await api('/songs/' + t.dataset.view);
      $('lyricsBody').innerHTML = `<h2>${esc(song.title)}</h2><p class="meta">${esc(song.artist)}</p><pre>${esc(song.lyrics)}</pre>`;
      $('lyricsDialog').showModal();
    } else if (t.dataset.fav) { await api('/favorites/' + t.dataset.fav, { method: 'POST' }); say('Saved to favorites ❤');
    } else if (t.dataset.unfav) { await api('/favorites/' + t.dataset.unfav, { method: 'DELETE' }); load();
    } else if (t.dataset.del) { if (confirm('Delete this song?')) { await api('/songs/' + t.dataset.del, { method: 'DELETE' }); load(); }
    } else if (t.dataset.page) { state.page = Number(t.dataset.page); load(); }
  } catch (err) { say(err.message, true); }
});

$('searchBtn').onclick = () => { state.page = 1; state.favoritesOnly = false; load(); };
$('q').addEventListener('keydown', (e) => e.key === 'Enter' && $('searchBtn').click());
$('language').onchange = $('genre').onchange = $('searchBtn').onclick;
$('favToggle').onclick = () => { state.favoritesOnly = !state.favoritesOnly; load(); };
$('closeDialog').onclick = () => $('lyricsDialog').close();
$('authClose').onclick = () => $('authDialog').close();
$('authSwitch').onclick = () => {
  state.authMode = state.authMode === 'login' ? 'register' : 'login';
  const reg = state.authMode === 'register';
  $('authTitle').textContent = reg ? 'Register' : 'Login';
  document.querySelector('#authForm [name=name]').hidden = !reg;
  $('authSwitch').textContent = reg ? 'Have an account? Login' : 'Need an account? Register';
};
$('authForm').onsubmit = async (e) => {
  e.preventDefault();
  const body = Object.fromEntries(new FormData(e.target));
  try {
    const data = await api('/auth/' + state.authMode, { method: 'POST', body });
    state.token = data.token; state.user = data.user;
    localStorage.setItem('lf_token', data.token); localStorage.setItem('lf_user', JSON.stringify(data.user));
    $('authDialog').close(); e.target.reset(); renderAuth(); load();
  } catch (err) { say(err.message, true); $('authDialog').close(); }
};
$('songForm').onsubmit = async (e) => {
  e.preventDefault();
  const body = Object.fromEntries(new FormData(e.target));
  try { await api('/songs', { method: 'POST', body }); e.target.reset(); say('Song saved ✔'); load(); } catch (err) { say(err.message, true); }
};

// Populate the language/genre dropdowns once, from ALL songs (not just the current page).
api('/songs?limit=50').then((d) => fillFilters(d.results)).catch(() => {});
renderAuth(); load();
