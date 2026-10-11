/**
 * Tiny fetch wrapper for the LyriFind REST API.
 *  - adds the JWT (if logged in) to every request
 *  - turns non-2xx responses into an ApiError with a readable message
 */
const TOKEN_KEY = 'lf_token';

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export class ApiError extends Error {
  constructor(message, status, details = []) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

async function request(path, { method = 'GET', body } = {}) {
  const token = tokenStore.get();
  const res = await fetch(`/api${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = res.status === 204 ? null : await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data?.error || 'Something went wrong', res.status, data?.details);
  return data;
}

export const api = {
  register: (body) => request('/auth/register', { method: 'POST', body }),
  login: (body) => request('/auth/login', { method: 'POST', body }),
  me: () => request('/auth/me'),

  songs: (params) => request(`/songs?${new URLSearchParams(params)}`),
  filters: () => request('/songs/filters'),
  song: (id) => request(`/songs/${id}`),
  createSong: (body) => request('/songs', { method: 'POST', body }),
  updateSong: (id, body) => request(`/songs/${id}`, { method: 'PUT', body }),
  deleteSong: (id) => request(`/songs/${id}`, { method: 'DELETE' }),

  favorites: () => request('/favorites'),
  addFavorite: (id) => request(`/favorites/${id}`, { method: 'POST' }),
  removeFavorite: (id) => request(`/favorites/${id}`, { method: 'DELETE' }),
};

/** "Validation failed – title is required – ..." for display in an alert. */
export const errorText = (e) => [e.message, ...(e.details || [])].join(' – ');
