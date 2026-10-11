/** MongoDB connection helper (Mongoose). */
const mongoose = require('mongoose');

async function connectDB(uri) {
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
  return mongoose.connection;
}
const disconnectDB = () => mongoose.disconnect();

module.exports = { connectDB, disconnectDB };
