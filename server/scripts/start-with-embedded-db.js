/**
 * Zero-install mode: starts a real MongoDB (via mongodb-memory-server) that stores its data
 * in server/.embedded-db, then starts the LyriFind API against it.
 *
 *   npm start:embedded     -> no MongoDB installation, Docker or Atlas account needed.
 *
 * The first run downloads a MongoDB binary (~100-200 MB) once and caches it on your PC.
 * Data is kept between runs. Delete the server/.embedded-db folder to reset the database.
 */
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', '.embedded-db');
const PORT = Number(process.env.EMBEDDED_DB_PORT) || 27099;

(async () => {
  const { MongoMemoryServer } = require('mongodb-memory-server');
  fs.mkdirSync(DB_PATH, { recursive: true });

  console.log('Starting embedded MongoDB (first run downloads the MongoDB binary, please wait)...');
  const mongod = await MongoMemoryServer.create({ instance: { port: PORT, dbPath: DB_PATH, storageEngine: 'wiredTiger' } });
  process.env.MONGO_URI = mongod.getUri('lyrifind'); // dotenv never overrides an existing variable
  console.log(`Embedded MongoDB ready at ${process.env.MONGO_URI}`);

  const shutdown = async () => { await mongod.stop({ doCleanup: false }); process.exit(0); }; // keep the data
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  require('../src/server'); // connects to MONGO_URI, seeds if empty, listens
})().catch((e) => {
  console.error('\nCould not start the embedded MongoDB:', e.message);
  console.error('Check your internet connection (needed once), or use Docker / a local MongoDB / MongoDB Atlas and set MONGO_URI in server/.env, then run: npm start');
  process.exit(1);
});
