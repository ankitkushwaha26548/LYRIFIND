/**
 * Express app factory (no listening / DB connection here, so tests can
 * import it directly). In production it also serves the built React app.
 */
const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const config = require('./config');
const routes = require('./routes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors({ origin: config.clientOrigin }));
  app.use(express.json({ limit: '100kb' }));

  app.use('/api', routes);
  app.use('/api', notFound);

  // Serve the production build of the React client (client/dist) if it exists.
  const dist = path.join(__dirname, '..', '..', 'client', 'dist');
  if (fs.existsSync(dist)) {
    app.use(express.static(dist));
    app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html'))); // SPA fallback
  }

  app.use(errorHandler);
  return app;
}
module.exports = { createApp };
