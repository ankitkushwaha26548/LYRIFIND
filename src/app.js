/**
 * Express application factory. Taking the store as a parameter
 * (dependency injection) lets tests run the whole API against an
 * in-memory store without touching disk or a database.
 */
const path = require('path');
const express = require('express');
const cors = require('cors');
const { buildRoutes } = require('./routes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

function createApp(store) {
  const app = express();
  app.disable('x-powered-by');
  app.use(cors());
  app.use(express.json({ limit: '100kb' }));

  app.use('/api', buildRoutes(store));
  app.use('/api', notFound);                      // unknown API route => JSON 404
  app.use(express.static(path.join(__dirname, '..', 'public'))); // demo web UI
  app.use(errorHandler);
  return app;
}
module.exports = { createApp };
