/** Entry point: connect to MongoDB, (optionally) seed, then listen. */
const config = require('./config');
const { connectDB } = require('./config/db');
const { createApp } = require('./app');
const { seedIfEmpty } = require('../scripts/seed');

(async () => {
  await connectDB(config.mongoUri);
  console.log('MongoDB connected');
  if (config.seedOnStart && (await seedIfEmpty())) console.log('Database was empty: sample songs + demo admin created');
  const server = createApp().listen(config.port, () => console.log(`LyriFind API running at http://localhost:${config.port}`));
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${config.port} is already in use. Stop the other process or set PORT to an available port.`);
    } else {
      console.error('Failed to start the API server:', err.message);
    }
    process.exit(1);
  });
})().catch((err) => {
  console.error('Failed to start LyriFind:', err.message);
  process.exit(1);
});
