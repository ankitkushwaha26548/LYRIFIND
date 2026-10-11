const { request, app, connect, disconnect, clear } = require('./helpers');
const Song = require('../src/models/Song');
const User = require('../src/models/User');
const { seedIfEmpty, SAMPLE_SONGS } = require('../scripts/seed');

beforeAll(() => connect('lf_misc'));
afterAll(disconnect);
beforeEach(clear);

describe('Infrastructure', () => {
  test('health check', async () => {
    expect((await request(app).get('/api/health')).body).toEqual({ status: 'ok' });
  });
  test('unknown API route -> JSON 404', async () => {
    const res = await request(app).get('/api/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/not found/i);
  });
  test('malformed JSON -> 400 (not 500)', async () => {
    const res = await request(app).post('/api/auth/login').set('Content-Type', 'application/json').send('{bad json');
    expect(res.status).toBe(400);
  });
  test('security headers are set by helmet and x-powered-by is hidden', async () => {
    const res = await request(app).get('/api/health');
    expect(res.headers['x-powered-by']).toBeUndefined();
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });
  test('seeding is idempotent and creates the demo admin', async () => {
    expect(await seedIfEmpty()).toBe(true);
    expect(await Song.countDocuments()).toBe(SAMPLE_SONGS.length);
    expect(await seedIfEmpty()).toBe(false);
    expect((await User.findOne({ email: 'admin@lyrifind.local' })).role).toBe('admin');
  });
  test('Mongoose schema rejects invalid documents (defence in depth)', async () => {
    await expect(Song.create({ title: 'only title' })).rejects.toThrow();
  });
});
