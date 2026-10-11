const { request, app, connect, disconnect, clear, SONG, ADMIN, USER, registerAndToken, bearer } = require('./helpers');

let userToken, adminToken, songId;
beforeAll(() => connect('lf_favs'));
afterAll(disconnect);
beforeEach(async () => {
  await clear();
  adminToken = await registerAndToken(ADMIN);
  userToken = await registerAndToken(USER);
  songId = (await request(app).post('/api/songs').set(bearer(adminToken)).send(SONG)).body.song._id;
});

describe('Favorites', () => {
  test('requires login', async () => {
    expect((await request(app).get('/api/favorites')).status).toBe(401);
    expect((await request(app).post(`/api/favorites/${songId}`)).status).toBe(401);
  });

  test('add, list and remove', async () => {
    expect((await request(app).post(`/api/favorites/${songId}`).set(bearer(userToken))).status).toBe(201);
    const list = await request(app).get('/api/favorites').set(bearer(userToken));
    expect(list.body.favorites.map((s) => s._id)).toEqual([songId]);
    expect(list.body.favorites[0].lyrics).toBeUndefined();
    expect((await request(app).delete(`/api/favorites/${songId}`).set(bearer(userToken))).status).toBe(204);
    expect((await request(app).get('/api/favorites').set(bearer(userToken))).body.favorites).toEqual([]);
  });

  test('duplicate -> 409; unknown/invalid song -> 404; removing a non-favorite -> 404', async () => {
    await request(app).post(`/api/favorites/${songId}`).set(bearer(userToken));
    expect((await request(app).post(`/api/favorites/${songId}`).set(bearer(userToken))).status).toBe(409);
    expect((await request(app).post('/api/favorites/64b64c4f1f1f1f1f1f1f1f1f').set(bearer(userToken))).status).toBe(404);
    expect((await request(app).post('/api/favorites/nope').set(bearer(userToken))).status).toBe(404);
    expect((await request(app).delete('/api/favorites/64b64c4f1f1f1f1f1f1f1f1f').set(bearer(userToken))).status).toBe(404);
  });

  test('favorites are private per user', async () => {
    await request(app).post(`/api/favorites/${songId}`).set(bearer(userToken));
    const other = await registerAndToken({ name: 'B', email: 'b@example.com', password: 'Passw0rdOK' });
    expect((await request(app).get('/api/favorites').set(bearer(other))).body.favorites).toEqual([]);
  });

  test('deleting a song removes it from favorites', async () => {
    await request(app).post(`/api/favorites/${songId}`).set(bearer(userToken));
    await request(app).delete(`/api/songs/${songId}`).set(bearer(adminToken));
    expect((await request(app).get('/api/favorites').set(bearer(userToken))).body.favorites).toEqual([]);
  });
});
