/**
 * Small, dependency-free validation helpers. Each validator returns an
 * array of error strings (empty array = valid) so controllers can report
 * every problem at once instead of one at a time.
 */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isNonEmptyString = (v, max = 255) =>
  typeof v === 'string' && v.trim().length > 0 && v.trim().length <= max;

function validateRegistration({ name, email, password } = {}) {
  const errors = [];
  if (!isNonEmptyString(name, 60)) errors.push('name is required (max 60 characters)');
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

/**
 * @param {object} body    request body
 * @param {boolean} partial true for PUT updates (all fields optional)
 */
function validateSong(body = {}, partial = false) {
  const errors = [];
  const required = { title: 150, artist: 100 };
  const optional = { album: 100, language: 40, genre: 40 };

  for (const [field, max] of Object.entries(required)) {
    if (body[field] === undefined && partial) continue;
    if (!isNonEmptyString(body[field], max)) errors.push(`${field} must be a non-empty string (max ${max} characters)`);
  }
  for (const [field, max] of Object.entries(optional)) {
    if (body[field] === undefined || body[field] === '') continue;
    if (!isNonEmptyString(body[field], max)) errors.push(`${field} must be text (max ${max} characters)`);
  }
  if (body.lyrics === undefined) {
    if (!partial) errors.push('lyrics is required');
  } else if (typeof body.lyrics !== 'string' || body.lyrics.trim() === '' || body.lyrics.length > 20000) {
    errors.push('lyrics must be non-empty text (max 20000 characters)');
  }
  if (body.year !== undefined && body.year !== null && body.year !== '') {
    const y = Number(body.year);
    if (!Number.isInteger(y) || y < 1800 || y > new Date().getFullYear() + 1) errors.push('year must be a valid year');
  }
  return errors;
}

/** Keep only whitelisted fields (prevents mass-assignment of id/createdAt/etc.). */
function pickSongFields(body) {
  const allowed = ['title', 'artist', 'album', 'language', 'genre', 'year', 'lyrics'];
  const out = {};
  for (const k of allowed) {
    if (body[k] !== undefined) out[k] = typeof body[k] === 'string' ? body[k].trim() : body[k];
  }
  if (out.year === '' || out.year === null) out.year = null;
  else if (out.year !== undefined) out.year = Number(out.year);
  return out;
}

module.exports = { validateRegistration, validateLogin, validateSong, pickSongFields };
