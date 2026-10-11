/** Song CRUD + search business logic (Mongoose). */
const mongoose = require('mongoose');
const Song = require('../models/Song');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const { validateSong, pickSongFields, escapeRegex } = require('../utils/validators');

const MAX_LIMIT = 50;

/** Clamp pagination input so bad values cannot break or overload the query. */
function parsePaging(query) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(query.limit, 10) || 10));
  return { page, limit };
}

/** Malformed ids are treated as "not found" instead of crashing with a CastError. */
async function mustFind(id) {
  if (!mongoose.isValidObjectId(id)) throw new AppError(404, 'Song not found');
  const song = await Song.findById(id);
  if (!song) throw new AppError(404, 'Song not found');
  return song;
}

async function search(query = {}) {
  const { page, limit } = parsePaging(query);
  const filter = {};
  const q = String(query.q || '').trim();
  if (q) {
    const rx = new RegExp(escapeRegex(q), 'i');
    filter.$or = [{ title: rx }, { artist: rx }, { album: rx }];
  }
  const language = String(query.language || '').trim();
  const genre = String(query.genre || '').trim();
  if (language) filter.language = new RegExp(`^${escapeRegex(language)}$`, 'i');
  if (genre) filter.genre = new RegExp(`^${escapeRegex(genre)}$`, 'i');

  const [items, total] = await Promise.all([
    Song.find(filter).select('-lyrics').sort({ title: 1, _id: 1 }).skip((page - 1) * limit).limit(limit),
    Song.countDocuments(filter),
  ]);
  return { results: items, page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) };
}

/** Distinct languages and genres, used by the UI filter drop-downs. */
async function getFilters() {
  const [languages, genres] = await Promise.all([Song.distinct('language'), Song.distinct('genre')]);
  const clean = (a) => a.filter(Boolean).sort((x, y) => x.localeCompare(y));
  return { languages: clean(languages), genres: clean(genres) };
}

const getById = (id) => mustFind(id);

async function create(body) {
  const errors = validateSong(body, false);
  if (errors.length) throw new AppError(400, 'Validation failed', errors);
  return Song.create(pickSongFields(body));
}

async function update(id, body) {
  const song = await mustFind(id);
  const errors = validateSong(body, true);
  if (errors.length) throw new AppError(400, 'Validation failed', errors);
  song.set(pickSongFields(body));
  return song.save();
}

async function remove(id) {
  const song = await mustFind(id);
  await song.deleteOne();
  // keep referential integrity: pull the song out of everyone's favorites
  await User.updateMany({ favorites: song._id }, { $pull: { favorites: song._id } });
}

module.exports = { search, getFilters, getById, create, update, remove, parsePaging };
