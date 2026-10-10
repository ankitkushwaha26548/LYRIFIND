/** Entry point: build the store, build the app, start listening. */
const config = require('./config');
const { createStore } = require('./store');
const { createApp } = require('./app');
const { seedIfEmpty } = require('../scripts/seed');

(async () => {
  const store = await createStore();
  await seedIfEmpty(store); // first run: load the original sample songs
  createApp(store).listen(config.port, () =>
    console.log(`LyriFind running at http://localhost:${config.port}  (storage: ${config.storage})`)
  );
})().catch((err) => {
  console.error('Failed to start LyriFind:', err);
  process.exit(1);
});
