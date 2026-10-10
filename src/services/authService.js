/**
 * Authentication business logic: register, login, token handling.
 * Contains NO Express code - it only talks to the store - so it can be
 * unit-tested and reused independently of HTTP.
 */
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const AppError = require('../utils/AppError');
const { validateRegistration, validateLogin } = require('../utils/validators');

/** Never send the password hash to clients. */
const toPublicUser = ({ id, name, email, role }) => ({ id, name, email, role });

const signToken = (user) =>
  jwt.sign({ sub: user.id, role: user.role }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });

function createAuthService(store) {
  return {
    async register(body) {
      const errors = validateRegistration(body);
      if (errors.length) throw new AppError(400, 'Validation failed', errors);

      const email = body.email.trim().toLowerCase();
      if (await store.findUserByEmail(email)) throw new AppError(409, 'Email is already registered');

      const passwordHash = await bcrypt.hash(body.password, config.bcryptRounds);
      // Role is decided by the server, never by the client (prevents privilege escalation).
      const role = email === config.adminEmail ? 'admin' : 'user';
      const user = await store.createUser({ name: body.name.trim(), email, passwordHash, role });
      return { user: toPublicUser(user), token: signToken(user) };
    },

    async login(body) {
      const errors = validateLogin(body);
      if (errors.length) throw new AppError(400, 'Validation failed', errors);

      const user = await store.findUserByEmail(body.email.trim());
      // Same message for "no such user" and "wrong password" => no account enumeration.
      const ok = user && (await bcrypt.compare(body.password, user.passwordHash));
      if (!ok) throw new AppError(401, 'Invalid email or password');
      return { user: toPublicUser(user), token: signToken(user) };
    },

    async getProfile(userId) {
      const user = await store.findUserById(userId);
      if (!user) throw new AppError(404, 'User not found');
      return toPublicUser(user);
    },
  };
}

module.exports = { createAuthService, toPublicUser };
