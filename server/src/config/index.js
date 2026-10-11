/** All environment access lives here; the rest of the code imports this object. */
require('dotenv').config();

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lyrifind',
  jwtSecret: process.env.JWT_SECRET || 'dev-only-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '2h',
  adminEmail: (process.env.ADMIN_EMAIL || 'admin@lyrifind.local').toLowerCase(),
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  seedOnStart: (process.env.SEED_ON_START || 'true') === 'true',
  bcryptRounds: 10,
};
