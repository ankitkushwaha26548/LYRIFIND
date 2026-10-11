const { request, app, connect, disconnect, clear, USER, ADMIN, bearer } = require('./helpers');
const User = require('../src/models/User');

beforeAll(() => connect('lf_auth'));
afterAll(disconnect);
beforeEach(clear);

describe('Authentication', () => {
  test('registers a user, returns a token, never leaks the password hash', async () => {
    const res = await request(app).post('/api/auth/register').send(USER);
    expect(res.status).toBe(201);
    expect(res.body.token).toEqual(expect.any(String));
    expect(res.body.user).toMatchObject({ name: USER.name, email: USER.email, role: 'user' });
    expect(JSON.stringify(res.body)).not.toMatch(/passwordHash/);
  });

  test('stores a bcrypt hash, not the plain password', async () => {
    await request(app).post('/api/auth/register').send(USER);
    const u = await User.findOne({ email: USER.email }).select('+passwordHash');
    expect(u.passwordHash).not.toBe(USER.password);
    expect(u.passwordHash).toMatch(/^\$2[aby]\$/);
  });

  test('duplicate e-mail (any case) -> 409', async () => {
    await request(app).post('/api/auth/register').send(USER);
    const res = await request(app).post('/api/auth/register').send({ ...USER, email: USER.email.toUpperCase() });
    expect(res.status).toBe(409);
  });

  test.each([
    ['missing fields', {}],
    ['bad e-mail', { ...USER, email: 'nope' }],
    ['short password', { ...USER, password: 'a1' }],
    ['password without a number', { ...USER, password: 'onlyletters' }],
  ])('rejects registration: %s', async (_n, body) => {
    const res = await request(app).post('/api/auth/register').send(body);
    expect(res.status).toBe(400);
    expect(res.body.details.length).toBeGreaterThan(0);
  });

  test('client cannot choose its own role', async () => {
    const res = await request(app).post('/api/auth/register').send({ ...USER, role: 'admin' });
    expect(res.body.user.role).toBe('user');
  });

  test('configured admin e-mail becomes admin', async () => {
    const res = await request(app).post('/api/auth/register').send(ADMIN);
    expect(res.body.user.role).toBe('admin');
  });

  test('login works; wrong password and unknown user give the same 401', async () => {
    await request(app).post('/api/auth/register').send(USER);
    const ok = await request(app).post('/api/auth/login').send({ email: USER.email, password: USER.password });
    expect(ok.status).toBe(200);
    const bad = await request(app).post('/api/auth/login').send({ email: USER.email, password: 'wrongPass1' });
    const none = await request(app).post('/api/auth/login').send({ email: 'ghost@example.com', password: 'wrongPass1' });
    expect([bad.status, none.status]).toEqual([401, 401]);
    expect(bad.body.error).toBe(none.body.error);
  });

  test('/me requires a valid token', async () => {
    expect((await request(app).get('/api/auth/me')).status).toBe(401);
    expect((await request(app).get('/api/auth/me').set(bearer('garbage'))).status).toBe(401);
    const reg = await request(app).post('/api/auth/register').send(USER);
    const me = await request(app).get('/api/auth/me').set(bearer(reg.body.token));
    expect(me.status).toBe(200);
    expect(me.body.user.email).toBe(USER.email);
  });
});
