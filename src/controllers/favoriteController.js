const asyncHandler = require('../utils/asyncHandler');

module.exports = (favoriteService) => ({
  list: asyncHandler(async (req, res) => res.json({ favorites: await favoriteService.list(req.user.id) })),
  add: asyncHandler(async (req, res) => {
    await favoriteService.add(req.user.id, req.params.songId);
    res.status(201).json({ message: 'Added to favorites' });
  }),
  remove: asyncHandler(async (req, res) => {
    await favoriteService.remove(req.user.id, req.params.songId);
    res.status(204).end();
  }),
});
