const mongoose = require('mongoose');

let connectionPromise = null;

async function connectToDatabase() {
  if (connectionPromise) return connectionPromise;

  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) {
    throw new Error('Missing MONGODB_URI (or MONGO_URI) in environment');
  }

  connectionPromise = mongoose.connect(uri, {
    autoIndex: true,
  });

  await connectionPromise;
  return mongoose.connection;
}

module.exports = { mongoose, connectToDatabase };