const { request, makeApp, USER, ADMIN } = require('./helpers');

describe('Authentication', () => {
  let app;
  beforeEach(() => { ({ app } = makeApp()); });

  test('registers a new user and returns a token (no password hash leaked)', async () => {
    const res = await request(app).post('/api/auth/register').send(USER);
    expect(res.status).toBe(201);
    expect(res.body.token).toEqual(expect.any(String));
    expect(res.body.user).toMatchObject({ name: USER.name, email: USER.email, role: 'user' });
    expect(res.body.user.passwordHash).toBeUndefined();
  });

  test('rejects duplicate e-mail with 409', async () => {
    await request(app).post('/api/auth/register').send(USER);
    const res = await request(app).post('/api/auth/register').send({ ...USER, email: USER.email.toUpperCase() });
    expect(res.status).toBe(409);
  });

  test.each([
    ['missing fields', {}],
    ['bad e-mail', { ...USER, email: 'nope' }],
    ['short password', { ...USER, password: 'a1' }],
    ['password without a number', { ...USER, password: 'onlyletters' }],
  ])('rejects registration: %s', async (_name, body) => {
    const res = await request(app).post('/api/auth/register').send(body);
    expect(res.status).toBe(400);
    expect(res.body.details.length).toBeGreaterThan(0);
  });

  test('client cannot choose its own role', async () => {
    const res = await request(app).post('/api/auth/register').send({ ...USER, role: 'admin' });
    expect(res.body.user.role).toBe('user');
  });

  test('the configured admin e-mail becomes an admin', async () => {
    const res = await request(app).post('/api/auth/register').send(ADMIN);
    expect(res.body.user.role).toBe('admin');
  });

  test('logs in with correct credentials', async () => {
    await request(app).post('/api/auth/register').send(USER);
    const res = await request(app).post('/api/auth/login').send({ email: USER.email, password: USER.password });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  test('wrong password and unknown user get the same 401 message', async () => {
    await request(app).post('/api/auth/register').send(USER);
    const bad = await request(app).post('/api/auth/login').send({ email: USER.email, password: 'wrongPass1' });
    const none = await request(app).post('/api/auth/login').send({ email: 'ghost@example.com', password: 'wrongPass1' });
    expect(bad.status).toBe(401);
    expect(none.status).toBe(401);
    expect(bad.body.error).toBe(none.body.error);
  });

  test('/me requires a valid token', async () => {
    expect((await request(app).get('/api/auth/me')).status).toBe(401);
    expect((await request(app).get('/api/auth/me').set('Authorization', 'Bearer garbage')).status).toBe(401);
    const reg = await request(app).post('/api/auth/register').send(USER);
    const me = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${reg.body.token}`);
    expect(me.status).toBe(200);
    expect(me.body.user.email).toBe(USER.email);
  });
});
