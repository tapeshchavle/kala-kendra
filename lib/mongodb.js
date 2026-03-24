import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const options = {
  // Increase timeout for Atlas SRV resolution
  serverSelectionTimeoutMS: 10000,
  connectTimeoutMS: 10000,
};

let client;
let clientPromise;

if (!uri) {
  throw new Error('Please add your Mongo URI to .env.local');
}

// Fix DNS to prefer IPv4 for Atlas SRV
try {
  const dns = require('dns');
  dns.setDefaultResultOrder('ipv4first');
} catch {}

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;
