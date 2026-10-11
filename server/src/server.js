/** Entry point: connect to MongoDB, (optionally) seed, then listen. */
const config = require('./config');
const { connectDB } = require('./config/db');
const { createApp } = require('./app');
const { seedIfEmpty } = require('../scripts/seed');

(async () => {
  await connectDB(config.mongoUri);
  console.log('MongoDB connected');
  if (config.seedOnStart && (await seedIfEmpty())) console.log('Database was empty: sample songs + demo admin created');
  createApp().listen(config.port, () => console.log(`LyriFind API running at http://localhost:${config.port}`));
})().catch((err) => {
  console.error('Failed to start LyriFind:', err.message);
  process.exit(1);
});
