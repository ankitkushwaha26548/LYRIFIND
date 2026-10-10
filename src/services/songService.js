/** Song CRUD + search business logic. */
const AppError = require('../utils/AppError');
const { validateSong, pickSongFields } = require('../utils/validators');

const MAX_LIMIT = 50;

/** Parse and clamp pagination input so bad values can never break the query. */
function parsePaging(query) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(query.limit, 10) || 10));
  return { page, limit };
}

function createSongService(store) {
  const mustFind = async (id) => {
    const song = await store.getSong(id);
    if (!song) throw new AppError(404, 'Song not found');
    return song;
  };

  return {
    async search(query = {}) {
      const { page, limit } = parsePaging(query);
      const { items, total } = await store.searchSongs({
        q: (query.q || '').toString().trim(),
        language: (query.language || '').toString().trim(),
        genre: (query.genre || '').toString().trim(),
        page,
        limit,
      });
      // The list view omits the (large) lyrics body.
      const results = items.map(({ lyrics, ...meta }) => meta);
      return { results, page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) };
    },

    getById: (id) => mustFind(id),

    async create(body) {
      const errors = validateSong(body, false);
      if (errors.length) throw new AppError(400, 'Validation failed', errors);
      return store.createSong(pickSongFields(body));
    },

    async update(id, body) {
      await mustFind(id);
      const errors = validateSong(body, true);
      if (errors.length) throw new AppError(400, 'Validation failed', errors);
      return store.updateSong(id, pickSongFields(body));
    },

    async remove(id) {
      await mustFind(id);
      await store.deleteSong(id);
    },
  };
}

module.exports = { createSongService, parsePaging };
