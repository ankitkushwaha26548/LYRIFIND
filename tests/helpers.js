const request = require('supertest');
const { createApp } = require('../src/app');
const { createJsonStore } = require('../src/store/jsonStore');

/** Fresh in-memory app for every test file. */
const makeApp = () => {
  const store = createJsonStore(null);
  return { app: createApp(store), store };
};

const USER = { name: 'Test User', email: 'user@example.com', password: 'Passw0rdOK' };
const ADMIN = { name: 'Admin', email: 'admin@lyrifind.local', password: 'Admin1234' };
const SONG = { title: 'Test Song', artist: 'Test Artist', album: 'Test Album', language: 'English', genre: 'Pop', year: 2024, lyrics: 'la la la' };

async function registerAndToken(app, creds = USER) {
  const res = await request(app).post('/api/auth/register').send(creds);
  return res.body.token;
}

module.exports = { request, makeApp, USER, ADMIN, SONG, registerAndToken };
