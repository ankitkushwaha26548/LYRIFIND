/**
 * authenticate  - verifies "Authorization: Bearer <jwt>"
 * requireRole   - allows only the listed roles (e.g. 'admin')
 */
const jwt = require('jsonwebtoken');
const config = require('../config');
const AppError = require('../utils/AppError');

function authenticate(req, _res, next) {
  const [scheme, token] = (req.headers.authorization || '').split(' ');
  if (scheme !== 'Bearer' || !token) return next(new AppError(401, 'Authentication required'));
  try {
    const payload = jwt.verify(token, config.jwtSecret);
    req.user = { id: payload.sub, role: payload.role };
    return next();
  } catch (_e) {
    return next(new AppError(401, 'Invalid or expired token'));
  }
}

const requireRole = (...roles) => (req, _res, next) =>
  roles.includes(req.user && req.user.role) ? next() : next(new AppError(403, 'You do not have permission to do this'));

module.exports = { authenticate, requireRole };
