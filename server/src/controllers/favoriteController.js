const asyncHandler = require('../utils/asyncHandler');
const favs = require('../services/favoriteService');

module.exports = {
  list: asyncHandler(async (req, res) => res.json({ favorites: await favs.list(req.user.id) })),
  add: asyncHandler(async (req, res) => { await favs.add(req.user.id, req.params.songId); res.status(201).json({ message: 'Added to favorites' }); }),
  remove: asyncHandler(async (req, res) => { await favs.remove(req.user.id, req.params.songId); res.status(204).end(); }),
};
