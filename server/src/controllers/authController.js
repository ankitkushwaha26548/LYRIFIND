const asyncHandler = require('../utils/asyncHandler');
const auth = require('../services/authService');

module.exports = {
  register: asyncHandler(async (req, res) => res.status(201).json(await auth.register(req.body))),
  login: asyncHandler(async (req, res) => res.json(await auth.login(req.body))),
  me: asyncHandler(async (req, res) => res.json({ user: await auth.getProfile(req.user.id) })),
};
