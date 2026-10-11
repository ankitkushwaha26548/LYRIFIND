/**
 * Dependency-free validators. Each returns an array of messages
 * (empty = valid) so the client sees every problem at once.
 */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const isText = (v, max) => typeof v === 'string' && v.trim().length > 0 && v.trim().length <= max;

function validateRegistration({ name, email, password } = {}) {
  const errors = [];
  if (!isText(name, 60)) errors.push('name is required (max 60 characters)');
  if (typeof email !== 'string' || !EMAIL_RE.test(email.trim())) errors.push('a valid email is required');
  if (typeof password !== 'string' || password.length < 8) errors.push('password must be at least 8 characters');
  else if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) errors.push('password must contain a letter and a number');
  return errors;
}

function validateLogin({ email, password } = {}) {
  const errors = [];
  if (typeof email !== 'string' || !EMAIL_RE.test(email.trim())) errors.push('a valid email is required');
  if (typeof password !== 'string' || password.length === 0) errors.push('password is required');
  return errors;
}

/** @param partial true for PUT updates (every field optional) */
function validateSong(body = {}, partial = false) {
  const errors = [];
  for (const [f, max] of Object.entries({ title: 150, artist: 100 })) {
    if (body[f] === undefined && partial) continue;
    if (!isText(body[f], max)) errors.push(`${f} must be a non-empty string (max ${max} characters)`);
  }
  for (const [f, max] of Object.entries({ album: 100, language: 40, genre: 40 })) {
    if (body[f] === undefined || body[f] === '') continue;
    if (!isText(body[f], max)) errors.push(`${f} must be text (max ${max} characters)`);
  }
  if (body.lyrics === undefined) {
    if (!partial) errors.push('lyrics is required');
  } else if (typeof body.lyrics !== 'string' || !body.lyrics.trim() || body.lyrics.length > 20000) {
    errors.push('lyrics must be non-empty text (max 20000 characters)');
  }
  if (body.year !== undefined && body.year !== null && body.year !== '') {
    const y = Number(body.year);
    if (!Number.isInteger(y) || y < 1800 || y > new Date().getFullYear() + 1) errors.push('year must be a valid year');
  }
  return errors;
}

/** Whitelist: stops clients from setting _id, timestamps, etc. (mass assignment). */
function pickSongFields(body) {
  const out = {};
  for (const k of ['title', 'artist', 'album', 'language', 'genre', 'lyrics']) {
    if (body[k] !== undefined) out[k] = String(body[k]).trim();
  }
  if (body.year !== undefined) out.year = body.year === '' || body.year === null ? null : Number(body.year);
  return out;
}

/** Escape user text before using it inside a RegExp (prevents regex injection / ReDoS). */
const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

module.exports = { validateRegistration, validateLogin, validateSong, pickSongFields, escapeRegex };
