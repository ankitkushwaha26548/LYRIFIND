/** Per-user favorites ("saved lyrics") logic. */
const AppError = require('../utils/AppError');

function createFavoriteService(store) {
  return {
    list: (userId) => store.listFavorites(userId),

    async add(userId, songId) {
      if (!(await store.getSong(songId))) throw new AppError(404, 'Song not found');
      const added = await store.addFavorite(userId, songId);
      if (!added) throw new AppError(409, 'Song is already in favorites');
    },

    async remove(userId, songId) {
      const removed = await store.removeFavorite(userId, songId);
      if (!removed) throw new AppError(404, 'Song is not in favorites');
    },
  };
}
module.exports = { createFavoriteService };
