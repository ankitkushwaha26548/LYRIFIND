/**
 * Central configuration. All environment access happens here so the rest
 * of the code never reads process.env directly (easier to test/change).
 */
require('dotenv').config();

module.exports = {
  port: Number(process.env.PORT) || 5000,
  jwtSecret: process.env.JWT_SECRET || 'dev-only-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '2h',
  adminEmail: (process.env.ADMIN_EMAIL || 'admin@lyrifind.local').toLowerCase(),
  storage: process.env.STORAGE || 'json',
  dataFile: process.env.DATA_FILE || './data/db.json',
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lyrifind',
  bcryptRounds: 10,
};
