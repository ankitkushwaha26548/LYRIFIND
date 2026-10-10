/**
 * JSON-file data store (default, zero-setup).
 *
 * Implements the same "store interface" as mongoStore.js so the services
 * never know which database is in use (Repository pattern). Data is held
 * in memory and written through to disk on every mutation. Passing
 * `filePath = null` gives a purely in-memory store, used by the tests.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const newId = () => crypto.randomUUID();

function createJsonStore(filePath = null) {
  let db = { users: [], songs: [], favorites: [] };

  if (filePath && fs.existsSync(filePath)) {
    try {
      db = { ...db, ...JSON.parse(fs.readFileSync(filePath, 'utf8')) };
    } catch (e) {
      throw new Error(`Could not read data file ${filePath}: ${e.message}`);
    }
  }

  const persist = () => {
    if (!filePath) return;
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    // write to a temp file then rename => never leaves a half-written DB
    const tmp = `${filePath}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(db, null, 2));
    fs.renameSync(tmp, filePath);
  };

  const norm = (s) => String(s || '').toLowerCase();

  return {
    // ---------- users ----------
    async createUser({ name, email, passwordHash, role }) {
      const user = { id: newId(), name, email: norm(email), passwordHash, role, createdAt: new Date().toISOString() };
      db.users.push(user);
      persist();
      return user;
    },
    async findUserByEmail(email) {
      return db.users.find((u) => u.email === norm(email)) || null;
    },
    async findUserById(id) {
      return db.users.find((u) => u.id === id) || null;
    },

    // ---------- songs ----------
    async createSong(data) {
      const now = new Date().toISOString();
      const song = { id: newId(), album: '', genre: '', language: '', year: null, ...data, createdAt: now, updatedAt: now };
      db.songs.push(song);
      persist();
      return song;
    },
    async getSong(id) {
      return db.songs.find((s) => s.id === id) || null;
    },
    async updateSong(id, data) {
      const song = db.songs.find((s) => s.id === id);
      if (!song) return null;
      Object.assign(song, data, { updatedAt: new Date().toISOString() });
      persist();
      return song;
    },
    async deleteSong(id) {
      const idx = db.songs.findIndex((s) => s.id === id);
      if (idx === -1) return false;
      db.songs.splice(idx, 1);
      // keep referential integrity: remove favorites pointing at the song
      db.favorites = db.favorites.filter((f) => f.songId !== id);
      persist();
      return true;
    },
    /**
     * Search with optional text query (title/artist/album), language & genre
     * filters, sorting by title, and pagination.
     */
    async searchSongs({ q, language, genre, page = 1, limit = 10 }) {
      let list = db.songs;
      if (q) {
        const needle = norm(q);
        list = list.filter((s) => [s.title, s.artist, s.album].some((f) => norm(f).includes(needle)));
      }
      if (language) list = list.filter((s) => norm(s.language) === norm(language));
      if (genre) list = list.filter((s) => norm(s.genre) === norm(genre));
      list = [...list].sort((a, b) => a.title.localeCompare(b.title));
      const total = list.length;
      const start = (page - 1) * limit;
      return { items: list.slice(start, start + limit), total };
    },
    async countSongs() {
      return db.songs.length;
    },

    // ---------- favorites ----------
    async addFavorite(userId, songId) {
      if (db.favorites.some((f) => f.userId === userId && f.songId === songId)) return false;
      db.favorites.push({ userId, songId, createdAt: new Date().toISOString() });
      persist();
      return true;
    },
    async removeFavorite(userId, songId) {
      const before = db.favorites.length;
      db.favorites = db.favorites.filter((f) => !(f.userId === userId && f.songId === songId));
      persist();
      return db.favorites.length < before;
    },
    async listFavorites(userId) {
      const ids = db.favorites.filter((f) => f.userId === userId).map((f) => f.songId);
      return db.songs.filter((s) => ids.includes(s.id));
    },
  };
}

module.exports = { createJsonStore };
