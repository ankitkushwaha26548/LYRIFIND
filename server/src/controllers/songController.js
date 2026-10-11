const asyncHandler = require('../utils/asyncHandler');
const songs = require('../services/songService');

module.exports = {
  list: asyncHandler(async (req, res) => res.json(await songs.search(req.query))),
  filters: asyncHandler(async (_req, res) => res.json(await songs.getFilters())),
  get: asyncHandler(async (req, res) => res.json({ song: await songs.getById(req.params.id) })),
  create: asyncHandler(async (req, res) => res.status(201).json({ song: await songs.create(req.body) })),
  update: asyncHandler(async (req, res) => res.json({ song: await songs.update(req.params.id, req.body) })),
  remove: asyncHandler(async (req, res) => { await songs.remove(req.params.id); res.status(204).end(); }),
};
