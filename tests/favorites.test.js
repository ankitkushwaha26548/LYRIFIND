const { request, makeApp, SONG, ADMIN, USER, registerAndToken } = require('./helpers');

describe('Favorites', () => {
  let app, userToken, songId, adminToken;
  const auth = (t) => ({ Authorization: `Bearer ${t}` });

  beforeEach(async () => {
    ({ app } = makeApp());
    adminToken = await registerAndToken(app, ADMIN);
    userToken = await registerAndToken(app, USER);
    songId = (await request(app).post('/api/songs').set(auth(adminToken)).send(SONG)).body.song.id;
  });

  test('requires login', async () => {
    expect((await request(app).get('/api/favorites')).status).toBe(401);
    expect((await request(app).post(`/api/favorites/${songId}`)).status).toBe(401);
  });

  test('add, list and remove a favorite', async () => {
    expect((await request(app).post(`/api/favorites/${songId}`).set(auth(userToken))).status).toBe(201);
    const list = await request(app).get('/api/favorites').set(auth(userToken));
    expect(list.body.favorites.map((s) => s.id)).toEqual([songId]);
    expect((await request(app).delete(`/api/favorites/${songId}`).set(auth(userToken))).status).toBe(204);
    expect((await request(app).get('/api/favorites').set(auth(userToken))).body.favorites).toEqual([]);
  });

  test('duplicate add -> 409; unknown song -> 404; removing a non-favorite -> 404', async () => {
    await request(app).post(`/api/favorites/${songId}`).set(auth(userToken));
    expect((await request(app).post(`/api/favorites/${songId}`).set(auth(userToken))).status).toBe(409);
    expect((await request(app).post('/api/favorites/nope').set(auth(userToken))).status).toBe(404);
    expect((await request(app).delete('/api/favorites/nope').set(auth(userToken))).status).toBe(404);
  });

  test('favorites are private per user', async () => {
    await request(app).post(`/api/favorites/${songId}`).set(auth(userToken));
    const other = await registerAndToken(app, { name: 'B', email: 'b@example.com', password: 'Passw0rdOK' });
    expect((await request(app).get('/api/favorites').set(auth(other))).body.favorites).toEqual([]);
  });

  test('deleting a song also removes it from favorites', async () => {
    await request(app).post(`/api/favorites/${songId}`).set(auth(userToken));
    await request(app).delete(`/api/songs/${songId}`).set(auth(adminToken));
    expect((await request(app).get('/api/favorites').set(auth(userToken))).body.favorites).toEqual([]);
  });
});
