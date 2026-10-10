const { request, makeApp, SONG, ADMIN, USER, registerAndToken } = require('./helpers');

describe('Songs CRUD, search and authorization', () => {
  let app, adminToken, userToken;
  beforeEach(async () => {
    ({ app } = makeApp());
    adminToken = await registerAndToken(app, ADMIN);
    userToken = await registerAndToken(app, USER);
  });
  const auth = (t) => ({ Authorization: `Bearer ${t}` });
  const create = (over = {}) => request(app).post('/api/songs').set(auth(adminToken)).send({ ...SONG, ...over });

  test('admin can create a song', async () => {
    const res = await create();
    expect(res.status).toBe(201);
    expect(res.body.song).toMatchObject({ title: SONG.title, artist: SONG.artist });
    expect(res.body.song.id).toBeDefined();
  });

  test('anonymous users and normal users cannot create songs (401 / 403)', async () => {
    expect((await request(app).post('/api/songs').send(SONG)).status).toBe(401);
    expect((await request(app).post('/api/songs').set(auth(userToken)).send(SONG)).status).toBe(403);
  });

  test('validation: missing title/lyrics and bad year give 400', async () => {
    const res = await create({ title: '', lyrics: undefined, year: 'abc' });
    expect(res.status).toBe(400);
    expect(res.body.details.length).toBeGreaterThanOrEqual(3);
  });

  test('mass-assignment is blocked (client cannot set id)', async () => {
    const res = await create({ id: 'hacked' });
    expect(res.body.song.id).not.toBe('hacked');
  });

  test('anyone can read a song with lyrics; list view hides lyrics', async () => {
    const { body } = await create();
    const one = await request(app).get(`/api/songs/${body.song.id}`);
    expect(one.status).toBe(200);
    expect(one.body.song.lyrics).toBe(SONG.lyrics);
    const list = await request(app).get('/api/songs');
    expect(list.body.results[0].lyrics).toBeUndefined();
  });

  test('unknown song id returns 404', async () => {
    expect((await request(app).get('/api/songs/nope')).status).toBe(404);
  });

  test('admin can update (partial) and delete', async () => {
    const { body } = await create();
    const up = await request(app).put(`/api/songs/${body.song.id}`).set(auth(adminToken)).send({ title: 'Renamed' });
    expect(up.status).toBe(200);
    expect(up.body.song.title).toBe('Renamed');
    expect(up.body.song.artist).toBe(SONG.artist); // untouched field preserved
    const del = await request(app).delete(`/api/songs/${body.song.id}`).set(auth(adminToken));
    expect(del.status).toBe(204);
    expect((await request(app).get(`/api/songs/${body.song.id}`)).status).toBe(404);
  });

  test('update/delete of a missing song returns 404', async () => {
    expect((await request(app).put('/api/songs/x').set(auth(adminToken)).send({ title: 'a' })).status).toBe(404);
    expect((await request(app).delete('/api/songs/x').set(auth(adminToken))).status).toBe(404);
  });

  describe('search / filter / pagination', () => {
    beforeEach(async () => {
      await create({ title: 'Alpha', artist: 'Zed', album: 'Sky', language: 'English', genre: 'Rock' });
      await create({ title: 'Beta', artist: 'Yan', album: 'Sea', language: 'Hindi', genre: 'Pop' });
      await create({ title: 'Gamma', artist: 'Zed', album: 'Earth', language: 'English', genre: 'Pop' });
    });
    const titles = (r) => r.body.results.map((s) => s.title);

    test('searches by title, artist and album (case-insensitive)', async () => {
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
    test('invalid paging values fall back to safe defaults / are clamped', async () => {
      const res = await request(app).get('/api/songs?page=-4&limit=99999');
      expect(res.body.page).toBe(1);
      expect(res.body.limit).toBe(50);
    });
    test('no match returns an empty list, not an error', async () => {
      const res = await request(app).get('/api/songs?q=zzzzzz');
      expect(res.status).toBe(200);
      expect(res.body.results).toEqual([]);
    });
  });
});
