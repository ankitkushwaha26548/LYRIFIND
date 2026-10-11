/**
 * The whole public API in one table.
 *  POST   /api/auth/register        public
 *  POST   /api/auth/login           public
 *  GET    /api/auth/me              user
 *  GET    /api/songs                public  (q, language, genre, page, limit)
 *  GET    /api/songs/filters        public  (distinct languages + genres)
 *  GET    /api/songs/:id            public  (includes lyrics)
 *  POST   /api/songs                admin
 *  PUT    /api/songs/:id            admin
 *  DELETE /api/songs/:id            admin
 *  GET    /api/favorites            user
 *  POST   /api/favorites/:songId    user
 *  DELETE /api/favorites/:songId    user
 */
const express = require('express');
const rateLimit = require('express-rate-limit');
const config = require('../config');
const { authenticate, requireRole } = require('../middleware/auth');
const authC = require('../controllers/authController');
const songC = require('../controllers/songController');
const favC = require('../controllers/favoriteController');

const router = express.Router();
const admin = [authenticate, requireRole('admin')];

// Brute-force protection on login/register (disabled in tests).
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, limit: 50, standardHeaders: true, legacyHeaders: false,
  skip: () => config.env === 'test',
  message: { error: 'Too many attempts, please try again later' },
});

router.get('/health', (_req, res) => res.json({ status: 'ok' }));

router.post('/auth/register', authLimiter, authC.register);
router.post('/auth/login', authLimiter, authC.login);
router.get('/auth/me', authenticate, authC.me);

router.get('/songs', songC.list);
router.get('/songs/filters', songC.filters); // must be before /songs/:id
router.get('/songs/:id', songC.get);
router.post('/songs', ...admin, songC.create);
router.put('/songs/:id', ...admin, songC.update);
router.delete('/songs/:id', ...admin, songC.remove);

router.get('/favorites', authenticate, favC.list);
router.post('/favorites/:songId', authenticate, favC.add);
router.delete('/favorites/:songId', authenticate, favC.remove);

module.exports = router;
