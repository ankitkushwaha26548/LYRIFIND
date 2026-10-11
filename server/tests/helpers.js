/**
 * Test helpers. Tests run against a REAL MongoDB-protocol server:
 *  - by default an in-memory MongoDB (mongodb-memory-server) is started;
 *  - set TEST_MONGO_URI to use an existing server instead (e.g. in CI or Docker).
 * Collections are emptied before every test so tests are independent.
 */
const mongoose = require('mongoose');
const request = require('supertest');
const { createApp } = require('../src/app');
const User = require('../src/models/User');
const Song = require('../src/models/Song');

let mongod;

async function connect(dbName) {
  let uri = process.env.TEST_MONGO_URI;
  if (!uri) {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongod = await MongoMemoryServer.create();
    uri = mongod.getUri();
  }
  await mongoose.connect(uri, { dbName });
  await Promise.all([User.init(), Song.init()]); // make sure the unique index exists
}
async function disconnect() {
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
}
const clear = () => Promise.all([User.deleteMany({}), Song.deleteMany({})]);

const app = createApp();
const USER = { name: 'Test User', email: 'user@example.com', password: 'Passw0rdOK' };
const ADMIN = { name: 'Admin', email: 'admin@lyrifind.local', password: 'Admin1234' };
const SONG = { title: 'Test Song', artist: 'Test Artist', album: 'Test Album', language: 'English', genre: 'Pop', year: 2024, lyrics: 'la la la' };

async function registerAndToken(creds = USER) {
  const res = await request(app).post('/api/auth/register').send(creds);
  return res.body.token;
}
const bearer = (t) => ({ Authorization: `Bearer ${t}` });

module.exports = { request, app, connect, disconnect, clear, USER, ADMIN, SONG, registerAndToken, bearer };
