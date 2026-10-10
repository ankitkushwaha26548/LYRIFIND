/** Chooses the data store from configuration. */
const path = require('path');
const config = require('../config');
const { createJsonStore } = require('./jsonStore');

async function createStore() {
  if (config.storage === 'mongo') {
    const { createMongoStore } = require('./mongoStore');
    return createMongoStore(config.mongoUri);
  }
  return createJsonStore(path.resolve(config.dataFile));
}
module.exports = { createStore, createJsonStore };
