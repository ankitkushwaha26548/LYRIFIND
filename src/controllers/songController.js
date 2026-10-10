const asyncHandler = require('../utils/asyncHandler');

module.exports = (songService) => ({
  list: asyncHandler(async (req, res) => res.json(await songService.search(req.query))),
  get: asyncHandler(async (req, res) => res.json({ song: await songService.getById(req.params.id) })),
  create: asyncHandler(async (req, res) => res.status(201).json({ song: await songService.create(req.body) })),
  update: asyncHandler(async (req, res) => res.json({ song: await songService.update(req.params.id, req.body) })),
  remove: asyncHandler(async (req, res) => {
    await songService.remove(req.params.id);
    res.status(204).end();
  }),
});
