/**
 * Route table - the whole public API in one readable place.
 *
 *  POST   /api/auth/register          public
 *  POST   /api/auth/login             public
 *  GET    /api/auth/me                logged-in user
 *  GET    /api/songs                  public (search/filter/paginate)
 *  GET    /api/songs/:id              public (includes lyrics)
 *  POST   /api/songs                  admin
 *  PUT    /api/songs/:id              admin
 *  DELETE /api/songs/:id              admin
 *  GET    /api/favorites              logged-in user
 *  POST   /api/favorites/:songId      logged-in user
 *  DELETE /api/favorites/:songId      logged-in user
 */
const express = require('express');
const { authenticate, requireRole } = require('../middleware/auth');
const { createAuthService } = require('../services/authService');
const { createSongService } = require('../services/songService');
const { createFavoriteService } = require('../services/favoriteService');
const authController = require('../controllers/authController');
const songController = require('../controllers/songController');
const favoriteController = require('../controllers/favoriteController');

function buildRoutes(store) {
  const router = express.Router();
  const auth = authController(createAuthService(store));
  const songs = songController(createSongService(store));
  const favs = favoriteController(createFavoriteService(store));
  const admin = [authenticate, requireRole('admin')];

  router.get('/health', (_req, res) => res.json({ status: 'ok' }));

  router.post('/auth/register', auth.register);
  router.post('/auth/login', auth.login);
  router.get('/auth/me', authenticate, auth.me);

  router.get('/songs', songs.list);
  router.get('/songs/:id', songs.get);
  router.post('/songs', ...admin, songs.create);
  router.put('/songs/:id', ...admin, songs.update);
  router.delete('/songs/:id', ...admin, songs.remove);

  router.get('/favorites', authenticate, favs.list);
  router.post('/favorites/:songId', authenticate, favs.add);
  router.delete('/favorites/:songId', authenticate, favs.remove);

  return router;
}
module.exports = { buildRoutes };
