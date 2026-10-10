/** Thin HTTP layer: read request -> call service -> send response. */
const asyncHandler = require('../utils/asyncHandler');

module.exports = (authService) => ({
  register: asyncHandler(async (req, res) => res.status(201).json(await authService.register(req.body))),
  login: asyncHandler(async (req, res) => res.json(await authService.login(req.body))),
  me: asyncHandler(async (req, res) => res.json({ user: await authService.getProfile(req.user.id) })),
});
