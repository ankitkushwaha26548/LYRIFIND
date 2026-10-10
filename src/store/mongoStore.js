/**
 * MongoDB data store (optional, enabled with STORAGE=mongo).
 * Implements the exact same interface as jsonStore.js using Mongoose.
 * mongoose is an optionalDependency so the default install stays light.
 */
const crypto = require('crypto');

async function createMongoStore(uri) {
  const mongoose = require('mongoose');
  await mongoose.connect(uri);

  const opts = { versionKey: false, toJSON: { transform: (_d, r) => { r.id = r._id; delete r._id; return r; } } };
  const User = mongoose.model('User', new mongoose.Schema({
    _id: { type: String, default: () => crypto.randomUUID() },
    name: String, email: { type: String, unique: true, lowercase: true },
    passwordHash: String, role: { type: String, default: 'user' },
  }, { ...opts, timestamps: true }));
  const Song = mongoose.model('Song', new mongoose.Schema({
    _id: { type: String, default: () => crypto.randomUUID() },
    title: { type: String, required: true, index: true }, artist: { type: String, required: true, index: true },
    album: { type: String, default: '' }, language: { type: String, default: '' }, genre: { type: String, default: '' },
    year: Number, lyrics: { type: String, required: true },
  }, { ...opts, timestamps: true }));
  const favSchema = new mongoose.Schema({ userId: String, songId: String }, { ...opts, timestamps: true });
  favSchema.index({ userId: 1, songId: 1 }, { unique: true });
  const Favorite = mongoose.model('Favorite', favSchema);

  const lean = (d) => (d ? { ...d.toJSON() } : null);
  const esc = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const ci = (s) => new RegExp(`^${esc(s)}$`, 'i');

  return {
    async createUser(d) { return lean(await User.create(d)); },
    async findUserByEmail(e) { return lean(await User.findOne({ email: String(e).toLowerCase() })); },
    async findUserById(id) { return lean(await User.findById(id)); },
    async createSong(d) { return lean(await Song.create(d)); },
    async getSong(id) { return lean(await Song.findById(id)); },
    async updateSong(id, d) { return lean(await Song.findByIdAndUpdate(id, d, { new: true })); },
    async deleteSong(id) {
      const r = await Song.findByIdAndDelete(id);
      if (r) await Favorite.deleteMany({ songId: id });
      return !!r;
    },
    async searchSongs({ q, language, genre, page = 1, limit = 10 }) {
      const f = {};
      if (q) { const rx = new RegExp(esc(q), 'i'); f.$or = [{ title: rx }, { artist: rx }, { album: rx }]; }
      if (language) f.language = ci(language);
      if (genre) f.genre = ci(genre);
      const [items, total] = await Promise.all([
        Song.find(f).sort({ title: 1 }).skip((page - 1) * limit).limit(limit),
        Song.countDocuments(f),
      ]);
      return { items: items.map(lean), total };
    },
    async countSongs() { return Song.countDocuments(); },
    async addFavorite(userId, songId) {
      try { await Favorite.create({ userId, songId }); return true; } catch (e) { if (e.code === 11000) return false; throw e; }
    },
    async removeFavorite(userId, songId) { return (await Favorite.deleteOne({ userId, songId })).deletedCount > 0; },
    async listFavorites(userId) {
      const ids = (await Favorite.find({ userId })).map((f) => f.songId);
      return (await Song.find({ _id: { $in: ids } })).map(lean);
    },
  };
}

module.exports = { createMongoStore };
