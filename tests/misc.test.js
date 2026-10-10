const fs = require('fs');
const os = require('os');
const path = require('path');
const { request, makeApp } = require('./helpers');
const { createJsonStore } = require('../src/store/jsonStore');
const { seedIfEmpty, SAMPLE_SONGS } = require('../scripts/seed');

describe('Infrastructure', () => {
  test('health check', async () => {
    const { app } = makeApp();
    expect((await request(app).get('/api/health')).body).toEqual({ status: 'ok' });
  });
  test('unknown API route returns JSON 404', async () => {
    const { app } = makeApp();
    const res = await request(app).get('/api/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/not found/i);
  });
  test('malformed JSON returns 400, not 500', async () => {
    const { app } = makeApp();
    const res = await request(app).post('/api/auth/login').set('Content-Type', 'application/json').send('{bad json');
    expect(res.status).toBe(400);
  });
  test('JSON store persists data to disk and reloads it', async () => {
    const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'lf-')), 'db.json');
    const a = createJsonStore(file);
    const song = await a.createSong({ title: 'Saved', artist: 'X', lyrics: 'l' });
    const b = createJsonStore(file); // simulates a server restart
    expect((await b.getSong(song.id)).title).toBe('Saved');
  });
  test('seeding is idempotent and creates the demo admin', async () => {
    const store = createJsonStore(null);
    expect(await seedIfEmpty(store)).toBe(true);
    expect(await store.countSongs()).toBe(SAMPLE_SONGS.length);
    expect(await seedIfEmpty(store)).toBe(false);
    expect((await store.findUserByEmail('admin@lyrifind.local')).role).toBe('admin');
  });
});
