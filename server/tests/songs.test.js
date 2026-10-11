const { request, app, connect, disconnect, clear, SONG, ADMIN, USER, registerAndToken, bearer } = require('./helpers');

let adminToken, userToken;
beforeAll(() => connect('lf_songs'));
afterAll(disconnect);
beforeEach(async () => {
  await clear();
  adminToken = await registerAndToken(ADMIN);
  userToken = await registerAndToken(USER);
});
const create = (over = {}) => request(app).post('/api/songs').set(bearer(adminToken)).send({ ...SONG, ...over });

describe('Songs CRUD + authorization', () => {
  test('admin can create a song', async () => {
    const res = await create();
    expect(res.status).toBe(201);
    expect(res.body.song).toMatchObject({ title: SONG.title, artist: SONG.artist, year: 2024 });
    expect(res.body.song._id).toBeDefined();
  });

  test('anonymous -> 401, normal user -> 403', async () => {
    expect((await request(app).post('/api/songs').send(SONG)).status).toBe(401);
    expect((await request(app).post('/api/songs').set(bearer(userToken)).send(SONG)).status).toBe(403);
  });

  test('validation errors give 400 with details', async () => {
    const res = await create({ title: '', lyrics: undefined, year: 'abc' });
    expect(res.status).toBe(400);
    expect(res.body.details.length).toBeGreaterThanOrEqual(3);
  });

  test('mass assignment is blocked (cannot forge _id)', async () => {
    const forged = '64b64c4f1f1f1f1f1f1f1f1f';
    const res = await create({ _id: forged });
    expect(res.body.song._id).not.toBe(forged);
  });

  test('anyone can read a song with lyrics; list hides lyrics', async () => {
    const { body } = await create();
    const one = await request(app).get(`/api/songs/${body.song._id}`);
    expect(one.status).toBe(200);
    expect(one.body.song.lyrics).toBe(SONG.lyrics);
    const list = await request(app).get('/api/songs');
    expect(list.body.results[0].lyrics).toBeUndefined();
  });

  test('invalid or unknown ids return 404 (no crash)', async () => {
    expect((await request(app).get('/api/songs/not-an-id')).status).toBe(404);
    expect((await request(app).get('/api/songs/64b64c4f1f1f1f1f1f1f1f1f')).status).toBe(404);
  });

  test('admin can partially update and delete', async () => {
    const { body } = await create();
    const id = body.song._id;
    const up = await request(app).put(`/api/songs/${id}`).set(bearer(adminToken)).send({ title: 'Renamed' });
    expect(up.status).toBe(200);
    expect(up.body.song).toMatchObject({ title: 'Renamed', artist: SONG.artist });
    expect((await request(app).delete(`/api/songs/${id}`).set(bearer(adminToken))).status).toBe(204);
    expect((await request(app).get(`/api/songs/${id}`)).status).toBe(404);
  });

  test('update with invalid data -> 400; update/delete of missing -> 404', async () => {
    const { body } = await create();
    const bad = await request(app).put(`/api/songs/${body.song._id}`).set(bearer(adminToken)).send({ title: '' });
    expect(bad.status).toBe(400);
    expect((await request(app).put('/api/songs/x').set(bearer(adminToken)).send({ title: 'a' })).status).toBe(404);
    expect((await request(app).delete('/api/songs/x').set(bearer(adminToken))).status).toBe(404);
  });
});

describe('Search, filters, pagination', () => {
  beforeEach(async () => {
    await create({ title: 'Alpha', artist: 'Zed', album: 'Sky', language: 'English', genre: 'Rock' });
    await create({ title: 'Beta', artist: 'Yan', album: 'Sea', language: 'Hindi', genre: 'Pop' });
    await create({ title: 'Gamma', artist: 'Zed', album: 'Earth', language: 'English', genre: 'Pop' });
  });
  const titles = (r) => r.body.results.map((s) => s.title);

  test('searches title, artist and album case-insensitively', async () => {
    expect(titles(await request(app).get('/api/songs?q=ALPHA'))).toEqual(['Alpha']);
    expect(titles(await request(app).get('/api/songs?q=zed'))).toEqual(['Alpha', 'Gamma']);
    expect(titles(await request(app).get('/api/songs?q=sea'))).toEqual(['Beta']);
  });
  test('filters by language and genre, combinable with q', async () => {
    expect(titles(await request(app).get('/api/songs?language=hindi'))).toEqual(['Beta']);
    expect(titles(await request(app).get('/api/songs?genre=Pop&language=English'))).toEqual(['Gamma']);
    expect(titles(await request(app).get('/api/songs?q=zed&genre=Rock'))).toEqual(['Alpha']);
  });
  test('paginates and reports totals', async () => {
    const p1 = await request(app).get('/api/songs?limit=2&page=1');
    const p2 = await request(app).get('/api/songs?limit=2&page=2');
    expect(p1.body).toMatchObject({ total: 3, totalPages: 2, page: 1, limit: 2 });
    expect(titles(p1)).toEqual(['Alpha', 'Beta']);
    expect(titles(p2)).toEqual(['Gamma']);
  });
  test('bad paging values are clamped', async () => {
    const res = await request(app).get('/api/songs?page=-4&limit=99999');
    expect(res.body.page).toBe(1);
    expect(res.body.limit).toBe(50);
  });
  test('regex characters in the query are treated as plain text', async () => {
    const res = await request(app).get('/api/songs?q=' + encodeURIComponent('.*'));
    expect(res.status).toBe(200);
    expect(res.body.results).toEqual([]);
  });
  test('no match -> empty list, not an error', async () => {
    const res = await request(app).get('/api/songs?q=zzzzzz');
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(0);
  });
  test('filters endpoint lists distinct languages and genres', async () => {
    const res = await request(app).get('/api/songs/filters');
    expect(res.body).toEqual({ languages: ['English', 'Hindi'], genres: ['Pop', 'Rock'] });
  });
});
