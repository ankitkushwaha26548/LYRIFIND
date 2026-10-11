/** Authentication logic: register, login, profile. No Express code in here. */
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const { validateRegistration, validateLogin } = require('../utils/validators');

const toPublicUser = (u) => ({ id: u._id.toString(), name: u.name, email: u.email, role: u.role });
const signToken = (u) => jwt.sign({ sub: u._id.toString(), role: u.role }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });

async function register(body) {
  const errors = validateRegistration(body);
  if (errors.length) throw new AppError(400, 'Validation failed', errors);

  const email = body.email.trim().toLowerCase();
  if (await User.exists({ email })) throw new AppError(409, 'Email is already registered');

  const passwordHash = await bcrypt.hash(body.password, config.bcryptRounds);
  // The server decides the role - a client can never promote itself.
  const role = email === config.adminEmail ? 'admin' : 'user';
  let user;
  try {
    user = await User.create({ name: body.name, email, passwordHash, role });
  } catch (e) {
    if (e.code === 11000) throw new AppError(409, 'Email is already registered'); // race condition guard
    throw e;
  }
  return { user: toPublicUser(user), token: signToken(user) };
}

async function login(body) {
  const errors = validateLogin(body);
  if (errors.length) throw new AppError(400, 'Validation failed', errors);

  const user = await User.findOne({ email: body.email.trim().toLowerCase() }).select('+passwordHash');
  // Same message for unknown e-mail and wrong password => no account enumeration.
  const ok = user && (await bcrypt.compare(body.password, user.passwordHash));
  if (!ok) throw new AppError(401, 'Invalid email or password');
  return { user: toPublicUser(user), token: signToken(user) };
}

async function getProfile(userId) {
  const user = await User.findById(userId);
  if (!user) throw new AppError(404, 'User not found');
  return toPublicUser(user);
}

module.exports = { register, login, getProfile };
