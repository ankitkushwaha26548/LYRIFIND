/** Central error handling: 404 for unknown routes + uniform JSON errors. */
const AppError = require('../utils/AppError');

const notFound = (req, _res, next) => next(new AppError(404, `Route not found: ${req.method} ${req.originalUrl}`));

// eslint-disable-next-line no-unused-vars
function errorHandler(err, _req, res, _next) {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Malformed JSON body' });
  if (err instanceof AppError) {
    return res.status(err.status).json({ error: err.message, ...(err.details ? { details: err.details } : {}) });
  }
  console.error(err); // unexpected error: log it, but don't leak internals
  return res.status(500).json({ error: 'Internal server error' });
}

module.exports = { notFound, errorHandler };
